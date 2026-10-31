// Professional Web Audio & Native Desktop System Notification Manager
// Zero external audio file dependencies — fully standalone synthetic audio + OS desktop notifications

export type NotificationType = 'sell' | 'repair' | 'order' | 'vendor_quote' | 'test';

class SoundNotifier {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private autoUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Auto-unlock AudioContext on first user interaction anywhere on the document
      const unlockAudio = () => {
        if (!this.autoUnlocked) {
          this.initContext();
          this.autoUnlocked = true;
          window.removeEventListener('click', unlockAudio);
          window.removeEventListener('keydown', unlockAudio);
          window.removeEventListener('touchstart', unlockAudio);
        }
      };
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  private initContext() {
    if (typeof window === 'undefined') return;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext init suppressed
    }
  }

  /**
   * Request native OS desktop notification permission
   */
  public async requestPermission(): Promise<NotificationPermission | 'unsupported'> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    if (Notification.permission === 'granted') {
      return 'granted';
    }
    try {
      const res = await Notification.requestPermission();
      return res;
    } catch {
      return Notification.permission;
    }
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  /**
   * Show native OS desktop notification (works even if window is minimized or in background tab)
   */
  public showSystemNotification(
    title: string,
    options: {
      body?: string;
      icon?: string;
      tag?: string;
      onClick?: () => void;
    } = {}
  ) {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      const notif = new Notification(title, {
        body: options.body,
        icon: options.icon || '/logo1.png',
        badge: '/logo1.png',
        tag: options.tag || `fundu-alert-${Date.now()}`,
        requireInteraction: false,
      });

      notif.onclick = () => {
        window.focus();
        if (options.onClick) {
          options.onClick();
        }
        notif.close();
      };
    } catch (e) {
      console.warn('System notification delivery notice:', e);
    }
  }

  /**
   * Play crystal clear synthetic multi-tone acoustic alert
   */
  public playChime(type: NotificationType = 'sell') {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.4, now);
      masterGain.connect(this.ctx.destination);

      // Acoustic note definitions per alert category
      let notes: Array<{ freq: number; delay: number; duration: number; wave?: OscillatorType }> = [];

      switch (type) {
        case 'order':
          // High-energy cash register double-chime (D5 -> A5 -> D6 -> F#6)
          notes = [
            { freq: 587.33, delay: 0.0, duration: 0.22, wave: 'sine' },
            { freq: 880.0, delay: 0.1, duration: 0.25, wave: 'sine' },
            { freq: 1174.66, delay: 0.22, duration: 0.35, wave: 'triangle' },
            { freq: 1479.98, delay: 0.34, duration: 0.5, wave: 'sine' },
          ];
          break;

        case 'sell':
          // Upbeat, modern 3-stage ascending customer valuation chime (C5 -> E5 -> G5 -> C6)
          notes = [
            { freq: 523.25, delay: 0.0, duration: 0.2, wave: 'sine' },
            { freq: 659.25, delay: 0.12, duration: 0.2, wave: 'sine' },
            { freq: 783.99, delay: 0.24, duration: 0.25, wave: 'sine' },
            { freq: 1046.5, delay: 0.36, duration: 0.45, wave: 'sine' },
          ];
          break;

        case 'repair':
          // Crisp 2-tone tech diagnostic chime (E5 -> B5)
          notes = [
            { freq: 659.25, delay: 0.0, duration: 0.22, wave: 'sine' },
            { freq: 987.77, delay: 0.14, duration: 0.4, wave: 'triangle' },
          ];
          break;

        case 'vendor_quote':
          // Urgent business alert chime (G5 -> C6 -> E6 -> G6)
          notes = [
            { freq: 783.99, delay: 0.0, duration: 0.18, wave: 'sine' },
            { freq: 1046.5, delay: 0.12, duration: 0.2, wave: 'sine' },
            { freq: 1318.51, delay: 0.24, duration: 0.25, wave: 'triangle' },
            { freq: 1567.98, delay: 0.36, duration: 0.45, wave: 'sine' },
          ];
          break;

        case 'test':
        default:
          // Harmonic rich chord confirmation
          notes = [
            { freq: 523.25, delay: 0.0, duration: 0.2, wave: 'sine' },
            { freq: 659.25, delay: 0.1, duration: 0.2, wave: 'sine' },
            { freq: 783.99, delay: 0.2, duration: 0.2, wave: 'sine' },
            { freq: 1046.5, delay: 0.3, duration: 0.45, wave: 'sine' },
          ];
          break;
      }

      notes.forEach(({ freq, delay, duration, wave = 'sine' }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        osc.type = wave;
        osc.frequency.setValueAtTime(freq, now + delay);

        noteGain.gain.setValueAtTime(0.001, now + delay);
        noteGain.gain.exponentialRampToValueAtTime(0.45, now + delay + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);

        osc.connect(noteGain);
        noteGain.connect(masterGain);

        osc.start(now + delay);
        osc.stop(now + delay + duration + 0.05);
      });
    } catch (e) {
      console.warn('Audio chime playback notice:', e);
    }
  }

  /**
   * Complete unified alert: Plays sound chime AND fires native desktop system notification
   */
  public notify(params: {
    type: NotificationType;
    title: string;
    body: string;
    onClick?: () => void;
  }) {
    // 1. Play crystal clear audio alert
    this.playChime(params.type);

    // 2. Fire native desktop system notification
    this.showSystemNotification(params.title, {
      body: params.body,
      tag: `fundu-${params.type}-${Date.now()}`,
      onClick: params.onClick,
    });
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const soundNotifier = new SoundNotifier();
