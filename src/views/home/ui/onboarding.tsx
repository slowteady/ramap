"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { soupBySlug, type ShopPin } from "@/entities/shop";
import { useAuth, useProfile } from "@/features/auth";
import { useRecords } from "@/features/records";
import { cn } from "@/shared/lib/utils";
import { useOnboarding } from "../model/use-onboarding";

export function Onboarding({ pins }: { pins: ShopPin[] }) {
  const { open, dismiss } = useOnboarding();
  const { user } = useAuth();
  const { agreedAt } = useProfile();
  const { visitedIds, markVisited, remove } = useRecords();
  const [query, setQuery] = useState("");

  if (!open || !user || !agreedAt) return null;

  const filtered = query
    ? pins.filter((p) => p.name.includes(query.trim()))
    : pins;
  const count = pins.filter((p) => visitedIds.has(p.id)).length;

  const toggle = (id: string) => {
    if (visitedIds.has(id)) remove(id);
    else markVisited(id);
  };

  return (
    <div className="fixed inset-0 z-50 mx-auto flex w-full max-w-app flex-col bg-white">
      <div className="flex justify-end px-4 py-3">
        <button
          type="button"
          onClick={dismiss}
          className="text-secondary font-semibold text-gray-400"
        >
          건너뛰기
        </button>
      </div>

      <div className="flex flex-col gap-1.5 px-4">
        <h1 className="text-display font-extrabold leading-tight text-ink">
          가본 라멘집을
          <br />
          먼저 찍어보세요
        </h1>
        <p className="text-secondary text-gray-400">
          기록은 계정에 저장돼요
        </p>
      </div>

      <div className="px-4 pt-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="가게 이름 검색"
          className="w-full rounded-card bg-gray-050 px-3 py-2.5 text-body text-ink outline-none placeholder:text-gray-300"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-4">
        <span className="text-secondary font-semibold text-gray-400">
          많이 가는 곳부터
        </span>
        <ul className="grid grid-cols-2 gap-2 pt-2">
          {filtered.map((pin) => {
            const checked = visitedIds.has(pin.id);
            return (
              <li key={pin.id}>
                <button
                  type="button"
                  onClick={() => toggle(pin.id)}
                  className={cn(
                    "flex w-full flex-col gap-0.5 rounded-card px-3 py-2.5 text-left",
                    checked ? "bg-ink text-white" : "bg-gray-050 text-ink",
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span className="truncate text-body font-semibold">
                      {pin.name}
                    </span>
                    {checked && <Check className="size-4 shrink-0" />}
                  </span>
                  <span
                    className={cn(
                      "truncate text-caption",
                      checked ? "text-white/60" : "text-gray-400",
                    )}
                  >
                    {[pin.areaLabel, soupBySlug(pin.primarySoup)?.label]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="flex items-center gap-3 border-t border-gray-050 px-4 py-3">
        <span className="shrink-0 text-secondary font-bold text-ink">
          {count}곳
        </span>
        <button
          type="button"
          onClick={dismiss}
          className="flex-1 rounded-pill bg-ramen py-3 text-body font-bold text-white"
        >
          내 라멘 지도 시작하기
        </button>
      </div>
    </div>
  );
}
