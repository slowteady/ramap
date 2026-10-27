import { romanize } from "es-hangul";
import { normalizeShopName } from "./merge-candidates";
import { SHEET_HEADER } from "./sheet-parser";

/* 조사·디깅 산출물(JSON) 스키마 — name 정규화 매칭으로 후보 TSV에 병합 */
export type Enrichment = {
  name: string;
  area?: string;
  /* true면 검색으로 상권을 확증한 것 — 주소 기반 사전 판정보다 우선 */
  areaConfirmed?: boolean;
  /* 동명 다지점 구분용 주소 조각(도로명 등) — 행 주소에 포함될 때만 위치 필드 병합 */
  addrHint?: string;
  soups?: string[];
  primarySoup?: string;
  forms?: string[];
  primaryForm?: string;
  soupDetail?: string[];
  lineages?: string[];
  instagram?: string;
  naverPlace?: string;
  openedAt?: string;
  hours?: string;
  breakTime?: string;
  closedDays?: string;
  seats?: string;
  menus?: string[];
  closed?: boolean;
  /* 재검증에서도 실존 흔적을 못 찾음 — 게재 게이트에서 보류 (addrHint와 함께 써서 해당 지점만) */
  unverified?: boolean;
  /* 범용 상호("라멘야")의 접두 일치 항목과 무관한 독립 매장 — 장르·인스타 체인 승계를 끊는다 */
  standalone?: boolean;
  /* 조사일(파일명 날짜) — 판정 마크의 최신 우선 판단용, 로더가 채운다 */
  observedAt?: string;
  /* 계보가 체인 전 지점의 사실일 때만 true — 없으면 계보는 정확 일치 매장에만 붙는다 */
  chainWide?: boolean;
  sourceNote?: string;
};

const SLUG_MAX = 40;

export function toSlug(
  name: string,
  branch: string,
  taken: Set<string>,
): string {
  const base =
    romanize(name + (branch ? `-${branch}` : ""))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, SLUG_MAX) || "shop";
  let slug = base;
  let n = 2;
  while (taken.has(slug)) {
    slug = `${base}-${n}`;
    n += 1;
  }
  taken.add(slug);
  return slug;
}

export function matchEnrichment(
  name: string,
  branch: string,
  enrichments: Enrichment[],
): Enrichment[] {
  /* 접두 일치만 — 중간 포함은 "로지라멘"⊂"오로지라멘" 류 오매칭을 낳는다 (2026-09-02 실측) */
  const norm = normalizeShopName(name + branch);
  return enrichments.filter((e) => {
    const en = normalizeShopName(e.name);
    if (!en || !norm) return false;
    if (en === norm) return true;
    const [shorter, longer] =
      en.length <= norm.length ? [en, norm] : [norm, en];
    return shorter.length >= 3 && longer.startsWith(shorter);
  });
}

/* 반복 실증된 세부 스타일의 표준 승격 — 토마토(2026-09-02, 서울 21곳 실측 후 PO 확정) */
const SOUP_PROMOTIONS: Record<string, string> = {
  토마토: "토마토",
  토마토라멘: "토마토",
  교카이: "교카이",
};

/* 조사 산출물의 세부 표기 이형 통일 — 상세 화면 노출을 위한 정규화 */
const SOUP_DETAIL_ALIASES: Record<string, string> = {
  아부라라멘: "아부라소바",
  "아부라소바·파이탄": "아부라소바",
  나가사키라멘: "나가사키",
  나가사키짬뽕: "나가사키",
  카레라멘: "카레",
  유즈라멘: "유즈",
  유즈시오: "유즈",
  유즈토리시오: "유즈",
  쿠로라멘: "구로마유",
  쿠로이: "구로마유",
  블랙라멘: "구로마유",
  마라라멘: "마라",
  마라멘: "마라",
  시루나시탄탄멘: "시루나시",
  "시지미(조개)": "시지미",
  시지미라멘: "시지미",
  카라멘: "카라이",
  "카모(오리) 육수": "카모",
  카모파이탄: "카모",
};

