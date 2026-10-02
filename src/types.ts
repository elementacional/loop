export type PaletteId = 'celestial' | 'zen' | 'twilight' | 'storm' | 'prana';

export interface AirPalette {
  id: PaletteId;
  name: string;
  subtitle: string;
  description: string;
  skyZenith: [number, number, number]; // RGB 0-1
  skyHorizon: [number, number, number];
  cloudHighlight: [number, number, number];
  cloudShadow: [number, number, number];
  sunGlow: [number, number, number];
  accentGlow: [number, number, number];
  previewGradient: string;
}

export interface SimulationConfig {
  paletteId: PaletteId;
  swirlStrength: number; // 0.2 to 2.5
  cloudDensity: number; // 0.4 to 2.0
  swirlRadius: number; // 0.3 to 1.5
  windSpeedCycles: number; // 1 or 2 integer cycles per 10s loop
  lightRays: number; // 0.0 to 1.0
  wispsParticles: boolean;
  glyphOpacity: number; // 0.0 to 1.0 (Alchemical Air triangle glyph)
  ambientBloom: number; // 0.0 to 1.0
  vignette: number; // 0.0 to 1.0
  audioEnabled: boolean;
  audioVolume: number; // 0.0 to 1.0
}

export interface PresetConfig {
  id: string;
  title: string;
  description: string;
  config: Partial<SimulationConfig>;
}

export type ExportResolution = '1080p' | '720p' | '4k';
export type ExportFps = 30 | 60;
export type ExportMode = 'deterministic' | 'realtime';

export interface ExportProgress {
  isExporting: boolean;
  mode: ExportMode;
  currentFrame: number;
  totalFrames: number;
  percent: number;
  statusText: string;
  videoUrl: string | null;
  videoBlob: Blob | null;
  fileSizeBytes: number;
  durationSeconds: number;
  error: string | null;
}
