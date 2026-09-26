import { requireAdmin } from "@/lib/admin-auth"
import { productAdminRepository } from "@/lib/repositories"
import { listInventoryMovements } from "@/lib/repositories/postgres-repository"
import { InventoryManager } from "./inventory-manager"

const LOW_STOCK_THRESHOLD = 5

export default async function AdminInventoryPage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  await requireAdmin()
  const [{ updated }, products, movements] = await Promise.all([
    searchParams,
    productAdminRepository.listAll(),
    listInventoryMovements(40),
  ])
  const rows = products.flatMap((product) => product.variants.length
    ? product.variants.map((variant) => ({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productStatus: product.status,
      imageUrl: variant.images[0]?.url ?? product.images[0]?.url ?? "",
      variantId: variant.id,
      variantName: variant.name,
      options: variant.options.map(({ name, value }) => `${name}: ${value}`).join(" · "),
      sku: variant.sku,
      quantity: variant.inventory.quantity,
      trackInventory: variant.inventory.trackInventory,
      allowBackorder: variant.inventory.allowBackorder,
      needsSetup: false,
    }))
    : [{
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productStatus: product.status,
      imageUrl: product.images[0]?.url ?? "",
      variantId: "__new_default__",
      variantName: "Stock not set up",
      options: "",
      sku: "",
      quantity: 0,
      trackInventory: false,
      allowBackorder: false,
      needsSetup: true,
    }])
  const tracked = rows.filter((row) => row.trackInventory)
  const metrics = {
    trackedVariants: tracked.length,
    units: tracked.reduce((total, row) => total + row.quantity, 0),
    lowStock: tracked.filter((row) => row.quantity > 0 && row.quantity <= LOW_STOCK_THRESHOLD).length,
    outOfStock: tracked.filter((row) => row.quantity === 0).length,
  }
  return <main>
    <div className="mb-6"><p className="text-sm text-muted-foreground">Stock control</p><h1 className="mt-1 text-2xl font-semibold">Inventory</h1><p className="mt-1 text-sm text-muted-foreground">Review stock by variant, record incoming and outgoing stock, and spot replenishment needs.</p></div>
    {updated && <p role="status" className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">Inventory adjustment saved.</p>}
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric title="Products listed" value={products.length} detail="Every product in the catalog" />
      <Metric title="Tracked variants" value={metrics.trackedVariants} detail="Variants with stock tracking enabled" />
      <Metric title="Units on hand" value={metrics.units} detail="Across tracked variants" />
      <Metric title="Low stock" value={metrics.lowStock} detail={`1–${LOW_STOCK_THRESHOLD} units remaining`} tone="amber" />
      <Metric title="Out of stock" value={metrics.outOfStock} detail="Tracked variants at zero" tone="red" />
    </div>
    <InventoryManager rows={rows} movements={movements} threshold={LOW_STOCK_THRESHOLD} />
  </main>
}

function Metric({ title, value, detail, tone = "default" }: { title: string; value: number; detail: string; tone?: "default" | "amber" | "red" }) {
  const toneClass = tone === "amber" ? "border-amber-200 bg-amber-50" : tone === "red" ? "border-red-200 bg-red-50" : "bg-white"
  return <section className={`rounded-xl border p-4 shadow-sm ${toneClass}`}><p className="text-sm text-muted-foreground">{title}</p><p className="mt-2 text-3xl font-semibold tabular-nums">{value.toLocaleString()}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></section>
}