/* 세부 메모의 계보 '스타일' 표기만 승격 — "지로라멘" 같은 메뉴명은 메뉴 하나일 수 있어 계보가 아니다(대표 라멘 기준, 2026-10-27 PO) */
const LINEAGE_PROMOTIONS: Record<string, string> = {
  지로: "지로계",
  지로케: "지로계",
  지로계: "지로계",
  이에케: "이에케",
  이에계: "이에케",
};

/* 스타일이 아닌 운영 메모는 세부에서 제외 (겸업 등) — 시트 메모 컬럼 몫 */
function isOperationalNote(d: string): boolean {
  return d.includes("겸업") || d === "퓨전" || d === "한식 퓨전";
}

/* 아부라소바는 마제소바와 별도 형태(2026-10-19 PO — 일본에선 같은 계열로 묶지만 지도 필터에서 따로 찾게).
   세부 표기에 있으면 형태로 올리고 세부에서는 뺀다(상세 화면 중복 방지) */
const DETAIL_TO_FORM: Record<string, string> = {
  아부라소바: "아부라소바",
  아부라라멘: "아부라소바",
  "아부라소바·파이탄": "아부라소바",
};

export function promoteSoups(e: Enrichment): Enrichment {
  const detailForms = [
    ...new Set(
      (e.soupDetail ?? []).map((d) => DETAIL_TO_FORM[d]).filter(Boolean),
    ),
  ] as string[];
  if (detailForms.length > 0) {
    e = {
      ...e,
      forms: [
        ...new Set([...(e.forms?.length ? e.forms : ["라멘"]), ...detailForms]),
      ],
      soupDetail: (e.soupDetail ?? []).filter((d) => !DETAIL_TO_FORM[d]),
    };
  }
  const raw = e.soupDetail ?? [];
  const promoted = [
    ...new Set(raw.map((d) => SOUP_PROMOTIONS[d]).filter(Boolean)),
  ] as string[];
  const lineagePromoted = [
    ...new Set(raw.map((d) => LINEAGE_PROMOTIONS[d]).filter(Boolean)),
  ] as string[];
  const detail = [
    ...new Set(
      raw
        .filter(
          (d) =>
            !SOUP_PROMOTIONS[d] &&
            !LINEAGE_PROMOTIONS[d] &&
            !isOperationalNote(d),
        )
        .map((d) => SOUP_DETAIL_ALIASES[d] ?? d),
    ),
  ];
  return {
    ...e,
    soups:
      promoted.length > 0
        ? [...new Set([...(e.soups ?? []), ...promoted])]
        : e.soups,
    lineages:
      lineagePromoted.length > 0
        ? [...new Set([...(e.lineages ?? []), ...lineagePromoted])]
        : e.lineages,
    soupDetail: detail,
  };
}

/* 메뉴명·세부 표기에 드러난 장르를 필터 값으로 올린다 — 조사가 장르 칸을 빠뜨려도 필터에 잡히게
   (2026-10-19 전수 검수: 메뉴와 필터가 어긋난 매장 67곳). 앞에서부터 긴 표현을 먼저 소비해 오분해를 막는다.
   아부라소바→마제소바는 분류 결정 전이라 제외 */
const MENU_GENRE_RULES: {
  axis: "soups" | "forms" | "lineages";
  label: string;
  re: RegExp;
}[] = [
  {
    axis: "soups",
    label: "돈코츠쇼유",
    re: /(돈코츠|톤코츠|돈꼬츠)\s?(쇼유|소유)/g,
  },
  {
    axis: "soups",
    label: "토리파이탄",
    re: /토리\s?(파이탄|빠이탄|백탕)|닭\s?백탕/g,
  },
  { axis: "soups", label: "돈코츠", re: /돈코츠|톤코츠|돈꼬츠/g },
  {
    axis: "soups",
    label: "쇼유",
    re: /쇼유|소유(?=라멘|라아멘|탄멘|츠케멘|라멘)/g,
  },
  { axis: "soups", label: "시오", re: /시오/g },
  { axis: "soups", label: "미소", re: /미소/g },
  { axis: "soups", label: "니보시", re: /니보시/g },
  { axis: "soups", label: "탄탄멘", re: /탄탄(멘|면)/g },
  { axis: "forms", label: "츠케멘", re: /츠케멘|쯔케멘|츠께멘/g },
  { axis: "forms", label: "마제소바", re: /마제소바|마제멘/g },
  { axis: "forms", label: "아부라소바", re: /아부라\s?(소바|라멘)|아부라멘/g },
  { axis: "lineages", label: "이에케", re: /이에케|이에계/g },
  { axis: "lineages", label: "지로계", re: /지로/g },
];

