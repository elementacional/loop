export class EtherealAirAudio {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filterA: BiquadFilterNode | null = null;
  private filterB: BiquadFilterNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private isPlaying = false;
  private destinationStream: MediaStreamAudioDestinationNode | null = null;

  public init() {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    // Stream destination for video export recording
    this.destinationStream = this.ctx.createMediaStreamDestination();
    this.masterGain.connect(this.destinationStream);
    this.masterGain.connect(this.ctx.destination);

    this.setupWindSynthesizer();
    this.setupHarmonicChords();
  }

  private setupWindSynthesizer() {
    if (!this.ctx || !this.masterGain) return;

    // Create 10 seconds of soft stereo atmospheric noise (looping seamlessly)
    const bufferSize = this.ctx.sampleRate * 10;
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const data = noiseBuffer.getChannelData(channel);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        // Soft pink-filtered noise
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        // Apply smooth boundary fade so the audio buffer loops seamlessly without click
        const edgeWindow = Math.min(i / 1000, (bufferSize - i) / 1000, 1.0);
        data[i] = lastOut * 3.5 * edgeWindow;
      }
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // Resonant bandpass filter A (breathing air formant)
    this.filterA = this.ctx.createBiquadFilter();
    this.filterA.type = 'bandpass';
    this.filterA.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.filterA.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // Resonant lowpass filter B (high frequency air whisper)
    this.filterB = this.ctx.createBiquadFilter();
    this.filterB.type = 'lowpass';
    this.filterB.frequency.setValueAtTime(1400, this.ctx.currentTime);

    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    this.noiseNode.connect(this.filterA);
    this.filterA.connect(this.filterB);
    this.filterB.connect(windGain);
    windGain.connect(this.masterGain);

    this.noiseNode.start();
  }

  private setupHarmonicChords() {
    if (!this.ctx || !this.masterGain) return;

    // 432 Hz celestial air tuning: root, fifth, octave, and 9th (432, 648, 864, 972 Hz)
    const freqs = [216, 432, 648, 864];
    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    padGain.connect(this.masterGain);

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detune for airy chorus texture
      osc.detune.setValueAtTime((idx - 1.5) * 4, this.ctx.currentTime);

      oscGain.gain.setValueAtTime(1.0 / (idx + 1), this.ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(padGain);

      osc.start();
      this.oscillators.push(osc);
    });
  }

  public updateTime(loopTime: number, duration = 10.0) {
    if (!this.ctx || !this.filterA) return;
    
    // Modulate wind breathing filter in sync with 10s loop
    const theta = (loopTime / duration) * Math.PI * 2;
    const filterFreq = 380 + Math.sin(theta) * 160 + Math.cos(theta * 2) * 60;
    this.filterA.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.05);
  }

  public setVolume(volume: number) {
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(volume, 1.0)), this.ctx.currentTime, 0.05);
  }

  public getAudioStream(): MediaStreamTrack | null {
    if (this.destinationStream) {
      const tracks = this.destinationStream.stream.getAudioTracks();
      return tracks[0] || null;
    }
    return null;
  }

  public async resume() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.isPlaying = true;
  }

  public suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
    this.isPlaying = false;
  }

  public destroy() {
    this.oscillators.forEach(osc => {
      try { osc.stop(); } catch {}
    });
    this.oscillators = [];
    if (this.noiseNode) {
      try { this.noiseNode.stop(); } catch {}
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}
