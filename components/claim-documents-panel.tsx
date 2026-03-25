import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DocumentUploadZone } from "@/components/document-upload-zone"
import type { ClaimDocument, UserRole } from "@/lib/types"

interface ClaimDocumentsPanelProps {
  claimId: string
  role: UserRole
  documents: ClaimDocument[]
  currentUserId: string
}

export function ClaimDocumentsPanel({
  claimId,
  role,
  documents,
  currentUserId,
}: ClaimDocumentsPanelProps) {
  const qcDocs = documents.filter((d) => d.zone === "pre_stuffing_qc")
  const costDocs = documents.filter((d) => d.zone === "additional_costs_invoices")
  const supportDocs = documents.filter((d) => d.zone === "supporting_documents")

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Zone 1: Pre-Stuffing QC Report — Supplier uploads */}
        <DocumentUploadZone
          claimId={claimId}
          zone="pre_stuffing_qc"
          label="Pre-Stuffing QC Report"
          description="Uploaded by Supplier — quality control report prior to stuffing."
          canUpload={role === "supplier"}
          documents={qcDocs}
          uploadedBy={currentUserId}
        />

        <Separator />

        {/* Zone 2: Additional Costs Invoices — Importer uploads */}
        <DocumentUploadZone
          claimId={claimId}
          zone="additional_costs_invoices"
          label="Additional Costs Invoices"
          description="Uploaded by Importer — surveyor, sorting, repacking, or destruction invoices."
          canUpload={role === "importer"}
          documents={costDocs}
          uploadedBy={currentUserId}
        />

        <Separator />

        {/* Zone 3: Supporting Documents — Importer uploads */}
        <DocumentUploadZone
          claimId={claimId}
          zone="supporting_documents"
          label="Supporting Documents"
          description="Uploaded by Importer — surveyor damage reports, photos, and non-financial evidence."
          canUpload={role === "importer"}
          documents={supportDocs}
          uploadedBy={currentUserId}
        />
      </CardContent>
    </Card>
  )
}
