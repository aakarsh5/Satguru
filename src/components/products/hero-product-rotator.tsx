"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, PackageSearch, Timer } from "lucide-react"
import type { Category, ProductImage } from "@/types"
import { CategoryArtwork } from "@/components/categories/category-artwork"
import { ProductImage as ProductPhoto } from "@/components/ui/product-image"

type HeroProduct = {
  id: string
  name: string
  slug: string
  image?: ProductImage
}

export function HeroProductRotator({ products, fallbackCategory }: { products: HeroProduct[]; fallbackCategory?: Category }) {
  const [slide, setSlide] = useState({ index: 0, secondsLeft: 10 })
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const timer = window.setInterval(() => setSlide((current) => current.secondsLeft <= 1
      ? { index: (current.index + 1) % products.length, secondsLeft: 10 }
      : { ...current, secondsLeft: current.secondsLeft - 1 }), 1000)
    return () => window.clearInterval(timer)
  }, [paused, products.length])

  if (products.length === 0) {
    return fallbackCategory ? <div className="absolute inset-0"><CategoryArtwork category={fallbackCategory} className="h-full rounded-none" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-8 pt-24 text-white"><p className="text-xs uppercase tracking-[0.18em] text-white/75">Explore the collection</p><p className="mt-2 text-2xl font-semibold">{fallbackCategory.name}</p></div></div> : <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-stone-200 text-stone-700"><PackageSearch className="h-20 w-20 stroke-[1.1]" /><p className="mt-5 text-lg font-medium">Discover our catalogue</p></div>
  }

  const index = slide.index % products.length
  const product = products[index] ?? products[0]
  const move = (step: number) => setSlide((current) => ({ index: (current.index + step + products.length) % products.length, secondsLeft: 10 }))

  return <div
    className="absolute inset-0"
    role="region"
    aria-label="Product showcase"
    aria-roledescription="carousel"
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onFocusCapture={() => setPaused(true)}
    onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false) }}
  >
    <Link href={`/${product.slug}`} aria-label={`View ${product.name}`} className="absolute inset-0 z-0 cursor-pointer">
      <ProductPhoto key={product.id} src={product.image?.url} alt={product.image?.alt ?? product.name} sizes="(max-width: 768px) 90vw, 44vw" priority className="transition-opacity duration-500" />
    </Link>
    <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-black/55 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-sm tabular-nums" aria-live="off">
      <Timer className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{slide.secondsLeft}s</span>
    </span>
    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-6 pt-24 text-white sm:p-8 sm:pt-28">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/75">Explore the collection</p>
      <Link href={`/${product.slug}`} className="pointer-events-auto mt-2 inline-flex items-center gap-2 text-xl font-semibold hover:underline sm:text-2xl">{product.name}<ArrowRight className="h-5 w-5" /></Link>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-white/80">
          <span>Product {index + 1} of {products.length}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => move(-1)} aria-label="Show previous product" className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-black/20 text-white transition-colors hover:bg-white/20"><ArrowLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => move(1)} aria-label="Show next product" className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full border border-white/50 bg-black/20 text-white transition-colors hover:bg-white/20"><ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  </div>
}
