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

type GenreDraft = {
  soups: SoupSlug[];
  forms: FormSlug[];
  lineages: LineageSlug[];
};

export type NewReportDraft = GenreDraft & {
  shopName: string;
  location: string;
  amenities: AmenitySlug[];
  hours: string;
  menuName: string;
  menuPrice: string;
  message: string;
};

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
  soups?: SoupSlug[];
  forms?: FormSlug[];
  lineages?: LineageSlug[];
  amenities?: AmenitySlug[];
  hours?: string;
  topMenu?: { name: string; price: number | null };
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
  location: "",
  soups: [],
  forms: [],
  lineages: [],
  amenities: [],
  hours: "",
  menuName: "",
  menuPrice: "",
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

function parsePrice(raw: string): number | null {
  const digits = raw.replace(/\D/g, "");
  return digits ? Number(digits) : null;
}

function genreOf(d: GenreDraft): Partial<GenreDraft> | undefined {
  const genre = {
    ...(list(d.soups) && { soups: d.soups }),
    ...(list(d.forms) && { forms: d.forms }),
    ...(list(d.lineages) && { lineages: d.lineages }),
  };
  return Object.keys(genre).length > 0 ? genre : undefined;
}

export function canSubmitNew(d: NewReportDraft): boolean {
  return d.shopName.trim() !== "" && d.location.trim() !== "";
}

export function buildNewPayload(d: NewReportDraft): NewReportPayload {
  const menuName = text(d.menuName);
  return {
    type: "new",
    shopName: d.shopName.trim(),
    location: d.location.trim(),
    ...genreOf(d),
    ...(list(d.amenities) && { amenities: d.amenities }),
    ...(text(d.hours) && { hours: d.hours.trim() }),
    ...(menuName && {
      topMenu: { name: menuName, price: parsePrice(d.menuPrice) },
    }),
    ...(text(d.message) && { message: d.message.trim() }),
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
  const genre = genreOf(d);
  const fields: EditReportFields = {
    ...(has("closed") && {
      closed: { status: d.closedStatus, ...(evidence && { evidence }) },
    }),
    ...(has("hours") && text(d.hours) && { hours: d.hours.trim() }),
    ...(has("menu") && text(d.menu) && { menu: d.menu.trim() }),
    ...(has("location") && text(d.location) && { location: d.location.trim() }),
    ...(has("genre") && genre && { genre }),
    ...(has("amenities") && list(d.amenities) && { amenities: d.amenities }),
  };
  return {
    type: "edit",
    shopId: target.id,
    shopName: target.name,
    items: d.items,
    fields,
    ...(text(d.message) && { message: d.message.trim() }),
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
