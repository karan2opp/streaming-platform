import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, Eye, Tag, Share2, Check, Sliders } from 'lucide-react';

import { apiClient } from '../api/apiClient';
import type { Video } from '../types/video';

interface VideoPlayerModalProps {
  video: Video | null;
  onClose: () => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ video, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [qualities, setQualities] = useState<{ label: string; value: number | string }[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('auto');
  const [hasIncrementedView, setHasIncrementedView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [usingHls, setUsingHls] = useState(false);

  useEffect(() => {
    if (!video || !videoRef.current) return;

    const videoEl = videoRef.current;
    const streamUrl = video.hlsUrl || `${video.url}/ik-master.m3u8`;

    // Reset state for new video
    setQualities([]);
    setSelectedQuality('auto');

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(streamUrl);
      hls.attachMedia(videoEl);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setUsingHls(true);
        const hlsLevels = data.levels.map((level, idx) => ({
          label: `${level.height}p (HLS)`,
          value: idx,
        }));
        setQualities([
          { label: 'Auto (ABR)', value: -1 },
          ...hlsLevels,
        ]);
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('[HLS Stream unavailable] Falling back to ImageKit Dynamic Transformation streams');
          setUsingHls(false);
          videoEl.src = video.url;
          // Set fallback resolution choices via ImageKit dynamic transformations
          setQualities([
            { label: 'Original (Source)', value: 'original' },
            { label: '1080p (Full HD)', value: 'tr:w-1920,h-1080' },
            { label: '720p (HD)', value: 'tr:w-1280,h-720' },
            { label: '480p (SD)', value: 'tr:w-854,h-480' },
            { label: '360p (Low)', value: 'tr:w-640,h-360' },
          ]);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = streamUrl;
      setUsingHls(true);
    } else {
      videoEl.src = video.url;
      setUsingHls(false);
      setQualities([
        { label: 'Original (Source)', value: 'original' },
        { label: '1080p (Full HD)', value: 'tr:w-1920,h-1080' },
        { label: '720p (HD)', value: 'tr:w-1280,h-720' },
        { label: '480p (SD)', value: 'tr:w-854,h-480' },
        { label: '360p (Low)', value: 'tr:w-640,h-360' },
      ]);
    }
  }, [video]);

  // Handle Play -> Increment view count once per modal open
  const handlePlay = () => {
    if (video && !hasIncrementedView) {
      setHasIncrementedView(true);
      apiClient.post(`/api/videos/${video.id}/view`).catch((err) => {
        console.error('Failed to increment view count:', err);
      });
    }
  };

  // Change Video Quality (Supports HLS level index or ImageKit URL transformation)
  const handleQualitySelect = (valStr: string) => {
    setSelectedQuality(valStr);
    if (!video || !videoRef.current) return;

    if (usingHls && hlsRef.current) {
      const levelIdx = parseInt(valStr, 10);
      hlsRef.current.currentLevel = levelIdx; // -1 for Auto ABR, or 0,1,2 for level
    } else {
      // Dynamic ImageKit Transformation switching for MP4 playback
      const currentTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;

      if (valStr === 'original') {
        videoRef.current.src = video.url;
      } else {
        videoRef.current.src = `${video.url}/${valStr}`;
      }

      videoRef.current.currentTime = currentTime;
      if (wasPlaying) videoRef.current.play();
    }
  };

  const handleCopyLink = () => {
    if (video?.url) {
      navigator.clipboard.writeText(video.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!video) return null;

  return (
    <div className="modal-overlay animate-fade-in" style={{ padding: '1rem' }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '92vh',
        overflowY: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Player Container */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 Aspect Ratio
          backgroundColor: '#000',
          borderRadius: '16px 16px 0 0',
          overflow: 'hidden',
        }}>
          <video
            ref={videoRef}
            controls
            autoPlay
            onPlay={handlePlay}
            poster={video.thumbnailUrl}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              outline: 'none',
            }}
          />

          {/* Close Button Overlay */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              backgroundColor: 'rgba(9, 13, 22, 0.75)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'background-color 0.2s ease',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>


        </div>

        {/* Video Information & Controls */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <span style={{
                  backgroundColor: 'rgba(139, 92, 246, 0.2)',
                  color: '#a78bfa',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}>
                  {video.category}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <Eye style={{ width: '15px', height: '15px', color: '#8b5cf6' }} />
                  <span>{video.views} views</span>
                </div>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
                {video.title}
              </h2>
            </div>

            {/* Quality Selector & Share Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {/* Quality Dropdown - Always Visible */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                padding: '0.35rem 0.75rem',
                borderRadius: '10px',
              }}>
                <Sliders style={{ width: '14px', height: '14px', color: '#a78bfa' }} />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Quality:</span>
                <select
                  value={selectedQuality}
                  onChange={(e) => handleQualitySelect(e.target.value)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {qualities.map((q, idx) => (
                    <option key={idx} value={q.value} style={{ backgroundColor: '#0f172a', color: '#fff' }}>
                      {q.label}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={handleCopyLink} className="btn-secondary" style={{ padding: '0.5rem 0.85rem' }}>
                {copied ? <Check style={{ width: '16px', height: '16px', color: '#4ade80' }} /> : <Share2 style={{ width: '16px', height: '16px' }} />}
                <span style={{ fontSize: '0.8rem' }}>{copied ? 'Copied' : 'Share'}</span>
              </button>
            </div>
          </div>

          {/* Description */}
          {video.description && (
            <div style={{
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '1rem',
              fontSize: '0.9rem',
              color: '#cbd5e1',
              lineHeight: 1.5,
            }}>
              {video.description}
            </div>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Tag style={{ width: '15px', height: '15px', color: '#8b5cf6' }} />
              {video.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    fontSize: '0.75rem',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '20px',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
