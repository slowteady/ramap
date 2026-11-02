import { normalizeShopName } from "./merge-candidates";
import { roadCore } from "./refresh";

export type ExistenceVerdict = "card" | "recent" | "stale" | "none";

export type EvidenceSearch = {
  place: { status: string; card: string } | null;
  snippets: { text: string; date: string | null }[];
};

export const DIRECTORY_PATTERN =
  /diningcode|다이닝코드|medicalmap|메디컬맵|carmap|카맵|kdokplace|dokdokplace|114-service|타운커넥트|순위닷|soonwidot|udanax|업체창고|지역누리|kaia\.re|polle\.com|moneypin|kkuda|꾸다체크|siksinhot|open-maru|bizno|상가 목록|성업 중/;

const OPEN_STATUSES = new Set(["영업중", "영업종료", "영업전", "오늘쉼"]);

export function normalizeSnippetDate(date: string | null): string | null {
  if (!date) return null;
  return date.replace(/\./g, "-");
}

export function isDirectorySnippet(text: string): boolean {
  return DIRECTORY_PATTERN.test(text);
}

const compact = (text: string) => text.replace(/\s+/g, "");

export function classifyExistence(
  address: string,
  searches: EvidenceSearch[],
  cutoff: string,
): { verdict: ExistenceVerdict; lastDate: string | null } {
  const road = roadCore(address);
  if (!road) return { verdict: "none", lastDate: null };

  const hasCard = searches.some(
    (s) =>
      s.place !== null &&
      OPEN_STATUSES.has(s.place.status) &&
      compact(s.place.card).includes(road),
  );

  const dates = searches
    .flatMap((s) => s.snippets)
    .filter(
      (sn) => !isDirectorySnippet(sn.text) && compact(sn.text).includes(road),
    )
    .map((sn) => normalizeSnippetDate(sn.date))
    .filter((d): d is string => d !== null)
    .sort();
  const lastDate = dates.at(-1) ?? null;

  if (hasCard) return { verdict: "card", lastDate };
  if (lastDate && lastDate >= cutoff) return { verdict: "recent", lastDate };
  if (lastDate) return { verdict: "stale", lastDate };
  return { verdict: "none", lastDate: null };
}

export function isWeakShop(shop: {
  hours: string | null;
  menus: unknown[] | null;
  instagram: string | null;
}): boolean {
  return !shop.hours && (shop.menus ?? []).length === 0 && !shop.instagram;
}

type TargetShop = {
  id: string;
  name: string;
  branch: string | null;
  address: string;
  status: string;
  hours: string | null;
  menus: unknown[] | null;
  instagram: string | null;
};

const shopKey = (name: string, branch: string | null, address: string) =>
  `${normalizeShopName(`${name}${branch ?? ""}`)}|${roadCore(address) ?? address}`;

export function selectExistenceTargets<T extends TargetShop>(
  shops: T[],
  goneFromRegistry: { name: string; branch: string; address: string }[],
): T[] {
  const gone = new Set(
    goneFromRegistry.map((r) => shopKey(r.name, r.branch, r.address)),
  );
  return shops.filter(
    (s) =>
      s.status === "open" &&
      isWeakShop(s) &&
      gone.has(shopKey(s.name, s.branch, s.address)),
  );
}
