"use server"

import { z } from "zod"
import { createCustomerOrder } from "@/lib/orders"

const orderSchema = z.object({
  shopName: z.string().trim().min(2, "Enter your shop name.").max(120),
  phone: z.string().trim().min(7, "Enter a valid phone number.").max(30).regex(/^[+\d][\d\s().-]{5,28}\d$/, "Enter a valid phone number."),
  address: z.string().trim().min(8, "Enter your complete delivery address.").max(500),
  notes: z.string().trim().max(1000).default(""),
  lines: z.array(z.object({ productId: z.string().min(1), variantId: z.string().min(1), quantity: z.number().int().min(1).max(100000) })).min(1).max(50),
})

export async function submitGuestOrder(input: unknown): Promise<{ ok: true; orderId: string } | { ok: false; error: string }> {
  const parsed = orderSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details and try again." }
  try {
    const orderId = await createCustomerOrder(parsed.data)
    return { ok: true, orderId }
  } catch (error) {
    console.error("Guest order submission failed")
    const userError = error instanceof Error && [
      "Your cart must contain between 1 and 50 product options.",
      "One of the quantities is invalid. Please review your cart.",
      "A product quantity is too large.",
    ].includes(error.message)
    const availabilityError = error instanceof Error && (
      error.message.includes("no longer available") || error.message.includes("currently available")
    )
    return { ok: false, error: userError || availabilityError ? (error as Error).message : "We could not submit your order right now. Please try again or call Satguru Traders." }
  }
}
