import type { GenreSlug } from "./derive";

export type GuideSource = { name: string; url: string };

export type GuideContent = {
  slug: GenreSlug;
  intro: string[];
  origin: string;
  traits: { taste: string; body: string };
  boundary: string;
  sources: GuideSource[];
};

const RAHAKU = "新横浜ラーメン博物館 ラーペディア";
const MAFF = "農林水産省 うちの郷土料理";
const JAWIKI = "日本語版 Wikipedia";

/* 출처에 있는 내용만 — 출처 간 상충은 본문에 그대로 표시 (2026-09-01 조사) */
export const GUIDES: GuideContent[] = [
  {
    slug: "niboshi",
    intro: [
      "멸치·정어리 같은 작은 생선을 삶아 말린 니보시(煮干し)로 국물을 낸 계열이에요. 원형은 아오모리 쓰가루 지방이에요. 무쓰만에서 정어리와 전갱이가 많이 잡혀 집에서도 니보시 국물을 늘 썼고, 그 국물을 주카소바(中華そば, 간장 라멘의 옛 이름)에 쓰면서 시작됐어요.",
      "갈래는 둘이에요. 니보시만으로, 또는 닭뼈와 함께 맑게 낸 담백한 정통파(あっさり)와, 돼지·닭을 뽀얗게 끓인 국물에 니보시를 듬뿍 넣은 진한 니보시예요. 진한 쪽은 2000년대 이후에 나온 갈래로 '신 쓰가루 라멘'이라고도 불려요.",
    ],
    origin:
      "아오모리 쓰가루. 메이지 30년대(1897~1906) 소바집이 내던 주카소바(中華そば)가 뿌리",
    traits: {
      taste: "말린 생선의 감칠맛과 쌉싸름함",
      body: "맑은 국물(원형)부터 걸쭉하고 진한 국물까지",
    },
    boundary:
      "원형은 맑은 쪽이고, 걸쭉하고 진한 니보시는 2000년대 이후에 갈라져 나왔어요.",
    sources: [
      {
        name: `${JAWIKI} ラーメン — 出汁の種類による分類 (니보시 다시)`,
        url: "https://ja.wikipedia.org/wiki/ラーメン#出汁の種類による分類",
      },
      {
        name: `${JAWIKI} 津軽ラーメン (니보시 라멘의 원형·두 갈래)`,
        url: "https://ja.wikipedia.org/wiki/津軽ラーメン",
      },
      {
        name: "青森県 공식 관광 Amazing AOMORI",
        url: "https://aomori-tourism.com/feature/detail_223.html",
      },
      {
        name: `${RAHAKU} 대사전`,
        url: "https://www.raumen.co.jp/rapedia/dictionary/",
      },
    ],
  },
  {
    slug: "tonkotsu",
    intro: [
      "돼지뼈를 센 불에 오래 끓여 골수의 지방과 젤라틴이 국물에 녹아든 백탁(뽀얗게 흐린) 국물이에요. 규슈 구루메에서 시작해 하카타로 퍼졌고, 수분이 적어 단단한 가는 면과 카에다마(면 추가) 문화가 함께 따라다녀요.",
      "하카타는 돼지뼈만으로 매끈하게, 구루메는 더 진하고 골수 향이 강하며 면이 조금 굵고 김을 올려요.",
    ],
    origin:
      "1937년 구루메의 난킨센료(南京千両)가 규슈 첫 라멘(당시엔 맑은 국물). 뽀얀 국물은 1940년대 후반 구루메·하카타에서 나왔고, 불 조절에 실패한 우연에서 생겼다는 기록이 있음",
    traits: {
      taste: "고소하고 부드러운 돼지 육수",
      body: "진함 — 국물 가운데 가장 묵직",
    },
    boundary:
      "돈코츠 라멘도 타레(양념)는 간장인 경우가 많아요. 돈코츠와 돈코츠쇼유는 간장을 쓰느냐가 아니라 간장 맛이 앞에 나서느냐로 갈려요.",
    sources: [
      {
        name: `${JAWIKI} 豚骨ラーメン`,
        url: "https://ja.wikipedia.org/wiki/豚骨ラーメン",
      },
      {
        name: `${RAHAKU} 久留米ラーメン`,
        url: "https://www.raumen.co.jp/rapedia/study_japan/study_raumen_kurume.html",
      },
      {
        name: `${RAHAKU} 博多ラーメン`,
        url: "https://www.raumen.co.jp/rapedia/study_japan/study_raumen_hakata.html",
      },
      {
        name: "農林水産省 aff 2009 (하카타 = 구루메 파생)",
        url: "https://www.maff.go.jp/j/pr/aff/2009/spe1_04.html",
      },
    ],
  },
  {
    slug: "shoyu",
    intro: [
      "육수에 간장 타레(양념)로 맛을 낸, 라멘의 원형에 가장 가까운 계열이에요. 주카소바(中華そば)라고도 불러요.",
      "도쿄식은 닭뼈·돼지뼈를 끓이지 않고 우려 일본식 국물(다시)과 섞어 간장 맛을 앞세우고, 꼬불꼬불한 면을 써요.",
    ],
    origin:
      "1910년 도쿄 아사쿠사의 라이라이켄(來々軒) — 지금 라멘의 출발점이자 일본 첫 라멘 붐",
    traits: {
      taste: "간장 향과 국물의 감칠맛",
      body: "맑은 국물 중심",
    },
    boundary:
      "가장 넓은 분류라 아사히카와·기타카타·도야마 블랙 같은 지역별 라멘이 모두 쇼유에 들어가요. 돼지뼈를 뽀얗게 끓인 국물에 진한 간장이면 돈코츠쇼유로 갈려요.",
    sources: [
      {
        name: `${JAWIKI} 醤油ラーメン`,
        url: "https://ja.wikipedia.org/wiki/醤油ラーメン",
      },
      {
        name: `${RAHAKU} 東京ラーメン`,
        url: "https://www.raumen.co.jp/rapedia/study_japan/study_raumen_tokyo.html",
      },
      {
        name: "新横浜ラーメン博物館 淺草來々軒",
        url: "https://www.raumen.co.jp/shop/rairaiken.html",
      },
    ],
  },
  {
    slug: "shio",
    intro: [
      "국물에 소금 타레(양념)로 맛을 낸 투명한 국물이에요. 하코다테가 대표예요. 돼지뼈를 약한 불로 끓어오르지 않게 우려 맑게 내고, 해산물·다시마도 거의 쓰지 않아 가장 담백한 편으로 꼽혀요.",
    ],
    origin:
      "하코다테. 1884년 하코다테 신문에 난킨소바(南京そば) 광고가 남아 있지만, 지금 라멘과 직접 이어지는지는 확인되지 않음",
    traits: {
      taste: "소금이 살린 재료 본연의 맛",
      body: "맑고 가벼움 — 다만 뽀얀 국물과 합친 진한 시오도 있음",
    },
    boundary:
      "'시오 = 담백'은 하코다테 기준이에요. 시오는 타레(양념) 분류라 토리파이탄 같은 뽀얀 닭 육수와도 합쳐져요.",
    sources: [
      {
        name: `${JAWIKI} 塩ラーメン`,
        url: "https://ja.wikipedia.org/wiki/塩ラーメン",
      },
      {
        name: `${RAHAKU} 函館ラーメン`,
        url: "https://www.raumen.co.jp/rapedia/study_japan/study_raumen_hakodade.html",
      },
      {
        name: `${MAFF} ラーメン(北海道)`,
        url: "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/ramen_hokkaido.html",
      },
    ],
  },
  {
    slug: "miso",
    intro: [
      "타레(양념)에 된장을 쓴 계열로, 삿포로가 발상지예요. 중화팬에 숙주 같은 채소를 볶고 국물을 부어 미소 타레를 녹이는 삿포로식이 기본이고, 라드(돼지기름)가 표면을 덮어 잘 식지 않아요.",
    ],
    origin:
      "삿포로 아지노산페이(味の三平)의 오미야 모리토(大宮守人) — 1955년 시험 판매, 1960년대 초 정식 메뉴(자료마다 1961·1963으로 갈림)",
    traits: {
      taste: "된장의 구수함에 라드·마늘의 힘",
      body: "묵직 — 돼지뼈(또는 돼지+닭) 육수, 수분이 많은 중간 굵기 꼬불꼬불한 면",
    },
    boundary:
      "1967년 이후 프랜차이즈와 인스턴트로 전국에 퍼지며 '홋카이도 라멘 = 미소'로 굳었지만, 홋카이도 안에서도 하코다테는 시오, 아사히카와는 쇼유예요.",
    sources: [
      {
        name: `${JAWIKI} 味噌ラーメン`,
        url: "https://ja.wikipedia.org/wiki/味噌ラーメン",
      },
      {
        name: `${RAHAKU} 札幌ラーメン`,
        url: "https://www.raumen.co.jp/rapedia/study_japan/study_raumen_sapporo.html",
      },
      {
        name: `${MAFF} ラーメン(北海道)`,
        url: "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/search_menu/menu/ramen_hokkaido.html",
      },
    ],
  },
  {
    slug: "tonkotsu-shoyu",
    intro: [
      "돼지뼈(때로 닭뼈) 육수에 진한 간장 타레(양념)를 합친 국물이에요. 한 곳에서 시작되지 않았고, 와카야마(이데 계열, 井出系)·교토(다이이치아사히, 第一旭)·요코하마(이에케)처럼 지역마다 따로 발전했어요.",
    ],
    origin:
      "여러 곳에서 시작 — 교토 혼케 다이이치아사히(本家第一旭, 1947), 와카야마 이데쇼텐(井出商店, 1953), 요코하마 요시무라야(吉村家, 1974)",
    traits: {
      taste: "돼지 육수 위로 간장의 짭짤한 감칠맛이 앞에 나섬",
      body: "진함 — 교토 계열은 '일본에서 가장 진하다'고 불림",
    },
    boundary:
      "이에케·지로계는 돈코츠쇼유 국물을 쓰는 '스타일'이지 돈코츠쇼유와 같은 말이 아니에요. 돈코츠 라멘도 대부분 타레(양념)가 간장이라 '간장을 쓰느냐'로는 구분되지 않아요.",
    sources: [
      {
        name: `${JAWIKI} 家系ラーメン`,
        url: "https://ja.wikipedia.org/wiki/家系ラーメン",
      },
      {
        name: `${RAHAKU} 和歌山ラーメン`,
        url: "https://www.raumen.co.jp/rapedia/study_japan/study_raumen_wakayama.html",
      },
      {
        name: `${JAWIKI} 京都ラーメン`,
        url: "https://ja.wikipedia.org/wiki/京都ラーメン",
      },
    ],
  },
  {
    slug: "toripaitan",
    intro: [
      "닭뼈를 뽀얗게 될 때까지 끓인 국물의 라멘이에요. 돈코츠보다 냄새가 적고 뒷맛이 산뜻해 2005년 무렵부터 일본에서 붐이 일었고, 2013년 이후 콜라겐 이미지와 냉동 국물 보급으로 널리 퍼졌어요.",
    ],
    origin:
      "특정 원조 없음 — 1971년 창업한 덴카잇핀(天下一品)이 유명하지만 발상지는 아님",
    traits: {
      taste: "닭의 단맛과 감칠맛, 부드럽고 진함",
      body: "진하지만 뒷맛이 가벼움. 믹서로 거품을 낸 거품계(泡系)도 있음",
    },
    boundary:
      "토리파이탄은 육수 분류이고 시오·쇼유는 타레(양념) 분류라, '토리파이탄 시오'와 '토리파이탄 쇼유'가 함께 있어요.",
    sources: [
      {
        name: `${JAWIKI} 鶏白湯ラーメン`,
        url: "https://ja.wikipedia.org/wiki/鶏白湯ラーメン",
      },
      {
        name: `${RAHAKU} 대사전 白湯·乳化`,
        url: "https://www.raumen.co.jp/rapedia/dictionary/",
      },
      {
        name: `${JAWIKI} 京都ラーメン`,
        url: "https://ja.wikipedia.org/wiki/京都ラーメン",
      },
    ],
  },
  {
    slug: "tantanmen",
    intro: [
      "쓰촨에서 시작된 면 요리를 일본식 국물 라멘으로 바꾼 계열이에요. 참깨 소스(즈마장, 芝麻醤)와 라유(고추기름)의 매콤하고 고소한 국물이 특징이고, 국물과 참깨가 매운맛을 부드럽게 감싸요.",
      "1958년 도쿄 시센한텐(四川飯店)의 천젠민(陳建民)이 '일본 사람은 된장국처럼 국물을 좋아한다'는 조언을 듣고 국물이 있는 형태를 만들었고, 쓰촨에서는 쓰지 않던 참깨 소스를 더했어요.",
    ],
    origin:
      "본고장은 1841년경 쓰촨 쯔궁(自貢) — 멜대(担)에 지고 다니며 팔던 국물 없는 면. 일본식 국물 탄탄멘은 1958년 도쿄 시센한텐(四川飯店)",
    traits: {
      taste: "참깨의 고소함과 라유의 매운맛",
      body: "중간 — 국물과 참깨가 매운맛을 누그러뜨림",
    },
    boundary:
      "일본 탄탄멘과 쓰촨 탄탄멘은 다른 음식이에요. 본고장은 국물 없이 화자오(花椒, 얼얼한 산초)의 맛이 중심이고, 국물 없는 시루나시 탄탄멘(汁なし担々麺)은 2000년대 이후 따로 생긴 흐름이에요.",
    sources: [
      {
        name: `${JAWIKI} 担々麺`,
        url: "https://ja.wikipedia.org/wiki/担々麺",
      },
      {
        name: "朝日新聞社 withnews — 四川飯店 인터뷰",
        url: "https://withnews.jp/article/f0160628001qq000000000000000W02310901qq000013578A",
      },
      {
        name: "日本ラーメンファンクラブ ラーメン史コラム",
        url: "https://www.nippon-ramen-fc.org/archives/history/h0007",
      },
    ],
  },
  {
    slug: "iekei",
    intro: [
      "1974년 요코하마 요시무라야(吉村家)에서 시작한 스타일이에요. '규슈 돈코츠 + 도쿄 간장'을 합친 진한 돈코츠쇼유 국물에 치유(닭기름, 鶏油), 중간 굵기 곧은 면, 시금치·네모난 김 3장·차슈가 기본이고, 밥과 함께 먹는 문화가 따라와요.",
      "주문할 때 면 굳기·맛 농도·기름 양을 고르는 게 이 스타일의 관례예요.",
    ],
    origin:
      "1974년 9월 요코하마 신스기타(新杉田) 산업도로변, 창업자 요시무라 미노루(吉村実, 트럭 운전사 출신)",
    traits: {
      taste: "돈코츠쇼유에 치유(닭기름)의 고소함",
      body: "진함 — 면 굳기·농도·기름을 주문으로 조절",
    },
    boundary:
      "국물 종류가 아니라 스타일이에요(국물은 돈코츠쇼유). 요시무라야(吉村家)에서 수행한 직계(直系)와, 기업이 운영하는 체인형 자본계(資本系)로 나뉘어요.",
    sources: [
      {
        name: `${JAWIKI} 家系ラーメン`,
        url: "https://ja.wikipedia.org/wiki/家系ラーメン",
      },
      {
        name: `${JAWIKI} 吉村家`,
        url: "https://ja.wikipedia.org/wiki/吉村家",
      },
      {
        name: `${RAHAKU} 横浜ラーメン`,
        url: "https://www.raumen.co.jp/rapedia/study_japan/study_raumen_yokohama.html",
      },
    ],
  },
  {
    slug: "jiro",
    intro: [
      "1968년 야마다 다쿠미(山田拓美)가 시작한 라멘지로(ラーメン二郎)를 따르는 스타일이에요. 돈코츠 육수의 간장맛 국물에 아주 굵고 납작한 면, 산처럼 쌓은 숙주·양배추, 두툼한 돼지고기 조림(煮豚), 마늘, 등지방을 올려요. '라멘이 아니라 지로라는 음식'이라 불릴 만큼 독특해요.",
      "무료 토핑을 고르는 콜(마늘·야채·기름·간장 추가, ニンニク·ヤサイ·アブラ·カラメ)과 많은 양이 처음 가는 사람의 관문이에요. 가장 작은 사이즈도 보통 라멘 곱빼기보다 많아요.",
    ],
    origin: "1968년 도쿄 메구로 창업, 1970년대 초 미타(게이오대 앞)로 이전",
    traits: {
      taste: "묵직한 돼지 육수 + 간장 + 마늘·기름",
      body: "아주 진하고 양이 많음",
    },
    boundary:
      "국물 장르가 아닌 스타일이에요. 본점에서 수행한 직계(直系)와 스타일만 따르는 인스파이어계(インスパイア系)로 나뉘어요.",
    sources: [
      {
        name: `${JAWIKI} ラーメン二郎`,
        url: "https://ja.wikipedia.org/wiki/ラーメン二郎",
      },
      {
        name: "English Wikipedia Ramen Jiro",
        url: "https://en.wikipedia.org/wiki/Ramen_Jiro",
      },
      {
        name: "ラーメンデータベース 二郎系 필터",
        url: "https://ramendb.supleks.jp/search?tags=3",
      },
    ],
  },
];

export function guideBySlug(slug: string): GuideContent | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
