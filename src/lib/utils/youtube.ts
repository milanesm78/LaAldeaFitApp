/**
 * Robust YouTube URL parser using URL() for proper parsing.
 * Single source of truth for YouTube URL parsing and validation.
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - All of the above with additional query params (e.g., ?feature=share)
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;

    // youtube.com, www.youtube.com, m.youtube.com
    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      // /watch?v=VIDEO_ID
      const v = parsed.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]+$/.test(v)) return v;

      // /embed/VIDEO_ID, /shorts/VIDEO_ID, /v/VIDEO_ID
      const pathMatch = parsed.pathname.match(
        /^\/(embed|shorts|v)\/([a-zA-Z0-9_-]+)/
      );
      if (pathMatch) return pathMatch[2];
    }

    // youtu.be/VIDEO_ID
    if (hostname === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      if (id && /^[a-zA-Z0-9_-]+$/.test(id)) return id;
    }
  } catch {
    // invalid URL
  }

  return null;
}

/**
 * Check if a URL is a valid YouTube URL that can produce a playable video.
 * Tied directly to extractability -- if we can extract a video ID, the URL is valid.
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Get YouTube thumbnail URL for a video ID.
 * Uses mqdefault (320x180) for card grid performance on mobile.
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: "default" | "mqdefault" | "hqdefault" | "maxresdefault" = "mqdefault"
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}
