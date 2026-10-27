import dayjs, { type Dayjs } from "dayjs";
import type { Shop } from "@/entities/shop";
import type { AdminReport } from "./admin-api";

export type AdminShop = {
  id: string;
  name: string;
  branch: string | null;
  address: string | null;
  hours: string | null;
  breakTime: string | null;
  closedDays: string | null;
};

export function toAdminShops(shops: Shop[]): AdminShop[] {
  return shops.map((s) => ({
    id: s.id,
    name: s.name,
    branch: s.branch,
    address: s.address,
    hours: s.hours,
    breakTime: s.breakTime,
    closedDays: s.closedDays,
  }));
}

export type ParsedDetails = {
  shopId: string | null;
  branch: string | null;
  links: string[];
  pin: { lat: number; lng: number } | null;
  items: string[];
  fields: Record<string, unknown>;
};

export type ReportGroup = {
  primary: AdminReport;
  duplicates: AdminReport[];
};

export type EditRow = {
  label: string;
  current: string | null;
  proposed: string | null;
};

const LINK_LABELS: [RegExp, string][] = [
  [/(^|\.)naver\.(com|me)$/, "네이버 지도"],
  [/(^|\.)kakao\.com$|^kko\.to$/, "카카오맵"],
  [/(^|\.)instagram\.com$/, "인스타그램"],
];

const ITEM_LABELS: Record<string, string> = {
  closed: "폐업·휴업",
  hours: "영업시간",
  menu: "메뉴·가격",
  genre: "장르",
  amenities: "편의 정보",
  location: "위치",
  etc: "기타",
};

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const str = (v: unknown): string | null =>
  typeof v === "string" && v.trim() ? v : null;

export function linkLabel(raw: string): string {
  try {
    const host = new URL(raw).hostname.replace(/^www\./, "");
    return LINK_LABELS.find(([re]) => re.test(host))?.[1] ?? host;
  } catch {
    return raw;
  }
}

export function itemLabel(item: string): string {
  return ITEM_LABELS[item] ?? item;
}

export function parseDetails(details: unknown): ParsedDetails {
  const d = isRecord(details) ? details : {};
  const pin =
    isRecord(d.pin) &&
    typeof d.pin.lat === "number" &&
    typeof d.pin.lng === "number"
      ? { lat: d.pin.lat, lng: d.pin.lng }
      : null;
  const strings = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  return {
    shopId: str(d.shopId),
    branch: str(d.branch),
    links: strings(d.links),
    pin,
    items: strings(d.items),
    fields: isRecord(d.fields) ? d.fields : {},
  };
}

function groupKey(r: AdminReport): string {
  const d = parseDetails(r.details);
  if (r.type === "new") {
    const link = d.links[0];
    const url = link && URL.canParse(link) ? new URL(link) : null;
    if (url) return `${r.status}|link|${url.hostname}${url.pathname}`;
    return `${r.status}|name|${r.shopName.replace(/\s/g, "").toLowerCase()}`;
  }
  return `${r.status}|${r.type}|${d.shopId ?? r.shopName}`;
}

export function groupReports(reports: AdminReport[]): ReportGroup[] {
  const groups = new Map<string, AdminReport[]>();
  for (const r of reports) {
    const key = groupKey(r);
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  return [...groups.values()].map((list) => {
    const [primary, ...duplicates] = [...list].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    return { primary, duplicates };
  });
}

function proposedOf(value: unknown): string | null {
  if (typeof value === "string") return str(value);
  if (Array.isArray(value)) return value.length ? value.join(", ") : null;
  if (isRecord(value)) {
    if (value.status === "closed" || value.status === "paused") {
      const kind = value.status === "closed" ? "폐업" : "휴업";
      const evidence = str(value.evidence);
      return evidence ? `${kind} — ${evidence}` : kind;
    }
    const parts = Object.values(value).flatMap((v) =>
      Array.isArray(v) ? v : [v],
    );
    const text = parts.filter((p) => typeof p === "string").join(", ");
    return text || null;
  }
  return null;
}

function currentOf(item: string, shop: AdminShop | undefined): string | null {
  if (!shop) return null;
  if (item === "hours") {
    const parts = [
      shop.hours,
      shop.breakTime && `브레이크 ${shop.breakTime}`,
      shop.closedDays && `휴무 ${shop.closedDays}`,
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : null;
  }
  if (item === "location") return shop.address;
  return null;
}

export function editRows(
  details: Pick<ParsedDetails, "items" | "fields">,
  shop: AdminShop | undefined,
): EditRow[] {
  return details.items.map((item) => ({
    label: itemLabel(item),
    current: currentOf(item, shop),
    proposed: proposedOf(details.fields[item]),
  }));
}

export const REPORT_REJECT_REASONS = [
  "확인 불가",
  "라멘집 아님",
  "정보 불일치",
  "스팸",
] as const;

export const PHOTO_REJECT_REASONS = [
  "라멘이 안 보임",
  "본인 촬영 아님",
  "부적절",
] as const;

export function composeReason(chip: string | null, text: string): string {
  return [chip, text.trim()].filter(Boolean).join(" — ");
}

export function ageLabel(createdAt: string, now: Dayjs): string {
  const days = now.startOf("day").diff(dayjs(createdAt).startOf("day"), "day");
  return days <= 0 ? "오늘" : `${days}일 경과`;
}

const receivedAt = (g: ReportGroup) =>
  [g.primary, ...g.duplicates].map((r) => r.createdAt).sort()[0];

export function sortGroups(
  groups: ReportGroup[],
  status: AdminReport["status"],
): ReportGroup[] {
  return [...groups].sort((a, b) =>
    status === "open"
      ? receivedAt(a).localeCompare(receivedAt(b))
      : (b.primary.resolvedAt ?? "").localeCompare(a.primary.resolvedAt ?? ""),
  );
}
