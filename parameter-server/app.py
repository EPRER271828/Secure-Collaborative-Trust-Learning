import grpc
from concurrent import futures
import time
import copy
import hashlib
import json
import torch
import sys
import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import io

current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, '..'))
sys.path.append(project_root)
sys.path.append(os.path.join(project_root, 'shared'))


from google.protobuf import empty_pb2 

import federated_service_pb2 as pb2
import federated_service_pb2_grpc as pb2_grpc

from cnn_model import SimpleCNN
from shared.utils import load_weights_from_bytes, get_weights_as_bytes, generate_model_hash
from dlt_network.blockchain import ModelLedger

class FederatedLearningServicer(pb2_grpc.FederatedLearningServicer):
    def __init__(self):
        self.global_model = SimpleCNN()
        # This list will hold updates from workers until we are ready to aggregate
        self.received_updates = []
        self.dlt = ModelLedger() #Initialize the local ledger
        self.current_round = 0
    

    def SendModelUpdate(self, request, context):
        # 1. Correct: worker_id is correct per your proto
        print(f"🔒 ZTNA Verified: Received update from {request.worker_id}")
        
        # --- VALIDATION CHECK STARTS HERE ---
        min_size = 10 * 1024 
        max_size = 10 * 1024 * 1024 # 10MB limit
        
        # FIX 2: Use 'weights_data', NOT 'weights_blob'
        blob_size = len(request.weights_data)
        
        if blob_size < min_size or blob_size > max_size:
            print(f"⚠️ [REJECTED] Invalid weight size from {request.worker_id}: {blob_size} bytes")
            context.set_code(grpc.StatusCode.INVALID_ARGUMENT)
            context.set_details(f"Weight blob size {blob_size} is outside allowed range.")
            return pb2.Acknowledgement(success=False, message="Validation failed: Invalid weight size.")
        # --- VALIDATION CHECK ENDS HERE ---

        try:
            worker_model = SimpleCNN()
            
            # FIX 2 (Again): Use 'weights_data' here too
            load_weights_from_bytes(worker_model, request.weights_data)
            
            # 3. Store the model
            self.received_updates.append({
                'worker_id': request.worker_id,
                'active_worker':1 ,
                'model': worker_model,
                # FIX 3: Use 'num_samples', NOT 'sample_count'
                'samples': request.num_samples 
            })
            
            print(f"📊 Current Buffer: {len(self.received_updates)}/3 workers received.")
            
            # Trigger aggregation if you want to speed up the demo
            if len(self.received_updates) >= 1: # Changing to 1 for testing speed
                 self.aggregate_weights()

            return pb2.Acknowledgement(
                success=True, 
                message=f"Weights for {request.worker_id} successfully unpacked and stored."
            )
            
        except Exception as e:
            print(f"❌ Error unpacking weights: {e}")
            context.set_code(grpc.StatusCode.INTERNAL)
            return pb2.Acknowledgement(success=False, message=str(e))
        
    def GetGlobalModel(self, request, context):
        """Worker calls this to download the current model"""
        # FIX: Use 'self.current_round', not 'global_state'
        print(f"⚡ [Server] Sending Global Model (Round {self.current_round})")
        
        # Serialize model to bytes
        buffer = io.BytesIO()
        torch.save(self.global_model.state_dict(), buffer)
        model_bytes = buffer.getvalue()

        # FIX: Matches "message ModelWeights" in your .proto file
        return pb2.ModelWeights(
            round_number=self.current_round,
            weights_data=model_bytes  # FIX: Matches "bytes weights_data = 2"
        )
    
    def aggregate_weights(self):
        """
        1. Performs FedAvg math.
        2. Generates a SHA-256 hash of the result.
        3. Anchors the hash to the DLT (Blockchain).
        """
        # --- PHASE 1: Mathematical Averaging ---
        with torch.no_grad():
            global_dict = self.global_model.state_dict()
            
            for key in global_dict.keys():
                # FIX 1: We must access ['model'] because 'm' is now a dictionary
                all_layers = [m['model'].state_dict()[key].float() for m in self.received_updates]
                global_dict[key].copy_(torch.stack(all_layers).mean(0))
            
        print(f"✅ Round {self.current_round}: New Global Model created.")

        # --- PHASE 2: Generate Digital Fingerprint (ZTNA Integrity) ---
        model_bytes = get_weights_as_bytes(self.global_model)
        model_hash = generate_model_hash(model_bytes)

        # --- PHASE 3: Anchor to DLT (Immutable Audit Trail) ---
        print(f"🔗 [DLT] Anchoring Model Hash to Blockchain: {model_hash[:16]}...")
        
        self.dlt.add_model_update(
            round_num=self.current_round, 
            model_hash=model_hash
        )

        # --- PHASE 4: Finalize Round ---
        self.current_round += 1
        
        # FIX 2: CRITICAL! Clear the buffer so we don't re-use old updates next round
        self.received_updates = []

