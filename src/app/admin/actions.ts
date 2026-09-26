"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { authenticateAdmin, clearAdminSession, requireAdmin } from "@/lib/admin-auth"
import { productAdminRepository, categoryAdminRepository } from "@/lib/repositories"
import { deleteCatalogImage, reorderCatalogImages, uploadCatalogImage } from "@/lib/blob"
import type { Category, Product } from "@/types"
import { slugify } from "@/lib/utils"
import { createHash } from "node:crypto"
import { adjustVariantInventory, backfillMissingVariantSkus } from "@/lib/repositories/postgres-repository"

const productSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1),
  description: z.string(),
  body: z.string().optional(),
  status: z.enum(["draft", "active", "archived"]),
  brandId: z.string(),
  categoryIds: z.array(z.string()),
  tags: z.array(z.string()),
  images: z.array(z.object({ url: z.string().url().or(z.string().startsWith("/")), alt: z.string() })),
  variants: z.array(z.object({
    id: z.string(),
    productId: z.string(),
    sku: z.string(),
    name: z.string(),
    inventory: z.object({
      quantity: z.number(),
      trackInventory: z.boolean(),
      allowBackorder: z.boolean(),
    }),
    options: z.array(z.object({ name: z.string(), value: z.string() })),
    images: z.array(z.object({ url: z.string().url().or(z.string().startsWith("/")), alt: z.string() })),
    weight: z.number().optional(),
    dimensions: z.object({ length: z.number(), width: z.number(), height: z.number() }).optional(),
  })),
  featured: z.boolean(),
})

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
  const password = String(formData.get("password") ?? "")
  const result = await authenticateAdmin(email, password)
  if (!result.ok) {
    const showAuthDiagnostics = process.env.NODE_ENV === "development" || process.env.ADMIN_AUTH_DEBUG === "true"
    const error = showAuthDiagnostics ? result.reason : "invalid"
    redirect(`/admin/login?error=${error}`)
  }
  redirect("/admin")
}

export async function logoutAction() {
  await clearAdminSession()
  redirect("/admin/login")
}

