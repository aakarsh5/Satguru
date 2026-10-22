"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { Product } from "@/types"

export type CartLine = {
  productId: string
  slug: string
  productName: string
  variantId: string
  variantName: string
  sku: string
  imageUrl: string
  quantity: number
}

type CartContextValue = {
  lines: CartLine[]
  itemCount: number
  addItem: (product: Product, variantId: string, quantity?: number) => void
  setQuantity: (productId: string, variantId: string, quantity: number) => void
  removeItem: (productId: string, variantId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)
const STORAGE_KEY = "satguru-guest-cart-v1"

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          const parsed: unknown = JSON.parse(saved)
          if (Array.isArray(parsed)) setLines(parsed.filter(isCartLine))
        }
      } catch { /* Storage may be unavailable in a restricted browser. */ }
      setHydrated(true)
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)) }
      catch { /* Keep the in-memory cart usable when storage is unavailable. */ }
    }
  }, [hydrated, lines])

  const value = useMemo<CartContextValue>(() => ({
    lines,
    itemCount: lines.reduce((sum, line) => sum + line.quantity, 0),
    addItem(product, variantId, quantity = 1) {
      const variant = product.variants.find((item) => item.id === variantId)
      if (!variant || !Number.isSafeInteger(quantity) || quantity < 1) return
      const safeQuantity = Math.min(quantity, 100000)
      const line: CartLine = {
        productId: product.id,
        slug: product.slug,
        productName: product.name,
        variantId: variant.id,
        variantName: variant.name,
        sku: variant.sku,
        imageUrl: variant.images[0]?.url ?? product.images[0]?.url ?? "",
        quantity: safeQuantity,
      }
      setLines((current) => {
        const existing = current.find((item) => item.productId === line.productId && item.variantId === line.variantId)
        return existing
          ? current.map((item) => item === existing ? { ...item, quantity: Math.min(item.quantity + safeQuantity, 100000) } : item)
          : [...current, line]
      })
    },
    setQuantity(productId, variantId, quantity) {
      if (quantity <= 0) {
        setLines((current) => current.filter((item) => item.productId !== productId || item.variantId !== variantId))
      } else {
        setLines((current) => current.map((item) => item.productId === productId && item.variantId === variantId ? { ...item, quantity: Math.min(quantity, 100000) } : item))
      }
    },
    removeItem(productId, variantId) {
      setLines((current) => current.filter((item) => item.productId !== productId || item.variantId !== variantId))
    },
    clearCart() { setLines([]) },
  }), [lines])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart must be used within CartProvider")
  return context
}

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false
  const line = value as Partial<CartLine>
  return typeof line.productId === "string" && typeof line.slug === "string" &&
    typeof line.productName === "string" && typeof line.variantId === "string" &&
    typeof line.variantName === "string" && typeof line.sku === "string" &&
    typeof line.imageUrl === "string" && Number.isSafeInteger(line.quantity) &&
    Number(line.quantity) > 0 && Number(line.quantity) <= 100000
}
