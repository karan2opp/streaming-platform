import React, { useState } from 'react';
import { X, UploadCloud, Film, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';
import type { ImageKitAuthParams, Video } from '../types/video';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVideoUploaded: (newVideo: Video) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onVideoUploaded,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('System Design');
  const [tagsInput, setTagsInput] = useState('system-design, streaming, imagekit');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      if (!title) {
        // Auto populate title from filename
        const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a video file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please enter a video title.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadProgress(10);
    setStatusMessage('Acquiring upload signatures from backend...');

    try {
      // 1. Fetch authentication parameters from Express backend
      const authRes = await apiClient.get('/api/videos/upload-auth');
      const authData: ImageKitAuthParams = authRes.data.data;

      setUploadProgress(30);
      setStatusMessage('Uploading video directly to ImageKit CDN...');

      // 2. Direct upload to ImageKit endpoint via XMLHttpRequest for progress tracking
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('publicKey', authData.publicKey || import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY);
      formData.append('signature', authData.signature);
      formData.append('expire', authData.expire.toString());
      formData.append('token', authData.token);
      formData.append('useUniqueFileName', 'true');
      formData.append('folder', '/videos');

      const ikResponse: any = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://upload.imagekit.io/api/v1/files/upload');

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round(30 + (event.loaded / event.total) * 50);
            setUploadProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.message || 'ImageKit upload failed'));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        };

        xhr.onerror = () => reject(new Error('Network error during file upload'));
        xhr.send(formData);
      });

      setUploadProgress(85);
      setStatusMessage('Saving metadata in PostgreSQL database...');

      // 3. Extract ImageKit details & save metadata in Express backend
      const ikFileId = ikResponse.fileId;
      const fileUrl = ikResponse.url;

      // Construct dynamic HLS manifest URL and dynamic thumbnail URL from ImageKit
      const thumbnailUrl = `${fileUrl}/tr:so-2,w-600,h-340`;
      const hlsUrl = `${fileUrl}/ik-master.m3u8`;
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const postRes = await apiClient.post('/api/videos', {
        title,
        description,
        ikFileId,
        url: fileUrl,
        thumbnailUrl,
        hlsUrl,
        duration: ikResponse.duration || 0,
        category,
        tags,
      });

      setUploadProgress(100);
      setStatusMessage('Upload complete!');

      setTimeout(() => {
        onVideoUploaded(postRes.data.data);
        onClose();
        // Reset state
        setFile(null);
        setTitle('');
        setDescription('');
        setIsUploading(false);
        setUploadProgress(0);
      }, 600);

    } catch (err: any) {
      console.error('[Upload Error]', err);
      setErrorMessage(err.message || 'An error occurred during video upload.');
      setIsUploading(false);
    }
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '2rem',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8b5cf6',
            }}>
              <Film style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Upload Video to Cloud</h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Direct Cloud Transcoding via ImageKit CDN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
            }}
            disabled={isUploading}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            color: '#fca5a5',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Drag & Drop File Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: '#cbd5e1' }}>
              Video File
            </label>
            <div
              style={{
                border: '2px dashed rgba(139, 92, 246, 0.4)',
                borderRadius: '12px',
                padding: '1.75rem 1rem',
                textAlign: 'center',
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease',
              }}
              onClick={() => document.getElementById('video-file-input')?.click()}
            >
              <input
                id="video-file-input"
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={isUploading}
              />
              <UploadCloud style={{ width: '38px', height: '38px', color: '#8b5cf6', marginBottom: '0.5rem' }} />
              {file ? (
                <div>
                  <p style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>{file.name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.9rem' }}>Click or drag video file to upload</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>Supports MP4, MOV, WebM (Auto HLS Transcoding)</p>
                </div>
              )}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
              Title
            </label>
            <input
              type="text"
              placeholder="e.g. Designing a Scalable Video Streaming Platform"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Category & Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isUploading}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              >
                <option value="System Design">System Design</option>
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
                <option value="DevOps">DevOps</option>
                <option value="Gaming">Gaming</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
                Tags
              </label>
              <input
                type="text"
                placeholder="tag1, tag2, tag3"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                disabled={isUploading}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: '#cbd5e1' }}>
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Provide a detailed description of the video content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isUploading}
              style={{
                width: '100%',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.85rem',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* Progress Bar during Upload */}
          {isUploading && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Loader2 style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />
                  {statusMessage}
                </span>
                <span style={{ fontWeight: 700 }}>{uploadProgress}%</span>
              </div>
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${uploadProgress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)',
                  transition: 'width 0.3s ease',
                }} />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isUploading || !file}
              style={{ opacity: isUploading || !file ? 0.6 : 1 }}
            >
              {isUploading ? (
                <>
                  <Loader2 style={{ width: '18px', height: '18px', animation: 'spin 1s linear infinite' }} />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 style={{ width: '18px', height: '18px' }} />
                  <span>Start Direct Upload</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
