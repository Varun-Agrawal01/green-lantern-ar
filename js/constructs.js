/**
 * EMERALD CORPS AR: WILLPOWER CONSTRUCTS ENGINE
 *
 * All constructs for all seven corps are compiled from the declarative
 * part lists in js/corps.js (CONSTRUCT_LIBRARY), so adding a corps means
 * adding data, not 3D modelling code.
 *
 * Per-corps material behaviour differs deliberately:
 *   - willpower (green) etc. build translucent additive energy
 *   - death (black) builds near-opaque void matter lit from inside
 *
 * Also owns the Energy Tether that arcs from the ring hand to the
 * projection hand, coloured to the active corps.
 */

class LanternConstructs {
  constructor(scene, palette) {
    this.scene = scene;
    this.palette = palette || window.CORPS_PALETTES.green;

    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.activeType = 'fist';
    this.builtCorps = null;
    this.constructs = {};     // type -> THREE.Group
    this.spinGroups = {};     // type -> [{group, axis, idle, fire}]

    this.tetherPoints = 24;

    this._buildMaterials();
    this._initTether();

    this.targetPos = new THREE.Vector3(0, 0, 0);
    this.currentPos = new THREE.Vector3(0, 0, 0);
    this.targetScale = 0;
    this.currentScale = 0;
    this.punchOffset = 0;
    this.isPunching = false;

    this.buildForCorps(this.palette.key || 'green');
    this.setConstructType('fist');
  }

  /* -------------------------------------------------------------
     MATERIALS
     ------------------------------------------------------------- */
  _buildMaterials() {
    const p = this.palette;
    // Death renders as dense void-black matter, not glowing energy.
    const isDeath = p.key === 'black';

    this.bodyMaterial = new THREE.MeshStandardMaterial({
      color: p.body,
      emissive: p.body,
      emissiveIntensity: isDeath ? 0.35 : 2.2,
      roughness: isDeath ? 0.55 : 0.1,
      metalness: isDeath ? 0.1 : 0.2,
      transparent: !isDeath,
      opacity: isDeath ? 1.0 : 0.85,
      wireframe: false,
      blending: isDeath ? THREE.NormalBlending : THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });

    this.coreMaterial = new THREE.MeshBasicMaterial({
      color: p.bright,
      transparent: true,
      opacity: isDeath ? 0.9 : 0.95,
      blending: isDeath ? THREE.NormalBlending : THREE.AdditiveBlending
    });

    this.wireMaterial = new THREE.MeshStandardMaterial({
      color: p.bright,
      emissive: p.bright,
      emissiveIntensity: 1.4,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.3,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
  }

  /* -------------------------------------------------------------
     PART COMPILER
     shape: box | sphere | cyl | cone | torus | ring
     part: [shape, args, position, rotation, role, wireOverlay]
     ------------------------------------------------------------- */
  _compilePart(part) {
    const [shape, args, pos, rot, role, wire] = part;
    let geo;

    switch (shape) {
      case 'box':
        geo = new THREE.BoxGeometry(args[0], args[1], args[2]);
        break;
      case 'sphere':
        geo = new THREE.SphereGeometry(args[0], args[1], args[2]);
        break;
      case 'cyl':
        geo = new THREE.CylinderGeometry(args[0], args[1], args[2], args[3]);
        break;
      case 'cone':
        geo = new THREE.ConeGeometry(args[0], args[1], args[2]);
        break;
      case 'torus':
        geo = args.length >= 5
          ? new THREE.TorusGeometry(args[0], args[1], args[2], args[3], args[4])
          : new THREE.TorusGeometry(args[0], args[1], args[2], args[3]);
        break;
      case 'ring':
        geo = new THREE.RingGeometry(args[0], args[1], args[2]);
        break;
      default:
        geo = new THREE.BoxGeometry(10, 10, 10);
    }

    const mat = role === 'core' ? this.coreMaterial : this.bodyMaterial;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(pos[0], pos[1], pos[2]);
    mesh.rotation.set(rot[0], rot[1], rot[2]);

    const holder = new THREE.Group();
    holder.add(mesh);

    // Wireframe overlay makes the hollow construct read as a hologram.
    if (wire) {
      const wireMesh = new THREE.Mesh(geo, this.wireMaterial);
      wireMesh.position.copy(mesh.position);
      wireMesh.rotation.copy(mesh.rotation);
      holder.add(wireMesh);
    }
    return holder;
  }

  /* -------------------------------------------------------------
     BUILD (lazily, per corps, cached)
     ------------------------------------------------------------- */
  buildForCorps(corpsKey) {
    const corps = window.CORPS[corpsKey];
    if (!corps || this.builtCorps === corpsKey) return;
    this.builtCorps = corpsKey;

    // Free any previously built corps constructs
    while (this.group.children.length) {
      const child = this.group.children.pop();
      child.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
      });
    }
    this.constructs = {};
    this.spinGroups = {};

    const lib = window.CONSTRUCT_LIBRARY;

    corps.constructs.forEach(type => {
      const def = lib[type];
      if (!def) {
        console.warn('Missing construct definition:', type);
        return;
      }

      const root = new THREE.Group();
      def.parts.forEach(part => root.add(this._compilePart(part)));

      (def.groups || []).forEach(gdef => {
        const g = new THREE.Group();
        gdef.parts.forEach(part => g.add(this._compilePart(part)));
        root.add(g);
        this.spinGroups[type] = this.spinGroups[type] || [];
        this.spinGroups[type].push({
          group: g,
          axis: gdef.spinAxis || 'z',
          idle: gdef.spinIdle === undefined ? 1.5 : gdef.spinIdle,
          fire: gdef.spinFire === undefined ? 25 : gdef.spinFire
        });
      });

      root.userData.anim = def.anim;
      root.visible = false;
      this.constructs[type] = root;
      this.group.add(root);
    });

    // Fall back to the first available construct if the old one is gone
    if (!this.constructs[this.activeType]) {
      this.activeType = corps.constructs[0];
    }
    this.setConstructType(this.activeType);
  }

