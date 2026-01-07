# Permission for Workers to request their own mTLS IDs
path "pki/issue/edge-worker" {
  capabilities = ["update"]
}

# Permission to read the CA chain for verification
path "pki/cert/ca" {
  capabilities = ["read"]
}