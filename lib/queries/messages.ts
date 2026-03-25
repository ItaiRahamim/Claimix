import { createClient } from "@/lib/supabase/client"
import type { ClaimMessage, UserRole } from "@/lib/types"

export async function fetchMessages(claimId: string): Promise<ClaimMessage[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("claim_messages")
    .select("*")
    .eq("claim_id", claimId)
    .order("created_at", { ascending: true })
  if (error) throw error
  return data as ClaimMessage[]
}

export async function sendMessage(
  claimId: string,
  senderId: string,
  senderRole: UserRole,
  body: string
): Promise<ClaimMessage> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("claim_messages")
    .insert({ claim_id: claimId, sender_id: senderId, sender_role: senderRole, body })
    .select()
    .single()
  if (error) throw error
  return data as ClaimMessage
}
