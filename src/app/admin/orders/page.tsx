import { requireAdmin } from "@/lib/admin-auth"
import { listCustomerOrders } from "@/lib/orders"
import { updateOrderStatusAction } from "@/app/admin/actions"

const statusLabels = { new: "New", confirmed: "Confirmed", fulfilled: "Fulfilled", cancelled: "Cancelled" }
const statusTone = { new: "bg-blue-50 text-blue-800", confirmed: "bg-amber-50 text-amber-800", fulfilled: "bg-emerald-50 text-emerald-800", cancelled: "bg-neutral-100 text-neutral-700" }

export default async function AdminOrdersPage() {
  await requireAdmin()
  const orders = await listCustomerOrders()
  return <main>
    <div className="mb-6"><p className="text-sm text-muted-foreground">Customer requests</p><h1 className="mt-1 text-2xl font-semibold">Orders</h1><p className="mt-1 text-sm text-muted-foreground">Review guest orders and update their progress. Contact the customer to confirm product availability.</p></div>
    {orders.length === 0 ? <div className="rounded-xl border border-dashed p-10 text-center"><p className="font-medium">No orders yet</p><p className="mt-1 text-sm text-muted-foreground">Orders placed by customers will appear here.</p></div> : <div className="space-y-4">
      {orders.map((order) => <article key={order.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <header className="flex flex-wrap items-start justify-between gap-4 border-b bg-neutral-50/70 px-5 py-4">
          <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold">{order.shopName}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[order.status]}`}>{statusLabels[order.status]}</span></div><p className="mt-1 text-xs text-muted-foreground">Order {order.id.slice(0, 8).toUpperCase()} · {new Date(order.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div>
          <form action={updateOrderStatusAction} className="flex items-center gap-2"><input type="hidden" name="id" value={order.id}/><label htmlFor={`status-${order.id}`} className="sr-only">Order status</label><select id={`status-${order.id}`} name="status" defaultValue={order.status} className="h-9 rounded-md border bg-white px-2 text-sm">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><button className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background transition-opacity hover:opacity-80" type="submit">Update</button></form>
        </header>
        <div className="grid gap-6 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section><h3 className="text-sm font-semibold">Items ({order.items.reduce((count, item) => count + item.quantity, 0)} units)</h3><div className="mt-3 divide-y">{order.items.map((item, index) => <div key={`${item.productId}:${item.variantId}:${index}`} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"><div><p className="font-medium">{item.productName}</p><p className="mt-0.5 text-sm text-muted-foreground">{item.variantName} · SKU {item.sku || "—"}</p></div><span className="whitespace-nowrap text-sm font-semibold tabular-nums">× {item.quantity}</span></div>)}</div>{order.notes && <div className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm"><span className="font-medium">Customer note: </span>{order.notes}</div>}</section>
          <section className="border-t pt-4 text-sm lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"><h3 className="font-semibold">Delivery details</h3><a href={`tel:${order.phone.replace(/[^+\d]/g, "")}`} className="mt-2 inline-block font-medium text-emerald-800 underline underline-offset-4">{order.phone}</a><p className="mt-2 whitespace-pre-wrap leading-6 text-muted-foreground">{order.address}</p></section>
        </div>
      </article>)}
    </div>}
  </main>
}
