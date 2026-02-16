import { NativeModules } from 'react-native';
import RNFS from 'react-native-fs';

const { VideoFrameExtractor: NativeExtractor } = NativeModules;

export interface ExtractionResult {
  success: boolean;
  error?: string;
  count?: number;
  outputDir: string;
}

export const FrameExtractor = {
  /**
   * Extracts frames from a video.
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

      // Calculate timestamps in milliseconds
      const timestamps: number[] = [];
      const fps = options.mode === 'all' ? 30 : (options.fps || 1);
      const interval = 1 / fps;

      for (let t = 0; t <= duration; t += interval) {
        timestamps.push(t * 1000); // Convert to milliseconds
      }

      const totalFrames = timestamps.length;
      if (onProgress) onProgress(`Preparing to extract ${totalFrames} frames...`);

      // Extract in batches
      const batchSize = 10;
      let count = 0;

      for (let i = 0; i < totalFrames; i += batchSize) {
        const batch = timestamps.slice(i, i + batchSize);

        try {
          const paths = await NativeExtractor.extractFrames(
            videoUri,
            batch,
            outputDir,
            1.0 // quality
          );

          count += paths.length;
          if (onProgress) onProgress(`Extracted ${count} / ${totalFrames} frames...`);
        } catch (err: any) {
          console.error('Batch extraction error:', err);
          // Continue with next batch
        }
      }

      return { success: true, count, outputDir };
    } catch (err: any) {
      return { success: false, error: err.message, outputDir };
    }
  },

  async cancelAll() {
    // Not implemented yet
  }
};
