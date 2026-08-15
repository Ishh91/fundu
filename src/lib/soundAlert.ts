// Web Audio API Synthetic Chime Player (Zero external audio file dependencies)
class SoundNotifier {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playChime(type: 'sell' | 'repair' | 'order' | 'test' = 'sell') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const gainNode = this.ctx.createGain();
      gainNode.connect(this.ctx.destination);

      // Frequencies for a pleasant modern chime (C5 -> E5 -> G5)
      const notes =
        type === 'sell'
          ? [523.25, 659.25, 783.99] // C5 -> E5 -> G5 (Uplifting cash chime)
          : type === 'repair'
          ? [440.0, 554.37, 659.25] // A4 -> C#5 -> E5 (Tech chime)
          : type === 'order'
          ? [587.33, 739.99, 880.0] // D5 -> F#5 -> A5 (Order notification)
          : [523.25, 659.25, 783.99]; // Test chime

      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);

        noteGain.gain.setValueAtTime(0.001, now + i * 0.12);
        noteGain.gain.exponentialRampToValueAtTime(0.35, now + i * 0.12 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.45);

        osc.connect(noteGain);
        noteGain.connect(gainNode);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.5);
      });
    } catch (e) {
      console.warn('Audio notification notice:', e);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const soundNotifier = new SoundNotifier();
