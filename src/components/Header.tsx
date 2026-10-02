import React from 'react';
import { Download, Sparkles } from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenExport, activeSection, setActiveSection }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text wordmark in Cinzel display face */}
        <div className="flex items-center gap-3">
          <a
            href="#viewer"
            onClick={(e) => {
              e.preventDefault();
              setActiveSection('viewer');
            }}
            className="group flex items-center gap-2.5 text-slate-100 hover:text-sky-300 transition-colors"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-950/40 text-sky-300 shadow-inner group-hover:border-sky-300/60 transition-colors">
              {/* Subtle Air glyph icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 3 22 21 2 21" />
                <line x1="5" y1="13" x2="19" y2="13" />
              </svg>
            </div>
            <span className="font-cinzel text-lg tracking-wider font-semibold">
              AETHER
            </span>
            <span className="hidden sm:inline text-xs text-sky-300/80 font-normal tracking-widest uppercase">
              · Elemento Ar 1080p
            </span>
          </a>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => setActiveSection('viewer')}
            className={`hover:text-white transition-colors relative py-1 ${
              activeSection === 'viewer' ? 'text-white' : 'text-slate-400'
            }`}
          >
            Visualizador
            {activeSection === 'viewer' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveSection('presets')}
            className={`hover:text-white transition-colors relative py-1 ${
              activeSection === 'presets' ? 'text-white' : 'text-slate-400'
            }`}
          >
            Paletas Etéreas
            {activeSection === 'presets' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveSection('element')}
            className={`hover:text-white transition-colors relative py-1 ${
              activeSection === 'element' ? 'text-white' : 'text-slate-400'
            }`}
          >
            O Elemento Ar
            {activeSection === 'element' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveSection('loop-math')}
            className={`hover:text-white transition-colors relative py-1 ${
              activeSection === 'loop-math' ? 'text-white' : 'text-slate-400'
            }`}
          >
            Sincronismo & Loop
            {activeSection === 'loop-math' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full" />
            )}
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenExport}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-400 active:scale-[0.98] transition-all whitespace-nowrap"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Gerar Vídeo 1080p (10s)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
