/**
 * Robust YouTube URL parser that handles 4+ URL formats users may paste.
 * Returns the 11-character video ID or null if no valid ID found.
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * - https://youtu.be/dQw4w9WgXcQ
 * - https://www.youtube.com/embed/dQw4w9WgXcQ
 * - https://www.youtube.com/v/dQw4w9WgXcQ
 * - https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share
 */
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
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
