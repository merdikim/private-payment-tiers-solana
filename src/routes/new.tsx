import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { Link as LinkIcon, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MerchantAuthGuard } from "@/components/MerchantAuthGuard";
import { useMerchantAuth } from "@/components/merchantAuth";
import { useToast } from "@/hooks/use-toast";
import {
  PAGE_QUERY_KEY,
  type SubscriptionPage,
  type Tier,
  createEmptyTier,
  createSlugFromBusinessName,
  draftSubscriptionPage,
  getIncompleteTierNumbers,
  saveSubscriptionPage,
  subscriptionPagesQueryKey,
} from "../lib/subscriptionPage";

export const Route = createFileRoute("/new")({
  component: NewCheckoutPageRoute,
});

function NewCheckoutPageRoute() {
  return (
    <MerchantAuthGuard>
      <NewCheckoutPage />
    </MerchantAuthGuard>
  );
}

const pagePlaceholders = {
  businessName: "Business name",
  headline: "Your service/business description",
};

const tierPlaceholders = [
  {
    name: "Consultation",
    description: "One-time service or item.",
    price: "75",
  },
  {
    name: "Service package",
    description: "Recurring item or retained service.",
    price: "250",
  },
  {
    name: "Custom project",
    description: "Higher-touch work priced separately.",
    price: "1000",
  },
];

const requiredPageFields = [
  { label: "Business name", key: "businessName" },
] as const;

function createBlankPage(): SubscriptionPage {
  return {
    ...draftSubscriptionPage,
    tiers: draftSubscriptionPage.tiers.map((tier) => ({
      ...tier,
    })),
  };
}

function NewCheckoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const {
    walletAddress: merchantWalletAddress,
    walletReady: merchantWalletReady,
  } = useMerchantAuth();
  const saveSubscriptionPageFn = useServerFn(saveSubscriptionPage);
  const [page, setPage] = useState<SubscriptionPage>(() => createBlankPage());

  const savePage = useMutation({
    mutationFn: (nextPage: SubscriptionPage) =>
      saveSubscriptionPageFn({ data: nextPage }),
    onSuccess: async (nextPage) => {
      queryClient.setQueryData(PAGE_QUERY_KEY, nextPage);
      await queryClient.invalidateQueries({
        queryKey: subscriptionPagesQueryKey(merchantWalletAddress),
      });
      toast({
        title: "USDC checkout created",
        description: `${nextPage.businessName} is ready to accept Solana USDC.`,
      });
      await navigate({ to: "/dashboard" });
    },
    onError: (error) => {
      toast({
        title: "Page was not saved",
        description:
          error instanceof Error
            ? error.message
            : "Check your database connection and try again.",
      });
    },
  });

  const updatePage = (recipe: (page: SubscriptionPage) => SubscriptionPage) => {
    setPage((current) => recipe(current));
  };

  const publishPage = () => {
    const pageToSave = {
      ...page,
      walletAddress: merchantWalletAddress,
      subheadline: "",
    };

    if (!merchantWalletReady) {
      toast({
        title: "Wallet is not ready yet",
        description: "Wait a moment for Privy to finish loading your wallet.",
      });
      return;
    }

    if (!merchantWalletAddress.trim()) {
      toast({
        title: "No merchant wallet found",
        description:
          "Sign in again so Privy can attach a Solana wallet to your account.",
      });
      return;
    }

    const missingFields = requiredPageFields
      .filter((field) => !pageToSave[field.key].trim())
      .map((field) => field.label);

    if (missingFields.length > 0) {
      toast({
        title: "Required details missing",
        description: `Add: ${missingFields.join(", ")}`,
      });
      return;
    }

    const incompleteTierNumbers = getIncompleteTierNumbers(pageToSave);

    if (incompleteTierNumbers.length > 0) {
      toast({
        title: "Tier details missing",
        description: `Fill out tier ${incompleteTierNumbers.join(
          ", ",
        )}: name and price.`,
      });
      return;
    }

    if (pageToSave.tiers.length === 0) {
      toast({
        title: "No pricing tiers",
        description:
          "Add at least one item or service price before publishing.",
      });
      return;
    }

    savePage.mutate(pageToSave);
  };

  return (
    <main className="page-wrap px-4 py-8">
      <section className="mb-6">
        <div>
          <h1 className="mb-3 max-w-4xl text-xxl font-bold tracking-tight text-(--sea-ink) sm:text-3xl">
            New Checkout page for your business.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-(--sea-ink-soft)">
            Create a pricing tier for each item, package, or service customers
            can pay for.
          </p>
        </div>
      </section>

      <section className="grid items-start gap-5 xl:grid-cols-[410px_1fr]">
        <div className="xl:sticky xl:top-24">
          <Panel title="Business Information" icon={<LinkIcon size={17} />}>
            <Field
              label="Business name"
              value={page.businessName}
              placeholder={pagePlaceholders.businessName}
              required
              onChange={(businessName) =>
                updatePage((current) => ({
                  ...current,
                  businessName,
                  slug: createSlugFromBusinessName(businessName),
                }))
              }
            />
            <TextArea
              label="Headline"
              value={page.headline}
              placeholder={pagePlaceholders.headline}
              onChange={(headline) =>
                updatePage((current) => ({ ...current, headline }))
              }
            />
            <div className="border-t border-(--line) pt-3">
              <Button
                type="button"
                className="w-full"
                disabled={savePage.isPending || !merchantWalletReady}
                onClick={publishPage}
              >
                <Save size={15} aria-hidden="true" />
                {savePage.isPending
                  ? "Publishing..."
                  : merchantWalletReady
                    ? "Publish checkout page"
                    : "Preparing wallet..."}
              </Button>
            </div>
          </Panel>
        </div>

        <PricingPreview page={page} updatePage={updatePage} />
      </section>
    </main>
  );
}

