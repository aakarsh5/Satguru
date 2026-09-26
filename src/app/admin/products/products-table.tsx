"use client"

import { useState } from "react"
import Link from "next/link"
import type { Category, Product } from "@/types"
import { ProductImage } from "@/components/ui/product-image"
import { bulkDeleteProductsAction, deleteProductAction } from "../actions"

export function ProductsTable({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [selected, setSelected] = useState<string[]>([])
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))
  const allSelected = products.length > 0 && selected.length === products.length

  return (
    <form action={bulkDeleteProductsAction} onSubmit={(event) => { if (!window.confirm(`Delete ${selected.length} selected product${selected.length === 1 ? "" : "s"}? This cannot be undone.`)) event.preventDefault() }}>
      <input type="hidden" name="ids" value={JSON.stringify(selected)} />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{products.length} {products.length === 1 ? "product" : "products"}</p>
        <button type="submit" disabled={!selected.length} className="rounded-md border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive disabled:cursor-not-allowed disabled:opacity-40">Delete selected ({selected.length})</button>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-muted-foreground"><tr>
            <th className="w-12 px-4 py-3"><input aria-label="Select all products" type="checkbox" checked={allSelected} onChange={(event) => setSelected(event.target.checked ? products.map((product) => product.id) : [])} /></th>
            <th className="px-4 py-3">Product</th><th className="px-4 py-3">Categories</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Variants</th><th className="px-4 py-3">Images</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3 text-right">Actions</th>
          </tr></thead>
          <tbody className="divide-y">
            {products.map((product) => <tr key={product.id} className="hover:bg-neutral-50/70">
              <td className="px-4 py-3"><input aria-label={`Select ${product.name}`} type="checkbox" checked={selected.includes(product.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, product.id] : current.filter((id) => id !== product.id))} /></td>
              <td className="px-4 py-3"><div className="flex min-w-56 items-center gap-3"><div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-neutral-100"><ProductImage src={product.images[0]?.url} alt={product.images[0]?.alt ?? product.name} sizes="48px" /></div><div className="min-w-0"><Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">{product.name || "Untitled product"}</Link><p className="max-w-56 truncate text-xs text-muted-foreground">/{product.slug}</p></div></div></td>
              <td className="max-w-56 px-4 py-3 text-muted-foreground">{product.categoryIds.map((id) => categoryNames.get(id)).filter(Boolean).join(", ") || "Uncategorized"}</td>
              <td className="px-4 py-3"><span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs capitalize">{product.status}</span></td>
              <td className="px-4 py-3">{product.variants.length}</td><td className="px-4 py-3">{product.images.length}</td>
              <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{product.updatedAt && !Number.isNaN(Date.parse(product.updatedAt)) ? new Date(product.updatedAt).toISOString().slice(0, 10) : "—"}</td>
              <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><Link href={`/admin/products/${product.id}`} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-neutral-50">Edit</Link><button formAction={deleteProductAction} name="id" value={product.id} formNoValidate onClick={(event) => { if (!window.confirm(`Delete “${product.name}”? This cannot be undone.`)) event.preventDefault() }} className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5">Delete</button></div></td>
            </tr>)}
            {!products.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No products yet. Add your first product to get started.</td></tr>}
          </tbody>
        </table>
      </div>
    </form>
  )
}
