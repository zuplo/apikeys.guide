import { useEffect } from "react";
import posthog from "posthog-js";

interface PostHogInitProps {
  apiKey: string;
  apiHost?: string;
}

export function PostHogInit({ apiKey, apiHost }: PostHogInitProps) {
  useEffect(() => {
    if (posthog.__loaded) return;
    posthog.init(apiKey, {
      api_host: apiHost || "https://us.i.posthog.com",
      ui_host: "https://us.posthog.com",
      disable_session_recording: true,
      autocapture: true,
      capture_dead_clicks: true,
      capture_heatmaps: true,
      capture_pageview: "history_change",
    });
  }, [apiKey, apiHost]);

  return null;
}
