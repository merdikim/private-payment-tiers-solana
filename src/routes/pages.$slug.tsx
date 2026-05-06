import { createFileRoute, notFound } from '@tanstack/react-router'
import { PublicCheckout } from '@/components/checkout/PublicCheckout'
import { useCheckoutPayment } from '@/hooks/useCheckoutPayment'
import { findSubscriptionPage } from '@/lib/subscriptionPage'

export const Route = createFileRoute('/pages/$slug')({
  loader: async ({ params }) => {
    const page = await findSubscriptionPage({ data: { slug: params.slug } })

    if (!page) {
      throw notFound()
    }

    return page
  },
  component: PublicPricingPage,
})

function PublicPricingPage() {
  const page = Route.useLoaderData()
  const checkoutPayment = useCheckoutPayment(page)

  return <PublicCheckout page={page} {...checkoutPayment} />
}
