import { NativeVideoFrames } from '@mgcrea/react-native-video-frames';
import RNFS from 'react-native-fs';

export interface ExtractionResult {
  success: boolean;
  error?: string;
  count?: number;
  outputDir: string;
}

export const FrameExtractor = {
  /**
   * Extracts frames from a video.
   * @param videoUri Path to the video file
   * @param outputDir Directory where frames will be saved
   * @param options Extraction options (fps or "all")
   * @param duration Video duration in seconds
   * @param onProgress Progress callback
   */
  async extractFrames(
    videoUri: string,
    outputDir: string,
    options: { fps?: number; mode: 'fps' | 'all' },
    duration: number,
    onProgress?: (progress: string) => void
  ): Promise<ExtractionResult> {
    try {
      // Ensure output directory exists
      const exists = await RNFS.exists(outputDir);
      if (!exists) {
        await RNFS.mkdir(outputDir);
      }

      // Calculate timestamps
      const timestamps: number[] = [];
      const fps = options.mode === 'all' ? 30 : (options.fps || 1);
      const interval = 1 / fps;

      for (let t = 0; t <= duration; t += interval) {
        // Timestamps should be in milliseconds for this library
        timestamps.push(t * 1000);
      }

      const totalFrames = timestamps.length;
      if (onProgress) onProgress(`Preparing to extract ${totalFrames} frames...`);

      // Extract in batches to avoid memory issues
      const batchSize = 10;
      let count = 0;

      for (let i = 0; i < totalFrames; i += batchSize) {
        const batch = timestamps.slice(i, i + batchSize);
        // Signature: extractFrames(videoPath: string, times: number[], options?: ExtractFramesOptions): Promise<string[]>;
        const results = await NativeVideoFrames.extractFrames(videoUri, batch, {
          quality: 1.0,
          precise: true
        });

        // The library saves frames to its own cache or returns paths.
        // If it doesn't support destPath, we might need to move them.
        // Let's check where it saves them. Usually it returns temporary paths.

        for (const tempPath of results) {
          const filename = `frame_${(count + 1).toString().padStart(5, '0')}.png`;
          const destPath = `${outputDir}/${filename}`;
          await RNFS.moveFile(tempPath, destPath);
          count++;
        }

        if (onProgress) onProgress(`Extracted ${count} / ${totalFrames} frames...`);
      }

      return { success: true, count, outputDir };
    } catch (err: any) {
      return { success: false, error: err.message, outputDir };
    }
  },

  async cancelAll() {
    // Not supported by current library
  }
};
