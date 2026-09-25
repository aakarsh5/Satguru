import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"
import nextEnv from "@next/env"
import postgres from "postgres"

nextEnv.loadEnvConfig(process.cwd())

function ensureSslMode(url) {
  if (!url) return url
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

const url = ensureSslMode(process.env.DATABASE_URL)
if (!url) throw new Error("DATABASE_URL is required")
const sql = postgres(url, { prepare: false, ssl: "require" })
try {
  await sql`create table if not exists schema_migrations (version text primary key, checksum text not null, applied_at timestamptz not null default now())`
  const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "database")
  const files = (await fs.readdir(directory)).filter((file) => /^\d+_.+\.sql$/.test(file)).sort()
  for (const file of files) {
    const version = file.split("_")[0]
    const content = await fs.readFile(path.join(directory, file), "utf8")
    const checksum = (await import("node:crypto")).createHash("sha256").update(content).digest("hex")
    const existing = await sql`select checksum from schema_migrations where version = ${version}`
    if (existing.length) {
      if (existing[0].checksum !== checksum) throw new Error(`Migration ${file} changed after being applied`)
      continue
    }
    await sql.begin(async (transaction) => {
      await transaction.unsafe(content)
      await transaction`insert into schema_migrations (version, checksum) values (${version}, ${checksum})`
    })
    console.log(`Applied ${file}`)
  }
} finally {
  await sql.end()
}
