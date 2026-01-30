"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Activity, ShieldCheck, InfoIcon } from "lucide-react"
import { SystemOverview } from "@/components/system-overview"
import { EdgeWorkers } from "@/components/edge-workers"
import { FederatedLearning } from "@/components/federated-learning"
import { BlockchainTrust } from "@/components/blockchain-trust"
import { SecurityMonitor } from "@/components/security-monitor"
import { MLMetrics } from "@/components/ml-metrics"
import { Documents } from "@/components/documents"
import { HomomorphicEncryption } from "@/components/homomorphic-encryption"
import { Info } from "@/components/info"

export default function Dashboard() {
  const [systemStatus, setSystemStatus] = useState({
    overall: "operational",
    services: 8,
    activeWorkers: 5,
    trustScore: 98.5,
  })
  console.log("Current API URL:", process.env.REACT_APP_API_URL);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-foreground">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-balance bg-background text-primary font-serif">
                  Cyber-Resilient FL System
                </h1>
                <p className="text-sm font-serif bg-background text-foreground">
                  Federated Learning • Zero Trust • Blockchain Verified
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-2 text-primary-foreground">
                <Activity className="h-3 w-3" />
                {systemStatus.overall === "operational" ? "Operational" : "Alert"}
              </Badge>
              <Badge variant="secondary" className="gap-2 text-primary bg-popover-foreground">
                <ShieldCheck className="h-3 w-3" />
                Trust Score: {systemStatus.trustScore}%
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9 lg:w-auto bg-primary-foreground">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workers">Edge Workers</TabsTrigger>
            <TabsTrigger value="federated">FL Training</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="metrics">ML Metrics</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="phe">PHE</TabsTrigger>
            <TabsTrigger value="info" className="px-2 text-xs">
              Info
              <InfoIcon className="h-3 w-3 ml-1" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <SystemOverview />
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            <EdgeWorkers />
          </TabsContent>

          <TabsContent value="federated" className="space-y-6">
            <FederatedLearning />
          </TabsContent>

          <TabsContent value="blockchain" className="space-y-6">
            <BlockchainTrust />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <SecurityMonitor />
          </TabsContent>

          <TabsContent value="metrics" className="space-y-6">
            <MLMetrics />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Documents />
          </TabsContent>

          <TabsContent value="phe" className="space-y-6">
            <HomomorphicEncryption />
          </TabsContent>

          <TabsContent value="info" className="space-y-6">
            <Info />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
