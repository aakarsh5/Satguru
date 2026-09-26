"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { saveProductAction, uploadProductImageAction } from "../../actions"
import type { Category, Product, ProductImage, ProductVariant } from "@/types"

export function ProductForm({ product, categories }: { product: Product; categories: Category[] }) {
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [body, setBody] = useState(product.body ?? "")
  const [status, setStatus] = useState(product.status)
  const [categoryIds, setCategoryIds] = useState(product.categoryIds)
  const [featured, setFeatured] = useState(product.featured)
  const [images, setImages] = useState(product.images)
  const [variants, setVariants] = useState<ProductVariant[]>(product.variants ?? [])
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; previewUrl: string }[]>([])
  const selectedFilesRef = useRef(selectedFiles)
  const [uploadError, setUploadError] = useState("")
  const [uploading, startUpload] = useTransition()

  function addVariant() {
    const id = crypto.randomUUID()
    setVariants((current) => [...current, {
      id,
      productId: product.id,
      name: `Variant ${current.length + 1}`,
      sku: `SG-${id.replaceAll("-", "").slice(0, 12).toUpperCase()}`,
      inventory: { quantity: 0, trackInventory: true, allowBackorder: false },
      options: [],
      images: [],
    }])
  }

  function updateVariant(id: string, changes: Partial<ProductVariant>) {
    setVariants((current) => current.map((variant) => variant.id === id ? { ...variant, ...changes } : variant))
  }

  function updateOption(variantId: string, optionIndex: number, changes: { name?: string; value?: string }) {
    setVariants((current) => current.map((variant) => variant.id === variantId
      ? { ...variant, options: variant.options.map((option, index) => index === optionIndex ? { ...option, ...changes } : option) }
      : variant))
  }

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
      <input type="hidden" name="variants" value={JSON.stringify(variants)} />
      <div className="grid gap-4 rounded-lg border p-5 md:grid-cols-2">
        <label className="space-y-1 text-sm font-medium md:col-span-2">Name<input name="name" required value={name} onChange={(event) => setName(event.target.value)} className="h-10 w-full rounded-md border px-3 font-normal" /></label>
        <label className="space-y-1 text-sm font-medium md:col-span-2">Short description<textarea name="description" required value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="w-full rounded-md border p-3 font-normal" /></label>
        <label className="space-y-1 text-sm font-medium md:col-span-2">Full description<textarea name="body" value={body} onChange={(event) => setBody(event.target.value)} rows={6} className="w-full rounded-md border p-3 font-normal" /></label>
        <label className="space-y-1 text-sm font-medium md:col-span-2">Status<select name="status" value={status} onChange={(event) => setStatus(event.target.value as Product["status"])} className="h-10 w-full rounded-md border px-3 font-normal"><option value="draft">Draft</option><option value="active">Active</option><option value="archived">Archived</option></select></label>
        <fieldset className="space-y-2 md:col-span-2"><legend className="text-sm font-medium">Categories</legend><div className="grid gap-2 sm:grid-cols-2">{categories.map((category) => <label key={category.id} className="flex items-center gap-2 text-sm font-normal"><input name="categoryIds" type="checkbox" value={category.id} checked={categoryIds.includes(category.id)} onChange={(event) => setCategoryIds((current) => event.target.checked ? [...current, category.id] : current.filter((id) => id !== category.id))} />{category.name}</label>)}</div></fieldset>
        <label className="flex items-center gap-2 text-sm font-medium md:col-span-2"><input name="featured" type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />Featured product</label>
      </div>

      <section className="space-y-4 rounded-lg border p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold">Variants</h2><p className="text-sm text-muted-foreground">Add product options such as color, size, or pack. Each variant can have its own SKU and inventory.</p></div>
          <button type="button" onClick={addVariant} className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-neutral-50">Add variant</button>
        </div>
        {variants.length === 0 ? <p className="rounded-md border border-dashed p-5 text-center text-sm text-muted-foreground">No variants yet. Add a variant if this product comes in different options.</p> : <div className="space-y-4">
          {variants.map((variant, variantIndex) => <article key={variant.id} className="space-y-4 rounded-lg border bg-neutral-50/60 p-4">
            <div className="flex items-center justify-between gap-3"><h3 className="font-medium">Variant {variantIndex + 1}</h3><button type="button" onClick={() => setVariants((current) => current.filter((item) => item.id !== variant.id))} className="text-sm text-destructive hover:underline">Remove variant</button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium">Variant name<input value={variant.name} onChange={(event) => updateVariant(variant.id, { name: event.target.value })} placeholder="Blue / Medium" className="h-10 w-full rounded-md border bg-white px-3 font-normal" /></label>
              <label className="space-y-1 text-sm font-medium">SKU<input value={variant.sku} onChange={(event) => updateVariant(variant.id, { sku: event.target.value })} placeholder="Optional stock code" className="h-10 w-full rounded-md border bg-white px-3 font-normal" /></label>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between"><h4 className="text-sm font-medium">Options</h4><button type="button" onClick={() => updateVariant(variant.id, { options: [...variant.options, { name: "", value: "" }] })} className="text-sm font-medium underline underline-offset-4">Add option</button></div>
              {variant.options.length === 0 ? <p className="text-xs text-muted-foreground">Options describe what makes this variant different, such as Color: Blue.</p> : variant.options.map((option, optionIndex) => <div key={`${variant.id}-option-${optionIndex}`} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input aria-label={`Option ${optionIndex + 1} name`} value={option.name} onChange={(event) => updateOption(variant.id, optionIndex, { name: event.target.value })} placeholder="Option (e.g. Color)" className="h-10 rounded-md border bg-white px-3 text-sm" />
                <input aria-label={`Option ${optionIndex + 1} value`} value={option.value} onChange={(event) => updateOption(variant.id, optionIndex, { value: event.target.value })} placeholder="Value (e.g. Blue)" className="h-10 rounded-md border bg-white px-3 text-sm" />
                <button type="button" aria-label={`Remove option ${optionIndex + 1}`} onClick={() => updateVariant(variant.id, { options: variant.options.filter((_, index) => index !== optionIndex) })} className="rounded-md border px-3 text-sm text-destructive">Remove</button>
              </div>)}
            </div>
            <div className="grid gap-4 border-t pt-4 sm:grid-cols-2">
              <label className="space-y-1 text-sm font-medium">Inventory quantity<input type="number" min="0" value={variant.inventory.quantity} disabled={!variant.inventory.trackInventory} onChange={(event) => updateVariant(variant.id, { inventory: { ...variant.inventory, quantity: Math.max(0, Number(event.target.value) || 0) } })} className="h-10 w-full rounded-md border bg-white px-3 font-normal disabled:opacity-50" /></label>
              <div className="flex flex-col justify-center gap-2 text-sm"><label className="flex items-center gap-2"><input type="checkbox" checked={variant.inventory.trackInventory} onChange={(event) => updateVariant(variant.id, { inventory: { ...variant.inventory, trackInventory: event.target.checked } })} />Track inventory</label><label className="flex items-center gap-2"><input type="checkbox" checked={variant.inventory.allowBackorder} onChange={(event) => updateVariant(variant.id, { inventory: { ...variant.inventory, allowBackorder: event.target.checked } })} />Allow backorders</label></div>
            </div>
          </article>)}
        </div>}
      </section>

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

