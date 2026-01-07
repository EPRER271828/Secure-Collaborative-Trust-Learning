"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Shield, Clock, Hash, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

export function BlockchainTrust() {
  // 1. State to hold the Real Data
  const [recentBlocks, setRecentBlocks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 2. The Fetch Function (Polls every 3 seconds)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // In Development (Localhost): Points to Flask directly
        // In Docker (Production): Points to Nginx (https://sctl.gateway/api/blockchain)
        const response = await fetch("http://localhost:5000/api/blockchain")
        
        if (response.ok) {
          const data = await response.json()
          setRecentBlocks(data)
        }
      } catch (error) {
        console.error("❌ Failed to fetch blockchain data:", error)
      } finally {
        setLoading(false)
      }
    }

    // Fetch immediately, then every 3 seconds
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-6">
      {/* --- TOP METRICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardDescription>Total Blocks</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold">{recentBlocks.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardDescription>Models Verified</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-500">{recentBlocks.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardDescription>Network Nodes</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold">5</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardDescription>Consensus</CardDescription></CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Raft</div>
            <p className="text-xs text-muted-foreground">Hyperledger Fabric</p>
          </CardContent>
        </Card>
      </div>

      {/* --- LIVE LEDGER FEED --- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             Blockchain Ledger
             {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>}
          </CardTitle>
          <CardDescription>Immutable audit trail of model updates (Live from DLT)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentBlocks.length === 0 ? (
                <div className="text-center p-4 text-muted-foreground">Waiting for training rounds...</div>
            ) : (
                recentBlocks.map((block) => (
                <div key={block.block} className="flex items-center justify-between p-4 border border-border rounded-lg animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                        <p className="font-semibold">Block #{block.block}</p>
                        {block.verified && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {block.hash}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {block.timestamp}
                        </span>
                        </div>
                    </div>
                    </div>
                    <Badge variant="outline" className="text-green-500 border-green-500">
                    Verified
                    </Badge>
                </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}