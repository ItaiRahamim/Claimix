import { createClient } from "@/lib/supabase/client"
import type { Claim, ClaimStatus, DamageReportPayload, NewClaimPayload } from "@/lib/types"

export async function fetchClaims(): Promise<Claim[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("claims")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data as Claim[]
}

export async function fetchClaim(claimId: string): Promise<Claim> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("claims")
    .select("*")
    .eq("claim_id", claimId)
    .single()
  if (error) throw error
  return data as Claim
}

export async function createClaim(payload: NewClaimPayload & { created_by: string }): Promise<Claim> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("claims")
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data as Claim
}

export async function updateClaimStatus(claimId: string, status: ClaimStatus): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("claims")
    .update({ status })
    .eq("claim_id", claimId)
  if (error) throw error
}

export async function updateDamageReport(claimId: string, payload: DamageReportPayload): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from("claims")
    .update(payload)
    .eq("claim_id", claimId)
  if (error) throw error
}