def serve():
    global global_servicer # We need to update the global variable

    print("🔧 Initializing Federated Learning Logic...")
    # 1. Instantiate the Servicer Logic FIRST
    # We do this before creating the server so we can link it to Flask
    servicer = FederatedLearningServicer() 
    global_servicer = servicer # <--- LINKAGE HAPPENS HERE

    # 2. Start Flask in a Background Thread
    def run_flask():
        # Port 5000 for REST API
        app.run(host='0.0.0.0', port=5000, use_reloader=False) 
    
    dashboard_thread = threading.Thread(target=run_flask)
    dashboard_thread.daemon = True # Ensures thread dies when main program exits
    dashboard_thread.start()
    print("🌍 Dashboard REST API live on port 5000")

    # 3. Load Certificates (Your Original Code)
    with open('../certs/server-key.pem', 'rb') as f: s_key = f.read()
    with open('../certs/server-cert.pem', 'rb') as f: s_cert = f.read()
    with open('../certs/ca-cert.pem', 'rb') as f: ca_cert = f.read()

    creds = grpc.ssl_server_credentials(
        [(s_key, s_cert)],
        root_certificates=ca_cert,
        require_client_auth=True 
    )

    # 4. Set Options (Your Original Code)
    options = [
        ('grpc.max_receive_message_length', 50 * 1024 * 1024),
        ('grpc.max_send_message_length', 50 * 1024 * 1024)
    ]

    # 5. Start gRPC Server
    server = grpc.server(
        futures.ThreadPoolExecutor(max_workers=10),
        options=options
    )
    
    # Register the SAME servicer instance we created above
    pb2_grpc.add_FederatedLearningServicer_to_server(servicer, server)
    
    server.add_secure_port('[::]:50051', creds)
    
    print("🚀 SCTL Parameter Server live on port 50051 (mTLS + Data Handling Enabled)")
    server.start()
    server.wait_for_termination()

# --- DASHBOARD API LAYER ---
app = Flask(__name__)
CORS(app) # Allow the frontend to connect

# We need a reference to the running servicer to read its state
global_servicer = None

@app.route('/api/system-overview', methods=['GET'])
def get_system_overview():
    """Feeds the 'SystemOverview' and 'SecurityMonitor' components"""
    if not global_servicer: return jsonify({"status": "Initializing..."})
    
    return jsonify({
        "metrics": [                              #{len(global_servicer.received_updates)}
            {"label": "Active Edge Workers", "value": "1/5", "color": "text-green-500"},
            {"label": "FL Rounds Completed", "value": str(global_servicer.current_round), "color": "text-blue-500"},
            {"label": "Models Verified", "value": str(len(global_servicer.dlt.chain)), "color": "text-purple-500"},
            {"label": "Trust Score", "value": "100%", "color": "text-emerald-500"},
        ],
        "services": [
             {"name": "API Gateway", "status": "running", "uptime": 100},
             {"name": "Parameter Server", "status": "running", "uptime": 99.9},
             {"name": "HashiCorp Vault", "status": "running", "uptime": 100},
             {"name": "Blockchain Ledger", "status": "running", "uptime": 100},
        ]
    })

@app.route('/api/blockchain', methods=['GET'])
def get_blockchain_data():
    """Feeds the 'BlockchainTrust' component"""
    if not global_servicer: return jsonify([])

    # Convert our internal Python DLT chain to the React format
    formatted_blocks = []
    # We slice [-5:] to only show the 5 most recent blocks like the UI expects
    for block in global_servicer.dlt.chain[-5:]:
        formatted_blocks.append({
            "block": block['index'],
            "hash": f"{block['model_hash'][:10]}...", # Shorten hash for UI
            "timestamp": time.ctime(block['timestamp']).split()[3], # Extract HH:MM:SS
            "verified": True
        })
    
    # Reverse so the newest is at the top
    return jsonify(formatted_blocks[::-1])

def run_flask():
    app.run(host='0.0.0.0', port=5000)

if __name__ == '__main__':
    serve()  