# ⚡ StreamHub - High-Performance Video Streaming Platform

A production-grade, full-stack video uploading and streaming platform built with a focus on **System Design**, **Adaptive Bitrate Streaming (HLS)**, **Direct Cloud Uploads**, and **PostgreSQL Database Persistence**.

---

## 🏗️ System Architecture

```
                  +-----------------------------------+
                  |          React 19 Client          |
                  +-----------------+-----------------+
                                    |
          1. Auth Req               | 5. Save Video Metadata (fileId, title, url)
          2. Signature              v
                  +-----------------+-----------------+
                  |      Express 5 Backend Server     |
                  |     (Prisma ORM + PostgreSQL)     |
                  +-----------------+-----------------+
                                    |
                                    v
                  +-----------------+-----------------+
                  |  PostgreSQL Database (Docker)     |
                  |  - Users                          |
                  |  - Videos & Metadata              |
                  +-----------------------------------+
                                    ^
                                    | 3. Direct Video Upload (HMAC Signed)
                                    | 4. HLS Stream (.m3u8) / Dynamic Thumbnails
                                    v
                  +-----------------------------------+
                  |         ImageKit.io Cloud         |
                  |  - Real-time Transcoding (HLS)    |
                  |  - Dynamic Frame Snapshots        |
                  |  - Global Media CDN Distribution  |
                  +-----------------------------------+
```

---

## ✨ Features

- **Direct-to-Cloud Uploads**: Uploads video files directly from browser to ImageKit CDN via HMAC signed authorization tokens, bypassing server memory limits.
- **Adaptive Bitrate Streaming (HLS)**: Transcodes videos on-the-fly into HLS master playlists (`ik-master.m3u8`) with automatic resolution rendition switching ($1080p, 720p, 480p, 360p$) powered by `hls.js`.
- **Dynamic Thumbnail Engine**: Generates real-time video poster frame snapshots at specified timestamps (`/tr:so-2,w-600,h-340`) via URL parameters without separate file uploads.
- **PostgreSQL Database & Prisma ORM**: Persists video metadata, categories, tags, duration, and view metrics cleanly.
- **Real-Time Progress Tracking**: Uses XMLHttpRequest progress listeners for accurate 0-100% upload feedback.
- **Modern Glassmorphic UI**: Sleek dark theme UI built with Tailwind/CSS system tokens, category filter pills, instant debounced search bar, and interactive player modal.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, TypeScript, `hls.js`, `lucide-react`, Auth0 React SDK.
- **Backend**: Node.js, Express (v5), TypeScript, ImageKit Node SDK, Auth0 JWT Bearer middleware.
- **Database & Containerization**: PostgreSQL 16 (Docker Compose), Prisma ORM 6.

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/) (for PostgreSQL)

### 2. Infrastructure Setup
Spin up PostgreSQL in Docker:
```bash
docker compose up -d
```

### 3. Environment Variables

Create `.env` in `server/`:
```env
PORT=3000
AUTH0_DOMAIN=https://your-auth0-domain.auth0.com/
AUTH0_AUDIENCE=https://your-auth0-audience.com/api/v2/
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id/
IMAGEKIT_PUBLIC_KEY=public_your_key=
IMAGEKIT_PRIVATE_KEY=private_your_key=
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5435/hungryhub?schema=public"
```

Create `.env` in `client/`:
```env
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_AUDIENCE=https://your-auth0-domain.auth0.com/api/v2/
VITE_AUTH0_CLIENT_ID=your_client_id
VITE_API_BASE_URL=http://localhost:3000
VITE_IMAGEKIT_PUBLIC_KEY=public_your_key=
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id/
```

### 4. Backend Setup & Database Migration
```bash
cd server
npm install
npx prisma db push
npm run dev
```

### 5. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 📜 License
ISC
