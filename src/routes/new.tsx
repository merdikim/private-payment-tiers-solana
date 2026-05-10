import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type ReactNode } from "react";
import { Link as LinkIcon, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MerchantAuthGuard } from "@/components/MerchantAuthGuard";
import { useMerchantAuth } from "@/components/merchantAuth";
import { useToast } from "@/hooks/use-toast";
import type { SubscriptionPage, Tier } from "@/types";
import {
  PAGE_QUERY_KEY,
  createEmptyTier,
  createSlugFromBusinessName,
  draftSubscriptionPage,
  getIncompleteTierNumbers,
  saveSubscriptionPage,
  subscriptionPagesQueryKey,
  uploadImage,
} from "../lib/subscriptionPage";
import PhotoPicker from "#/components/PhotoCardPicker";

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
  const uploadImageFn = useServerFn(uploadImage);
  const [page, setPage] = useState<SubscriptionPage>(() => createBlankPage());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const publishPage = async () => {
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

    // Upload image if selected
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const imageUrl = await uploadImageFn({ data: formData });
        pageToSave.imageUrl = imageUrl;
      } catch (error) {
        toast({
          title: "Image upload failed",
          description:
            error instanceof Error
              ? error.message
              : "Could not upload image. Please try again.",
        });
        return;
      }
    }

    savePage.mutate(pageToSave);
  };

  return (
    <main className="page-wrap px-4 py-10">
      <section className="mb-8">
        <div>
          <h1 className="mb-4 max-w-4xl text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Create a new checkout page
          </h1>
        </div>
      </section>

      <section className="grid items-start gap-8 xl:grid-cols-[420px_1fr]">
        <div className="xl:sticky xl:top-24">
          <Panel title="Business Information" icon={<LinkIcon size={20} />}>
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
            <div>
              <PhotoPicker
                onFileSelected={(file) => setSelectedFile(file)}
              />
            </div>
            <div className="border-t border-slate-200 pt-5">
              <Button
                type="button"
                className="w-full"
                size="lg"
                disabled={savePage.isPending || !merchantWalletReady}
                onClick={publishPage}
              >
                <Save size={16} aria-hidden="true" />
                {savePage.isPending
                  ? "Publishing..."
                  : merchantWalletReady
                    ? "Publish page"
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
    <section className="island-shell rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="m-0 flex items-center gap-3 text-lg font-bold text-slate-900">
          <span className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 text-blue-600">
            {icon}
          </span>
          {title}
        </h2>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
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
      <span className="text-sm font-semibold text-slate-900 mb-2 block">
        {label}
        {required ? <span aria-hidden="true" className="text-red-600"> *</span> : null}
      </span>
      <input
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
      <span className="text-sm font-semibold text-slate-900 mb-2 block">
        {label}
        {required ? <span aria-hidden="true" className="text-red-600"> *</span> : null}
      </span>
      <textarea
        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y leading-6 min-h-24"
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
        className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-colors"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="m-0 text-base font-bold text-slate-900">
            Tier {index + 1}
          </p>
          <Button
            type="button"
            size="icon"
            variant="outline"
            title="Remove tier"
            disabled={page.tiers.length <= 1}
            onClick={() => removeTier(tier.id)}
            className="h-8 w-8"
          >
            <Trash2 size={16} aria-hidden="true" />
            <span className="sr-only">Remove tier</span>
          </Button>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_160px]">
          <label className="block">
            <span className="text-sm font-semibold text-slate-900 mb-2 block">
              Item or service <span aria-hidden="true" className="text-red-600">*</span>
            </span>
            <input
              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              value={tier.name}
              placeholder={placeholders.name}
              onChange={(event) =>
                updateTier(tier.id, { name: event.target.value })
              }
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-900 mb-2 block">
              Price <span aria-hidden="true" className="text-red-600">*</span>
            </span>
            <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
              <span className="text-sm font-semibold text-slate-600">{page.currency}</span>
              <input
                className="min-w-0 flex-1 border-0 bg-transparent text-base font-semibold text-slate-900 outline-none placeholder-slate-400"
                type="number"
                value={tier.price > 0 ? String(tier.price) : ""}
                placeholder={placeholders.price}
                onChange={(event) =>
                  updateTier(tier.id, { price: Number(event.target.value) })
                }
              />
            </div>
          </label>
        </div>

        <label className="mt-3 block">
          <span className="text-sm font-semibold text-slate-900 mb-2 block">Description</span>
          <input
            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
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
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white xl:max-h-[calc(100vh-8rem)] shadow-sm">
      <div className="shrink-0 border-b border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="m-0 text-2xl font-bold text-slate-900">
              {page.businessName || pagePlaceholders.businessName}
            </p>
            <p className="mb-0 mt-3 max-w-3xl text-base leading-7 text-slate-600">
              {page.headline || pagePlaceholders.headline}
            </p>
          </div>

          <Button type="button" variant="outline" onClick={addTier}>
            <Plus size={16} aria-hidden="true" />
            Add tier
          </Button>
        </div>
      </div>

      <div className="grid gap-3 overflow-y-auto p-6">
        {page.tiers.map(renderTierEditor)}
      </div>
    </section>
  );
}
