class SoundEngine {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private initCtx() {
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

  // Tiếng ting ting khi cộng hoa điểm tốt
  public playPointGain() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);
      gain.gain.setValueAtTime(0, t + idx * 0.07);
      gain.gain.linearRampToValueAtTime(0.25, t + idx * 0.07 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.3);
    });
  }

  // Tiếng trầm khi nhắc nhở / trừ điểm
  public playPointDeduct() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.25);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  // Tiếng trống hội ăn mừng, sinh hoạt tổ
  public playFestiveDrum() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    [0, 0.25, 0.5, 0.75, 0.9, 1.05, 1.25].forEach((offset, idx) => {
      if (!this.ctx) return;
      const s = t + offset;
      const isClimax = idx === 4;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isClimax ? 'square' : 'sine';
      osc.frequency.setValueAtTime(isClimax ? 400 : 90 - (idx % 2) * 10, s);
      osc.frequency.exponentialRampToValueAtTime(isClimax ? 150 : 45, s + 0.15);
      gain.gain.setValueAtTime(isClimax ? 0.15 : 0.35, s);
      gain.gain.exponentialRampToValueAtTime(0.001, s + (isClimax ? 0.08 : 0.22));
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(s);
      osc.stop(s + 0.23);
    });
  }

  // Kèn hoàng gia vinh quy bái tổ, thăng cấp Trạng Nguyên
  public playRoyalFanfare() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { f: 392, d: 0.15, t: 0 },
      { f: 523.25, d: 0.15, t: 0.15 },
      { f: 659.25, d: 0.15, t: 0.3 },
      { f: 783.99, d: 0.35, t: 0.45 },
      { f: 659.25, d: 0.15, t: 0.85 },
      { f: 783.99, d: 0.15, t: 1.0 },
      { f: 1046.5, d: 0.7, t: 1.15 }
    ];

    notes.forEach(note => {
      if (!this.ctx) return;
      const at = t + note.t;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, at);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.2, at + 0.03);
      gain.gain.setValueAtTime(0.18, at + note.d * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, at + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(at);
      osc.stop(at + note.d + 0.05);
    });
  }

  // Tiếng kim quay bánh xe may mắn
  public playWheelTick() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.exponentialRampToValueAtTime(250, t + 0.03);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.035);
  }

  // Tiếng chuông điểm danh
  public playAttendanceTing() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, t);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.16);
  }
}

export const soundEngine = new SoundEngine();
