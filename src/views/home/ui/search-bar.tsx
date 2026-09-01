"use client";

import { Suspense } from "react";
import { Search } from "lucide-react";
import { useSearchQuery } from "../model/use-search-query";

function SearchButtonInner() {
  const { open } = useSearchQuery();
  return (
    <button
      type="button"
      aria-label="검색"
      onClick={open}
      className="-m-1.5 flex size-11 items-center justify-center rounded-pill"
    >
      <span className="flex size-8 items-center justify-center rounded-pill bg-gray-050 text-ink">
        <Search className="size-4.5" />
      </span>
    </button>
  );
}

export function SearchButton() {
  return (
    <Suspense>
      <SearchButtonInner />
    </Suspense>
  );
}
