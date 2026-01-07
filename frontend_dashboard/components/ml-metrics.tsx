"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"

export function MLMetrics() {
  const metrics = [
    { label: "Accuracy", value: 93.3, target: 90, icon: CheckCircle2, color: "text-green-500" },
    { label: "Precision", value: 91.8, target: 88, icon: CheckCircle2, color: "text-green-500" },
    { label: "Recall", value: 92.4, target: 89, icon: CheckCircle2, color: "text-green-500" },
    { label: "F1 Score", value: 92.1, target: 89, icon: CheckCircle2, color: "text-green-500" },
    { label: "False Positive Rate", value: 3.2, target: 5, icon: CheckCircle2, color: "text-green-500" },
    { label: "AUC-ROC", value: 96.7, target: 95, icon: CheckCircle2, color: "text-green-500" },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Metrics</CardTitle>
          <CardDescription>FL-ADM (Federated Learning - Anomaly Detection Model)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon
              const isLowerBetter = metric.label === "False Positive Rate"
              const meetsTarget = isLowerBetter ? metric.value <= metric.target : metric.value >= metric.target

              return (
                <div key={index} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${metric.color}`} />
                      <span className="font-medium">{metric.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${metric.color}`}>{metric.value}%</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={metric.value} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Target: {metric.target}% {meetsTarget && "✓ Achieved"}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Architecture</CardTitle>
            <CardDescription>Autoencoder for anomaly detection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Framework</span>
              <span className="font-semibold">PyTorch</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Input Layer</span>
              <span className="font-semibold">256 features</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Hidden Layers</span>
              <span className="font-semibold">128 → 64 → 32</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Parameters</span>
              <span className="font-semibold">1.2M</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Configuration</CardTitle>
            <CardDescription>Federated averaging parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Algorithm</span>
              <span className="font-semibold">FedAvg</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Learning Rate</span>
              <span className="font-semibold">0.001</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Batch Size</span>
              <span className="font-semibold">32</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Local Epochs</span>
              <span className="font-semibold">5</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
          <CardDescription>Model meets all production requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Accuracy Target</span>
              </div>
              <p className="text-sm text-muted-foreground">Exceeds 90% threshold at 93.3%</p>
            </div>
            <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Low FP Rate</span>
              </div>
              <p className="text-sm text-muted-foreground">Only 3.2% false positives (target: {`<`}5%)</p>
            </div>
            <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Converged</span>
              </div>
              <p className="text-sm text-muted-foreground">Loss stabilized after round 100</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
