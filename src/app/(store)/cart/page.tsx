"use client"

import Link from "next/link"
import { useState, useTransition } from "react"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { useCart } from "@/components/cart/cart-provider"
import { ProductImage } from "@/components/ui/product-image"
import { Button } from "@/components/ui/button"
import { submitGuestOrder } from "./actions"

export default function CartPage() {
  const { lines, setQuantity, removeItem, clearCart } = useCart()
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState("")
  const [orderId, setOrderId] = useState("")

  function submit(formData: FormData) {
    setMessage("")
    const input = {
      shopName: formData.get("shopName"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      notes: formData.get("notes"),
      lines: lines.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
    }
    startTransition(async () => {
      const result = await submitGuestOrder(input)
      if (!result.ok) {
        setMessage(result.error)
        return
      }
      clearCart()
      setOrderId(result.orderId)
    })
  }

  if (orderId) return <div className="mx-auto max-w-2xl px-4 py-20 text-center"><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-700"><ShoppingBag /></div><h1 className="mt-5 text-3xl font-semibold">Order request received</h1><p className="mt-3 text-muted-foreground">Your reference number is <strong className="text-foreground">{orderId.slice(0, 8).toUpperCase()}</strong>. Satguru Traders will contact you to confirm the order.</p><Button className="mt-7" asChild><Link href="/shop">Continue browsing</Link></Button></div>

  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
    <p className="text-sm font-medium text-emerald-800">Guest order</p>
    <h1 className="mt-1 text-3xl font-semibold">Your cart</h1>
    <p className="mt-2 text-sm text-muted-foreground">No account needed. Send your request and our team will contact you to confirm availability.</p>
    {!lines.length ? <div className="mt-10 rounded-xl border border-dashed p-10 text-center"><ShoppingBag className="mx-auto h-8 w-8 text-muted-foreground"/><p className="mt-4 font-medium">Your cart is empty</p><Button className="mt-5" asChild><Link href="/shop">Browse products</Link></Button></div> :
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        <section className="space-y-3" aria-label="Cart items">
          {lines.map((line) => <article key={`${line.productId}:${line.variantId}`} className="flex gap-4 rounded-xl border p-4">
            <Link href={`/${line.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"><ProductImage src={line.imageUrl} alt={line.productName} fill sizes="96px" className="object-cover"/></Link>
            <div className="min-w-0 flex-1"><Link href={`/${line.slug}`} className="font-medium hover:underline">{line.productName}</Link><p className="mt-1 text-sm text-muted-foreground">{line.variantName}</p><p className="text-xs text-muted-foreground">SKU: {line.sku || "—"}</p>
              <div className="mt-3 flex items-center gap-2"><button type="button" aria-label={`Decrease ${line.productName} quantity`} onClick={() => setQuantity(line.productId, line.variantId, line.quantity - 1)} className="grid h-8 w-8 place-items-center rounded-md border hover:bg-muted"><Minus className="h-4 w-4"/></button><span className="min-w-8 text-center tabular-nums">{line.quantity}</span><button type="button" aria-label={`Increase ${line.productName} quantity`} onClick={() => setQuantity(line.productId, line.variantId, line.quantity + 1)} className="grid h-8 w-8 place-items-center rounded-md border hover:bg-muted"><Plus className="h-4 w-4"/></button><button type="button" onClick={() => removeItem(line.productId, line.variantId)} className="ml-2 inline-flex items-center gap-1 text-xs text-destructive hover:underline"><Trash2 className="h-3.5 w-3.5"/>Remove</button></div>
            </div>
          </article>)}
          <button type="button" onClick={clearCart} className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Clear cart</button>
        </section>
        <form action={submit} className="h-fit space-y-4 rounded-xl border p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Delivery details</h2>
          <Field label="Shop name" name="shopName" required maxLength={120} autoComplete="organization" placeholder="Your shop or business" />
          <Field label="Phone number" name="phone" type="tel" required maxLength={30} autoComplete="tel" placeholder="Phone number for order confirmation" />
          <label className="block text-sm font-medium">Address<textarea name="address" required minLength={8} maxLength={500} autoComplete="street-address" rows={3} placeholder="Delivery address, area, city" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          <label className="block text-sm font-medium">Order note <span className="font-normal text-muted-foreground">(optional)</span><textarea name="notes" maxLength={1000} rows={2} placeholder="Anything we should know?" className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
          {message && <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{message}</p>}
          <Button type="submit" disabled={pending || lines.length === 0} className="w-full">{pending ? "Sending order…" : "Place order request"}</Button>
          <p className="text-xs leading-5 text-muted-foreground">This sends an order request to Satguru Traders. We will call to confirm availability and delivery details.</p>
        </form>
      </div>}
  </div>
}

function Field(props: { label: string; name: string; type?: string; required?: boolean; maxLength?: number; autoComplete?: string; placeholder?: string }) {
  return <label className="block text-sm font-medium">{props.label}<input name={props.name} type={props.type ?? "text"} required={props.required} maxLength={props.maxLength} autoComplete={props.autoComplete} placeholder={props.placeholder} className="mt-1.5 w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" /></label>
}
