"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Lock, Key, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { useRealTimeData } from "@/hooks/useRealTimeData"

// Types for our security data
interface SecurityEvent {
  type: "success" | "warning" | "error"
  message: string
  time: string
}

interface SecurityMetrics {
  mtlsConnections: string
  vaultSecrets: number
  failedAuth: number
  securityScore: string
  events: SecurityEvent[]
}

export function SecurityMonitor() {
  // 1. USE INSTANT STREAM HOOK
  const liveData = useRealTimeData();

  // 2. STATE: Default safe values
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    mtlsConnections: "..%", // Defaulted for demo
    vaultSecrets: 0,        // Defaulted for demo
    failedAuth: 0,
    securityScore: "Scanning...",
    events: []
  })
  const [loading, setLoading] = useState(true)

  // 3. SYNC LOGIC: Update when the master stream pushes security data
  useEffect(() => {
    const fetchFallbackData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/security-status")
        if (res.ok) {
          const data = await res.json()
          setMetrics(data)
        }
      } catch (e) {
        console.error("Security monitor offline")
      } finally {
        setLoading(false)
      }
    }

    if (liveData?.security) {
      setMetrics(liveData.security);
      setLoading(false);
    } else {
      // Fallback to initial fetch if stream isn't active yet
      fetchFallbackData();
    }
  }, [liveData]);

  // Helper to get color based on score
  const getScoreColor = (score: string) => {
    if (score === "A+" || score === "A") return "text-green-500"
    if (score === "B") return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>mTLS Connections</CardDescription>
              <Lock className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
                {loading ? "..." : metrics.mtlsConnections}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Vault Secrets</CardDescription>
              <Key className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
                {loading ? "..." : metrics.vaultSecrets}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Failed Auth</CardDescription>
              <ShieldCheck className={`h-4 w-4 ${metrics.failedAuth > 0 ? "text-red-500" : "text-green-500"}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.failedAuth > 0 ? "text-red-500" : "text-green-500"}`}>
                {loading ? "..." : metrics.failedAuth}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardDescription>Security Score</CardDescription>
              <CheckCircle2 className={`h-4 w-4 ${getScoreColor(metrics.securityScore)}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(metrics.securityScore)}`}>
                {metrics.securityScore}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Zero Trust Architecture</CardTitle>
          <CardDescription>Never trust, always verify</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Mutual TLS</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Both client and server authenticate each other using X.509 certificates.
              </p>
              <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-3">
                <Key className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">HashiCorp Vault</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Centralized secrets management. No credentials in code or environment.
              </p>
              <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {metrics.vaultSecrets > 0 ? "Secured" : "Initializing"}
              </Badge>
            </div>

            <div className="p-4 border border-border rounded-lg bg-card">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">API Gateway</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Single secure entry point. All requests validated and authenticated.
              </p>
              <Badge variant="outline" className="text-green-500 border-green-500 bg-green-500/10">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Secured
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Event Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Security Events
            {loading && <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground"/>}
          </CardTitle>
          <CardDescription>Real-time security monitoring</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {metrics.events.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent security events logged.</p>
            ) : (
                metrics.events.map((event, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className={`p-1 rounded-full ${event.type === "success" ? "bg-green-500/10" : "bg-blue-500/10"}`}>
                    {event.type === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                    </div>
                    <div className="flex-1">
                    <p className="text-sm font-medium">{event.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                    </div>
                </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}