"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Pause, RotateCw } from "lucide-react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export function FederatedLearning() {
  const trainingData = [
    { round: 1, accuracy: 65.2, loss: 0.89 },
    { round: 10, accuracy: 72.4, loss: 0.71 },
    { round: 20, accuracy: 78.9, loss: 0.58 },
    { round: 30, accuracy: 83.2, loss: 0.47 },
    { round: 40, accuracy: 86.1, loss: 0.39 },
    { round: 50, accuracy: 88.3, loss: 0.34 },
    { round: 60, accuracy: 89.7, loss: 0.31 },
    { round: 70, accuracy: 90.8, loss: 0.28 },
    { round: 80, accuracy: 91.6, loss: 0.26 },
    { round: 90, accuracy: 92.1, loss: 0.24 },
    { round: 100, accuracy: 92.5, loss: 0.23 },
    { round: 110, accuracy: 92.8, loss: 0.22 },
    { round: 120, accuracy: 93.1, loss: 0.21 },
    { round: 127, accuracy: 93.3, loss: 0.2 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Current Round</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">127</div>
            <p className="text-xs text-muted-foreground mt-1">FedAvg Algorithm</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Global Model Accuracy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">93.3%</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-xs text-green-500">+0.2% from last round</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Training Loss</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">0.20</div>
            <p className="text-xs text-muted-foreground mt-1">Converging steadily</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Federated Learning Progress</CardTitle>
              <CardDescription>Model accuracy and loss over training rounds</CardDescription>
            </div>
            <div className="flex gap-2 bg-card text-foreground">
              <Button size="sm" variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
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
              accuracy: {
                label: "Accuracy",
                color: "hsl(var(--chart-1))",
              },
              loss: {
                label: "Loss",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trainingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="round" label={{ value: "Training Round", position: "insideBottom", offset: -5 }} />
                <YAxis yAxisId="left" label={{ value: "Accuracy (%)", angle: -90, position: "insideLeft" }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{ value: "Loss", angle: 90, position: "insideRight" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="accuracy"
                  stroke="var(--color-accuracy)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="loss"
                  stroke="var(--color-loss)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Training Round</CardTitle>
          <CardDescription>Round 127 • 5 workers participating</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Aggregation Progress</span>
              <span className="font-medium">5/5 workers submitted</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Updates Received</p>
              <p className="text-2xl font-bold">5</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg. Update Size</p>
              <p className="text-2xl font-bold">2.3 MB</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
