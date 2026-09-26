"use client"

import Link from "next/link"
import { Search, Menu, ChevronDown } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SearchModal } from "@/components/search/search-modal"
import { cn } from "@/lib/utils"
import { infoLinks } from "@/lib/navigation"
import { siteConfig } from "@/lib/config"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import type { Category } from "@/types"

interface HeaderProps {
  /** All categories (top-level + subcategories) from the repository layer */
  categories?: Category[]
}

export function Header({ categories = [] }: HeaderProps) {
  const allCategories = categories
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const sortedCategories = [...allCategories].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  // Cmd+K / Ctrl+K to open search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger
            className="inline-flex items-center justify-center rounded-md p-2 text-foreground/60 hover:bg-accent hover:text-foreground lg:hidden"
            aria-label={t("openMenu")}
            aria-expanded={mobileMenuOpen}
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="!w-full !gap-0 sm:!w-80" showCloseButton={false}>
            <div className="shrink-0 px-6 pt-5 pb-2">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                &larr; {tCommon("close")}
              </button>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto px-6 pb-8">
              <div>
                <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Shop</p>
                <Link href="/shop" className="block py-2.5 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>All products</Link>
                <div className="ml-3 border-l pl-4">
                  {sortedCategories.map((category) => (
                    <Link key={category.id} href={`/${category.slug}`} className={cn("block py-2 text-sm text-muted-foreground hover:text-foreground", category.parentId && "pl-3")} onClick={() => setMobileMenuOpen(false)}>
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="my-4 border-t" />
              <div>
                <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Information</p>
                {infoLinks.map((item) => <Link key={item.href} href={item.href} className="block py-2.5 text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>{item.name}</Link>)}
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link href="/" className="text-xl font-semibold tracking-tight">
          {siteConfig.name}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          <Link href="/shop" className="text-sm font-medium text-foreground transition-colors hover:text-foreground/70">Shop</Link>
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/70">Categories<ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" /></summary>
            <div className="absolute left-1/2 top-full mt-3 grid max-h-[70vh] min-w-72 -translate-x-1/2 grid-cols-2 gap-x-6 overflow-y-auto rounded-lg border bg-white p-5 shadow-xl">
              {sortedCategories.map((category) => (
                <Link key={category.id} href={`/${category.slug}`} className={cn("rounded px-2 py-2 text-sm hover:bg-neutral-100", category.parentId && "pl-5 text-muted-foreground")}>{category.name}</Link>
              ))}
            </div>
          </details>
        </nav>

        {/* Actions */}
        <div className="flex items-center">
          <button
            onClick={() => setSearchOpen(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
            aria-label={t("searchProducts")}
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            href="/contact"
            className="hidden rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/80 sm:inline-flex"
          >
            {tCommon("contactUs")}
          </Link>
        </div>
      </div>
    </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
