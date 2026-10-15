/**
 * Web Audio API Gentle Nursery Music Box & Lullaby Synthesizer
 * 100% Royalty-free, runs client-side with pure synthesized chime/celesta tones.
 * Never autoplays without explicit user tap.
 */

class LullabySynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTimeout: any = null;
  private volume: number = 0.5;
  private isMuted: boolean = false;
  private trackIndex: number = 0;
  private onStateChangeCallbacks: Array<(isPlaying: boolean) => void> = [];

  // Lullaby Melodies: Notes with duration in beats
  // Frequency helper
  private noteFreq(note: string): number {
    const notes: Record<string, number> = {
      C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
      C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.0, B5: 987.77,
      C6: 1046.5,
    };
    return notes[note] || 440;
  }

  // Track 1: Brahms' Lullaby (Cradle Song)
  private brahms: Array<[string, number]> = [
    ['E4', 0.75], ['E4', 0.75], ['G4', 1.5],
    ['E4', 0.75], ['E4', 0.75], ['G4', 1.5],
    ['E4', 0.5], ['G4', 0.5], ['C5', 1.0], ['B4', 0.5], ['A4', 0.5], ['A4', 0.75], ['G4', 1.5],
    ['D4', 0.5], ['E4', 0.5], ['F4', 1.0], ['D4', 0.5], ['D4', 0.5], ['E4', 0.5], ['F4', 1.0],
    ['D4', 0.5], ['F4', 0.5], ['B4', 0.75], ['A4', 0.5], ['G4', 0.5], ['B4', 0.75], ['C5', 2.0],
    ['C4', 0.5], ['C4', 0.5], ['C5', 1.5], ['A4', 0.5], ['F4', 0.5], ['G4', 1.5],
    ['E4', 0.5], ['C4', 0.5], ['F4', 0.75], ['G4', 0.5], ['A4', 0.5], ['G4', 1.5],
    ['C4', 0.5], ['C4', 0.5], ['C5', 1.5], ['A4', 0.5], ['F4', 0.5], ['G4', 1.5],
    ['E4', 0.5], ['C4', 0.5], ['F4', 0.5], ['E4', 0.5], ['D4', 0.5], ['C4', 2.5]
  ];

  // Track 2: Twinkle Little Star (Nursery Chime)
  private twinkle: Array<[string, number]> = [
    ['C4', 1.0], ['C4', 1.0], ['G4', 1.0], ['G4', 1.0],
    ['A4', 1.0], ['A4', 1.0], ['G4', 2.0],
    ['F4', 1.0], ['F4', 1.0], ['E4', 1.0], ['E4', 1.0],
    ['D4', 1.0], ['D4', 1.0], ['C4', 2.0],
    ['G4', 1.0], ['G4', 1.0], ['F4', 1.0], ['F4', 1.0],
    ['E4', 1.0], ['E4', 1.0], ['D4', 2.0],
    ['G4', 1.0], ['G4', 1.0], ['F4', 1.0], ['F4', 1.0],
    ['E4', 1.0], ['E4', 1.0], ['D4', 2.0],
    ['C4', 1.0], ['C4', 1.0], ['G4', 1.0], ['G4', 1.0],
    ['A4', 1.0], ['A4', 1.0], ['G4', 2.0],
    ['F4', 1.0], ['F4', 1.0], ['E4', 1.0], ['E4', 1.0],
    ['D4', 1.0], ['D4', 1.0], ['C4', 3.0]
  ];

  public subscribe(cb: (playing: boolean) => void) {
    this.onStateChangeCallbacks.push(cb);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((c) => c !== cb);
    };
  }

  private notify() {
    this.onStateChangeCallbacks.forEach((cb) => cb(this.isPlaying));
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play single warm celesta bell note
  private playBellNote(freq: number, duration: number) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    // Pure sine + warm overtone for music box feel
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2.01, now); // soft bell shimmer

    const masterGain = this.volume * 0.18;
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.exponentialRampToValueAtTime(masterGain, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(duration * 1.4, 0.8));

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration * 1.5);
    osc2.stop(now + duration * 1.5);
  }

  public play() {
    this.initCtx();
    this.isPlaying = true;
    this.notify();
    this.playMelodyStep(0);
  }

  public pause() {
    this.isPlaying = false;
    if (this.currentTimeout) {
      clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setTrack(idx: number) {
    this.trackIndex = idx;
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }

  private playMelodyStep(step: number) {
    if (!this.isPlaying) return;

    const melody = this.trackIndex === 1 ? this.twinkle : this.brahms;
    const currentStep = step % melody.length;
    const [note, beats] = melody[currentStep];

    const beatDurationMs = 600; // gentle slow tempo
    const duration = beats * (beatDurationMs / 1000);

    const freq = this.noteFreq(note);
    this.playBellNote(freq, duration);

    this.currentTimeout = setTimeout(() => {
      this.playMelodyStep(step + 1);
    }, beats * beatDurationMs);
  }
}

export const lullabyPlayer = new LullabySynthesizer();
