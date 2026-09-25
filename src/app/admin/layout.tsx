import Link from "next/link"
import { logoutAction } from "./actions"
import { Button } from "@/components/ui/button"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <Link href="/admin" className="text-xl font-semibold">Catalog admin</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/categories">Categories</Link>
          <form action={logoutAction}><Button type="submit" variant="outline" size="sm">Sign out</Button></form>
        </nav>
      </header>
      {children}
    </div>
  )
}
