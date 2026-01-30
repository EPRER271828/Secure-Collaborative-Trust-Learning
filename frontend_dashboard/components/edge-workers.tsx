"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Cpu, HardDrive, Activity, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { useRealTimeData } from "@/hooks/useRealTimeData"

// Define the shape of our worker data for TypeScript safety
interface Worker {
  id: string
  status: "training" | "idle" | "offline"
  dataset: string
  samples: number
  progress: number
  lastUpdate: string
}

export function EdgeWorkers() {
  // 1. USE INSTANT STREAM HOOK
  const liveData = useRealTimeData();
  
  // 2. STATE: Hold the dynamic list of workers
  const [workers, setWorkers] = useState<Worker[]>([])
  const [loading, setLoading] = useState(true)

  // 3. SYNC LOGIC: Update local state when the master stream pushes data
  useEffect(() => {
    if (liveData?.workers) {
      setWorkers(liveData.workers);
      setLoading(false);
    }
  }, [liveData]);

  // 4. DYNAMIC METRICS: Calculate these on the fly based on the live stream
  const totalWorkers = workers.length
  const activeWorkers = workers.filter(w => w.status === "training").length
  const totalSamples = workers.reduce((acc, curr) => acc + (curr.samples || 0), 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edge Workers Overview</CardTitle>
          <CardDescription>Local training nodes - Data never leaves the edge</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Workers</span>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-2">{loading ? "-" : totalWorkers}</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Training</span>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-2">{loading ? "-" : activeWorkers}</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Samples</span>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-2">{loading ? "-" : totalSamples.toLocaleString()}</div>
            </div>
          </div>

          {/* Worker List */}
          <div className="space-y-4">
            {workers.length === 0 && !loading && (
                <div className="text-center p-6 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    No active workers connected
                </div>
            )}
            
            {workers.map((worker) => (
              <Card key={worker.id} className="bg-transparent">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-secondary-foreground">
                        <Cpu className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{worker.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {worker.dataset} • {worker.samples?.toLocaleString() || 0} samples
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge 
                        className="bg-secondary-foreground text-primary" 
                        variant={worker.status === "training" ? "default" : "secondary"}
                      >
                        {worker.status === "training" ? (
                          <>
                            <Activity className="h-3 w-3 mr-1 animate-pulse" />
                            Training
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Idle
                          </>
                        )}
                      </Badge>
                      <span className="text-xs flex items-center gap-1 text-card-foreground">
                        <Clock className="h-3 w-3" />
                        {worker.lastUpdate || "Active Now"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Training Progress</span>
                      <span className="font-medium">{worker.progress}%</span>
                    </div>
                    <Progress value={worker.progress} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}