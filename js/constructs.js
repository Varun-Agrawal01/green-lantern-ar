/**
 * GREEN LANTERN AR - WILLPOWER CONSTRUCTS ENGINE
 * Implements iconic 3D constructs from the show:
 * 1. Giant Emerald Fist (punching)
 * 2. Power Battery of Oa (cosmic lantern)
 * 3. Willpower Aegis Shield (hex forcefield)
 * 4. Emerald Broadsword (plasma blade)
 * 5. Rotary Gatling Cannon (spinning barrels)
 * Plus the Energy Tether connecting the ring hand to the projection hand.
 */

class LanternConstructs {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Active construct type: 'fist', 'shield', 'battery', 'sword', 'gatling'
    this.activeType = 'fist';
    this.constructs = {};

    // Energy Tether (connecting Hand 1 Ring to Hand 2 Construct)
    this.tetherLine = null;
    this.tetherPoints = 24;
    this._initTether();

    // Build constructs
    this._buildFist();
    this._buildShield();
    this._buildBattery();
    this._buildSword();
    this._buildGatling();

    this.targetPos = new THREE.Vector3(0, 0, 0);
    this.currentPos = new THREE.Vector3(0, 0, 0);
    this.targetRot = new THREE.Euler(0, 0, 0);
    this.targetScale = 0;
    this.currentScale = 0;
    this.punchOffset = 0;
    this.isPunching = false;

