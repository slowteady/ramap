import type { AmenitySlug, FormSlug, LineageSlug, SoupSlug } from "@/lib/taxonomy";

export type ShopStatus = "open" | "paused" | "closed";
export type Verification = "confirmed" | "pending";
export type Confidence = "certain" | "estimated";
export type CoordSource = "localdata" | "manual-pin";

export type Menu = {
  name: string;
  price: number | null;
};

export type Shop = {
  id: string;
  name: string;
  branch: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  areaLabel: string | null;
  lat: number | null;
  lng: number | null;
  coordSource: CoordSource | null;

  hours: string | null;
  breakTime: string | null;
  closedDays: string | null;
  openedAt: string | null;
  status: ShopStatus;
  statusChangedAt: string | null;

  forms: FormSlug[];
  primaryForm: FormSlug;
  soups: SoupSlug[];
  primarySoup: SoupSlug;
  soupDetail: string[];
  lineages: LineageSlug[];
  amenities: AmenitySlug[];
  confidence: Confidence;

  menus: Menu[];
  seats: string | null;
  tagline: string | null;
  instagram: string | null;
  naverPlace: string | null;
  waitingLink: string | null;

  verification: Verification;
  lastVerifiedAt: string | null;
  source: string | null;
  note: string | null;
};

export type ShopList = {
  id: string;
  name: string;
  criteria: string;
  shopIds: string[];
  visibility: "public" | "draft";
};
