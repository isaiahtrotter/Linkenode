import "server-only";

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

// Bounds worst-case regex cost on a huge page — meta tags always sit near
// the top of <head> anyway, so this never actually loses real tags.
const MAX_HTML_BYTES = 200_000;

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

// Meta tags vary in attribute order (content before property/name is
// common), so parse each tag's attributes as a bag rather than assuming a
// fixed order.
function findMetaContent(html: string, names: string[]): string | null {
  const metaTagRegex = /<meta\s+([^>]*)>/gi;
  let tagMatch: RegExpExecArray | null;
  while ((tagMatch = metaTagRegex.exec(html))) {
    const attrs: Record<string, string> = {};
    const attrRegex = /([a-zA-Z0-9:_-]+)\s*=\s*["']([^"']*)["']/g;
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(tagMatch[1]))) {
      attrs[attrMatch[1].toLowerCase()] = attrMatch[2];
    }
    const key = attrs.property ?? attrs.name;
    if (key && names.includes(key.toLowerCase()) && attrs.content) {
      return decodeHtmlEntities(attrs.content);
    }
  }
  return null;
}

export type DetectedProfile = { name: string | null; imageUrl: string | null };

// Best-effort — pulls a name/photo from a portfolio/social link via its
// Open Graph / Twitter Card meta tags. Works generically across most sites
// without needing per-platform API keys, but isn't guaranteed: some sites
// (X/Twitter profile pages especially) block non-browser fetches or render
// client-side with no usable tags in the raw HTML. Never throws — callers
// treat a null result as "detection didn't work," not an error.
export async function detectProfileFromLink(url: string): Promise<DetectedProfile> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": BROWSER_USER_AGENT, Accept: "text/html" },
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { name: null, imageUrl: null };

    const fullText = await res.text();
    const html = fullText.slice(0, MAX_HTML_BYTES);

    const name = findMetaContent(html, ["og:title", "twitter:title"]);
    const imageUrl = findMetaContent(html, ["og:image", "twitter:image"]);
    return { name, imageUrl };
  } catch {
    return { name: null, imageUrl: null };
  }
}
