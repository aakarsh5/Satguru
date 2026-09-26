import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/admin-auth"
import { categoryAdminRepository, productAdminRepository } from "@/lib/repositories"
import type { Product } from "@/types"
import { ProductForm } from "./product-form"

export default async function AdminProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const categories = await categoryAdminRepository.list()
  const product: Product | null = id === "new" ? { id: crypto.randomUUID(), name: "", slug: "", description: "", body: "", status: "active", brandId: "", categoryIds: [], tags: [], images: [], variants: [], featured: false, createdAt: "", updatedAt: "" } : await productAdminRepository.getById(id)
  if (!product) notFound()
  return <main><h1 className="text-2xl font-semibold">{id === "new" ? "New product" : "Edit product"}</h1><ProductForm product={product} categories={categories} /></main>
}