export function lineageFromName(name: string): string[] {
  return [
    ...(/이에케|이에계|家系/.test(name) ? ["이에케"] : []),
    ...(/지로|二郎/.test(name) ? ["지로계"] : []),
  ];
}

export function promoteFromMenus(e: Enrichment): Enrichment {
  let text = [
    ...(e.menus ?? []).map((m) => m.split("|")[0]),
    ...(e.soupDetail ?? []),
  ].join(" / ");
  const found: Record<"soups" | "forms" | "lineages", string[]> = {
    soups: [],
    forms: [],
    lineages: [],
  };
  const soupAt: { label: string; at: number }[] = [];
  for (const rule of MENU_GENRE_RULES) {
    rule.re.lastIndex = 0;
    const m = rule.re.exec(text);
    rule.re.lastIndex = 0;
    if (!m) continue;
    if (rule.axis === "soups") {
      soupAt.push({ label: rule.label, at: m.index });
      /* 같은 길이 공백으로 지워 뒤 규칙의 위치 계산이 어긋나지 않게 */
      text = text.replace(rule.re, (s) => " ".repeat(s.length));
    } else if (rule.axis === "forms") {
      found.forms.push(rule.label);
    }
  }
  found.soups = soupAt.sort((a, b) => a.at - b.at).map((s) => s.label);
  /* 계보는 대표 라멘 기준 — 첫 메뉴이거나 메뉴의 절반 이상일 때만 (메뉴 하나로 계보를 붙이면 라오타가 찾는 '이에케 집'이 흐려진다) */
  const menuNames = (e.menus ?? []).map((m) => m.split("|")[0]);
  for (const rule of MENU_GENRE_RULES.filter((r) => r.axis === "lineages")) {
    const hits = menuNames.filter((n) => {
      rule.re.lastIndex = 0;
      const hit = rule.re.test(n);
      rule.re.lastIndex = 0;
      return hit;
    });
    const representative =
      menuNames.length > 0 &&
      (hits.includes(menuNames[0]) || hits.length * 2 >= menuNames.length);
    if (representative) found.lineages.push(rule.label);
  }
  const union = (base: string[] | undefined, add: string[]) =>
    add.length > 0 ? [...new Set([...(base ?? []), ...add])] : base;
  return {
    ...e,
    soups: union(e.soups, found.soups),
    /* 형태 칸이 비면 시트 기본값이 라멘 — 새 형태를 더할 때 라멘이 사라지지 않게 */
    forms:
      found.forms.length > 0
        ? union(e.forms?.length ? e.forms : ["라멘"], found.forms)
        : e.forms,
    lineages: union(e.lineages, found.lineages),
  };
}

const VERDICT_MARKS = ["라멘집 아님", "실존 미확인"];

