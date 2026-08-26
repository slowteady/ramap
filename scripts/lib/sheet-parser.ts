import {
  AMENITIES,
  FORMS,
  LINEAGES,
  SOUPS,
  type TaxonomyItem,
} from "../../src/entities/shop/model/taxonomy";
import type {
  Confidence,
  CoordSource,
  Menu,
  Shop,
  ShopStatus,
  Verification,
} from "../../src/entities/shop/model/types";

export const SHEET_HEADER = [
  "id",
  "상호",
  "지점명",
  "주소",
  "시",
  "구",
  "동네라벨",
  "lat",
  "lng",
  "좌표출처",
  "영업시간",
  "브레이크",
  "휴무",
  "오픈일",
  "상태",
  "상태변경일",
  "형태",
  "형태_대표",
  "스프",
  "스프_대표",
  "스프_세부",
  "계보",
  "편의",
  "태깅확신도",
  "대표메뉴1",
  "대표메뉴2",
  "대표메뉴3",
  "좌석",
  "한줄소개",
  "인스타",
  "네이버플레이스",
  "웨이팅링크",
  "검증상태",
  "최종확인일",
  "정보출처",
  "메모",
] as const;

export type RowIssue = { row: number; field: string; message: string };
export type ParseResult = { shops: Shop[]; issues: RowIssue[] };

const STATUS_MAP: Record<string, ShopStatus> = {
  영업: "open",
  휴업: "paused",
  폐업: "closed",
};
const VERIFICATION_MAP: Record<string, Verification> = {
  운영자확인: "confirmed",
  제보검토중: "pending",
};
const CONFIDENCE_MAP: Record<string, Confidence> = {
  확정: "certain",
  추정: "estimated",
};
const COORD_SOURCE_MAP: Record<string, CoordSource> = {
  LOCALDATA: "localdata",
  수동핀: "manual-pin",
};

function slugMap(items: readonly TaxonomyItem[]): Map<string, string> {
  return new Map(items.map((i) => [i.label, i.slug]));
}

const FORM_SLUGS = slugMap(FORMS);
const SOUP_SLUGS = slugMap(SOUPS);
const LINEAGE_SLUGS = slugMap(LINEAGES);
const AMENITY_SLUGS = slugMap(AMENITIES);

type Ctx = { row: number; issues: RowIssue[] };

