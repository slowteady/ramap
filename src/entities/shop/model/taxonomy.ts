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
  { slug: "etc-form", label: "기타" },
] as const satisfies readonly TaxonomyItem[];

export const SOUPS = [
  {
    slug: "tonkotsu",
    label: "돈코츠",
    labelJa: "豚骨",
    description: "돼지뼈를 오래 끓여낸 진하고 크리미한 백탁 국물",
  },
  {
    slug: "shoyu",
    label: "쇼유",
    labelJa: "醤油",
    description: "간장 다레 기반의 맑고 클래식한 국물",
  },
  {
    slug: "shio",
    label: "시오",
    labelJa: "塩",
    description: "소금 다레로 재료 본연의 맛을 살린 가장 개운한 국물",
  },
  {
    slug: "miso",
    label: "미소",
    labelJa: "味噌",
    description: "된장 베이스의 구수하고 묵직한 국물",
  },
  {
    slug: "tonkotsu-shoyu",
    label: "돈코츠쇼유",
    labelJa: "豚骨醤油",
    description: "돈코츠에 간장 다레를 더한 국물, 이에케의 기본",
  },
  {
    slug: "niboshi",
    label: "니보시",
    labelJa: "煮干し",
    description: "멸치·정어리 건어물 다시가 중심인 씁쓸하고 진한 감칠맛",
  },
  {
    slug: "toripaitan",
    label: "토리파이탄",
    labelJa: "鶏白湯",
    description: "닭을 끓여낸 부드럽고 크리미한 백탕 국물",
  },
  {
    slug: "tantanmen",
    label: "탄탄멘",
    labelJa: "担々麺",
    description: "참깨 페이스트와 라유의 매콤 고소한 국물",
  },
  { slug: "etc-soup", label: "기타" },
] as const satisfies readonly TaxonomyItem[];

export const LINEAGES = [
  {
    slug: "iekei",
    label: "이에케",
    labelJa: "家系",
    kind: "taste",
    description: "돈코츠쇼유 국물에 굵은 면, 시금치·김 토핑의 요코하마 계열",
  },
  {
    slug: "jiro",
    label: "지로계",
    labelJa: "二郎系",
    kind: "taste",
    description: "산더미 야채·마늘·굵은 면의 볼륨 계열",
  },
  {
    slug: "jikaseimen",
    label: "자가제면",
    labelJa: "自家製麺",
    kind: "trait",
    description: "매장에서 직접 뽑는 면",
  },
  {
    slug: "honto",
    label: "본토직영",
    kind: "trait",
    description: "일본 본점이 직접 낸 한국 지점",
  },
] as const satisfies readonly TaxonomyItem[];

export const AMENITIES = [
  { slug: "ticket-machine", label: "식권기" },
  { slug: "kaedama", label: "카에다마" },
  { slug: "remote-waiting", label: "원격 웨이팅" },
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
