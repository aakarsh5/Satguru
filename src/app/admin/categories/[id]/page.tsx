import { notFound } from "next/navigation"
import { requireAdmin } from "@/lib/admin-auth"
import { categoryAdminRepository } from "@/lib/repositories"
import { CategoryForm } from "../category-form"

export default async function AdminCategoryEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()
  const { id } = await params
  const [category, categories] = await Promise.all([categoryAdminRepository.getById(id), categoryAdminRepository.list()])
  if (!category) notFound()
  return <main>
    <p className="text-sm text-muted-foreground">Catalog management / Categories</p>
    <h1 className="mt-1 text-2xl font-semibold">Edit {category.name}</h1>
    <p className="mt-1 mb-6 text-sm text-muted-foreground">Changes are reflected in the category page and navigation menu.</p>
    <CategoryForm category={category} categories={categories} categoryId={category.id} />
  </main>
}
