import { z } from "zod"

// --- Contact ---

export const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

// --- Newsletter ---

export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// --- Type exports ---

export type ContactFormData = z.infer<typeof contactFormSchema>
export type NewsletterFormData = z.infer<typeof newsletterSchema>
