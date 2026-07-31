export interface ExtractedFrame {
  id: string;
  index: number;
  timestamp: number;
  dataUrl: string;
  blob: Blob;
  filename: string;
}

export interface ExtractionOptions {
  mode: 'fps' | 'all' | 'custom';
  fps?: number;
  startSec?: number;
  endSec?: number;
  format?: 'image/jpeg' | 'image/png' | 'image/webp';
  quality?: number; // 0.1 to 1.0
}

export const extractFramesFromVideo = (
  videoFile: File,
  options: ExtractionOptions,
  onProgress?: (processed: number, total: number, message: string) => void,
  shouldCancel?: () => boolean
): Promise<ExtractedFrame[]> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      reject(new Error('Canvas 2D context not available'));
      return;
    }

    const objectUrl = URL.createObjectURL(videoFile);
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    const frames: ExtractedFrame[] = [];

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        const width = video.videoWidth;
        const height = video.videoHeight;

        canvas.width = width;
        canvas.height = height;

        const startSec = Math.max(0, options.startSec || 0);
        const endSec = Math.min(duration, options.endSec || duration);
        const rangeDuration = Math.max(0.1, endSec - startSec);

        let fps = 1;
        if (options.mode === 'all') {
          fps = 30; // standard 30fps baseline for all frames sampling
        } else if (options.mode === 'fps') {
          fps = options.fps || 1;
        }

        const interval = 1 / fps;
        const timestamps: number[] = [];

        for (let time = startSec; time < endSec; time += interval) {
          timestamps.push(time);
        }

        const totalFrames = timestamps.length;
        if (onProgress) onProgress(0, totalFrames, `Starting extraction of ${totalFrames} frames...`);

        const format = options.format || 'image/jpeg';
        const quality = options.quality || 0.9;
        const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';

        for (let i = 0; i < totalFrames; i++) {
          if (shouldCancel && shouldCancel()) {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Extraction cancelled by user'));
            return;
          }

          const currentTime = timestamps[i];
          
          // Seek video to exact time
          await new Promise<void>((resSeek) => {
            const onSeeked = () => {
              video.removeEventListener('seeked', onSeeked);
              resSeek();
            };
            video.addEventListener('seeked', onSeeked);
            video.currentTime = currentTime;
          });

          // Draw current frame on canvas
          ctx.drawImage(video, 0, 0, width, height);

          // Get image blob and dataUrl
          const dataUrl = canvas.toDataURL(format, quality);
          const blob = await new Promise<Blob>((resBlob) => {
            canvas.toBlob((b) => resBlob(b!), format, quality);
          });

          const timeStr = currentTime.toFixed(2).replace('.', '_');
          const filename = `frame_${String(i + 1).padStart(4, '0')}_${timeStr}s.${ext}`;

          frames.push({
            id: `frame_${i}_${Date.now()}`,
            index: i + 1,
            timestamp: currentTime,
            dataUrl,
            blob,
            filename,
          });

          if (onProgress) {
            onProgress(i + 1, totalFrames, `Processing frame ${i + 1} / ${totalFrames} (${Math.round(((i + 1) / totalFrames) * 100)}%)`);
          }
        }

        URL.revokeObjectURL(objectUrl);
        resolve(frames);
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = (e) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load video file. Make sure format is supported by browser/device.'));
    };
  });
};
