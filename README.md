# 🌈 Emerald Corps AR — Emotional Spectrum Power Ring & Construct System

An immersive, real-time **Augmented Reality (AR)** web experience built with **MediaPipe Hands + Three.js** that places an authentic Power Ring on your finger and lets you project iconic **3D Constructs** using both hands.

**Seven corps. Seven rings. Thirty-five constructs. Seven neural-voice oaths.** Pick your emotional spectrum and the entire world re-themes around you — ring alloy, construct energy, particle colour, HUD, oath narration and combat SFX.

---

## ✨ The Emotional Spectrum

| Corps | Emotion | Constructs | Oath |
| --- | --- | --- | --- |
| 🟢 Green Lantern | **Willpower** | Giant Fist, Aegis Shield, Power Battery, Broadsword, Gatling Cannon | *In brightest day, in blackest night…* |
| 🔵 Blue Lantern | **Hope** | Hope Lantern, Hope Shield, Anchor, Lifeline, Fountain of Hope | *In broken hope, in deepest night…* |
| 🔴 Red Lantern | **Rage** | Flame Fist, Fire Cannon, Barb Lasso, Blazing Shield, Meteor | *I burn. I burn…* |
| 🟡 Yellow Lantern | **Fear** | Hand of Fear, Fear Grenade, Slithering Abyss, Shock Beat, Shrieking Shriek | *Fear is the master. Fear is my friend…* |
| ⚪ White Lantern | **Life** | Hand of Life, Healing Glove, Life Cannon, Protective Aura, Wave of Life | *Wherever life blooms…* |
| ⚫ Black Lantern | **Death** | Hand of Death, Energy Scythe, Black Reaper, Void Bubble, Blackout | *Death has a thousand faces. Beware mine.* |
| 🟠 Orange Lantern | **Avarice** | Hand of Avarice, Bludgeon, Rocket Fist, Golden Wrench, Money Cannon | *Mine. Mine…* |

Switching corps is a single click (or **Q / E**) and rebuilds every colour-dependent subsystem: the 3D ring, the five constructs, the energy tether, the plasma particles, the hand-skeleton HUD, the reticle, the CSS theme, the oath narration and the attack sounds.

---

## 🖐️ One Hand — The Power Ring

- Real-time hand tracking via **MediaPipe Hands** locks the 3D Power Ring onto your chosen finger
- Pixel-perfect alignment with 1:1 orthographic projection and exponential smoothing
- Crackling lightning arcs, orbiting plasma particles and a pulsing energy halo
- Cybernetic hand-skeleton HUD + spinning lock-on reticle, both recoloured per corps
- Black Lantern rings render as necrotic bone and tarnished iron; White Lantern rings as pale ivory — the geometry is rebuilt, not just tinted

## 🖐️ Other Hand — 5 Signature Constructs

| Action | Result |
| --- | --- |
| **Raise 2nd hand** | The active corps' construct appears above your palm |
| **Clench 2nd hand into a fist** | Execute that construct's attack |
| **Keys 1–5** or click | Switch between the corps' 5 constructs |
| **Q / E** | Cycle corps |
| **Spacebar** | Slam / trigger attack |
| **Demo Mode** | Simulates both hands using your mouse cursor (no webcam needed) |

Each construct has its own geometry, whole-body motion (`swing`, `spinY`, `spinZ`, `wobble`, `throb`), independent spinning sub-assemblies (barrels, rotors, orbiting rings) and its own procedural sound.

---

## 🏗️ Architecture

```
green-lantern-ar/
├── index.html                    # App shell, HUD layout, video/canvas layers
├── css/
│   └── style.css                 # Theme driven entirely by CSS custom properties
├── js/
│   ├── corps.js                  # ★ Registry: palettes, oaths, 35 construct definitions
│   ├── tracker.js                # MediaPipe dual-hand tracking & kinematics solver
│   ├── ring.js                   # Procedural 3D Power Ring mesh & lightning
│   ├── constructs.js             # Declarative part-list compiler + energy tether
│   ├── vfx.js                    # Plasma particles & shockwave effects
│   ├── audio.js                  # Web Audio SFX synthesis + per-corps oath engine
│   └── app.js                    # Master state coordinator & corps switching
├── audio/
│   ├── oath_natural_raw.mp3          # Green Lantern oath (neural voice)
│   ├── oath_blue_hope.mp3            # Blue  — Hope
│   ├── oath_red_rage.mp3             # Red   — Rage
│   ├── oath_yellow_fear.mp3          # Yellow — Fear
│   ├── oath_white_life.mp3           # White — Life
│   ├── oath_black_death.mp3          # Black — Death
│   ├── oath_orange_avarice.mp3       # Orange — Avarice
│   └── green_lantern_oath_cinematic.wav
├── build_corps_oaths.py         # Regenerates the 6 non-green oaths (Edge TTS)
├── build_cinematic_audio.py     # Regenerates the orchestral cinematic track
└── server.py                    # Local HTTP server (port 8080)
```

### Adding a corps or a construct

Everything is data. To add an eighth corps, append to `CORPS` in `js/corps.js` with a palette and an oath, then list its construct keys. To add a construct, append a declarative definition to `CONSTRUCT_LIBRARY`:

```js
my_construct: {
  name: 'MY CONSTRUCT', emoji: '🌀', sfx: 'impact', anim: 'swing',
  parts: [
    // [shape, args, position, rotation, 'body'|'core', wireframeOverlay]
    ['sphere', [40, 24, 24], [0, 0, 0], [0, 0, 0], 'body', 1]
  ],
  groups: [
    // independently spinning sub-assembly
    { spinAxis: 'z', spinIdle: 2, spinFire: 26, parts: [
      ['torus', [30, 3, 12, 24], [0, 0, 40], [0, 0, 0], 'core']
    ]}
  ]
}
```

No 3D modelling code required — `constructs.js` compiles it.

---

## 🛠️ Regenerating the Oath Audio

The oaths use Microsoft Edge Neural TTS. Each voice is pitched and paced to suit its emotion (Hope is airy, Rage shouts, Fear is a slow whisper, Death is hollow and low, Avarice is greedy and fast):

```
pip install edge-tts
python build_corps_oaths.py
```

Subtitles are **not** hardcoded to fixed milliseconds. `audio.js` reads the real duration of the loaded track and distributes that corps' four lines across it, so re-voicing an oath can never desync the text.

---

## 🌐 Tech Stack

| Technology | Purpose |
| --- | --- |
| [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) | Real-time 21-point dual-hand tracking |
| [Three.js r128](https://threejs.org/) | WebGL 3D scene, procedural rings & constructs |
| Web Audio API | Procedural SFX synthesis (no sample files) |
| Edge TTS | Neural-voice oaths for all seven corps |
| Python `http.server` | Local development server |

### Running it

```
python server.py
# then open http://localhost:8080
```

A server is required (not `file://`) — MediaPipe and the Web Audio engine need a real origin for camera and audio permissions.

---

## 📖 License

MIT License — fan project, no commercial use. Green Lantern and the Emotional Spectrum are trademarks of DC Comics.
