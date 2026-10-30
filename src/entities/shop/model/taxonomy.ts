export type TaxonomyItem = {
  slug: string;
  label: string;
  labelJa?: string;
  description?: string;
  kind?: "taste" | "trait";
};

export const FORMS = [
  { slug: "ramen", label: "라멘" },
  { slug: "tsukemen", label: "츠케멘", labelJa: "つけ麺" },
  { slug: "mazesoba", label: "마제소바", labelJa: "まぜそば" },
  { slug: "aburasoba", label: "아부라소바", labelJa: "油そば" },
  { slug: "etc-form", label: "기타" },
] as const satisfies readonly TaxonomyItem[];

export const SOUPS = [
  {
    slug: "tonkotsu",
    label: "돈코츠",
    labelJa: "豚骨",
    description: "돼지뼈를 오래 끓여 뽀얗고 진한 국물",
  },
  {
    slug: "shoyu",
    label: "쇼유",
    labelJa: "醤油",
    description: "간장으로 맛을 낸 맑은 국물",
  },
  {
    slug: "shio",
    label: "시오",
    labelJa: "塩",
    description: "소금으로 맛을 내 재료 맛을 살린 맑고 개운한 국물",
  },
  {
    slug: "miso",
    label: "미소",
    labelJa: "味噌",
    description: "미소(일본 된장)로 맛을 낸 구수하고 묵직한 국물",
  },
  {
    slug: "tonkotsu-shoyu",
    label: "돈코츠쇼유",
    labelJa: "豚骨醤油",
    description: "돈코츠의 진한 맛에 간장 맛을 더한 국물",
  },
  {
    slug: "niboshi",
    label: "니보시",
    labelJa: "煮干し",
    description: "말린 멸치·정어리로 우려 쌉싸름하고 진한 국물",
  },
  {
    slug: "toripaitan",
    label: "토리파이탄",
    labelJa: "鶏白湯",
    description: "닭을 오래 끓여 뽀얗고 부드러운 국물",
  },
  {
    slug: "tantanmen",
    label: "탄탄멘",
    labelJa: "担々麺",
    description: "참깨 소스와 라유(고추기름)로 매콤하고 고소한 국물",
  },
  {
    slug: "gyokai",
    label: "교카이",
    description:
      "가다랑어 같은 해산물로 우린 감칠맛 국물 — 돈코츠교카이가 대표",
  },
  {
    slug: "tomato",
    label: "토마토",
    description: "토마토의 새콤한 맛을 살린 국물",
  },
  { slug: "etc-soup", label: "기타" },
] as const satisfies readonly TaxonomyItem[];

export const LINEAGES = [
  {
    slug: "iekei",
    label: "이에케",
    labelJa: "家系",
    kind: "taste",
    description:
      "돈코츠쇼유 국물에 굵은 면, 시금치·김을 올리는 요코하마식 라멘",
  },
  {
    slug: "jiro",
    label: "지로계",
    labelJa: "二郎系",
    kind: "taste",
    description: "산더미 같은 야채·마늘에 아주 굵은 면을 넣은 양 많은 라멘",
  },
  {
    slug: "jikaseimen",
    label: "자가제면",
    labelJa: "自家製麺",
    kind: "trait",
    description: "라멘집에서 직접 뽑는 면",
  },
  {
    slug: "honto",
    label: "본토직영",
    kind: "trait",
    description: "일본 브랜드가 한국에 낸 정식 지점",
  },
] as const satisfies readonly TaxonomyItem[];

export const AMENITIES = [
  { slug: "ticket-machine", label: "식권기" },
  { slug: "kaedama", label: "카에다마" },
  { slug: "remote-waiting", label: "원격 줄서기" },
  { slug: "limited-menu", label: "한정메뉴" },
  { slug: "late-night", label: "심야" },
  { slug: "parking", label: "주차" },
  { slug: "solo-counter", label: "1인 카운터" },
] as const satisfies readonly TaxonomyItem[];

export type FormSlug = (typeof FORMS)[number]["slug"];
export type SoupSlug = (typeof SOUPS)[number]["slug"];
export type LineageSlug = (typeof LINEAGES)[number]["slug"];
export type AmenitySlug = (typeof AMENITIES)[number]["slug"];

export function soupBySlug(slug: string): TaxonomyItem | undefined {
  return SOUPS.find((s) => s.slug === slug);
}

export function formBySlug(slug: string): TaxonomyItem | undefined {
  return FORMS.find((f) => f.slug === slug);
}
