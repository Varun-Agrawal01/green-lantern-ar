/**
 * EMERALD CORPS AR: MULTI-CORPS REGISTRY
 *
 * Every emotional spectrum colour of the Emotional Spectrum has its own:
 *   - palette (drives ring, constructs, VFX, lights and the whole CSS theme)
 *   - oath narration (audio track + subtitle lines)
 *   - five signature constructs (declarative part lists compiled in constructs.js)
 *
 * The original Green Lantern data is preserved verbatim; the other six corps
 * are added alongside it.
 */

/* -------------------------------------------------------------
   PALETTES
   ------------------------------------------------------------- */
const CORPS_PALETTES = {
  green: {
    key: 'green',
    label: 'GREEN LANTERN CORPS',
    emotion: 'WILLPOWER',
    sector: 'SECTOR 2814',
    body: 0x00ff88,      // construct body colour
    bright: 0x9dffc8,    // high-energy core / highlights
    deep: 0x021a0e,      // deepest background tint
    glow: 'rgba(0, 255, 136, 0.45)',
    glowHeavy: 'rgba(0, 255, 136, 0.85)',
    spark: 0x00ff88,
    flashCss: 'rgba(0, 255, 136, 0.7)',
    darkText: '#011409'
  },
  blue: {
    key: 'blue',
    label: 'BLUE LANTERN CORPS',
    emotion: 'HOPE',
    sector: 'SECTOR 2814',
    body: 0x2f9bff,
    bright: 0xc9e8ff,
    deep: 0x04162e,
    glow: 'rgba(47, 155, 255, 0.45)',
    glowHeavy: 'rgba(90, 180, 255, 0.85)',
    spark: 0x2f9bff,
    flashCss: 'rgba(47, 155, 255, 0.7)',
    darkText: '#01101f'
  },
  red: {
    key: 'red',
    label: 'RED LANTERN CORPS',
    emotion: 'RAGE',
    sector: 'SECTOR 2814',
    body: 0xff2a1f,
    bright: 0xffc9b8,
    deep: 0x2e0603,
    glow: 'rgba(255, 42, 31, 0.45)',
    glowHeavy: 'rgba(255, 90, 70, 0.85)',
    spark: 0xff2a1f,
    flashCss: 'rgba(255, 60, 40, 0.7)',
    darkText: '#1d0503'
  },
  yellow: {
    key: 'yellow',
    label: 'YELLOW LANTERN CORPS',
    emotion: 'FEAR',
    sector: 'SECTOR 2814',
    body: 0xffd000,
    bright: 0xfff3a0,
    deep: 0x2e2403,
    glow: 'rgba(255, 208, 0, 0.42)',
    glowHeavy: 'rgba(255, 220, 60, 0.82)',
    spark: 0xffd000,
    flashCss: 'rgba(255, 208, 0, 0.65)',
    darkText: '#1c1602'
  },
  white: {
    key: 'white',
    label: 'WHITE LANTERN CORPS',
    emotion: 'LIFE',
    sector: 'SECTOR 2814',
    body: 0xfff6e8,
    bright: 0xffffff,
    deep: 0x1a1a20,
    glow: 'rgba(255, 246, 232, 0.45)',
    glowHeavy: 'rgba(255, 255, 255, 0.85)',
    spark: 0xfff6e8,
    flashCss: 'rgba(255, 255, 255, 0.7)',
    darkText: '#101014'
  },
  black: {
    key: 'black',
    label: 'BLACK LANTERN CORPS',
    emotion: 'DEATH',
    sector: 'SECTOR 2814',
    // The dead render as void-black matter lit from inside by a cold soul glow.
    body: 0x14141f,
    bright: 0xa06bff,
    deep: 0x050508,
    glow: 'rgba(150, 90, 255, 0.45)',
    glowHeavy: 'rgba(160, 107, 255, 0.85)',
    spark: 0x8a4fff,
    flashCss: 'rgba(120, 60, 220, 0.65)',
    darkText: '#05050a'
  },
  orange: {
    key: 'orange',
    label: 'ORANGE LANTERN CORPS',
    emotion: 'AVARICE',
    sector: 'SECTOR 2814',
    body: 0xff8a00,
    bright: 0xffd08a,
    deep: 0x2e1400,
    glow: 'rgba(255, 138, 0, 0.45)',
    glowHeavy: 'rgba(255, 165, 40, 0.85)',
    spark: 0xff8a00,
    flashCss: 'rgba(255, 138, 0, 0.7)',
    darkText: '#1d0c00'
  }
};

/* -------------------------------------------------------------
   CONSTRUCT LIBRARY
   Declarative part lists. Each part is:
     [shape, args, position, rotation, materialRole, wireframeOverlay]

   shape: box | sphere | cyl | cone | torus | octa | ring | lathe-ish
   materialRole: body (translucent corps-coloured construct)
                 core (white-hot energy / bright core colour)
   Nested `groups` spin independently (barrels, rotors, orbiting rings).
   `anim` drives the root: swing | spinY | spinZ | wobble | throb
   `sfx` selects the procedural sound in audio.js
   ------------------------------------------------------------- */
