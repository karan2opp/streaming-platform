import React, { useState } from 'react';
import { Play, Eye, Clock, Loader2, AlertTriangle } from 'lucide-react';
import type { Video } from '../types/video';


interface VideoCardProps {
  video: Video;
  onClick: (video: Video) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isProcessing = video.status === 'PROCESSING' || video.status === 'PENDING';
  const isFailed = video.status === 'FAILED';

  // Format duration into MM:SS
  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return 'HLS Stream';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format relative time
  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };

  // Dynamic ImageKit thumbnail with frame timestamp transformation
  const getThumbnailUrl = () => {
    if (video.thumbnailUrl) return video.thumbnailUrl;
    return `${video.url}/tr:so-2,w-600,h-340`;
  };

  const handleCardClick = () => {
    if (isProcessing) return; // Prevent playing while transcoding
    onClick(video);
  };

  return (
    <div
      className="glass-card"
      style={{
        overflow: 'hidden',
        cursor: isProcessing ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: isProcessing ? 0.85 : 1,
      }}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Thumbnail Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 Aspect Ratio
        backgroundColor: '#0f172a',
        overflow: 'hidden',
      }}>
        <img
          src={getThumbnailUrl()}
          alt={video.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: isHovered && !isProcessing ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            filter: isProcessing ? 'blur(2px) brightness(0.6)' : 'none',
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://ik.imagekit.io/ikmedia/blog/hero-image.jpg?tr=w-600,h-340';
          }}
        />

        {/* Processing State Overlay */}
        {isProcessing ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(9, 13, 22, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#a78bfa',
          }}>
            <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.02em' }}>
              Processing Transcode...
            </span>
          </div>
        ) : isFailed ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(239, 68, 68, 0.3)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fca5a5',
            fontWeight: 700,
            fontSize: '0.85rem',
            gap: '0.4rem',
          }}>
            <AlertTriangle style={{ width: '20px', height: '20px' }} />
            <span>Transcode Failed</span>
          </div>
        ) : (
          /* Hover Play Overlay for Ready Videos */
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: isHovered ? 'rgba(9, 13, 22, 0.45)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'rgba(139, 92, 246, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: isHovered ? 'scale(1)' : 'scale(0.8)',
              opacity: isHovered ? 1 : 0,
              transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: '0 8px 24px rgba(139, 92, 246, 0.5)',
            }}>
              <Play style={{ width: '22px', height: '22px', color: '#fff', marginLeft: '3px' }} />
            </div>
          </div>
        )}

        {/* Duration Badge */}
        {!isProcessing && (
          <div style={{
            position: 'absolute',
            bottom: '0.65rem',
            right: '0.65rem',
            backgroundColor: 'rgba(9, 13, 22, 0.85)',
            backdropFilter: 'blur(6px)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}>
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Status / Category Badge */}
        <div style={{
          position: 'absolute',
          top: '0.65rem',
          left: '0.65rem',
          backgroundColor: isProcessing
            ? 'rgba(234, 179, 8, 0.9)'
            : 'rgba(139, 92, 246, 0.85)',
          backdropFilter: 'blur(6px)',
          color: '#fff',
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '0.2rem 0.55rem',
          borderRadius: '6px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          display: 'flex',
          alignItems: 'center',
          gap: '0.3rem',
        }}>
          {isProcessing ? (
            <>
              <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
              <span>Transcoding</span>
            </>
          ) : (
            video.category
          )}
        </div>
      </div>

      {/* Info Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <h4 style={{
            fontSize: '1rem',
            fontWeight: 700,
            lineHeight: 1.35,
            color: '#f8fafc',
            marginBottom: '0.4rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {video.title}
          </h4>

          {video.description && (
            <p style={{
              fontSize: '0.8rem',
              color: '#94a3b8',
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: '0.75rem',
            }}>
              {video.description}
            </p>
          )}
        </div>

        {/* Footer Metrics */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#64748b',
          paddingTop: '0.75rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          marginTop: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Eye style={{ width: '14px', height: '14px', color: '#8b5cf6' }} />
            <span style={{ fontWeight: 600, color: '#cbd5e1' }}>{video.views} views</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock style={{ width: '14px', height: '14px' }} />
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