    // Set initial active
    this.setConstructType('fist');
  }

  /* -------------------------------------------------------------
     SHARED CONSTRUCT MATERIALS (Glowing Emerald Energy Look)
     ------------------------------------------------------------- */
  _getConstructMaterial(opacity = 0.85, wireframe = false) {
    return new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff88,
      emissiveIntensity: 2.2,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: opacity,
      wireframe: wireframe,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
  }

  _getCoreMaterial() {
    return new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
  }

  /* -------------------------------------------------------------
     1. ENERGY TETHER (Arcs from Ring Hand to Projection Hand)
     ------------------------------------------------------------- */
  _initTether() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.tetherPoints * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.LineBasicMaterial({
      color: 0x5effb8,
      linewidth: 3,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    this.tetherLine = new THREE.Line(geo, mat);
    this.tetherLine.visible = false;
    this.scene.add(this.tetherLine);
  }

  updateTether(ringPos, constructPos, time) {
    if (!ringPos || !constructPos || this.currentScale < 0.1) {
      this.tetherLine.visible = false;
      return;
    }

    this.tetherLine.visible = true;
    const pos = this.tetherLine.geometry.attributes.position.array;

    // Midpoint arching upward
    const mid = new THREE.Vector3().addVectors(ringPos, constructPos).multiplyScalar(0.5);
    mid.y += 60 + Math.sin(time * 6) * 15;
    mid.z += Math.cos(time * 5) * 20;

    for (let i = 0; i < this.tetherPoints; i++) {
      const t = i / (this.tetherPoints - 1);
      // Quadratic Bezier interpolation
      const x = (1 - t) * (1 - t) * ringPos.x + 2 * (1 - t) * t * mid.x + t * t * constructPos.x;
      const y = (1 - t) * (1 - t) * ringPos.y + 2 * (1 - t) * t * mid.y + t * t * constructPos.y;
      const z = (1 - t) * (1 - t) * ringPos.z + 2 * (1 - t) * t * mid.z + t * t * constructPos.z;

      // Add electric jitter
      const jitter = (t > 0 && t < 1) ? (Math.random() - 0.5) * 8 : 0;
      pos[i * 3] = x + jitter;
      pos[i * 3 + 1] = y + jitter;
      pos[i * 3 + 2] = z + jitter;
    }
    this.tetherLine.geometry.attributes.position.needsUpdate = true;
  }

  /* -------------------------------------------------------------
     2. CONSTRUCT: GIANT WILLPOWER FIST
     ------------------------------------------------------------- */
  _buildFist() {
    const fistGroup = new THREE.Group();
    const mat = this._getConstructMaterial(0.85);
    const wireMat = this._getConstructMaterial(0.3, true);

    // Palm / Back of fist block
    const palmGeo = new THREE.BoxGeometry(70, 60, 50);
    const palm = new THREE.Mesh(palmGeo, mat);
    const palmWire = new THREE.Mesh(palmGeo, wireMat);
    fistGroup.add(palm);
    fistGroup.add(palmWire);

    // 4 Massive Knuckles & Fingers
    for (let f = 0; f < 4; f++) {
      const xOffset = -26 + f * 17.5;
      // Main knuckle joint
      const knuckleGeo = new THREE.SphereGeometry(12, 16, 16);
      const knuckle = new THREE.Mesh(knuckleGeo, mat);
      knuckle.position.set(xOffset, 32, 12);
      fistGroup.add(knuckle);

      // Curled finger segment
      const fingerGeo = new THREE.CylinderGeometry(8, 9, 36, 16);
      fingerGeo.rotateX(Math.PI / 3);
      const finger = new THREE.Mesh(fingerGeo, mat);
      finger.position.set(xOffset, 18, 28);
      fistGroup.add(finger);
    }

    // Heavy Thumb
    const thumbKnuckleGeo = new THREE.SphereGeometry(14, 16, 16);
    const thumbKnuckle = new THREE.Mesh(thumbKnuckleGeo, mat);
    thumbKnuckle.position.set(-42, 6, 8);
    fistGroup.add(thumbKnuckle);

    const thumbGeo = new THREE.CylinderGeometry(9, 10, 32, 16);
    thumbGeo.rotateZ(-Math.PI / 4);
    thumbGeo.rotateX(Math.PI / 6);
    const thumb = new THREE.Mesh(thumbGeo, mat);
    thumb.position.set(-28, 22, 24);
    fistGroup.add(thumb);

    // Green Lantern Crest embossed on back of fist
    const crestRingGeo = new THREE.TorusGeometry(16, 2.5, 16, 32);
    const crestRing = new THREE.Mesh(crestRingGeo, this._getCoreMaterial());
    crestRing.position.set(0, 0, -26);
    fistGroup.add(crestRing);

    const barGeo = new THREE.BoxGeometry(34, 4, 3);
    const topBar = new THREE.Mesh(barGeo, this._getCoreMaterial());
    topBar.position.set(0, 16, -26);
    fistGroup.add(topBar);

    const bottomBar = new THREE.Mesh(barGeo, this._getCoreMaterial());
    bottomBar.position.set(0, -16, -26);
    fistGroup.add(bottomBar);

    fistGroup.visible = false;
    this.constructs['fist'] = fistGroup;
    this.group.add(fistGroup);
  }

  /* -------------------------------------------------------------
     3. CONSTRUCT: POWER BATTERY OF OA
     ------------------------------------------------------------- */
  _buildBattery() {
    const battGroup = new THREE.Group();
    const mat = this._getConstructMaterial(0.88);
    const coreMat = this._getCoreMaterial();

    // Flared Base
    const baseGeo = new THREE.CylinderGeometry(35, 45, 18, 32);
    const base = new THREE.Mesh(baseGeo, mat);
    base.position.set(0, -45, 0);
    battGroup.add(base);

    // Central Lantern Bell / Chamber
    const bellGeo = new THREE.SphereGeometry(44, 32, 32);
    bellGeo.scale(1, 1.25, 1);
    const bell = new THREE.Mesh(bellGeo, mat);
    battGroup.add(bell);

    // Central Glowing Green Eye / Aperture
    const eyeRimGeo = new THREE.TorusGeometry(26, 4, 16, 32);
    const eyeRim = new THREE.Mesh(eyeRimGeo, coreMat);
    eyeRim.position.set(0, 0, 36);
    battGroup.add(eyeRim);

    const eyeCoreGeo = new THREE.SphereGeometry(16, 16, 16);
    const eyeCore = new THREE.Mesh(eyeCoreGeo, coreMat);
    eyeCore.position.set(0, 0, 24);
    battGroup.add(eyeCore);

    // Top Chamber Collar
    const collarGeo = new THREE.CylinderGeometry(28, 38, 14, 32);
    const collar = new THREE.Mesh(collarGeo, mat);
    collar.position.set(0, 48, 0);
    battGroup.add(collar);

    // Lantern Handle (Arched Torus Segment)
    const handleGeo = new THREE.TorusGeometry(38, 4, 16, 32, Math.PI);
    const handle = new THREE.Mesh(handleGeo, mat);
    handle.position.set(0, 56, 0);
    handle.rotation.x = Math.PI;
    battGroup.add(handle);

    battGroup.visible = false;
    this.constructs['battery'] = battGroup;
    this.group.add(battGroup);
  }

  /* -------------------------------------------------------------
     4. CONSTRUCT: WILLPOWER AEGIS SHIELD
     ------------------------------------------------------------- */
  _buildShield() {
    const shieldGroup = new THREE.Group();
    const mat = this._getConstructMaterial(0.75);
    const wireMat = this._getConstructMaterial(0.35, true);
    const coreMat = this._getCoreMaterial();

    // Convex Shield Dish
    const dishGeo = new THREE.CylinderGeometry(75, 80, 8, 32);
    dishGeo.rotateX(Math.PI / 2);
    const dish = new THREE.Mesh(dishGeo, mat);
    const dishWire = new THREE.Mesh(dishGeo, wireMat);
    shieldGroup.add(dish);
    shieldGroup.add(dishWire);

    // Outer Energy Rim with Spikes
    const rimGeo = new THREE.TorusGeometry(82, 3.5, 16, 32);
    const rim = new THREE.Mesh(rimGeo, coreMat);
    shieldGroup.add(rim);

    // 6 Radiating Crest Spikes
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const spikeGeo = new THREE.ConeGeometry(8, 28, 16);
      spikeGeo.rotateZ(-angle + Math.PI / 2);
      const spike = new THREE.Mesh(spikeGeo, coreMat);
      spike.position.set(Math.cos(angle) * 88, Math.sin(angle) * 88, 0);
      shieldGroup.add(spike);
    }

    // Central Green Lantern Emblem
    const crestGeo = new THREE.TorusGeometry(28, 3, 16, 32);
    const crest = new THREE.Mesh(crestGeo, coreMat);
    crest.position.set(0, 0, 6);
    shieldGroup.add(crest);

    const barGeo = new THREE.BoxGeometry(54, 5, 4);
    const bTop = new THREE.Mesh(barGeo, coreMat);
    bTop.position.set(0, 26, 6);
    shieldGroup.add(bTop);

    const bBot = new THREE.Mesh(barGeo, coreMat);
    bBot.position.set(0, -26, 6);
    shieldGroup.add(bBot);

    shieldGroup.visible = false;
    this.constructs['shield'] = shieldGroup;
    this.group.add(shieldGroup);
  }

  /* -------------------------------------------------------------
     5. CONSTRUCT: EMERALD ENERGY BROADSWORD
     ------------------------------------------------------------- */
  _buildSword() {
    const swordGroup = new THREE.Group();
    const mat = this._getConstructMaterial(0.85);
    const coreMat = this._getCoreMaterial();

    // Hilt / Pommel
    const pommelGeo = new THREE.SphereGeometry(9, 16, 16);
    const pommel = new THREE.Mesh(pommelGeo, mat);
    pommel.position.set(0, -85, 0);
    swordGroup.add(pommel);

    const gripGeo = new THREE.CylinderGeometry(5.5, 6, 42, 16);
    const grip = new THREE.Mesh(gripGeo, mat);
    grip.position.set(0, -62, 0);
    swordGroup.add(grip);

    // Crossguard with Wings
    const guardGeo = new THREE.BoxGeometry(64, 8, 12);
    const guard = new THREE.Mesh(guardGeo, coreMat);
    guard.position.set(0, -38, 0);
    swordGroup.add(guard);

    // Massive Glowing Blade
    const bladeGeo = new THREE.BoxGeometry(16, 160, 4);
    const blade = new THREE.Mesh(bladeGeo, mat);
    blade.position.set(0, 48, 0);
    swordGroup.add(blade);

    // Inner White-Hot Laser Spine
    const spineGeo = new THREE.BoxGeometry(4, 155, 6);
    const spine = new THREE.Mesh(spineGeo, coreMat);
    spine.position.set(0, 48, 0);
    swordGroup.add(spine);

    // Tapered Blade Tip
    const tipGeo = new THREE.ConeGeometry(12, 34, 4);
    const tip = new THREE.Mesh(tipGeo, mat);
    tip.position.set(0, 144, 0);
    swordGroup.add(tip);

    swordGroup.visible = false;
    this.constructs['sword'] = swordGroup;
    this.group.add(swordGroup);
  }

  /* -------------------------------------------------------------
     6. CONSTRUCT: ROTARY GATLING CANNON
     ------------------------------------------------------------- */
  _buildGatling() {
    const gatGroup = new THREE.Group();
    const mat = this._getConstructMaterial(0.85);
    const coreMat = this._getCoreMaterial();

    // Main Receiver Housing
    const recGeo = new THREE.BoxGeometry(44, 44, 60);
    const rec = new THREE.Mesh(recGeo, mat);
    gatGroup.add(rec);

    // Ammo Willpower Drum
    const drumGeo = new THREE.CylinderGeometry(24, 24, 26, 24);
    drumGeo.rotateZ(Math.PI / 2);
    const drum = new THREE.Mesh(drumGeo, mat);
    drum.position.set(30, -12, 0);
    gatGroup.add(drum);

    // 6 Rotating Barrels
    this.barrelGroup = new THREE.Group();
    for (let b = 0; b < 6; b++) {
      const angle = (b / 6) * Math.PI * 2;
      const bGeo = new THREE.CylinderGeometry(3.5, 3.5, 120, 16);
      bGeo.rotateX(Math.PI / 2);
      const bMesh = new THREE.Mesh(bGeo, coreMat);
      bMesh.position.set(Math.cos(angle) * 16, Math.sin(angle) * 16, 85);
      this.barrelGroup.add(bMesh);
    }
    gatGroup.add(this.barrelGroup);

    gatGroup.visible = false;
    this.constructs['gatling'] = gatGroup;
    this.group.add(gatGroup);
  }

  /* -------------------------------------------------------------
     INTERACTION & TRANSFORMS
     ------------------------------------------------------------- */
  setConstructType(type) {
    if (!this.constructs[type]) return;
    this.activeType = type;
    Object.keys(this.constructs).forEach(k => {
      this.constructs[k].visible = (k === type);
    });
  }

  updateTransform(hand2Pos, hand2Normal, scale, isPunching = false) {
    if (!hand2Pos) {
      this.targetScale = 0;
      return;
    }

    this.targetScale = scale * 1.35;
    this.targetPos.copy(hand2Pos);
    this.isPunching = isPunching;

    // Align construct orientation with hand normal
    if (hand2Normal) {
      this.group.lookAt(this.targetPos.clone().add(hand2Normal.clone().multiplyScalar(400)));
    }
  }

  tick(delta, time) {
    // Lerp scale
    this.currentScale += (this.targetScale - this.currentScale) * 0.25;
    if (this.currentScale < 0.02) {
      this.group.visible = false;
      if (this.tetherLine) this.tetherLine.visible = false;
      return;
    }

    this.group.visible = true;
    this.group.scale.set(this.currentScale, this.currentScale, this.currentScale);

    // Lerp position
    this.currentPos.lerp(this.targetPos, 0.3);

    // Punch thrust motion
    if (this.isPunching) {
      this.punchOffset = Math.min(this.punchOffset + delta * 350, 120);
    } else {
      this.punchOffset = Math.max(this.punchOffset - delta * 220, 0);
    }

    this.group.position.set(
      this.currentPos.x,
      this.currentPos.y,
      this.currentPos.z + this.punchOffset
    );

    // Active construct continuous animation
    const current = this.constructs[this.activeType];
    if (current && current.visible) {
      if (this.activeType === 'battery') {
        current.rotation.y = time * 0.8;
      } else if (this.activeType === 'shield') {
        current.rotation.z = time * 0.4;
      } else if (this.activeType === 'gatling' && this.barrelGroup) {
        this.barrelGroup.rotation.z += this.isPunching ? delta * 25 : delta * 4;
      } else if (this.activeType === 'sword') {
        current.rotation.z = Math.sin(time * 2) * 0.12;
      }
    }
  }

  getPosition() {
    return this.group.position.clone();
  }

  isManifested() {
    return this.currentScale > 0.2;
  }
}

window.LanternConstructs = LanternConstructs;
