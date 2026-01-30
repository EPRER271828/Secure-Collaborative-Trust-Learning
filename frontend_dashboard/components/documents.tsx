"use client"

import React, { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Upload,
  FileText,
  Bot,
  CheckCircle2,
  Loader2,
  Shield,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"

type UploadStatus = "idle" | "uploading" | "anchoring" | "success" | "error"

interface LedgerEntry {
  id: string
  type: "document" | "model"
  cid: string
  timestamp: string
  docName?: string
  roundNum: number
  previousHash: string
  verified: boolean
}

// --- SUB-COMPONENT: UPLOAD VAULT ---
function DocumentVault({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [dragActive, setDragActive] = useState(false)
  const [uploadedCid, setUploadedCid] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    setUploadStatus("uploading")
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("http://localhost:5000/upload_doc", {
        method: "POST",
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success) {
        setUploadStatus("anchoring")
        setUploadedCid(result.cid)
        setTimeout(() => {
            setUploadStatus("success")
            onUploadComplete()
            setTimeout(() => setUploadStatus("idle"), 4000)
        }, 1500)
      } else {
        setUploadStatus("error")
      }
    } catch (error) {
      console.error("Upload failed:", error)
      setUploadStatus("error")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-emerald-500" />
          Document Vault
        </CardTitle>
        <CardDescription>Securely push files to the decentralized IPFS network & SCTL Blockchain</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive ? "border-emerald-500 bg-emerald-500/5" : "border-zinc-800 hover:border-emerald-500/50"
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]); }}
        >
          <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} disabled={uploadStatus !== "idle" && uploadStatus !== "success"} />
          <FileText className="h-12 w-12 mx-auto text-zinc-500 mb-4" />
          <p className="text-sm font-medium">Drag and drop or click to upload</p>
          <p className="text-xs text-zinc-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-md border border-zinc-800">
            <span className="text-sm flex items-center gap-2">
                {uploadStatus === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />}
                {uploadStatus === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {uploadStatus === "error" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                <span className={uploadStatus === "success" ? "text-emerald-500" : ""}>
                    {uploadStatus === "idle" && "System Ready"}
                    {uploadStatus === "uploading" && "Pushing to IPFS..."}
                    {uploadStatus === "anchoring" && "Minting Blockchain Block..."}
                    {uploadStatus === "success" && "Document Anchored Successfully"}
                    {uploadStatus === "error" && "Connection Error"}
                </span>
            </span>
            {uploadedCid && <Badge variant="outline" className="font-mono text-[10px]">{uploadedCid.substring(0,10)}...</Badge>}
        </div>
      </CardContent>
    </Card>
  )
}

// --- SUB-COMPONENT: LEDGER TABLE ---
function BlockchainLedger({ refreshTrigger }: { refreshTrigger: number }) {
  const [showOnlyDocuments, setShowOnlyDocuments] = useState(false)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([])

  const fetchLedger = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:5000/api/doc-ledger")
      const data = await response.json()
      const formatted = data.map((block: any) => ({
        id: block.index.toString(),
        type: "document",
        cid: block.doc_cid,
        docName: block.doc_name,
        timestamp: new Date(block.timestamp * 1000).toLocaleTimeString(),
        previousHash: block.previous_hash,
        verified: true,
      }))
      setLedgerData(formatted.reverse())
    } catch (e) { console.error("Ledger fetch failed", e) }
  }, [])

  useEffect(() => { fetchLedger() }, [refreshTrigger, fetchLedger])

  return (
    <Card className="border-zinc-800 bg-zinc-950/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-4 w-4 text-emerald-500"/>Audit Trail</CardTitle>
          <CardDescription>Immutable Document Ledger</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchLedger} className="gap-2">
            <RefreshCw className="h-3 w-3" /> Sync
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead>File Name</TableHead>
              <TableHead>IPFS CID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Integrity</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgerData.map((entry) => (
              <TableRow key={entry.id} className="border-zinc-800">
                <TableCell className="font-medium text-zinc-300">
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-400" />
                        {entry.docName || "Untitled"}
                    </div>
                </TableCell>
                <TableCell><code className="text-[10px] bg-zinc-900 px-2 py-1 rounded text-zinc-500">{entry.cid.substring(0, 15)}...</code></TableCell>
                <TableCell className="text-xs text-zinc-500">{entry.timestamp}</TableCell>
                <TableCell>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`https://ipfs.io/ipfs/${entry.cid}`} target="_blank"><ExternalLink className="h-3 w-3" /></a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// --- MAIN EXPORT ---
export function Documents() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <DocumentVault onUploadComplete={() => setRefreshTrigger(t => t + 1)} />
      <BlockchainLedger refreshTrigger={refreshTrigger} />
    </div>
  )
}