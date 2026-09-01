"use client";

import { useEffect, useState } from "react";

const KEY = "ramap.recent-searches.v1";
const MAX = 10;

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function write(items: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* 스토리지 불가 환경에선 세션 내 상태만 유지 */
  }
}

export function useRecentSearches() {
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    setItems(read());
  }, []);

  const add = (term: string) => {
    const next = [term, ...items.filter((t) => t !== term)].slice(0, MAX);
    setItems(next);
    write(next);
  };

  const remove = (term: string) => {
    const next = items.filter((t) => t !== term);
    setItems(next);
    write(next);
  };

  const clear = () => {
    setItems([]);
    write([]);
  };

  return { items, add, remove, clear };
}
