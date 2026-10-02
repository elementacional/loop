import { AirPalette, PaletteId } from '../types';

export const AIR_PALETTES: Record<PaletteId, AirPalette> = {
  celestial: {
    id: 'celestial',
    name: 'Alvorada Celestial',
    subtitle: 'Azul celeste, madrepérola e luz translúcida',
    description: 'Tons de céu límpido ao amanhecer com reflexos perolados e brisa pura de montanha.',
    skyZenith: [0.38, 0.58, 0.88],      // Serene deep celestial cyan-blue
    skyHorizon: [0.78, 0.86, 0.95],     // Soft silvery horizon haze
    cloudHighlight: [0.98, 0.98, 1.0],  // Pearlescent brilliant white
    cloudShadow: [0.65, 0.72, 0.84],    // Soft lavender-blue atmospheric shadow
    sunGlow: [1.0, 0.95, 0.82],         // Gentle ethereal champagne gold rim light
    accentGlow: [0.72, 0.88, 1.0],      // Delicate crystalline air blue
    previewGradient: 'from-sky-300 via-indigo-200 to-amber-100',
  },
  zen: {
    id: 'zen',
    name: 'Brisa Serena & Éter Puro',
    subtitle: 'Névoa de prata, branco velado e silêncio',
    description: 'Paleta meditativa e minimalista inspirada no ar calmo e no vazio pleno do vento.',
    skyZenith: [0.55, 0.65, 0.75],      // Soft airy slate silver
    skyHorizon: [0.88, 0.92, 0.96],     // Pure white mist horizon
    cloudHighlight: [1.0, 1.0, 1.0],    // Pure luminous white
    cloudShadow: [0.75, 0.80, 0.86],    // Soft pearl gray
    sunGlow: [0.96, 0.98, 1.0],         // Pure crystalline light
    accentGlow: [0.85, 0.94, 0.98],     // Translucent air shimmer
    previewGradient: 'from-slate-300 via-sky-100 to-white',
  },
  twilight: {
    id: 'twilight',
    name: 'Éter Crepuscular',
    subtitle: 'Lilás suave, perolado e brisa rósea',
    description: 'A serenidade do vento ao cair da tarde, quando o ar vibra em frequências suaves de violeta e ouro.',
    skyZenith: [0.42, 0.44, 0.68],      // Serene dusk periwinkle
    skyHorizon: [0.85, 0.72, 0.80],     // Soft dusty rose & lavender
    cloudHighlight: [0.98, 0.93, 0.96],  // Rose-pearl cloud crests
    cloudShadow: [0.52, 0.50, 0.68],    // Muted amethyst atmospheric shadow
    sunGlow: [1.0, 0.88, 0.75],         // Warm soothing twilight peach
    accentGlow: [0.88, 0.78, 0.98],     // Ethereal violet glow
    previewGradient: 'from-indigo-400 via-purple-200 to-rose-200',
  },
  prana: {
    id: 'prana',
    name: 'Sopro de Prana',
    subtitle: 'Verde água sutil, turquesa celestial e sopro de vida',
    description: 'Representa a respiração vital e a energia sutil que permeia a atmosfera.',
    skyZenith: [0.28, 0.58, 0.68],      // Deep oceanic air cyan
    skyHorizon: [0.70, 0.90, 0.88],     // Soft jade mist
    cloudHighlight: [0.96, 1.0, 0.98],  // Mint-pearl highlights
    cloudShadow: [0.52, 0.70, 0.75],    // Cool tranquil shadow
    sunGlow: [1.0, 0.98, 0.84],         // Golden life-giving prana core
    accentGlow: [0.65, 0.96, 0.92],     // Luminous teal air streams
    previewGradient: 'from-teal-300 via-cyan-100 to-amber-100',
  },
  storm: {
    id: 'storm',
    name: 'Zéfiro Harmonioso',
    subtitle: 'Índigo plácido, safira translúcida e luz boreal',
    description: 'A imponência graciosa do ar em altitude elevada, claro e cristalino com vórtices de luz.',
    skyZenith: [0.22, 0.38, 0.62],      // Deep stratosphere sapphire
    skyHorizon: [0.65, 0.80, 0.92],     // Radiant cyan-tinted horizon
    cloudHighlight: [0.94, 0.98, 1.0],  // Ice-crystal white
    cloudShadow: [0.42, 0.52, 0.70],    // Deep atmospheric blue
    sunGlow: [0.95, 0.98, 1.0],         // Pure cool daylight
    accentGlow: [0.60, 0.85, 1.0],      // High-altitude ozone luminescence
    previewGradient: 'from-blue-600 via-sky-300 to-white',
  },
};
