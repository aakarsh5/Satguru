import type { Category, CategoryAdminRepository, CategoryRepository, PaginatedResult, PaginationParams, Product, ProductAdminRepository, ProductFilters, ProductRepository, SortOption } from "@/types"
import { requireDatabase } from "@/lib/db"

const pageResult = <T>(items: T[], total: number, pagination?: PaginationParams): PaginatedResult<T> => {
  const page = Math.max(1, pagination?.page ?? 1)
  const limit = Math.max(1, pagination?.limit ?? 12)
  const totalPages = Math.ceil(total / limit)
  return { items, pagination: { total, page, limit, totalPages, hasNext: page < totalPages, hasPrev: page > 1 } }
}
type DbImage = { url: string; alt: string; width?: number; height?: number; variant_id?: string | null }
type DbProductRow = { payload: Product; name: string; description: string; body?: string; brand_id: string; tags: string[]; featured: boolean; images: DbImage[]; category_ids: string[] }

function hydrate(row: DbProductRow): Product {
  const product = row.payload as Product
  const variants = (product.variants ?? []).map((variant) => ({
    ...variant,
    images: (row.images ?? []).filter((image) => image.variant_id === variant.id).map(imageValue),
  }))
  return {
    ...product,
    name: row.name ?? product.name,
    description: row.description ?? product.description,
    body: row.body ?? product.body,
    brandId: row.brand_id ?? product.brandId,
    tags: row.tags ?? product.tags,
    featured: row.featured ?? product.featured,
    categoryIds: row.category_ids ?? product.categoryIds ?? [],
    images: (row.images ?? []).filter((image) => !image.variant_id).map(imageValue),
    variants,
  }
}
function imageValue(image: DbImage) {
  return { url: image.url, alt: image.alt, ...(image.width == null ? {} : { width: image.width }), ...(image.height == null ? {} : { height: image.height }) }
}

async function productQuery(filters?: ProductFilters, sort?: SortOption, pagination?: PaginationParams, singleId?: string, slug?: string, featured?: boolean) {
  const database = requireDatabase()
  const conditions = [database`1=1`]
  if (singleId) conditions.push(database`p.id=${singleId}`)
  if (slug) conditions.push(database`p.slug=${slug}`)
  if (!singleId) conditions.push(database`p.status='active'`)
  if (featured) conditions.push(database`p.featured=true`)
  if (filters?.category) conditions.push(database`exists (select 1 from product_categories pc join categories c on c.id=pc.category_id where pc.product_id=p.id and (c.id=${filters.category} or c.slug=${filters.category}))`)
  if (filters?.search) conditions.push(database`(p.name ilike ${"%" + filters.search + "%"} or p.description ilike ${"%" + filters.search + "%"} or p.tags::text ilike ${"%" + filters.search + "%"})`)
  if (filters?.inStock) conditions.push(database`jsonb_path_exists(p.payload, '$.variants[*] ? (@.inventory.quantity > 0 || @.inventory.allowBackorder == true)')`)
  if (filters?.tags?.length) for (const tag of filters.tags) conditions.push(database`p.tags @> ${database.json([tag])}::jsonb`)
  const where = conditions.slice(1).reduce((query, condition) => database`${query} and ${condition}`, conditions[0])
  const orderField = sort?.field === "name" ? "p.name" : "p.created_at"
  const order = sort?.order === "asc" ? "asc" : "desc"
  const limit = pagination?.limit ?? 12
  const offset = ((pagination?.page ?? 1) - 1) * limit
  const rows = await database`
    select p.id,p.name,p.description,p.body,p.brand_id,p.tags,p.featured,p.payload,
      coalesce((select jsonb_agg(jsonb_build_object('id',pi.id,'variant_id',pi.variant_id,'url',pi.url,'alt',pi.alt,'width',pi.width,'height',pi.height) order by pi.variant_id nulls first,pi.sort_order) from product_images pi where pi.product_id=p.id),'[]') images,
      coalesce((select jsonb_agg(pc.category_id order by pc.sort_order) from product_categories pc where pc.product_id=p.id),'[]') category_ids
    from products p where ${where} order by ${database.unsafe(orderField)} ${database.unsafe(order)} , p.id
    ${singleId || slug ? database`` : database`limit ${limit} offset ${offset}`}
  `
  const countRows = singleId || slug ? [{ count: rows.length }] : await database`select count(*)::int count from products p where ${where}`
  return { rows: rows as unknown as DbProductRow[], total: Number(countRows[0]?.count ?? 0) }
}

