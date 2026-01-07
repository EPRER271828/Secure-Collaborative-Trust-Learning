import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Network, Shield, Package } from "lucide-react"

export function Info() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">SCTL Project: Technical Architecture & Methodology</h2>
        <p className="text-muted-foreground">
          Comprehensive overview of the system's core technologies and implementation strategy
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* AI Layer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Artificial Intelligence Layer</CardTitle>
            </div>
            <CardDescription>Decentralized machine learning architecture</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Federated Learning (FL)</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                A decentralized machine learning approach where AI models are trained across multiple edge devices
                without ever exchanging raw datasets. Instead of moving data to a central server, the global model is
                sent to the local devices, fundamentally preserving data privacy.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">The Aggregator</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                The central orchestrator responsible for collecting model updates (gradients or weights) from
                participating clients. It utilizes algorithms such as Federated Averaging (FedAvg) to merge these local
                updates into a single, improved Global Model.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ZTNA Layer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Zero Trust Network Access (ZTNA) Layer</CardTitle>
            </div>
            <CardDescription>High-security communication infrastructure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">ZTNA & gRPC</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                gRPC serves as the high-performance communication backbone for our Zero Trust Network Access (ZTNA)
                implementation. It handles model transmission with significantly lower latency than traditional HTTP and
                provides native support for the advanced security protocols required in microservice environments.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">mTLS (Mutual TLS)</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                A core pillar of ZTNA that ensures mutual authentication. Unlike standard web security, both the client
                and the server must prove their identity using digital certificates before a connection is established,
                preventing unauthorized access and on-path attacks.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">HashiCorp Vault</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                A professional secrets management tool utilized to protect and manage sensitive mTLS certificates and
                private keys. It enforces identity-based security, ensuring that only authorized services can retrieve
                the credentials needed for network communication.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Trust & Audit Layer */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              <CardTitle>Trust & Audit Layer (DLT)</CardTitle>
            </div>
            <CardDescription>Blockchain-based integrity verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Hyperledger Fabric</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                An enterprise-grade, permissioned Distributed Ledger Technology (DLT) platform. It provides a secure,
                private foundation for recording model hashes, creating an immutable audit trail of the learning process
                that ensures model integrity across all training rounds.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Infrastructure & Deployment */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <CardTitle>Infrastructure & Deployment</CardTitle>
            </div>
            <CardDescription>Containerization and orchestration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Containerization</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                The process of packaging the application and its entire environment into isolated units called
                containers. This ensures that the SCTL stack runs identically across different hardware, from a
                developer's laptop to a cloud-based production server.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Docker Compose</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                A specialized orchestration tool within the containerization ecosystem used to define and manage
                multi-container applications. Using a single YAML configuration file, it launches the entire complex
                network—Gateway, Aggregator Server, and Edge Workers—simultaneously.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
