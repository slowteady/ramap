export type PageType =
  | "home"
  | "shop"
  | "area"
  | "area_genre"
  | "guide_index"
  | "guide"
  | "style"
  | "me"
  | "settings"
  | "legal"
  | "admin"
  | "other";

export function pageTypeOf(pathname: string): PageType {
  const [first, ...rest] = pathname.split("/").filter(Boolean);
  switch (first) {
    case undefined:
      return "home";
    case "shop":
      return "shop";
    case "area":
      return rest.length > 1 ? "area_genre" : "area";
    case "guide":
      return rest.length > 0 ? "guide" : "guide_index";
    case "style":
      return "style";
    case "me":
      return "me";
    case "settings":
      return "settings";
    case "privacy":
    case "terms":
      return "legal";
    case "admin":
      return "admin";
    default:
      return "other";
  }
}

const IN_APP_BROWSERS: [RegExp, string][] = [
  [/KAKAOTALK/i, "kakaotalk"],
  [/Instagram/i, "instagram"],
  [/NAVER\(inapp/i, "naver"],
  [/FBAN|FBAV/, "facebook"],
  [/\bLine\//, "line"],
];

export function inAppBrowserOf(userAgent: string): string | null {
  return IN_APP_BROWSERS.find(([re]) => re.test(userAgent))?.[1] ?? null;
}
