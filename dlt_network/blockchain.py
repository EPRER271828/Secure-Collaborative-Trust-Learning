import hashlib
import json
from time import time

class ModelLedger:
    def __init__(self, filename="sctl_ledger.json"):
        self.filename = filename
        self.chain = []
        
        # Load existing chain from disk if it exists, otherwise create Genesis
        if not self.load_from_disk():
            # Create Genesis Block (The first link in the Zero-Trust chain)
            self.create_block(model_hash='GENESIS', round_num=0, previous_hash='1')
            print("🌱 Genesis Block created.")

    def create_block(self, model_hash, round_num, previous_hash):
        block = {
            'index': len(self.chain) + 1,
            'timestamp': time(),
            'round_num': round_num,
            'model_hash': model_hash,
            'previous_hash': previous_hash,
        }
        self.chain.append(block)
        self.save_to_disk() # Ensure every new block is written to the file
        return block
    
    def get_last_block(self):
        return self.chain[-1]

    def hash_block(self, block):
        # Encodes a block into a SHA-256 string for the next link
        # sort_keys=True is vital to ensure the hash is always the same
        encoded_block = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(encoded_block).hexdigest()

    def add_model_update(self, round_num, model_hash):
        """Adds a new model update to the chain by linking it to the previous block's hash."""
        last_block = self.get_last_block()
        last_hash = self.hash_block(last_block)
        
        new_block = self.create_block(model_hash, round_num, last_hash)
        print(f"📦 Block #{new_block['index']} anchored to DLT for Round {round_num}")
        return new_block

    def save_to_disk(self):
        """Saves the ledger to a JSON file so the Dashboard team can read it."""
        try:
            with open(self.filename, 'w') as f:
                json.dump(self.chain, f, indent=4)
        except Exception as e:
            print(f"❌ Error saving ledger: {e}")

    def load_from_disk(self):
        """Loads the ledger from disk to resume training after a restart."""
        try:
            with (open(self.filename, 'r')) as f:
                self.chain = json.load(f)
                return True
        except (FileNotFoundError, json.JSONDecodeError):
            return False

    def is_chain_valid(self):
        """
        ZTNA Audit: Verifies the integrity of the entire blockchain.
        Checks if every block's 'previous_hash' matches the actual hash of the block before it.
        """
        for i in range(1, len(self.chain)):
            current = self.chain[i]
            previous = self.chain[i-1]
            
            # 1. Verify the link
            if current['previous_hash'] != self.hash_block(previous):
                print(f"🚨 INTEGRITY BREACH: Block {i} link is broken!")
                return False
        return True