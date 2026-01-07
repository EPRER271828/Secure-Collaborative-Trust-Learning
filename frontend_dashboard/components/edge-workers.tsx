"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Cpu, HardDrive, Activity, CheckCircle2, Clock } from "lucide-react"

export function EdgeWorkers() {
  const workers = [
    { id: "worker-01", status: "training", dataset: "Medical-A", samples: 2500, progress: 73, lastUpdate: "2s ago" },
    { id: "worker-02", status: "training", dataset: "Medical-B", samples: 3200, progress: 68, lastUpdate: "1s ago" },
    { id: "worker-03", status: "idle", dataset: "Medical-C", samples: 2800, progress: 100, lastUpdate: "12s ago" },
    { id: "worker-04", status: "training", dataset: "Medical-D", samples: 3500, progress: 45, lastUpdate: "3s ago" },
    { id: "worker-05", status: "training", dataset: "Medical-E", samples: 2900, progress: 82, lastUpdate: "1s ago" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edge Workers Overview</CardTitle>
          <CardDescription>Local training nodes - Data never leaves the edge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Workers</span>
                <Cpu className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-2">5</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active Training</span>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-2">4</div>
            </div>
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Samples</span>
                <HardDrive className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold mt-2">14,900</div>
            </div>
          </div>

          <div className="space-y-4">
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
                          {worker.dataset} • {worker.samples.toLocaleString()} samples
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-secondary-foreground text-primary" variant={worker.status === "training" ? "default" : "secondary"}>
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
                        {worker.lastUpdate}
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
