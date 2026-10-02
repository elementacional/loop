import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Camera,
  Download,
  FastForward,
  Info,
} from 'lucide-react';
import { SimulationConfig } from '../types';
import { AirCloudRenderer } from '../utils/webglEngine';
import { EtherealAirAudio } from '../utils/audioAir';
import { VideoExportEngine } from '../utils/videoExporter';

interface ViewportPlayerProps {
  config: SimulationConfig;
  onOpenExport: () => void;
  audioEngine: EtherealAirAudio;
}

export const ViewportPlayer: React.FC<ViewportPlayerProps> = ({
  config,
  onOpenExport,
  audioEngine,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<AirCloudRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [loopCount, setLoopCount] = useState<number>(1);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!config.audioEnabled);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [snapshotFeedback, setSnapshotFeedback] = useState<string | null>(null);

  const duration = 10.0; // Exact 10 seconds

  // Initialize WebGL Renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;

    // Set internal resolution to native 1080p 16:9 (1920x1080) for highest fidelity
    canvas.width = 1920;
    canvas.height = 1080;

    const renderer = new AirCloudRenderer(canvas);
    rendererRef.current = renderer;

    return () => {
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  // Main Animation Loop
  const renderFrame = useCallback(
    (timestamp: number) => {
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      setCurrentTime((prevTime) => {
        let nextTime = prevTime;
        if (isPlaying) {
          nextTime = prevTime + delta * playbackSpeed;
          if (nextTime >= duration) {
            setLoopCount((c) => c + 1);
            nextTime = nextTime % duration;
          }
        }

        if (rendererRef.current) {
          rendererRef.current.render(nextTime, config, duration);
        }

        if (audioEngine && !isAudioMuted) {
          audioEngine.updateTime(nextTime, duration);
        }

        return nextTime;
      });

      animFrameRef.current = requestAnimationFrame(renderFrame);
    },
    [isPlaying, playbackSpeed, config, audioEngine, isAudioMuted]
  );

  useEffect(() => {
    lastTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(renderFrame);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [renderFrame]);

  // Audio mute/unmute handling
  const toggleAudio = async () => {
    if (isAudioMuted) {
      await audioEngine.resume();
      audioEngine.setVolume(config.audioVolume);
      setIsAudioMuted(false);
    } else {
      audioEngine.suspend();
      setIsAudioMuted(true);
    }
  };

  // Scrubber change
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (rendererRef.current) {
      rendererRef.current.render(newTime, config, duration);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Snapshot frame capture (1920x1080)
  const handleTakeSnapshot = () => {
    try {
      const exporter = new VideoExportEngine();
      const { dataUrl, filename } = exporter.captureSnapshot(config, currentTime, '1080p');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      a.click();

      setSnapshotFeedback('Captura 1080p salva com sucesso!');
      setTimeout(() => setSnapshotFeedback(null), 3000);
    } catch (err) {
      console.error('Error saving snapshot:', err);
    }
  };

  const formattedSeconds = currentTime.toFixed(2).padStart(5, '0');
  const frameNumber = Math.min(Math.floor((currentTime / duration) * 600), 599);

  return (
    <div className="w-full flex flex-col items-center">
      {/* 16:9 Viewport Container */}
      <div
        ref={containerRef}
        className={`relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl shadow-sky-950/40 group ${
          isFullscreen ? 'h-screen w-screen max-w-none rounded-none' : 'aspect-video'
        }`}
      >
        {/* WebGL Canvas (1920x1080 native 16:9) */}
        <canvas
          ref={canvasRef}
          className="h-full w-full object-contain cursor-pointer select-none"
          onClick={() => setIsPlaying(!isPlaying)}
        />

        {/* Top Floating Telemetry & Status Layer */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-slate-950/60 backdrop-blur-md px-3 py-1.5 border border-white/10 text-xs font-medium text-slate-200 shadow-sm pointer-events-auto">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>16:9 Full HD</span>
              <span className="text-slate-500">·</span>
              <span className="text-sky-300 font-mono-tabular">1920×1080</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400 font-mono-tabular">60 FPS</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-950/60 backdrop-blur-md px-3 py-1.5 border border-white/10 text-xs font-medium text-sky-200 pointer-events-auto">
              <span className="text-slate-400">Loop #</span>
              <span className="font-mono-tabular font-semibold text-white">{loopCount}</span>
              <span className="text-slate-500">·</span>
              <span className="text-emerald-300 text-[11px]">Sincronismo 360° Perfeito</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {snapshotFeedback && (
              <div className="rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs px-3 py-1.5 backdrop-blur-md animate-fade-in shadow-lg">
                {snapshotFeedback}
              </div>
            )}
            <button
              onClick={handleTakeSnapshot}
              title="Salvar Foto 1080p do Frame Atual"
              className="flex items-center gap-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white px-3 py-1.5 border border-white/10 text-xs font-medium backdrop-blur-md transition-colors"
            >
              <Camera className="h-3.5 w-3.5 text-sky-400" />
              <span className="hidden sm:inline">Foto 1080p</span>
            </button>
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Sair da Tela Cheia' : 'Tela Cheia'}
              className="rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white p-2 border border-white/10 backdrop-blur-md transition-colors"
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Center Play/Pause indicator on click / pause */}
        {!isPlaying && (
          <div
            onClick={() => setIsPlaying(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] cursor-pointer"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900/80 border border-sky-400/40 text-sky-300 shadow-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-transform">
              <Play className="h-8 w-8 ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Control Overlay Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-transparent p-4 sm:p-5 pt-10 transition-opacity">
          {/* Loop Timeline Scrubber */}
          <div className="mb-3 space-y-1">
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max={duration}
                step="0.01"
                value={currentTime}
                onChange={handleScrubberChange}
                className="h-2 w-full appearance-none rounded-lg bg-slate-800 accent-sky-400 cursor-pointer focus:outline-none"
              />
              {/* Loop Seamless Point marker at 0.0s and 10.0s */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-1 rounded-full bg-sky-400 shadow-sm"
                title="Ponto de Início (t = 0.00s)"
              />
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-1 rounded-full bg-emerald-400 shadow-sm"
                title="Ponto de Fechamento do Loop (t = 10.00s)"
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono-tabular text-slate-400">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">{formattedSeconds}s</span>
                <span className="text-slate-600">/</span>
                <span>{duration.toFixed(2)}s</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 text-[11px]">Frame {frameNumber} / 600</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-300 text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>Loop Contínuo Matemático (0s ≡ 10s)</span>
              </div>
            </div>
          </div>

          {/* Controls Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Play / Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition-transform active:scale-95 shadow-md shadow-sky-500/20"
                title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </button>

              {/* Rewind */}
              <button
                onClick={() => {
                  setCurrentTime(0);
                  if (rendererRef.current) rendererRef.current.render(0, config, duration);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 transition-colors"
                title="Reiniciar Loop (0.00s)"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              {/* Audio toggle */}
              <button
                onClick={toggleAudio}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                  !isAudioMuted
                    ? 'bg-sky-950/80 border-sky-400/50 text-sky-300'
                    : 'bg-slate-900/80 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
                title={isAudioMuted ? 'Ativar Áudio Etéreo do Vento (432Hz)' : 'Silenciar Áudio'}
              >
                {!isAudioMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Playback speed selector */}
              <div className="flex items-center rounded-lg bg-slate-900/80 border border-white/10 p-0.5 text-xs font-medium">
                {[0.5, 1.0, 2.0].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      playbackSpeed === speed
                        ? 'bg-sky-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Export CTA */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenExport}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Exportar Vídeo 1080p</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
