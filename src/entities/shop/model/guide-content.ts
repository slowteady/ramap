import type { GenreSlug } from "./derive";

export type GuideContent = {
  slug: GenreSlug;
  intro: string[];
  traits: { taste: string; body: string; firstOrder: string };
  comparisons: { name: string; text: string }[];
};

export const GUIDES: GuideContent[] = [
  {
    slug: "niboshi",
    intro: [
      "멸치와 정어리를 말린 니보시(煮干し)로 다시를 낸 계열입니다. 건어물 특유의 씁쓸하고 진한 감칠맛이 중심이고, 좋아하는 사람은 이 쓴맛 때문에 찾아다닙니다.",
      "맑은 청탕부터 걸쭉한 농후 니보시, 닭 육수와 합친 니보시파이탄까지 스펙트럼이 넓습니다.",
    ],
    traits: {
      taste: "건어물의 감칠맛과 은은한 쓴맛",
      body: "청탕(가벼움)부터 농후(걸쭉)까지",
      firstOrder: "니보시 시오 — 계열의 성격이 가장 선명한 형태",
    },
    comparisons: [
      {
        name: "돈코츠교카이",
        text: "어패 다시에 돼지뼈를 합친 W수프로, 주로 츠케멘에서 만나는 다른 갈래입니다.",
      },
    ],
  },
  {
    slug: "tonkotsu",
    intro: [
      "돼지뼈를 강한 불로 오래 끓여 콜라겐까지 녹여낸 백탁 국물입니다. 후쿠오카 하카타가 본고장으로, 가는 면과 카에다마(면 추가) 문화가 함께 붙어 다닙니다.",
      "진하지만 잘 만든 돈코츠는 잡내 없이 크리미하게 떨어집니다.",
    ],
    traits: {
      taste: "고소하고 크리미한 돼지 육수",
      body: "진함 — 계열 중 가장 묵직한 축",
      firstOrder: "기본 돈코츠에 카에다마 — 하카타식 기본기",
    },
    comparisons: [
      {
        name: "토리파이탄",
        text: "같은 백탕이지만 닭 기반이라 더 부드럽고 가볍게 떨어집니다.",
      },
    ],
  },
  {
    slug: "shoyu",
    intro: [
      "간장 다레에 닭·어패 다시를 합친 맑은 국물로, 라멘의 원형에 가장 가까운 계열입니다.",
      "가게마다 간장 배합이 달라 같은 쇼유라도 표정이 제일 다양합니다.",
    ],
    traits: {
      taste: "간장의 향과 다시의 감칠맛",
      body: "맑고 깔끔한 청탕 중심",
      firstOrder: "기본 쇼유 라멘 — 가게의 기본기를 그대로 보여줍니다",
    },
    comparisons: [
      {
        name: "돈코츠쇼유",
        text: "간장 다레는 같지만 돼지뼈 백탕이 베이스라 훨씬 묵직합니다.",
      },
    ],
  },
  {
    slug: "shio",
    intro: [
      "소금 다레로 간을 잡아 다시 재료 본연의 맛이 가장 투명하게 드러나는 계열입니다.",
      "숨을 곳이 없는 국물이라 잘하는 집과 아닌 집의 차이가 제일 큽니다.",
    ],
    traits: {
      taste: "재료 본연의 감칠맛, 가장 개운한 마무리",
      body: "가벼움 — 계열 중 제일 맑은 축",
      firstOrder: "기본 시오 — 다시의 실력이 그대로 보입니다",
    },
    comparisons: [
      {
        name: "쇼유",
        text: "간장 향이 한 겹 얹히는 쇼유와 달리 시오는 다시가 정면에 나옵니다.",
      },
    ],
  },
  {
    slug: "miso",
    intro: [
      "된장 다레를 볶아 육수와 합치는 삿포로 발상의 계열입니다. 구수하고 묵직하며, 볶은 야채·옥수수·버터 토핑과 잘 붙습니다.",
    ],
    traits: {
      taste: "된장의 구수함과 단맛",
      body: "묵직 — 추운 날 생각나는 농도",
      firstOrder: "기본 미소 라멘, 버터 토핑 추가",
    },
    comparisons: [
      {
        name: "탄탄멘",
        text: "같이 걸쭉해도 탄탄멘은 참깨·라유의 매콤 고소함이 중심입니다.",
      },
    ],
  },
  {
    slug: "tonkotsu-shoyu",
    intro: [
      "돈코츠 백탕에 간장 다레를 합친 국물로, 요코하마 이에케의 기본이 되는 계열입니다.",
      "굵은 면, 시금치, 김 토핑과 함께 먹는 이에케 스타일로 접하는 경우가 많습니다.",
    ],
    traits: {
      taste: "돼지 육수의 진함 + 간장의 짠 감칠맛",
      body: "진함 — 밥과 같이 먹는 사람이 많습니다",
      firstOrder: "이에케 스타일 기본, 김 추가",
    },
    comparisons: [
      {
        name: "돈코츠",
        text: "순수 돈코츠보다 간장이 세게 들어와 짠맛의 윤곽이 뚜렷합니다.",
      },
    ],
  },
  {
    slug: "toripaitan",
    intro: [
      "닭을 뼈째 오래 끓여낸 백탕입니다. 돈코츠보다 부드럽고 크리미해서 백탕 입문으로 좋습니다.",
    ],
    traits: {
      taste: "닭의 고소함, 크리미한 질감",
      body: "중간 — 진하지만 무겁지 않음",
      firstOrder: "토리파이탄 시오",
    },
    comparisons: [
      {
        name: "돈코츠",
        text: "같은 백탕이지만 돼지 기반 돈코츠가 더 묵직하고 향이 셉니다.",
      },
    ],
  },
  {
    slug: "tantanmen",
    intro: [
      "참깨 페이스트와 라유를 축으로 하는 매콤 고소한 계열입니다. 중국 탄탄면이 일본식으로 정착한 갈래로, 국물 있는 것과 없는 것(시루나시)이 있습니다.",
    ],
    traits: {
      taste: "참깨의 고소함 + 라유의 매콤함",
      body: "걸쭉 — 산초가 들어가면 얼얼함 추가",
      firstOrder: "기본 탄탄멘 — 매운맛 단계는 보통부터",
    },
    comparisons: [
      {
        name: "미소",
        text: "같이 걸쭉해도 미소는 된장의 구수함, 탄탄멘은 참깨·라유가 중심입니다.",
      },
    ],
  },
  {
    slug: "iekei",
    intro: [
      "요코하마 요시무라야에서 시작된 돈코츠쇼유 계보입니다. 굵은 면, 시금치, 큰 김 3장이 기본 구성이고 면 굳기·기름 양·간을 취향대로 주문합니다.",
      "밥과 같이 먹는 문화가 강한 계보입니다.",
    ],
    traits: {
      taste: "돈코츠쇼유의 진하고 짭짤한 감칠맛",
      body: "진함 — 김에 밥 싸 먹는 맛",
      firstOrder: "전부 기본으로 — 그 집의 표준을 먼저",
    },
    comparisons: [
      {
        name: "지로계",
        text: "같은 볼륨 계열이지만 지로계는 야채 산과 마늘, 극태면이 중심입니다.",
      },
    ],
  },
  {
    slug: "jiro",
    intro: [
      "도쿄 라멘지로에서 시작된 계보입니다. 산더미 숙주·양배추, 마늘, 두꺼운 돼지고기(부타), 극태면이 한 그릇에 올라갑니다.",
      "'야사이 마시(야채 많이)' 같은 콜 문화가 있어 첫 방문 전에 주문 방식을 알아두면 좋습니다.",
    ],
    traits: {
      taste: "묵직한 돈코츠쇼유 + 마늘 펀치",
      body: "극한의 볼륨 — 공복으로 가야 합니다",
      firstOrder: "전부 기본(콜 없이) — 양부터 파악",
    },
    comparisons: [
      {
        name: "이에케",
        text: "이에케는 김·시금치·밥 조합, 지로계는 야채 산과 볼륨이 정체성입니다.",
      },
    ],
  },
];

export function guideBySlug(slug: string): GuideContent | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
