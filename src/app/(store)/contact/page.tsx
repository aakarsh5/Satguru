"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { Mail, Phone } from "lucide-react"
import { toast } from "sonner"
import { contactFormSchema } from "@/lib/validators"
import { siteConfig } from "@/lib/config"

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = contactFormSchema.safeParse(form)
    if (!result.success) {
      toast.error(result.error.issues[0].message)
      return
    }

    const mailto = new URL(`mailto:${siteConfig.contact.email}`)
    mailto.searchParams.set("subject", form.subject)
    mailto.searchParams.set("body", `Name: ${form.name}\nReply to: ${form.email}\n\n${form.message}`)
    window.location.href = mailto.toString()
    toast.success("Your email app is opening with your message.")
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <PageHeader
        title="Contact Satguru Traders"
        description="Call us for the quickest help with product questions, availability, and specifications."
      />

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        {/* Contact info cards */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="border-emerald-200 bg-emerald-50/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Phone className="h-5 w-5 text-emerald-800" />
                Call us — quickest response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <a href={`tel:${siteConfig.contact.phone}`} className="text-2xl font-semibold tracking-tight text-stone-900 hover:underline">
                {siteConfig.contact.phone}
              </a>
              <p className="mt-2 text-sm text-muted-foreground">Call about products, options, or availability.</p>
              <Button asChild className="mt-5 w-full">
                <a href={`tel:${siteConfig.contact.phone}`}><Phone className="mr-2 h-4 w-4" />Call Satguru Traders</a>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4" />Email us</CardTitle>
            </CardHeader>
            <CardContent>
              <a href={`mailto:${siteConfig.contact.email}`} className="break-all text-sm text-muted-foreground hover:text-foreground hover:underline">
                {siteConfig.contact.email}
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Contact form */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <h2 className="mb-1 text-lg font-semibold">Prefer to write?</h2>
            <p className="mb-6 text-sm text-muted-foreground">Send an email instead and your email app will open with your message.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Template question, customization help, or project inquiry"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell us about your project or question..."
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                  aria-required="true"
                />
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                Send by email
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
