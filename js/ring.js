/**
 * EMERALD CORPS AR: CINEMATIC 3D POWER RING
 * Highly detailed superhero signet ring with metallic corps-coloured alloy,
 * glowing insignia and an energy halo. The emissive insignia is driven from
 * the active corps palette, so the same ring reads as each emotional spectrum.
 */

class LanternRing {
  constructor(scene, palette) {
    this.scene = scene;
    this.palette = palette || window.CORPS_PALETTES.green;

    this.group = new THREE.Group();
    this.coreLight = null;
    this.emblemMaterials = [];
    this.lightningBolts = [];

    this.targetScale = 0;
    this.currentScale = 0;

    this._buildRing();
    this._buildLightningEffects();
    this.scene.add(this.group);
  }

  _buildRing() {
    const p = this.palette;
    const isDeath = p.key === 'black';
    // Black Lantern rings are necrotic bone and tarnished iron, not emerald;
    // White Lantern rings are pale ivory rather than metallic alloy.
    const alloyColor = isDeath ? 0x2a2436 : (p.key === 'white' ? 0xd8d2c4 : p.body);
    const darkSetting = isDeath ? 0x0a0810 : (p.key === 'white' ? 0x8a8478 : p.deep);
    const glowColor = isDeath ? p.bright : p.body;
    const metalness = isDeath ? 0.55 : (p.key === 'white' ? 0.3 : 0.88);
    const emissiveBase = isDeath ? 0.6 : (p.key === 'white' ? 1.2 : 0.5);

    const alloyMaterial = new THREE.MeshStandardMaterial({
      color: alloyColor,
      roughness: isDeath ? 0.7 : 0.18,
      metalness: metalness,
      emissive: isDeath ? 0x1a0f2e : p.deep,
      emissiveIntensity: emissiveBase
    });

    const darkSettingMaterial = new THREE.MeshStandardMaterial({
      color: darkSetting,
      roughness: 0.35,
      metalness: 0.75
    });

    const coreGlowMaterial = new THREE.MeshStandardMaterial({
      color: p.bright,
      emissive: glowColor,
      emissiveIntensity: isDeath ? 2.0 : 3.2,
      roughness: 0.05,
      metalness: 0.1
    });
    this.emblemMaterials.push(coreGlowMaterial);

    const brightSymbolMaterial = new THREE.MeshStandardMaterial({
      color: isDeath ? p.bright : 0xffffff,
      emissive: isDeath ? p.bright : p.body,
      emissiveIntensity: isDeath ? 2.4 : 2.8,
      roughness: 0.1,
      metalness: 0.5
    });
    this.emblemMaterials.push(brightSymbolMaterial);

    // 1. Main finger band (ergonomic contoured signet torus)
    const band = new THREE.Mesh(new THREE.TorusGeometry(18, 5.5, 32, 64), alloyMaterial);
    band.rotation.x = Math.PI / 2;
    this.group.add(band);

    const innerRim = new THREE.Mesh(new THREE.TorusGeometry(18, 2.5, 16, 64), darkSettingMaterial);
    innerRim.rotation.x = Math.PI / 2;
    this.group.add(innerRim);

    // 2. Heavy signet mount / bezel base
    const mount = new THREE.Mesh(new THREE.CylinderGeometry(13.5, 15.5, 7.5, 36), alloyMaterial);
    mount.position.set(0, 16.5, 0);
    this.group.add(mount);

    // 3. Stepped bezel collar
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(14.8, 14.2, 2.2, 36), darkSettingMaterial);
    collar.position.set(0, 20.2, 0);
    this.group.add(collar);

    // 4. Outer bezel frame rim
    const bezelRim = new THREE.Mesh(new THREE.TorusGeometry(13.2, 1.8, 16, 36), alloyMaterial);
    bezelRim.position.set(0, 21.0, 0);
    bezelRim.rotation.x = Math.PI / 2;
    this.group.add(bezelRim);

    // 5. Central faceted crystal lens
    const crystal = new THREE.Mesh(new THREE.CylinderGeometry(12.2, 12.2, 1.2, 36), coreGlowMaterial);
    crystal.position.set(0, 20.8, 0);
    this.group.add(crystal);

    // 6. Corps insignia in 3D relief. Every Emotional Spectrum emblem is a
    //    circle flanked by two bars; only the colour changes between corps.
    const emblemRing = new THREE.Mesh(new THREE.TorusGeometry(6.5, 1.2, 16, 36), brightSymbolMaterial);
    emblemRing.position.set(0, 21.6, 0);
    emblemRing.rotation.x = Math.PI / 2;
    this.group.add(emblemRing);

