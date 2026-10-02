import React from 'react';
import { SimulationConfig } from '../types';
import { Sliders, Sun, RotateCw, Cloud, Volume2, Compass, Sparkles } from 'lucide-react';

interface ParameterControlsProps {
  config: SimulationConfig;
  onChange: (updated: Partial<SimulationConfig>) => void;
  onReset: () => void;
}

export const ParameterControls: React.FC<ParameterControlsProps> = ({
  config,
  onChange,
  onReset,
}) => {
  return (
    <div className="w-full rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-md space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-sky-400" />
          <h3 className="text-sm font-semibold text-slate-100">
            Parâmetros do Vórtice & Atmosfera
          </h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
        >
          Redefinir Padrões
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Intensidade do Redemoinho */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <RotateCw className="h-3.5 w-3.5 text-sky-400" />
              Intensidade do Redemoinho
            </span>
            <span className="font-mono-tabular text-sky-300">{config.swirlStrength.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min="0.3"
            max="2.4"
            step="0.05"
            value={config.swirlStrength}
            onChange={(e) => onChange({ swirlStrength: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-sky-400 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Controla a curvatura espiral e a torção aerodinâmica das nuvens.
          </p>
        </div>

        {/* Densidade das Nuvens */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5 text-sky-400" />
              Densidade das Nuvens
            </span>
            <span className="font-mono-tabular text-sky-300">{config.cloudDensity.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.8"
            step="0.05"
            value={config.cloudDensity}
            onChange={(e) => onChange({ cloudDensity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-sky-400 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Transição entre névoa etérea translúcida e cúmulos volumosos.
          </p>
        </div>

        {/* Raios de Luz Etéreos */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sun className="h-3.5 w-3.5 text-amber-300" />
              Raios Solares Crepusculares
            </span>
            <span className="font-mono-tabular text-sky-300">{Math.round(config.lightRays * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={config.lightRays}
            onChange={(e) => onChange({ lightRays: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-sky-400 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Feixes de luz divina filtrados através das aberturas do redemoinho.
          </p>
        </div>

        {/* Ciclos de Rotação (Sincronismo de Loop Perfeito) */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-sky-400" />
              Ciclos de Rotação por Loop
            </span>
            <span className="font-mono-tabular text-sky-300">{config.windSpeedCycles} revolução(ões)</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            {[1, 2].map((cycles) => (
              <button
                key={cycles}
                onClick={() => onChange({ windSpeedCycles: cycles })}
                className={`flex-1 py-1.5 px-3 rounded-lg border text-xs font-medium transition-colors ${
                  config.windSpeedCycles === cycles
                    ? 'border-sky-400 bg-sky-950/50 text-white shadow-sm'
                    : 'border-white/10 bg-slate-800/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cycles === 1 ? '1x (Brisa Serena)' : '2x (Vórtice Vigoroso)'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Revoluções inteiras garantem sincronismo 100% contínuo aos 10s.
          </p>
        </div>

        {/* Símbolo Sagrado do Ar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-sky-300" />
              Glifo Alquímico do Ar
            </span>
            <span className="font-mono-tabular text-sky-300">{Math.round(config.glyphOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={config.glyphOpacity}
            onChange={(e) => onChange({ glyphOpacity: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-sky-400 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Triângulo com barra horizontal iluminando o centro do redemoinho.
          </p>
        </div>

        {/* Áudio Harmônico 432Hz */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Volume2 className="h-3.5 w-3.5 text-sky-400" />
              Volume do Sopro Sonoro (432Hz)
            </span>
            <span className="font-mono-tabular text-sky-300">{Math.round(config.audioVolume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={config.audioVolume}
            onChange={(e) => onChange({ audioVolume: parseFloat(e.target.value) })}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none accent-sky-400 cursor-pointer"
          />
          <p className="text-[11px] text-slate-500">
            Frequência serena de vento e ressonância etérea em harmonia de loop.
          </p>
        </div>
      </div>
    </div>
  );
};
