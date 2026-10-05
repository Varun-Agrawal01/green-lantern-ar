import os
import sys
import wave
import struct
import math
import subprocess

def generate_voice_lines():
    os.makedirs('audio', exist_ok=True)
    
    # We will generate individual lines to control exact timing and cinematic cadence
    lines = [
        ("In brightest day... in blackest night,", "line1.wav", -2),
        ("No evil shall escape my sight.", "line2.wav", -2),
        ("Let those who worship evil's might,", "line3.wav", -2),
        ("Beware my power... Green Lantern's light!", "line4.wav", -3)
    ]
    
    ps_script_path = os.path.abspath('generate_lines.ps1')
    with open(ps_script_path, 'w', encoding='utf-8') as f:
        f.write('''
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SelectVoice("Microsoft David Desktop")
''')
        for text, fname, rate in lines:
            out_path = os.path.abspath(os.path.join('audio', fname)).replace('\\', '/')
            f.write(f'''
$synth.Rate = {rate}
$synth.SetOutputToWaveFile("{out_path}")
$synth.Speak("{text}")
''')
        f.write('$synth.Dispose()\nWrite-Output "LINES_GENERATED"\n')

    subprocess.run(['powershell.exe', '-ExecutionPolicy', 'Bypass', '-File', ps_script_path], check=True)
    print("Voice lines generated successfully.")

def read_wav(filename):
    with wave.open(filename, 'rb') as w:
        nchannels = w.getnchannels()
        sampwidth = w.getsampwidth()
        framerate = w.getframerate()
        nframes = w.getnframes()
        data = w.readframes(nframes)
    
    # Unpack 16-bit PCM
    fmt = f"<{nframes * nchannels}h"
    samples = struct.unpack(fmt, data)
    
    # Convert to mono float [-1.0, 1.0]
    if nchannels == 2:
        mono = [(samples[i*2] + samples[i*2+1]) / (2.0 * 32768.0) for i in range(nframes)]
    else:
        mono = [s / 32768.0 for s in samples]
        
    return mono, framerate

def resample(samples, old_rate, new_rate):
    if old_rate == new_rate:
        return samples
    duration = len(samples) / old_rate
    new_len = int(duration * new_rate)
    resampled = [0.0] * new_len
    ratio = old_rate / new_rate
    for i in range(new_len):
        src_idx = i * ratio
        idx0 = int(src_idx)
        idx1 = min(idx0 + 1, len(samples) - 1)
        frac = src_idx - idx0
        resampled[i] = samples[idx0] * (1.0 - frac) + samples[idx1] * frac
    return resampled

