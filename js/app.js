/**
 * GREEN LANTERN AR - MASTER DUAL-HAND APPLICATION CONTROLLER
 * Coordinates Hand 1 (Ring), Hand 2 (3D Construct), Energy Tether, Natural Voice Oath, and UI.
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

    this.clock = new THREE.Clock();
    this.hasOathPlayedOnce = false;
    this.isRingHandVisible = false;
    this.isConstructHandVisible = false;
    this.lastPunchTime = 0;

    this.init();
  }

  async init() {
    this._setupThreeScene();
    this._setupAudioAndVFX();
    this._setupUI();
    this._setupDualHandTracking();
    this._setupKeyBindings();
    this._animate();
  }

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

    // 1:1 Pixel Space Orthographic Camera
    this.camera = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, 4000);
    this.camera.position.set(0, 0, 1000);
    this.camera.lookAt(0, 0, 0);

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0x0c3319, 2.8);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dirLight1.position.set(300, 400, 500);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00ff88, 3.5);
    dirLight2.position.set(-300, -200, 400);
    this.scene.add(dirLight2);

    window.addEventListener('resize', () => this._onWindowResize());
  }

  _setupAudioAndVFX() {
    this.audio = new LanternAudioEngine();
    this.ring = new LanternRing(this.scene);
    this.constructs = new LanternConstructs(this.scene);
    this.vfx = new LanternVFX(this.scene);
  }

  _setupDualHandTracking() {
    const video = document.getElementById('webcam-video');
    const hudCanvas = document.getElementById('hud-canvas');

    this.tracker = new HandTracker(video, hudCanvas, {
      // Hand 1 (Ring Hand)
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

      // Hand 2 (Construct Projection Hand)
      onConstructHandTracked: (pos, normal, scale, isPunching) => {
        this.isConstructHandVisible = true;
        this._updateTrackingHUD(this.isRingHandVisible, true);

        this.constructs.updateTransform(pos, normal, scale, isPunching);

        // If user punches/clenches Hand 2, trigger dynamic SFX & impact
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

      // Gesture callback
      onConstructGesture: (isFist) => {
        // Handled in onConstructHandTracked
      }
    });
  }

  _handleConstructAttack() {
    const type = this.constructs.activeType;
    if (type === 'fist') {
      this.audio.playPunchImpact();
      this._shakeScreen(350);
      this.vfx.triggerImpactFlash();
    } else if (type === 'shield') {
      this.audio.playShieldClang();
      this._shakeScreen(200);
    } else if (type === 'battery') {
      this.audio.playChime();
      this.vfx.triggerImpactFlash();
    } else if (type === 'sword') {
      this.audio.playSwordSlash();
      this._shakeScreen(250);
    } else if (type === 'gatling') {
      this.audio.playGatlingShot();
      this._shakeScreen(150);
    }
  }

  _setupUI() {
    const awakenBtn = document.getElementById('awaken-btn');
    const splash = document.getElementById('splash-overlay');
    const oathBtn = document.getElementById('btn-recite-oath');
    const slamBtn = document.getElementById('btn-slam-construct');
    const muteBtn = document.getElementById('btn-mute');
    const demoBtn = document.getElementById('btn-demo');
    const mirrorBtn = document.getElementById('btn-mirror');
    const fingerSelect = document.getElementById('finger-select');

    // Awaken Power Ring
    awakenBtn.addEventListener('click', async () => {
      await this.audio.init();
      splash.classList.add('hidden');
      await this.tracker.start();
    });

    // Recite Oath manually
    oathBtn.addEventListener('click', () => {
      this.triggerOath();
    });

    // Slam / Activate Construct Button
    slamBtn.addEventListener('click', () => {
      this._handleConstructAttack();
      this.constructs.punchOffset = 120;
    });

    // Construct Selector Buttons
    document.querySelectorAll('.construct-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.construct-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const constructType = btn.getAttribute('data-construct');
        this.constructs.setConstructType(constructType);
        this.audio.playChime();
      });
    });

    // Mute toggle
    muteBtn.addEventListener('click', () => {
      const isMuted = this.audio.toggleMute();
      muteBtn.classList.toggle('active', isMuted);
      muteBtn.querySelector('.btn-text').textContent = isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO';
    });

    // Demo Mode toggle
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

    // Mirror Video toggle
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

    // Finger Selector
    fingerSelect.addEventListener('change', (e) => {
      this.tracker.setFinger(e.target.value);
    });
  }

  _setupKeyBindings() {
    window.addEventListener('keydown', (e) => {
      const constructKeys = {
        '1': 'fist',
        '2': 'shield',
        '3': 'battery',
        '4': 'sword',
        '5': 'gatling'
      };
      if (constructKeys[e.key]) {
        const type = constructKeys[e.key];
        this.constructs.setConstructType(type);
        document.querySelectorAll('.construct-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-construct') === type);
        });
        this.audio.playChime();
      } else if (e.code === 'Space') {
        this._handleConstructAttack();
      }
    });
  }

  _updateTrackingHUD(isRingTracked, isConstructTracked) {
    const dot = document.getElementById('tracking-dot');
    const label = document.getElementById('tracking-status-text');
    const fill = document.querySelector('.gauge-bar-fill');
    if (!dot || !label) return;

    if (isRingTracked && isConstructTracked) {
      dot.classList.add('active');
      label.textContent = 'DUAL LINK: RING & CONSTRUCT ACTIVE';
      if (fill) fill.style.width = '100%';
    } else if (isRingTracked) {
      dot.classList.add('active');
      label.textContent = 'RING LOCKED (RAISE 2ND HAND FOR PROJECTION)';
      if (fill) fill.style.width = '75%';
    } else {
      dot.classList.remove('active');
      label.textContent = 'SCANNING FOR HANDS...';
      if (fill) fill.style.width = '30%';
    }
  }

  _shakeScreen(durationMs) {
    const container = document.getElementById('app-container');
    if (!container) return;
    container.classList.add('screen-shake');
    setTimeout(() => {
      container.classList.remove('screen-shake');
    }, durationMs);
  }

  triggerOath() {
    const lines = [
      document.getElementById('oath-line-1'),
      document.getElementById('oath-line-2'),
      document.getElementById('oath-line-3'),
      document.getElementById('oath-line-4')
    ];

    lines.forEach(el => {
      if (el) el.className = 'oath-line';
    });

    this.audio.playOath((lineIdx, text, isDone, isClimax) => {
      if (isDone) {
        setTimeout(() => {
          lines.forEach(el => {
            if (el) el.className = 'oath-line completed';
          });
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

    if (this.tracker && this.tracker.isDemoMode) {
      this.tracker.tickDemo(delta);
    }

    // Tick Ring
    if (this.ring) {
      this.ring.tick(delta, time);
    }

    // Tick Constructs & Tether
    if (this.constructs) {
      this.constructs.tick(delta, time);
      if (this.ring) {
        this.constructs.updateTether(this.ring.getPosition(), this.constructs.getPosition(), time);
      }
    }

    // Tick VFX
    if (this.vfx && this.ring) {
      this.vfx.update(delta, time, this.ring.getPosition(), this.ring.isManifested());
    }

    // Render Scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new GreenLanternApp();
});
