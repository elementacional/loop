import { SimulationConfig } from '../types';
import { AIR_PALETTES } from './palettes';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders';

export class AirCloudRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private ctx2d: CanvasRenderingContext2D | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  private isInitialized = false;
  private use2dFallback = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
  }

  private init() {
    try {
      const gl = this.canvas.getContext('webgl2', {
        alpha: false,
        antialias: true,
        depth: false,
        stencil: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });

      if (!gl) {
        throw new Error('WebGL2 context not available');
      }

      this.gl = gl;

      // Compile shaders
      const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
      const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

      if (!vs || !fs) throw new Error('Shader compilation failed');

      const program = gl.createProgram();
      if (!program) throw new Error('Program creation failed');

      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
      }

      this.program = program;

      // Setup full-screen quad
      const quadVertices = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
        -1.0,  1.0,
         1.0, -1.0,
         1.0,  1.0,
      ]);

      this.vao = gl.createVertexArray();
      gl.bindVertexArray(this.vao);

      this.positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

      const posLoc = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.bindVertexArray(null);

      // Cache uniform locations
      const uniformNames = [
        'u_resolution',
        'u_time',
        'u_duration',
        'u_swirlStrength',
        'u_cloudDensity',
        'u_swirlRadius',
        'u_windCycles',
        'u_lightRays',
        'u_glyphOpacity',
        'u_bloom',
        'u_vignette',
        'u_skyZenith',
        'u_skyHorizon',
        'u_cloudHighlight',
        'u_cloudShadow',
        'u_sunGlow',
        'u_accentGlow',
      ];

      for (const name of uniformNames) {
        this.uniformLocations[name] = gl.getUniformLocation(program, name);
      }

      this.isInitialized = true;
    } catch (e) {
      console.warn('Falling back to high-resolution 2D Canvas renderer:', e);
      this.use2dFallback = true;
      this.ctx2d = this.canvas.getContext('2d');
      this.isInitialized = !!this.ctx2d;
    }
  }

  private compileShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  public render(timeSeconds: number, config: SimulationConfig, duration = 10.0) {
    if (!this.isInitialized) return;

    if (this.use2dFallback && this.ctx2d) {
      this.render2DFallback(timeSeconds, config, duration);
      return;
    }

    if (!this.gl || !this.program || !this.vao) return;

    const gl = this.gl;
    const width = this.canvas.width;
    const height = this.canvas.height;

    gl.viewport(0, 0, width, height);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);

    // Retrieve active palette
    const palette = AIR_PALETTES[config.paletteId] || AIR_PALETTES.celestial;

    // Set uniform values
    gl.uniform2f(this.uniformLocations['u_resolution'], width, height);
    // Exact modulo loop time between 0.0 and 10.0
    const normalizedTime = (timeSeconds % duration + duration) % duration;
    gl.uniform1f(this.uniformLocations['u_time'], normalizedTime);
    gl.uniform1f(this.uniformLocations['u_duration'], duration);
    gl.uniform1f(this.uniformLocations['u_swirlStrength'], config.swirlStrength);
    gl.uniform1f(this.uniformLocations['u_cloudDensity'], config.cloudDensity);
    gl.uniform1f(this.uniformLocations['u_swirlRadius'], config.swirlRadius);
    gl.uniform1f(this.uniformLocations['u_windCycles'], config.windSpeedCycles);
    gl.uniform1f(this.uniformLocations['u_lightRays'], config.lightRays);
    gl.uniform1f(this.uniformLocations['u_glyphOpacity'], config.glyphOpacity);
    gl.uniform1f(this.uniformLocations['u_bloom'], config.ambientBloom);
    gl.uniform1f(this.uniformLocations['u_vignette'], config.vignette);

    // Colors
    gl.uniform3fv(this.uniformLocations['u_skyZenith'], palette.skyZenith);
    gl.uniform3fv(this.uniformLocations['u_skyHorizon'], palette.skyHorizon);
    gl.uniform3fv(this.uniformLocations['u_cloudHighlight'], palette.cloudHighlight);
    gl.uniform3fv(this.uniformLocations['u_cloudShadow'], palette.cloudShadow);
    gl.uniform3fv(this.uniformLocations['u_sunGlow'], palette.sunGlow);
    gl.uniform3fv(this.uniformLocations['u_accentGlow'], palette.accentGlow);

    // Draw
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.bindVertexArray(null);
  }

  private render2DFallback(timeSeconds: number, config: SimulationConfig, duration = 10.0) {
    const ctx = this.ctx2d;
    if (!ctx) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2 - h * 0.08;
    const normT = (timeSeconds % duration + duration) % duration;
    const theta = (normT / duration) * Math.PI * 2;
    const palette = AIR_PALETTES[config.paletteId] || AIR_PALETTES.celestial;

    const toRgb = (arr: [number, number, number]) =>
      `rgb(${Math.round(arr[0] * 255)}, ${Math.round(arr[1] * 255)}, ${Math.round(arr[2] * 255)})`;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, toRgb(palette.skyZenith));
    skyGrad.addColorStop(1, toRgb(palette.skyHorizon));
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Sun / core glow
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.45);
    coreGrad.addColorStop(0, toRgb(palette.sunGlow));
    coreGrad.addColorStop(0.5, toRgb(palette.accentGlow));
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.globalAlpha = 0.45 + 0.1 * Math.cos(theta);
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1.0;

    // Swirling cloud spirals (procedural trigonometric curves)
    const arms = 12;
    for (let i = 0; i < arms; i++) {
      const armOffset = (i / arms) * Math.PI * 2;
      const rot = theta * config.windSpeedCycles + armOffset;

      ctx.beginPath();
      for (let r = 30; r < w * 0.7; r += 10) {
        const twist = (1.0 - r / (w * 0.7)) * config.swirlStrength * 3.5;
        const angle = rot + twist;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r * 0.7; // 16:9 perspective tilt
        if (r === 30) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.lineWidth = 18 + 12 * Math.sin(theta + i);
      ctx.strokeStyle = toRgb(palette.cloudHighlight);
      ctx.globalAlpha = 0.25 * config.cloudDensity;
      ctx.stroke();
    }
    ctx.globalAlpha = 1.0;
  }

  public resize(width: number, height: number) {
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
    }
  }

  public destroy() {
    if (!this.gl) return;
    const gl = this.gl;
    if (this.vao) gl.deleteVertexArray(this.vao);
    if (this.positionBuffer) gl.deleteBuffer(this.positionBuffer);
    if (this.program) gl.deleteProgram(this.program);
    this.isInitialized = false;
  }
}
