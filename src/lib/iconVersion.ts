/**
 * Single source of truth for icon/manifest cache-busting.
 * Bump this value whenever you change favicon/apple-touch/icon-192/512 or the manifest.
 * All <link rel="icon">, <link rel="apple-touch-icon"> and <link rel="manifest">
 * tags will be re-pointed at boot to ?v=<ICON_VERSION>, forcing browsers to refetch.
 */
export const ICON_VERSION = "genogy-4";

export const withIconVersion = (path: string): string => {
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}v=${ICON_VERSION}`;
};

type IconSpec = {
  rel: string;
  href: string;
  type?: string;
  sizes?: string;
};

const ICON_SPECS: IconSpec[] = [
  { rel: "icon", href: "/favicon-genogy-v4.png", type: "image/png", sizes: "48x48" },
  { rel: "icon", href: "/favicon.ico", sizes: "any" },
  { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
  { rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
  { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
  { rel: "manifest", href: "/site.webmanifest" },
];

/**
 * Ensure every icon/manifest link in <head> uses the current ICON_VERSION.
 * - Removes stale duplicates (different ?v= values).
 * - Adds any missing link.
 * - Updates href if the version drifted.
 *
 * Safe to call multiple times. Runs only in the browser.
 */
export const ensureIconVersion = (): void => {
  if (typeof document === "undefined") return;
  const head = document.head;
  if (!head) return;

  const versioned = (href: string) => withIconVersion(href);

  for (const spec of ICON_SPECS) {
    const selectorRel =
      spec.rel === "icon" && spec.sizes
        ? `link[rel="icon"][sizes="${spec.sizes}"]`
        : `link[rel="${spec.rel}"]${spec.sizes ? `[sizes="${spec.sizes}"]` : ""}`;

    const matches = Array.from(
      head.querySelectorAll<HTMLLinkElement>(selectorRel),
    );

    // Keep one canonical link, drop the rest.
    let canonical = matches[0];
    for (let i = 1; i < matches.length; i++) matches[i].remove();

    const desiredHref = versioned(spec.href);

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = spec.rel;
      if (spec.type) canonical.type = spec.type;
      if (spec.sizes) canonical.setAttribute("sizes", spec.sizes);
      head.appendChild(canonical);
    }

    if (canonical.getAttribute("href") !== desiredHref) {
      canonical.setAttribute("href", desiredHref);
    }
    if (spec.type && canonical.getAttribute("type") !== spec.type) {
      canonical.setAttribute("type", spec.type);
    }
  }

  // Also bump theme-color presence (cheap, idempotent).
  if (!head.querySelector('meta[name="theme-color"]')) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = "#6532FD";
    head.appendChild(meta);
  }
};
