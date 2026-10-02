import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Film,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { ExportFps, ExportMode, ExportProgress, ExportResolution, SimulationConfig } from '../types';
import { VideoExportEngine } from '../utils/videoExporter';
import { EtherealAirAudio } from '../utils/audioAir';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SimulationConfig;
  audioEngine: EtherealAirAudio;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  config,
  audioEngine,
}) => {
  const [resolution, setResolution] = useState<ExportResolution>('1080p');
  const [fps, setFps] = useState<ExportFps>(60);
  const [mode, setMode] = useState<ExportMode>('deterministic');
  const [includeAudio, setIncludeAudio] = useState<boolean>(true);

  const [progress, setProgress] = useState<ExportProgress>({
    isExporting: false,
    mode: 'deterministic',
    currentFrame: 0,
    totalFrames: 600,
    percent: 0,
    statusText: '',
    videoUrl: null,
    videoBlob: null,
    fileSizeBytes: 0,
    durationSeconds: 10.0,
    error: null,
  });

  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const exportEngineRef = useRef<VideoExportEngine | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    const engine = new VideoExportEngine();
    exportEngineRef.current = engine;

    setProgress({
      isExporting: true,
      mode,
      currentFrame: 0,
      totalFrames: Math.round(10.0 * fps),
      percent: 0,
      statusText: 'Iniciando pipeline de renderização 1080p...',
      videoUrl: null,
      videoBlob: null,
      fileSizeBytes: 0,
      durationSeconds: 10.0,
      error: null,
    });

    try {
      const exportConfig: SimulationConfig = {
        ...config,
        audioEnabled: includeAudio,
      };

      const result = await engine.exportVideo(
        exportConfig,
        resolution,
        fps,
        mode,
        includeAudio ? audioEngine : null,
        (p) => setProgress(p)
      );

      setDownloadFilename(result.filename);
      setProgress((prev) => ({
        ...prev,
        isExporting: false,
        percent: 100,
        statusText: 'Vídeo gerado com sucesso em sincronismo contínuo!',
        videoUrl: result.url,
        videoBlob: result.blob,
        fileSizeBytes: result.blob.size,
      }));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha na exportação do vídeo';
      setProgress((prev) => ({
        ...prev,
        isExporting: false,
        error: errorMsg,
        statusText: errorMsg,
      }));
    }
  };

  const handleCancel = () => {
    if (exportEngineRef.current) {
      exportEngineRef.current.cancel();
    }
    setProgress((prev) => ({
      ...prev,
      isExporting: false,
      statusText: 'Exportação cancelada.',
    }));
  };

  const handleDownload = () => {
    if (!progress.videoUrl) return;
    const a = document.createElement('a');
    a.href = progress.videoUrl;
    a.download = downloadFilename || 'Elemento_Ar_Ceu_Redemoinho_1080p_10s_loop.webm';
    a.click();
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950/70 border border-sky-400/30 text-sky-400">
              <Film className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">
                Exportar Vídeo 16:9 · 10 Segundos
              </h2>
              <p className="text-xs text-slate-400">
                Resolução nativa 1080p Full HD com sincronismo de loop perfeito
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={progress.isExporting}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Options (Hidden during or after export unless reset) */}
        {!progress.isExporting && !progress.videoUrl && (
          <div className="space-y-4">
            {/* Resolution Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300">
                Resolução de Saída
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['1080p', '720p', '4k'] as ExportResolution[]).map((res) => (
                  <button
                    key={res}
                    onClick={() => setResolution(res)}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                      resolution === res
                        ? 'border-sky-400 bg-sky-950/40 text-white shadow-sm ring-1 ring-sky-400/40'
                        : 'border-white/10 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span className="block font-semibold">
                      {res === '1080p' ? '1080p (Full HD)' : res === '720p' ? '720p (HD)' : '4K (Ultra HD)'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono-tabular">
                      {res === '1080p' ? '1920 × 1080' : res === '720p' ? '1280 × 720' : '3840 × 2160'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Framerate & Method */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Taxa de Quadros (FPS)
                </label>
                <div className="flex gap-2">
                  {[60, 30].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFps(f as ExportFps)}
                      className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors ${
                        fps === f
                          ? 'border-sky-400 bg-sky-950/40 text-white'
                          : 'border-white/10 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f} FPS {f === 60 ? '(Fluido)' : '(Padrão)'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Modo de Renderização
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMode('deterministic')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                      mode === 'deterministic'
                        ? 'border-sky-400 bg-sky-950/40 text-white'
                        : 'border-white/10 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Quadro a Quadro
                  </button>
                  <button
                    onClick={() => setMode('realtime')}
                    className={`flex-1 py-1.5 px-2 rounded-lg border text-xs font-medium transition-colors ${
                      mode === 'realtime'
                        ? 'border-sky-400 bg-sky-950/40 text-white'
                        : 'border-white/10 bg-slate-950/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Tempo Real
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-white/10">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-slate-200 block">
                  Incluir Áudio Etéreo do Vento (432Hz)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Embutir a trilha sonora harmônica de ar diretamente no vídeo
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeAudio}
                onChange={(e) => setIncludeAudio(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-sky-500 focus:ring-sky-400 focus:ring-offset-slate-900 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Progress Display */}
        {progress.isExporting && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-sky-300 font-medium">
                {progress.statusText}
              </span>
              <span className="font-mono-tabular font-bold text-white text-sm">
                {progress.percent}%
              </span>
            </div>

            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-150"
                style={{ width: `${progress.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono-tabular">
              <span>Frame {progress.currentFrame} / {progress.totalFrames}</span>
              <span>Duração: 10.00s</span>
            </div>
          </div>
        )}

        {/* Success Preview & Download */}
        {progress.videoUrl && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Vídeo Renderizado com Sucesso em Loop Perfeito!</span>
            </div>

            {/* Video Preview */}
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black aspect-video relative">
              <video
                src={progress.videoUrl}
                controls
                loop
                autoPlay
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 font-mono-tabular">
              <span>Tamanho do Arquivo: {formatFileSize(progress.fileSizeBytes)}</span>
              <span>10.00s · {resolution.toUpperCase()} · {fps} FPS</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
              >
                <Download className="h-4 w-4" />
                <span>Baixar Vídeo ({formatFileSize(progress.fileSizeBytes)})</span>
              </button>

              <button
                onClick={() => {
                  setProgress((p) => ({ ...p, videoUrl: null }));
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 py-3 px-4 text-xs font-semibold text-slate-200 transition-colors"
                title="Configurar nova exportação"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Novo</span>
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {progress.error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-200 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{progress.error}</span>
          </div>
        )}

        {/* Action Buttons */}
        {!progress.videoUrl && (
          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            {progress.isExporting ? (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 rounded-lg transition-colors"
              >
                Cancelar Exportação
              </button>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={handleStartExport}
                  className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Iniciar Renderização 1080p</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
