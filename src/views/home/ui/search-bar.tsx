"use client";

import { Suspense } from "react";
import { Search } from "lucide-react";
import { useSearchQuery } from "../model/use-search-query";

function SearchBarInner() {
  const { open } = useSearchQuery();
  return (
    <button
      type="button"
      onClick={open}
      className="flex min-w-0 flex-1 items-center gap-2 rounded-pill bg-gray-050 px-3.5 py-2"
    >
      <Search className="size-4 shrink-0 text-gray-400" />
      <span className="truncate text-secondary text-gray-400">
        라멘집·장르·동네 검색
      </span>
    </button>
  );
}

export function SearchBar() {
  return (
    <Suspense>
      <SearchBarInner />
    </Suspense>
  );
}
