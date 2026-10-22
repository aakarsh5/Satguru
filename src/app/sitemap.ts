import type { MetadataRoute } from "next"
import { siteConfig } from "@/lib/config"
import { categoryRepository, pageRepository, productRepository } from "@/lib/repositories"

const STATIC_PATHS = [
  { path: "", priority: 1, changeFrequency: "daily" as const },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/pages", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/policies/privacy", priority: 0.3, changeFrequency: "yearly" as const },
  { path: "/policies/terms", priority: 0.3, changeFrequency: "yearly" as const },
]

const PRODUCT_PAGE_SIZE = 1_000

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [firstProductPage, categories, pages] = await Promise.all([
    productRepository.list({}, undefined, { page: 1, limit: PRODUCT_PAGE_SIZE }),
    categoryRepository.list(),
    pageRepository.list(),
  ])

  const productPages = await Promise.all(Array.from(
    { length: Math.max(0, firstProductPage.pagination.totalPages - 1) },
    (_, index) => productRepository.list({}, undefined, {
      page: index + 2,
      limit: PRODUCT_PAGE_SIZE,
    })
  ))
  const products = [firstProductPage, ...productPages].flatMap((page) => page.items)
  const lastModified = (value?: string) => {
    if (!value) return undefined
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? undefined : date
  }

  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((item) => ({
    url: `${siteConfig.url}${item.path}`,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }))

  // Product and category pages share a root slug route. Keep only the first
  // matching route because the application resolves products first.
  const catalogSlugs = new Set<string>()
  for (const product of products) {
    if (catalogSlugs.has(product.slug)) continue
    catalogSlugs.add(product.slug)
    entries.push({
      url: `${siteConfig.url}/${product.slug}`,
      lastModified: lastModified(product.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
      images: product.images.map((image) => image.url),
    })
  }
  for (const category of categories) {
    if (catalogSlugs.has(category.slug)) continue
    catalogSlugs.add(category.slug)
    entries.push({
      url: `${siteConfig.url}/${category.slug}`,
      changeFrequency: "weekly",
      priority: category.parentId ? 0.6 : 0.8,
      ...(category.image ? { images: [category.image.url] } : {}),
    })
  }
  for (const page of pages) {
    entries.push({
      url: `${siteConfig.url}/pages/${page.slug}`,
      lastModified: lastModified(page.updatedAt ?? page.publishedAt),
      changeFrequency: "yearly",
      priority: 0.4,
    })
  }

  return entries
}
