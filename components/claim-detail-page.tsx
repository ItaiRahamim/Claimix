"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { useClaim } from "@/hooks/use-claims"
import { useMessages } from "@/hooks/use-messages"
import { useDocuments } from "@/hooks/use-documents"
import { useCurrentUser } from "@/hooks/use-role"
import { MetadataPanel } from "@/components/metadata-panel"
import { DamageReportForm } from "@/components/damage-report-form"
import { ClaimDocumentsPanel } from "@/components/claim-documents-panel"
import { ChatInterface } from "@/components/chat-interface"
import { ClaimOverviewBlock } from "@/components/claim-overview-block"
import { Skeleton } from "@/components/ui/skeleton"
import type { UserRole } from "@/lib/types"

interface ClaimDetailPageProps {
  claimId: string
  role: UserRole
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  )
}

export function ClaimDetailPage({ claimId, role }: ClaimDetailPageProps) {
  const router = useRouter()
  const { userId, role: clientRole } = useCurrentUser()
  const effectiveRole = clientRole ?? role

  const { data: claim, isLoading: claimLoading, error: claimError } = useClaim(claimId)
  const { data: messages = [], isLoading: messagesLoading } = useMessages(claimId)
  const { data: documents = [] } = useDocuments(claimId)

  if (claimLoading || messagesLoading) return <LoadingSkeleton />

  if (claimError || !claim) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">Claim not found or you don&apos;t have access.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <button
        onClick={() => router.push("/claims")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Claims
      </button>

      <div>
        <h1 className="text-2xl font-medium text-gray-900">Claim Detail</h1>
        <p className="text-sm text-gray-500 mt-1">
          Container {claim.container_number} · {claim.supplier_name}
        </p>
      </div>

      {/* 1. Metadata */}
      <MetadataPanel claim={claim} role={effectiveRole} />

      {/* 2. AI Overview — daily summary at a glance */}
      <ClaimOverviewBlock
        summary={claim.claim_summary}
        updatedAt={claim.updated_at}
      />

      {/* 3. Damage Report (importer edit / supplier read-only) */}
      <DamageReportForm claim={claim} role={effectiveRole} />

      {/* 4. Documents — 3 zones */}
      <ClaimDocumentsPanel
        claimId={claimId}
        role={effectiveRole}
        documents={documents}
        currentUserId={userId ?? ""}
      />

      {/* 5. Chat */}
      <ChatInterface
        claimId={claimId}
        role={effectiveRole}
        messages={messages}
        currentUserId={userId ?? ""}
      />
    </div>
  )
}
