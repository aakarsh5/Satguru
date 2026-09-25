// ============================================================================
// Core catalog types — Backend-agnostic data contract
// ============================================================================

// --- Brand ---

export interface Brand {
  id: string
  name: string
  slug: string
  description: string
}

// --- CMS-style Pages ---

export interface CmsPage {
  id: string
  title: string
  slug: string
  /** Short summary shown on the pages index */
  excerpt?: string
  /** Full HTML content rendered with .blog-body prose */
  body: string
  publishedAt: string
  updatedAt?: string
}

// --- Blog Posts ---

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  author: string
  tags: string[]
  coverImage?: ProductImage
  publishedAt: string
  updatedAt?: string
}

// --- Product ---

export type ProductStatus = "draft" | "active" | "archived"

export interface ProductImage {
  url: string
  alt: string
  width?: number
  height?: number
}

export interface ProductOption {
  name: string // e.g., "Color", "Size"
  value: string // e.g., "Black", "M"
}

export interface VariantInventory {
  quantity: number
  trackInventory: boolean
  allowBackorder: boolean
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  name: string
  inventory: VariantInventory
  options: ProductOption[]
  images: ProductImage[]
  weight?: number
  dimensions?: { length: number; width: number; height: number }
}

export interface Product {
  id: string
  name: string
  slug: string
  /** Short blurb shown in the product info column (1–2 sentences) */
  description: string
  /** Full HTML description shown below the product information (.blog-body prose) */
  body?: string
  images: ProductImage[]
  status: ProductStatus
  brandId: string
  categoryIds: string[]
  tags: string[]
  variants: ProductVariant[]
  featured: boolean
  createdAt: string
  updatedAt: string
}

// --- Category ---

export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: ProductImage
  parentId?: string
  order: number
}

// ============================================================================
// Infrastructure Types
// ============================================================================

// --- API Response ---

export type ApiResponse<T> =
  | { data: T; error?: never }
  | { data?: never; error: ApiError }

export interface ApiError {
  code: string
  message: string
  field?: string
  details?: Record<string, string[]>
}

// --- Pagination ---

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  pagination: PaginationMeta
}

// --- Filtering & Sorting ---

export type SortOrder = "asc" | "desc"

export interface SortOption {
  field: string
  order: SortOrder
}

export interface ProductFilters {
  category?: string
  inStock?: boolean
  search?: string
  tags?: string[]
}

// --- Data Repository Interfaces ---

export interface ProductRepository {
  list(
    filters?: ProductFilters,
    sort?: SortOption,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Product>>
  getBySlug(slug: string): Promise<Product | null>
  getById(id: string): Promise<Product | null>
  getFeatured(limit?: number): Promise<Product[]>
  getByCategory(
    categorySlug: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Product>>
  search(
    query: string,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<Product>>
}

export interface CategoryRepository {
  list(): Promise<Category[]>
  getBySlug(slug: string): Promise<Category | null>
  getById(id: string): Promise<Category | null>
}

export interface ProductAdminRepository {
  listAll(): Promise<Product[]>
  create(product: Product): Promise<Product>
  update(id: string, product: Product): Promise<Product>
  delete(id: string): Promise<void>
}

export interface CategoryAdminRepository {
  create(category: Category): Promise<Category>
  update(id: string, category: Category): Promise<Category>
  delete(id: string): Promise<void>
  hasProducts(id: string): Promise<boolean>
}
