"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Shield, Clock, Hash, Loader2, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useRealTimeData } from "@/hooks/useRealTimeData"

export function BlockchainTrust() {
  // 1. USE INSTANT STREAM HOOK
  const liveData = useRealTimeData();

  // 2. STATE: Manage dynamic blocks and pagination
  const [recentBlocks, setRecentBlocks] = useState<any[]>([])
  const [totalBlocks, setTotalBlocks] = useState(0)
  const [liveNodes, setLiveNodes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [limit] = useState(5)

  // 3. SYNC LOGIC: Push fresh data from SSE stream
  useEffect(() => {
    if (liveData) {
      // Update top-level metrics
      const verifiedCount = liveData.overview?.metrics?.find((m: any) => m.label === "Models Verified")?.value || 0;
      setTotalBlocks(Number(verifiedCount));
      setLiveNodes(liveData.workers?.length || 0);

      // Add the latest block to the feed if it's new
      if (liveData.blockchain?.latest_block) {
        const newBlock = {
            block: liveData.blockchain.latest_block.index,
            hash: `${liveData.blockchain.latest_block.model_hash.substring(0, 10)}...`,
            timestamp: new Date(liveData.blockchain.latest_block.timestamp * 1000).toLocaleTimeString(),
            verified: true
        };

        setRecentBlocks(prev => {
          // Prevent duplicates if SSE pushes the same block twice
          if (prev.find(b => b.block === newBlock.block)) return prev;
          return [newBlock, ...prev].slice(0, 20); // Keep last 20 in memory
        });
      }
      setLoading(false);
    }
  }, [liveData]);

  // 4. PAGINATION: Fetch older blocks manually when requested
  const fetchOlderBlocks = async () => {
    try {
      setLoadingMore(true);
      const offset = recentBlocks.length;
      const response = await fetch(`http://localhost:5000/api/blockchain?limit=${limit}&offset=${offset}`);
      
      if (response.ok) {
        const data = await response.json();
        setRecentBlocks(prev => [...prev, ...(data.blocks || [])]);
      }
    } catch (error) {
      console.error("❌ Failed to fetch older blocks:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- TOP METRICS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardDescription>Total Blocks</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold">{totalBlocks}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardDescription>Models Verified</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-500">{totalBlocks}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardDescription>Network Nodes</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold">{liveNodes}</div></CardContent>
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
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {recentBlocks.length === 0 && !loading ? (
                <div className="text-center p-4 text-muted-foreground">Waiting for training rounds...</div>
            ) : (
                <>
                {recentBlocks.map((block) => (
                <div key={`${block.block}-${block.hash}`} className="flex items-center justify-between p-4 border border-border rounded-lg animate-in fade-in slide-in-from-bottom-2">
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
                ))}
                
                {recentBlocks.length < totalBlocks && (
                  <Button 
                    variant="ghost" 
                    className="w-full mt-2 text-muted-foreground hover:text-primary"
                    onClick={fetchOlderBlocks}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    Load Older Blocks
                  </Button>
                )}
                </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}