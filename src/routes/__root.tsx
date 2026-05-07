import '../polyfills'
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Home, Plus, SearchX } from 'lucide-react'
import AppProviders from '../components/AppProviders'
import { Button } from '../components/ui/button'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { Toaster } from '../components/ui/toaster'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Delta Pay | Crypto payment for any business',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
})

function NotFoundPage() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="flex justify-center min-h-[calc(100vh-260px)] items-center gap-6">
        <div className="island-shell rounded-lg p-5 sm:p-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-md border border-black bg-(--surface-muted) px-3 py-2 text-sm font-black">
            <SearchX size={17} aria-hidden="true" />
            404
          </div>
          <p className="island-kicker mb-2">Link not found</p>
          <h1 className="mb-3 max-w-3xl text-3xl font-black tracking-tight text-(--sea-ink) sm:text-5xl">
            This checkout page is not active.
          </h1>
          <p className="m-0 max-w-2xl text-base leading-7 text-(--sea-ink-soft)">
            The link may have changed, or the page has not been published yet.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/dashboard" className="no-underline">
                <Home size={16} aria-hidden="true" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/new" className="no-underline">
                <Plus size={16} aria-hidden="true" />
                Create New Checkout Page
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere selection:bg-black selection:text-white">
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <Toaster />
          <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </AppProviders>
        <Scripts />
      </body>
    </html>
  )
}
