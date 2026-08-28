// Comprehensive Web Audio API Synthesizer Engine for FU-DEVER
// 100% Client-side, 0 External MP3 files, 0 Latency

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// Gentle wooden tactile click
export function playTactileClick(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(480, now);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.04);
}

// Ethereal magic harp for poetry generation & transitions
export function playPoemMagicSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
  const now = ctx.currentTime;

  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    gain.gain.setValueAtTime(0.001, now + idx * 0.06);
    gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.06 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.7);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + idx * 0.06);
    osc.stop(now + idx * 0.06 + 0.7);
  });
}

// Ascending Pentatonic Lantern Release chime
export function playLanternAscendChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
  const now = ctx.currentTime;

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + i * 0.08);

    gain.gain.setValueAtTime(0.01, now + i * 0.08);
    gain.gain.linearRampToValueAtTime(0.22, now + i * 0.08 + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + i * 0.08);
    osc.stop(now + i * 0.08 + 1.2);
  });
}

// Emoji-specific sound synthesis
export function playReactionSound(emoji: string): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  switch (emoji) {
    case "🏮": { // Warm lantern gong
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.6);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);
      break;
    }
    case "❤️": { // Soft heart bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    }
    case "✨": { // Sparkle bell
      playPoemMagicSound();
      break;
    }
    case "🚀": { // Rocket rising whoosh
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
      break;
    }
    case "🐞": { // Playful Buggy synth chirp
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.setValueAtTime(900, now + 0.05);
      osc.frequency.setValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    }
    case "🔥": { // Fire blaze pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    }
    default:
      playTactileClick();
  }
}

// Lucky Draw slot machine tick
export function playSlotTickSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(880, now);

  gain.gain.setValueAtTime(0.1, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.03);
}

// Lucky Draw celebration fanfare
export function playCelebrationFanfare(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const melody = [
    { freq: 523.25, time: 0.0, dur: 0.12 }, // C5
    { freq: 523.25, time: 0.14, dur: 0.12 }, // C5
    { freq: 523.25, time: 0.28, dur: 0.12 }, // C5
    { freq: 659.25, time: 0.42, dur: 0.25 }, // E5
    { freq: 783.99, time: 0.70, dur: 0.45 }, // G5
  ];

  const now = ctx.currentTime;
  melody.forEach((note) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(note.freq, now + note.time);

    gain.gain.setValueAtTime(0.01, now + note.time);
    gain.gain.linearRampToValueAtTime(0.25, now + note.time + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + note.time);
    osc.stop(now + note.time + note.dur);
  });
}

// Crackling Firework Explosion & Sparkle
export function playFireworkBurstSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. Initial low boom
  const boomOsc = ctx.createOscillator();
  const boomGain = ctx.createGain();
  boomOsc.type = "sine";
  boomOsc.frequency.setValueAtTime(160, now);
  boomOsc.frequency.exponentialRampToValueAtTime(40, now + 0.35);

  boomGain.gain.setValueAtTime(0.25, now);
  boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
  boomOsc.connect(boomGain);
  boomGain.connect(ctx.destination);
  boomOsc.start(now);
  boomOsc.stop(now + 0.35);

  // 2. High glitter crackles
  [0.05, 0.12, 0.18, 0.26].forEach((delay) => {
    const crackleOsc = ctx.createOscillator();
    const crackleGain = ctx.createGain();
    crackleOsc.type = "triangle";
    crackleOsc.frequency.setValueAtTime(1200 + Math.random() * 800, now + delay);
    crackleGain.gain.setValueAtTime(0.08, now + delay);
    crackleGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
    crackleOsc.connect(crackleGain);
    crackleGain.connect(ctx.destination);
    crackleOsc.start(now + delay);
    crackleOsc.stop(now + delay + 0.08);
  });
}

// Royal Mystery Drop magical crystal arrival
export function playMysteryDropChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const arpeggio = [587.33, 739.99, 880.0, 1174.66, 1479.98]; // D5, F#5, A5, D6, F#6
  const now = ctx.currentTime;

  arpeggio.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + i * 0.07);

    gain.gain.setValueAtTime(0.001, now + i * 0.07);
    gain.gain.linearRampToValueAtTime(0.2, now + i * 0.07 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.9);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now + i * 0.07);
    osc.stop(now + i * 0.07 + 0.9);
  });
}
