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

/* 링크 우선(라멘투데이 모델): 영업시간·메뉴·주소는 링크에서 파트너가 확인 — 사용자에게 다시 묻지 않는다 */
export type NewReportDraft = GenreDraft & {
  shopName: string;
  links: string[];
  pin: LatLng | null;
  photos: File[];
  photoConsent: boolean;
  message: string;
};

export const MAX_LINKS = 3;
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
  links?: string[];
  pin?: LatLng;
  soups?: SoupSlug[];
  forms?: FormSlug[];
  lineages?: LineageSlug[];
  photos?: string[];
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

export const EMPTY_NEW_DRAFT: NewReportDraft = {
  shopName: "",
  links: [""],
  pin: null,
  soups: [],
  forms: [],
  lineages: [],
  photos: [],
  photoConsent: false,
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

function genreOf(d: GenreDraft): Partial<GenreDraft> | undefined {
  const genre = {
    ...field("soups", list(d.soups)),
    ...field("forms", list(d.forms)),
    ...field("lineages", list(d.lineages)),
  };
  return Object.keys(genre).length > 0 ? genre : undefined;
}

const cleanLinks = (links: string[]) =>
  links.map((l) => l.trim()).filter((l) => l !== "");

export function canSubmitNew(d: NewReportDraft): boolean {
  if (d.shopName.trim() === "") return false;
  if (cleanLinks(d.links).length === 0 && !d.pin) return false;
  return d.photos.length === 0 || d.photoConsent;
}

export function buildNewPayload(
  d: NewReportDraft,
  photoPaths: string[],
): NewReportPayload {
  return {
    type: "new",
    shopName: d.shopName.trim(),
    ...field("links", list(cleanLinks(d.links))),
    ...field("pin", d.pin ?? undefined),
    ...genreOf(d),
    ...field("photos", list(photoPaths)),
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
      ? [
          payload.shopName,
          payload.links?.[0] ??
            (payload.pin ? `${payload.pin.lat},${payload.pin.lng}` : ""),
        ]
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
