#!/usr/bin/env python3
"""
Generates the per-corps oath narration with Microsoft Edge Neural TTS.

The Green Lantern track is checked in (audio/oath_natural_raw.mp3).
Every other corps gets a neural voice matching its colour and temperament,
so switching corps in the AR app plays that corps' own oath.

Usage:  pip install edge-tts
        python build_corps_oaths.py
"""

import asyncio
import os
import sys

import edge_tts

OUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "audio")

# (filename, voice, rate, pitch, text)
# The text of every oath below is the CANONIC comic line, not a paraphrase:
#   Green  - Green Lantern vol. 4 #25 (1986)   (checked-in track, not regenerated)
#   Blue   - Green Lantern vol. 4 #36 (Dec 2008), Ganthet & Sayd
#   Red    - Green Lantern vol. 4 #25 (Jan 2008), Atrocitus
#   Yellow - Green Lantern vol. 4 #10 (May 2006), Sinestro
#   White  - Blackest Night #7 (Apr 2010)
#   Black  - Green Lantern: Secret Origin (2008), Black Hand
#   Orange - Green Lantern vol. 4 #39 (Apr 2009), Larfleeze
#
# Pitch/rate trim each voice into the register the corps is read in:
#   Hope is calm and airy, Rage is shouting, Fear is a slow menace,
#   Life is warm, Death is hollow, Avarice is greedy and fast.
CORPS = [
    (
        "oath_blue_hope.mp3",
        "en-US-JennyNeural",
        "-6%",
        "+8Hz",
        "In fearful day, in raging night, "
        "With strong hearts full, our souls ignite. "
        "When all seems lost in the War of Light, "
        "Look to the stars, for hope burns bright!",
    ),
    (
        "oath_red_rage.mp3",
        "en-US-AriaNeural",
        "+14%",
        "+10Hz",
        "With blood and rage of crimson red, "
        "Ripped from a corpse so freshly dead, "
        "Together with our hellish hate, "
        "We'll burn you all, that is your fate!",
    ),
    (
        "oath_yellow_fear.mp3",
        "en-US-AndrewNeural",
        "-16%",
        "-14Hz",
        "In blackest day, in brightest night, "
        "Beware your fears made into light. "
        "Let those who try to stop what's right, "
        "Burn like my power, Sinestro's might!",
    ),
    (
        "oath_white_life.mp3",
        "en-US-AriaNeural",
        "-4%",
        "+2Hz",
        "In brightest day, in darkest night, "
        "Let my ring shine the brightest light. "
        "When evil comes, I will join the fight, "
        "The power of the White Lanterns is the strongest might!",
    ),
    (
        "oath_black_death.mp3",
        "en-US-GuyNeural",
        "-20%",
        "-18Hz",
        "The Blackest Night falls from the skies, "
        "The darkness grows as all light dies. "
        "We crave your hearts and your demise, "
        "By my black hand, the dead shall rise!",
    ),
    (
        "oath_orange_avarice.mp3",
        "en-US-EricNeural",
        "+8%",
        "+6Hz",
        "What's mine is mine and mine and mine. "
        "And mine and mine and mine! "
        "Not yours!",
    ),
]


async def build_one(filename, voice, rate, pitch, text):
    path = os.path.join(OUT_DIR, filename)
    communicate = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await communicate.save(path)
    size = os.path.getsize(path)
    print(f"  OK  {filename:26s} {size / 1024:7.1f} KB  ({voice}, rate {rate}, pitch {pitch})")


async def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Generating {len(CORPS)} corps oaths into {OUT_DIR}\n")
    for entry in CORPS:
        try:
            await build_one(*entry)
        except Exception as exc:  # network hiccup on one track shouldn't kill the rest
            print(f"  FAIL {entry[0]}: {exc}", file=sys.stderr)
    print("\nDone. Re-run any failed track individually.")


if __name__ == "__main__":
    asyncio.run(main())
