import { BriefcaseBusiness, Cable, Coffee, Headphones, House, MonitorSmartphone, Package, Shirt, Speaker } from "lucide-react"
import type { Category } from "@/types"
import { PLACEHOLDER_IMAGE } from "@/lib/constants"
import { ProductImage } from "@/components/ui/product-image"
import { cn } from "@/lib/utils"

const artwork: Record<string, { icon: typeof Package; colors: string }> = {
  electronics: { icon: MonitorSmartphone, colors: "from-sky-100 via-cyan-50 to-blue-200 text-sky-800" },
  clothing: { icon: Shirt, colors: "from-rose-100 via-orange-50 to-amber-100 text-rose-800" },
  "home-kitchen": { icon: House, colors: "from-amber-100 via-yellow-50 to-lime-100 text-amber-900" },
  accessories: { icon: BriefcaseBusiness, colors: "from-violet-100 via-fuchsia-50 to-pink-100 text-violet-800" },
  "food-drink": { icon: Coffee, colors: "from-orange-100 via-amber-50 to-yellow-100 text-orange-900" },
  headphones: { icon: Headphones, colors: "from-sky-100 via-cyan-50 to-blue-200 text-sky-800" },
  speakers: { icon: Speaker, colors: "from-blue-100 via-indigo-50 to-violet-100 text-indigo-800" },
  "chargers-accessories": { icon: Cable, colors: "from-cyan-100 via-teal-50 to-emerald-100 text-teal-800" },
}

export function CategoryArtwork({ category, className }: { category: Category; className?: string }) {
  const hasUploadedImage = Boolean(category.image?.url && category.image.url !== PLACEHOLDER_IMAGE)
  const item = artwork[category.slug] ?? { icon: Package, colors: "from-stone-100 via-neutral-50 to-stone-200 text-stone-700" }
  const Icon = item.icon
  return <div className={cn("relative isolate overflow-hidden rounded-lg bg-gradient-to-br", item.colors, className)}>
    {hasUploadedImage ? <ProductImage src={category.image?.url} alt={category.image?.alt ?? category.name} sizes="(max-width: 768px) 100vw, 40vw" /> : <>
      <div aria-hidden="true" className="absolute -right-12 -top-14 h-48 w-48 rounded-full border-[24px] border-current opacity-[0.08]" />
      <div aria-hidden="true" className="absolute -bottom-16 -left-10 h-48 w-48 rounded-full border-[28px] border-current opacity-[0.08]" />
      <div className="absolute inset-0 flex items-center justify-center"><div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/70 shadow-sm backdrop-blur-sm sm:h-36 sm:w-36"><Icon aria-hidden="true" className="h-14 w-14 stroke-[1.35] sm:h-20 sm:w-20" /></div></div>
    </>}
  </div>
}
