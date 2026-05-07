import { createServerFn } from "@tanstack/react-start";

export type Tier = {
  id: string;
  name: string;
  description: string;
  price: number;
  cta: string;
  featured: boolean;
  features: string[];
};

export type SubscriptionPage = {
  slug: string;
  businessName: string;
  headline: string;
  subheadline: string;
  accentColor: string;
  backgroundColor: string;
  currency: string;
  checkoutUrl: string;
  walletAddress: string;
  tiers: Tier[];
};

export const PAGE_QUERY_KEY = ["subscription-page", "active"];
export const PAGES_QUERY_KEY = ["subscription-pages"];

export const draftTiers: Tier[] = [
  {
    id: "item-1",
    name: "",
    description: "",
    price: 0,
    cta: "",
    featured: false,
    features: [],
  },
  {
    id: "item-2",
    name: "",
    description: "",
    price: 0,
    cta: "",
    featured: false,
    features: [],
  },
];

export const draftSubscriptionPage: SubscriptionPage = {
  slug: "",
  businessName: "",
  headline: "",
  subheadline: "",
  accentColor: "#000000",
  backgroundColor: "#ffffff",
  currency: "$",
  checkoutUrl: "",
  walletAddress: "",
  tiers: draftTiers,
};

export function createEmptyTier(): Tier {
  return {
    id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
    name: "",
    description: "",
    price: 49,
    cta: "",
    featured: false,
    features: [],
  };
}

export function createSlugFromBusinessName(businessName: string) {
  return businessName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeSubscriptionPage(
  page: SubscriptionPage,
): SubscriptionPage {
  return {
    ...draftSubscriptionPage,
    ...page,
    slug: createSlugFromBusinessName(page.businessName) || page.slug.trim(),
    currency: "$",
    tiers: page.tiers.map((tier) => ({
      ...tier,
      features: tier.features.map((feature) => feature.trim()).filter(Boolean),
    })),
  };
}

export function getIncompleteTierNumbers(page: SubscriptionPage) {
  return page.tiers.flatMap((tier, index) => {
    const isComplete = tier.name.trim() && tier.price > 0;

    return isComplete ? [] : [index + 1];
  });
}

export function selectSubscriptionPageTier(
  page: SubscriptionPage,
  tier?: string,
): SubscriptionPage | undefined {
  const tierKey = tier?.trim();

  if (!tierKey) {
    return page;
  }

  const tierNumber = Number(tierKey);
  const selectedTier =
    Number.isInteger(tierNumber) && tierNumber > 0
      ? page.tiers[tierNumber - 1]
      : page.tiers.find((item) => item.id === tierKey);

  if (!selectedTier) {
    return undefined;
  }

  return {
    ...page,
    tiers: [selectedTier],
  };
}

export function assertSubscriptionPageCanBeSaved(page: SubscriptionPage) {
  const missingPageFields = [
    page.businessName.trim() ? "" : "business name",
    page.walletAddress.trim() ? "" : "USDC receiving wallet",
  ].filter(Boolean);

  if (missingPageFields.length > 0) {
    throw new Error(`Add ${missingPageFields.join(", ")} before publishing.`);
  }

  const incompleteTierNumbers = getIncompleteTierNumbers(page);

  if (page.tiers.length === 0) {
    throw new Error("Add at least one pricing tier before publishing.");
  }

  if (incompleteTierNumbers.length > 0) {
    throw new Error(
      `Add a name and price for tier ${incompleteTierNumbers.join(
        ", ",
      )} before publishing.`,
    );
  }
}

export const listSubscriptionPages = createServerFn({ method: "GET" }).handler(
  async () => {
    const { listSubscriptionPagesFromDatabase } =
      await import("./subscriptionPage.server");

    return listSubscriptionPagesFromDatabase();
  },
);

export const getSubscriptionPage = createServerFn({ method: "GET" })
  .inputValidator((data: { slug?: string } | undefined) => data ?? {})
  .handler(async ({ data }): Promise<SubscriptionPage | undefined> => {
    const { getSubscriptionPageFromDatabase } =
      await import("./subscriptionPage.server");

    return getSubscriptionPageFromDatabase(data.slug);
  });

export const findSubscriptionPage = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string; tier?: string }) => data)
  .handler(async ({ data }) => {
    const { findSubscriptionPageInDatabase } =
      await import("./subscriptionPage.server");

    return findSubscriptionPageInDatabase(data.slug, data.tier);
  });

export const saveSubscriptionPage = createServerFn({ method: "POST" })
  .inputValidator((data: SubscriptionPage) => data)
  .handler(async ({ data }) => {
    assertSubscriptionPageCanBeSaved(data);

    const { saveSubscriptionPageToDatabase } =
      await import("./subscriptionPage.server");

    return saveSubscriptionPageToDatabase(data);
  });

export function getPublicPagePath(slug: string) {
  return `/business/${slug}`;
}
