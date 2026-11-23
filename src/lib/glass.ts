/**
 * Glass (Dataflare) analytics: our own analytics, running in our Cloudflare account and
 * served from https://simmsreeve.com/_glass (dashboard: https://simmsreeve.com/_glass/app). It stores
 * nothing on the device until the visitor accepts cookies (a daily-rotating
 * scrambled id is worked out on the server instead); after Accept it keeps a
 * device id in localStorage. Every visit is recorded for session replay with
 * every form input masked; before Accept the recording stores nothing on the
 * device, and after Reject nothing is recorded.
 *
 * The script is loaded once; calls made before it arrives are queued.
 */

type Props = Record<string, string | number | boolean | null | undefined>;

interface GlassApi {
  capture(event: string, props?: Props): void;
  identify(userId: string, props?: Props): void;
  consent(granted: boolean): void;
}

declare global {
  interface Window {
    glass?: GlassApi | { q: unknown[][] };
  }
}

const PROJECT = "website";
const SCRIPT_ID = "glass-sdk";
/** Where Glass is served: this site's /_glass route, or the Glass Worker itself. */
const HOST = "https://simmsreeve.com/_glass";

function call(method: keyof GlassApi, ...args: unknown[]): void {
  if (typeof window === "undefined") return;
  try {
    const g = window.glass;
    if (g && typeof (g as GlassApi)[method] === "function") {
      (g as unknown as Record<string, (...a: unknown[]) => void>)[method](...args);
    } else {
      // Queued until s.js loads; it replays the queue on start.
      const queue = (g as { q?: unknown[][] } | undefined)?.q ?? [];
      queue.push([method, ...args]);
      window.glass = { q: queue };
    }
  } catch {
    // Analytics must never break the UI.
  }
}

/** Load Glass once. `consented` starts it with a stored id (and replay) instead of cookieless. */
export function startGlass(consented: boolean): void {
  if (typeof document === "undefined" || document.getElementById(SCRIPT_ID)) return;
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") return;
  if (!window.glass) window.glass = { q: [] };
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.defer = true;
  script.src = `${HOST}/s.js`;
  script.dataset.project = PROJECT;
  script.dataset.persistence = consented ? "localStorage" : "cookieless";
  // Record every visit for replay (inputs masked). Before consent, or with no banner,
  // the recording stores nothing on the device either.
  script.dataset.replaySampleRate = "1";
  script.dataset.replayCookieless = "true";
  document.head.appendChild(script);
}

/** Follow the cookie banner: true after Accept, false after Reject. */
export function glassConsent(granted: boolean): void {
  call("consent", granted);
}

/** A custom event. Never pass emails, names or postcodes. */
export function glassCapture(event: string, props?: Props): void {
  call("capture", event, props);
}
