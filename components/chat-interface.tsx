"use client"

import { useEffect, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Send } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { sendMessage } from "@/lib/queries/messages"
import type { ClaimMessage, UserRole } from "@/lib/types"

interface ChatInterfaceProps {
  claimId: string
  role: UserRole
  messages: ClaimMessage[]
  currentUserId: string
}

export function ChatInterface({
  claimId,
  role,
  messages,
  currentUserId,
}: ChatInterfaceProps) {
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [body, setBody] = useState("")

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const { mutate: postMessage, isPending } = useMutation({
    mutationFn: () => sendMessage(claimId, currentUserId, role, body.trim()),
    onSuccess: () => {
      setBody("")
      queryClient.invalidateQueries({ queryKey: ["messages", claimId] })
    },
    onError: () => toast.error("Failed to send message."),
  })

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault()
      if (body.trim()) postMessage()
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Communication</span>
          <span className="text-xs text-gray-400 font-normal">{messages.length} messages</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Message list */}
        <div className="max-h-[500px] overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-8">
              No messages yet. Start the conversation.
            </p>
          )}
          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            const isImporter = msg.sender_role === "importer"

            return (
              <div
                key={msg.message_id}
                className={cn("flex gap-2.5", isMe ? "flex-row-reverse" : "flex-row")}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5",
                    isImporter
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  )}
                >
                  {isImporter ? "IM" : "SU"}
                </div>

                {/* Bubble */}
                <div className={cn("max-w-[75%] space-y-1", isMe ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm leading-relaxed",
                      isMe
                        ? "bg-blue-600 text-white rounded-tr-sm"
                        : "bg-gray-100 text-gray-900 rounded-tl-sm"
                    )}
                  >
                    {msg.body}
                  </div>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 text-[10px] text-gray-400",
                      isMe ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <span className="capitalize">{msg.sender_role}</span>
                    <span>·</span>
                    <span>{format(new Date(msg.created_at), "MMM d, HH:mm")}</span>
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={scrollRef} />
        </div>

        {/* Input area */}
        <div className="border-t pt-4 space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Cmd+Enter to send)"
            className="resize-none min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => { if (body.trim()) postMessage() }}
              disabled={isPending || !body.trim()}
              size="sm"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
