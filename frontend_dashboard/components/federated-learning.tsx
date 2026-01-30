"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Pause, RotateCw, Play } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState, useEffect } from "react"
import { useRealTimeData } from "@/hooks/useRealTimeData"

// Define types for our data
interface TrainingPoint {
  round: number
  accuracy: number
  loss: number
}

interface GlobalStats {
  currentRound: number
  accuracy: number
  loss: number
  activeWorkers: number
  totalWorkers: number
  updateSize: string
  status: "training" | "paused" | "idle"
}

export function FederatedLearning() {
  // 1. USE INSTANT STREAM HOOK
  const liveData = useRealTimeData();

  // 2. STATE: Store history for the graph and current stats for the cards
  const [history, setHistory] = useState<TrainingPoint[]>([])
  const [stats, setStats] = useState<GlobalStats>({
    currentRound: 0,
    accuracy: 0,
    loss: 0,
    activeWorkers: 0,
    totalWorkers: 5,
    updateSize: "0 MB",
    status: "idle"
  })

  // 3. SYNC LOGIC: Update when the master stream pushes ML data
  useEffect(() => {
    if (liveData?.ml) {
      setHistory(liveData.ml.history || []);
      
      // Update stats based on unified stream data
      setStats(prev => ({
        ...prev,
        currentRound: liveData.ml.round || liveData.overview?.metrics?.find((m: any) => m.label === "FL Rounds Completed")?.value || 0,
        accuracy: liveData.ml.accuracy || 0,
        loss: liveData.ml.loss || 0,
        activeWorkers: liveData.workers?.length || 0,
        status: liveData.workers?.length > 0 ? "training" : "idle"
      }));
    }
  }, [liveData]);

  // 4. HANDLERS: Control logic
  const handleControl = async (action: "pause" | "start") => {
      try {
          await fetch(`http://localhost:5000/api/control/${action}`, { method: 'POST' })
      } catch (e) { console.error("Control failed") }
  }

  const aggregationProgress = (stats.activeWorkers / stats.totalWorkers) * 100

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Current Round</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.currentRound}</div>
            <p className="text-xs text-muted-foreground mt-1">FedAvg Algorithm</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Global Model Accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.accuracy.toFixed(1)}%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">Live updates</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Training Loss</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">{stats.loss.toFixed(3)}</div>
            <p className="text-xs text-muted-foreground mt-1">
                {stats.loss < 0.3 && stats.loss > 0 ? "Converging steadily" : "Optimizing..."}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Federated Learning Progress</CardTitle>
              <CardDescription>Model accuracy and loss over training rounds</CardDescription>
            </div>
            <div className="flex gap-2 bg-card text-foreground">
              {stats.status === "training" ? (
                  <Button size="sm" variant="outline" onClick={() => handleControl("pause")}>
                    <Pause className="h-4 w-4 mr-2" /> Pause
                  </Button>
              ) : (
                  <Button size="sm" variant="outline" onClick={() => handleControl("start")}>
                    <Play className="h-4 w-4 mr-2" /> Resume
                  </Button>
              )}
              
              <Button className="text-popover-foreground" size="sm">
                <RotateCw className="h-4 w-4 mr-2" />
                New Round
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              accuracy: { label: "Accuracy", color: "hsl(var(--chart-1))" },
              loss: { label: "Loss", color: "hsl(var(--chart-2))" },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="round" label={{ value: "Training Round", position: "insideBottom", offset: -5 }} />
                <YAxis yAxisId="left" domain={[0, 100]} label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 1]} label={{ value: "Loss", angle: 90, position: "insideRight" }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--color-accuracy)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  isAnimationActive={true}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="loss"
                  stroke="var(--color-loss)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  isAnimationActive={true}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Aggregation Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Training Round</CardTitle>
          <CardDescription>Round {stats.currentRound} • {stats.totalWorkers} workers participating</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Aggregation Progress</span>
              <span className="font-medium">{stats.activeWorkers}/{stats.totalWorkers} workers submitted</span>
            </div>
            <Progress value={aggregationProgress} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Updates Received</p>
              <p className="text-2xl font-bold">{stats.activeWorkers}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg. Update Size</p>
              <p className="text-2xl font-bold">4.2 MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}