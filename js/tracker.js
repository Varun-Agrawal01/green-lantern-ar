/**
 * EMERALD CORPS AR: DUAL-HAND TRACKER & KINEMATICS ENGINE
 * Supports 2 hands simultaneously:
 *   Hand 1: Wears the Power Ring (middle finger by default)
 *   Hand 2: Projects the 3D Construct
 */

class HandTracker {
  constructor(videoElement, hudCanvasElement, callbacks, palette) {
    this.video = videoElement;
    this.hudCanvas = hudCanvasElement;
    this.hudCtx = hudCanvasElement ? hudCanvasElement.getContext('2d') : null;
    this.palette = palette || window.CORPS_PALETTES.green;

    // Callbacks
    this.onRingHandTracked = callbacks.onRingHandTracked;
    this.onRingHandLost = callbacks.onRingHandLost;
    this.onConstructHandTracked = callbacks.onConstructHandTracked;
    this.onConstructHandLost = callbacks.onConstructHandLost;
    this.onConstructGesture = callbacks.onConstructGesture;

    this.hands = null;
    this.camera = null;
    this.isTracking = false;
    this.isMirrored = true;
    this.selectedFinger = 'middle';

    // Landmark index map
    this.fingerIndices = {
      middle: { mcp: 9, pip: 10, tip: 12 },
      index: { mcp: 5, pip: 6, tip: 8 },
      ring: { mcp: 13, pip: 14, tip: 16 }
    };

    // Connections for cybernetic hand skeleton HUD
    this.connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],         // Thumb
      [0, 5], [5, 6], [6, 7], [7, 8],         // Index
      [0, 9], [9, 10], [10, 11], [11, 12],    // Middle
      [0, 13], [13, 14], [14, 15], [15, 16],  // Ring
      [0, 17], [17, 18], [18, 19], [19, 20],  // Pinky
      [5, 9], [9, 13], [13, 17], [0, 17]      // Palm base
    ];

    // Filtered smoothed values for Hand 1 (Ring)
    this.smoothedRingPos = null;
    this.smoothedRingBone = null;
    this.smoothedRingNormal = null;
    this.smoothedRingScale = 0;

    // Filtered smoothed values for Hand 2 (Construct)
    this.smoothedConstPos = null;
    this.smoothedConstNormal = null;
    this.smoothedConstScale = 0;

    this.alpha = 0.52; // Responsive smoothing

    // Demo simulation mode
    this.isDemoMode = false;
    this.demoTime = 0;
    this.mousePos = { x: window.innerWidth * 0.65, y: window.innerHeight * 0.5 };
    this.isDemoSecondHandActive = true;

    // Reticle animation
    this.reticleAngle = 0;

    this._setupDemoListeners();
  }

  setFinger(fingerName) {
    if (this.fingerIndices[fingerName]) this.selectedFinger = fingerName;
  }

  setMirrored(mirrored) {
    this.isMirrored = mirrored;
  }

  /** Recolour the HUD skeleton + reticle for a new corps. */
  setPalette(palette) {
    this.palette = palette;
  }

  _hex(color) {
    return '#' + color.toString(16).padStart(6, '0');
  }

  /**
   * Initializes MediaPipe Hands configured for 2 HANDS!
   */
  async start() {
    if (this.isTracking) return;

    if (typeof Hands === 'undefined') {
      console.warn('MediaPipe Hands library not loaded; launching demo mode.');
      this.startDemoMode();
      return;
    }

    try {
      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.60,
        minTrackingConfidence: 0.60
      });

      this.hands.onResults((results) => this._processResults(results));

      if (typeof Camera !== 'undefined') {
        this.camera = new Camera(this.video, {
          onFrame: async () => {
            if (this.isTracking && !this.isDemoMode) {
              await this.hands.send({ image: this.video });
            }
          },
          width: 1280,
          height: 720
        });
        await this.camera.start();
        this.isTracking = true;
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: 'user' }
        });
        this.video.srcObject = stream;
        await this.video.play();
        this.isTracking = true;
        this._startVideoLoop();
      }
    } catch (err) {
      console.error('Camera access failed or denied:', err);
      this.startDemoMode();
    }
  }

  _startVideoLoop() {
    const loop = async () => {
      if (this.isTracking && !this.isDemoMode && this.video.readyState >= 2) {
        await this.hands.send({ image: this.video });
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  _processResults(results) {
    if (this.hudCtx) {
      this.hudCtx.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height);
    }

    const handCount = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;

    if (handCount === 0) {
      this.smoothedRingPos = null;
      this.smoothedConstPos = null;
      if (this.onRingHandLost) this.onRingHandLost();
      if (this.onConstructHandLost) this.onConstructHandLost();
      return;
    }

    // Hand roles: with 2 hands, the one further right (mirrored view) is the
    // ring hand; the other projects constructs.
    let ringHandIndex = 0;
    let constHandIndex = -1;

    if (handCount >= 2) {
      const h0 = results.multiHandLandmarks[0][0].x;
      const h1 = results.multiHandLandmarks[1][0].x;
      if (h0 > h1) {
        ringHandIndex = 0;
        constHandIndex = 1;
      } else {
        ringHandIndex = 1;
        constHandIndex = 0;
      }
    }

    this._solveRingHand(results.multiHandLandmarks[ringHandIndex]);

    if (constHandIndex >= 0) {
      this._solveConstructHand(results.multiHandLandmarks[constHandIndex]);
    } else {
      this.smoothedConstPos = null;
      if (this.onConstructHandLost) this.onConstructHandLost();
    }
  }

  _toScreenAndThree(landmarks) {
    const vw = this.video.videoWidth || 1280;
    const vh = this.video.videoHeight || 720;
    const cw = window.innerWidth;
    const ch = window.innerHeight;

    const videoAspect = vw / vh;
    const containerAspect = cw / ch;
    let renderW, renderH, offX, offY;

    if (containerAspect > videoAspect) {
      renderW = cw;
      renderH = cw / videoAspect;
      offX = 0;
      offY = (ch - renderH) / 2;
    } else {
      renderH = ch;
      renderW = ch * videoAspect;
      offX = (cw - renderW) / 2;
      offY = 0;
    }

    const screenPoints = [];
    const threePoints = [];

    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i];
      const nx = this.isMirrored ? (1.0 - lm.x) : lm.x;
      const px = offX + nx * renderW;
      const py = offY + lm.y * renderH;
      screenPoints.push({ x: px, y: py });

      threePoints.push(new THREE.Vector3(
        px - cw / 2,
        -(py - ch / 2),
        -lm.z * renderW * 0.75
      ));
    }

    return { screenPoints, threePoints };
  }

  _solveRingHand(landmarks) {
    const { screenPoints, threePoints } = this._toScreenAndThree(landmarks);
    this._drawHandHUD(screenPoints, this._hex(this.palette.body), 'RING HAND');

    const indices = this.fingerIndices[this.selectedFinger];
    const pMcp = threePoints[indices.mcp];
    const pPip = threePoints[indices.pip];
    const pIndexMcp = threePoints[5];
    const pPinkyMcp = threePoints[17];

    const rawPos = new THREE.Vector3().lerpVectors(pMcp, pPip, 0.36);
    const rawBone = new THREE.Vector3().subVectors(pPip, pMcp).normalize();

    const vA = new THREE.Vector3().subVectors(pIndexMcp, pMcp);
    const vB = new THREE.Vector3().subVectors(pPinkyMcp, pMcp);
    let rawNormal = new THREE.Vector3().crossVectors(vA, vB).normalize();
    if (rawNormal.z < 0) rawNormal.negate();

    const fingerPx = pMcp.distanceTo(pPip);
    const rawScale = Math.max(0.6, Math.min(2.5, fingerPx / 50.0));

    if (!this.smoothedRingPos) {
      this.smoothedRingPos = rawPos.clone();
      this.smoothedRingBone = rawBone.clone();
      this.smoothedRingNormal = rawNormal.clone();
      this.smoothedRingScale = rawScale;
    } else {
      this.smoothedRingPos.lerp(rawPos, this.alpha);
      this.smoothedRingBone.lerp(rawBone, this.alpha).normalize();
      this.smoothedRingNormal.lerp(rawNormal, this.alpha).normalize();
      this.smoothedRingScale += (rawScale - this.smoothedRingScale) * this.alpha;
    }

    this._drawTargetReticle(
      this.smoothedRingPos.x + window.innerWidth / 2,
      -this.smoothedRingPos.y + window.innerHeight / 2,
      this.smoothedRingScale
    );

    if (this.onRingHandTracked) {
      this.onRingHandTracked(this.smoothedRingPos, this.smoothedRingBone, this.smoothedRingNormal, this.smoothedRingScale);
    }
  }

  _solveConstructHand(landmarks) {
    const { screenPoints, threePoints } = this._toScreenAndThree(landmarks);
    this._drawHandHUD(screenPoints, this._hex(this.palette.bright), 'CONSTRUCT CASTER');

    const pWrist = threePoints[0];
    const pMiddleMcp = threePoints[9];
    const pIndexMcp = threePoints[5];
    const pPinkyMcp = threePoints[17];

    const palmCenter = new THREE.Vector3().lerpVectors(pWrist, pMiddleMcp, 0.55);
    const vA = new THREE.Vector3().subVectors(pIndexMcp, pMiddleMcp);
    const vB = new THREE.Vector3().subVectors(pPinkyMcp, pMiddleMcp);
    let palmNormal = new THREE.Vector3().crossVectors(vA, vB).normalize();
    if (palmNormal.z < 0) palmNormal.negate();

    const rawPos = palmCenter.clone().add(palmNormal.clone().multiplyScalar(45));
    const handSpan = pWrist.distanceTo(pMiddleMcp);
    const rawScale = Math.max(0.7, Math.min(2.8, handSpan / 80.0));

    if (!this.smoothedConstPos) {
      this.smoothedConstPos = rawPos.clone();
      this.smoothedConstNormal = palmNormal.clone();
      this.smoothedConstScale = rawScale;
    } else {
      this.smoothedConstPos.lerp(rawPos, this.alpha);
      this.smoothedConstNormal.lerp(palmNormal, this.alpha).normalize();
      this.smoothedConstScale += (rawScale - this.smoothedConstScale) * this.alpha;
    }

    const isFist = this._isHandClenched(landmarks);
    if (this.onConstructGesture) this.onConstructGesture(isFist);
    if (this.onConstructHandTracked) {
      this.onConstructHandTracked(this.smoothedConstPos, this.smoothedConstNormal, this.smoothedConstScale, isFist);
    }
  }

  _isHandClenched(landmarks) {
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20];
    const mcps = [5, 9, 13, 17];
    const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    let curled = 0;
    for (let i = 0; i < 4; i++) {
      if (dist(landmarks[tips[i]], wrist) < dist(landmarks[mcps[i]], wrist) * 1.1) curled++;
    }
    return curled >= 3;
  }

  _drawHandHUD(points, color, labelText) {
    if (!this.hudCtx) return;
    const ctx = this.hudCtx;

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;

    for (let c = 0; c < this.connections.length; c++) {
      const [i1, i2] = this.connections[c];
      ctx.beginPath();
      ctx.moveTo(points[i1].x, points[i1].y);
      ctx.lineTo(points[i2].x, points[i2].y);
      ctx.stroke();
    }

    for (let i = 0; i < points.length; i++) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(points[i].x, points[i].y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (points[0]) {
      ctx.font = '10px Orbitron, sans-serif';
      ctx.fillStyle = color;
      ctx.fillText(labelText, points[0].x - 30, points[0].y + 24);
    }
  }

  _drawTargetReticle(x, y, scale) {
    if (!this.hudCtx) return;
    const ctx = this.hudCtx;
    this.reticleAngle += 0.04;
    const r = 26 * scale;
    const color = this._hex(this.palette.body);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.reticleAngle);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;

    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.arc(0, 0, r, i * Math.PI * 0.5, i * Math.PI * 0.5 + Math.PI * 0.35);
      ctx.stroke();
    }
    ctx.restore();
  }

  _setupDemoListeners() {
    window.addEventListener('mousemove', (e) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
    });
  }

  startDemoMode() {
    this.isDemoMode = true;
  }

  stopDemoMode() {
    this.isDemoMode = false;
  }

  /** Demo mode simulating both hands from the cursor. */
  tickDemo(delta) {
    if (!this.isDemoMode) return;
    this.demoTime += delta;

    if (this.hudCtx) {
      this.hudCtx.clearRect(0, 0, this.hudCanvas.width, this.hudCanvas.height);
    }

    const cw = window.innerWidth;
    const ch = window.innerHeight;

    // Hand 1 (Ring) follows mouse
    const rX = this.mousePos.x - cw / 2;
    const rY = -(this.mousePos.y - ch / 2) + Math.sin(this.demoTime * 2.2) * 10;
    const ringPos = new THREE.Vector3(rX, rY, -30);
    const ringBone = new THREE.Vector3(0.1, 1, 0.1).normalize();
    const ringNormal = new THREE.Vector3(0, 0, 1);
    const ringScale = 1.35;

    this._drawTargetReticle(this.mousePos.x, this.mousePos.y, ringScale);
    if (this.onRingHandTracked) {
      this.onRingHandTracked(ringPos, ringBone, ringNormal, ringScale);
    }

    // Hand 2 (Construct) floats to the left and punches periodically
    if (this.isDemoSecondHandActive) {
      const cX = rX - 280 + Math.sin(this.demoTime * 1.5) * 30;
      const cY = rY + Math.cos(this.demoTime * 1.8) * 25;
      const constPos = new THREE.Vector3(cX, cY, -20);
      const constNormal = new THREE.Vector3(0.2, 0.1, 0.95).normalize();

      const isPunching = (Math.sin(this.demoTime * 3) > 0.4);
      if (this.onConstructGesture) this.onConstructGesture(isPunching);
      if (this.onConstructHandTracked) {
        this.onConstructHandTracked(constPos, constNormal, 1.4, isPunching);
      }
    }
  }
}

window.HandTracker = HandTracker;
