export type VideoStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';

export interface VideoOptions {
  aspectRatio?: '9:16' | '16:9' | '1:1';
  resolution?: '720p' | '1080p' | '4k';
  durationSeconds?: number; // 15-40
  personImageUri?: string; // NanoBanana Persona image
}

export interface VideoGenerationRequest {
  prompt: string;
  options: VideoOptions;
}

export interface VideoOperation {
  id: string;
  status: VideoStatus;
  videoUrl?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VertexAIResponse {
  name: string; // Operation ID
  metadata: any;
  done: boolean;
  response?: {
    video: {
      uri: string;
    };
  };
  error?: {
    code: number;
    message: string;
  };
}
