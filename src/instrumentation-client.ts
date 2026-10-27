import posthog from "posthog-js";
import { inAppBrowserOf, pageTypeOf } from "@/shared/lib/analytics-context";

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

if (token) {
  posthog.init(token, {
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-08-30",
    person_profiles: "identified_only",
    capture_exceptions: true,
    capture_performance: true,
    capture_dead_clicks: true,
    enable_heatmaps: true,
    disable_session_recording: true,
    before_send: (event) => {
      if (event) {
        event.properties.page_type = pageTypeOf(window.location.pathname);
      }
      return event;
    },
  });
  const inApp = inAppBrowserOf(navigator.userAgent);
  posthog.register({ in_app: inApp ?? "none" });
}
