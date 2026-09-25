// Re-export the JSON-backed repositories as the default implementations.
// To swap backends (database, CMS, API), implement the same interfaces
// and change these exports.

import { postgresProductRepository, postgresCategoryRepository } from "./postgres-repository"
import { jsonProductRepository } from "./json-product-repository"
import { jsonCategoryRepository } from "./json-category-repository"

export const productRepository = process.env.DATABASE_URL ? postgresProductRepository : jsonProductRepository
export const categoryRepository = process.env.DATABASE_URL ? postgresCategoryRepository : jsonCategoryRepository
export const productAdminRepository = postgresProductRepository
export const categoryAdminRepository = postgresCategoryRepository
export { jsonBrandRepository as brandRepository } from "./json-brand-repository"
export { jsonPageRepository as pageRepository } from "./json-page-repository"
export { jsonBlogRepository as blogRepository } from "./json-blog-repository"
