"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { authenticateAdmin, clearAdminSession, requireAdmin } from "@/lib/admin-auth"
import { productAdminRepository, categoryAdminRepository } from "@/lib/repositories"
import { deleteCatalogImage, reorderCatalogImages, uploadCatalogImage } from "@/lib/blob"
import type { Category, Product } from "@/types"
import { slugify } from "@/lib/utils"

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
  if (!(await authenticateAdmin(email, password))) redirect("/admin/login?error=invalid")
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
  await Promise.all(imageUrls.filter((url) => url.startsWith("https://") || url.startsWith("/uploads/catalog/")).map((url) => deleteCatalogImage(url)))
  await productAdminRepository.delete(id)
  revalidatePath("/shop")
  redirect("/admin/products")
}

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin()
  const category = z.object({ id: z.string().min(1), name: z.string().trim().min(1), description: z.string().default(""), parentId: z.string().optional(), order: z.coerce.number().int().default(0), image: z.any().optional() }).parse({
    id: formData.get("categoryId"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    parentId: formData.get("parentId") || undefined,
    order: formData.get("order") ?? 0,
  }) as Category
  const categories = await categoryAdminRepository.list()
  if (category.parentId === category.id || (category.parentId && !categories.some((item) => item.id === category.parentId))) throw new Error("Invalid category parent")
  const value = { ...category, slug: slugify(category.name), order: Number(category.order) || 0 }
  if (await categoryAdminRepository.getById(category.id)) await categoryAdminRepository.update(category.id, value)
  else await categoryAdminRepository.create(value)
  revalidatePath("/shop")
  revalidatePath("/")
  redirect("/admin/categories")
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin()
  const id = String(formData.get("id") ?? "")
  if ((await categoryAdminRepository.getChildren(id)).length) throw new Error("Delete child categories first")
  if (await categoryAdminRepository.hasProducts(id)) throw new Error("Remove products from this category first")
  await categoryAdminRepository.delete(id)
  revalidatePath("/shop")
  redirect("/admin/categories")
}

export async function uploadProductImageAction(formData: FormData) {
  await requireAdmin()
  const file = formData.get("file")
  if (!(file instanceof File) || file.size === 0) throw new Error("An image file is required")
  return uploadCatalogImage(file, `catalog/${String(formData.get("productId") || "new")}/${file.name}`)
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