export function mergeEnrichments(matches: Enrichment[]): Enrichment {
  const merged: Enrichment = { name: matches[0]?.name ?? "" };
  for (const e of matches) {
    merged.soups = [...new Set([...(merged.soups ?? []), ...(e.soups ?? [])])];
    merged.forms = [...new Set([...(merged.forms ?? []), ...(e.forms ?? [])])];
    merged.lineages = [
      ...new Set([...(merged.lineages ?? []), ...(e.lineages ?? [])]),
    ];
    merged.soupDetail = [
      ...new Set([
        ...(merged.soupDetail ?? []),
        ...(e.soupDetail ?? []).filter((d) => !VERDICT_MARKS.includes(d)),
      ]),
    ];
    merged.primarySoup ??= e.primarySoup;
    merged.primaryForm ??= e.primaryForm;
    if (e.areaConfirmed && e.area && !merged.areaConfirmed) {
      merged.area = e.area;
      merged.areaConfirmed = true;
    } else if (!merged.areaConfirmed) {
      merged.area ??= e.area;
    }
    merged.instagram ??= e.instagram;
    merged.naverPlace ??= e.naverPlace;
    merged.openedAt ??= e.openedAt;
    merged.hours ??= e.hours;
    merged.breakTime ??= e.breakTime;
    merged.closedDays ??= e.closedDays;
    merged.seats ??= e.seats;
    merged.menus ??= e.menus;
    merged.closed ||= e.closed;
    merged.unverified ||= e.unverified;
    merged.sourceNote = [merged.sourceNote, e.sourceNote]
      .filter(Boolean)
      .join("; ");
  }
  /* 판정 마크만 최신 조사 우선 — 합집합이면 재검증으로 뒤집힌 보류가 되살아난다.
     최신은 파일 나열 순서가 아니라 조사일(observedAt) 기준 (2026-10-27: 알파벳순 뒤의 9월 조사가 10월 판정을 지우던 결함) */
  const latest = matches
    .map((e, i) => ({ e, i }))
    .sort(
      (a, b) =>
        (a.e.observedAt ?? "").localeCompare(b.e.observedAt ?? "") || a.i - b.i,
    )
    .at(-1)?.e;
  const marks = (latest?.soupDetail ?? []).filter((d) =>
    VERDICT_MARKS.includes(d),
  );
  if (marks.length > 0)
    merged.soupDetail = [...new Set([...(merged.soupDetail ?? []), ...marks])];
  return merged;
}

const BRANCH_SUFFIX = /(직영점|본점|호점|점)$/;

function withoutAlias(name: string): string {
  return name.replace(/\(.*?\)/g, "");
}

