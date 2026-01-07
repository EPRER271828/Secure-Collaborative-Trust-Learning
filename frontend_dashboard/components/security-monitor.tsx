"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Lock, Key, AlertTriangle, CheckCircle2 } from "lucide-react"

export function SecurityMonitor() {
  const securityMetrics = [
    { label: "mTLS Connections", value: "100%", status: "secure", icon: Lock },
    { label: "Vault Secrets", value: "12", status: "secure", icon: Key },
    { label: "Failed Auth", value: "0", status: "secure", icon: ShieldCheck },
    { label: "Security Score", value: "A+", status: "secure", icon: CheckCircle2 },
  ]

  const securityEvents = [
    { type: "success", message: "mTLS handshake successful - worker-03", time: "5s ago" },
    { type: "success", message: "Certificate rotation completed", time: "2m ago" },
    { type: "success", message: "Vault secret accessed: DB_PASSWORD", time: "5m ago" },
    { type: "success", message: "Zero-trust policy validated", time: "8m ago" },
    { type: "info", message: "Certificate expiring in 30 days", time: "15m ago" },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {securityMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>{metric.label}</CardDescription>
                  <Icon className="h-4 w-4 text-green-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">{metric.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zero Trust Architecture</CardTitle>
          <CardDescription>Never trust, always verify</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Mutual TLS</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Both client and server authenticate each other using X.509 certificates.
              </p>
              <Badge variant="outline" className="text-green-500 border-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">HashiCorp Vault</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Centralized secrets management. No credentials in code or environment.
              </p>
              <Badge variant="outline" className="text-green-500 border-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                12 Secrets
              </Badge>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">API Gateway</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Single secure entry point. All requests validated and authenticated.
              </p>
              <Badge variant="outline" className="text-green-500 border-green-500">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Secured
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>Real-time security monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                <div className={`p-1 rounded-full ${event.type === "success" ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                  {event.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{event.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
