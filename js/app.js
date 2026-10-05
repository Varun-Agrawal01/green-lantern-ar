/**
 * EMERALD CORPS AR: MASTER APPLICATION CONTROLLER
 *
 * Coordinates Hand 1 (Ring), Hand 2 (Construct), Energy Tether, per-corps
 * neural oaths, and the UI. Owns corps switching: selecting a corps rebuilds
 * the ring, constructs, VFX, HUD theme, oath narration and construct dock.
 */

class GreenLanternApp {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.ring = null;
    this.constructs = null;
    this.vfx = null;
    this.audio = null;
    this.tracker = null;

    this.corpsKey = 'green';
    this.corps = window.CORPS.green;

    this.clock = new THREE.Clock();
    this.hasOathPlayedOnce = false;
    this.isRingHandVisible = false;
    this.isConstructHandVisible = false;
    this.lastPunchTime = 0;
    this.activeLanes = []; // per-corps construct keyboard lanes

    this.init();
  }

  async init() {
    this._setupThreeScene();
    this._setupAudioAndVFX();
    this._setupCorpsSelector();
    // Apply the green palette and build its dock before first paint.
    this._applyTheme();
    this._rebuildConstructDock();
    this._setupUI();
    this._setupDualHandTracking();
    this._setupKeyBindings();
    this._animate();
  }

  /* ---------------- scene ---------------- */

  _setupThreeScene() {
    const canvas = document.getElementById('gl-canvas');
    const hudCanvas = document.getElementById('hud-canvas');
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvas.width = w;
    canvas.height = h;
    if (hudCanvas) {
      hudCanvas.width = w;
      hudCanvas.height = h;
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene = new THREE.Scene();

    // 1:1 pixel-space orthographic camera
    this.camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 4000);
    this.camera.position.set(0, 0, 1000);
    this.camera.lookAt(0, 0, 0);

    // Dynamic lighting (colours follow the active corps)
    this.ambientLight = new THREE.AmbientLight(0x0c3319, 2.8);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    this.keyLight.position.set(300, 400, 500);
    this.scene.add(this.keyLight);

    this.corpsLight = new THREE.DirectionalLight(this.corps.body, 3.5);
    this.corpsLight.position.set(-300, -200, 400);
    this.scene.add(this.corpsLight);

    window.addEventListener('resize', () => this._onWindowResize());
  }

  _setupAudioAndVFX() {
    this.audio = new LanternAudioEngine();
    this.audio.setCorps(this.corps);
    this.ring = new LanternRing(this.scene, this.corps);
    this.constructs = new LanternConstructs(this.scene, this.corps);
    this.vfx = new LanternVFX(this.scene, this.corps);
  }

  /* ---------------- corps switching ---------------- */

  _setupCorpsSelector() {
    // Two identical pickers: one in the HUD, one on the splash modal, so the
    // corps can be chosen before the first oath is spoken.
    ['corps-grid', 'splash-corps-grid'].forEach(gridId => {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      grid.innerHTML = '';

      Object.keys(window.CORPS).forEach(key => {
        const corps = window.CORPS[key];
        const btn = document.createElement('button');
        btn.className = 'corps-btn' + (key === this.corpsKey ? ' active' : '');
        btn.setAttribute('data-corps', key);
        btn.style.setProperty('--c', corps.glowHeavy);
        btn.style.setProperty('--c-body', '#' + corps.body.toString(16).padStart(6, '0'));
        btn.style.setProperty('--c-deep', '#' + corps.deep.toString(16).padStart(6, '0'));
        btn.title = `${corps.label} — ${corps.emotion}`;
        btn.innerHTML =
          `<span class="corps-dot"></span>` +
          `<span class="corps-name">${corps.emotion}</span>`;
        btn.addEventListener('click', () => this.setCorps(key));
        grid.appendChild(btn);
      });
    });
  }

  setCorps(key) {
    const corps = window.CORPS[key];
    if (!corps || key === this.corpsKey) return;

    this.audio.stopOath();

    this.corpsKey = key;
    this.corps = corps;
    this.audio.stopOath();

    // Rebuild every colour-dependent subsystem
    this.audio.setCorps(corps);
    this.ring.setPalette(corps);
    this.constructs.setPalette(corps);
    this.vfx.setPalette(corps);
    if (this.tracker) this.tracker.setPalette(corps);

    this.ambientLight.color.set(corps.deep);
    this.corpsLight.color.set(corps.body);

    this._applyTheme();
    this._rebuildConstructDock();

    // Default to the corps' first construct
    this.selectConstruct(corps.constructs[0]);

    // The oath is spoken once per corps, when the ring first locks on.
    this.hasOathPlayedOnce = false;

    this.audio.playChime();
  }

  /** Push the palette into CSS custom properties so the whole UI re-themes. */
  _applyTheme() {
    const p = this.corps;
    const root = document.documentElement.style;
    root.setProperty('--gl-emerald', '#' + p.body.toString(16).padStart(6, '0'));
    root.setProperty('--gl-bright', '#' + p.bright.toString(16).padStart(6, '0'));
    root.setProperty('--gl-deep', '#' + p.deep.toString(16).padStart(6, '0'));
    root.setProperty('--gl-dark', '#' + p.body.toString(16).padStart(6, '0'));
    root.setProperty('--gl-glow', p.glow);
    root.setProperty('--gl-glow-heavy', p.glowHeavy);
    root.setProperty('--gl-dark-text', p.darkText);
    root.setProperty('--gl-flash', p.flashCss);

    const title = document.getElementById('corps-title');
    if (title) title.textContent = p.label;

    const sub = document.getElementById('corps-subtitle');
    if (sub) sub.textContent = `${p.sector} • ${p.emotion} PROTOCOL`;

    const splashTitle = document.getElementById('splash-title');
    if (splashTitle) splashTitle.textContent = `${p.emotion} PROTOCOL ACTIVATED`;

    const hook = document.getElementById('splash-hookline');
    if (hook) hook.textContent = p.hookline;

    // Oath subtitle lines
    const lines = document.getElementById('oath-lines');
    if (lines) {
      lines.innerHTML = p.oath.lines
        .map((text, i) => `<div id="oath-line-${i + 1}" class="oath-line">${text}</div>`)
        .join('');
    }

    document.querySelectorAll('.corps-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-corps') === this.corpsKey);
    });
  }

  _rebuildConstructDock() {
    const wrap = document.querySelector('.construct-buttons');
    if (!wrap) return;
    wrap.innerHTML = '';

    this.corps.constructs.forEach((type, i) => {
      const def = window.CONSTRUCT_LIBRARY[type];
      const btn = document.createElement('button');
      btn.className = 'construct-btn' + (i === 0 ? ' active' : '');
      btn.setAttribute('data-construct', type);
      btn.title = `Press ${i + 1}: ${def.name}`;
      btn.innerHTML = `<span>${def.emoji}</span><span>${def.name}</span>`;
      btn.addEventListener('click', () => this.selectConstruct(type));
      wrap.appendChild(btn);
    });
  }

  selectConstruct(type) {
    if (!this.constructs) return;
    this.constructs.setConstructType(type);
    document.querySelectorAll('.construct-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-construct') === type);
    });
  }

  /* ---------------- tracking ---------------- */

  _setupDualHandTracking() {
    const video = document.getElementById('webcam-video');
    const hudCanvas = document.getElementById('hud-canvas');

    this.tracker = new HandTracker(video, hudCanvas, {
      onRingHandTracked: (pos, bone, normal, scale) => {
        const wasVisible = this.isRingHandVisible;
        this.isRingHandVisible = true;
        this._updateTrackingHUD(true, this.isConstructHandVisible);

        this.ring.updateTransform(pos, bone, normal, scale);

        if (!wasVisible) {
          this.vfx.triggerBurst(pos);
          if (!this.hasOathPlayedOnce) {
            this.hasOathPlayedOnce = true;
            this.triggerOath();
          }
        }
      },
      onRingHandLost: () => {
        this.isRingHandVisible = false;
        this._updateTrackingHUD(false, this.isConstructHandVisible);
        this.ring.updateTransform(null, null, null, 0);
      },

      onConstructHandTracked: (pos, normal, scale, isPunching) => {
        this.isConstructHandVisible = true;
        this._updateTrackingHUD(this.isRingHandVisible, true);

        this.constructs.updateTransform(pos, normal, scale, isPunching);

        if (isPunching) {
          const now = Date.now();
          if (now - this.lastPunchTime > 380) {
            this.lastPunchTime = now;
            this._handleConstructAttack();
          }
        }
      },
      onConstructHandLost: () => {
        this.isConstructHandVisible = false;
        this._updateTrackingHUD(this.isRingHandVisible, false);
        this.constructs.updateTransform(null, null, 0, false);
      },

      onConstructGesture: () => { /* handled in onConstructHandTracked */ }
    }, this.corps);

    this.tracker.setPalette(this.corps);
  }

  _handleConstructAttack() {
    const sfx = this.constructs.getSfxKey();
    this.audio.playSfx(sfx);

    const shake = {
      impact: 350, clang: 200, roar: 320, terror: 300,
      death: 280, slash: 250, shot: 150, whoosh: 160, throw: 120, chime: 0
    }[sfx] || 200;

    if (shake) this._shakeScreen(shake);
    if (['impact', 'roar', 'death', 'chime'].includes(sfx)) this.vfx.triggerImpactFlash();
  }

  /* ---------------- UI ---------------- */

  _setupUI() {
    const awakenBtn = document.getElementById('awaken-btn');
    const splash = document.getElementById('splash-overlay');
    const oathBtn = document.getElementById('btn-recite-oath');
    const slamBtn = document.getElementById('btn-slam-construct');
    const muteBtn = document.getElementById('btn-mute');
    const demoBtn = document.getElementById('btn-demo');
    const mirrorBtn = document.getElementById('btn-mirror');
    const fingerSelect = document.getElementById('finger-select');

    awakenBtn.addEventListener('click', async () => {
      await this.audio.init();
      splash.classList.add('hidden');
      await this.tracker.start();
    });

    oathBtn.addEventListener('click', () => this.triggerOath());

    slamBtn.addEventListener('click', () => {
      this._handleConstructAttack();
      this.constructs.punchOffset = 120;
    });

    muteBtn.addEventListener('click', () => {
      const isMuted = this.audio.toggleMute();
      muteBtn.classList.toggle('active', isMuted);
      muteBtn.querySelector('.btn-text').textContent = isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO';
    });

    demoBtn.addEventListener('click', () => {
      if (this.tracker.isDemoMode) {
        this.tracker.stopDemoMode();
        demoBtn.classList.remove('active');
        demoBtn.querySelector('.btn-text').textContent = 'DEMO MODE: OFF';
      } else {
        this.tracker.startDemoMode();
        demoBtn.classList.add('active');
        demoBtn.querySelector('.btn-text').textContent = 'DEMO MODE: ON';
      }
    });

    mirrorBtn.addEventListener('click', () => {
      const video = document.getElementById('webcam-video');
      const isMirrored = !video.classList.contains('unmirrored');
      if (isMirrored) {
        video.classList.add('unmirrored');
        this.tracker.setMirrored(false);
        mirrorBtn.querySelector('.btn-text').textContent = 'MIRROR: OFF';
      } else {
        video.classList.remove('unmirrored');
        this.tracker.setMirrored(true);
        mirrorBtn.querySelector('.btn-text').textContent = 'MIRROR: ON';
      }
    });

    fingerSelect.addEventListener('change', (e) => this.tracker.setFinger(e.target.value));
  }

  /* ---------------- keyboard ---------------- */

  _setupKeyBindings() {
    window.addEventListener('keydown', (e) => {
      // 1-5 select constructs within the active corps
      const idx = parseInt(e.key, 10);
      if (idx >= 1 && idx <= this.corps.constructs.length) {
        this.selectConstruct(this.corps.constructs[idx - 1]);
        this.audio.playChime();
        return;
      }

      // Q/E cycle corps
      if (e.key === 'q' || e.key === 'Q') {
        this._cycleCorps(-1);
        return;
      }
      if (e.key === 'e' || e.key === 'E') {
        this._cycleCorps(1);
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        this._handleConstructAttack();
      }
    });
  }

  _cycleCorps(dir) {
    const keys = Object.keys(window.CORPS);
    const current = keys.indexOf(this.corpsKey);
    const next = (current + dir + keys.length) % keys.length;
    this.setCorps(keys[next]);
  }

  _updateTrackingHUD(isRingTracked, isConstructTracked) {
    const dot = document.getElementById('tracking-dot');
    const label = document.getElementById('tracking-status-text');
    const fill = document.querySelector('.gauge-bar-fill');
    const gauge = document.getElementById('gauge-label');
    if (!dot || !label) return;

    if (isRingTracked && isConstructTracked) {
      dot.classList.add('active');
      label.textContent = 'DUAL LINK: RING & CONSTRUCT ACTIVE';
      if (fill) fill.style.width = '100%';
      if (gauge) gauge.textContent = `${this.corps.emotion} CHARGE: 100%`;
    } else if (isRingTracked) {
      dot.classList.add('active');
      label.textContent = 'RING LOCKED (RAISE 2ND HAND FOR PROJECTION)';
      if (fill) fill.style.width = '75%';
      if (gauge) gauge.textContent = `${this.corps.emotion} CHARGE: 75%`;
    } else {
      dot.classList.remove('active');
      label.textContent = 'SCANNING FOR HANDS...';
      if (fill) fill.style.width = '30%';
      if (gauge) gauge.textContent = `${this.corps.emotion} CHARGE: 30%`;
    }
  }

  _shakeScreen(durationMs) {
    const container = document.getElementById('app-container');
    if (!container) return;
    container.classList.add('screen-shake');
    setTimeout(() => container.classList.remove('screen-shake'), durationMs);
  }

  triggerOath() {
    const corps = this.corps;
    const lines = corps.oath.lines.map((_, i) => document.getElementById(`oath-line-${i + 1}`));

    lines.forEach(el => { if (el) el.className = 'oath-line'; });

    this.audio.playOath((lineIdx, text, isDone, isClimax) => {
      if (isDone) {
        setTimeout(() => {
          lines.forEach(el => { if (el) el.className = 'oath-line completed'; });
        }, 1200);
        return;
      }

      if (isClimax) {
        this._shakeScreen(2400);
        this.vfx.triggerImpactFlash();
      }

      lines.forEach((el, idx) => {
        if (!el) return;
        if (idx === lineIdx) {
          el.className = 'oath-line active' + (isClimax ? ' climax' : '');
        } else if (idx < lineIdx) {
          el.className = 'oath-line completed';
        } else {
          el.className = 'oath-line';
        }
      });
    });
  }

  _onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const canvas = document.getElementById('gl-canvas');
    const hudCanvas = document.getElementById('hud-canvas');
    canvas.width = w;
    canvas.height = h;
    if (hudCanvas) {
      hudCanvas.width = w;
      hudCanvas.height = h;
    }

    this.camera.left = -w / 2;
    this.camera.right = w / 2;
    this.camera.top = h / 2;
    this.camera.bottom = -h / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(w, h);
  }

  _animate() {
    requestAnimationFrame(() => this._animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.tracker && this.tracker.isDemoMode) this.tracker.tickDemo(delta);
    if (this.ring) this.ring.tick(delta, time);

    if (this.constructs) {
      this.constructs.tick(delta, time);
      if (this.ring) {
        this.constructs.updateTether(this.ring.getPosition(), this.constructs.getPosition(), time);
      }
    }

    if (this.vfx && this.ring) {
      this.vfx.update(delta, time, this.ring.getPosition(), this.ring.isManifested());
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new GreenLanternApp();
});
