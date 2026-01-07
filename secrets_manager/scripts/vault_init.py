import hvac
import os

# Professional Practice: Use environment variables for sensitive tokens
VAULT_ADDR = "http://127.0.0.1:8200"
VAULT_TOKEN = "sctl-root-token" 

client = hvac.Client(url=VAULT_ADDR, token=VAULT_TOKEN)

def initialize_sctl_security():
    print("🔐 Starting Zero-Trust Identity Bootstrap...")

    # 1. Enable PKI Engine
    client.sys.enable_auth_method(method_type='pki', path='pki')
    client.sys.tune_mount_configuration(path='pki', max_lease_ttl='87600h')

    # 2. Generate Root CA
    root_ca_res = client.secrets.pki.generate_root(
        type='internal',
        common_name='sctl.gateway',
        extra_params={'ttl': '87600h'}
    )
    
    # Save Root CA to your certs folder so Nginx can trust it
    with open("../../certs/ca-cert.pem", "w") as f:
        f.write(root_ca_res.data['certificate'])

    # 3. Configure URLs for the Trust Chain
    client.secrets.pki.set_config_urls({
        'issuing_certificates': f"{VAULT_ADDR}/v1/pki/ca",
        'crl_distribution_points': f"{VAULT_ADDR}/v1/pki/crl"
    })

    # 4. Create the Worker Role (Strict Policies)
    client.secrets.pki.create_or_update_role(
        name='edge-worker',
        definition={
            'allowed_domains': 'sctl.gateway',
            'allow_subdomains': True,
            'max_ttl': '72h', # Short-lived for Zero Trust
        }
    )

    print("✅ Infrastructure Ready. Root CA exported to /certs.")

if __name__ == "__main__":
    initialize_sctl_security()