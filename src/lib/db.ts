import postgres from "postgres"

const globalForDb = globalThis as typeof globalThis & { __satguruDb?: ReturnType<typeof postgres> }

function ensureSslMode(url: string) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") return url
    parsed.searchParams.set("sslmode", "require")
    return parsed.toString()
  } catch {
    if (url.includes("sslmode=")) return url
    return `${url}${url.includes("?") ? "&" : "?"}sslmode=require`
  }
}

export function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) return null
  return ensureSslMode(databaseUrl)
}

export function getDatabase() {
  const databaseUrl = getDatabaseUrl()
  if (!databaseUrl) return null
  globalForDb.__satguruDb ??= postgres(databaseUrl, {
    max: 5,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: "require",
  })
  return globalForDb.__satguruDb
}

export function requireDatabase() {
  const database = getDatabase()
  if (!database) {
    throw new Error("DATABASE_URL is required for this admin operation")
  }
  return database
}
