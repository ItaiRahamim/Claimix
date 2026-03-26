"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { createClaim } from "@/lib/queries/claims"
import { createClient } from "@/lib/supabase/client"
import { MOCK_CLAIMS, MOCK_USER_ID } from "@/lib/mock-data"
import type { Claim } from "@/lib/types"

const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

const schema = z.object({
  container_number: z.string().min(1, "Required"),
  invoice_number: z.string().min(1, "Required"),
  supplier_name: z.string().min(1, "Required"),
  stuffing_date: z.string().optional(),
  release_date: z.string().optional(),
  waste_percentage: z.coerce.number().min(0).max(100).optional(),
  supplier_user_id: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function NewClaimForm() {
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      container_number: "",
      invoice_number: "",
      supplier_name: "",
      stuffing_date: "",
      release_date: "",
      supplier_user_id: "",
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: FormValues): Promise<Claim> => {
      if (DEMO) {
        // In demo mode, build a mock claim and push it into the in-memory array
        const now = new Date().toISOString()
        const newClaim: Claim = {
          claim_id: `clm-${Date.now()}`,
          container_number: values.container_number,
          invoice_number: values.invoice_number,
          supplier_name: values.supplier_name,
          status: "Open",
          stuffing_date: values.stuffing_date || null,
          release_date: values.release_date || null,
          waste_percentage: values.waste_percentage ?? null,
          claim_summary: null,
          damage_type: null,
          affected_units: null,
          total_units: null,
          estimated_loss_usd: null,
          damage_description: null,
          damage_location: null,
          temperature_log_present: false,
          inspector_name: null,
          inspection_date: null,
          supplier_user_id: values.supplier_user_id || null,
          created_by: MOCK_USER_ID,
          created_at: now,
          updated_at: now,
        }
        MOCK_CLAIMS.unshift(newClaim)
        return newClaim
      }

      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      return createClaim({
        ...values,
        created_by: user.id,
        supplier_user_id: values.supplier_user_id || undefined,
        waste_percentage: values.waste_percentage,
      })
    },
    onSuccess: (claim) => {
      toast.success("Claim created successfully.")
      router.push(`/claims/${claim.claim_id}`)
    },
    onError: () => toast.error("Failed to create claim. Please try again."),
  })

  return (
    <div className="space-y-6 max-w-2xl">
      <button
        onClick={() => router.push("/claims")}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Claims
      </button>

      <div>
        <h1 className="text-2xl font-medium text-gray-900">New Claim</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new supplier claim</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Claim Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => mutate(v))} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="container_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Container Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. ABCD1234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoice_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. INV-2024-0012" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Dole Food Company" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="waste_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Waste % (optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} max={100} step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stuffing_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stuffing Date (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="release_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Release Date (optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier_user_id"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Supplier User ID (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Supabase user UUID — grants supplier portal access"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" type="button" onClick={() => router.push("/claims")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Creating…" : "Create Claim"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
