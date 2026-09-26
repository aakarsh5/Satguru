export interface NavItem {
  name: string
  href: string
}

// Store categories come from the category repository and are rendered by Header.
export const infoLinks: NavItem[] = [
  { name: "All Brands", href: "/brands" },
  { name: "Blog", href: "/blog" },
  { name: "Pages", href: "/pages" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "FAQ", href: "/faq" },
]