const CONSTRUCT_LIBRARY = {
  /* ======================== GREEN ======================= */
  fist: {
    name: 'GIANT FIST', emoji: '🥊', sfx: 'impact', anim: 'swing',
    parts: [
      ['box', [70, 60, 50], [0, 0, 0], [0, 0, 0], 'body'],
      ['box', [70, 60, 50], [0, 0, 0], [0, 0, 0], 'body', 1]
    ],
    groups: [
      { spinAxis: null, parts: [
        // knuckles + curled fingers
        ['sphere', [12, 16, 16], [-26, 32, 12], [0, 0, 0], 'body'],
        ['sphere', [12, 16, 16], [-8.5, 32, 12], [0, 0, 0], 'body'],
        ['sphere', [12, 16, 16], [9, 32, 12], [0, 0, 0], 'body'],
        ['sphere', [12, 16, 16], [26.5, 32, 12], [0, 0, 0], 'body'],
        ['cyl', [8, 9, 36, 16], [-26, 18, 28], [1.047, 0, 0], 'body'],
        ['cyl', [8, 9, 36, 16], [-8.5, 18, 28], [1.047, 0, 0], 'body'],
        ['cyl', [8, 9, 36, 16], [9, 18, 28], [1.047, 0, 0], 'body'],
        ['cyl', [8, 9, 36, 16], [26.5, 18, 28], [1.047, 0, 0], 'body'],
        // thumb
        ['sphere', [14, 16, 16], [-42, 6, 8], [0, 0, 0], 'body'],
        ['cyl', [9, 10, 32, 16], [-28, 22, 24], [0.524, 0, -0.785], 'body'],
        // crest on the back of the hand
        ['torus', [16, 2.5, 16, 32], [0, 0, -26], [0, 0, 0], 'core'],
        ['box', [34, 4, 3], [0, 16, -26], [0, 0, 0], 'core'],
        ['box', [34, 4, 3], [0, -16, -26], [0, 0, 0], 'core']
      ]}
    ]
  },
  shield: {
    name: 'AEGIS SHIELD', emoji: '🛡️', sfx: 'clang', anim: 'spinZ',
    parts: [
      ['cyl', [75, 80, 8, 32], [0, 0, 0], [1.571, 0, 0], 'body'],
      ['cyl', [75, 80, 8, 32], [0, 0, 0], [1.571, 0, 0], 'body', 1],
      ['torus', [82, 3.5, 16, 32], [0, 0, 0], [0, 0, 0], 'core'],
      ['torus', [28, 3, 16, 32], [0, 0, 6], [0, 0, 0], 'core'],
      ['box', [54, 5, 4], [0, 26, 6], [0, 0, 0], 'core'],
      ['box', [54, 5, 4], [0, -26, 6], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: null, spinIdle: 0.8, parts: [
        // 6 crest spikes, one per hour of the compass
        ['cone', [8, 28, 16], [88, 0, 0], [0, 0, -1.571], 'core'],
        ['cone', [8, 28, 16], [44, 76, 0], [0, 0, -1.047], 'core'],
        ['cone', [8, 28, 16], [-44, 76, 0], [0, 0, -2.094], 'core'],
        ['cone', [8, 28, 16], [-88, 0, 0], [0, 0, 1.571], 'core'],
        ['cone', [8, 28, 16], [-44, -76, 0], [0, 0, 2.094], 'core'],
        ['cone', [8, 28, 16], [44, -76, 0], [0, 0, 1.047], 'core']
      ]}
    ]
  },
  battery: {
    name: 'POWER BATTERY', emoji: '🏮', sfx: 'chime', anim: 'spinY',
    parts: [
      ['cyl', [35, 45, 18, 32], [0, -45, 0], [0, 0, 0], 'body'],
      ['sphere', [44, 32, 32], [0, 0, 0], [0, 0, 0], 'body', 1],
      ['cyl', [28, 38, 14, 32], [0, 48, 0], [0, 0, 0], 'body'],
      ['torus', [26, 4, 16, 32], [0, 0, 36], [0, 0, 0], 'core'],
      ['sphere', [16, 16, 16], [0, 0, 24], [0, 0, 0], 'core'],
      ['torus', [38, 4, 16, 32], [0, 56, 0], [3.142, 0, 0], 'body']
    ]
  },
  sword: {
    name: 'BROADSWORD', emoji: '⚔️', sfx: 'slash', anim: 'wobble',
    parts: [
      ['sphere', [9, 16, 16], [0, -85, 0], [0, 0, 0], 'body'],
      ['cyl', [5.5, 6, 42, 16], [0, -62, 0], [0, 0, 0], 'body'],
      ['box', [64, 8, 12], [0, -38, 0], [0, 0, 0], 'core'],
      ['box', [16, 160, 4], [0, 48, 0], [0, 0, 0], 'body'],
      ['box', [4, 155, 6], [0, 48, 0], [0, 0, 0], 'core'],
      ['cone', [12, 34, 4], [0, 144, 0], [0, 0, 0.785], 'body']
    ]
  },
  gatling: {
    name: 'GATLING CANNON', emoji: '💥', sfx: 'shot', anim: 'wobble',
    parts: [
      ['box', [44, 44, 60], [0, 0, 0], [0, 0, 0], 'body'],
      ['cyl', [24, 24, 26, 24], [30, -12, 0], [0, 0, 1.571], 'body']
    ],
    groups: [
      { spinAxis: 'z', spinIdle: 4, spinFire: 26, parts: [
        ['cyl', [3.5, 3.5, 120, 16], [16, 0, 85], [1.571, 0, 0], 'core'],
        ['cyl', [3.5, 3.5, 120, 16], [-8, 13.9, 85], [1.571, 0, 0], 'core'],
        ['cyl', [3.5, 3.5, 120, 16], [-8, -13.9, 85], [1.571, 0, 0], 'core'],
        ['cyl', [3.5, 3.5, 120, 16], [-16, 0, 85], [1.571, 0, 0], 'core'],
        ['cyl', [3.5, 3.5, 120, 16], [-8, -13.9, 85], [1.571, 0, 0], 'core'],
        ['cyl', [3.5, 3.5, 120, 16], [8, -13.9, 85], [1.571, 0, 0], 'core']
      ]}
    ]
  },

  /* ======================== BLUE (HOPE) ======================= */
  hope_lantern: {
    name: 'HOPE LANTERN', emoji: '🕯️', sfx: 'chime', anim: 'spinY',
    parts: [
      ['cyl', [24, 32, 14, 24], [0, -40, 0], [0, 0, 0], 'body'],
      ['sphere', [30, 24, 24], [0, 0, 0], [0, 0, 0], 'body', 1],
      ['cyl', [20, 28, 12, 24], [0, 38, 0], [0, 0, 0], 'body'],
      ['torus', [34, 3, 12, 24], [0, 46, 0], [3.142, 0, 0], 'body'],
      // the flame of hope: a bright teardrop of light
      ['cone', [12, 30, 16], [0, 12, 0], [0, 0, 0], 'core'],
      ['sphere', [8, 16, 16], [0, -2, 0], [0, 0, 0], 'core']
    ]
  },
  hope_shield: {
    name: 'HOPE SHIELD', emoji: '🛡️', sfx: 'clang', anim: 'spinZ',
    parts: [
      ['sphere', [70, 24, 24], [0, 0, 0], [0, 0, 0], 'body'],
      ['sphere', [70, 24, 24], [0, 0, 0], [0, 0, 0], 'body', 1],
      ['torus', [72, 3, 12, 32], [0, 0, 0], [0, 0, 0], 'core'],
      ['torus', [22, 2.5, 12, 24], [0, 0, 8], [0, 0, 0], 'core'],
      ['box', [44, 4, 3], [0, 20, 8], [0, 0, 0], 'core'],
      ['box', [44, 4, 3], [0, -20, 8], [0, 0, 0], 'core']
    ]
  },
  anchor: {
    name: 'ANCHOR', emoji: '⚓', sfx: 'clang', anim: 'wobble',
    parts: [
      ['cyl', [5, 5, 120, 12], [0, 10, 0], [0, 0, 0], 'body'],
      ['torus', [10, 4, 10, 12], [0, -22, 0], [0, 0, 0], 'body'],
      ['box', [40, 5, 5], [0, 52, 0], [0, 0, 0], 'body'],
      ['torus', [34, 5, 12, 24, 3.1416], [0, -34, 0], [0, 0, 3.1416], 'body'],
      ['cone', [6, 16, 8], [34, -18, 0], [0, 0, -1.2], 'core'],
      ['cone', [6, 16, 8], [0, 66, 0], [0, 0, 0], 'core'],
      ['cone', [6, 16, 8], [-34, -18, 0], [0, 0, 1.2], 'core'],
      ['sphere', [9, 16, 16], [0, 70, 0], [0, 0, 0], 'core']
    ]
  },
  lifeline: {
    name: 'LIFELINE', emoji: '🪢', sfx: 'throw', anim: 'wobble',
    parts: [
      ['cyl', [14, 20, 30, 16], [0, 20, 0], [0, 0, 0], 'body'],
      ['torus', [16, 3, 12, 20], [0, 34, 0], [1.571, 0, 0], 'body'],
      ['sphere', [10, 16, 16], [0, -6, 0], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'z', spinIdle: -2, parts: [
        ['torus', [10, 2.5, 10, 20], [0, -22, 0], [0, 0.3, 0], 'core'],
        ['torus', [9, 2.5, 10, 20], [16, -50, 0], [0.3, 0, 0], 'core'],
        ['torus', [8, 2.5, 10, 20], [34, -76, 0], [0.3, 0, 0], 'core'],
        ['sphere', [8, 16, 16], [54, -100, 0], [0, 0, 0], 'core']
      ]}
    ]
  },
  fountain: {
    name: 'FOUNTAIN OF HOPE', emoji: '⛲', sfx: 'whoosh', anim: 'throb',
    parts: [
      ['cyl', [26, 34, 16, 24], [0, -46, 0], [0, 0, 0], 'body'],
      ['cyl', [12, 16, 60, 16], [0, -8, 0], [0, 0, 0], 'body']
    ],
    groups: [
      { spinAxis: 'y', spinIdle: 1.6, parts: [
        ['cone', [9, 70, 12], [0, 40, 24], [0.5, 0, 0], 'core'],
        ['cone', [9, 70, 12], [0, 40, -24], [-0.5, 0, 0], 'core'],
        ['cone', [9, 70, 12], [24, 40, 0], [0, 0, -0.5], 'core'],
        ['cone', [9, 70, 12], [-24, 40, 0], [0, 0, 0.5], 'core'],
        ['sphere', [12, 16, 16], [0, 84, 0], [0, 0, 0], 'core']
      ]}
    ]
  },

  /* ======================== RED (RAGE) ======================= */
  flame_fist: {
    name: 'FLAME FIST', emoji: '🔥', sfx: 'impact', anim: 'swing',
    parts: [
      ['box', [66, 58, 48], [0, 0, 0], [0, 0, 0], 'body'],
      ['box', [66, 58, 48], [0, 0, 0], [0, 0, 0], 'body', 1]
    ],
    groups: [
      { spinAxis: null, parts: [
        ['sphere', [13, 16, 16], [-24, 30, 12], [0, 0, 0], 'core'],
        ['sphere', [13, 16, 16], [-8, 30, 12], [0, 0, 0], 'core'],
        ['sphere', [13, 16, 16], [8, 30, 12], [0, 0, 0], 'core'],
        ['sphere', [13, 16, 16], [24, 30, 12], [0, 0, 0], 'core'],
        ['cyl', [9, 10, 34, 16], [-24, 16, 26], [1.047, 0, 0], 'body'],
        ['cyl', [9, 10, 34, 16], [24, 16, 26], [1.047, 0, 0], 'body'],
        ['sphere', [15, 16, 16], [-40, 4, 8], [0, 0, 0], 'body'],
        // licks of fire licking off the knuckles
        ['cone', [9, 40, 12], [-24, 52, 12], [0, 0, 0], 'core'],
        ['cone', [9, 40, 12], [0, 54, 12], [0, 0, 0], 'core'],
        ['cone', [9, 40, 12], [24, 52, 12], [0, 0, 0], 'core']
      ]}
    ]
  },
  fire_cannon: {
    name: 'FIRE CANNON', emoji: '🔥', sfx: 'shot', anim: 'wobble',
    parts: [
      ['box', [40, 40, 56], [0, 0, 0], [0, 0, 0], 'body'],
      ['cyl', [14, 14, 110, 20], [0, 0, 78], [1.571, 0, 0], 'body'],
      ['cyl', [18, 12, 16, 20], [0, 0, 128], [1.571, 0, 0], 'core'],
      ['sphere', [20, 16, 16], [0, -26, -6], [0, 0, 0], 'core']
    ]
  },
  barb_lasso: {
    name: 'BARB LASSO', emoji: '🪢', sfx: 'throw', anim: 'spinZ',
    parts: [
      ['torus', [30, 3.5, 12, 24], [0, 0, 0], [1.571, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'y', spinIdle: 3, parts: [
        ['cone', [5, 22, 8], [30, 0, 8], [0, 0, -1.571], 'core'],
        ['cone', [5, 22, 8], [-15, 26, 8], [0, 0, -1.571], 'core'],
        ['cone', [5, 22, 8], [-15, -26, 8], [0, 0, -1.571], 'core']
      ]}
    ]
  },
  blazing_shield: {
    name: 'BLAZING SHIELD', emoji: '🔥', sfx: 'roar', anim: 'spinZ',
    parts: [
      ['cyl', [72, 78, 10, 32], [0, 0, 0], [1.571, 0, 0], 'body'],
      ['cyl', [72, 78, 10, 32], [0, 0, 0], [1.571, 0, 0], 'body', 1],
      ['torus', [80, 4, 16, 32], [0, 0, 0], [0, 0, 0], 'core'],
      ['sphere', [24, 20, 20], [0, 0, 8], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: null, spinIdle: 2.4, parts: [
        ['cone', [10, 34, 12], [80, 0, 0], [0, 0, -1.571], 'core'],
        ['cone', [10, 34, 12], [-40, 69, 0], [0, 0, -1.571], 'core'],
        ['cone', [10, 34, 12], [-40, -69, 0], [0, 0, -1.571], 'core'],
        ['cone', [10, 34, 12], [-80, 0, 0], [0, 0, 1.571], 'core']
      ]}
    ]
  },
  meteor: {
    name: 'METEOR', emoji: '☄️', sfx: 'roar', anim: 'spinZ',
    parts: [
      ['sphere', [46, 32, 32], [0, 0, 0], [0, 0, 0], 'body'],
      ['sphere', [46, 32, 32], [0, 0, 0], [0, 0, 0], 'body', 1],
      ['torus', [34, 4, 16, 32], [0, 0, 34], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'z', spinIdle: 5, parts: [
        ['cone', [16, 130, 14], [0, 0, -120], [1.571, 0, 0], 'core'],
        ['cone', [10, 90, 10], [22, 0, -104], [1.571, 0.3, 0], 'core'],
        ['cone', [10, 90, 10], [-22, 0, -104], [1.571, -0.3, 0], 'core']
      ]}
    ]
  },

  /* ======================== YELLOW (FEAR) ======================= */
  hand_of_fear: {
    name: 'HAND OF FEAR', emoji: '✋', sfx: 'terror', anim: 'swing',
    parts: [
      ['box', [50, 42, 34], [0, -10, 0], [0, 0, 0], 'body'],
      ['box', [50, 42, 34], [0, -10, 0], [0, 0, 0], 'body', 1]
    ],
    groups: [
      { spinAxis: null, parts: [
        // five splayed claw fingers
        ['cyl', [5, 6, 52, 12], [-19, 26, 4], [0, 0, 0.25], 'body'],
        ['cyl', [5, 6, 58, 12], [-6.5, 28, 2], [0, 0, 0.08], 'body'],
        ['cyl', [5, 6, 58, 12], [6.5, 28, 2], [0, 0, -0.08], 'body'],
        ['cyl', [5, 6, 52, 12], [19, 26, 4], [0, 0, -0.25], 'body'],
        ['cyl', [5, 6, 38, 12], [-26, 4, 16], [0.5, 0, 0.6], 'body'],
        ['cone', [4, 16, 8], [-19, 58, 4], [0, 0, 0.25], 'core'],
        ['cone', [4, 16, 8], [-6.5, 63, 2], [0, 0, 0.08], 'core'],
        ['cone', [4, 16, 8], [6.5, 63, 2], [0, 0, -0.08], 'core'],
        ['cone', [4, 16, 8], [19, 58, 4], [0, 0, -0.25], 'core'],
        // grinning maw across the palm
        ['torus', [14, 2.5, 10, 20], [0, -10, 20], [0, 0, 0], 'core'],
        ['cone', [3, 12, 6], [-8, -12, 20], [0, 0, 0], 'core'],
        ['cone', [3, 12, 6], [-2.7, -12, 20], [0, 0, 0], 'core'],
        ['cone', [3, 12, 6], [2.7, -12, 20], [0, 0, 0], 'core'],
        ['cone', [3, 12, 6], [8, -12, 20], [0, 0, 0], 'core']
      ]}
    ]
  },
  fear_grenade: {
    name: 'FEAR GRENADE', emoji: '💣', sfx: 'terror', anim: 'spinY',
    parts: [
      ['sphere', [30, 24, 24], [0, -14, 0], [0, 0, 0], 'body'],
      ['sphere', [30, 24, 24], [0, -14, 0], [0, 0, 0], 'body', 1],
      ['cyl', [12, 16, 16, 12], [0, 18, 0], [0, 0, 0], 'body'],
      ['torus', [14, 2.5, 10, 16], [0, 30, 0], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'y', spinIdle: 6, parts: [
        ['sphere', [7, 12, 12], [0, 42, 0], [0, 0, 0], 'core'],
        ['torus', [20, 2, 10, 20], [0, 42, 0], [0.4, 0.3, 0], 'core']
      ]}
    ]
  },
  slithering_abyss: {
    name: 'SLITHERING ABYSS', emoji: '🐍', sfx: 'terror', anim: 'swing',
    parts: [
      ['sphere', [40, 28, 28], [0, 0, 0], [0, 0, 0], 'body']
    ],
    groups: [
      { spinAxis: 'z', spinIdle: 1.2, parts: [
        ['sphere', [24, 16, 16], [0, -44, 0], [0, 0, 0], 'body'],
        ['sphere', [18, 14, 14], [14, -80, 0], [0, 0, 0], 'body'],
        ['sphere', [14, 12, 12], [28, -106, 0], [0, 0, 0], 'core'],
        ['cone', [6, 20, 8], [28, -124, 0], [0, 0, 0], 'core'],
        // gaping mouth
        ['torus', [12, 2.5, 10, 16], [40, -100, 0], [0, 1.2, 0], 'core']
      ]}
    ]
  },
  shock_beat: {
    name: 'SHOCK BEAT', emoji: '🫀', sfx: 'impact', anim: 'throb',
    parts: [
      ['sphere', [42, 30, 30], [0, 0, 0], [0, 0, 0], 'body'],
      ['sphere', [42, 30, 30], [0, 0, 0], [0, 0, 0], 'body', 1],
      ['cyl', [8, 8, 60, 12], [-24, 40, 0], [0, 0, 0.5], 'core'],
      ['cyl', [8, 8, 60, 12], [24, 40, 0], [0, 0, -0.5], 'core'],
      ['cyl', [8, 8, 60, 12], [0, -40, 0], [0, 0, 1.571], 'core'],
      ['sphere', [10, 14, 14], [0, 0, 30], [0, 0, 0], 'core']
    ]
  },
  shrieking_shriek: {
    name: 'SHRIEKING SHRIEK', emoji: '📢', sfx: 'terror', anim: 'throb',
    parts: [
      ['cone', [40, 80, 24], [0, -20, 0], [0, 0, 0], 'body'],
      ['cone', [40, 80, 24], [0, -20, 0], [0, 0, 0], 'body', 1],
      ['torus', [40, 4, 12, 24], [0, 20, 0], [1.571, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'z', spinIdle: 0, parts: [
        ['torus', [52, 2, 10, 24], [0, 26, 0], [0, 0, 0], 'core'],
        ['torus', [66, 1.5, 10, 24], [0, 26, 0], [0, 0, 0], 'core'],
        ['torus', [80, 1, 10, 24], [0, 26, 0], [0, 0, 0], 'core']
      ]}
    ]
  },

  /* ======================== WHITE (LIFE) ======================= */
  hand_of_life: {
    name: 'HAND OF LIFE', emoji: '🤲', sfx: 'chime', anim: 'swing',
    parts: [
      ['box', [52, 46, 32], [0, -8, 0], [0, 0, 0], 'body'],
      ['box', [52, 46, 32], [0, -8, 0], [0, 0, 0], 'body', 1]
    ],
    groups: [
      { spinAxis: null, parts: [
        ['cyl', [6, 7, 50, 12], [-19, 28, 0], [0, 0, 0.2], 'body'],
        ['cyl', [6, 7, 56, 12], [-6.5, 30, 0], [0, 0, 0.05], 'body'],
        ['cyl', [6, 7, 56, 12], [6.5, 30, 0], [0, 0, -0.05], 'body'],
        ['cyl', [6, 7, 50, 12], [19, 28, 0], [0, 0, -0.2], 'body'],
        ['cyl', [6, 7, 40, 12], [-27, 4, 10], [0.4, 0, 0.5], 'body'],
        // life sprouts as glowing buds on each fingertip
        ['sphere', [8, 14, 14], [-19, 54, 0], [0, 0, 0], 'core'],
        ['sphere', [8, 14, 14], [-6.5, 58, 0], [0, 0, 0], 'core'],
        ['sphere', [8, 14, 14], [6.5, 58, 0], [0, 0, 0], 'core'],
        ['sphere', [8, 14, 14], [19, 54, 0], [0, 0, 0], 'core'],
        ['torus', [16, 2.5, 10, 20], [0, -8, 18], [0, 0, 0], 'core']
      ]}
    ]
  },
  healing_glove: {
    name: 'HEALING GLOVE', emoji: '🩹', sfx: 'chime', anim: 'swing',
    parts: [
      ['sphere', [40, 28, 28], [0, -20, 0], [0, 0, 0], 'body'],
      ['sphere', [40, 28, 28], [0, -20, 0], [0, 0, 0], 'body', 1],
      ['torus', [42, 3, 12, 24], [0, 6, 0], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: null, parts: [
        ['cyl', [5, 6, 40, 10], [-16, 14, 0], [0, 0, 0.2], 'body'],
        ['cyl', [5, 6, 44, 10], [-5.5, 16, 0], [0, 0, 0.05], 'body'],
        ['cyl', [5, 6, 44, 10], [5.5, 16, 0], [0, 0, -0.05], 'body'],
        ['cyl', [5, 6, 40, 10], [16, 14, 0], [0, 0, -0.2], 'body'],
        ['box', [8, 20, 4], [0, -20, 30], [0, 0, 0], 'core'],
        ['box', [20, 8, 4], [0, -20, 30], [0, 0, 0], 'core']
      ]}
    ]
  },
  life_cannon: {
    name: 'LIFE CANNON', emoji: '🌱', sfx: 'shot', anim: 'wobble',
    parts: [
      ['box', [42, 42, 54], [0, 0, 0], [0, 0, 0], 'body'],
      ['cyl', [16, 16, 100, 20], [0, 0, 76], [1.571, 0, 0], 'body'],
      ['torus', [20, 3, 12, 20], [0, 0, 122], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'z', spinIdle: 0, parts: [
        ['cone', [10, 60, 10], [0, 0, 166], [1.571, 0, 0], 'core'],
        ['sphere', [8, 12, 12], [0, 0, 196], [0, 0, 0], 'core']
      ]}
    ]
  },
  protective_aura: {
    name: 'PROTECTIVE AURA', emoji: '🔮', sfx: 'chime', anim: 'throb',
    parts: [
      ['sphere', [64, 32, 32], [0, 0, 0], [0, 0, 0], 'body', 1]
    ],
    groups: [
      { spinAxis: 'y', spinIdle: 1.1, parts: [
        ['torus', [62, 2.5, 12, 32], [0, 0, 0], [1.571, 0, 0], 'core'],
        ['torus', [50, 2, 12, 32], [0, 0, 0], [0.5, 0, 0], 'core'],
        ['torus', [38, 2, 12, 32], [0, 0, 0], [0.9, 0.6, 0], 'core'],
        ['sphere', [12, 16, 16], [0, 0, 0], [0, 0, 0], 'core']
      ]}
    ]
  },
  wave_of_life: {
    name: 'WAVE OF LIFE', emoji: '🌊', sfx: 'whoosh', anim: 'swing',
    parts: [
      ['sphere', [60, 16, 24], [0, 0, 0], [0, 0, 0], 'body'],
      ['sphere', [60, 16, 24], [0, 0, 0], [0, 0, 0], 'body', 1],
      ['torus', [62, 3, 12, 32], [0, 0, 0], [1.571, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: null, spinIdle: 0, parts: [
        ['torus', [40, 2.5, 10, 24], [0, 12, 6], [1.571, 0, 0.2], 'core'],
        ['torus', [26, 2, 10, 24], [0, 20, 10], [1.571, 0, 0.3], 'core'],
        ['cone', [8, 30, 10], [60, 6, 0], [0, 0, -1.571], 'core']
      ]}
    ]
  },

  /* ======================== BLACK (DEATH) ======================= */
  hand_of_death: {
    name: 'HAND OF DEATH', emoji: '💀', sfx: 'death', anim: 'swing',
    parts: [
      ['box', [54, 46, 34], [0, -8, 0], [0, 0, 0], 'body'],
      ['box', [54, 46, 34], [0, -8, 0], [0, 0, 0], 'body', 1]
    ],
    groups: [
      { spinAxis: null, parts: [
        ['cyl', [5, 6, 54, 12], [-19, 30, 0], [0, 0, 0.2], 'body'],
        ['cyl', [5, 6, 58, 12], [-6.5, 32, 0], [0, 0, 0.05], 'body'],
        ['cyl', [5, 6, 58, 12], [6.5, 32, 0], [0, 0, -0.05], 'body'],
        ['cyl', [5, 6, 54, 12], [19, 30, 0], [0, 0, -0.2], 'body'],
        ['cyl', [5, 6, 40, 12], [-27, 4, 12], [0.4, 0, 0.5], 'body'],
        ['cone', [4, 18, 8], [-19, 62, 0], [0, 0, 0.2], 'core'],
        ['cone', [4, 18, 8], [-6.5, 66, 0], [0, 0, 0.05], 'core'],
        ['cone', [4, 18, 8], [6.5, 66, 0], [0, 0, -0.05], 'core'],
        ['cone', [4, 18, 8], [19, 62, 0], [0, 0, -0.2], 'core'],
        // hollow skull sockets
        ['sphere', [8, 12, 12], [-9, -4, 18], [0, 0, 0], 'core'],
        ['sphere', [8, 12, 12], [9, -4, 18], [0, 0, 0], 'core'],
        ['box', [16, 3, 3], [0, -18, 18], [0, 0, 0], 'core']
      ]}
    ]
  },
  energy_scythe: {
    name: 'ENERGY SCYTHE', emoji: '🌙', sfx: 'death', anim: 'swing',
    parts: [
      ['cyl', [6, 7, 110, 12], [0, -30, 0], [0, 0, 0], 'body'],
      ['box', [26, 5, 6], [0, 26, 0], [0, 0, 0], 'body'],
      ['sphere', [8, 14, 14], [0, -88, 0], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'y', spinIdle: 0, parts: [
        ['torus', [58, 4, 10, 28, 1.9], [30, 62, 0], [0.2, 0.6, -0.4], 'core'],
        ['torus', [44, 2.5, 10, 24, 1.7], [26, 48, 0], [0.2, 0.6, -0.4], 'core']
      ]}
    ]
  },
  reaper: {
    name: 'BLACK REAPER', emoji: '⚰️', sfx: 'death', anim: 'throb',
    parts: [
      ['sphere', [58, 36, 36], [0, 0, 0], [0, 0, 0], 'body'],
      ['sphere', [58, 36, 36], [0, 0, 0], [0, 0, 0], 'body', 1],
      ['torus', [30, 3, 12, 24], [0, 0, 30], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'z', spinIdle: 1.4, parts: [
        ['sphere', [12, 14, 14], [-12, 0, 30], [0, 0, 0], 'core'],
        ['sphere', [12, 14, 14], [12, 0, 30], [0, 0, 0], 'core'],
        ['cone', [6, 26, 8], [0, 30, 30], [0, 0, 0], 'core'],
        ['cone', [6, 26, 8], [-40, 40, 0], [0, 0, -1.1], 'core'],
        ['cone', [6, 26, 8], [40, 40, 0], [0, 0, 1.1], 'core']
      ]}
    ]
  },
  void_bubble: {
    name: 'VOID BUBBLE', emoji: '🫧', sfx: 'death', anim: 'throb',
    parts: [
      ['sphere', [62, 32, 32], [0, 0, 0], [0, 0, 0], 'body', 1],
      ['torus', [64, 2, 10, 32], [0, 0, 0], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'z', spinIdle: 2, parts: [
        ['torus', [30, 2, 10, 24], [0, 0, 44], [0.4, 0, 0], 'core'],
        ['torus', [18, 1.5, 10, 20], [0, 0, 50], [0.8, 0, 0], 'core'],
        ['sphere', [10, 14, 14], [0, 0, 54], [0, 0, 0], 'core']
      ]}
    ]
  },
  blackout: {
    name: 'BLACKOUT', emoji: '🌑', sfx: 'death', anim: 'spinZ',
    parts: [
      ['sphere', [56, 40, 40], [0, 0, 0], [0, 0, 0], 'body'],
      ['sphere', [56, 40, 40], [0, 0, 0], [0, 0, 0], 'body', 1],
      ['torus', [58, 4, 12, 32], [0, 0, 0], [1.571, 0, 0], 'core'],
      ['torus', [24, 2.5, 10, 20], [0, 0, 40], [0, 0, 0], 'core'],
      ['box', [44, 4, 3], [0, 20, 40], [0, 0, 0], 'core'],
      ['box', [44, 4, 3], [0, -20, 40], [0, 0, 0], 'core']
    ]
  },

  /* ======================== ORANGE (AVARICE) ======================= */
  hand_of_avarice: {
    name: 'HAND OF AVARICE', emoji: '🤛', sfx: 'impact', anim: 'swing',
    parts: [
      ['box', [56, 48, 36], [0, -10, 0], [0, 0, 0], 'body'],
      ['box', [56, 48, 36], [0, -10, 0], [0, 0, 0], 'body', 1]
    ],
    groups: [
      { spinAxis: null, parts: [
        ['cyl', [6, 7, 48, 12], [-21, 26, 0], [0, 0, 0.35], 'body'],
        ['cyl', [6, 7, 52, 12], [-7, 28, 0], [0, 0, 0.12], 'body'],
        ['cyl', [6, 7, 52, 12], [7, 28, 0], [0, 0, -0.12], 'body'],
        ['cyl', [6, 7, 48, 12], [21, 26, 0], [0, 0, -0.35], 'body'],
        ['cyl', [6, 7, 38, 12], [-30, 2, 14], [0.4, 0, 0.7], 'body'],
        // coins clutched in the fist
        ['cyl', [11, 11, 2.4, 16], [-14, 22, 18], [1.571, 0, 0.4], 'core'],
        ['cyl', [11, 11, 2.4, 16], [-4, 26, 20], [1.571, 0, 0.2], 'core'],
        ['cyl', [11, 11, 2.4, 16], [7, 26, 20], [1.571, 0, -0.2], 'core'],
        ['cyl', [11, 11, 2.4, 16], [17, 22, 18], [1.571, 0, -0.4], 'core'],
        ['torus', [20, 3, 10, 20], [0, -10, 20], [0, 0, 0], 'core']
      ]}
    ]
  },
  bludgeon: {
    name: 'BLUDGEON', emoji: '🔨', sfx: 'impact', anim: 'swing',
    parts: [
      ['cyl', [6, 8, 130, 12], [0, -40, 0], [0, 0, 0], 'body'],
      ['box', [40, 34, 34], [0, 32, 0], [0, 0, 0], 'body'],
      ['box', [40, 34, 34], [0, 32, 0], [0, 0, 0], 'body', 1],
      ['sphere', [12, 14, 14], [0, -108, 0], [0, 0, 0], 'core']
    ]
  },
  rocket_fist: {
    name: 'ROCKET FIST', emoji: '🚀', sfx: 'shot', anim: 'wobble',
    parts: [
      ['sphere', [40, 28, 28], [0, 0, 0], [0, 0, 0], 'body'],
      ['sphere', [40, 28, 28], [0, 0, 0], [0, 0, 0], 'body', 1]
    ],
    groups: [
      { spinAxis: null, spinIdle: 0, parts: [
        ['cone', [16, 60, 16], [0, 0, 56], [1.571, 0, 0], 'core'],
        ['cyl', [20, 12, 12, 16], [0, 0, 26], [1.571, 0, 0], 'body'],
        ['cyl', [14, 20, 12, 16], [0, 0, 20], [1.571, 0, 0], 'body']
      ]}
    ]
  },
  golden_wrench: {
    name: 'GOLDEN WRENCH', emoji: '🔧', sfx: 'clang', anim: 'wobble',
    parts: [
      ['box', [16, 120, 12], [0, -20, 0], [0, 0, 0], 'body'],
      ['torus', [16, 5, 10, 20], [0, 44, 0], [0, 0, 0], 'body'],
      ['box', [34, 10, 12], [10, 60, 0], [0, 0, 0.4], 'core'],
      ['sphere', [8, 12, 12], [0, -88, 0], [0, 0, 0], 'core']
    ]
  },
  money_cannon: {
    name: 'MONEY CANNON', emoji: '💸', sfx: 'shot', anim: 'wobble',
    parts: [
      ['box', [40, 40, 52], [0, 0, 0], [0, 0, 0], 'body'],
      ['cyl', [18, 18, 96, 20], [0, 0, 72], [1.571, 0, 0], 'body'],
      ['torus', [22, 3, 12, 20], [0, 0, 118], [0, 0, 0], 'core']
    ],
    groups: [
      { spinAxis: 'y', spinIdle: 2.2, parts: [
        ['cyl', [16, 16, 2, 16], [0, 0, 176], [0, 0, 0.6], 'core'],
        ['cyl', [16, 16, 2, 16], [0, 0, 200], [0, 0, 1.1], 'core'],
        ['cyl', [16, 16, 2, 16], [0, 0, 224], [0, 0, 1.6], 'core']
      ]}
    ]
  }
};

/* -------------------------------------------------------------
   CORPS REGISTRY
   `oath.lines` are the subtitles; `oath.lineWeights` let audio.js lay the
   subtitles across the real duration of the neural track (no hardcoded
   millisecond schedule, so regenerating an oath never desyncs the text).
   ------------------------------------------------------------- */
const CORPS = {
  green: {
    ...CORPS_PALETTES.green,
    oath: {
      audio: 'audio/oath_natural_raw.mp3',
      lines: [
        'In brightest day, in blackest night,',
        'No evil shall escape my sight.',
        "Let those who worship evil's might,",
        "Beware my power, Green Lantern's light!"
      ],
      lineWeights: [3.1, 2.4, 2.5, 3.2],
      leadIn: 0.18,
      climaxFromLast: 0.30
    },
    constructs: ['fist', 'shield', 'battery', 'sword', 'gatling'],
    hookline: 'You are the will that lights the ring. Raise both hands to channel the green light of willpower.'
  },
  blue: {
    ...CORPS_PALETTES.blue,
    oath: {
      audio: 'audio/oath_blue_hope.mp3',
      // Green Lantern vol. 4 #36 (Dec 2008) - Ganthet & Sayd
      lines: [
        'In fearful day, in raging night,',
        'With strong hearts full, our souls ignite.',
        'When all seems lost in the War of Light,',
        'Look to the stars \u2014 for hope burns bright!'
      ],
      lineWeights: [2.8, 3.0, 3.2, 3.0],
      leadIn: 0.2,
      climaxFromLast: 0.28
    },
    constructs: ['hope_lantern', 'hope_shield', 'anchor', 'lifeline', 'fountain'],
    hookline: 'You are the hope that burns when all seems lost. Raise both hands.'
  },
  red: {
    ...CORPS_PALETTES.red,
    oath: {
      audio: 'audio/oath_red_rage.mp3',
      // Green Lantern vol. 4 #25 (Jan 2008) - Atrocitus
      lines: [
        'With blood and rage of crimson red,',
        'Ripped from a corpse so freshly dead,',
        'Together with our hellish hate,',
        'We\u2019ll burn you all \u2014 that is your fate!'
      ],
      lineWeights: [2.9, 3.0, 2.6, 3.0],
      leadIn: 0.15,
      climaxFromLast: 0.26
    },
    constructs: ['flame_fist', 'fire_cannon', 'barb_lasso', 'blazing_shield', 'meteor'],
    hookline: 'You are the rage that burns for the fallen. Raise both hands and BURN.'
  },
  yellow: {
    ...CORPS_PALETTES.yellow,
    oath: {
      audio: 'audio/oath_yellow_fear.mp3',
      // Green Lantern vol. 4 #10 (May 2006) - Sinestro
      lines: [
        'In blackest day, in brightest night,',
        'Beware your fears made into light.',
        "Let those who try to stop what's right,",
        "Burn like my power \u2014 Sinestro's might!"
      ],
      lineWeights: [2.9, 3.0, 3.0, 3.1],
      leadIn: 0.2,
      climaxFromLast: 0.25
    },
    constructs: ['hand_of_fear', 'fear_grenade', 'slithering_abyss', 'shock_beat', 'shrieking_shriek'],
    hookline: 'You are the fear that disciplines the universe. Raise both hands.'
  },
  white: {
    ...CORPS_PALETTES.white,
    oath: {
      audio: 'audio/oath_white_life.mp3',
      // Blackest Night #7 (Apr 2010)
      lines: [
        'In brightest day, in darkest night,',
        'Let my ring shine the brightest light.',
        'When evil comes, I will join the fight,',
        'The power of the White Lanterns is the strongest might!'
      ],
      lineWeights: [2.7, 3.0, 3.0, 3.6],
      leadIn: 0.2,
      climaxFromLast: 0.32
    },
    constructs: ['hand_of_life', 'healing_glove', 'life_cannon', 'protective_aura', 'wave_of_life'],
    hookline: 'You are the light of life itself. Raise both hands and let everything grow.'
  },
  black: {
    ...CORPS_PALETTES.black,
    oath: {
      audio: 'audio/oath_black_death.mp3',
      // Green Lantern: Secret Origin (2008) - Black Hand
      lines: [
        'The Blackest Night falls from the skies,',
        'The darkness grows as all light dies.',
        'We crave your hearts and your demise,',
        'By my black hand, the dead shall rise!'
      ],
      lineWeights: [3.0, 3.0, 2.8, 3.2],
      leadIn: 0.28,
      climaxFromLast: 0.34
    },
    constructs: ['hand_of_death', 'energy_scythe', 'reaper', 'void_bubble', 'blackout'],
    hookline: 'You are the silence that ends the unjust. Raise both hands and reap.'
  },
  orange: {
    ...CORPS_PALETTES.orange,
    oath: {
      audio: 'audio/oath_orange_avarice.mp3',
      // Green Lantern vol. 4 #39 (Apr 2009) - Larfleeze
      lines: [
        "What's mine is mine and mine and mine.",
        'And mine and mine and mine!',
        'Not yours!'
      ],
      lineWeights: [3.4, 3.0, 2.4],
      leadIn: 0.18,
      climaxFromLast: 0.28
    },
    constructs: ['hand_of_avarice', 'bludgeon', 'rocket_fist', 'golden_wrench', 'money_cannon'],
    hookline: 'You are the hunger that hoards every light. Raise both hands and TAKE.'
  }
};

window.CORPS = CORPS;
window.CORPS_PALETTES = CORPS_PALETTES;
window.CONSTRUCT_LIBRARY = CONSTRUCT_LIBRARY;
