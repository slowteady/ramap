import { vi } from "vitest";

/* next/navigation 훅 스텁 — 각 테스트 파일에서 vi.mock("next/navigation", ...)에 물려 사용 */
export function createNavigationStub(initialQuery = "", pathname = "/") {
  let params = new URLSearchParams(initialQuery);
  const replace = vi.fn((url: string) => {
    params = new URLSearchParams(url.split("?")[1] ?? "");
  });
  return {
    replace,
    lastUrl: () => replace.mock.lastCall?.[0] as string | undefined,
    handlers: {
      useRouter: () => ({ replace, push: replace }),
      usePathname: () => pathname,
      useSearchParams: () => ({
        get: (k: string) => params.get(k),
        toString: () => params.toString(),
      }),
    },
  };
}
