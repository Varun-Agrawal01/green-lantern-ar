/**
 * EMERALD CORPS AR: AUDIO ENGINE
 * Neural-voice oaths for all seven corps + procedural construct SFX.
 *
 * The oath engine deliberately does NOT hardcode a millisecond subtitle
 * schedule. It reads the real duration of the active corps' neural track and
 * distributes its subtitle lines across that window, so regenerating or
 * re-voicing an oath with build_corps_oaths.py can never desync the text.
 */

class LanternAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.isOathPlaying = false;
    this.oathCallback = null;

    this.corps = window.CORPS.green;

    // One reusable voice element; its source is swapped per corps.
    this.voice = new Audio();
    this.voice.preload = 'auto';

    this.humGain = null;
    this.humOsc1 = null;
    this.humOsc2 = null;
    this.isHumming = false;

    this.oathTimers = [];
  }

  setCorps(corps) {
    this.corps = corps;
    // Swap in the new oath narration.
    this.voice.pause();
    this.voice.src = corps.oath.audio;
    this.voice.load();
    if (this.voice.muted !== this.isMuted) this.voice.muted = this.isMuted;
  }

  async init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') await this.ctx.resume();
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    if (!this.voice.src) this.voice.src = this.corps.oath.audio;
    this.voice.load();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.voice.muted = this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /* ---------------- generic synth helpers ---------------- */

  _tone(freq, opts = {}) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime + (opts.delay || 0);
    const dur = opts.dur || 0.5;
    const peak = opts.peak === undefined ? 0.2 : opts.peak;

    const osc = this.ctx.createOscillator();
    osc.type = opts.type || 'sine';
    osc.frequency.setValueAtTime(freq, now);
    if (opts.sweepTo) {
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(opts.sweepTo, 1), now + dur
      );
    }

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

    let chain = osc;
    if (opts.filter) {
      const f = this.ctx.createBiquadFilter();
      f.type = opts.filter;
      f.frequency.setValueAtTime(opts.filterFrom || 1200, now);
      if (opts.filterTo) f.frequency.exponentialRampToValueAtTime(opts.filterTo, now + dur);
      f.Q.value = opts.q || 1;
      chain.connect(f);
      chain = f;
    }
    chain.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  _noise(dur = 0.3, peak = 0.25, filterType = 'bandpass', freq = 1200, sweepTo) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const frames = Math.floor(this.ctx.sampleRate * dur);
    const buffer = this.ctx.createBuffer(1, frames, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;

    const f = this.ctx.createBiquadFilter();
    f.type = filterType;
    f.frequency.setValueAtTime(freq, now);
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, now + dur);
    f.Q.value = 1.2;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(f); f.connect(gain); gain.connect(this.masterGain);
    src.start(now);
  }

  /* ---------------- construct SFX library ---------------- */

  playChime() {
    [554.37, 659.25, 830.61, 1108.73].forEach((f, i) => {
      this._tone(f, { delay: i * 0.04, dur: 1.2, peak: 0.18 });
    });
  }

  playImpact() {
    // sub-bass drop 140Hz -> 32Hz with a crack on top
    this._tone(140, { type: 'sine', dur: 0.42, peak: 0.65, sweepTo: 32 });
    this._tone(380, { type: 'triangle', dur: 0.25, peak: 0.4, sweepTo: 80 });
  }

  playClang() {
    [880, 1320, 1760].forEach(f => this._tone(f, { dur: 0.65, peak: 0.2 }));
  }

  playShot() {
    this._tone(600, { type: 'sawtooth', dur: 0.14, peak: 0.35, sweepTo: 90 });
    this._noise(0.12, 0.18, 'bandpass', 2400, 600);
  }

  playSlash() {
    this._tone(450, {
      type: 'sawtooth', dur: 0.35, peak: 0.4, sweepTo: 120,
      filter: 'bandpass', filterFrom: 1200, filterTo: 300
    });
  }

  playWhoosh() {
    this._noise(0.55, 0.22, 'lowpass', 2600, 320);
    this._tone(180, { type: 'sine', dur: 0.5, peak: 0.2, sweepTo: 420 });
  }

  playThrow() {
    this._tone(300, {
      type: 'square', dur: 0.4, peak: 0.16, sweepTo: 1500,
      filter: 'bandpass', filterFrom: 600, filterTo: 2600, q: 4
    });
  }

  playRoar() {
    this._noise(0.9, 0.3, 'lowpass', 900, 180);
    this._tone(110, { type: 'sawtooth', dur: 0.85, peak: 0.3, sweepTo: 62 });
  }

  playTerror() {
    // Dissonant minor-second cluster with a falling shriek: dread, not volume.
    this._tone(1400, { type: 'sine', dur: 0.7, peak: 0.14, sweepTo: 380 });
    this._tone(1480, { type: 'sine', dur: 0.7, peak: 0.12, sweepTo: 400 });
    this._tone(70, { type: 'sine', dur: 1.0, peak: 0.35 });
    this._noise(0.7, 0.1, 'bandpass', 3000, 500);
  }

  playDeath() {
    // Hollow, drained, and cold: the low end drops out entirely.
    this._tone(210, { type: 'sine', dur: 1.1, peak: 0.16, sweepTo: 44 });
    this._tone(419, { type: 'sine', dur: 0.9, peak: 0.08, sweepTo: 96 });
    this._noise(0.8, 0.06, 'lowpass', 420, 90);
  }

  /** Route a construct's declared sfx key to its synthesizer. */
  playSfx(key) {
    switch (key) {
      case 'impact': this.playImpact(); break;
      case 'clang': this.playClang(); break;
      case 'shot': this.playShot(); break;
      case 'slash': this.playSlash(); break;
      case 'whoosh': this.playWhoosh(); break;
      case 'throw': this.playThrow(); break;
      case 'roar': this.playRoar(); break;
      case 'terror': this.playTerror(); break;
      case 'death': this.playDeath(); break;
      default: this.playImpact(); break;
    }
  }

  /* ---------------- continuous plasma hum ---------------- */

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
    if (this.humGain) {
      this.humGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);
    }
    setTimeout(() => {
      try {
        if (this.humOsc1) this.humOsc1.stop();
        if (this.humOsc2) this.humOsc2.stop();
      } catch (e) { /* already stopped */ }
    }, 450);
  }

  /* ---------------- oath playback ---------------- */

  /**
   * @param {function} onLineUpdate  (lineIdx, text, isDone, isClimax)
   */
  playOath(onLineUpdate) {
    if (this.isOathPlaying) return;
    this.isOathPlaying = true;
    this.oathCallback = onLineUpdate;

    this.playChime();
    this.startPlasmaHum();

    this.oathTimers.forEach(t => clearTimeout(t));
    this.oathTimers = [];

    const voice = this.voice;
    voice.currentTime = 0;
    voice.play().catch(e => console.warn('Audio autoplay blocked:', e));

    const buildSchedule = (durationSec) => {
      const oath = this.corps.oath;
      const lines = oath.lines;
      const weights = oath.lineWeights;
      const totalWeight = weights.reduce((a, b) => a + b, 0);
      const usable = Math.max(0.5, durationSec - oath.leadIn);

      let elapsed = oath.leadIn * 1000;
      const schedule = lines.map((text, i) => {
        const startMs = elapsed;
        elapsed += (weights[i] / totalWeight) * usable * 1000;
        return {
          time: startMs,
          line: i,
          text: text,
          climax: i >= lines.length - 1
        };
      });
      schedule.push({ time: durationSec * 1000 + 400, line: -1, text: '', done: true });
      return schedule;
    };

    // resolve duration from the real track once metadata is in, then lay the
    // subtitles across it. Fallback window until then.
    const fallbackDur = this.corps.oath.lineWeights.reduce((a, b) => a + b, 0);
    let fired = false;

    const run = (durationSec) => {
      if (fired || !this.isOathPlaying) return;
      fired = true;
      buildSchedule(durationSec).forEach(item => {
        const timer = setTimeout(() => {
          if (!this.isOathPlaying) return;
          if (item.climax) this.playImpact();
          if (item.done) {
            this.isOathPlaying = false;
            if (this.oathCallback) this.oathCallback(-1, '', true, false);
          } else if (this.oathCallback) {
            this.oathCallback(item.line, item.text, false, item.climax);
          }
        }, item.time);
        this.oathTimers.push(timer);
      });
    };

    if (voice.readyState >= 1 && isFinite(voice.duration) && voice.duration > 0) {
      run(voice.duration);
    } else {
      // Lay out against the fallback immediately so the subtitles start on
      // time, then correct if the true duration differs materially.
      run(fallbackDur);
      voice.addEventListener('loadedmetadata', () => {
        if (this.isOathPlaying && isFinite(voice.duration) && voice.duration > 0) {
          this.oathTimers.forEach(t => clearTimeout(t));
          this.oathTimers = [];
          fired = false;
          run(voice.duration);
        }
      }, { once: true });
    }
  }

  stopOath() {
    this.isOathPlaying = false;
    this.voice.pause();
    this.voice.currentTime = 0;
    this.oathTimers.forEach(t => clearTimeout(t));
    this.oathTimers = [];
  }
}

window.LanternAudioEngine = LanternAudioEngine;
