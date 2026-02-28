import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import { extractYouTubeVideoId } from "@/lib/utils/youtube";

interface YouTubePlayerProps {
  youtubeUrl: string;
  exerciseName: string;
}

/**
 * Wrapper around react-lite-youtube-embed for exercise demonstration videos.
 * Uses extractYouTubeVideoId() to parse the URL, renders nothing if invalid.
 * noCookie mode for GDPR compliance.
 */
export function YouTubePlayer({ youtubeUrl, exerciseName }: YouTubePlayerProps) {
  const videoId = extractYouTubeVideoId(youtubeUrl);

  if (!videoId) return null;

  return (
    <div className="w-full aspect-video rounded-lg overflow-hidden">
      <LiteYouTubeEmbed
        id={videoId}
        title={exerciseName}
        poster="hqdefault"
        noCookie={true}
      />
    </div>
  );
}
