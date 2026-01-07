"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Plus, Minus, X, CheckCircle2, Loader2 } from "lucide-react"
import { useState } from "react"

export function HomomorphicEncryption() {
  const [computing, setComputing] = useState(false)

  const performEncryptedComputation = () => {
    setComputing(true)
    setTimeout(() => setComputing(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Homomorphic Encryption (PHE)</CardTitle>
          <CardDescription>Compute on encrypted data without decryption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Encryption Scheme</span>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xl font-bold">Paillier</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Key Size</span>
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-xl font-bold">2048 bits</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Operations</span>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-xl font-bold">1,284</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PHE Demo - Encrypted Computation</CardTitle>
          <CardDescription>Perform mathematical operations on encrypted data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="p-6 border-2 border-dashed border-border rounded-lg bg-card">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Encrypted Value A:</span>
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">Enc(25)</code>
                </div>
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Encrypted Value B:</span>
                  <code className="text-sm font-mono bg-background px-2 py-1 rounded">Enc(17)</code>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={performEncryptedComputation}
                  disabled={computing}
                >
                  {computing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add Encrypted
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={performEncryptedComputation}
                  disabled={computing}
                >
                  {computing ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  Multiply Encrypted
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={performEncryptedComputation}
                  disabled={computing}
                >
                  {computing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Minus className="h-4 w-4" />}
                  Aggregate
                </Button>
              </div>

              {!computing && (
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="font-semibold">Result (still encrypted):</span>
                  </div>
                  <code className="text-sm font-mono text-foreground">Enc(42) = 0x7f3a9d2e...8b4c1f6a</code>
                  <p className="text-xs mt-2 text-slate-50 text-slate-50">
                    Computation performed without ever decrypting the data
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>PHE in Federated Learning</CardTitle>
          <CardDescription>How homomorphic encryption protects your system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Data Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Model updates are encrypted at the edge worker before transmission. The parameter server aggregates them
                without seeing the actual values.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Secure Aggregation</h3>
              <p className="text-sm text-muted-foreground">
                FedAvg algorithm operates on encrypted weights. Only the final global model is decrypted using the
                private key.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Zero Knowledge</h3>
              <p className="text-sm text-muted-foreground">
                The server learns nothing about individual worker data or local models, only the aggregated result.
              </p>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-semibold mb-2">Mathematical Guarantees</h3>
              <p className="text-sm text-muted-foreground">
                Paillier encryption provides provable security. It&apos;s computationally infeasible to decrypt without
                the private key.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