/* 긴 원문에서 짧은 이름(정규화 길이 n)이 끝나는 지점 바로 뒤가 띄어쓰기·구분자인지 */
function endsAtWordBoundary(longRaw: string, n: number): boolean {
  let seen = 0;
  for (let i = 0; i < longRaw.length; i++) {
    if (normalizeShopName(longRaw[i]) !== "") seen++;
    if (seen === n) return /^[\s·_\-(]/.test(longRaw.slice(i + 1));
  }
  return false;
}

/* 접두 일치가 같은 체인의 다른 지점인지 — 남는 글자가 지점 표기·번호·주소 지명일 때만.
   "라멘야"→"라멘야누", "멘야하나"→"멘야하나비 합정점"처럼 다른 가게로 번지는 오염 차단 (2026-10-27).
   chainWide로 체인임이 명시된 항목은 띄어쓰기 없는 "…점"도 지점으로 본다 */
export function isSameChain(
  shopName: string,
  entryName: string,
  address = "",
  trustedChain = false,
): boolean {
  const shopBase = withoutAlias(shopName).trim();
  const entryBase = withoutAlias(entryName).trim();
  const a = normalizeShopName(shopBase);
  const b = normalizeShopName(entryBase);
  if (a === b) return true;
  const shopLonger = a.length > b.length;
  const [shorter, longer] = shopLonger ? [b, a] : [a, b];
  if (!longer.startsWith(shorter)) return false;
  const raw = longer.slice(shorter.length);
  if (/^\d+$/.test(raw)) return true;
  const rest = raw.replace(BRANCH_SUFFIX, "");
  const place = normalizeShopName(address);
  const placeLike = (t: string) => t.length >= 2 && place.includes(t);
  if (raw.length >= 2 && BRANCH_SUFFIX.test(raw)) {
    const boundary = endsAtWordBoundary(
      shopLonger ? shopBase : entryBase,
      shorter.length,
    );
    if (rest === "" || boundary || trustedChain || placeLike(rest.slice(0, 2)))
      return true;
  }
  if (trustedChain && shopLonger && placeLike(rest.slice(0, 2))) return true;
  if (rest.length < 2 || !place) return false;
  if (placeLike(rest)) return true;
  for (let i = 2; i <= rest.length - 2; i++) {
    if (placeLike(rest.slice(0, i)) && placeLike(rest.slice(i))) return true;
  }
  return false;
}

/* 위치 종속 필드는 정확 일치에서만 — 접두 매칭은 본점 정보가 지점에 전파되는 오염원
   (부탄츄 잠실점에 홍대 본점 상권·영업시간이 붙는 사고, 2026-09-02 실측).
   동명 행이 여럿(ambiguous)이면 정확 일치조차 어느 지점인지 모르므로
   addrHint가 행 주소와 맞는 엔트리만 위치 필드를 준다 (산쪼메 3행 동일 시간 사고) */
export function mergeMatched(
  name: string,
  branch: string,
  matches: Enrichment[],
  opts: { ambiguous?: boolean; address?: string } = {},
): Enrichment {
  const norm = normalizeShopName(name + branch);
  const hintFits = (m: Enrichment) =>
    !m.addrHint || (opts.address ?? "").includes(m.addrHint);
  const exact = matches.filter(
    (m) =>
      normalizeShopName(m.name) === norm &&
      hintFits(m) &&
      (!opts.ambiguous || m.addrHint),
  );
  const own = mergeEnrichments(exact);
  /* 영업시간·메뉴처럼 바뀌는 사실은 최신 조사가 이긴다 (2026-10-27: 9월 조사의 옛 영업시간이 10월 장소 카드를 가리던 결함).
     동네 라벨은 큐레이션 값이라 기존 순서 유지 */
  const current = mergeEnrichments(
    [...exact].sort((a, b) =>
      (b.observedAt ?? "").localeCompare(a.observedAt ?? ""),
    ),
  );
  /* 승계는 같은 체인으로 판정된 항목만, 주소 지정 항목은 그 주소 매장만, 계보는 chainWide만 */
  const chainBrands = new Set(
    matches
      .filter((m) => m.chainWide)
      .map((m) => normalizeShopName(withoutAlias(m.name))),
  );
  const inheritable = (m: Enrichment) =>
    exact.includes(m) ||
    (!m.standalone &&
      isSameChain(
        `${name} ${branch}`.trim(),
        m.name,
        opts.address,
        chainBrands.has(normalizeShopName(withoutAlias(m.name))),
      ));
  const all = exact.some((m) => m.standalone)
    ? own
    : mergeEnrichments(
        matches.filter(inheritable).map((m) => {
          if (exact.includes(m)) return m;
          const scoped =
            m.addrHint && !hintFits(m) ? { ...m, instagram: undefined } : m;
          return scoped.chainWide ? scoped : { ...scoped, lineages: undefined };
        }),
      );
  /* 실존·업종 판정은 그 주소의 업소에 대한 것 — 동명 타업소(이자카야 혼네)로 전파 금지 */
  const soupDetail = [
    ...(all.soupDetail ?? []).filter((d) => !VERDICT_MARKS.includes(d)),
    ...(own.soupDetail ?? []).filter((d) => VERDICT_MARKS.includes(d)),
  ];
  /* 인스타도 그 매장 최신 조사 우선, 빈 문자열은 '확인된 계정 없음'으로 승계까지 끊는다 (2026-10-27 전수 검수) */
  const instagram =
    current.instagram !== undefined
      ? current.instagram || undefined
      : all.instagram || undefined;
  return {
    ...all,
    instagram,
    primarySoup:
      all.primarySoup && (all.soups ?? []).includes(all.primarySoup)
        ? all.primarySoup
        : undefined,
    primaryForm:
      all.primaryForm && (all.forms ?? []).includes(all.primaryForm)
        ? all.primaryForm
        : undefined,
    soupDetail: [...new Set(soupDetail)],
    area: own.area,
    areaConfirmed: own.areaConfirmed,
    hours: current.hours,
    breakTime: current.breakTime,
    closedDays: current.closedDays,
    seats: current.seats,
    menus: current.menus,
    naverPlace: current.naverPlace,
    openedAt: current.openedAt,
    closed: own.closed,
    unverified: own.unverified,
  };
}

export type SheetRow = Record<string, string>;

export function toSheetLine(cells: SheetRow): string {
  return SHEET_HEADER.map((h) => cells[h] ?? "").join("\t");
}
