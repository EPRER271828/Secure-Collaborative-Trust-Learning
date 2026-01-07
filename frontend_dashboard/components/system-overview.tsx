"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Server, Database, Lock, Activity, CheckCircle2, Cpu, Network } from "lucide-react"
import { useState, useEffect } from "react"

export function SystemOverview() {
  const [metrics, setMetrics] = useState([
    { label: "Active Edge Workers", value: "1/5", color: "text-green-500" },
    { label: "FL Rounds Completed", value: "...", color: "text-blue-500" },
    { label: "Models Verified", value: "...", color: "text-purple-500" },
    { label: "Trust Score", value: "100%", color: "text-emerald-500" },
  ])

  // Fetch Logic
  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/system-overview")
            if (res.ok) {
                const data = await res.json()
                if (data.metrics) setMetrics(data.metrics)
            }
        } catch (e) {
            console.log("Waiting for backend...")
        }
    }
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  // Static Service List (Can be dynamic later)
  const services = [
    { name: "API Gateway", status: "running", uptime: 99.9, icon: Network },
    { name: "Parameter Server", status: "running", uptime: 99.8, icon: Server },
    { name: "HashiCorp Vault", status: "running", uptime: 99.9, icon: Lock },
    { name: "Model Ledger", status: "running", uptime: 100, icon: Shield },
  ]

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
              const Icon = service.icon
              return (
                <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-primary-foreground" />
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-xs text-muted-foreground">Uptime: {service.uptime}%</p>
                    </div>
                  </div>
                  <Badge variant="default" className="border-green-500 text-primary-foreground bg-card">
                    <Activity className="h-3 w-3 mr-1" />
                    Running
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