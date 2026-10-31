import "client-only";
import posthog from "posthog-js";

type EventMap = {
  filter_changed: {
    soups: string[];
    forms: string[];
    lineages: string[];
    new_only: boolean;
    active_count: number;
  };
  hide_visited_toggled: { on: boolean };
  saved_only_toggled: { on: boolean };
  search_result_selected: {
    kind: "shop" | "genre" | "area";
    value: string;
    query: string;
  };
  shop_selected: { shop_id: string; source: "map" | "list" | "search" };
  locate_clicked: { granted: boolean };
  map_load_failed: Record<string, never>;
  record_toggled: { kind: "visited" | "saved"; on: boolean; shop_id: string };
  record_log_submitted: {
    shop_id: string;
    photo_count: number;
    has_comment: boolean;
    revisit: boolean;
    ok: boolean;
    failed_step?: "auth" | "encode" | "upload" | "insert";
  };
  report_opened: { type: "new" | "edit" };
  report_submitted: { type: string; ok: boolean; logged_in: boolean };
  directions_clicked: { app: string; shop_id: string };
  instagram_clicked: { shop_id: string; shared: boolean };
  share_clicked: { shop_id: string; method: "native" | "clipboard" };
  address_copied: { shop_id: string };
  login_started: Record<string, never>;
  account_deleted: Record<string, never>;
};

export type AnalyticsEvent = keyof EventMap;

export function track<E extends AnalyticsEvent>(event: E, props: EventMap[E]) {
  if (!posthog.__loaded) return;
  posthog.capture(event, props);
}

export function identifyUser(userId: string) {
  if (!posthog.__loaded) return;
  if (posthog.get_distinct_id() !== userId) posthog.identify(userId);
}

export function resetUser() {
  if (!posthog.__loaded) return;
  posthog.reset();
}

export function excludeOperator() {
  if (!posthog.__loaded) return;
  posthog.opt_out_capturing();
}
