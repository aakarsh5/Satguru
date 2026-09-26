import type { Metadata } from "next"
import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about our products and catalog.",
}

const faqs = [
  {
    question: "How can I learn more about a product?",
    answer:
      "Open a product detail page to review its images, description, specifications, and available options. You can contact us from that page with any additional questions.",
  },
  {
    question: "Can I request more product information?",
    answer:
      "Yes. Call us from the product page and mention the product name, or use the email option on our contact page.",
  },
  {
    question: "How do I find products in a category?",
    answer:
      "Use the category links in the header or browse all products from the Shop page. Category pages include the relevant product collection and subcategories.",
  },
  {
    question: "Can I search the catalog?",
    answer:
      "Use the search button in the header or visit the Search page to search product names, descriptions, and tags.",
  },
  {
    question: "How do I compare product options?",
    answer:
      "Product detail pages show available variants, images, and specifications so you can compare the information before contacting us.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "For the quickest response, call Satguru Traders at 9854023952. You can also email lohaniaakarsh2017@gmail.com from our contact page.",
  },
]

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Frequently Asked Questions
      </h1>
      <p className="mt-4 text-muted-foreground">
        Find answers to common questions about browsing our product catalog.
      </p>

      <Accordion className="mt-8">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-12 rounded-lg border bg-neutral-50 p-6 text-center">
        <h2 className="text-lg font-semibold">Still have questions?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Can&apos;t find what you&apos;re looking for? Our support team is
          happy to help.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block text-sm font-medium underline hover:text-foreground"
        >
          Contact Support
        </Link>
      </div>
    </div>
  )
}
