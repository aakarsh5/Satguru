import "server-only"

import { cookies } from "next/headers"
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

const COOKIE_NAME = "satguru_admin_session_v4"
const LEGACY_COOKIE_NAMES = [
  "satguru_admin_session",
  "satguru_admin_session_v2",
  "satguru_admin_session_v3",
]
const SESSION_TTL = 60 * 60 * 8

function secret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET
}

export function hashAdminPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return `scrypt$${salt}$${scryptSync(password, salt, 64).toString("hex")}`
}

function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expected, ...extra] = encoded.split("$")
  if (
    algorithm !== "scrypt" ||
    !salt ||
    !expected ||
    extra.length > 0 ||
    !/^[a-f\d]{32}$/i.test(salt) ||
    !/^[a-f\d]{128}$/i.test(expected)
  ) return false
  const actual = scryptSync(password, salt, 64)
  const expectedBuffer = Buffer.from(expected, "hex")
  return actual.length === expectedBuffer.length && timingSafeEqual(actual, expectedBuffer)
}

function normalizePasswordHash(encoded: string) {
  return encoded
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/^ADMIN_PASSWORD_HASH\s*=\s*/i, "")
    .replace(/^['"]|['"]$/g, "")
    .replace(/\\\$/g, "$")
}

function sign(value: string) {
  const key = secret()
  if (!key) throw new Error("ADMIN_SESSION_SECRET is not configured")
  return createHmac("sha256", key).update(value).digest("base64url")
}

export async function authenticateAdmin(email: string, password: string) {
  const configuredEmail = process.env.ADMIN_EMAIL?.trim()
  const rawHash = process.env.ADMIN_PASSWORD_HASH
  const encodedHash = rawHash ? normalizePasswordHash(rawHash) : ""
  const emailMatches =
    configuredEmail !== undefined &&
    configuredEmail.length > 0 &&
    email.trim().toLowerCase() === configuredEmail.toLowerCase()
  const passwordHashFormatValid = /^scrypt\$[a-f\d]{32}\$[a-f\d]{128}$/i.test(encodedHash)

  if (!configuredEmail || !rawHash || !passwordHashFormatValid) {
    // Keep diagnostics useful while never logging submitted credentials or secrets.
    console.warn("Admin login rejected", {
      emailConfigured: Boolean(configuredEmail),
      emailMatched: emailMatches,
      passwordHashConfigured: Boolean(rawHash),
      passwordHashFormatValid,
      passwordMatched: false,
    })
    return { ok: false as const, reason: "configuration" as const }
  }

  if (!emailMatches) {
    console.warn("Admin login rejected", {
      emailConfigured: true,
      emailMatched: false,
      passwordHashConfigured: true,
      passwordHashFormatValid: true,
      passwordChecked: false,
    })
    return { ok: false as const, reason: "email" as const }
  }

  if (!verifyPassword(password, encodedHash)) {
    console.warn("Admin login rejected", {
      emailConfigured: true,
      emailMatched: true,
      passwordHashConfigured: true,
      passwordHashFormatValid: true,
      passwordMatched: false,
    })
    return { ok: false as const, reason: "password" as const }
  }

  const payload = `${configuredEmail}|${Date.now() + SESSION_TTL * 1000}`
  const encodedPayload = Buffer.from(payload).toString("base64url")
  const value = `${encodedPayload}.${sign(encodedPayload)}`
  const cookieStore = await cookies()
  for (const legacyName of LEGACY_COOKIE_NAMES) {
    cookieStore.set(legacyName, "", { path: "/", maxAge: 0 })
  }
  cookieStore.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  })
  return { ok: true as const }
}

export async function getAdminSession() {
  const value = (await cookies()).get(COOKIE_NAME)?.value
  const [encodedPayload, signature] = value?.split(".") ?? []
  if (!encodedPayload || !signature || !secret() || sign(encodedPayload) !== signature) return null
  const payload = Buffer.from(encodedPayload, "base64url").toString("utf8")
  const [email, expiresAt] = payload.split("|")
  if (!email || Number(expiresAt) < Date.now() || email !== process.env.ADMIN_EMAIL?.trim()) return null
  return { email }
}

export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) throw new Error("Unauthorized")
  return session
}

export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  for (const legacyName of LEGACY_COOKIE_NAMES) cookieStore.delete(legacyName)
}
