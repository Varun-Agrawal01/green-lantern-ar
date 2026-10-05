/**
 * GREEN LANTERN AR - NATURAL VOICE AUDIO & CONSTRUCT SFX ENGINE
 * Plays natural human voice oath and authentic animated show sound effects.
 */

class LanternAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.isOathPlaying = false;
    this.oathCallback = null;

    // Natural Human Neural Voice Audio
    this.naturalVoiceAudio = new Audio('audio/oath_natural_raw.mp3');
    this.naturalVoiceAudio.preload = 'auto';

    // Procedural Hum nodes
    this.humGain = null;
    this.humOsc1 = null;
    this.humOsc2 = null;
    this.isHumming = false;

    this.oathTimers = [];
  }

  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.naturalVoiceAudio.load();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.naturalVoiceAudio.muted = this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /**
   * Continuous emerald willpower plasma hum
   */
  startPlasmaHum() {
    if (!this.ctx || this.isHumming) return;
    this.isHumming = true;
    const now = this.ctx.currentTime;

    this.humGain = this.ctx.createGain();
    this.humGain.gain.setValueAtTime(0.001, now);
    this.humGain.gain.linearRampToValueAtTime(0.12, now + 0.6);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, now);
    filter.Q.value = 3;

    this.humOsc1 = this.ctx.createOscillator();
    this.humOsc1.type = 'sawtooth';
    this.humOsc1.frequency.setValueAtTime(110, now);

    this.humOsc2 = this.ctx.createOscillator();
    this.humOsc2.type = 'sine';
    this.humOsc2.frequency.setValueAtTime(112.2, now);

    this.humOsc1.connect(filter);
    this.humOsc2.connect(filter);
    filter.connect(this.humGain);
    this.humGain.connect(this.masterGain);

    this.humOsc1.start(now);
    this.humOsc2.start(now);
  }

  stopPlasmaHum() {
    if (!this.isHumming || !this.ctx) return;
    this.isHumming = false;
    const now = this.ctx.currentTime;
    if (this.humGain) {
      this.humGain.gain.linearRampToValueAtTime(0.001, now + 0.4);
    }
    setTimeout(() => {
      try {
        if (this.humOsc1) this.humOsc1.stop();
        if (this.humOsc2) this.humOsc2.stop();
      } catch (e) {}
    }, 450);
  }

  /**
   * Resonant cosmic chime on ring lock-on
   */
  playChime() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [554.37, 659.25, 830.61, 1108.73];

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + i * 0.04);
      gain.gain.setValueAtTime(0.18, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 1.2);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 1.3);
    });
  }

  /**
   * Giant Fist Punch Impact (Heavy comic book slam with sub-bass drop)
   */
  playPunchImpact() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sub bass drop 140Hz -> 35Hz
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, now);
    sub.frequency.exponentialRampToValueAtTime(32, now + 0.35);
    subGain.gain.setValueAtTime(0.65, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    sub.connect(subGain);
    subGain.connect(this.masterGain);
    sub.start(now);
    sub.stop(now + 0.42);

    // Punch crack noise burst
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  /**
   * Shield Deflection Clang
   */
  playShieldClang() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const freqs = [880, 1320, 1760];
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.65);
    });
  }

  /**
   * Gatling Cannon Rapid Pulse
   */
  playGatlingShot() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.1);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  /**
   * Broadsword Energy Slash
   */
  playSwordSlash() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.3);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.3);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Plays the Green Lantern Oath with Natural Human Voice and cinematic progression
   */
  playOath(onLineUpdate) {
    if (this.isOathPlaying) return;
    this.isOathPlaying = true;
    this.oathCallback = onLineUpdate;

    this.playChime();
    this.startPlasmaHum();

    this.oathTimers.forEach(t => clearTimeout(t));
    this.oathTimers = [];

    // Play natural human neural voice
    this.naturalVoiceAudio.currentTime = 0;
    this.naturalVoiceAudio.play().catch(e => {
      console.warn("Audio autoplay blocked:", e);
    });

    // Exact cadence of the natural voice recording:
    // Line 0: "In brightest day... in blackest night,"
    // Line 1: "No evil shall escape my sight."
    // Line 2: "Let those who worship evil's might,"
    // Line 3: "Beware my power... GREEN LANTERN'S LIGHT!" (Climax!)
    const schedule = [
      { time: 200, line: 0, text: "In brightest day... in blackest night,", climax: false },
      { time: 3600, line: 1, text: "No evil shall escape my sight.", climax: false },
      { time: 6400, line: 2, text: "Let those who worship evil's might,", climax: false },
      { time: 9200, line: 3, text: "Beware my power... GREEN LANTERN'S LIGHT!", climax: true },
      { time: 13500, line: -1, text: "", done: true }
    ];

    schedule.forEach(item => {
      const timer = setTimeout(() => {
        if (!this.isOathPlaying) return;

        if (item.climax) {
          this.playPunchImpact(); // Sub-bass impact boom on climax!
        }

        if (item.done) {
          this.isOathPlaying = false;
          if (this.oathCallback) this.oathCallback(-1, "", true, false);
        } else {
          if (this.oathCallback) this.oathCallback(item.line, item.text, false, item.climax);
        }
      }, item.time);
      this.oathTimers.push(timer);
    });
  }

  stopOath() {
    this.isOathPlaying = false;
    this.naturalVoiceAudio.pause();
    this.naturalVoiceAudio.currentTime = 0;
    this.oathTimers.forEach(t => clearTimeout(t));
    this.oathTimers = [];
  }
}

window.LanternAudioEngine = LanternAudioEngine;
