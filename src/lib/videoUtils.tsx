import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export type ParsedVideo = {
  type: 'youtube' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string | null;
  rawUrl: string;
  videoId?: string;
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
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      rawUrl: trimmed,
      videoId,
    };
  }

  // 2. Vimeo
  const vimeoRegex = /(?:vimeo\.com\/)(\d+)/i;
  const vimeoMatch = trimmed.match(vimeoRegex);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${videoId}`,
      rawUrl: trimmed,
      videoId,
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
  return (
    trimmed.length > 5 &&
    (trimmed.startsWith('http://') ||
      trimmed.startsWith('https://') ||
      trimmed.startsWith('data:video/') ||
      trimmed.startsWith('blob:'))
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
  autoPlay = true,
  muted = true,
  controls = true,
  loop = true,
}) => {
  const parsed = parseVideoUrl(url);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(muted);

  // Guarantee HTML5 video autoplays automatically across all browsers
  useEffect(() => {
    const video = videoRef.current;
    if (!video || parsed.type === 'youtube' || parsed.type === 'vimeo') return;

    video.defaultMuted = isMuted;
    video.muted = isMuted;

    if (autoPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If browser policy prevents unmuted autoplay, mute and retry immediately
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
    }
  }, [autoPlay, parsed.embedUrl, parsed.type, isMuted]);

  if (!parsed.embedUrl) {
    return (
      <div className={`grid place-items-center bg-gray-100 text-gray-500 text-xs p-4 ${className}`}>
        Invalid or unsupported video URL
      </div>
    );
  }

  // 1. YouTube & Vimeo Autoplay Handler
  if (parsed.type === 'youtube' || parsed.type === 'vimeo') {
    const params = new URLSearchParams();

    if (autoPlay) {
      params.set('autoplay', '1');
      params.set('mute', isMuted ? '1' : '0');
      params.set('playsinline', '1');
    }
    if (loop && parsed.videoId) {
      params.set('loop', '1');
      params.set('playlist', parsed.videoId);
    }
    params.set('rel', '0');
    params.set('modestbranding', '1');

    const finalUrl = `${parsed.embedUrl}?${params.toString()}`;

    return (
      <div className={`relative aspect-video w-full overflow-hidden bg-black ${className}`}>
        <iframe
          src={finalUrl}
          title={title}
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        {/* Sound toggle overlay for YouTube */}
        {autoPlay && isMuted && (
          <button
            type="button"
            onClick={() => setIsMuted(false)}
            className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 hover:bg-black/90 text-white text-[11px] font-bold backdrop-blur-xs transition shadow-md cursor-pointer"
            title="Unmute audio"
          >
            <VolumeX className="h-3.5 w-3.5 text-amber-400" /> Click to Unmute
          </button>
        )}
      </div>
    );
  }

  // 2. Direct MP4 / WebM / Video Element
  return (
    <div className={`relative aspect-video w-full overflow-hidden bg-black group ${className}`}>
      <video
        ref={videoRef}
        src={parsed.embedUrl}
        controls={controls}
        autoPlay={autoPlay}
        muted={isMuted}
        loop={loop}
        playsInline
        className="h-full w-full object-contain"
      >
        <source src={parsed.embedUrl} />
        Your browser does not support the video tag.
      </video>

      {/* Interactive Unmute / Mute Button for HTML5 Video */}
      <button
        type="button"
        onClick={() => {
          if (videoRef.current) {
            const nextMuted = !videoRef.current.muted;
            videoRef.current.muted = nextMuted;
            setIsMuted(nextMuted);
          }
        }}
        className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[10px] font-bold backdrop-blur-xs transition shadow-md cursor-pointer"
        title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
      >
        {isMuted ? (
          <>
            <VolumeX className="h-3 w-3 text-amber-400" /> Tap for Sound
          </>
        ) : (
          <>
            <Volume2 className="h-3 w-3 text-emerald-400" /> Sound On
          </>
        )}
      </button>
    </div>
  );
};