export const postgresProductRepository: ProductRepository & ProductAdminRepository = {
  async list(filters, sort, pagination) { const result = await productQuery(filters, sort, pagination); return pageResult(result.rows.map(hydrate), result.total, pagination) },
  async getBySlug(slug) { const result = await productQuery(undefined, undefined, undefined, undefined, slug); return result.rows[0] ? hydrate(result.rows[0]) : null },
  async getById(id) { const result = await productQuery(undefined, undefined, undefined, id); return result.rows[0] ? hydrate(result.rows[0]) : null },
  async getFeatured(limit = 4) { const result = await productQuery({}, { field: "createdAt", order: "desc" }, { page: 1, limit }, undefined, undefined, true); return result.rows.map(hydrate) },
  async getByCategory(categorySlug, pagination) { const result = await productQuery({ category: categorySlug }, undefined, pagination); return pageResult(result.rows.map(hydrate), result.total, pagination) },
  async search(query, pagination) { const result = await productQuery({ search: query }, undefined, pagination); return pageResult(result.rows.map(hydrate), result.total, pagination) },
  async listAll() { const database = requireDatabase(); const rows = await database`select p.id,p.name,p.description,p.body,p.brand_id,p.tags,p.featured,p.payload,coalesce((select jsonb_agg(jsonb_build_object('variant_id',pi.variant_id,'url',pi.url,'alt',pi.alt,'width',pi.width,'height',pi.height) order by pi.variant_id nulls first,pi.sort_order) from product_images pi where pi.product_id=p.id),'[]') images,coalesce((select jsonb_agg(pc.category_id order by pc.sort_order) from product_categories pc where pc.product_id=p.id),'[]') category_ids from products p order by p.created_at desc`; return rows.map((row) => hydrate(row as unknown as DbProductRow)) },
  async create(product) { await writeProduct(product, false); return product },
  async update(id, product) { await writeProduct(product, true, id); return product },
  async delete(id) { await requireDatabase()`delete from products where id=${id}` },
}

export type InventoryMovement = {
  id: number
  productId: string
  variantId: string
  productName: string
  variantName: string
  sku: string
  quantityBefore: number
  quantityDelta: number
  quantityAfter: number
  reason: string
  note: string
  changedBy: string
  createdAt: string
}

export async function adjustVariantInventory(input: {
  productId: string
  variantId: string
  mode: "receive" | "remove" | "set"
  quantity: number
  reason: string
  note: string
  changedBy: string
}) {
  const database = requireDatabase()
  return database.begin(async (tx) => {
    const rows = await tx`select payload from products where id=${input.productId} for update`
    if (!rows[0]) throw new Error("Product not found")
    const product = rows[0].payload as Product
    const variants = product.variants ?? []
    const index = variants.findIndex((variant) => variant.id === input.variantId)
    if (index < 0) throw new Error("Product variant not found")
    const variant = variants[index]
    if (!variant.inventory.trackInventory) throw new Error("Enable inventory tracking for this variant before adjusting its stock")
    const before = variant.inventory.quantity
    const after = input.mode === "receive" ? before + input.quantity : input.mode === "remove" ? before - input.quantity : input.quantity
    if (after < 0) throw new Error("Stock cannot be reduced below zero")
    const delta = after - before
    if (delta === 0) throw new Error("This adjustment would not change the stock")
    const updatedVariants = variants.map((item, itemIndex) => itemIndex === index
      ? { ...item, inventory: { ...item.inventory, quantity: after } }
      : item)
    const updatedAt = new Date().toISOString()
    const updatedProduct = JSON.parse(JSON.stringify({ ...product, variants: updatedVariants, updatedAt }))
    await tx`update products set payload=${tx.json(updatedProduct)},updated_at=${updatedAt} where id=${input.productId}`
    const movements = await tx`insert into inventory_movements (product_id,variant_id,quantity_before,quantity_delta,quantity_after,reason,note,changed_by) values (${input.productId},${input.variantId},${before},${delta},${after},${input.reason},${input.note},${input.changedBy}) returning id,created_at`
    return { before, after, delta, id: Number(movements[0].id) }
  })
}

export async function listInventoryMovements(limit = 50): Promise<InventoryMovement[]> {
  const rows = await requireDatabase()`select m.id,m.product_id,m.variant_id,m.quantity_before,m.quantity_delta,m.quantity_after,m.reason,m.note,m.changed_by,m.created_at,p.name product_name,v->>'name' variant_name,v->>'sku' sku from inventory_movements m join products p on p.id=m.product_id left join lateral jsonb_array_elements(coalesce(p.payload->'variants','[]'::jsonb)) v on v->>'id'=m.variant_id order by m.created_at desc limit ${limit}`
  return rows.map((row) => {
    const value = row as unknown as Record<string, unknown>
    return {
      id: Number(value.id), productId: String(value.product_id), variantId: String(value.variant_id),
      productName: String(value.product_name), variantName: String(value.variant_name ?? "Removed variant"), sku: String(value.sku ?? ""),
      quantityBefore: Number(value.quantity_before), quantityDelta: Number(value.quantity_delta), quantityAfter: Number(value.quantity_after),
      reason: String(value.reason), note: String(value.note ?? ""), changedBy: String(value.changed_by), createdAt: new Date(String(value.created_at)).toISOString(),
    }
  })
}

