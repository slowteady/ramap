"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function useAreaFocus(
  ready: boolean,
  panToArea: (area: string) => void,
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const area = searchParams.get("area");

  useEffect(() => {
    if (!ready || !area) return;
    panToArea(area);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("area");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [ready, area, panToArea, router, pathname, searchParams]);
}
