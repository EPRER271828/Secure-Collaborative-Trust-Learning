"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Server, Database, Lock, Activity, Network } from "lucide-react"
import { useState, useEffect } from "react"
import { useRealTimeData } from "@/hooks/useRealTimeData"

// Types for our dynamic data
interface Metric {
  label: string
  value: string
  color: string
}

interface ServiceStatus {
  name: string
  status: string
  uptime: number
}

const ICON_MAP: Record<string, any> = {
  "API Gateway": Network,
  "Parameter Server": Server,
  "HashiCorp Vault": Lock,
  "Model Ledger": Shield,
};

export function SystemOverview() {
  // Use the new hook to get the master data stream
  const liveData = useRealTimeData();

  // Initial placeholder states
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Active Edge Workers", value: "0/5", color: "text-green-500" },
    { label: "FL Rounds Completed", value: "...", color: "text-blue-500" },
    { label: "Models Verified", value: "...", color: "text-purple-500" },
    { label: "Trust Score", value: "100%", color: "text-emerald-500" },
  ])

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "API Gateway", status: "initializing", uptime: 0 },
    { name: "Parameter Server", status: "initializing", uptime: 0 },
    { name: "HashiCorp Vault", status: "initializing", uptime: 0 },
    { name: "Model Ledger", status: "initializing", uptime: 0 },
  ])

  // Update local state whenever the live stream pushes new data
  useEffect(() => {
    if (liveData?.overview) {
      if (liveData.overview.metrics) {
        setMetrics(liveData.overview.metrics);
      }
      if (liveData.overview.services) {
        setServices(liveData.overview.services);
      }
    }
  }, [liveData]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardDescription className="text-card-foreground">{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metric.color}`}>{metric.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Microservices Status</CardTitle>
          <CardDescription>Zero-Trust Components (mTLS Verified)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service, index) => {
              const Icon = ICON_MAP[service.name] || Activity
              return (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">Uptime: {service.uptime}%</p>
                    </div>
                  </div>
                  <Badge 
                    variant="default" 
                    className={`bg-card text-primary-foreground ${
                      service.status === 'running' ? 'border-green-500' : 'border-yellow-500'
                    }`}
                  >
                    <Activity className="h-3 w-3 mr-1" />
                    {service.status.toUpperCase()}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}