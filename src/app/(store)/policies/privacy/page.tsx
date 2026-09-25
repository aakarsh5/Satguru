import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How we collect, use, and protect your personal information.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated: January 1, 2025
      </p>
      <div className="mt-8 space-y-6 text-muted-foreground">
        <h2 className="text-xl font-semibold text-foreground">
          Information We Collect
        </h2>
        <p>
          We collect information you provide directly, such as your name, email
          name and email address when you contact us. We may also automatically
          collect limited information about your device and browsing activity.
        </p>

        <h2 className="text-xl font-semibold text-foreground">
          How We Use Your Information
        </h2>
        <ul className="list-inside list-disc space-y-2">
          <li>To respond to product enquiries and contact requests</li>
          <li>To send optional newsletter updates (with your consent)</li>
          <li>To improve our website and services</li>
          <li>To protect and improve the website</li>
        </ul>

        <h2 className="text-xl font-semibold text-foreground">
          Data Protection
        </h2>
        <p>
          We implement industry-standard security measures to protect your
          personal information. We do not collect payment information through
          this catalog.
        </p>

        <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
        <p>
          You have the right to access, update, or delete your personal
          information at any time. Contact us at privacy@store.com with any
          requests.
        </p>
      </div>
    </div>
  )
}
