import Link from "next/link"
import { requireAdmin } from "@/lib/admin-auth"
import { productAdminRepository } from "@/lib/repositories"
import { listCustomerOrders } from "@/lib/orders"

export default async function AdminDashboardPage() {
  await requireAdmin()
  const [products, orders] = await Promise.all([productAdminRepository.listAll(), listCustomerOrders()])
  const newOrders = orders.filter((order) => order.status === "new").length
  return <main><h1 className="text-3xl font-semibold">Dashboard</h1><p className="mt-2 text-muted-foreground">Manage products, stock, and customer orders.</p><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Link href="/admin/products" className="rounded-lg border p-6 hover:bg-muted/50"><strong className="text-2xl">{products.length}</strong><span className="mt-2 block text-sm">Products</span></Link><Link href="/admin/orders" className="rounded-lg border p-6 hover:bg-muted/50"><strong className="text-2xl">{newOrders}</strong><span className="mt-2 block text-sm">New orders · {orders.length} total</span></Link><Link href="/admin/inventory" className="rounded-lg border p-6 hover:bg-muted/50"><span className="text-sm">Manage</span><span className="mt-2 block text-2xl">Inventory & stock</span></Link><Link href="/admin/categories" className="rounded-lg border p-6 hover:bg-muted/50"><span className="text-sm">Manage</span><span className="mt-2 block text-2xl">Categories</span></Link></div></main>
}
