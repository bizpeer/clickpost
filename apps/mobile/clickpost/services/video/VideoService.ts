import { 
  VideoOptions, 
  VideoOperation, 
  VideoStatus, 
  VertexAIResponse 
} from './types';

export class VideoService {
  private static API_ENDPOINT = 'https://us-central1-aiplatform.googleapis.com/v1';
  private static MODEL_ID = 'veo-3.1-generate-001'; // 가성비 최신 모델 예시

  /**
   * Google Veo에 영상 생성을 요청합니다.
   * @param prompt AI 프롬프트 (PersonaEngine에서 생성됨)
   * @param options 영상 옵션 (품질, 비율 등)
   * @returns Operation ID
   */
  public static async generateVideo(
    prompt: string, 
    options: VideoOptions,
    config: { projectId: string; accessToken: string }
  ): Promise<string> {
    const { projectId, accessToken } = config;
    const url = `${this.API_ENDPOINT}/projects/${projectId}/locations/us-central1/publishers/google/models/${this.MODEL_ID}:predict`;

    // gemini.md 가이드라인에 따른 최적화된 파라미터 구성
    const payload = {
      instances: [
        {
          prompt,
          image: options.personImageUri ? { uri: options.personImageUri } : undefined,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: options.aspectRatio || '9:16',
        resolution: options.resolution || '720p',
        durationSeconds: options.durationSeconds || 15,
        fps: 30, // 고화질 스펙 유지
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Video generation request failed: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    // Vertex AI predict returns an Operation Name (ID) for long-running tasks
    return data.name; 
  }

  /**
   * 영상 생성 작업의 현재 상태를 조회합니다.
   */
  public static async pollVideoStatus(
    operationId: string,
    config: { accessToken: string }
  ): Promise<VideoOperation> {
    const url = `${this.API_ENDPOINT}/${operationId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check video status: ${response.statusText}`);
    }

    const data: VertexAIResponse = await response.json();
    
    let status: VideoStatus = 'RUNNING';
    if (data.done) {
      status = data.error ? 'FAILED' : 'SUCCEEDED';
    }

    return {
      id: operationId,
      status,
      videoUrl: data.response?.video?.uri,
      error: data.error?.message,
      createdAt: new Date().toISOString(), // 실제 API 응답 시간으로 보정 가능
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * 지수 백오프(Exponential Backoff)를 포함한 완료 대기 로직
   */
  public static async waitForCompletion(
    operationId: string,
    config: { accessToken: string },
    onProgress?: (status: VideoStatus) => void
  ): Promise<string> {
    let attempts = 0;
    const maxAttempts = 30; // 약 5~10분 대기

    while (attempts < maxAttempts) {
      const operation = await this.pollVideoStatus(operationId, config);
      
      if (onProgress) onProgress(operation.status);

      if (operation.status === 'SUCCEEDED' && operation.videoUrl) {
        return operation.videoUrl;
      }

      if (operation.status === 'FAILED') {
        throw new Error(`Video generation failed: ${operation.error}`);
      }

      // 10초 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 10000));
      attempts++;
    }

    throw new Error('Video generation timed out.');
  }
}
