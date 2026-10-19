import type { ShopStatus } from "./types";

/* 폐업·이전 검증 장부(data/closure-verification.json) — closure-verification 스킬 기준을 통과한 매장만 기록 */
export type ClosureVerdict = {
  verdict: "closed" | "moved";
  checkedAt: string;
  evidence: string[];
  movedTo?: string;
};
export type ClosureLedger = Record<string, ClosureVerdict>;

export type ClosurePublicState = "open" | "closed" | "moved" | "hidden";

/* 확인되지 않은 폐업 표시는 영업 방해·명예훼손 소지 — 검증 장부에 없는 폐업 매장은 페이지 자체를 내린다(2026-10-19 PO) */
export function closurePublicState(
  shop: { id: string; status: ShopStatus },
  ledger: ClosureLedger,
): ClosurePublicState {
  if (shop.status !== "closed") return "open";
  const entry = ledger[shop.id];
  if (!entry) return "hidden";
  return entry.verdict;
}