async function writeProduct(product: Product, update: boolean, routeId = product.id) {
  const database = requireDatabase()
  await database.begin(async (tx) => {
    const clean = product
    const payload = JSON.parse(JSON.stringify(clean))
    if (update) await tx`update products set slug=${product.slug},status=${product.status},name=${product.name},description=${product.description},body=${product.body ?? null},brand_id=${product.brandId},tags=${tx.json(product.tags)},featured=${product.featured},payload=${tx.json(payload)},updated_at=${product.updatedAt} where id=${routeId}`
    else await tx`insert into products (id,slug,status,name,description,body,brand_id,tags,featured,payload,created_at,updated_at) values (${product.id},${product.slug},${product.status},${product.name},${product.description},${product.body ?? null},${product.brandId},${tx.json(product.tags)},${product.featured},${tx.json(payload)},${product.createdAt},${product.updatedAt})`
    await tx`delete from product_categories where product_id=${product.id}`
    for (const [order, categoryId] of product.categoryIds.entries()) await tx`insert into product_categories (product_id,category_id,sort_order) values (${product.id},${categoryId},${order})`
    await tx`delete from product_images where product_id=${product.id}`
    for (const [order, image] of product.images.entries()) await tx`insert into product_images (product_id,url,alt,width,height,sort_order) values (${product.id},${image.url},${image.alt},${image.width ?? null},${image.height ?? null},${order})`
    for (const variant of clean.variants) for (const [order, image] of (variant.images ?? []).entries()) await tx`insert into product_images (product_id,variant_id,url,alt,width,height,sort_order) values (${product.id},${variant.id},${image.url},${image.alt},${image.width ?? null},${image.height ?? null},${order})`
  })
}

export const postgresCategoryRepository: CategoryRepository & CategoryAdminRepository & { getChildren(parentId: string): Promise<Category[]>; getTopLevel(): Promise<Category[]>; getAncestors(categoryId: string): Promise<Category[]> } = {
  async list() { const rows = await requireDatabase()`select id,slug,parent_id,sort_order,name,description,image,payload from categories order by sort_order,name`; return rows.map((row) => { const value = row as unknown as { id: string; slug: string; parent_id?: string; sort_order: number; name: string; description: string; image?: Category["image"]; payload: Category }; return { ...value.payload, id: value.id, slug: value.slug, parentId: value.parent_id ?? undefined, order: value.sort_order, name: value.name, description: value.description, image: value.image ?? undefined } }) },
  async getBySlug(slug) { const rows = await requireDatabase()`select id,slug,parent_id,sort_order,name,description,image,payload from categories where slug=${slug}`; if (!rows[0]) return null; const value = rows[0] as unknown as { id: string; slug: string; parent_id?: string; sort_order: number; name: string; description: string; image?: Category["image"]; payload: Category }; return { ...value.payload, id: value.id, slug: value.slug, parentId: value.parent_id ?? undefined, order: value.sort_order, name: value.name, description: value.description, image: value.image ?? undefined } },
  async getById(id) { const category = await this.list(); return category.find((item) => item.id === id) ?? null },
  async getChildren(parentId) { const categories = await this.list(); return categories.filter((item) => item.parentId === parentId) },
  async getTopLevel() { const categories = await this.list(); return categories.filter((item) => !item.parentId) },
  async getAncestors(id) { const categories = await this.list(); const result: Category[] = []; let current = categories.find((item) => item.id === id); while (current) { result.unshift(current); current = current.parentId ? categories.find((item) => item.id === current?.parentId) : undefined } return result },
  async create(category) { const database = requireDatabase(); await database`insert into categories (id,slug,parent_id,sort_order,name,description,image,payload) values (${category.id},${category.slug},${category.parentId ?? null},${category.order},${category.name},${category.description},${category.image ? database.json(JSON.parse(JSON.stringify(category.image))) : null},${database.json(JSON.parse(JSON.stringify(category)))})`; return category },
  async update(id, category) { const database = requireDatabase(); await database`update categories set slug=${category.slug},parent_id=${category.parentId ?? null},sort_order=${category.order},name=${category.name},description=${category.description},image=${category.image ? database.json(JSON.parse(JSON.stringify(category.image))) : null},payload=${database.json(JSON.parse(JSON.stringify(category)))} where id=${id}`; return category },
  async delete(id) { await requireDatabase()`delete from categories where id=${id}` },
  async hasProducts(id) {
    const rows = await requireDatabase()`select exists(select 1 from product_categories where category_id=${id}) as used`
    return Boolean(rows[0]?.used)
  },
}
