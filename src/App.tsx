import React, { useState, useMemo } from 'react';
import { PaletteId, SimulationConfig } from './types';
import { Header } from './components/Header';
import { ViewportPlayer } from './components/ViewportPlayer';
import { PaletteSelector } from './components/PaletteSelector';
import { ParameterControls } from './components/ParameterControls';
import { AirElementDetails } from './components/AirElementDetails';
import { LoopMathExplainer } from './components/LoopMathExplainer';
import { ExportModal } from './components/ExportModal';
import { EtherealAirAudio } from './utils/audioAir';
import { Download, Sparkles, Wind, ShieldCheck, Compass } from 'lucide-react';

const DEFAULT_CONFIG: SimulationConfig = {
  paletteId: 'celestial',
  swirlStrength: 1.25,
  cloudDensity: 1.05,
  swirlRadius: 0.95,
  windSpeedCycles: 1, // 1 complete revolution every 10s
  lightRays: 0.65,
  wispsParticles: true,
  glyphOpacity: 0.35, // Subtle Air element sacred glyph
  ambientBloom: 0.45,
  vignette: 0.55,
  audioEnabled: false, // Default off until user activates audio
  audioVolume: 0.65,
};

export default function App() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('viewer');

  // Single shared instance of the ethereal air audio engine
  const audioEngine = useMemo(() => new EtherealAirAudio(), []);

  const handleUpdateConfig = (updated: Partial<SimulationConfig>) => {
    setConfig((prev) => ({ ...prev, ...updated }));
  };

  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const handleSelectPalette = (id: PaletteId) => {
    handleUpdateConfig({ paletteId: id });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      {/* Top Bar */}
      <Header
        onOpenExport={() => setIsExportModalOpen(true)}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Hero Lead Title */}
        <section id="viewer" className="text-center space-y-3 max-w-3xl mx-auto pt-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-950/40 px-3.5 py-1 text-xs font-medium text-sky-300 backdrop-blur-md">
            <Wind className="h-3.5 w-3.5" />
            <span>Vídeo 16:9 · 1080p Full HD · Loop Perfeito de 10s</span>
          </div>

          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
            Céu em Redemoinho · Elemento Ar
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed text-balance">
            Visualizador e gerador de vídeo cinematográfico em 1080p com nuvens etéreas em redemoinho.
            Sincronismo matemático contínuo de 10 segundos (<span className="text-sky-300 font-mono-tabular">0.00s ≡ 10.00s</span>) ilustrando a essência, leveza e fluidez do elemento Ar.
          </p>
        </section>

        {/* 16:9 Cinema Viewport Player */}
        <section className="flex flex-col items-center">
          <ViewportPlayer
            config={config}
            onOpenExport={() => setIsExportModalOpen(true)}
            audioEngine={audioEngine}
          />
        </section>

        {/* Palettes Section */}
        <section id="presets" className="space-y-4">
          <PaletteSelector
            currentPaletteId={config.paletteId}
            onSelectPalette={handleSelectPalette}
          />
        </section>

        {/* Parameter Customization Controls */}
        <section className="space-y-4">
          <ParameterControls
            config={config}
            onChange={handleUpdateConfig}
            onReset={handleResetConfig}
          />
        </section>

        {/* Loop Synchrony Mathematical Assurance */}
        <section id="loop-math" className="pt-4">
          <LoopMathExplainer />
        </section>

        {/* The Air Element Philosophical & Symbolism Context */}
        <section id="element" className="pt-4">
          <AirElementDetails />
        </section>

        {/* Bottom Banner Call-To-Action */}
        <section className="rounded-2xl border border-sky-400/20 bg-gradient-to-r from-sky-950/50 via-slate-900/60 to-indigo-950/50 p-8 text-center space-y-4 shadow-xl">
          <h3 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            Pronto para Baixar o Vídeo em Alta Resolução?
          </h3>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed text-balance">
            Exporte o arquivo em 1080p (1920×1080) com exatamente 10.00 segundos e 60 frames por segundo, pronto para usar em projeções, meditações, websites ou introduções audiovisuais.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 px-6 py-3 text-sm font-bold text-white shadow-xl shadow-sky-500/25 active:scale-95 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Exportar Vídeo 1080p (10 Segundos)</span>
            </button>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400">
            <span className="font-cinzel font-semibold text-slate-300">AETHER</span>
            <span>·</span>
            <span>Elemento Ar · Vídeo 16:9 1080p</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Sincronismo Cíclico 4D · 10.00s Loop Contínuo · WebGL2 Shader Pipeline
          </div>
        </div>
      </footer>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        config={config}
        audioEngine={audioEngine}
      />
    </div>
  );
}
