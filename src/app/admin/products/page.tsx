import Link from "next/link"
import { requireAdmin } from "@/lib/admin-auth"
import { productAdminRepository } from "@/lib/repositories"
import { deleteProductAction } from "../actions"

export default async function AdminProductsPage() {
  await requireAdmin()
  const products = await productAdminRepository.listAll()
  return <main><div className="flex items-center justify-between"><h1 className="text-2xl font-semibold">Products</h1><Link href="/admin/products/new" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">New product</Link></div><div className="mt-6 divide-y rounded-lg border">{products.map((product) => <div key={product.id} className="flex items-center justify-between gap-4 p-4"><div><Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">{product.name}</Link><p className="text-sm text-muted-foreground">{product.status} · {product.slug}</p></div><form action={deleteProductAction}><input type="hidden" name="id" value={product.id} /><button className="text-sm text-destructive" type="submit">Delete</button></form></div>)}</div></main>
}
