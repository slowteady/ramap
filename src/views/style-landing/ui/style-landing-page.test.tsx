import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LINEAGES, type Shop } from "@/entities/shop";
import { createNavigationStub } from "@/shared/testing/next-navigation";
import { StyleLandingPage } from "./style-landing-page";

const nav = vi.hoisted(() => ({
  current: null as never as ReturnType<typeof createNavigationStub>,
}));
vi.mock("next/navigation", () => ({
  useRouter: () => nav.current.handlers.useRouter(),
  usePathname: () => nav.current.handlers.usePathname(),
  useSearchParams: () => nav.current.handlers.useSearchParams(),
}));
const records = vi.hoisted(() => ({ visitedIds: new Set<string>() }));
vi.mock("@/features/records", () => ({
  useRecords: () => records,
}));

const shop = (over: Partial<Shop>): Shop => ({
  id: "kinka",
  name: "킨카",
  branch: null,
  address: null,
  city: "서울",
  district: "성동구",
  areaLabel: "성수",
  lat: 37.54,
  lng: 127.05,
  coordSource: "manual-pin",
  hours: null,
  breakTime: null,
  closedDays: null,
  openedAt: null,
  status: "open",
  statusChangedAt: null,
  forms: ["ramen"],
  primaryForm: "ramen",
  soups: ["tonkotsu"],
  primarySoup: "tonkotsu",
  soupDetail: [],
  lineages: ["iekei"],
  amenities: [],
  confidence: "certain",
  menus: [],
  photos: [],
  seats: null,
  tagline: null,
  instagram: null,
  naverPlace: null,
  waitingLink: null,
  verification: "confirmed",
  lastVerifiedAt: null,
  source: null,
  note: null,
  ...over,
});

const iekei = LINEAGES.find((l) => l.slug === "iekei")!;

describe("StyleLandingPage 목록", () => {
  beforeEach(() => {
    nav.current = createNavigationStub();
  });

  it("실시간 판정처럼 읽히는 '영업중' 대신 영업시간을 보여준다", () => {
    render(
      <StyleLandingPage
        lineage={iekei}
        shops={[
          shop({
            id: "a",
            name: "멘야 카엔",
            hours: "11:00-21:00",
            breakTime: "15:00-17:00",
          }),
          shop({ id: "b", name: "라멘 킥스타트" }),
          shop({ id: "c", name: "쉬는집", status: "paused" }),
        ]}
      />,
    );
    expect(screen.queryByText("영업중")).not.toBeInTheDocument();
    expect(
      screen.getByText("11:00-21:00 · 브레이크 15:00-17:00"),
    ).toBeInTheDocument();
    expect(screen.getByText("휴업 중")).toBeInTheDocument();
  });

  it("진행률 막대는 보류 — 완식이 있어도 그리지 않고 완식 표시만 남긴다", () => {
    records.visitedIds = new Set(["a"]);
    render(
      <StyleLandingPage
        lineage={iekei}
        shops={[shop({ id: "a", name: "멘야 카엔" }), shop({ id: "b" })]}
      />,
    );
    expect(screen.queryByText(/전국 이에케/)).not.toBeInTheDocument();
    expect(screen.queryByText("1/2")).not.toBeInTheDocument();
    expect(screen.getByText("완식 ✓")).toBeInTheDocument();
  });
});

describe("StyleLandingPage 머리말", () => {
  beforeEach(() => {
    nav.current = createNavigationStub();
  });

  it("통계 밴드 대신 제목 아래 한 줄로 개수와 주요 국물을 보여준다", () => {
    render(
      <StyleLandingPage
        lineage={iekei}
        shops={[shop({}), shop({ id: "b", soups: ["tonkotsu", "shoyu"] })]}
      />,
    );
    expect(screen.getByText("전국 2곳 · 주로 돈코츠·쇼유")).toBeInTheDocument();
    expect(screen.queryByText("등록")).not.toBeInTheDocument();
  });

  it("라멘집이 없으면 등록 시트로 가는 버튼을 준다", () => {
    render(<StyleLandingPage lineage={iekei} shops={[]} />);
    expect(
      screen.getByRole("link", { name: "라멘집 등록하기" }),
    ).toHaveAttribute("href", "/?report=new");
  });
});
