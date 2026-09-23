import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { VideoCard } from './components/VideoCard';
import { UploadModal } from './components/UploadModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { apiClient } from './api/apiClient';
import type { Video } from './types/video';
import { Sparkles, Film, Upload, Layers, Server, RefreshCw } from 'lucide-react';
import './App.css';

const CATEGORIES = ['All', 'System Design', 'Backend', 'Frontend', 'DevOps', 'Gaming', 'General'];

export function App() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  // Fetch videos from backend with search and category parameters
  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await apiClient.get('/api/videos', { params });
      setVideos(res.data.data.videos || []);
    } catch (err) {
      console.error('[Fetch Videos Error]', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVideos();
    }, 300); // 300ms debounce for search query
    return () => clearTimeout(timer);
  }, [fetchVideos]);

  const handleVideoUploaded = (newVideo: Video) => {
    setVideos((prev) => [newVideo, ...prev]);
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Navbar Header */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenUploadModal={() => setIsUploadModalOpen(true)}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* System Design Hero Banner */}
        <section className="glass-card" style={{
          padding: '2.25rem 2.5rem',
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.25)',
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#8b5cf6', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <Sparkles style={{ width: '16px', height: '16px' }} />
            <span>System Design Architecture Demo</span>
          </div>

          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: 800,
            marginBottom: '0.75rem',
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            maxWidth: '750px',
          }}>
            High-Performance Video Streaming Platform
          </h1>

          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '780px', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Powered by <strong>Direct-to-Cloud ImageKit CDN Uploads</strong>, <strong>HLS Adaptive Bitrate Streaming</strong>, and <strong>PostgreSQL Metadata Persistence</strong>. Designed for high throughput and zero server memory overhead.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
              <Upload style={{ width: '16px', height: '16px', color: '#38bdf8' }} />
              <span>Direct Cloud Upload (HMAC Signed)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
              <Film style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
              <span>HLS Adaptive Transcoding (.m3u8)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
              <Server style={{ width: '16px', height: '16px', color: '#4ade80' }} />
              <span>Docker PostgreSQL Metadata DB</span>
            </div>
          </div>
        </section>

        {/* Category Pills Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  fontWeight: selectedCategory === cat ? 700 : 500,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#8b5cf6' : 'rgba(255, 255, 255, 0.08)',
                  backgroundColor: selectedCategory === cat ? 'rgba(139, 92, 246, 0.2)' : 'rgba(18, 24, 38, 0.6)',
                  color: selectedCategory === cat ? '#a78bfa' : '#94a3b8',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={fetchVideos}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <RefreshCw style={{ width: '14px', height: '14px', animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Video Feed Grid */}
        {isLoading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.75rem',
          }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card" style={{ height: '320px', opacity: 0.5, backgroundColor: 'rgba(18, 24, 38, 0.4)' }} />
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '1.75rem',
          }}>
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={(v) => setActiveVideo(v)}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="glass-card" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              backgroundColor: 'rgba(139, 92, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6',
              marginBottom: '1rem',
            }}>
              <Layers style={{ width: '32px', height: '32px' }} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>No videos found</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '420px', marginBottom: '1.5rem' }}>
              {searchQuery
                ? `No results matching "${searchQuery}". Try a different search term or category.`
                : 'Be the first to upload a video to the platform!'}
            </p>

            <button onClick={() => setIsUploadModalOpen(true)} className="btn-primary">
              <Upload style={{ width: '18px', height: '18px' }} />
              <span>Upload Video Now</span>
            </button>
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onVideoUploaded={handleVideoUploaded}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
}

export default App;
