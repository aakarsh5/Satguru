import "server-only"

import { requireDatabase } from "@/lib/db"
import { productAdminRepository } from "@/lib/repositories"

export type SubmittedOrderLine = { productId: string; variantId: string; quantity: number }
export type OrderStatus = "new" | "confirmed" | "fulfilled" | "cancelled"

export type CustomerOrder = {
  id: string
  shopName: string
  phone: string
  address: string
  notes: string
  items: Array<{ productId: string; productName: string; slug: string; variantId: string; variantName: string; sku: string; quantity: number; imageUrl: string }>
  status: OrderStatus
  createdAt: string
}

export async function createCustomerOrder(input: {
  shopName: string
  phone: string
  address: string
  notes: string
  lines: SubmittedOrderLine[]
}) {
  if (input.lines.length < 1 || input.lines.length > 50) throw new Error("Your cart must contain between 1 and 50 product options.")
  const aggregated = new Map<string, number>()
  for (const line of input.lines) {
    if (!line.productId || !line.variantId || !Number.isSafeInteger(line.quantity) || line.quantity < 1 || line.quantity > 100000) {
      throw new Error("One of the quantities is invalid. Please review your cart.")
    }
    const key = `${line.productId}\u0000${line.variantId}`
    aggregated.set(key, (aggregated.get(key) ?? 0) + line.quantity)
  }

  const unique = [...aggregated.entries()].map(([key, quantity]) => {
    const [productId, variantId] = key.split("\u0000")
    if (quantity > 100000) throw new Error("A product quantity is too large.")
    return { productId, variantId, quantity }
  })
  const products = await Promise.all(unique.map(({ productId }) => productAdminRepository.getById(productId)))
  const items = unique.map((line, index) => {
    const product = products[index]
    if (!product || product.status !== "active") throw new Error("A product in your cart is no longer available. Refresh the catalog and try again.")
    const variant = product.variants.find((item) => item.id === line.variantId)
    const defaultVariant = product.variants.length === 0 && line.variantId === "__default__"
    if (!variant && !defaultVariant) throw new Error(`${product.name} has an option that is no longer available. Refresh the catalog and try again.`)
    if (variant?.inventory.trackInventory && !variant.inventory.allowBackorder && line.quantity > variant.inventory.quantity) {
      throw new Error(`Only ${variant.inventory.quantity} units of ${product.name} (${variant.name}) are currently available.`)
    }
    return {
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      variantId: variant?.id ?? "__default__",
      variantName: variant?.name ?? "Default",
      sku: variant?.sku ?? "",
      quantity: line.quantity,
      imageUrl: variant?.images[0]?.url ?? product.images[0]?.url ?? "",
    }
  })

  const id = crypto.randomUUID()
  const database = requireDatabase()
  await database`insert into customer_orders (id,shop_name,phone,address,notes,items,status) values (${id},${input.shopName},${input.phone},${input.address},${input.notes},${database.json(items)},'new')`
  return id
}

export async function listCustomerOrders(): Promise<CustomerOrder[]> {
  const rows = await requireDatabase()`select id,shop_name,phone,address,notes,items,status,created_at from customer_orders order by created_at desc limit 500`
  return rows.map((row) => ({
    id: String(row.id), shopName: String(row.shop_name), phone: String(row.phone),
    address: String(row.address), notes: String(row.notes ?? ""),
    items: row.items as CustomerOrder["items"], status: String(row.status) as OrderStatus,
    createdAt: new Date(String(row.created_at)).toISOString(),
  }))
}

export async function updateCustomerOrderStatus(id: string, status: OrderStatus) {
  const rows = await requireDatabase()`update customer_orders set status=${status},updated_at=now() where id=${id} returning id`
  if (!rows.length) throw new Error("Order not found")
}

