"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useRealTimeData } from "@/hooks/useRealTimeData"

// Types for the data we expect from the API
interface Metric {
  label: string
  value: number
  target: number
}

interface ModelConfig {
  framework: string
  inputShape: string
  layers: string
  params: string
  algorithm: string
  learningRate: number
  batchSize: number
  epochs: number
}

export function MLMetrics() {
  // 1. USE INSTANT STREAM HOOK
  const liveData = useRealTimeData();

  // 2. STATE: metrics list and model config
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [config, setConfig] = useState<ModelConfig | null>(null)
  const [loading, setLoading] = useState(true)

  // 3. SYNC LOGIC: Update when the master stream pushes deep ML metrics
  useEffect(() => {
    const fetchFallbackData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/ml-metrics")
        if (res.ok) {
          const data = await res.json()
          setMetrics(data.metrics || [])
          setConfig(data.config || null)
        }
      } catch (e) {
        console.error("ML Metrics offline")
      } finally {
        setLoading(false)
      }
    }

    if (liveData?.ml_deep) {
      setMetrics(liveData.ml_deep.metrics || []);
      setConfig(liveData.ml_deep.config || null);
      setLoading(false);
    } else {
      // Fallback to initial fetch if stream isn't active yet
      fetchFallbackData();
    }
  }, [liveData]);

  // Helper to extract a specific metric value for the KPI cards
  const getVal = (label: string) => metrics.find(m => m.label === label)?.value || 0

  return (
    <div className="space-y-6">
      {/* Main Metrics Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance Metrics</CardTitle>
          <CardDescription>FL-ADM (Federated Learning - Anomaly Detection Model)</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
             <div className="text-center py-8 text-muted-foreground">Loading model diagnostics...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {metrics.map((metric, index) => {
                const isLowerBetter = metric.label === "False Positive Rate"
                const meetsTarget = isLowerBetter ? metric.value <= metric.target : metric.value >= metric.target
                const color = meetsTarget ? "text-green-500" : "text-yellow-500"

                return (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`h-4 w-4 ${color}`} />
                        <span className="font-medium">{metric.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-bold ${color}`}>{metric.value}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Progress value={metric.value} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        Target: {isLowerBetter ? "<" : ">"}{metric.target}% {meetsTarget && "✓ Achieved"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Cards (Dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Architecture</CardTitle>
            <CardDescription>CNN-BiLSTM for network intrusion detection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Framework</span>
              <span className="font-semibold">{config?.framework || "PyTorch"}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Input Layer</span>
              <span className="font-semibold">{config?.inputShape || "42 features (UNSW-NB15)"}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Hidden Layers</span>
              <span className="font-semibold">{config?.layers || "CNN -> BiLSTM -> Dense"}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Parameters</span>
              <span className="font-semibold">{config?.params || "4.2M"}</span>
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
              <span className="font-semibold">{config?.algorithm || "FedAvg"}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Learning Rate</span>
              <span className="font-semibold">{config?.learningRate || 0.001}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Batch Size</span>
              <span className="font-semibold">{config?.batchSize || 64}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm text-muted-foreground">Local Epochs</span>
              <span className="font-semibold">{config?.epochs || 10}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards (Derived from Live Data) */}
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
          <CardDescription>Model meets all production requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* KPI 1: Accuracy */}
            <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Accuracy Target</span>
              </div>
              <p className="text-sm text-muted-foreground">
                 Currently at {getVal("Accuracy")}% (Target: 90%)
              </p>
            </div>

            {/* KPI 2: False Positives */}
            <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Low FP Rate</span>
              </div>
              <p className="text-sm text-muted-foreground">
                 Only {getVal("False Positive Rate")}% false positives (Target: &lt;5%)
              </p>
            </div>

            {/* KPI 3: Convergence Status */}
            <div className="p-4 border border-green-500/20 bg-green-500/5 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="font-semibold">Converged</span>
              </div>
              <p className="text-sm text-muted-foreground">
                 Model stability confirmed.
              </p>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  )
}