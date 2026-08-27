// Web Audio API procedural ambient soundscape generator
// Generates warm pentatonic harmonics and soothing chimes for the display screen

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private intervalId: NodeJS.Timeout | null = null;

  // Traditional Vietnamese pentatonic scale frequencies (C, D, F, G, A in various octaves)
  private pentatonicFrequencies = [
    261.63, // C4
    293.66, // D4
    349.23, // F4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    698.46, // F5
    783.99, // G5
    880.00, // A5
  ];

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.masterGain.gain.setTargetAtTime(clamped * 0.25, this.ctx.currentTime, 0.1);
    }
  }

  public start() {
    this.initContext();
    if (!this.ctx || !this.masterGain || this.isPlaying) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.isPlaying = true;

    // Trigger random peaceful harmonic chimes every 3-5 seconds
    const playNextNote = () => {
      if (!this.isPlaying || !this.ctx || !this.masterGain) return;

      const freq = this.pentatonicFrequencies[
        Math.floor(Math.random() * this.pentatonicFrequencies.length)
      ];

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle vibrato for natural warmth
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(4.5, this.ctx.currentTime);
      lfoGain.gain.setValueAtTime(2.0, this.ctx.currentTime);
      lfo.connect(osc.frequency);
      lfo.start();

      const now = this.ctx.currentTime;
      noteGain.gain.setValueAtTime(0.001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.18, now + 0.4);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(noteGain);
      noteGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.6);
      lfo.stop(now + 3.6);

      const nextDelay = Math.random() * 2500 + 2000;
      this.intervalId = setTimeout(playNextNote, nextDelay);
    };

    playNextNote();
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambientSound = new AmbientSoundEngine();
