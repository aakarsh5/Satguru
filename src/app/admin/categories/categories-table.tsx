"use client"

import { useState } from "react"
import Link from "next/link"
import type { Category } from "@/types"
import { CategoryArtwork } from "@/components/categories/category-artwork"
import { bulkDeleteCategoriesAction, deleteCategoryAction } from "../actions"

export function CategoriesTable({ categories, productCounts, error, deleted }: { categories: Category[]; productCounts: Record<string, number>; error?: string; deleted?: string }) {
  const [selected, setSelected] = useState<string[]>([])
  const allSelected = categories.length > 0 && selected.length === categories.length
  return (
    <form action={bulkDeleteCategoriesAction} onSubmit={(event) => { if (!window.confirm(`Delete ${selected.length} selected categor${selected.length === 1 ? "y" : "ies"}? Categories with products or unselected subcategories cannot be deleted.`)) event.preventDefault() }}>
      <input type="hidden" name="ids" value={JSON.stringify(selected)} />
      {error === "category-dependencies" && <p role="alert" className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Some selected categories have products or subcategories outside your selection. Move those products or select the child categories too, then try again.</p>}
      {deleted && <p className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-900">Deleted {deleted} categor{deleted === "1" ? "y" : "ies"}.</p>}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">{categories.length} {categories.length === 1 ? "category" : "categories"}</p><button type="submit" disabled={!selected.length} className="rounded-md border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive disabled:cursor-not-allowed disabled:opacity-40">Delete selected ({selected.length})</button></div>
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm"><table className="w-full min-w-[780px] text-left text-sm">
        <thead className="bg-neutral-50 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="w-12 px-4 py-3"><input aria-label="Select all categories" type="checkbox" checked={allSelected} onChange={(event) => setSelected(event.target.checked ? categories.map((category) => category.id) : [])} /></th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Parent</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Order</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
        <tbody className="divide-y">{categories.map((category) => <tr key={category.id} className="hover:bg-neutral-50/70">
          <td className="px-4 py-3"><input aria-label={`Select ${category.name}`} type="checkbox" checked={selected.includes(category.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, category.id] : current.filter((id) => id !== category.id))} /></td>
          <td className="px-4 py-3"><div className="flex min-w-56 items-center gap-3"><CategoryArtwork category={category} className="h-12 w-16 shrink-0" /><div className="min-w-0"><Link href={`/admin/categories/${category.id}`} className="font-medium hover:underline">{category.name}</Link><p className="max-w-56 truncate text-xs text-muted-foreground">/{category.slug}</p></div></div></td>
          <td className="px-4 py-3 text-muted-foreground">{categories.find((item) => item.id === category.parentId)?.name ?? "Top level"}</td><td className="px-4 py-3">{productCounts[category.id] ?? 0}</td><td className="px-4 py-3">{category.order}</td>
          <td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><Link href={`/admin/categories/${category.id}`} className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-neutral-50">Edit</Link><button formAction={deleteCategoryAction} name="id" value={category.id} formNoValidate onClick={(event) => { if (!window.confirm(`Delete “${category.name}”? Categories with products or subcategories cannot be deleted.`)) event.preventDefault() }} className="rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5">Delete</button></div></td>
        </tr>)}
        {!categories.length && <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No categories yet. Create a category to organize your products.</td></tr>}</tbody>
      </table></div>
    </form>
  )
}