function splitList(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function mapLabels(
  raw: string,
  field: string,
  map: Map<string, string>,
  ctx: Ctx,
): string[] {
  const slugs: string[] = [];
  for (const label of splitList(raw)) {
    const slug = map.get(label);
    if (!slug) {
      ctx.issues.push({ row: ctx.row, field, message: `미지의 값: ${label}` });
      continue;
    }
    slugs.push(slug);
  }
  return slugs;
}

function optional(raw: string): string | null {
  const v = raw.trim();
  return v === "" ? null : v;
}

function parseNumber(raw: string, field: string, ctx: Ctx): number | null {
  const v = raw.trim();
  if (v === "") return null;
  const n = Number(v);
  if (Number.isNaN(n)) {
    ctx.issues.push({ row: ctx.row, field, message: `숫자가 아님: ${v}` });
    return null;
  }
  return n;
}

function parseMenus(cells: Record<string, string>, ctx: Ctx): Menu[] {
  const menus: Menu[] = [];
  for (const field of ["대표메뉴1", "대표메뉴2", "대표메뉴3"]) {
    const raw = cells[field]?.trim();
    if (!raw) continue;
    const [name, price] = raw.split("|").map((s) => s.trim());
    if (!name || price === undefined || Number.isNaN(Number(price))) {
      ctx.issues.push({
        row: ctx.row,
        field,
        message: `형식은 "이름|가격": ${raw}`,
      });
      continue;
    }
    menus.push({ name, price: Number(price) });
  }
  return menus;
}

function mapEnum<T>(
  raw: string,
  field: string,
  map: Record<string, T>,
  fallback: T,
  ctx: Ctx,
): T {
  const v = raw.trim();
  if (v === "") return fallback;
  const mapped = map[v];
  if (mapped === undefined) {
    ctx.issues.push({ row: ctx.row, field, message: `허용되지 않는 값: ${v}` });
    return fallback;
  }
  return mapped;
}

export function parseSheetTsv(tsv: string): ParseResult {
  const lines = tsv.split(/\r?\n/).filter((l) => l.trim() !== "");
  const issues: RowIssue[] = [];
  const shops: Shop[] = [];
  const seenIds = new Set<string>();

  const header = lines[0]?.split("\t") ?? [];
  if (header.join("\t") !== SHEET_HEADER.join("\t")) {
    issues.push({
      row: 1,
      field: "header",
      message: "헤더가 15번 스키마와 다름",
    });
    return { shops, issues };
  }

  for (let i = 1; i < lines.length; i += 1) {
    const rowNo = i + 1;
    const ctx: Ctx = { row: rowNo, issues: [] };
    const values = lines[i].split("\t");
    const cells: Record<string, string> = {};
    SHEET_HEADER.forEach((h, idx) => {
      cells[h] = values[idx] ?? "";
    });

    const id = cells.id.trim();
    if (!/^[a-z0-9][a-z0-9-]*$/.test(id)) {
      ctx.issues.push({
        row: rowNo,
        field: "id",
        message: `로마자 슬러그 형식 아님: ${id}`,
      });
    } else if (seenIds.has(id)) {
      ctx.issues.push({ row: rowNo, field: "id", message: `중복 id: ${id}` });
    }

    const forms = mapLabels(cells.형태, "형태", FORM_SLUGS, ctx);
    const primaryForm = FORM_SLUGS.get(cells.형태_대표.trim());
    if (!primaryForm || !forms.includes(primaryForm)) {
      ctx.issues.push({
        row: rowNo,
        field: "형태_대표",
        message: `형태 목록에 없는 대표값: ${cells.형태_대표}`,
      });
    }
    const soups = mapLabels(cells.스프, "스프", SOUP_SLUGS, ctx);
    const primarySoup = SOUP_SLUGS.get(cells.스프_대표.trim());
    if (!primarySoup || !soups.includes(primarySoup)) {
      ctx.issues.push({
        row: rowNo,
        field: "스프_대표",
        message: `스프 목록에 없는 대표값: ${cells.스프_대표}`,
      });
    }
    const lineages = mapLabels(cells.계보, "계보", LINEAGE_SLUGS, ctx);
    const amenities = mapLabels(cells.편의, "편의", AMENITY_SLUGS, ctx);

    const lat = parseNumber(cells.lat, "lat", ctx);
    const lng = parseNumber(cells.lng, "lng", ctx);
    const menus = parseMenus(cells, ctx);

    const status = mapEnum(cells.상태, "상태", STATUS_MAP, "open", ctx);
    const verification = mapEnum(
      cells.검증상태,
      "검증상태",
      VERIFICATION_MAP,
      "pending",
      ctx,
    );
    const confidence = mapEnum(
      cells.태깅확신도,
      "태깅확신도",
      CONFIDENCE_MAP,
      "estimated",
      ctx,
    );
    const coordSourceRaw = cells.좌표출처.trim();
    const coordSource =
      coordSourceRaw === "" ? null : (COORD_SOURCE_MAP[coordSourceRaw] ?? null);
    if (coordSourceRaw !== "" && coordSource === null) {
      ctx.issues.push({
        row: rowNo,
        field: "좌표출처",
        message: `허용되지 않는 값: ${coordSourceRaw}`,
      });
    }

    if (ctx.issues.length > 0) {
      issues.push(...ctx.issues);
      continue;
    }

    seenIds.add(id);
    shops.push({
      id,
      name: cells.상호.trim(),
      branch: optional(cells.지점명),
      address: optional(cells.주소),
      city: optional(cells.시),
      district: optional(cells.구),
      areaLabel: optional(cells.동네라벨),
      lat,
      lng,
      coordSource,
      hours: optional(cells.영업시간),
      breakTime: optional(cells.브레이크),
      closedDays: optional(cells.휴무),
      openedAt: optional(cells.오픈일),
      status,
      statusChangedAt: optional(cells.상태변경일),
      forms: forms as Shop["forms"],
      primaryForm: primaryForm as Shop["primaryForm"],
      soups: soups as Shop["soups"],
      primarySoup: primarySoup as Shop["primarySoup"],
      soupDetail: splitList(cells.스프_세부),
      lineages: lineages as Shop["lineages"],
      amenities: amenities as Shop["amenities"],
      confidence,
      menus,
      seats: optional(cells.좌석),
      tagline: optional(cells.한줄소개),
      instagram: optional(cells.인스타),
      naverPlace: optional(cells.네이버플레이스),
      waitingLink: optional(cells.웨이팅링크),
      verification,
      lastVerifiedAt: optional(cells.최종확인일),
      source: optional(cells.정보출처),
      note: optional(cells.메모),
    });
  }

  return { shops, issues };
}
