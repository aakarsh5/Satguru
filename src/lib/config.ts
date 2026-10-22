// ============================================================================
// Store Configuration — Single source of truth for all store-wide settings.
// Edit this file to customize the store name, contact info, social links, etc.
// ============================================================================

// Vercel can expose an environment variable with an empty value when it was
// created in the project settings but never populated. Treat that the same as
// an unset URL so metadataBase always receives a valid absolute URL.
const configuredBaseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim()
const projectProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
const deploymentUrl = process.env.VERCEL_URL?.trim()
const parsedBaseUrl = configuredBaseUrl ? URL.parse(configuredBaseUrl) : null
const isLocalBaseUrl = parsedBaseUrl && (
  parsedBaseUrl.hostname === "localhost" ||
  parsedBaseUrl.hostname === "127.0.0.1" ||
  parsedBaseUrl.hostname === "::1"
)
const usableBaseUrl = parsedBaseUrl && !(process.env.NODE_ENV === "production" && isLocalBaseUrl)
  ? configuredBaseUrl?.replace(/\/+$/, "")
  : undefined
const siteUrl =
  usableBaseUrl ||
  (projectProductionUrl ? `https://${projectProductionUrl}` : undefined) ||
  (deploymentUrl ? `https://${deploymentUrl}` : "http://localhost:3000")

export const siteConfig = {
  // Branding
  name: "Satguru Traders",
  tagline: "Quality products, trusted service.",
  description:
    "Browse products from Satguru Traders and contact us for product enquiries.",

  // Announcement bar (set to "" to hide)
  announcement: "Explore our latest products and enquire with our team.",

  // URLs
  url: siteUrl,

  // Contact
  contact: {
    email: "lohaniaakarsh2017@gmail.com",
    phone: "9854023952",
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
    twitter: "",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",
  },

  locale: "en-US",

  // Legal
  copyrightYear: new Date().getFullYear(),
} as const

export type SiteConfig = typeof siteConfig
