"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { saveProductAction, uploadProductImageAction } from "../../actions"
import type { Category, Product, ProductImage } from "@/types"

export function ProductForm({ product, categories }: { product: Product; categories: Category[] }) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [body, setBody] = useState(product.body ?? "")
  const [status, setStatus] = useState(product.status)
  const [categoryIds, setCategoryIds] = useState(product.categoryIds)
  const [featured, setFeatured] = useState(product.featured)
  const [images, setImages] = useState(product.images)
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; previewUrl: string }[]>([])
  const selectedFilesRef = useRef(selectedFiles)
  const [uploadError, setUploadError] = useState("")
  const [uploading, startUpload] = useTransition()

  function uploadImages(files: FileList | null) {
    if (!files?.length) return
    const nextFiles = Array.from(files).map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
    setSelectedFiles((current) => {
      const next = [...current, ...nextFiles]
      selectedFilesRef.current = next
      return next
    })
    setUploadError("")
    startUpload(async () => {
      try {
        const uploaded: ProductImage[] = []
        for (const { file } of nextFiles) {
          const formData = new FormData()
          formData.set("productId", product.id)
          formData.set("file", file)
          uploaded.push(await uploadProductImageAction(formData))
        }
        setImages((current) => [...current, ...uploaded])
        setSelectedFiles((current) => {
          const next = current.filter(({ previewUrl }) => !nextFiles.some((file) => file.previewUrl === previewUrl))
          nextFiles.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl))
          selectedFilesRef.current = next
          return next
        })
      } catch (error) {
        setUploadError(error instanceof Error ? error.message : "Image upload failed")
      }
    })
  }

  useEffect(() => () => {
    selectedFilesRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl))
  }, [])

  return (
    <form action={saveProductAction} className="mt-6 space-y-6">
      <input type="hidden" name="routeId" value={product.id} />
      <input type="hidden" name="existingProduct" value={JSON.stringify(product)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <div className="grid gap-4 rounded-lg border p-5 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium md:col-span-2">Name<input name="name" required value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full rounded-md border px-3 font-normal" /></label>
        <label className="space-y-1 text-sm font-medium md:col-span-2">Short description<textarea name="description" required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full rounded-md border p-3 font-normal" /></label>
        <label className="space-y-1 text-sm font-medium md:col-span-2">Full description<textarea name="body" value={body} onChange={(event) => setBody(event.target.value)} rows={6} className="w-full rounded-md border p-3 font-normal" /></label>
        <label className="space-y-1 text-sm font-medium md:col-span-2">Status<select name="status" value={status} onChange={(event) => setStatus(event.target.value as Product["status"])} className="h-10 w-full rounded-md border px-3 font-normal"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
        <fieldset className="space-y-2 md:col-span-2"><legend className="text-sm font-medium">Categories</legend><div className="grid gap-2 sm:grid-cols-2">{categories.map((category) => <label key={category.id} className="flex items-center gap-2 text-sm font-normal"><input name="categoryIds" type="checkbox" value={category.id} checked={categoryIds.includes(category.id)} onChange={(event) => setCategoryIds((current) => event.target.checked ? [...current, category.id] : current.filter((id) => id !== category.id))} />{category.name}</label>)}</div></fieldset>
        <label className="flex items-center gap-2 text-sm font-medium md:col-span-2"><input name="featured" type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />Featured product</label>
      </div>

      <section className="rounded-lg border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Product images</h2><p className="text-sm text-muted-foreground">Choose images to preview them here before they are saved to your product.</p></div><label className="cursor-pointer rounded-md border px-3 py-2 text-sm">{uploading ? "Uploading..." : "Choose images"}<input type="file" accept="image/*" multiple disabled={uploading} onChange={(event) => { uploadImages(event.target.files); event.currentTarget.value = "" }} className="sr-only" /></label></div>
        {uploadError && <p role="alert" className="mt-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{uploadError}</p>}
        {selectedFiles.length > 0 && <div className="mt-4 rounded-md border border-dashed p-3"><h3 className="text-sm font-medium">Selected images</h3><p className="text-xs text-muted-foreground">These previews show the files selected on your device. They are removed after a successful upload.</p><div className="mt-3 grid gap-3 sm:grid-cols-3">{selectedFiles.map(({ file, previewUrl }) => <div key={previewUrl} className="overflow-hidden rounded-md border"><img src={previewUrl} alt={`Selected ${file.name}`} className="aspect-square w-full object-cover" /><p className="truncate p-2 text-xs" title={file.name}>{file.name}</p></div>)}</div></div>}
        {images.length > 0 && <div className="mt-4 grid gap-3 sm:grid-cols-3">{images.map((image, index) => <div key={`${image.url}-${index}`} className="overflow-hidden rounded-md border"><img src={image.url} alt={image.alt} className="aspect-square w-full object-cover" /><div className="flex items-center justify-between gap-2 p-2"><input aria-label={`Alt text for image ${index + 1}`} value={image.alt} onChange={(event) => setImages((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, alt: event.target.value } : item))} className="min-w-0 flex-1 rounded border px-2 py-1 text-xs" /><button type="button" onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="text-xs text-destructive">Remove</button></div></div>)}</div>}
      </section>

      <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">Save product</button>
    </form>
  )
}

