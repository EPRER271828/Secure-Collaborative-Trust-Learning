import io
import torch
import hashlib

def get_weights_as_bytes(model):
    """Converts SimpleCNN state_dict to a binary blob."""
    buffer = io.BytesIO()
    # Serialize the dictionary of tensors
    torch.save(model.state_dict(), buffer)
    return buffer.getvalue()

def load_weights_from_bytes(model, weights_bytes):
    """Injects the binary blob back into a SimpleCNN instance."""
    buffer = io.BytesIO(weights_bytes)
    # weights_only=True is a security best practice
    weights = torch.load(buffer, weights_only=True)
    model.load_state_dict(weights)
    return model

def generate_model_hash(weights_blob):
    """Generates a SHA=256 hash of the model weights."""
    return hashlib.sha256(weights_blob).hexdigest()