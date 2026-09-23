export interface Video {
  id: string;
  title: string;
  description?: string;
  ikFileId: string;
  url: string;
  thumbnailUrl: string;
  hlsUrl?: string;
  duration: number;
  views: number;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
  category: string;
  tags: string[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface VideoListResponse {
  videos: Video[];
  pagination: Pagination;
}

export interface ImageKitAuthParams {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}
