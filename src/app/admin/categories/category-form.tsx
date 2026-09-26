"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import type { Category, ProductImage } from "@/types"
import { saveCategoryAction, uploadCategoryImageAction } from "../actions"

export function CategoryForm({ category, categories, categoryId }: { category?: Category; categories: Category[]; categoryId: string }) {
  const [name, setName] = useState(category?.name ?? "")
  const [description, setDescription] = useState(category?.description ?? "")
  const [parentId, setParentId] = useState(category?.parentId ?? "")
  const [order, setOrder] = useState(category?.order ?? 0)
  const [image, setImage] = useState<ProductImage | undefined>(category?.image)
  const [preview, setPreview] = useState("")
  const [uploadError, setUploadError] = useState("")
  const [uploading, startUpload] = useTransition()
  const previewRef = useRef("")

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
  }, [])

  function chooseImage(file?: File) {
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setUploadError("Choose an image file.")
      return
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    const localPreview = URL.createObjectURL(file)
    previewRef.current = localPreview
    setPreview(localPreview)
    setUploadError("")
    startUpload(async () => {
      try {
        const data = new FormData()
        data.set("categoryId", categoryId)
        data.set("file", file)
        const uploaded = await uploadCategoryImageAction(data)
        setImage(uploaded)
        URL.revokeObjectURL(localPreview)
        if (previewRef.current === localPreview) previewRef.current = ""
        setPreview("")
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Image upload failed")
      }
    })
  }

  function removeImage() {
    setImage(undefined)
    setPreview("")
    if (previewRef.current) URL.revokeObjectURL(previewRef.current)
    previewRef.current = ""
  }

  return (
    <form action={saveCategoryAction} className="space-y-6">
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="existingCategory" value={JSON.stringify(category ?? {})} />
      <input type="hidden" name="image" value={JSON.stringify(image ?? null)} />
      <section className="grid gap-5 rounded-xl border bg-white p-5 shadow-sm md:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium">Category name
          <input name="name" required value={name} onChange={(event) => setName(event.target.value)} placeholder="For example, Kitchenware" className="h-10 w-full rounded-md border px-3 font-normal" />
        </label>
        <label className="space-y-1.5 text-sm font-medium">Parent category
          <select name="parentId" value={parentId} onChange={(event) => setParentId(event.target.value)} className="h-10 w-full rounded-md border px-3 font-normal">
            <option value="">Top-level category</option>
            {categories.filter((item) => item.id !== categoryId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium md:col-span-2">Description
          <textarea name="description" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full rounded-md border p-3 font-normal" placeholder="A short description shown on the category page." />
        </label>
        <label className="space-y-1.5 text-sm font-medium">Display order
          <input name="order" type="number" value={order} onChange={(event) => setOrder(Number(event.target.value))} className="h-10 w-full rounded-md border px-3 font-normal" />
        </label>
        <div className="space-y-2 md:col-span-2">
          <p className="text-sm font-medium">Category image</p>
          <p className="text-xs text-muted-foreground">Upload a clear landscape or square image. It appears on the home page, category page, and navigation menu.</p>
          {image || preview ? <div className="flex flex-wrap items-center gap-4 rounded-lg border p-3">
            <img src={preview || image?.url} alt={image?.alt ?? "Selected category image"} className="h-28 w-40 rounded-md bg-neutral-100 object-cover" />
            {uploading && <span className="text-sm text-muted-foreground">Uploading image…</span>}
            <button type="button" onClick={removeImage} disabled={uploading} className="rounded-md border px-3 py-2 text-sm text-destructive disabled:opacity-50">Remove image</button>
          </div> : null}
          <label className="inline-flex cursor-pointer items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50">{uploading ? "Uploading…" : image ? "Replace image" : "Choose image"}<input type="file" accept="image/*" disabled={uploading} onChange={(event) => { chooseImage(event.currentTarget.files?.[0]); event.currentTarget.value = "" }} className="sr-only" /></label>
          {uploadError && <p role="alert" className="text-sm text-destructive">{uploadError}</p>}
        </div>
      </section>
      <button type="submit" disabled={uploading} className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50">{category ? "Save category" : "Create category"}</button>
    </form>
  )
}
