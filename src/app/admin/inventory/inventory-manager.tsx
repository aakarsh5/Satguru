"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ProductImage } from "@/components/ui/product-image"
import type { InventoryMovement } from "@/lib/repositories/postgres-repository"
import { adjustInventoryAction, generateMissingSkusAction } from "../actions"

type InventoryRow = {
  productId: string
  productName: string
  productSlug: string
  productStatus: string
  imageUrl: string
  variantId: string
  variantName: string
  options: string
  sku: string
  quantity: number
  trackInventory: boolean
  allowBackorder: boolean
  needsSetup: boolean
}

const reasonLabels: Record<string, string> = {
  purchase: "Stock received",
  return: "Customer return",
  delivered: "Stock delivered",
  damage: "Damaged stock",
  loss: "Lost stock",
  correction: "Count correction",
  other: "Other",
}

export function InventoryManager({ rows, movements, threshold }: { rows: InventoryRow[]; movements: InventoryMovement[]; threshold: number }) {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("all")
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesSearch = !normalized || [row.productName, row.variantName, row.options, row.sku].some((value) => value.toLowerCase().includes(normalized))
      const matchesFilter = filter === "all" || (filter === "low" && row.trackInventory && row.quantity > 0 && row.quantity <= threshold) || (filter === "out" && row.trackInventory && row.quantity === 0) || (filter === "untracked" && (!row.trackInventory || row.needsSetup))
      return matchesSearch && matchesFilter
    })
  }, [rows, query, filter, threshold])

  return <>
    <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b p-4">
        <div><h2 className="font-semibold">Stock by variant</h2><p className="mt-1 text-xs text-muted-foreground">Low stock means {threshold} units or fewer. Use Add or Remove to record a movement; Set count is for physical stock corrections.</p></div>
        <div className="flex flex-wrap gap-2">
          <form action={generateMissingSkusAction}><button type="submit" className="h-10 rounded-md border px-3 text-sm font-medium hover:bg-neutral-50">Generate missing SKUs</button></form>
          <label className="sr-only" htmlFor="inventory-search">Search inventory</label><input id="inventory-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product, SKU…" className="h-10 min-w-52 rounded-md border px-3 text-sm" />
          <label className="sr-only" htmlFor="inventory-filter">Filter inventory</label><select id="inventory-filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-md border px-3 text-sm"><option value="all">All stock</option><option value="low">Low stock</option><option value="out">Out of stock</option><option value="untracked">Untracked</option></select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Product / variant</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Stock movement</th></tr></thead>
          <tbody className="divide-y">
            {filtered.map((row) => <tr key={`${row.productId}-${row.variantId}`} className="align-top hover:bg-neutral-50/60">
              <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md bg-neutral-100"><ProductImage src={row.imageUrl || undefined} alt={row.productName} sizes="44px" /></div><div><Link href={`/admin/products/${row.productId}`} className="font-medium hover:underline">{row.productName}</Link><p className="text-xs text-muted-foreground">{row.needsSetup ? "No variant created yet" : `${row.variantName}${row.options ? ` · ${row.options}` : ""}`}</p></div></div></td>
              <td className="px-4 py-3 font-mono text-xs">{row.sku || "—"}</td>
              <td className="px-4 py-3">{row.needsSetup ? <span className="text-muted-foreground">Not set up</span> : row.trackInventory ? <span className="font-semibold tabular-nums">{row.quantity.toLocaleString()} units</span> : <span className="text-muted-foreground">Not tracked</span>}{row.allowBackorder && <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-[11px] text-blue-800">Backorders</span>}</td>
              <td className="px-4 py-3">{row.needsSetup ? <Badge tone="blue">Set up stock</Badge> : !row.trackInventory ? <Badge tone="gray">Untracked</Badge> : row.quantity === 0 ? <Badge tone="red">Out of stock</Badge> : row.quantity <= threshold ? <Badge tone="amber">Low stock</Badge> : <Badge tone="green">In stock</Badge>}</td>
              <td className="px-4 py-3">{row.trackInventory || row.needsSetup ? <details className="group"><summary className="cursor-pointer list-none rounded-md border px-3 py-2 text-center text-xs font-medium hover:bg-neutral-50">{row.needsSetup ? "Set up stock" : "Adjust stock"}</summary><form action={adjustInventoryAction} className="mt-3 grid min-w-64 gap-2 rounded-lg border bg-neutral-50 p-3">
                <input type="hidden" name="productId" value={row.productId} /><input type="hidden" name="variantId" value={row.variantId} />
                {row.needsSetup ? <input type="hidden" name="mode" value="receive" /> : <label className="grid gap-1 text-xs">Movement<select name="mode" className="h-9 rounded border bg-white px-2 text-sm"><option value="receive">Add stock</option><option value="remove">Remove stock</option><option value="set">Set exact count</option></select></label>}
                <label className="grid gap-1 text-xs">{row.needsSetup ? "Opening stock quantity" : "Quantity"}<input name="quantity" type="number" min={row.needsSetup ? "1" : "0"} step="1" required className="h-9 rounded border bg-white px-2 text-sm" /></label>
                <label className="grid gap-1 text-xs">Reason<select name="reason" required className="h-9 rounded border bg-white px-2 text-sm"><option value="purchase">Stock received</option><option value="return">Customer return</option><option value="delivered">Stock delivered</option><option value="damage">Damaged stock</option><option value="loss">Lost stock</option><option value="correction">Count correction</option><option value="other">Other</option></select></label>
                <label className="grid gap-1 text-xs">Note (optional)<input name="note" maxLength={500} placeholder="Supplier, count reference…" className="h-9 rounded border bg-white px-2 text-sm" /></label>
                <button type="submit" className="h-9 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">Save movement</button>
              </form></details> : <Link href={`/admin/products/${row.productId}`} className="text-xs underline underline-offset-4">Enable tracking</Link>}</td>
            </tr>)}
            {!filtered.length && <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">{rows.length ? "No variants match these filters." : "No product variants yet. Add variants from a product editor to start managing stock."}</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="border-t px-4 py-3 text-xs text-muted-foreground">Showing {filtered.length} of {rows.length} variants.</p>
    </section>

    <section className="mt-8 overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="border-b p-4"><h2 className="font-semibold">Recent stock movements</h2><p className="mt-1 text-xs text-muted-foreground">A record of every manual inventory adjustment.</p></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-neutral-50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Product / variant</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">After</th><th className="px-4 py-3">Updated by</th></tr></thead><tbody className="divide-y">
        {movements.map((movement) => <tr key={movement.id}><td className="whitespace-nowrap px-4 py-3 text-xs text-muted-foreground">{new Date(movement.createdAt).toLocaleString()}</td><td className="px-4 py-3"><p className="font-medium">{movement.productName}</p><p className="text-xs text-muted-foreground">{movement.variantName}{movement.sku ? ` · ${movement.sku}` : ""}</p>{movement.note && <p className="mt-1 text-xs text-muted-foreground">{movement.note}</p>}</td><td className="px-4 py-3">{reasonLabels[movement.reason] ?? movement.reason}</td><td className={`px-4 py-3 font-semibold tabular-nums ${movement.quantityDelta > 0 ? "text-green-700" : "text-red-700"}`}>{movement.quantityDelta > 0 ? "+" : ""}{movement.quantityDelta}</td><td className="px-4 py-3 tabular-nums">{movement.quantityAfter}</td><td className="px-4 py-3 text-xs text-muted-foreground">{movement.changedBy}</td></tr>)}
        {!movements.length && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No stock adjustments have been recorded yet.</td></tr>}
      </tbody></table></div>
    </section>
  </>
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "gray" | "red" | "amber" | "green" | "blue" }) {
  const styles = { gray: "bg-neutral-100 text-neutral-700", red: "bg-red-100 text-red-800", amber: "bg-amber-100 text-amber-900", green: "bg-green-100 text-green-800", blue: "bg-blue-100 text-blue-800" }
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[tone]}`}>{children}</span>
}
