import { createFileRoute } from '@tanstack/react-router'
import { CreditCard, Paintbrush, Share2, Workflow } from 'lucide-react'

export const Route = createFileRoute('/about')({
  component: About,
})

const capabilities = [
  {
    title: 'Business pricing menus',
    description:
      'Businesses can publish one USDC checkout with prices for each item, package, or service.',
    icon: Share2,
  },
  {
    title: 'Tiered payments',
    description:
      'Teams can add pricing tiers for the items they sell and adjust USD prices for Solana USDC payments.',
    icon: CreditCard,
  },
  {
    title: 'Merchant controls',
    description:
      'Each checkout carries its own business name, copy, accent color, and Solana receiving wallet.',
    icon: Paintbrush,
  },
  {
    title: 'Database-backed logic',
    description:
      'React Query and TanStack Start server functions persist business pricing through Prisma and Postgres.',
    icon: Workflow,
  },
]

function About() {
  return (
    <main className="page-wrap px-4 py-10">
      <section className="mb-6">
        <p className="island-kicker mb-2">Product</p>
        <h1 className="mb-3 max-w-3xl text-3xl font-bold tracking-tight text-(--sea-ink) sm:text-5xl">
          A control plane for Solana USDC payments.
        </h1>
        <p className="m-0 max-w-3xl text-base leading-7 text-(--sea-ink-soft)">
          USDC Checkout is set up for creating, customizing, previewing, and
          publishing hosted pricing menus that other apps can link to from
          their pricing experience.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {capabilities.map((item) => (
          <article
            key={item.title}
            className="island-shell rounded-lg p-5"
          >
            <item.icon
              size={22}
              aria-hidden="true"
              className="mb-4 text-(--accent)"
            />
            <h2 className="m-0 text-lg font-bold text-(--sea-ink)">
              {item.title}
            </h2>
            <p className="mb-0 mt-2 text-sm leading-6 text-(--sea-ink-soft)">
              {item.description}
            </p>
          </article>
        ))}
      </section>
    </main>
  )
}
