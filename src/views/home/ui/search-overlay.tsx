"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, Clock, MapPin, PenLine, Search, X } from "lucide-react";
import { type ShopPin } from "@/entities/shop";
import { cn } from "@/shared/lib/utils";
import type { MapFilters } from "../model/filter";
import { FILTER_AXES, visibleItems } from "../model/filter-axes";
import { buildSuggestions, matchRank } from "../model/search";
import { useRecentSearches } from "../model/use-recent-searches";

type SearchOverlayProps = {
  pins: ShopPin[];
  onSelectShop: (pin: ShopPin) => void;
  onSelectGenre: (filterKey: keyof MapFilters, slug: string) => void;
  onSelectArea: (area: string) => void;
  onReport: () => void;
  onClose: () => void;
};

function Highlight({ text, query }: { text: string; query: string }) {
  const rank = matchRank(text, query);
  if (rank === null || rank >= 2) return <>{text}</>;
  const q = query.replace(/\s+/g, "").toLowerCase();
  const idx = text.replace(/\s+/g, "").toLowerCase().indexOf(q);
  let seen = 0;
  let start = -1;
  let end = -1;
  for (let i = 0; i < text.length; i++) {
    if (/\s/.test(text[i])) continue;
    if (seen === idx) start = start === -1 ? i : start;
    seen += 1;
    if (seen === idx + q.length) {
      end = i + 1;
      break;
    }
  }
  if (start === -1 || end === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, start)}
      <span className="font-normal text-gray-500">
        {text.slice(start, end)}
      </span>
      {text.slice(end)}
    </>
  );
}

export function SearchOverlay({
  pins,
  onSelectShop,
  onSelectGenre,
  onSelectArea,
  onReport,
  onClose,
}: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const recent = useRecentSearches();
  const suggestions = useMemo(
    () => buildSuggestions(pins, query),
    [pins, query],
  );
  const soupAxis = FILTER_AXES.find((a) => a.axis === "soup");
  const genreShortcuts = soupAxis
    ? visibleItems(soupAxis.items).filter((item) =>
        pins.some((p) =>
          p.soups.includes(item.slug as ShopPin["soups"][number]),
        ),
      )
    : [];
  const typing = query.trim().length > 0;

  const pickShop = (pin: ShopPin) => {
    recent.add(pin.name);
    onSelectShop(pin);
  };
  const pickGenre = (
    filterKey: keyof MapFilters,
    slug: string,
    label: string,
  ) => {
    recent.add(label);
    onSelectGenre(filterKey, slug);
  };
  const pickArea = (area: string) => {
    recent.add(area);
    onSelectArea(area);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 mx-auto flex w-full max-w-app flex-col bg-white duration-300 animate-in slide-in-from-bottom">
      <header className="flex shrink-0 items-center gap-1 px-2 py-2">
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex size-10 shrink-0 items-center justify-center rounded-pill text-ink"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-pill bg-gray-050 px-3.5 py-2.5">
          <Search className="size-4 shrink-0 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="라멘집·장르·동네 검색"
            autoFocus
            className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-gray-300"
          />
          {query && (
            <button
              type="button"
              aria-label="지우기"
              onClick={() => setQuery("")}
              className="flex size-5 shrink-0 items-center justify-center rounded-pill bg-gray-200 text-white"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
        <div className="w-2 shrink-0" />
      </header>

      {!typing && (
        <div className="flex flex-col gap-6 overflow-y-auto px-4 pt-3 pb-10">
          {genreShortcuts.length > 0 && (
            <section className="flex flex-col gap-2.5">
              <h2 className="text-caption font-semibold text-gray-400">
                장르로 찾기
              </h2>
              <div className="flex flex-wrap gap-2">
                {genreShortcuts.map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => pickGenre("soups", item.slug, item.label)}
                    className="rounded-pill border border-gray-100 bg-white px-3.5 py-1.5 text-secondary font-semibold text-ink"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
          )}
          {recent.items.length > 0 && (
            <section className="flex flex-col gap-1">
              <div className="flex items-baseline justify-between">
                <h2 className="text-caption font-semibold text-gray-400">
                  최근 검색
                </h2>
                <button
                  type="button"
                  onClick={recent.clear}
                  className="text-caption text-gray-400"
                >
                  전체 삭제
                </button>
              </div>
              {recent.items.map((term) => (
                <div key={term} className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setQuery(term)}
                    className="flex min-w-0 flex-1 items-center gap-2.5 py-2 text-left"
                  >
                    <Clock className="size-4 shrink-0 text-gray-300" />
                    <span className="truncate text-body text-ink">{term}</span>
                  </button>
                  <button
                    type="button"
                    aria-label={`${term} 삭제`}
                    onClick={() => recent.remove(term)}
                    className="p-1.5 text-gray-300"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </section>
          )}
        </div>
      )}

      {typing && (
        <div className="flex flex-1 flex-col overflow-y-auto px-4 pt-1 pb-10">
          {suggestions.map((s) =>
            s.kind === "genre" ? (
              <button
                key={`g:${s.filterKey}:${s.slug}`}
                type="button"
                onClick={() => pickGenre(s.filterKey, s.slug, s.label)}
                className="flex items-center gap-2.5 border-b border-gray-050 py-3 text-left"
              >
                <Search className="size-4 shrink-0 text-ramen" />
                <span className="text-body font-bold text-ink">
                  <Highlight text={s.label} query={query} />
                </span>
                <span className="text-secondary text-gray-400">
                  {s.count}곳
                </span>
              </button>
            ) : s.kind === "area" ? (
              <button
                key={`a:${s.area}`}
                type="button"
                onClick={() => pickArea(s.area)}
                className="flex items-center gap-2.5 border-b border-gray-050 py-3 text-left"
              >
                <MapPin className="size-4 shrink-0 text-gray-400" />
                <span className="text-body font-bold text-ink">
                  <Highlight text={s.area} query={query} />
                </span>
                <span className="text-secondary text-gray-400">
                  {s.count}곳
                </span>
              </button>
            ) : (
              <button
                key={`s:${s.shop.id}`}
                type="button"
                onClick={() => pickShop(s.shop)}
                className="flex items-center gap-2.5 border-b border-gray-050 py-3 text-left"
              >
                <Search className="size-4 shrink-0 text-gray-300" />
                <span className={cn("truncate text-body font-bold text-ink")}>
                  <Highlight text={s.shop.name} query={query} />
                </span>
                {s.shop.areaLabel && (
                  <span className="shrink-0 text-secondary text-gray-400">
                    {s.shop.areaLabel}
                  </span>
                )}
              </button>
            ),
          )}
          {suggestions.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-16">
              <p className="text-body font-bold text-ink">검색 결과가 없어요</p>
              <p className="text-secondary text-gray-500">
                찾는 라멘집이 라맵에 없다면 알려주세요
              </p>
              <button
                type="button"
                onClick={onReport}
                className="mt-3 flex items-center gap-1.5 rounded-pill bg-ink px-6 py-3 text-body font-bold text-white"
              >
                <PenLine className="size-4" />
                라멘집 등록하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
