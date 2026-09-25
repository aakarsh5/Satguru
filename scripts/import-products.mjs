import fs from "node:fs/promises"
import nextEnv from "@next/env"
import postgres from "postgres"

nextEnv.loadEnvConfig(process.cwd())

function ensureSslMode(url) {
  if (!url) return url
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") return url
    parsed.searchParams.set("sslmode", "require")
    return parsed.toString()
  } catch {
    if (url.includes("sslmode=")) return url
    return `${url}${url.includes("?") ? "&" : "?"}sslmode=require`
  }
}

const url = ensureSslMode(process.env.DATABASE_URL)
if (!url) throw new Error("DATABASE_URL is required")
const data = JSON.parse(await fs.readFile(new URL("../src/data/products.json", import.meta.url), "utf8"))
const sql = postgres(url, { prepare: false, ssl: "require" })
try {
  await sql`create table if not exists schema_migrations (version text primary key, checksum text not null, applied_at timestamptz not null default now())`
  const migrations = (await fs.readdir(new URL("../database/", import.meta.url))).filter((file) => /^\d+_.+\.sql$/.test(file)).sort()
  for (const file of migrations) {
    const version = file.split("_")[0]
    const exists = await sql`select 1 from schema_migrations where version = ${version}`
    if (!exists.length) {
      const content = await fs.readFile(new URL(`../database/${file}`, import.meta.url), "utf8")
      const { createHash } = await import("node:crypto")
      const checksum = createHash("sha256").update(content).digest("hex")
      await sql.begin(async (tx) => {
        await tx.unsafe(content)
        await tx`insert into schema_migrations (version, checksum) values (${version}, ${checksum})`
      })
    }
  }
  for (const category of data.categories) {
    await sql`insert into categories (id, slug, parent_id, sort_order, name, description, image, payload) values (${category.id}, ${category.slug}, ${category.parentId ?? null}, ${category.order ?? 0}, ${category.name}, ${category.description ?? ""}, ${category.image ? sql.json(category.image) : null}, ${sql.json(category)}) on conflict (id) do update set slug=excluded.slug, parent_id=excluded.parent_id, sort_order=excluded.sort_order, name=excluded.name, description=excluded.description, image=excluded.image, payload=excluded.payload`
  }
  for (const product of data.products) {
    const cleanProduct = { ...product, variants: product.variants.map(({ ...variant }) => { delete variant.price; delete variant.compareAtPrice; delete variant.currency; return variant }) }
    await sql`insert into products (id, slug, status, name, description, body, brand_id, tags, featured, payload, created_at, updated_at) values (${product.id}, ${product.slug}, ${product.status}, ${product.name}, ${product.description}, ${product.body ?? null}, ${product.brandId}, ${sql.json(product.tags)}, ${product.featured}, ${sql.json(cleanProduct)}, ${product.createdAt}, ${product.updatedAt}) on conflict (id) do update set slug=excluded.slug, status=excluded.status, name=excluded.name, description=excluded.description, body=excluded.body, brand_id=excluded.brand_id, tags=excluded.tags, featured=excluded.featured, payload=excluded.payload, updated_at=excluded.updated_at`
    await sql`delete from product_categories where product_id=${product.id}`
    for (const [sortOrder, categoryId] of product.categoryIds.entries()) await sql`insert into product_categories (product_id, category_id, sort_order) values (${product.id}, ${categoryId}, ${sortOrder}) on conflict do nothing`
    await sql`delete from product_images where product_id=${product.id}`
    for (const [sortOrder, image] of product.images.entries()) await sql`insert into product_images (product_id, url, alt, width, height, sort_order) values (${product.id}, ${image.url}, ${image.alt}, ${image.width ?? null}, ${image.height ?? null}, ${sortOrder})`
    for (const variant of cleanProduct.variants) for (const [sortOrder, image] of (variant.images ?? []).entries()) await sql`insert into product_images (product_id, variant_id, url, alt, width, height, sort_order) values (${product.id}, ${variant.id}, ${image.url}, ${image.alt}, ${image.width ?? null}, ${image.height ?? null}, ${sortOrder})`
  }
  console.log(`Imported ${data.products.length} products and ${data.categories.length} categories.`)
} finally {
  await sql.end()
}
