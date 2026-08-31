import type {
  AmenitySlug,
  FormSlug,
  LineageSlug,
  SoupSlug,
} from "@/entities/shop";

export type ReportTarget = {
  id: string;
  name: string;
  location: string | null;
};

export type LatLng = { lat: number; lng: number };

type GenreDraft = {
  soups: SoupSlug[];
  forms: FormSlug[];
  lineages: LineageSlug[];
};

export type MenuDraft = { name: string; price: string };

/* 필드는 15번 태깅 시트 컬럼과 1:1 — 검수가 조사가 아니라 복붙 확인이 되도록 */
export type NewReportDraft = GenreDraft & {
  shopName: string;
  branch: string;
  location: string;
  pin: LatLng | null;
  menus: MenuDraft[];
  hours: string;
  breakTime: string;
  closedDays: string[];
  amenities: AmenitySlug[];
  seats: string;
  photos: File[];
  photoConsent: boolean;
  instagram: string;
  naverPlace: string;
  waitingLink: string;
  message: string;
};

export const MAX_MENUS = 3;
export const MAX_PHOTOS = 5;

export const EDIT_ITEMS = [
  { key: "closed", label: "폐업·휴업했어요" },
  { key: "hours", label: "영업시간이 달라요" },
  { key: "menu", label: "메뉴·가격이 달라요" },
  { key: "genre", label: "장르가 달라요" },
  { key: "amenities", label: "편의 정보가 달라요" },
  { key: "location", label: "위치가 달라요" },
  { key: "etc", label: "기타" },
] as const;

export type EditItem = (typeof EDIT_ITEMS)[number]["key"];
export type ClosedStatus = "closed" | "paused";

export type EditReportDraft = GenreDraft & {
  items: EditItem[];
  closedStatus: ClosedStatus;
  closedEvidence: string;
  hours: string;
  menu: string;
  location: string;
  amenities: AmenitySlug[];
  message: string;
};

export type NewReportPayload = {
  type: "new";
  shopName: string;
  location: string;
  branch?: string;
  pin?: LatLng;
  soups?: SoupSlug[];
  forms?: FormSlug[];
  lineages?: LineageSlug[];
  menus?: { name: string; price: number | null }[];
  hours?: string;
  breakTime?: string;
  closedDays?: string[];
  amenities?: AmenitySlug[];
  seats?: string;
  photos?: string[];
  instagram?: string;
  naverPlace?: string;
  waitingLink?: string;
  message?: string;
};

export type EditReportFields = {
  closed?: { status: ClosedStatus; evidence?: string };
  hours?: string;
  menu?: string;
  location?: string;
  genre?: Partial<GenreDraft>;
  amenities?: AmenitySlug[];
};

export type EditReportPayload = {
  type: "edit";
  shopId: string;
  shopName: string;
  items: EditItem[];
  fields: EditReportFields;
  message?: string;
};

export type ReportPayload = NewReportPayload | EditReportPayload;

export type ReportRow = {
  type: ReportPayload["type"];
  shop_name: string;
  location: string;
  message: string | null;
  details: ReportPayload;
};

export const EMPTY_MENU: MenuDraft = { name: "", price: "" };

export const EMPTY_NEW_DRAFT: NewReportDraft = {
  shopName: "",
  branch: "",
  location: "",
  pin: null,
  soups: [],
  forms: [],
  lineages: [],
  menus: [EMPTY_MENU],
  hours: "",
  breakTime: "",
  closedDays: [],
  amenities: [],
  seats: "",
  photos: [],
  photoConsent: false,
  instagram: "",
  naverPlace: "",
  waitingLink: "",
  message: "",
};

export const EMPTY_EDIT_DRAFT: EditReportDraft = {
  items: [],
  closedStatus: "closed",
  closedEvidence: "",
  hours: "",
  menu: "",
  location: "",
  soups: [],
  forms: [],
  lineages: [],
  amenities: [],
  message: "",
};

const text = (s: string): string | undefined => s.trim() || undefined;
const list = <T>(a: T[]): T[] | undefined => (a.length > 0 ? a : undefined);
const field = <K extends string, V>(key: K, value: V | undefined) =>
  value === undefined ? {} : ({ [key]: value } as Record<K, V>);

function parsePrice(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

function genreOf(d: GenreDraft): Partial<GenreDraft> | undefined {
  const genre = {
    ...field("soups", list(d.soups)),
    ...field("forms", list(d.forms)),
    ...field("lineages", list(d.lineages)),
  };
  return Object.keys(genre).length > 0 ? genre : undefined;
}

export function canSubmitNew(d: NewReportDraft): boolean {
  if (d.shopName.trim() === "" || d.location.trim() === "") return false;
  return d.photos.length === 0 || d.photoConsent;
}

export function buildNewPayload(
  d: NewReportDraft,
  photoPaths: string[],
): NewReportPayload {
  const menus = d.menus
    .filter((m) => m.name.trim() !== "")
    .map((m) => ({ name: m.name.trim(), price: parsePrice(m.price) }));
  return {
    type: "new",
    shopName: d.shopName.trim(),
    location: d.location.trim(),
    ...field("branch", text(d.branch)),
    ...field("pin", d.pin ?? undefined),
    ...genreOf(d),
    ...field("menus", list(menus)),
    ...field("hours", text(d.hours)),
    ...field("breakTime", text(d.breakTime)),
    ...field("closedDays", list(d.closedDays)),
    ...field("amenities", list(d.amenities)),
    ...field("seats", text(d.seats)),
    ...field("photos", list(photoPaths)),
    ...field("instagram", text(d.instagram)),
    ...field("naverPlace", text(d.naverPlace)),
    ...field("waitingLink", text(d.waitingLink)),
    ...field("message", text(d.message)),
  };
}

export function canSubmitEdit(d: EditReportDraft): boolean {
  if (d.items.length === 0) return false;
  const onlyEtc = d.items.length === 1 && d.items[0] === "etc";
  return !onlyEtc || d.message.trim() !== "";
}

export function buildEditPayload(
  target: ReportTarget,
  d: EditReportDraft,
): EditReportPayload {
  const has = (item: EditItem) => d.items.includes(item);
  const evidence = text(d.closedEvidence);
  const fields: EditReportFields = {
    ...(has("closed") && {
      closed: { status: d.closedStatus, ...field("evidence", evidence) },
    }),
    ...(has("hours") && field("hours", text(d.hours))),
    ...(has("menu") && field("menu", text(d.menu))),
    ...(has("location") && field("location", text(d.location))),
    ...(has("genre") && field("genre", genreOf(d))),
    ...(has("amenities") && field("amenities", list(d.amenities))),
  };
  return {
    type: "edit",
    shopId: target.id,
    shopName: target.name,
    items: d.items,
    fields,
    ...field("message", text(d.message)),
  };
}

export function toReportRow(
  payload: ReportPayload,
  target?: ReportTarget,
): ReportRow {
  const [shopName, location] =
    payload.type === "new"
      ? [payload.shopName, payload.location]
      : [
          target?.name ?? payload.shopName,
          target?.location ?? target?.id ?? payload.shopId,
        ];
  return {
    type: payload.type,
    shop_name: shopName,
    location,
    message: payload.message ?? null,
    details: payload,
  };
}
