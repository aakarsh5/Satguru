import { requireAdmin } from "@/lib/admin-auth"
import { categoryAdminRepository, productAdminRepository } from "@/lib/repositories"
import { CategoryForm } from "./category-form"
import { CategoriesTable } from "./categories-table"

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ error?: string; deleted?: string }> }) {
  await requireAdmin()
  const [{ error, deleted }, categories, products] = await Promise.all([searchParams, categoryAdminRepository.list(), productAdminRepository.listAll()])
  const productCounts = Object.fromEntries(categories.map((category) => [category.id, products.filter((product) => product.categoryIds.includes(category.id)).length]))
  return <main>
    <div className="mb-6"><p className="text-sm text-muted-foreground">Catalog management</p><h1 className="mt-1 text-2xl font-semibold">Categories</h1><p className="mt-1 text-sm text-muted-foreground">Organize products, add category imagery, and control how categories appear across the store.</p></div>
    <details className="mb-8 rounded-xl border bg-white shadow-sm" open={categories.length === 0}>
      <summary className="cursor-pointer list-none px-5 py-4 font-medium">Create a category</summary>
      <div className="border-t p-5"><CategoryForm categories={categories} categoryId={crypto.randomUUID()} /></div>
    </details>
    <CategoriesTable categories={categories} productCounts={productCounts} error={error} deleted={deleted} />
  </main>
}
