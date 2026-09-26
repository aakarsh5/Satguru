import { productRepository } from "@/lib/repositories"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.trim() ?? ""
  if (!query) return Response.json({ products: [] }, { headers: { "Cache-Control": "no-store" } })

  const result = await productRepository.search(query, { page: 1, limit: 6 })
  const products = result.items.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    images: product.images.slice(0, 1),
  }))
  return Response.json({ products }, { headers: { "Cache-Control": "no-store" } })
}