function Panel({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="island-shell rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="m-0 flex items-center gap-2 text-base font-bold text-(--sea-ink)">
          {icon}
          {title}
        </h2>
        {action}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  value,
  placeholder,
  required = false,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <input
        className="field-input"
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  placeholder,
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="field-label">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </span>
      <textarea
        className="field-input min-h-24 resize-y leading-6"
        value={value}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function PricingPreview({
  page,
  updatePage,
}: {
  page: SubscriptionPage;
  updatePage: (recipe: (page: SubscriptionPage) => SubscriptionPage) => void;
}) {
  const updateTier = (id: string, patch: Partial<Tier>) => {
    updatePage((current) => ({
      ...current,
      tiers: current.tiers.map((tier) =>
        tier.id === id ? { ...tier, ...patch } : tier,
      ),
    }));
  };

  const addTier = () => {
    updatePage((current) => ({
      ...current,
      tiers: [...current.tiers, createEmptyTier()],
    }));
  };

  const removeTier = (id: string) => {
    updatePage((current) => ({
      ...current,
      tiers: current.tiers.filter((tier) => tier.id !== id),
    }));
  };

  const renderTierEditor = (tier: Tier, index: number) => {
    const placeholders =
      tierPlaceholders[index] ?? tierPlaceholders[tierPlaceholders.length - 1];

    return (
      <article
        key={tier.id}
        className="rounded-lg border border-(--line) bg-white p-3"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="m-0 text-sm font-black text-(--sea-ink)">
            Tier {index + 1}
          </p>
          <Button
            type="button"
            size="icon"
            variant="outline"
            title="Remove tier"
            disabled={page.tiers.length <= 1}
            onClick={() => removeTier(tier.id)}
          >
            <Trash2 size={15} aria-hidden="true" />
            <span className="sr-only">Remove tier</span>
          </Button>
        </div>

        <div className="grid gap-2 lg:grid-cols-[1fr_150px]">
          <label className="block">
            <span className="field-label">
              Item or service <span aria-hidden="true">*</span>
            </span>
            <input
              className="field-input field-input-compact"
              value={tier.name}
              placeholder={placeholders.name}
              onChange={(event) =>
                updateTier(tier.id, { name: event.target.value })
              }
            />
          </label>

          <label className="block">
            <span className="field-label">
              Price <span aria-hidden="true">*</span>
            </span>
            <span className="flex min-h-10 items-center gap-1 rounded-md border border-black bg-white px-3">
              <span className="font-black">{page.currency}</span>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-base font-black outline-none"
                type="number"
                value={tier.price > 0 ? String(tier.price) : ""}
                placeholder={placeholders.price}
                onChange={(event) =>
                  updateTier(tier.id, { price: Number(event.target.value) })
                }
              />
            </span>
          </label>
        </div>

        <label className="mt-2 block">
          <span className="field-label">Description</span>
          <input
            className="field-input field-input-compact"
            value={tier.description}
            placeholder={placeholders.description}
            onChange={(event) =>
              updateTier(tier.id, { description: event.target.value })
            }
          />
        </label>
      </article>
    );
  };

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-lg border border-(--line) bg-white xl:max-h-[calc(100vh-8rem)]">
      <div className="shrink-0 border-t-5 border-black bg-white p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="m-0 text-2xl font-bold text-black">
              {page.businessName || pagePlaceholders.businessName}
            </p>
            <h2 className="mb-2 mt-2 max-w-3xl text-sm font-bold text-slate-950">
              {page.headline || pagePlaceholders.headline}
            </h2>
          </div>

          <Button type="button" variant="outline" onClick={addTier}>
            <Plus size={16} aria-hidden="true" />
            Add tier
          </Button>
        </div>
      </div>

      <div className="grid gap-3 overflow-y-auto border-t border-(--line) p-4">
        {page.tiers.map(renderTierEditor)}
      </div>
    </section>
  );
}
