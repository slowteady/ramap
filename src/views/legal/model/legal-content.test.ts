import { describe, expect, it } from "vitest";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/shared/config/legal";
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from "./legal-content";

const text = (sections: { body: string[] }[]) =>
  sections.flatMap((s) => s.body).join("\n");

describe("약관·개인정보처리방침 본문", () => {
  it("없앤 기능(기록 내려받기·온보딩)을 약속하지 않는다", () => {
    for (const body of [text(TERMS_SECTIONS), text(PRIVACY_SECTIONS)]) {
      expect(body).not.toMatch(/내려받/);
      expect(body).not.toMatch(/온보딩/);
    }
  });

  it("기록 사본은 요청하면 받을 수 있다고 안내한다", () => {
    expect(text(TERMS_SECTIONS)).toMatch(/기록 사본/);
    expect(text(PRIVACY_SECTIONS)).toMatch(/기록 사본/);
  });

  it("부칙·고지의 시행 버전이 설정 버전과 같다", () => {
    expect(text(TERMS_SECTIONS)).toContain(`버전 ${TERMS_VERSION}`);
    expect(text(PRIVACY_SECTIONS)).toContain(`버전 ${PRIVACY_VERSION}`);
  });
});
