import React from 'react';
import { PaletteId } from '../types';
import { AIR_PALETTES } from '../utils/palettes';
import { Wind, Sparkles, Check } from 'lucide-react';

interface PaletteSelectorProps {
  currentPaletteId: PaletteId;
  onSelectPalette: (id: PaletteId) => void;
}

export const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  currentPaletteId,
  onSelectPalette,
}) => {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Paletas Serenas & Etéreas
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          5 Harmônicas de Luz
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {(Object.keys(AIR_PALETTES) as PaletteId[]).map((id) => {
          const p = AIR_PALETTES[id];
          const isSelected = currentPaletteId === id;

          return (
            <button
              key={id}
              onClick={() => onSelectPalette(id)}
              className={`group relative flex flex-col text-left p-3 rounded-xl border transition-all ${
                isSelected
                  ? 'border-sky-400 bg-sky-950/30 shadow-lg shadow-sky-500/10 ring-1 ring-sky-400/50'
                  : 'border-white/10 bg-slate-900/50 hover:border-white/20 hover:bg-slate-900'
              }`}
            >
              {/* Visual Gradient Swatch */}
              <div
                className={`h-12 w-full rounded-lg bg-gradient-to-r ${p.previewGradient} shadow-inner mb-2.5 relative overflow-hidden flex items-center justify-center`}
              >
                {isSelected && (
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="h-6 w-6 rounded-full bg-slate-950/80 text-sky-300 flex items-center justify-center shadow">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                  {p.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {p.subtitle}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
