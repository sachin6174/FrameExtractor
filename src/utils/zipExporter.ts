import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ExtractedFrame } from './frameExtractor';

export const downloadSingleFrame = (frame: ExtractedFrame) => {
  saveAs(frame.blob, frame.filename);
};

export const downloadFramesAsZip = async (
  frames: ExtractedFrame[],
  zipName: string = 'extracted_frames.zip',
  onProgress?: (percent: number) => void
) => {
  const zip = new JSZip();
  const folder = zip.folder('frames') || zip;

  frames.forEach((frame) => {
    folder.file(frame.filename, frame.blob);
  });

  const content = await zip.generateAsync(
    { type: 'blob', compression: 'STORE' },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  saveAs(content, zipName);
};
