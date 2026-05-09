import "../polyfills";
import {
  HeadContent,
  Link,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Home, Plus, SearchX } from "lucide-react";
import AppProviders from "../components/AppProviders";
import { Button } from "../components/ui/button";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Toaster } from "../components/ui/toaster";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Delta Pay | Crypto payment for any business",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function NotFoundPage() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="flex justify-center min-h-[calc(100vh-260px)] items-center gap-6">
        <div className="island-shell rounded-xl p-6 sm:p-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
            <SearchX size={16} aria-hidden="true" />
            404
          </div>
          <p className="text-slate-600 text-sm font-medium mb-3 uppercase tracking-wide">Not found</p>
          <h1 className="mb-4 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            This checkout page is not active.
          </h1>
          <p className="m-0 max-w-2xl text-base leading-7 text-slate-600">
            The link may have changed, or the page has not been published yet. Please check the URL or create a new checkout page.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/dashboard" className="no-underline">
                <Home size={16} aria-hidden="true" />
                Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/new" className="no-underline">
                <Plus size={16} aria-hidden="true" />
                Create Page
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans antialiased wrap-anywhere selection:bg-blue-600 selection:text-white">
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <Toaster />
          <TanStackDevtools
            config={{
              position: "bottom-right",
            }}
            plugins={[
              {
                name: "Tanstack Router",
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </AppProviders>
        <Scripts />
      </body>
    </html>
  );
}
