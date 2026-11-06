import React from 'react';

export type ParsedVideo = {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string | null;
  rawUrl: string;
};

/**
 * Parses any video link (YouTube, Vimeo, MP4, WebM, data URL) and generates
 * the embed or direct playable link.
 */
export function parseVideoUrl(url?: string | null): ParsedVideo {
  if (!url || typeof url !== 'string') {
    return { type: 'unknown', embedUrl: null, rawUrl: '' };
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return { type: 'unknown', embedUrl: null, rawUrl: '' };
  }

  // 1. YouTube (supports watch?v=, youtu.be, /shorts/, /embed/)
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      rawUrl: trimmed,
    };
  }

  // 2. Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/i;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      rawUrl: trimmed,
    };
  }

  // 3. Direct Video (MP4, WebM, OGG, MOV, or Data URL base64)
  if (
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('blob:') ||
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)
  ) {
    return {
      type: 'direct',
      embedUrl: trimmed,
      rawUrl: trimmed,
    };
  }

  // Fallback direct url
  return {
    type: 'direct',
    embedUrl: trimmed,
    rawUrl: trimmed,
  };
}

export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.length > 5 && (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:video/') ||
    trimmed.startsWith('blob:')
  );
}

type PhoneVideoPlayerProps = {
  url: string;
  className?: string;
  title?: string;
  autoPlay?: boolean;
  muted?: boolean;
  controls?: boolean;
  loop?: boolean;
};

export const PhoneVideoPlayer: React.FC<PhoneVideoPlayerProps> = ({
  url,
  className = 'w-full h-full rounded-2xl overflow-hidden',
  title = 'Phone Video Showcase',
  autoPlay = false,
  muted = true,
  controls = true,
  loop = false,
}) => {
  const parsed = parseVideoUrl(url);

  if (!parsed.embedUrl) {
    return (
      <div className={`grid place-items-center bg-gray-100 text-gray-500 text-xs p-4 ${className}`}>
        Invalid or unsupported video URL
      </div>
    );
  }

  if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
    const finalUrl = `${parsed.embedUrl}${parsed.embedUrl.includes('?') ? '&' : '?'}autoplay=${autoPlay ? 1 : 0}&mute=${muted ? 1 : 0}`;
    return (
      <div className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}>
        <iframe
          src={finalUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}>
      <video
        src={parsed.embedUrl}
        controls={controls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className="h-full w-full object-contain"
      >
        <source src={parsed.embedUrl} />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

