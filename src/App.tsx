import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  UploadCloud,
  Film,
  Download,
  Archive,
  Layers,
  Sparkles,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  Clock,
  Sliders,
  Maximize2,
  FileVideo,
  Monitor,
  Smartphone,
  Apple,
  Cpu
} from 'lucide-react';
import {
  extractFramesFromVideo,
  ExtractedFrame,
  ExtractionOptions
} from './utils/frameExtractor';
import { downloadSingleFrame, downloadFramesAsZip } from './utils/zipExporter';

export default function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  // Settings
  const [mode, setMode] = useState<'fps' | 'all'>('fps');
  const [fps, setFps] = useState<string>('1');
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.9);

  // Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const cancelRef = useRef<boolean>(false);

  // ZIP Download State
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file (e.g. MP4, MOV, WebM, AVI).');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setExtractedFrames([]);
    setProgressPercent(0);
    setProgressMsg('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
      setVideoDimensions({
        w: videoRef.current.videoWidth,
        h: videoRef.current.videoHeight,
      });
    }
  };

  const startExtraction = async () => {
    if (!selectedFile || !videoUrl) return;

    setIsExtracting(true);
    cancelRef.current = false;
    setProgressPercent(0);
    setExtractedFrames([]);

    const options: ExtractionOptions = {
      mode,
      fps: mode === 'fps' ? parseFloat(fps) || 1 : undefined,
      format,
      quality,
    };

    try {
      const frames = await extractFramesFromVideo(
        selectedFile,
        options,
        (processed, total, message) => {
          const pct = Math.round((processed / total) * 100);
          setProgressPercent(pct);
          setProgressMsg(message);
        },
        () => cancelRef.current
      );

      setExtractedFrames(frames);
      setProgressMsg(`Done! Extracted ${frames.length} frames successfully.`);
    } catch (err: any) {
      if (err.message === 'Extraction cancelled by user') {
        setProgressMsg('Extraction cancelled.');
      } else {
        alert(`Extraction Error: ${err.message}`);
        setProgressMsg('Failed to extract frames.');
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const cancelExtraction = () => {
    cancelRef.current = true;
  };

  const handleDownloadAllZip = async () => {
    if (extractedFrames.length === 0) return;
    setIsZipping(true);
    setZipProgress(0);

    const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'video';
    const zipName = `${baseName}_frames.zip`;

    try {
      await downloadFramesAsZip(extractedFrames, zipName, (pct) => {
        setZipProgress(pct);
      });
    } catch (err: any) {
      alert(`Failed to create ZIP: ${err.message}`);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '24px 16px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* HEADER WITH ALL 5 PLATFORM BADGES */}
      <header style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Film style={{ width: '36px', height: '36px', color: '#38bdf8' }} />
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 50%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Video Frame Extractor
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '18px' }}>
          Extract high-resolution video frames effortlessly across all platforms.
        </p>

        {/* Supported Platforms */}
        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div className="platform-badge"><Apple style={{ width: 14, height: 14 }} /> macOS</div>
          <div className="platform-badge"><Cpu style={{ width: 14, height: 14 }} /> Linux</div>
          <div className="platform-badge"><Monitor style={{ width: 14, height: 14 }} /> Windows</div>
          <div className="platform-badge"><Smartphone style={{ width: 14, height: 14 }} /> iOS</div>
          <div className="platform-badge"><Smartphone style={{ width: 14, height: 14 }} /> Android</div>
        </div>
      </header>

      {/* MAIN CONTAINER GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* LEFT COLUMN: FILE UPLOAD & VIDEO PREVIEW */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileVideo style={{ color: '#38bdf8', width: 20, height: 20 }} /> 1. Select Video
          </h2>

          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            accept="video/*"
            style={{ display: 'none' }}
          />

          {!videoUrl ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed rgba(56, 189, 248, 0.3)',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(15, 23, 42, 0.4)',
                transition: 'all 0.2s',
              }}
            >
              <UploadCloud style={{ width: '48px', height: '48px', color: '#38bdf8', marginBottom: '12px' }} />
              <p style={{ fontSize: '16px', fontWeight: '600', color: '#f8fafc', marginBottom: '6px' }}>
                Drag & Drop Video Here
              </p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                or click to browse from device (MP4, MOV, WebM, AVI)
              </p>
            </div>
          ) : (
            <div>
              <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  onLoadedMetadata={handleLoadedMetadata}
                  style={{ width: '100%', maxHeight: '280px', display: 'block' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedFile?.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {videoDuration.toFixed(1)}s • {videoDimensions.w}x{videoDimensions.h}
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  style={{ fontSize: '13px', padding: '6px 12px' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: EXTRACTION SETTINGS */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders style={{ color: '#38bdf8', width: 20, height: 20 }} /> 2. Extraction Settings
          </h2>

          {/* Mode Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
              Extraction Mode
            </label>
            <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                onClick={() => setMode('fps')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: mode === 'fps' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: mode === 'fps' ? '#38bdf8' : '#64748b',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Frames Per Second (FPS)
              </button>
              <button
                onClick={() => setMode('all')}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  background: mode === 'all' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: mode === 'all' ? '#38bdf8' : '#64748b',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                All Frames (High Frequency)
              </button>
            </div>
          </div>

          {/* FPS Input if mode === 'fps' */}
          {mode === 'fps' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                Frame Rate (Frames per Second)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="60"
                value={fps}
                onChange={(e) => setFps(e.target.value)}
                placeholder="e.g. 1 (1 frame every sec)"
                style={{ width: '100%' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Estimated Total: ~{Math.round(videoDuration * (parseFloat(fps) || 1))} frames
              </span>
            </div>
          )}

          {/* Format & Quality */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                Format
              </label>
              <select
                value={format}
                onChange={(e: any) => setFormat(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  color: '#f8fafc',
                  padding: '10px',
                  borderRadius: '10px',
                  outline: 'none',
                  fontSize: '14px',
                }}
              >
                <option value="image/jpeg">JPEG (.jpg)</option>
                <option value="image/png">PNG (.png)</option>
                <option value="image/webp">WebP (.webp)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '8px', fontWeight: '500' }}>
                Quality ({Math.round(quality * 100)}%)
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#38bdf8', marginTop: '8px' }}
              />
            </div>
          </div>

          {/* Extract Button / Progress */}
          {!isExtracting ? (
            <button
              className="btn-success"
              style={{ width: '100%', padding: '14px' }}
              onClick={startExtraction}
              disabled={!selectedFile}
            >
              <Sparkles style={{ width: 18, height: 18 }} /> Extract Frames Now
            </button>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#38bdf8', marginBottom: '8px', fontWeight: '600' }}>
                <span>Processing Video...</span>
                <span>{progressPercent}%</span>
              </div>
              
              {/* Progress bar */}
              <div style={{ width: '100%', height: '8px', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ height: '100%', width: `${progressPercent}%`, background: 'var(--primary-gradient)', transition: 'width 0.2s' }} />
              </div>

              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                {progressMsg}
              </div>

              <button
                className="btn-secondary"
                style={{ fontSize: '13px', padding: '6px 16px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                onClick={cancelExtraction}
              >
                Cancel Extraction
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EXTRACTED FRAMES GALLERY */}
      {extractedFrames.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers style={{ color: '#10b981', width: 22, height: 22 }} /> Extracted Frames ({extractedFrames.length})
              </h2>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                Click individual images to download or export all as a ZIP file.
              </p>
            </div>

            <button
              className="btn-primary"
              onClick={handleDownloadAllZip}
              disabled={isZipping}
            >
              <Archive style={{ width: 18, height: 18 }} />
              {isZipping ? `Creating ZIP (${zipProgress}%)...` : 'Export All Frames (.ZIP)'}
            </button>
          </div>

          {/* Frame Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '16px',
            maxHeight: '520px',
            overflowY: 'auto',
            paddingRight: '6px',
          }}>
            {extractedFrames.map((frame) => (
              <div
                key={frame.id}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                <img
                  src={frame.dataUrl}
                  alt={frame.filename}
                  style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                />

                <div style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                      #{frame.index}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
                      {frame.timestamp.toFixed(2)}s
                    </span>
                  </div>

                  <button
                    className="btn-secondary"
                    style={{ width: '100%', fontSize: '12px', padding: '6px', justifyContent: 'center' }}
                    onClick={() => downloadSingleFrame(frame)}
                  >
                    <Download style={{ width: 14, height: 14 }} /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
