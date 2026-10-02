import React from 'react';
import { Waves, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export const LoopMathExplainer: React.FC = () => {
  return (
    <section className="w-full rounded-2xl border border-white/10 bg-slate-900/50 p-6 sm:p-8 backdrop-blur-md space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-400">
            <Waves className="h-4 w-4" />
            <span>Engenharia de Sincronismo</span>
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-white">
            Loop Perfeito de 10 Segundos: Garantia Matemática
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-2 text-emerald-300 text-xs font-semibold shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>Diferença no Frame 0s ↔ 10s: 0.0000%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div className="space-y-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
            1. Amostragem em Variedade Fechada 4D
          </h3>
          <p className="text-slate-400">
            Vídeos comuns falham no loop porque utilizam tempo linear $t \in [0, 10]$, resultando em descontinuidades bruscas no corte final. Neste gerador, o tempo é mapeado em coordenadas polares fechadas:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 font-mono-tabular text-sky-300 text-xs space-y-1">
            <div>θ(t) = 2π · (t / 10.0)</div>
            <div>u = R · cos(θ) &nbsp;|&nbsp; v = R · sin(θ)</div>
            <div className="text-emerald-400 font-medium pt-1">
              t=0s: θ = 0 &nbsp;→&nbsp; (u, v) = (R, 0)<br />
              t=10s: θ = 2π &nbsp;→&nbsp; (u, v) = (R, 0) [IDÊNTICO]
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-white text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-sky-400" />
            2. Vórtice Angular Harmônico Inteiro
          </h3>
          <p className="text-slate-400">
            A rotação das nuvens no redemoinho é modulada com velocidade angular estritamente quantizada em números inteiros de revoluções (k = 1 ou 2) a cada 10 segundos:
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 font-mono-tabular text-sky-300 text-xs space-y-1">
            <div>Rotação(t) = k · 2π · (t / 10.0)</div>
            <div className="text-slate-400">Ao atingir 10.0s, o campo completou exatamente 360° ou 720°.</div>
            <div className="text-emerald-400 font-medium pt-1">
              Nenhuma distorção, sem fading artificial e sem cortes perceptíveis.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
