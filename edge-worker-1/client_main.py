import grpc
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from cnn_model import SimpleCNN 
import numpy as np
import time
import sys
import io
import os
from google.protobuf import empty_pb2

current_dir = os.path.dirname(os.path.abspath(__file__))
shared_dir = os.path.join(current_dir, '..', 'shared')
sys.path.append(os.path.abspath(shared_dir))

import federated_service_pb2 as pb2
import federated_service_pb2_grpc as pb2_grpc

# --- CONFIGURATION ---
#NGINX_ADDRESS = 'localhost:443' 
NGINX_ADDRESS = 'localhost:50051'
SERVER_HOST_NAME = 'localhost' # Must match the Cert CN from Vault

def load_local_data(worker_id):
    """Generates synthetic training data for the demo"""
    print(f"📊 [Worker-{worker_id}] Generating synthetic data...")
    # Random images: 100 samples, 3 channels, 32x32 pixels
    X_train = torch.randn(100, 3, 32, 32)
    y_train = torch.randint(0, 10, (100,))
    
    dataset = TensorDataset(X_train, y_train)
    return DataLoader(dataset, batch_size=10, shuffle=True), len(dataset)

def run_worker(worker_id):
    print(f"🚀 Launching Edge Worker: {worker_id}")
    
    # 1. LOAD ZTNA CREDENTIALS (ISSUED BY VAULT)
    try:
        with open('../certs/ca-cert.pem', 'rb') as f: root_ca = f.read()
        with open('../certs/worker-key.pem', 'rb') as f: private_key = f.read()
        with open('../certs/worker-cert.pem', 'rb') as f: cert_chain = f.read()
    except FileNotFoundError:
        print("❌ Error: Certificates missing! Run 'issue_certs.py' first.")
        return

    # 2. CONFIGURE SECURE CHANNEL (mTLS)
    creds = grpc.ssl_channel_credentials(
        root_certificates=root_ca,
        private_key=private_key,
        certificate_chain=cert_chain
    )

    # options to fix "localhost" name mismatch and increase size limits
    options = [
        ('grpc.ssl_target_name_override', SERVER_HOST_NAME), 
        ('grpc.max_send_message_length', 50 * 1024 * 1024),
        ('grpc.max_receive_message_length', 50 * 1024 * 1024)
    ]

    # Connect to NGINX (Port 443), not the Server directly!
    with grpc.secure_channel(NGINX_ADDRESS, creds, options=options) as channel:
        stub = pb2_grpc.FederatedLearningStub(channel)
        
        # Local Model Instance
        model = SimpleCNN()

        # 3. CONTINUOUS LEARNING LOOP
        while True:
            try:
                # A. SYNC: Download Global Model
                print(f"\n⬇️  [Worker-{worker_id}] Requesting Global Model...")
                
                # FIX 1: Send the correct Request object defined in your .proto
                # (The .proto says GetGlobalModel takes 'ModelRequest', not 'Empty')
                req = pb2.ModelRequest(worker_id=str(worker_id))
                global_response = stub.GetGlobalModel(req)    
                
                # FIX 2: Use 'weights_data' (as defined in your .proto), NOT 'model_data'
                buffer = io.BytesIO(global_response.weights_data)
                
                state_dict = torch.load(buffer)
                model.load_state_dict(state_dict)
                
                current_round = getattr(global_response, 'round_number', 0)
                print(f"✅ Synced. Starting Round {current_round}")

                # B. TRAIN: Local SGD
                trainloader, num_samples = load_local_data(worker_id)
                optimizer = optim.SGD(model.parameters(), lr=0.01)
                criterion = nn.CrossEntropyLoss()
                
                model.train()
                for epoch in range(1): # Fast epoch for demo
                    for data, target in trainloader:
                        optimizer.zero_grad()
                        output = model(data)
                        loss = criterion(output, target)
                        loss.backward()
                        optimizer.step()
                
                print(f"🧠 Training Complete. Loss: {loss.item():.4f}")

                # C. UPLOAD: Serialize and Send
                save_buffer = io.BytesIO()
                torch.save(model.state_dict(), save_buffer)
                weights_bytes = save_buffer.getvalue()

                print("⬆️  Uploading Gradients to Server...")
                
                # FIX: Names must match your .proto definition EXACTLY
                update_msg = pb2.ModelUpdate(
                    worker_id=str(worker_id),    # Changed from client_id
                    round_number=current_round,
                    weights_data=weights_bytes,     # Changed from model_data
                    num_samples=num_samples,        # Changed from data_samples
                    anomaly_score=0.0               # Added because it exists in your proto
                )
                
                resp = stub.SendModelUpdate(update_msg)
                print(f"🎉 Success: {resp.message}")  # Changed .status to .message (usually clearer)
                
                # Wait for others before next round
                print("⏳ Waiting 10s for aggregation...")
                time.sleep(10)

            except grpc.RpcError as e:
                print(f"⚠️  RPC Error: {e.details()}")
                time.sleep(5)
            except Exception as e:
                print(f"❌ Error: {e}")
                time.sleep(5)

if __name__ == "__main__":
    # Allow running "python client_main.py 2" to simulate worker 2
    w_id = sys.argv[1] if len(sys.argv) > 1 else "1"
    run_worker(w_id)