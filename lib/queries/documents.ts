import { createClient } from "@/lib/supabase/client"
import type { ClaimDocument, DocumentZone } from "@/lib/types"

export async function fetchDocuments(claimId: string): Promise<ClaimDocument[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("claim_documents")
    .select("*")
    .eq("claim_id", claimId)
    .order("uploaded_at", { ascending: false })
  if (error) throw error
  return data as ClaimDocument[]
}

export async function uploadDocument(
  claimId: string,
  zone: DocumentZone,
  file: File,
  uploadedBy: string
): Promise<ClaimDocument> {
  const supabase = createClient()
  const filePath = `${claimId}/${zone}/${Date.now()}-${file.name}`

  const { error: storageError } = await supabase.storage
    .from("claim-documents")
    .upload(filePath, file)
  if (storageError) throw storageError

  const { data, error } = await supabase
    .from("claim_documents")
    .insert({
      claim_id: claimId,
      zone,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: uploadedBy,
    })
    .select()
    .single()
  if (error) throw error
  return data as ClaimDocument
}

export async function getSignedUrl(filePath: string): Promise<string> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from("claim-documents")
    .createSignedUrl(filePath, 3600)
  if (error) throw error
  return data.signedUrl
}
