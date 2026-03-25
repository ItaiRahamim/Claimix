"use client"

import { useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Upload, FileText, Download, X, ZoomIn, FileSpreadsheet, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadDocument, getSignedUrl } from "@/lib/queries/documents"
import type { ClaimDocument, DocumentZone } from "@/lib/types"
import { format } from "date-fns"

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

// Map of mock file paths → placeholder images for demo
const DEMO_PREVIEWS: Record<string, string> = {
  "clm-001/supporting_documents/Container_Photos_Dec03.jpg":
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
}

function isImage(mime: string | null, name: string) {
  if (mime?.startsWith("image/")) return true
  return /\.(jpe?g|png|gif|webp)$/i.test(name)
}

function isPdf(mime: string | null, name: string) {
  if (mime === "application/pdf") return true
  return /\.pdf$/i.test(name)
}

function isSpreadsheet(mime: string | null, name: string) {
  return /\.(xlsx?|csv)$/i.test(name)
}

function FileIcon({ doc }: { doc: ClaimDocument }) {
  if (isImage(doc.mime_type, doc.file_name))
    return <div className="h-4 w-4 rounded bg-blue-100 flex items-center justify-center text-[8px] font-bold text-blue-600">IMG</div>
  if (isPdf(doc.mime_type, doc.file_name))
    return <div className="h-4 w-4 rounded bg-red-100 flex items-center justify-center text-[8px] font-bold text-red-600">PDF</div>
  if (isSpreadsheet(doc.mime_type, doc.file_name))
    return <FileSpreadsheet className="h-4 w-4 text-green-600 shrink-0" />
  return <FileText className="h-4 w-4 text-gray-400 shrink-0" />
}

interface LightboxProps {
  src: string
  name: string
  onClose: () => void
}

function Lightbox({ src, name, onClose }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-white rounded-xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b">
          <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{name}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors ml-4">
            <X className="h-4 w-4" />
          </button>
        </div>
        <img
          src={src}
          alt={name}
          className="max-h-[80vh] w-auto object-contain block"
        />
      </div>
    </div>
  )
}

interface DocumentUploadZoneProps {
  claimId: string
  zone: DocumentZone
  label: string
  description: string
  canUpload: boolean
  documents: ClaimDocument[]
  uploadedBy: string
}

export function DocumentUploadZone({
  claimId,
  zone,
  label,
  description,
  canUpload,
  documents,
  uploadedBy,
}: DocumentUploadZoneProps) {
  const queryClient = useQueryClient()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [lightbox, setLightbox] = useState<{ src: string; name: string } | null>(null)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})

  const { mutate: upload, isPending } = useMutation({
    mutationFn: (file: File) => uploadDocument(claimId, zone, file, uploadedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", claimId] })
      toast.success("Document uploaded.")
    },
    onError: () => toast.error("Upload failed. Please try again."),
  })

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach((file) => upload(file))
  }

  async function resolveUrl(doc: ClaimDocument): Promise<string> {
    if (DEMO) return DEMO_PREVIEWS[doc.file_path] ?? ""
    if (signedUrls[doc.doc_id]) return signedUrls[doc.doc_id]
    const url = await getSignedUrl(doc.file_path)
    setSignedUrls((prev) => ({ ...prev, [doc.doc_id]: url }))
    return url
  }

  async function handlePreview(doc: ClaimDocument) {
    const url = await resolveUrl(doc)
    if (!url) { toast.error("Preview not available."); return }
    if (isImage(doc.mime_type, doc.file_name)) {
      setLightbox({ src: url, name: doc.file_name })
    } else {
      window.open(url, "_blank")
    }
  }

  async function handleDownload(doc: ClaimDocument) {
    try {
      const url = await resolveUrl(doc)
      if (!url) { toast.error("Download not available in demo mode."); return }
      window.open(url, "_blank")
    } catch {
      toast.error("Could not generate download link.")
    }
  }

  return (
    <>
      {lightbox && (
        <Lightbox src={lightbox.src} name={lightbox.name} onClose={() => setLightbox(null)} />
      )}

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>

        {/* Upload zone */}
        {canUpload && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFiles(e.dataTransfer.files) }}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
            )}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-5 w-5 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {isPending ? "Uploading…" : "Drop files here or click to browse"}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOCX, XLSX</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx"
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>
        )}

        {/* Document list */}
        {documents.length > 0 ? (
          <ul className="space-y-2">
            {documents.map((doc) => {
              const showThumb = isImage(doc.mime_type, doc.file_name)
              const thumbSrc = DEMO ? (DEMO_PREVIEWS[doc.file_path] ?? null) : (signedUrls[doc.doc_id] ?? null)

              return (
                <li key={doc.doc_id} className="bg-white border rounded-lg overflow-hidden">
                  {/* Image thumbnail row */}
                  {showThumb && thumbSrc && (
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => setLightbox({ src: thumbSrc, name: doc.file_name })}
                    >
                      <img
                        src={thumbSrc}
                        alt={doc.file_name}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                      </div>
                    </div>
                  )}

                  {/* File info row */}
                  <div className="flex items-center justify-between px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileIcon doc={doc} />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-800 truncate">{doc.file_name}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(doc.uploaded_at), "MMM d, yyyy")}
                          {doc.file_size ? ` · ${(doc.file_size / 1024).toFixed(0)} KB` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title={isImage(doc.mime_type, doc.file_name) ? "Preview" : "Open"}
                      >
                        <ZoomIn className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="Download"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-xs text-gray-400 italic">No documents uploaded yet.</p>
        )}
      </div>
    </>
  )
}
