import { ExportFps, ExportMode, ExportProgress, ExportResolution, SimulationConfig } from '../types';
import { EtherealAirAudio } from './audioAir';
import { AirCloudRenderer } from './webglEngine';

const RESOLUTION_MAP: Record<ExportResolution, { width: number; height: number }> = {
  '720p': { width: 1280, height: 720 },
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
};

export class VideoExportEngine {
  private isCancelled = false;

  public cancel() {
    this.isCancelled = true;
  }

  public async exportVideo(
    config: SimulationConfig,
    resolution: ExportResolution = '1080p',
    fps: ExportFps = 60,
    mode: ExportMode = 'deterministic',
    audioEngine: EtherealAirAudio | null = null,
    onProgress?: (progress: ExportProgress) => void
  ): Promise<{ blob: Blob; url: string; filename: string }> {
    this.isCancelled = false;
    const { width, height } = RESOLUTION_MAP[resolution];
    const duration = 10.0; // Exact 10 seconds as requested
    const totalFrames = Math.round(duration * fps);

    // Create offscreen canvas for pristine 1080p rendering
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;

    const renderer = new AirCloudRenderer(offscreenCanvas);

    // Determine supported mime type
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];

    let selectedMimeType = '';
    for (const mime of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mime)) {
        selectedMimeType = mime;
        break;
      }
    }

    if (!selectedMimeType) {
      selectedMimeType = 'video/webm';
    }

    const stream = offscreenCanvas.captureStream(fps);

    // Add audio track if audio is enabled
    if (config.audioEnabled && audioEngine) {
      const audioTrack = audioEngine.getAudioStream();
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }
    }

    const recorderOptions: MediaRecorderOptions = {
      mimeType: selectedMimeType,
      videoBitsPerSecond: resolution === '4k' ? 35000000 : 18000000, // 18 Mbps for 1080p
    };

    const mediaRecorder = new MediaRecorder(stream, recorderOptions);
    const recordedChunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };

    const recordPromise = new Promise<{ blob: Blob; url: string; filename: string }>((resolve, reject) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: selectedMimeType });
        const url = URL.createObjectURL(blob);
        const ext = selectedMimeType.includes('mp4') ? 'mp4' : 'webm';
        const filename = `Elemento_Ar_Ceu_Redemoinho_${resolution}_10s_loop.${ext}`;
        renderer.destroy();
        resolve({ blob, url, filename });
      };

      mediaRecorder.onerror = (err) => {
        renderer.destroy();
        reject(err);
      };
    });

    mediaRecorder.start();

    if (mode === 'deterministic') {
      // Deterministic frame-by-frame exact rendering
      const frameDuration = duration / totalFrames;

      for (let frame = 0; frame < totalFrames; frame++) {
        if (this.isCancelled) {
          mediaRecorder.stop();
          renderer.destroy();
          throw new Error('Exportação cancelada pelo usuário');
        }

        const t = frame * frameDuration;
        renderer.render(t, config, duration);

        if (audioEngine) {
          audioEngine.updateTime(t, duration);
        }

        const percent = Math.round(((frame + 1) / totalFrames) * 100);
        if (onProgress) {
          onProgress({
            isExporting: true,
            mode,
            currentFrame: frame + 1,
            totalFrames,
            percent,
            statusText: `Renderizando frame ${frame + 1} de ${totalFrames} (1080p 16:9)...`,
            videoUrl: null,
            videoBlob: null,
            fileSizeBytes: 0,
            durationSeconds: duration,
            error: null,
          });
        }

        // Allow browser to flush buffer and capture stream
        await new Promise((r) => setTimeout(r, 1000 / fps));
      }
    } else {
      // Real-time recording mode: runs for exact 10 seconds
      const startTime = performance.now();
      const endTime = startTime + duration * 1000;

      while (performance.now() < endTime) {
        if (this.isCancelled) {
          mediaRecorder.stop();
          renderer.destroy();
          throw new Error('Exportação cancelada');
        }

        const now = performance.now();
        const elapsed = (now - startTime) / 1000;
        const t = Math.min(elapsed, duration);
        renderer.render(t, config, duration);

        if (audioEngine) {
          audioEngine.updateTime(t, duration);
        }

        const percent = Math.min(100, Math.round((elapsed / duration) * 100));
        if (onProgress) {
          onProgress({
            isExporting: true,
            mode,
            currentFrame: Math.round(elapsed * fps),
            totalFrames,
            percent,
            statusText: `Gravando loop em tempo real: ${t.toFixed(1)}s / 10.0s...`,
            videoUrl: null,
            videoBlob: null,
            fileSizeBytes: 0,
            durationSeconds: duration,
            error: null,
          });
        }

        await new Promise((r) => requestAnimationFrame(r));
      }
    }

    mediaRecorder.stop();
    return recordPromise;
  }

  public captureSnapshot(
    config: SimulationConfig,
    timeSeconds: number,
    resolution: ExportResolution = '1080p'
  ): { dataUrl: string; filename: string } {
    const { width, height } = RESOLUTION_MAP[resolution];
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const renderer = new AirCloudRenderer(canvas);
    renderer.render(timeSeconds, config, 10.0);

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    renderer.destroy();

    const filename = `Elemento_Ar_Ceu_Redemoinho_${resolution}_frame_${timeSeconds.toFixed(2)}s.png`;
    return { dataUrl, filename };
  }
}
