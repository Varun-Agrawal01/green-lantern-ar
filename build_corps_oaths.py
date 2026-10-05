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
# Pitch/rate trim each voice into the register the corps is read in:
#   Hope is calm and airy, Rage is shouting, Fear is a slow whisper,
#   Life is warm, Death is hollow, Avarice is greedy and fast.
CORPS = [
    (
        "oath_blue_hope.mp3",
        "en-US-JennyNeural",
        "-8%",
        "+10Hz",
        "In broken hope, in deepest night, I shall shelter those who lack the light. "
        "Let those who wield hope's gracious might, beware my power, Blue Lantern's light!",
    ),
    (
        "oath_red_rage.mp3",
        "en-US-AriaNeural",
        "+12%",
        "+8Hz",
        "I burn. I burn. For those who walk in danger's way, I offer my blood and my life. "
        "Let anger guide me, and let my rage never cease. Burn with me. Burn with me!",
    ),
    (
        "oath_yellow_fear.mp3",
        "en-US-AndrewNeural",
        "-18%",
        "-14Hz",
        "Fear is the master. Fear is my friend. "
        "I will find you in the dark, and lock you in the quietest cell. "
        "You will know my power. You will obey.",
    ),
    (
        "oath_white_life.mp3",
        "en-US-AriaNeural",
        "-6%",
        "+2Hz",
        "Wherever life blooms, I will stand beside it. "
        "Life is the only force that matters. Life is the plan. "
        "Where life ends, I will return it to the light.",
    ),
    (
        "oath_black_death.mp3",
        "en-US-GuyNeural",
        "-22%",
        "-18Hz",
        "Death has a thousand faces. Beware mine. "
        "The dead do not speak, and neither do I. "
        "When my black light finds you, you will not rise.",
    ),
    (
        "oath_orange_avarice.mp3",
        "en-US-EricNeural",
        "+6%",
        "+6Hz",
        "Mine. Mine. All that glitters, I will take. All that glows, I will own. "
        "Your treasure is my treasure. Your light feeds my light. "
        "Mine!",
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