  /** Rebuild colours and geometry for a newly selected corps. */
  setPalette(palette) {
    this.palette = palette;
    this._buildMaterials();
    if (this.tetherLine) this.tetherLine.material.color.set(palette.bright);

    // Build the NEW corps' constructs, not the one we are leaving.
    this.builtCorps = null;
    this.buildForCorps(palette.key);
  }

  /* -------------------------------------------------------------
     ENERGY TETHER (Bezier arc + electric jitter)
     ------------------------------------------------------------- */
  _initTether() {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(this.tetherPoints * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    this.tetherLine = new THREE.Line(geo, new THREE.LineBasicMaterial({
      color: this.palette.bright,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    }));
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

    const mid = new THREE.Vector3().addVectors(ringPos, constructPos).multiplyScalar(0.5);
    mid.y += 60 + Math.sin(time * 6) * 15;
    mid.z += Math.cos(time * 5) * 20;

    for (let i = 0; i < this.tetherPoints; i++) {
      const t = i / (this.tetherPoints - 1);
      const x = (1 - t) * (1 - t) * ringPos.x + 2 * (1 - t) * t * mid.x + t * t * constructPos.x;
      const y = (1 - t) * (1 - t) * ringPos.y + 2 * (1 - t) * t * mid.y + t * t * constructPos.y;
      const z = (1 - t) * (1 - t) * ringPos.z + 2 * (1 - t) * t * mid.z + t * t * constructPos.z;

      const jitter = (t > 0 && t < 1) ? (Math.random() - 0.5) * 8 : 0;
      pos[i * 3] = x + jitter;
      pos[i * 3 + 1] = y + jitter;
      pos[i * 3 + 2] = z + jitter;
    }
    this.tetherLine.geometry.attributes.position.needsUpdate = true;
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

  getSfxKey() {
    const def = window.CONSTRUCT_LIBRARY[this.activeType];
    return def ? def.sfx : 'impact';
  }

  updateTransform(hand2Pos, hand2Normal, scale, isPunching = false) {
    if (!hand2Pos) {
      this.targetScale = 0;
      return;
    }
    this.targetScale = scale * 1.35;
    this.targetPos.copy(hand2Pos);
    this.isPunching = isPunching;

    if (hand2Normal) {
      this.group.lookAt(this.targetPos.clone().add(hand2Normal.clone().multiplyScalar(400)));
    }
  }

  tick(delta, time) {
    this.currentScale += (this.targetScale - this.currentScale) * 0.25;
    if (this.currentScale < 0.02) {
      this.group.visible = false;
      if (this.tetherLine) this.tetherLine.visible = false;
      return;
    }

    this.group.visible = true;
    this.group.scale.set(this.currentScale, this.currentScale, this.currentScale);
    this.currentPos.lerp(this.targetPos, 0.3);

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

    const current = this.constructs[this.activeType];
    if (current && current.visible) {
      // Independent spinning sub-assemblies (barrels, rotors, orbiting rings)
      const spinners = this.spinGroups[this.activeType] || [];
      spinners.forEach(s => {
        const rate = this.isPunching ? s.fire : s.idle;
        s.group.rotation[s.axis] += delta * rate;
      });

      // Whole-construct motion, per the construct's declared personality
      switch (current.userData.anim) {
        case 'spinY':
          current.rotation.y = time * 0.8;
          break;
        case 'spinZ':
          current.rotation.z = time * 0.4;
          break;
        case 'swing':
          current.rotation.z = this.isPunching
            ? Math.max(current.rotation.z - delta * 9, -0.75)
            : current.rotation.z * 0.94;
          current.rotation.x = Math.sin(time * 1.8) * 0.1;
          break;
        case 'throb':
          const s = 1 + Math.sin(time * 4.5) * 0.12;
          current.scale.set(s, s, s);
          current.rotation.y = time * 0.5;
          break;
        case 'wobble':
          current.rotation.z = Math.sin(time * 2) * 0.12;
          break;
        default:
          break;
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
