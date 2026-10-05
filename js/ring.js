/**
 * GREEN LANTERN AR - CINEMATIC 3D POWER RING
 * Highly detailed superhero signet ring with emerald metal, glowing insignia, and energy halo.
 */

class LanternRing {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.ringMesh = null;
    this.coreLight = null;
    this.emblemMaterials = [];
    this.lightningBolts = [];
    
    // Scale and animation
    this.targetScale = 0;
    this.currentScale = 0;
    this.visible = false;

    this._buildRing();
    this._buildLightningEffects();
    this.scene.add(this.group);
  }

  _buildRing() {
    // 1. High-end Metallic Emerald Material
    const emeraldMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x008f4c,
      roughness: 0.18,
      metalness: 0.88,
      emissive: 0x002e15,
      emissiveIntensity: 0.5
    });

    // Darker inner setting metal
    const darkSettingMaterial = new THREE.MeshStandardMaterial({
      color: 0x003b1d,
      roughness: 0.35,
      metalness: 0.75
    });

    // Highly emissive emerald willpower glow
    const coreGlowMaterial = new THREE.MeshStandardMaterial({
      color: 0x5effb8,
      emissive: 0x00ff88,
      emissiveIntensity: 3.2,
      roughness: 0.05,
      metalness: 0.1
    });
    this.emblemMaterials.push(coreGlowMaterial);

    const brightSymbolMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x33ff99,
      emissiveIntensity: 2.8,
      roughness: 0.1,
      metalness: 0.5
    });
    this.emblemMaterials.push(brightSymbolMaterial);

    // 2. Main Finger Band (Ergonomic contoured signet torus)
    // Base dimensions tuned for screen pixels (radius ~18px, thickness ~5.5px)
    const bandGeo = new THREE.TorusGeometry(18, 5.5, 32, 64);
    const band = new THREE.Mesh(bandGeo, emeraldMetalMaterial);
    band.rotation.x = Math.PI / 2;
    this.group.add(band);

    // Band inner comfort-fit bevel
    const innerRimGeo = new THREE.TorusGeometry(18, 2.5, 16, 64);
    const innerRim = new THREE.Mesh(innerRimGeo, darkSettingMaterial);
    innerRim.rotation.x = Math.PI / 2;
    this.group.add(innerRim);

    // 3. Heavy Signet Mount / Bezel Base (Chunky heroic signet silhouette)
    const mountGeo = new THREE.CylinderGeometry(13.5, 15.5, 7.5, 36);
    const mount = new THREE.Mesh(mountGeo, emeraldMetalMaterial);
    mount.position.set(0, 16.5, 0);
    this.group.add(mount);

    // 4. Stepped Bezel Collar
    const collarGeo = new THREE.CylinderGeometry(14.8, 14.2, 2.2, 36);
    const collar = new THREE.Mesh(collarGeo, darkSettingMaterial);
    collar.position.set(0, 20.2, 0);
    this.group.add(collar);

    // 5. Outer Bezel Frame Rim
    const bezelRimGeo = new THREE.TorusGeometry(13.2, 1.8, 16, 36);
    const bezelRim = new THREE.Mesh(bezelRimGeo, emeraldMetalMaterial);
    bezelRim.position.set(0, 21.0, 0);
    bezelRim.rotation.x = Math.PI / 2;
    this.group.add(bezelRim);

    // 6. Central Power Battery Gem / Faceted Crystal Lens
    const crystalGeo = new THREE.CylinderGeometry(12.2, 12.2, 1.2, 36);
    const crystal = new THREE.Mesh(crystalGeo, coreGlowMaterial);
    crystal.position.set(0, 20.8, 0);
    this.group.add(crystal);

    // 7. Iconic Green Lantern Insignia (Modeled in 3D relief)
    // A. Outer circular lantern aperture
    const emblemRingGeo = new THREE.TorusGeometry(6.5, 1.2, 16, 36);
    const emblemRing = new THREE.Mesh(emblemRingGeo, brightSymbolMaterial);
    emblemRing.position.set(0, 21.6, 0);
    emblemRing.rotation.x = Math.PI / 2;
    this.group.add(emblemRing);

    // B. Inner power core dot
    const coreDotGeo = new THREE.SphereGeometry(2.2, 16, 16);
    const coreDot = new THREE.Mesh(coreDotGeo, brightSymbolMaterial);
    coreDot.position.set(0, 21.8, 0);
    this.group.add(coreDot);

    // C. Upper power bar
    const barTopGeo = new THREE.BoxGeometry(16.5, 1.6, 1.8);
    const barTop = new THREE.Mesh(barTopGeo, brightSymbolMaterial);
    barTop.position.set(0, 21.6, -7.0);
    this.group.add(barTop);

    // D. Lower power bar
    const barBottomGeo = new THREE.BoxGeometry(16.5, 1.6, 1.8);
    const barBottom = new THREE.Mesh(barBottomGeo, brightSymbolMaterial);
    barBottom.position.set(0, 21.6, 7.0);
    this.group.add(barBottom);

    // 8. Orbiting Willpower Energy Halo Ring
    const haloGeo = new THREE.TorusGeometry(23, 0.7, 16, 48);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x52ffaa,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.halo = new THREE.Mesh(haloGeo, haloMat);
    this.halo.position.set(0, 20.5, 0);
    this.halo.rotation.x = Math.PI / 2;
    this.group.add(this.halo);

    // 9. Dynamic Point Light (Casts radiant green glow onto user's hand)
    this.coreLight = new THREE.PointLight(0x00ff88, 5.0, 300);
    this.coreLight.position.set(0, 28, 0);
    this.group.add(this.coreLight);

    // Start with ring hidden
    this.group.scale.set(0.001, 0.001, 0.001);
  }

  _buildLightningEffects() {
    this.lightningGroup = new THREE.Group();
    const count = 5;
    const lightningMat = new THREE.LineBasicMaterial({
      color: 0x88ffc8,
      linewidth: 2,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < count; i++) {
      const geo = new THREE.BufferGeometry();
      const points = new Float32Array(8 * 3);
      geo.setAttribute('position', new THREE.BufferAttribute(points, 3));
      const line = new THREE.Line(geo, lightningMat);
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

      pos[0] = currX;
      pos[1] = currY;
      pos[2] = currZ;

      for (let p = 1; p < 8; p++) {
        currX += (Math.random() - 0.5) * 12 + Math.cos(angle) * 4;
        currY += (Math.random() - 0.5) * 8 - 1.5;
        currZ += (Math.random() - 0.5) * 12 + Math.sin(angle) * 4;
        pos[p * 3] = currX;
        pos[p * 3 + 1] = currY;
        pos[p * 3 + 2] = currZ;
      }
      line.geometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * Updates position and orientation matrix from kinematics solver
   */
  updateTransform(position, boneVector, normalVector, baseScale) {
    if (!position || !boneVector) {
      this.targetScale = 0;
      return;
    }

    this.targetScale = baseScale;
    this.group.position.copy(position);

    // Compute coordinate frame:
    // Y-axis = normalVector (pointing away from dorsal side of hand)
    // Z-axis = boneVector (pointing along finger segment towards fingertip)
    // X-axis = normal x bone
    const yAxis = normalVector.clone().normalize();
    const zAxis = boneVector.clone().normalize();
    const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis).normalize();
    const correctedY = new THREE.Vector3().crossVectors(zAxis, xAxis).normalize();

    const rotMatrix = new THREE.Matrix4();
    rotMatrix.makeBasis(xAxis, correctedY, zAxis);
    this.group.setRotationFromMatrix(rotMatrix);
  }

  /**
   * Frame tick
   */
  tick(delta, time) {
    // Smooth lerp scale
    this.currentScale += (this.targetScale - this.currentScale) * 0.28;
    if (this.currentScale < 0.02) {
      this.group.visible = false;
    } else {
      this.group.visible = true;
      this.group.scale.set(this.currentScale, this.currentScale, this.currentScale);
    }

    if (this.group.visible) {
      // Pulse core light and emblem
      const pulse = 1.0 + Math.sin(time * 6.0) * 0.35;
      if (this.coreLight) {
        this.coreLight.intensity = 4.8 * pulse;
      }
      this.emblemMaterials.forEach(mat => {
        mat.emissiveIntensity = 3.0 * pulse;
      });

      // Rotate halo ring
      if (this.halo) {
        this.halo.rotation.z = time * 2.5;
        this.halo.scale.set(1.0 + Math.sin(time * 8.0) * 0.08, 1.0 + Math.sin(time * 8.0) * 0.08, 1.0);
      }

      // Update lightning arcs
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
