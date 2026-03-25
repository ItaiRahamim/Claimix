"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClaimStatusBadge } from "@/components/claim-status-badge"
import { updateClaimStatus } from "@/lib/queries/claims"
import type { Claim, ClaimStatus, UserRole } from "@/lib/types"

const STATUSES: ClaimStatus[] = ["Open", "In Review", "Resolved"]

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value ?? "—"}</p>
    </div>
  )
}

interface MetadataPanelProps {
  claim: Claim
  role: UserRole
}

export function MetadataPanel({ claim, role }: MetadataPanelProps) {
  const queryClient = useQueryClient()

  const { mutate: changeStatus, isPending } = useMutation({
    mutationFn: (status: ClaimStatus) => updateClaimStatus(claim.claim_id, status),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["claim", claim.claim_id] })
      queryClient.invalidateQueries({ queryKey: ["claims"] })
      toast.success(`Status updated to "${status}".`)
    },
    onError: () => toast.error("Failed to update status."),
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Claim Details</span>
          <ClaimStatusBadge status={claim.status} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Claim ID" value={<span className="font-mono text-xs">{claim.claim_id.slice(0, 8)}…</span>} />
          <Field label="Container Number" value={claim.container_number} />
          <Field label="Invoice Number" value={claim.invoice_number} />
          <Field label="Supplier" value={claim.supplier_name} />
          <Field
            label="Stuffing Date"
            value={claim.stuffing_date ? new Date(claim.stuffing_date).toLocaleDateString() : null}
          />
          <Field
            label="Release Date"
            value={claim.release_date ? new Date(claim.release_date).toLocaleDateString() : null}
          />
          <Field
            label="Waste %"
            value={claim.waste_percentage != null ? `${claim.waste_percentage}%` : null}
          />
        </div>

        {/* Status update — importer only */}
        {role === "importer" && (
          <div className="pt-2 border-t">
            <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1.5">Update Status</p>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={isPending || claim.status === s}
                  onClick={() => changeStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-colors disabled:opacity-50 ${
                    claim.status === s
                      ? "bg-gray-100 border-gray-200 text-gray-500 cursor-default"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
