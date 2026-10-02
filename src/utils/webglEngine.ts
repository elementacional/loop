import { SimulationConfig } from '../types';
import { AIR_PALETTES } from './palettes';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './shaders';

export class AirCloudRenderer {
  private canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private vao: WebGLVertexArrayObject | null = null;
  private positionBuffer: WebGLBuffer | null = null;
  private uniformLocations: Record<string, WebGLUniformLocation | null> = {};
  private isInitialized = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
  }

  private init() {
    const gl = this.canvas.getContext('webgl2', {
      alpha: false,
      antialias: true,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.warn('WebGL2 not supported on this browser context');
      return;
    }

    this.gl = gl;

    // Compile shaders
    const vs = this.compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
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
    if (!this.isInitialized || !this.gl || !this.program || !this.vao) {
      return;
    }

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
