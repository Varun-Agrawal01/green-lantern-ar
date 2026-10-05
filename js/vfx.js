/**
 * GREEN LANTERN AR - WILLPOWER VISUAL EFFECTS (VFX)
 * High-performance willpower sparks, manifestation shockwaves, and construct impact effects.
 * (Generic laser blast removed in favor of authentic animated show constructs).
 */

class LanternVFX {
  constructor(scene) {
    this.scene = scene;

    // Orbiting Willpower Particles
    this.sparksCount = 120;
    this.sparksGeometry = null;
    this.sparksMaterial = null;
    this.sparksPoints = null;
    this.sparkData = [];

    // Burst Shockwave
    this.burstMesh = null;
    this.burstScale = 0;
    this.burstOpacity = 0;

    this._initOrbitingSparks();
    this._initBurstShockwave();
  }

  _initOrbitingSparks() {
    this.sparksGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.sparksCount * 3);
    const colors = new Float32Array(this.sparksCount * 3);

    const baseColor = new THREE.Color(0x00ff88);
    const brightColor = new THREE.Color(0xa8ffd9);

    for (let i = 0; i < this.sparksCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const c = Math.random() > 0.35 ? baseColor : brightColor;
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      this.sparkData.push({
        radius: 18 + Math.random() * 26,
        speed: (Math.random() * 2.5 + 1.2) * (Math.random() > 0.5 ? 1 : -1),
        theta: Math.random() * Math.PI * 2,
        phi: Math.random() * Math.PI,
        size: Math.random() * 6 + 4
      });
    }

    this.sparksGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.sparksGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, 'rgba(0, 255, 136, 0.9)');
    grad.addColorStop(0.8, 'rgba(0, 255, 136, 0.2)');
    grad.addColorStop(1, 'rgba(0, 255, 136, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);

    this.sparksMaterial = new THREE.PointsMaterial({
      size: 14,
      map: texture,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.sparksPoints = new THREE.Points(this.sparksGeometry, this.sparksMaterial);
    this.sparksPoints.visible = false;
    this.scene.add(this.sparksPoints);
  }

  _initBurstShockwave() {
    const geo = new THREE.RingGeometry(2, 6, 48);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x5effb8,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    this.burstMesh = new THREE.Mesh(geo, mat);
    this.burstMesh.visible = false;
    this.scene.add(this.burstMesh);
  }

  triggerBurst(position) {
    if (!position) return;
    this.burstMesh.position.copy(position);
    this.burstScale = 1;
    this.burstOpacity = 1;
    this.burstMesh.scale.set(1, 1, 1);
    this.burstMesh.visible = true;
  }

  triggerImpactFlash() {
    const flash = document.getElementById('blast-flash');
    if (flash) {
      flash.classList.add('firing');
      setTimeout(() => flash.classList.remove('firing'), 350);
    }
  }

  update(delta, time, ringPosition, isRingVisible) {
    if (isRingVisible && ringPosition) {
      this.sparksPoints.visible = true;
      const positions = this.sparksGeometry.attributes.position.array;

      for (let i = 0; i < this.sparksCount; i++) {
        const d = this.sparkData[i];
        d.theta += d.speed * delta * 2.2;
        d.phi += d.speed * delta * 1.1;

        const x = ringPosition.x + d.radius * Math.sin(d.phi) * Math.cos(d.theta);
        const y = ringPosition.y + d.radius * Math.sin(d.phi) * Math.sin(d.theta);
        const z = ringPosition.z + d.radius * Math.cos(d.phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
      }
      this.sparksGeometry.attributes.position.needsUpdate = true;
    } else {
      this.sparksPoints.visible = false;
    }

    if (this.burstOpacity > 0.01) {
      this.burstScale += delta * 180;
      this.burstOpacity -= delta * 2.2;
      this.burstMesh.scale.set(this.burstScale, this.burstScale, 1);
      this.burstMesh.material.opacity = Math.max(0, this.burstOpacity);
      if (this.burstOpacity <= 0.01) {
        this.burstMesh.visible = false;
      }
    }
  }
}

window.LanternVFX = LanternVFX;
