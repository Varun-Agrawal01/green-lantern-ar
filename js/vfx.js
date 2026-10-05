/**
 * EMERALD CORPS AR: VISUAL EFFECTS
 * Willpower sparks, manifestation shockwaves and impact flashes.
 * All colours come from the active corps palette.
 */

class LanternVFX {
  constructor(scene, palette) {
    this.scene = scene;
    this.palette = palette || window.CORPS_PALETTES.green;

    this.sparksCount = 120;
    this.sparkData = [];

    this.burstMesh = null;
    this.burstScale = 0;
    this.burstOpacity = 0;

    this._initOrbitingSparks();
    this._initBurstShockwave();
  }

  _initOrbitingSparks() {
    const p = this.palette;

    this.sparksGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.sparksCount * 3);
    const colors = new Float32Array(this.sparksCount * 3);

    const baseColor = new THREE.Color(p.spark);
    const brightColor = new THREE.Color(p.bright);

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

    this.sparksMaterial = this._makeSparkMaterial(baseColor);
    this.sparksPoints = new THREE.Points(this.sparksGeometry, this.sparksMaterial);
    this.sparksPoints.visible = false;
    this.scene.add(this.sparksPoints);
  }

  _makeSparkMaterial(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.9)`);
    grad.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, 0.2)`);
    grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    return new THREE.PointsMaterial({
      size: 14,
      map: new THREE.CanvasTexture(canvas),
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
  }

  _initBurstShockwave() {
    const geo = new THREE.RingGeometry(2, 6, 48);
    this.burstMesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: this.palette.bright,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    }));
    this.burstMesh.visible = false;
    this.scene.add(this.burstMesh);
  }

  /** Recolour the particle field and shockwave for a new corps. */
  setPalette(palette) {
    this.palette = palette;

    this.scene.remove(this.sparksPoints);
    this.sparksGeometry.dispose();
    if (this.sparksMaterial) this.sparksMaterial.map.dispose();
    this.sparksMaterial = null;
    this.sparkData = [];
    this.sparksPoints = null;
    this._initOrbitingSparks();

    this.burstMesh.material.color.set(palette.bright);
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
    if (isRingVisible && ringPosition && this.sparksPoints) {
      this.sparksPoints.visible = true;
      const positions = this.sparksGeometry.attributes.position.array;

      for (let i = 0; i < this.sparksCount; i++) {
        const d = this.sparkData[i];
        d.theta += d.speed * delta * 2.2;
        d.phi += d.speed * delta * 1.1;

        positions[i * 3] = ringPosition.x + d.radius * Math.sin(d.phi) * Math.cos(d.theta);
        positions[i * 3 + 1] = ringPosition.y + d.radius * Math.sin(d.phi) * Math.sin(d.theta);
        positions[i * 3 + 2] = ringPosition.z + d.radius * Math.cos(d.phi);
      }
      this.sparksGeometry.attributes.position.needsUpdate = true;
    } else if (this.sparksPoints) {
      this.sparksPoints.visible = false;
    }

    if (this.burstOpacity > 0.01) {
      this.burstScale += delta * 180;
      this.burstOpacity -= delta * 2.2;
      this.burstMesh.scale.set(this.burstScale, this.burstScale, 1);
      this.burstMesh.material.opacity = Math.max(0, this.burstOpacity);
      if (this.burstOpacity <= 0.01) this.burstMesh.visible = false;
    }
  }
}

window.LanternVFX = LanternVFX;
