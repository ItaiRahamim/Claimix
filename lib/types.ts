export type UserRole = "importer" | "supplier"

export type ClaimStatus = "Open" | "In Review" | "Resolved"

export type DocumentZone =
  | "pre_stuffing_qc"
  | "additional_costs_invoices"
  | "supporting_documents"

export interface Claim {
  claim_id: string
  container_number: string
  invoice_number: string
  supplier_name: string
  status: ClaimStatus
  stuffing_date: string | null
  release_date: string | null
  waste_percentage: number | null
  claim_summary: string | null
  // Damage Report fields
  damage_type: string | null
  affected_units: number | null
  total_units: number | null
  estimated_loss_usd: number | null
  damage_description: string | null
  damage_location: string | null
  temperature_log_present: boolean
  inspector_name: string | null
  inspection_date: string | null
  // Meta
  supplier_user_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ClaimDocument {
  doc_id: string
  claim_id: string
  zone: DocumentZone
  file_name: string
  file_path: string
  file_size: number | null
  mime_type: string | null
  uploaded_by: string
  uploaded_at: string
}

export interface ClaimMessage {
  message_id: string
  claim_id: string
  sender_id: string
  sender_role: UserRole
  body: string
  created_at: string
}

export interface NewClaimPayload {
  container_number: string
  invoice_number: string
  supplier_name: string
  stuffing_date?: string
  release_date?: string
  waste_percentage?: number
  supplier_user_id?: string
}

export interface DamageReportPayload {
  damage_type?: string
  affected_units?: number
  total_units?: number
  estimated_loss_usd?: number
  damage_description?: string
  damage_location?: string
  temperature_log_present?: boolean
  inspector_name?: string
  inspection_date?: string
}
