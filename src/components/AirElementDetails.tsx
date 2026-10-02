import React from 'react';
import { Wind, Feather, Eye, Compass, Waves, CheckCircle2 } from 'lucide-react';

export const AirElementDetails: React.FC = () => {
  return (
    <section className="w-full space-y-8">
      {/* Editorial Title */}
      <div className="space-y-2 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-sky-400">
          <Wind className="h-4 w-4" />
          <span>Filosofia & Simbolismo</span>
        </div>
        <h2 className="font-cinzel text-2xl sm:text-3xl font-bold tracking-tight text-white">
          O Elemento Ar: O Sopro do Movimento e da Clareza
        </h2>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed text-balance">
          Entre os quatro elementos primordiais, o Ar é a ponte entre a matéria tangível e o espírito sutil.
          Representa a mente límpida, a inspiração poética, a respiração vital e a capacidade de fluir sem amarras.
        </p>
      </div>

      {/* Grid of Key Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: O Vórtice Espiral */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-3 backdrop-blur-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-950/60 border border-sky-400/30 text-sky-300">
            <Compass className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            O Vórtice e a Dinâmica Espiral
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            O redemoinho atmosférico não é caos, mas a expressão geométrica da circulação energética. Na tradição védica e hermética, o vento em espiral canaliza a força vital, elevando pensamentos e dissolvendo densidades emocionais.
          </p>
        </div>

        {/* Card 2: A Paleta Serena & Etérea */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-3 backdrop-blur-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950/60 border border-indigo-400/30 text-indigo-300">
            <Eye className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            Paleta Serena & Atmosfera Etérea
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            A escolha deliberada de azuis translúcidos, madrepérola, prata pura e toques sutis de luz dourada ao amanhecer evoca tranquilidade profunda. Cores que induzem ondas cerebrais alfa e contemplação silenciosa.
          </p>
        </div>

        {/* Card 3: Sincronismo do Loop Matemático */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 space-y-3 backdrop-blur-md">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/60 border border-emerald-400/30 text-emerald-300">
            <Waves className="h-5 w-5" />
          </div>
          <h3 className="text-base font-semibold text-white">
            Loop Perfeito de 10 Segundos
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            A simulação mapeia a evolução temporal ao longo de um círculo trigonométrico fechado em 4 dimensões (seno e cosseno de 2π·t / 10). O frame t = 10.00s coincide matematicamente com t = 0.00s, sem nenhum corte ou emenda visível.
          </p>
        </div>
      </div>

      {/* Technical Specifications Table */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6 backdrop-blur-md">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-sky-400" />
          Especificações Técnicas de Saída do Vídeo
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono-tabular">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-slate-500 block text-[11px]">Proporção de Tela</span>
            <span className="text-white font-semibold text-sm">16:9 Widescreen</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-slate-500 block text-[11px]">Resolução Nativa</span>
            <span className="text-white font-semibold text-sm">1920 × 1080 (1080p)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-slate-500 block text-[11px]">Duração Exata</span>
            <span className="text-white font-semibold text-sm">10.00 Segundos</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
            <span className="text-slate-500 block text-[11px]">Sincronismo de Loop</span>
            <span className="text-emerald-400 font-semibold text-sm">Perfeito (Cíclico 4D)</span>
          </div>
        </div>
      </div>
    </section>
  );
};