def create_cinematic_mix():
    SR = 44100
    # Total oath duration approx 16 seconds
    total_duration = 17.5
    total_samples = int(total_duration * SR)
    
    mix_left = [0.0] * total_samples
    mix_right = [0.0] * total_samples
    
    # Line starting timestamps (seconds)
    line_timings = [1.2, 5.0, 9.0, 12.8]
    
    # 1. Add background cinematic drone & chords
    # Cinematic chords: Dm -> F -> Gm -> A
    chord_times = [
        (0.0, 4.8, [73.42, 110.0, 146.83, 220.0, 261.63, 329.63]),  # Dm9
        (4.8, 8.8, [87.31, 130.81, 174.61, 261.63, 329.63, 392.0]), # Fmaj7
        (8.8, 12.5, [98.0, 146.83, 196.0, 293.66, 349.23, 440.0]),  # Gm9
        (12.5, 17.5, [110.0, 164.81, 220.0, 329.63, 440.0, 554.37]) # A / A7 Climax
    ]
    
    for t_start, t_end, freqs in chord_times:
        s_start = int(t_start * SR)
        s_end = min(total_samples, int(t_end * SR))
        dur_samples = s_end - s_start
        for i in range(dur_samples):
            t = i / SR
            # Envelope (fade in / out)
            env = min(1.0, t / 0.8) * min(1.0, (dur_samples - i) / (SR * 0.8))
            sample_val = 0.0
            for fi, f in enumerate(freqs):
                # Detuned saw/sine blend
                w = math.sin(2.0 * math.pi * f * t) * 0.5 + math.sin(2.0 * math.pi * (f * 1.003) * t) * 0.3
                sample_val += w * (0.025 / math.sqrt(fi + 1))
            
            idx = s_start + i
            if idx < total_samples:
                mix_left[idx] += sample_val * env * 0.95
                mix_right[idx] += sample_val * env * 1.05

    # 2. Add Cosmic Sub-bass & Climax Impacts
    # Huge impact at start of line 4 ("BEWARE MY POWER...")
    climax_sample = int(12.8 * SR)
    impact_len = int(3.5 * SR)
    for i in range(impact_len):
        idx = climax_sample + i
        if idx < total_samples:
            t = i / SR
            # Frequency drop 120Hz -> 35Hz
            f = 120.0 * math.exp(-t * 2.5) + 38.0
            # Exponential decay
            decay = math.exp(-t * 1.2)
            sub = math.sin(2.0 * math.pi * f * t) * decay * 0.45
            mix_left[idx] += sub
            mix_right[idx] += sub

    # 3. Add Willpower Plasma Hum (pulsing 110Hz detuned)
    for i in range(total_samples):
        t = i / SR
        pulse = 0.5 + 0.5 * math.sin(2.0 * math.pi * 1.5 * t)
        hum = (math.sin(2.0 * math.pi * 110.0 * t) + math.sin(2.0 * math.pi * 112.2 * t)) * 0.02 * pulse
        mix_left[i] += hum
        mix_right[i] += hum

    # 4. Mix Voice Lines with Heroic Stereo Doubling & Cathedral Reverb
    reverb_delay = int(0.14 * SR)
    reverb_decay = 0.42

    for line_idx, (text, fname, _) in enumerate([
        ("In brightest day... in blackest night,", "line1.wav", -2),
        ("No evil shall escape my sight.", "line2.wav", -2),
        ("Let those who worship evil's might,", "line3.wav", -2),
        ("Beware my power... Green Lantern's light!", "line4.wav", -3)
    ]):
        wav_path = os.path.join('audio', fname)
        if not os.path.exists(wav_path):
            continue
        v_samples, v_rate = read_wav(wav_path)
        v_resampled = resample(v_samples, v_rate, SR)
        
        start_samp = int(line_timings[line_idx] * SR)
        boost = 1.35 if line_idx == 3 else 1.15  # Extra power for climax!
        
        for i, s in enumerate(v_resampled):
            idx = start_samp + i
            if idx < total_samples:
                # Main dry voice
                mix_left[idx] += s * 0.85 * boost
                mix_right[idx] += s * 0.85 * boost
                
                # Stereo delay / widening (slightly pitch detuned sensation)
                idx_delay_r = idx + int(0.018 * SR)
                if idx_delay_r < total_samples:
                    mix_right[idx_delay_r] += s * 0.35 * boost
                    
                idx_delay_l = idx + int(0.025 * SR)
                if idx_delay_l < total_samples:
                    mix_left[idx_delay_l] += s * 0.30 * boost

                # Cathedral reverb tail
                rev_idx = idx + reverb_delay
                if rev_idx < total_samples:
                    mix_left[rev_idx] += s * reverb_decay * 0.3
                    mix_right[rev_idx] += s * reverb_decay * 0.35
                    
                rev_idx2 = idx + int(reverb_delay * 1.8)
                if rev_idx2 < total_samples:
                    mix_left[rev_idx2] += s * (reverb_decay ** 2) * 0.2
                    mix_right[rev_idx2] += s * (reverb_decay ** 2) * 0.2

    # 5. Master Limiter & Normalization
    max_peak = 0.001
    for i in range(total_samples):
        max_peak = max(max_peak, abs(mix_left[i]), abs(mix_right[i]))
    
    gain = 0.92 / max_peak
    print(f"Max peak: {max_peak:.3f}, applying gain: {gain:.3f}")
    
    out_samples = bytearray()
    for i in range(total_samples):
        # Soft clip
        l = max(-1.0, min(1.0, mix_left[i] * gain))
        r = max(-1.0, min(1.0, mix_right[i] * gain))
        
        val_l = int(l * 32767.0)
        val_r = int(r * 32767.0)
        out_samples.extend(struct.pack('<hh', val_l, val_r))
        
    out_path = os.path.join('audio', 'green_lantern_oath_cinematic.wav')
    with wave.open(out_path, 'wb') as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(out_samples)
        
    print(f"Master cinematic track saved: {out_path} ({len(out_samples)} bytes)")

if __name__ == '__main__':
    generate_voice_lines()
    create_cinematic_mix()
