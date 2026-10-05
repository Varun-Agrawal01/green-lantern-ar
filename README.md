# 🟢 Green Lantern AR – Willpower Power Ring & Construct System

An immersive, real-time **Augmented Reality (AR)** web experience built with **MediaPipe Hands + Three.js** that places an authentic Green Lantern Power Ring on your finger and lets you project iconic **3D Willpower Constructs** from the animated show using both hands!

---

## ✨ Features

### 🟢 One Hand — The Power Ring
- Real-time hand tracking via **MediaPipe Hands** locks the **3D Green Lantern Power Ring** directly onto your middle finger
- Pixel-perfect alignment with 1:1 orthographic projection and exponential smoothing
- Crackling emerald **lightning arcs**, orbiting **willpower plasma particles**, and a pulsing **energy halo**
- Cybernetic **hand skeleton HUD** + spinning sci-fi **lock-on reticle**

### 🟢 Other Hand — 5 Iconic Willpower Constructs
Switch between these 3D constructs inspired by the animated series:

| Key | Construct | Description |
|-----|-----------|-------------|
| `1` | 🥊 **Giant Emerald Fist** | Hal Jordan's signature! Clench your hand to **PUNCH** with sub-bass impact |
| `2` | 🛡️ **Willpower Aegis Shield** | Rotating hexagonal energy buckler with radiating spikes |
| `3` | 🏮 **Power Battery of Oa** | Cosmic lantern floating and radiating green energy rays |
| `4` | ⚔️ **Emerald Broadsword** | Massive plasma blade with white-hot laser spine |
| `5` | 💥 **Rotary Gatling Cannon** | 6-barrel heavy cannon that spins and fires plasma bursts |

### ⚡ Electric Willpower Tether
A live **Bézier arc plasma tether** dynamically connects the Power Ring on Hand 1 to the active construct on Hand 2!

### 🎙️ Natural Voice Green Lantern Oath
- Recorded via **Microsoft Edge Neural TTS** (`en-US-ChristopherNeural`) for a natural, human-quality voice
- Synchronized line-by-line glowing neon subtitles
- Cinematic sub-bass chord progressions and screen shake on the climax line

### 🔊 Procedural Web Audio SFX
- Sub-bass charging riser, emerald plasma hum, lock-on chime
- Unique per-construct attack sounds: punch impacts, sword slashes, gatling pulses, shield clangs

---

## 🚀 Running Locally

**Requires Python 3.x installed.**

```bash
# Clone the repo
git clone https://github.com/Varun-Agrawal01/green-lantern-ar.git
cd green-lantern-ar

# Start the local server
python server.py

# Open in browser
# http://localhost:8080
```

> ⚠️ **HTTPS Note**: MediaPipe Hands requires camera access. Browsers allow camera on `localhost` over HTTP. For production deployment use HTTPS.

---

## 🎮 Controls

| Action | Effect |
|--------|--------|
| **Show Hand to Camera** | Power Ring materializes on your finger + Oath plays |
| **Raise 2nd Hand** | Active Willpower Construct appears above your palm |
| **Clench 2nd Hand into Fist** | Execute the construct's attack! |
| **Keys 1–5** | Switch between the 5 constructs |
| **Spacebar** | Slam / Trigger attack |
| **Demo Mode Button** | Simulates both hands using your mouse cursor |

---

## 🏗️ Architecture

```
green-lantern-ar/
├── index.html              # App shell, HUD layout, video/canvas layers
├── css/
│   └── style.css           # Sci-fi Oa holographic aesthetic
├── js/
│   ├── tracker.js          # MediaPipe dual-hand tracking & kinematics solver
│   ├── ring.js             # Procedural 3D Power Ring mesh & lightning
│   ├── constructs.js       # 5 × 3D Willpower Construct engine + energy tether
│   ├── vfx.js              # Plasma particles & shockwave effects
│   ├── audio.js            # Web Audio API SFX + Oath recitation engine
│   └── app.js              # Master state coordinator
├── audio/
│   ├── oath_natural_raw.mp3           # Natural neural voice oath
│   └── green_lantern_oath_cinematic.wav  # Orchestral cinematic track
├── build_cinematic_audio.py # Script to regenerate cinematic track
└── server.py               # Local HTTP server
```

---

## 🛠️ Regenerating the Oath Audio

The oath audio was generated using Microsoft Edge Neural TTS. To regenerate:

```bash
pip install edge-tts
python build_cinematic_audio.py
```

---

## 🌐 Tech Stack

| Technology | Purpose |
|------------|---------|
| [MediaPipe Hands](https://developers.google.com/mediapipe/solutions/vision/hand_landmarker) | Real-time 21-point hand tracking |
| [Three.js r128](https://threejs.org/) | WebGL 3D scene, procedural ring & constructs |
| Web Audio API | Procedural SFX synthesis |
| Edge TTS | Natural neural voice for the oath |
| Python `http.server` | Local development server |

---

## 📖 License

MIT License — fan project, no commercial use. Green Lantern is a trademark of DC Comics.