export async function saveProductAction(formData: FormData) {
  await requireAdmin()
  const existing = JSON.parse(String(formData.get("existingProduct") ?? "{}")) as Product
  const categoryIds = formData.getAll("categoryIds").map(String)
  const routeId = String(formData.get("routeId") ?? "new")
  const productId = routeId === "new" ? crypto.randomUUID() : existing.id
  const name = String(formData.get("name") ?? "").trim()
  const baseSlug = slugify(name) || "product"
  const products = await productAdminRepository.listAll()
  const usedSlugs = new Set(products.filter((item) => item.id !== productId).map((item) => item.slug))
  let productSlug = baseSlug
  let suffix = 2
  while (usedSlugs.has(productSlug)) productSlug = `${baseSlug}-${suffix++}`
  const variants = JSON.parse(String(formData.get("variants") ?? JSON.stringify(existing.variants ?? []))) as Product["variants"]
  const usedSkus = new Set(products.flatMap((item) => item.variants ?? []).map((variant) => variant.sku.trim().toUpperCase()).filter(Boolean))
  const savedVariants = variants.map((variant, index) => {
    let sku = variant.sku.trim()
    if (!sku) {
      const productCode = createHash("sha256").update(productId).digest("hex").slice(0, 10).toUpperCase()
      const baseSku = `SG-${productCode}-${String(index + 1).padStart(3, "0")}`
      sku = baseSku
      let skuSuffix = 2
      while (usedSkus.has(sku.toUpperCase())) sku = `${baseSku}-${skuSuffix++}`
    }
    usedSkus.add(sku.toUpperCase())
    return { ...variant, sku, productId }
  })
  const raw = {
    ...existing,
    id: productId,
    name,
    description: String(formData.get("description") ?? ""),
    body: String(formData.get("body") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    categoryIds,
    featured: formData.get("featured") === "on",
    images: JSON.parse(String(formData.get("images") ?? "[]")),
    variants: savedVariants,
    slug: productSlug,
  }
  if (routeId !== "new" && routeId !== raw.id) throw new Error("Product id does not match the route")
  const product = { ...productSchema.parse(raw), slug: raw.slug } as Product
  const categories = await categoryAdminRepository.list()
  if (product.categoryIds.some((id) => !categories.some((category) => category.id === id))) throw new Error("Every product category must exist")
  const now = new Date().toISOString()
  const value = { ...product, slug: product.slug, updatedAt: now, createdAt: product.createdAt || now }
  if (await productAdminRepository.getById(product.id)) await productAdminRepository.update(product.id, value)
  else await productAdminRepository.create(value)
  revalidatePath("/shop")
  revalidatePath("/")
  redirect("/admin/products")
}

export async function deleteProductAction(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  const product = await productAdminRepository.getById(id)
  if (!product) throw new Error("Product not found")
  const imageUrls = [
    ...product.images.map((image) => image.url),
    ...product.variants.flatMap((variant) => (variant.images ?? []).map((image) => image.url)),
  ]
  await productAdminRepository.delete(id)
  await Promise.allSettled(imageUrls.filter((url) => url.startsWith("https://") || url.startsWith("/uploads/catalog/")).map((url) => deleteCatalogImage(url)))
  revalidatePath("/shop")
  revalidatePath("/")
  revalidatePath("/admin/products")
  revalidatePath("/admin/categories")
  redirect("/admin/products")
}

export async function adjustInventoryAction(formData: FormData) {
  const admin = await requireAdmin()
  const productId = String(formData.get("productId") ?? "")
  const variantId = String(formData.get("variantId") ?? "")
  const mode = String(formData.get("mode") ?? "")
  const quantity = Number(formData.get("quantity"))
  const reason = String(formData.get("reason") ?? "")
  const note = String(formData.get("note") ?? "").trim().slice(0, 500)
  if (!productId || !variantId) throw new Error("Choose a product variant")
  if (!(mode === "receive" || mode === "remove" || mode === "set")) throw new Error("Choose a valid stock adjustment")
  if (!Number.isSafeInteger(quantity) || quantity < 0 || (mode !== "set" && quantity === 0)) throw new Error("Enter a valid whole-number quantity")
  if (mode === "set" && !reason) throw new Error("Choose a reason for setting the stock count")
  const allowedReasons = ["purchase", "return", "delivered", "damage", "loss", "correction", "other"]
  if (!allowedReasons.includes(reason)) throw new Error("Choose a valid stock adjustment reason")
  await adjustVariantInventory({ productId, variantId, mode, quantity, reason, note, changedBy: admin.email })
  revalidatePath("/admin/inventory")
  revalidatePath("/shop")
  revalidatePath("/")
  redirect("/admin/inventory?updated=1")
}

export async function generateMissingSkusAction() {
  await requireAdmin()
  const count = await backfillMissingVariantSkus()
  revalidatePath("/admin/inventory")
  revalidatePath("/admin/products")
  redirect(`/admin/inventory?skusUpdated=${count}`)
}

export async function bulkDeleteProductsAction(formData: FormData) {
  await requireAdmin()
  const ids = [...new Set(JSON.parse(String(formData.get("ids") || "[]")) as string[])]
  if (ids.length === 0 || ids.length > 500) throw new Error("Select between 1 and 500 products to delete")
  const products = await Promise.all(ids.map((id) => productAdminRepository.getById(id)))
  for (const product of products) {
    if (!product) continue
    const imageUrls = [...product.images, ...product.variants.flatMap((variant) => variant.images ?? [])].map((image) => image.url)
    await productAdminRepository.delete(product.id)
    await Promise.allSettled(imageUrls.filter((url) => url.startsWith("https://") || url.startsWith("/uploads/catalog/")).map((url) => deleteCatalogImage(url)))
  }
  revalidatePath("/shop")
  revalidatePath("/")
  revalidatePath("/admin/products")
  revalidatePath("/admin/categories")
  redirect("/admin/products")
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin()
  const existing = JSON.parse(String(formData.get("existingCategory") || "{}")) as Partial<Category>
  const category = z.object({ id: z.string().min(1), name: z.string().trim().min(1), description: z.string().default(""), parentId: z.string().optional(), order: z.coerce.number().int().default(0), image: z.object({ url: z.string().url().or(z.string().startsWith("/")), alt: z.string() }).optional() }).parse({
    ...existing,
    id: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    parentId: formData.get("parentId") || undefined,
    order: formData.get("order") ?? 0,
    image: JSON.parse(String(formData.get("image") || "null")) ?? undefined,
  }) as Category
  const categories = await categoryAdminRepository.list()
  if (category.parentId === category.id || (category.parentId && !categories.some((item) => item.id === category.parentId))) throw new Error("Invalid category parent")
  let ancestorId = category.parentId
  const visitedAncestors = new Set<string>()
  while (ancestorId) {
    if (ancestorId === category.id || visitedAncestors.has(ancestorId)) throw new Error("A category cannot be nested inside itself")
    visitedAncestors.add(ancestorId)
    ancestorId = categories.find((item) => item.id === ancestorId)?.parentId
  }
  const baseSlug = slugify(category.name) || "category"
  const usedSlugs = new Set(categories.filter((item) => item.id !== category.id).map((item) => item.slug))
  let slug = baseSlug
  let suffix = 2
  while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`
  const value = { ...category, slug, order: Number(category.order) || 0 }
  const previous = await categoryAdminRepository.getById(category.id)
  if (previous) await categoryAdminRepository.update(category.id, value)
  else await categoryAdminRepository.create(value)
  if (previous?.image?.url && previous.image.url !== value.image?.url && (previous.image.url.startsWith("https://") || previous.image.url.startsWith("/uploads/catalog/"))) {
    await deleteCatalogImage(previous.image.url).catch(() => console.warn("Could not remove replaced category image"))
  }
  revalidatePath("/shop")
  revalidatePath("/")
  revalidatePath(`/${value.slug}`)
  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  if ((await categoryAdminRepository.getChildren(id)).length) throw new Error("Delete child categories first")
  if (await categoryAdminRepository.hasProducts(id)) throw new Error("Remove products from this category first")
  const category = await categoryAdminRepository.getById(id)
  await categoryAdminRepository.delete(id)
  if (category?.image?.url && (category.image.url.startsWith("https://") || category.image.url.startsWith("/uploads/catalog/"))) await deleteCatalogImage(category.image.url).catch(() => console.warn("Could not remove deleted category image"))
  revalidatePath("/shop")
  revalidatePath("/")
  revalidatePath("/admin/categories")
  redirect("/admin/categories")
}

export async function bulkDeleteCategoriesAction(formData: FormData) {
  await requireAdmin()
  const ids = [...new Set(JSON.parse(String(formData.get("ids") || "[]")) as string[])]
  if (ids.length === 0 || ids.length > 500) throw new Error("Select between 1 and 500 categories to delete")
  const selected = new Set(ids)
  const [categories, products] = await Promise.all([categoryAdminRepository.list(), productAdminRepository.listAll()])
  const blocked = categories.filter((category) => selected.has(category.id)).filter((category) =>
    products.some((product) => product.categoryIds.includes(category.id)) ||
    categories.some((child) => child.parentId === category.id && !selected.has(child.id))
  )
  if (blocked.length) redirect(`/admin/categories?error=category-dependencies&blocked=${blocked.length}`)
  const depth = (category: Category) => {
    let value = 0
    let parentId = category.parentId
    while (parentId) {
      value += 1
      parentId = categories.find((item) => item.id === parentId)?.parentId
      if (value > categories.length) break
    }
    return value
  }
  const deletable = categories.filter((category) => selected.has(category.id)).sort((a, b) => depth(b) - depth(a))
  for (const category of deletable) {
    await categoryAdminRepository.delete(category.id)
    if (category.image?.url && (category.image.url.startsWith("https://") || category.image.url.startsWith("/uploads/catalog/"))) await deleteCatalogImage(category.image.url).catch(() => console.warn("Could not remove deleted category image"))
  }
  revalidatePath("/shop")
  revalidatePath("/")
  revalidatePath("/admin/categories")
  redirect("/admin/categories?deleted=" + deletable.length)
}

export async function uploadProductImageAction(formData: FormData) {
  await requireAdmin()
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) throw new Error("An image file is required")
  return uploadCatalogImage(file, `catalog/${String(formData.get("productId") || "new")}/${file.name}`)
}

export async function uploadCategoryImageAction(formData: FormData) {
  await requireAdmin()
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) throw new Error("An image file is required")
  return uploadCatalogImage(file, `categories/${String(formData.get("categoryId") || "new")}/${file.name}`)
}

export async function deleteProductImageAction(formData: FormData) {
  await requireAdmin()
  const productId = String(formData.get("productId") || "")
  const url = String(formData.get("url") || "")
  const product = await productAdminRepository.getById(productId)
  if (!product) throw new Error("Product not found")
  const nextImages = product.images.filter((image) => image.url !== url)
  await productAdminRepository.update(productId, { ...product, images: nextImages, updatedAt: new Date().toISOString() })
  if (url.startsWith("https://") || url.startsWith("/uploads/catalog/")) await deleteCatalogImage(url)
}

export async function reorderProductImagesAction(formData: FormData) {
  await requireAdmin()
  const images = JSON.parse(String(formData.get("images") || "[]")) as Product["images"]
  const productId = String(formData.get("productId") || "")
  const product = await productAdminRepository.getById(productId)
  if (!product) throw new Error("Product not found")
  const reordered = reorderCatalogImages(images, Number(formData.get("from")), Number(formData.get("to")))
  await productAdminRepository.update(productId, { ...product, images: reordered, updatedAt: new Date().toISOString() })
  return reordered
}

