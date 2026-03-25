"use client"

import { useRouter } from "next/navigation"
import { FileText, AlertCircle, Clock, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ClaimStatusBadge } from "@/components/claim-status-badge"
import type { Claim, UserRole } from "@/lib/types"

interface KpiCardProps {
  label: string
  value: number
  icon: React.ElementType
  iconColor: string
}

function KpiCard({ label, value, icon: Icon, iconColor }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}

interface ClaimsListPageProps {
  claims: Claim[]
  role: UserRole
}

export function ClaimsListPage({ claims, role }: ClaimsListPageProps) {
  const router = useRouter()

  const open = claims.filter((c) => c.status === "Open").length
  const inReview = claims.filter((c) => c.status === "In Review").length
  const resolved = claims.filter((c) => c.status === "Resolved").length

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Claims</h1>
          <p className="text-sm text-gray-500 mt-1">
            {role === "importer"
              ? "Manage all supplier claims"
              : "View claims assigned to your company"}
          </p>
        </div>
        {role === "importer" && (
          <button
            onClick={() => router.push("/new-claim")}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            New Claim
          </button>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="Total Claims" value={claims.length} icon={FileText} iconColor="text-gray-400" />
        <KpiCard label="Open" value={open} icon={AlertCircle} iconColor="text-blue-500" />
        <KpiCard label="In Review" value={inReview} icon={Clock} iconColor="text-yellow-500" />
        <KpiCard label="Resolved" value={resolved} icon={CheckCircle2} iconColor="text-green-500" />
      </div>

      {/* Claims table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim ID</TableHead>
                  <TableHead>Container</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stuffing Date</TableHead>
                  <TableHead>Waste %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {claims.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-400 py-10">
                      No claims found.
                    </TableCell>
                  </TableRow>
                ) : (
                  claims.map((claim) => (
                    <TableRow
                      key={claim.claim_id}
                      className="cursor-pointer"
                      onClick={() => router.push(`/claims/${claim.claim_id}`)}
                    >
                      <TableCell className="font-mono text-xs text-gray-600">
                        {claim.claim_id.slice(0, 8)}…
                      </TableCell>
                      <TableCell className="font-medium">{claim.container_number}</TableCell>
                      <TableCell>{claim.invoice_number}</TableCell>
                      <TableCell>{claim.supplier_name}</TableCell>
                      <TableCell>
                        <ClaimStatusBadge status={claim.status} />
                      </TableCell>
                      <TableCell>
                        {claim.stuffing_date
                          ? new Date(claim.stuffing_date).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {claim.waste_percentage != null
                          ? `${claim.waste_percentage}%`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
