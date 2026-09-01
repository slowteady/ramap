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
      "멸치·정어리 등을 삶아 말린 니보시(煮干し)로 다시를 낸 계열입니다. 원형은 아오모리 쓰가루 지방 — 무쓰만의 정어리와 전갱이가 풍부해 가정에서 니보시 다시가 일상이었고, 그것이 中華そば에 쓰이면서 시작됐습니다.",
      "갈래는 둘입니다. 니보시만으로, 또는 닭뼈와 합쳐 맑게 낸 왕도계(あっさり)와, 돼지·닭 백탕에 니보시를 듬뿍 낸 농후 니보시계 — 후자는 2000년대 이후 진화형으로 '신 쓰가루 라멘'이라고도 불립니다.",
    ],
    origin: "아오모리 쓰가루. 메이지 30년대 소바집이 내던 中華そば가 뿌리",
    traits: {
      taste: "건어물의 감칠맛과 쌉싸름함",
      body: "맑은 청탕(원형)부터 걸쭉한 농후계까지",
    },
    boundary:
      "한국에선 '니보시 = 진하고 쓴맛'으로 통하지만, 출처상 원형은 맑은 쪽이고 농후계는 2000년대 파생입니다.",
    sources: [
      {
        name: `${JAWIKI} 津軽ラーメン`,
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
      "돼지뼈를 강불로 오래 끓여 골수의 지방과 젤라틴이 유화된 백탁 국물입니다. 규슈 구루메에서 시작해 하카타로 퍼졌고, 가는 저가수면과 카에다마(면 추가) 문화가 함께 붙어 다닙니다.",
      "하카타는 돼지뼈만으로 매끈하게, 구루메는 더 진하고 골수 향이 강하며 면이 조금 굵고 김을 올립니다.",
    ],
    origin:
      "1937년 구루메 南京千両이 규슈 첫 라멘(당시엔 맑은 국물). 백탁 국물은 1940년대 후반 구루메·하카타에서 — 불 조절이 넘친 우연에서 나왔다는 기록",
    traits: {
      taste: "고소하고 크리미한 돼지 육수",
      body: "진함 — 계열 중 가장 묵직",
    },
    boundary:
      "돈코츠 라멘도 양념(타레)은 간장인 경우가 많습니다. 돈코츠와 돈코츠쇼유의 차이는 간장을 쓰느냐가 아니라 간장 맛이 전면에 서느냐입니다.",
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
    ],
  },
  {
    slug: "shoyu",
    intro: [
      "육수를 간장 타레로 조미한, 라멘의 원형에 가장 가까운 계열입니다. 中華そば라고도 부릅니다.",
      "도쿄식은 닭뼈·돼지뼈를 끓이지 않고 우려 일본식 다시와 섞어 간장 맛을 앞세우고, 곱슬면을 씁니다. 가게마다 간장 배합이 달라 같은 쇼유라도 표정이 가장 다양합니다.",
    ],
    origin:
      "1910년 도쿄 아사쿠사 來々軒 — 현대 라멘의 출발점이자 일본 첫 라멘 붐",
    traits: {
      taste: "간장의 향과 다시의 감칠맛",
      body: "맑은 청탕 중심",
    },
    boundary:
      "가장 넓은 카테고리라 아사히카와·기타카타·도야마 블랙 같은 지역 변형이 모두 쇼유에 들어갑니다. 돼지뼈 백탕에 진한 간장이면 돈코츠쇼유로 갈립니다.",
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
      "다시를 소금 타레로 조미한 투명한 국물입니다. 하코다테가 대표 — 돼지뼈를 약불로 끓이지 않게 우려 맑게 내고, 해산물·다시마도 거의 쓰지 않아 '담백파의 최우익'으로 불립니다.",
    ],
    origin:
      "하코다테. 1884년 하코다테 신문의 南京そば 광고가 남아 있지만 현재 라멘과의 직접 연관은 확인되지 않음",
    traits: {
      taste: "소금 타레가 살린 재료 본연의 맛",
      body: "맑고 가벼움 — 단 백탕과 결합한 진한 시오도 있음",
    },
    boundary:
      "'시오 = 담백'은 하코다테 기준입니다. 시오는 타레(양념) 분류라 토리파이탄 같은 백탕 육수와도 결합합니다.",
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
      "타레에 된장을 쓴 계열로 삿포로가 발상지입니다. 중화팬에 숙주 등 채소를 볶고 국물을 부어 미소 타레를 녹이는 삿포로식이 기본형이고, 라드가 표면을 덮어 잘 식지 않습니다.",
    ],
    origin:
      "삿포로 味の三平의 大宮守人 — 1955년 시험 판매, 1960년대 초 정식 메뉴화(자료마다 1961·1963으로 갈림)",
    traits: {
      taste: "된장의 구수함에 라드·마늘의 펀치",
      body: "묵직 — 돼지뼈(또는 돼지+닭) 육수, 고가수 중태 곱슬면",
    },
    boundary:
      "1967년 이후 프랜차이즈와 인스턴트로 전국화되며 '홋카이도 라멘 = 미소'로 굳어졌지만, 홋카이도 안에서도 하코다테는 시오, 아사히카와는 쇼유입니다.",
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
      "돼지뼈(때로 닭뼈) 육수에 진한 간장 타레를 합친 국물입니다. 단일 발상지는 없고 와카야마(井出系)·교토(第一旭)·요코하마(이에케)처럼 지역별 계통이 각자 발전했습니다.",
    ],
    origin:
      "복수 기원 — 교토 本家第一旭(1947), 와카야마 井出商店(1953), 요코하마 吉村家(1974)",
    traits: {
      taste: "돼지 육수 위에 간장의 짭짤한 감칠맛이 전면으로",
      body: "진함 — 교토 계열은 '일본에서 가장 콧테리'로 불림",
    },
    boundary:
      "이에케·지로계는 돈코츠쇼유 국물을 쓰는 '계보'이지 돈코츠쇼유와 같은 말이 아닙니다. 돈코츠 라멘 다수도 타레는 간장이라 '간장 사용 여부'로는 구분되지 않습니다.",
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
      "닭뼈를 백탁할 때까지 끓인 백탕 육수 라멘입니다. 돈코츠보다 냄새가 적고 뒷맛이 산뜻해 2005년 무렵부터 일본에서 붐이 일었고, 2013년 이후 콜라겐 이미지와 냉동 스프 보급으로 널리 퍼졌습니다.",
    ],
    origin: "특정 원조 없음 — 1971년 창업한 天下一品이 유명하지만 발상은 아님",
    traits: {
      taste: "닭의 단맛과 감칠맛, 크리미",
      body: "진하지만 뒷맛이 가벼움. 믹서로 거품 낸 '泡系'도 있음",
    },
    boundary:
      "토리파이탄은 육수 분류이고 시오·쇼유는 타레 분류라, '토리파이탄 시오'와 '토리파이탄 쇼유'가 함께 존재합니다.",
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
      "쓰촨 발상의 면 요리를 일본식 국물 라멘으로 바꾼 계열입니다. 참깨 페이스트(芝麻醤)와 라유의 매콤 고소한 국물이 특징이고, 국물과 참깨가 매운맛을 부드럽게 감쌉니다.",
      "1958년 도쿄 四川飯店의 陳建民이 '일본인은 된장국처럼 국물을 좋아한다'는 조언으로 국물형을 만들었고, 쓰촨에서 쓰지 않던 芝麻醤을 더했습니다.",
    ],
    origin:
      "본고장은 1841년경 쓰촨 自貢 — 멜대(担)에 지고 팔던 국물 없는 면. 일본식 국물 탄탄멘은 1958년 도쿄 四川飯店",
    traits: {
      taste: "참깨의 고소함과 라유의 매운맛",
      body: "중간 — 국물과 참깨가 매운맛을 누그러뜨림",
    },
    boundary:
      "일본 탄탄멘과 쓰촨 탄탄멘은 다른 음식입니다. 본고장은 국물 없이 花椒의 얼얼한 맛이 중심이고, 국물 없는 汁なし担々麺은 2000년대 이후 별도 흐름입니다.",
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
      "1974년 요코하마 吉村家에서 시작한 계보입니다. '규슈 돈코츠 + 도쿄 간장'을 합친 진한 돈코츠쇼유 국물에 닭기름(鶏油), 중태 스트레이트면, 시금치·사각 김 3장·챠슈가 정석이고, 밥과 함께 먹는 문화가 붙어 있습니다.",
      "주문 시 면 굳기·맛 농도·기름 양을 지정하는 방식이 이 계보의 관례입니다.",
    ],
    origin:
      "1974년 9월 요코하마 新杉田 산업도로변, 창업자 吉村実(트럭 운전사 출신)",
    traits: {
      taste: "돈코츠쇼유에 치유(닭기름)의 고소함",
      body: "진함 — 면 굳기·농도·기름을 주문으로 조절",
    },
    boundary:
      "국물 종류가 아니라 계보입니다(국물은 돈코츠쇼유). 吉村家 계열의 直系와 체인형 資本系로 나뉩니다. 한국 표기 '이에케이'와 '이에케'는 같은 말입니다.",
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
      "1968년 山田拓美가 시작한 ラーメン二郎의 스타일을 따르는 계보입니다. 돈코츠 베이스 간장맛에 극태 평타면, 숙주·양배추 산, 두툼한 煮豚, 마늘, 등지방 — '라멘이 아니라 지로라는 음식'이라 불릴 만큼 독자적입니다.",
      "무료 토핑을 부르는 콜(ニンニク·ヤサイ·アブラ·カラメ)과 양이 초심자의 관문입니다. 小도 일반 라멘의 특성 이상입니다.",
    ],
    origin: "1968년 도쿄 메구로 창업, 1970년대 초 미타(게이오대 앞)로 이전",
    traits: {
      taste: "묵직한 돼지 육수 + 간장 + 마늘·기름",
      body: "매우 진하고 양이 많음",
    },
    boundary:
      "국물 장르가 아닌 계보입니다. 본점 수행을 거친 直系와 스타일만 따르는 インスパイア系가 있고, 한국의 지로계는 대부분 후자입니다.",
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
