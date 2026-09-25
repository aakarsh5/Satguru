import { z } from "zod"

// Validate environment variables at build/startup time.
// Add required vars here as you integrate real services.

const envSchema = z.object({
  // Required
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Optional public deployment URL
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv() {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    console.error(
      "❌ Invalid environment variables:",
      result.error.flatten().fieldErrors
    )
    throw new Error("Invalid environment variables")
  }

  return result.data
}

export const env = validateEnv()
