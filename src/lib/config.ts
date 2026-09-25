// ============================================================================
// Store Configuration — Single source of truth for all store-wide settings.
// Edit this file to customize the store name, contact info, social links, etc.
// ============================================================================

// Ignore an empty value from deployment settings so metadataBase always gets
// a valid absolute URL during a Vercel build.
const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim()
const deploymentUrl = process.env.VERCEL_URL?.trim()
const siteUrl =
  configuredBaseUrl ||
  (deploymentUrl ? `https://${deploymentUrl}` : "http://localhost:3000")

export const siteConfig = {
  // Branding
  name: "Satguru Product Catalog",
  tagline: "A curated product catalog.",
  description:
    "Browse a curated collection of products, explore detailed specifications, and contact us for product enquiries.",

  // Announcement bar (set to "" to hide)
  announcement: "Explore our latest products and enquire with our team.",

  // URLs
  url: siteUrl,

  // Contact
  contact: {
    email: "support@epicdesignlabs.com",
    phone: "",
    address: {
      street: "",
      suite: "",
      city: "",
      state: "",
      zip: "",
    },
  },

  // Social links (set to "" to hide)
  social: {
    twitter: "https://x.com/epicdesignlabs",
    instagram: "https://instagram.com/epicdesignlabs",
    facebook: "https://facebook.com/epicdesignlabs",
    youtube: "",
    tiktok: "",
  },

  locale: "en-US",

  // Legal
  copyrightYear: new Date().getFullYear(),
} as const

export type SiteConfig = typeof siteConfig