    const coreDot = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 16), brightSymbolMaterial);
    coreDot.position.set(0, 21.8, 0);
    this.group.add(coreDot);

    const barTop = new THREE.Mesh(new THREE.BoxGeometry(16.5, 1.6, 1.8), brightSymbolMaterial);
    barTop.position.set(0, 21.6, -7.0);
    this.group.add(barTop);

    const barBottom = new THREE.Mesh(new THREE.BoxGeometry(16.5, 1.6, 1.8), brightSymbolMaterial);
    barBottom.position.set(0, 21.6, 7.0);
    this.group.add(barBottom);

    // 7. Orbiting energy halo
    this.halo = new THREE.Mesh(
      new THREE.TorusGeometry(23, 0.7, 16, 48),
      new THREE.MeshBasicMaterial({
        color: p.bright,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      })
    );
    this.halo.position.set(0, 20.5, 0);
    this.halo.rotation.x = Math.PI / 2;
    this.group.add(this.halo);

    // 8. Point light casting the corps colour onto the user's hand
    this.coreLight = new THREE.PointLight(glowColor, 5.0, 300);
    this.coreLight.position.set(0, 28, 0);
    this.group.add(this.coreLight);

    this.group.scale.set(0.001, 0.001, 0.001);
  }

  _buildLightningEffects() {
    this.lightningGroup = new THREE.Group();
    this.lightningMaterial = new THREE.LineBasicMaterial({
      color: this.palette.bright,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 5; i++) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(8 * 3), 3));
      const line = new THREE.Line(geo, this.lightningMaterial);
      this.lightningBolts.push(line);
      this.lightningGroup.add(line);
    }
    this.group.add(this.lightningGroup);
  }

  _updateLightning() {
    for (let b = 0; b < this.lightningBolts.length; b++) {
      const line = this.lightningBolts[b];
      const pos = line.geometry.attributes.position.array;
      const angle = (b / this.lightningBolts.length) * Math.PI * 2 + Math.random() * 0.5;

      let currX = Math.cos(angle) * 16;
      let currY = 21;
      let currZ = Math.sin(angle) * 16;

      pos[0] = currX; pos[1] = currY; pos[2] = currZ;

      for (let p = 1; p < 8; p++) {
        currX += (Math.random() - 0.5) * 12 + Math.cos(angle) * 4;
        currY += (Math.random() - 0.5) * 8 - 1.5;
        currZ += (Math.random() - 0.5) * 12 + Math.sin(angle) * 4;
        pos[p * 3] = currX; pos[p * 3 + 1] = currY; pos[p * 3 + 2] = currZ;
      }
      line.geometry.attributes.position.needsUpdate = true;
    }
  }

  /** Swap the ring to a different corps: rebuild geometry + recolour. */
  setPalette(palette) {
    this.palette = palette;

    while (this.group.children.length) {
      const child = this.group.children.pop();
      child.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material && !Array.isArray(obj.material)) obj.material.dispose();
      });
    }
    this.emblemMaterials = [];
    this.lightningBolts = [];
    this.coreLight = null;
    this.halo = null;

    this._buildRing();
    this._buildLightningEffects();
  }

  updateTransform(position, boneVector, normalVector, baseScale) {
    if (!position || !boneVector) {
      this.targetScale = 0;
      return;
    }
    this.targetScale = baseScale;
    this.group.position.copy(position);

    const yAxis = normalVector.clone().normalize();
    const zAxis = boneVector.clone().normalize();
    const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
    const correctedY = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();

    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeBasis(xAxis, correctedY, zAxis);
    this.group.setRotationFromMatrix(rotMatrix);
  }

  tick(delta, time) {
    this.currentScale += (this.targetScale - this.currentScale) * 0.28;
    if (this.currentScale < 0.02) {
      this.group.visible = false;
    } else {
      this.group.visible = true;
      this.group.scale.set(this.currentScale, this.currentScale, this.currentScale);
    }

    if (this.group.visible) {
      const pulse = 1.0 + Math.sin(time * 6.0) * 0.35;
      if (this.coreLight) this.coreLight.intensity = 4.8 * pulse;
      this.emblemMaterials.forEach(mat => { mat.emissiveIntensity = 3.0 * pulse; });

      if (this.halo) {
        this.halo.rotation.z = time * 2.5;
        const s = 1.0 + Math.sin(time * 8.0) * 0.08;
        this.halo.scale.set(s, s, s);
      }
      this._updateLightning();
    }
  }

  getPosition() {
    return this.group.position.clone();
  }

  isManifested() {
    return this.currentScale > 0.3;
  }
}

window.LanternRing = LanternRing;
