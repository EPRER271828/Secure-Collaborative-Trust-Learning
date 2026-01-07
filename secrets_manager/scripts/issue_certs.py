import hvac
import os

VAULT_ADDR = "http://127.0.0.1:8200"
VAULT_TOKEN = "sctl-root-token" 

client = hvac.Client(url=VAULT_ADDR, token=VAULT_TOKEN)

def issue_identity(common_name, filename_prefix):
    print(f"🛰️ Requesting new identity for: {common_name}")

    # Generate a dynamic certificate from the 'edge-worker' role
    result = client.secrets.pki.generate_certificate(
        name='edge-worker',
        common_name=common_name
    )

    # Overwrite the manual files in your /certs folder
    cert_path = f"../../certs/{filename_prefix}-cert.pem"
    key_path = f"../../certs/{filename_prefix}-key.pem"

    with open(cert_path, "w") as f:
        f.write(result.data['certificate'])
    with open(key_path, "w") as f:
        f.write(result.data['private_key'])

    print(f"✨ Identity material saved to {cert_path}")

if __name__ == "__main__":
    # Issue identity for your Edge Worker
    issue_identity("worker-1.sctl.gateway", "worker")
    
    # Optional: Issue identity for your Gateway/Server
    issue_identity("server.sctl.gateway", "server")