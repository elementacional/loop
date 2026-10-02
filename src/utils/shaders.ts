export const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

// Uniforms
uniform vec2 u_resolution;
uniform float u_time; // 0.0 to 10.0
uniform float u_duration; // 10.0
uniform float u_swirlStrength;
uniform float u_cloudDensity;
uniform float u_swirlRadius;
uniform float u_windCycles;
uniform float u_lightRays;
uniform float u_glyphOpacity;
uniform float u_bloom;
uniform float u_vignette;

// Palette Uniforms
uniform vec3 u_skyZenith;
uniform vec3 u_skyHorizon;
uniform vec3 u_cloudHighlight;
uniform vec3 u_cloudShadow;
uniform vec3 u_sunGlow;
uniform vec3 u_accentGlow;

#define PI 3.14159265358979323846
#define TWO_PI 6.283185307179586

// Hash functions for procedural noise
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

vec3 hash3(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 74.7)),
    dot(p, vec3(269.5, 183.3, 246.1)),
    dot(p, vec3(113.5, 271.9, 124.6))
  );
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

// 3D Simplex-like Perlin gradient noise
float noise3d(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(
      mix(dot(hash3(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
          dot(hash3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
      mix(dot(hash3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
          dot(hash3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x), u.y),
    mix(
      mix(dot(hash3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
          dot(hash3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
      mix(dot(hash3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
          dot(hash3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x), u.y), u.z);
}

// Periodic 4D noise sampling along a closed circular time loop
// theta goes from 0 to 2*PI as time goes from 0 to u_duration
float periodicNoise(vec2 p, float theta, float radius, float freq) {
  vec3 posA = vec3(p * freq, cos(theta) * radius);
  vec3 posB = vec3(p * freq + vec2(17.3, 43.1), sin(theta) * radius);
  float nA = noise3d(posA);
  float nB = noise3d(posB);
  return mix(nA, nB, 0.5 + 0.5 * sin(theta));
}

// Multi-octave Fractional Brownian Motion (fBm) with seamless time loop
float seamlessFbm(vec2 p, float theta, float swirlFactor) {
  float total = 0.0;
  float amplitude = 0.5;
  float freq = 1.0;
  float maxVal = 0.0;

  // 5 octaves of periodic turbulence
  for (int i = 0; i < 5; i++) {
    // Phase offset per octave to give multi-speed depth
    float octaveTheta = theta * float(i + 1);
    float n = periodicNoise(p, octaveTheta, 1.2 + float(i) * 0.4, freq);
    
    // Billowy cumulus shaping
    n = abs(n);
    n = 1.0 - n;
    n = n * n;
    
    total += n * amplitude;
    maxVal += amplitude;

    // Domain warp for airy fluid curls
    vec2 warp = vec2(
      periodicNoise(p + vec2(5.2, 1.3), octaveTheta, 0.8, freq * 0.8),
      periodicNoise(p + vec2(2.1, 7.8), octaveTheta + PI * 0.5, 0.8, freq * 0.8)
    );
    p = p * 2.02 + warp * (0.35 + 0.2 * swirlFactor);
    amplitude *= 0.5;
    freq *= 1.85;
  }

  return total / maxVal;
}

// Distance to 2D line segment (for glyph)
float distToSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Sacred Alchemical Air Glyph: Upright Triangle with a horizontal crossbar
// Symbol of warm & moist, elevation, breath and spirit
float alchemicalAirGlyph(vec2 p, float scale) {
  p /= scale;
  vec2 v0 = vec2(0.0, 0.65);       // Top apex
  vec2 v1 = vec2(-0.55, -0.45);    // Bottom left
  vec2 v2 = vec2(0.55, -0.45);     // Bottom right
  
  // Triangle sides
  float d = distToSegment(p, v0, v1);
  d = min(d, distToSegment(p, v1, v2));
  d = min(d, distToSegment(p, v2, v0));
  
  // Horizontal crossbar (the hallmark of the Air element glyph)
  vec2 b0 = vec2(-0.48, 0.12);
  vec2 b1 = vec2(0.48, 0.12);
  d = min(d, distToSegment(p, b0, b1));

  // Sacred circle around glyph
  float circleDist = abs(length(p) - 0.78);
  d = min(d, circleDist);

  return d * scale;
}

void main() {
  // Correct aspect ratio: 16:9
  vec2 uv = v_uv;
  vec2 centered = (uv - 0.5);
  centered.x *= u_resolution.x / u_resolution.y;

  // Normalized time in loop: 0.0 to 1.0
  float normT = fract(u_time / u_duration);
  // Loop angle guaranteed to match at t=0 and t=u_duration (0 == TWO_PI)
  float theta = normT * TWO_PI;

  // Vortex center: placed slightly above vertical center for majestic sky perspective
  vec2 vortexCenter = vec2(0.0, 0.08);
  vec2 toCenter = centered - vortexCenter;
  float dist = length(toCenter);
  float baseAngle = atan(toCenter.y, toCenter.x);

  // Integer revolutions per loop for seamless rotation
  float rotationAngle = theta * u_windCycles;

  // Swirl twist profile: strongest near vortex eye, tapering out softly
  float swirlFalloff = exp(-pow(dist / (u_swirlRadius * 1.1), 1.8));
  float totalAngle = baseAngle + (u_swirlStrength * 3.8 * swirlFalloff) + rotationAngle;

  // Logarithmic spiral mapping
  vec2 swirledCoord = vec2(
    dist * cos(totalAngle),
    dist * sin(totalAngle)
  );

  // Background Sky Gradient (Atmospheric Rayleigh Gradient)
  // Zenith to Horizon blend with soft radial lightness towards vortex eye
  float skyY = clamp(uv.y * 1.1 - 0.1, 0.0, 1.0);
  vec3 sky = mix(u_skyHorizon, u_skyZenith, smoothstep(0.1, 0.9, skyY));

  // Celestial eye illumination (radiant ethereal core)
  float coreGlow = exp(-dist * 2.8);
  sky += u_sunGlow * coreGlow * (0.45 + 0.15 * cos(theta));

  // Volumetric Cloud Field Computation
  // Layer 1: Macro cloud banks swirling in
  vec2 p1 = swirledCoord * 1.8;
  float density1 = seamlessFbm(p1, theta, u_swirlStrength);

  // Layer 2: Faster high-altitude wisps (counter-swirl micro-eddies)
  float counterAngle = baseAngle - (u_swirlStrength * 1.8 * swirlFalloff) + (theta * (u_windCycles + 1.0));
  vec2 p2 = vec2(dist * cos(counterAngle), dist * sin(counterAngle)) * 3.2;
  float density2 = seamlessFbm(p2 + vec2(1.5, -2.3), theta * 2.0, u_swirlStrength * 0.7);

  // Combine layers with user cloud density control
  float rawDensity = mix(density1, density2, 0.35);
  // Carve out a serene celestial eye in the center of the vortex
  float eyeHole = smoothstep(0.03, 0.32, dist);
  float cloudVal = smoothstep(0.38 / u_cloudDensity, 0.78, rawDensity) * eyeHole;

  // Normal / lighting approximation via subtle directional derivative
  vec2 lightDir = normalize(vec2(-0.4, 0.6));
  float lightSample = seamlessFbm(p1 + lightDir * 0.04, theta, u_swirlStrength);
  float diffuse = clamp((lightSample - rawDensity) * 6.5 + 0.5, 0.0, 1.0);

  // Volumetric cloud coloring (Ethereal Air palette)
  vec3 cloudColor = mix(u_cloudShadow, u_cloudHighlight, diffuse);
  // Add ethereal rim light & pearl iridescent fringe
  float rim = pow(1.0 - smoothstep(0.0, 0.7, cloudVal), 2.0) * diffuse;
  cloudColor += u_accentGlow * rim * 0.6;
  cloudColor += u_sunGlow * coreGlow * cloudVal * 0.4;

  // Composite Clouds over Sky with smooth atmospheric alpha blending
  vec3 comp = mix(sky, cloudColor, clamp(cloudVal * 1.15, 0.0, 1.0));

  // Ethereal Crepuscular Light Rays (God Rays radiating from Vortex center)
  if (u_lightRays > 0.01) {
    float rayAngle = baseAngle * 12.0 + theta * u_windCycles;
    float rayNoise = 0.5 + 0.5 * sin(rayAngle + sin(dist * 6.0));
    float rayMask = smoothstep(0.1, 0.8, dist) * exp(-dist * 1.6);
    float rayIntensity = rayNoise * rayMask * u_lightRays * 0.38;
    comp += u_sunGlow * rayIntensity;
  }

  // Air Streamlines & Luminous Breeze Wisps
  float streamAngle = baseAngle * 18.0 - (theta * u_windCycles * 2.0) + (dist * 14.0 * u_swirlStrength);
  float streamWave = pow(max(0.0, sin(streamAngle)), 12.0);
  float streamFade = smoothstep(0.15, 0.6, dist) * smoothstep(1.3, 0.5, dist);
  comp += u_accentGlow * streamWave * streamFade * 0.22;

  // Sacred Alchemical Air Glyph (Optional overlay for Air Element symbolism)
  if (u_glyphOpacity > 0.01) {
    float glyphDist = alchemicalAirGlyph(centered - vortexCenter, 0.34);
    // Delicate luminous line with soft ethereal glow
    float line = smoothstep(0.006, 0.001, glyphDist);
    float glow = exp(-glyphDist * 45.0) * 0.8;
    float glyphSignal = line + glow;
    
    // Breathe synchronously with the 10-second loop
    float glyphPulse = 0.75 + 0.25 * sin(theta);
    vec3 glyphColor = mix(u_accentGlow, u_sunGlow, 0.4);
    comp += glyphColor * glyphSignal * u_glyphOpacity * glyphPulse;
  }

  // Ethereal Vignette and Atmospheric Bloom
  float vig = 1.0 - smoothstep(0.55, 1.45, length(centered) * u_vignette);
  comp *= vig;

  // Soft ethereal bloom/halation
  if (u_bloom > 0.01) {
    vec3 bloomTint = u_sunGlow * 0.3 + u_accentGlow * 0.2;
    comp += bloomTint * coreGlow * u_bloom;
  }

  // Tone-mapping and subtle silver-air grade (prevent harsh clipping, preserve ethereal softness)
  comp = comp / (comp + vec3(0.12)) * 1.12;

  fragColor = vec4(clamp(comp, 0.0, 1.0), 1.0);
}
`;
