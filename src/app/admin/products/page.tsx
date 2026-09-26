import Link from "next/link"
import { requireAdmin } from "@/lib/admin-auth"
import { categoryAdminRepository, productAdminRepository } from "@/lib/repositories"
import { ProductsTable } from "./products-table"

export default async function AdminProductsPage() {
  await requireAdmin()
  const [products, categories] = await Promise.all([productAdminRepository.listAll(), categoryAdminRepository.list()])
  return <main>
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm text-muted-foreground">Catalog management</p><h1 className="mt-1 text-2xl font-semibold">Products</h1><p className="mt-1 text-sm text-muted-foreground">Review product details, visibility, categories, and media.</p></div><Link href="/admin/products/new" className="rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">Add product</Link></div>
    <ProductsTable products={products} categories={categories} />
  </main>
}
