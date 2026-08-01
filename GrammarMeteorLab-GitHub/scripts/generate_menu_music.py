"""Generate the original looping main-menu soundtrack for Galaxy Patrol."""

from pathlib import Path
import wave

import numpy as np


SAMPLE_RATE = 24_000
BPM = 96
BEAT = 60 / BPM
BAR = BEAT * 4
BARS = 8
LOOP_SECONDS = BAR * BARS
LOOP_SAMPLES = round(LOOP_SECONDS * SAMPLE_RATE)
OUTPUT = Path(__file__).resolve().parents[1] / "standalone" / "assets" / "menu-space-loop.wav"


def midi(note):
    return 440.0 * (2.0 ** ((note - 69) / 12.0))


def envelope(length, attack, release):
    env = np.ones(length, dtype=np.float32)
    attack_samples = min(length, max(1, round(attack * SAMPLE_RATE)))
    release_samples = min(length, max(1, round(release * SAMPLE_RATE)))
    env[:attack_samples] = np.linspace(0, 1, attack_samples, endpoint=False)
    env[-release_samples:] *= np.linspace(1, 0, release_samples, endpoint=False)
    return env


def add_tone(track, start, duration, note, amplitude, voice="bell"):
    begin = round(start * SAMPLE_RATE)
    source_offset = max(0, -begin)
    begin = max(0, begin)
    length = min(round(duration * SAMPLE_RATE) - source_offset, len(track) - begin)
    if length <= 0:
        return
    time = (np.arange(length, dtype=np.float32) + source_offset) / SAMPLE_RATE
    frequency = midi(note)

    if voice == "pad":
        wave_data = (
            np.sin(2 * np.pi * frequency * time)
            + 0.34 * np.sin(2 * np.pi * frequency * 1.004 * time + 0.7)
            + 0.18 * np.sin(2 * np.pi * frequency * 2 * time + 0.25)
        ) / 1.52
        env = envelope(length, 0.32, 0.55)
        shimmer = 0.9 + 0.1 * np.sin(2 * np.pi * 0.18 * time)
        wave_data *= shimmer
    elif voice == "bass":
        pitch_drop = frequency * (1 + 0.035 * np.exp(-time * 13))
        phase = 2 * np.pi * np.cumsum(pitch_drop) / SAMPLE_RATE
        wave_data = np.sin(phase) + 0.22 * np.sin(phase * 2)
        env = envelope(length, 0.015, min(0.22, duration * 0.55))
    elif voice == "lead":
        vibrato = 1 + 0.003 * np.sin(2 * np.pi * 5.2 * time)
        phase = 2 * np.pi * np.cumsum(frequency * vibrato) / SAMPLE_RATE
        wave_data = (
            np.sin(phase)
            + 0.24 * np.sin(phase * 2 + 0.4)
            + 0.09 * np.sin(phase * 3 + 1.1)
        ) / 1.28
        env = envelope(length, 0.025, min(0.2, duration * 0.45))
    else:
        wave_data = (
            np.sin(2 * np.pi * frequency * time)
            + 0.33 * np.sin(2 * np.pi * frequency * 2 * time + 0.5)
            + 0.16 * np.sin(2 * np.pi * frequency * 3 * time + 1.2)
        ) / 1.45
        env = envelope(length, 0.008, min(0.24, duration * 0.52))

    track[begin : begin + length] += amplitude * wave_data * env


def add_kick(track, start, amplitude=0.2):
    begin = round(start * SAMPLE_RATE)
    length = min(round(0.28 * SAMPLE_RATE), len(track) - begin)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    frequency = 44 + 96 * np.exp(-time * 18)
    phase = 2 * np.pi * np.cumsum(frequency) / SAMPLE_RATE
    body = np.sin(phase) * np.exp(-time * 13)
    click = np.sin(2 * np.pi * 820 * time) * np.exp(-time * 75)
    track[begin : begin + length] += amplitude * (body + 0.09 * click)


def add_snare(track, start, seed, amplitude=0.095):
    begin = round(start * SAMPLE_RATE)
    length = min(round(0.24 * SAMPLE_RATE), len(track) - begin)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    noise = np.random.default_rng(seed).normal(0, 1, length).astype(np.float32)
    bright_noise = noise - np.concatenate(([0], noise[:-1]))
    snap = bright_noise * np.exp(-time * 17)
    tone = np.sin(2 * np.pi * 185 * time) * np.exp(-time * 14)
    track[begin : begin + length] += amplitude * (0.36 * snap + 0.72 * tone)


def add_hat(track, start, seed, amplitude=0.022):
    begin = round(start * SAMPLE_RATE)
    length = min(round(0.07 * SAMPLE_RATE), len(track) - begin)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    noise = np.random.default_rng(seed).normal(0, 1, length).astype(np.float32)
    bright_noise = noise - np.concatenate(([0], noise[:-1]))
    track[begin : begin + length] += amplitude * bright_noise * np.exp(-time * 52)


def render_loop():
    render_samples = LOOP_SAMPLES * 3
    music = np.zeros(render_samples, dtype=np.float32)

    chords = [
        (60, 64, 67, 71), (55, 59, 62, 69), (57, 60, 64, 67), (53, 57, 60, 64),
        (52, 60, 64, 67), (55, 59, 62, 67), (57, 60, 64, 69), (53, 57, 60, 65),
    ]
    roots = [36, 31, 33, 29, 28, 31, 33, 29]
    melody = [
        76, 79, 83, 79, 74, 79, 81, 79,
        76, 72, 76, 79, 72, 76, 77, 76,
        79, 83, 84, 83, 79, 81, 86, 83,
        81, 79, 76, 72, 77, 76, 74, 71,
    ]

    for repetition in range(3):
        offset = repetition * LOOP_SECONDS
        for bar_index, chord in enumerate(chords):
            bar_start = offset + bar_index * BAR

            for note in chord:
                add_tone(music, bar_start - 0.06, BAR + 0.24, note, 0.032, "pad")
                add_tone(music, bar_start - 0.04, BAR + 0.2, note - 12, 0.012, "pad")

            for beat_index in range(4):
                beat_start = bar_start + beat_index * BEAT
                add_tone(music, beat_start, BEAT * 0.68, roots[bar_index], 0.075, "bass")
                add_kick(music, beat_start, 0.13 if beat_index in (0, 2) else 0.075)
                if beat_index in (1, 3):
                    add_snare(music, beat_start, 1000 + bar_index * 10 + beat_index)

                for half in range(2):
                    step = beat_index * 2 + half
                    arp_note = chord[(step + bar_index) % len(chord)] + (12 if step % 3 else 0)
                    arp_start = beat_start + half * BEAT / 2
                    add_tone(music, arp_start, BEAT * 0.43, arp_note, 0.04, "bell")
                    add_hat(music, arp_start, 2000 + bar_index * 20 + step)

            melody_base = bar_index * 4
            for beat_index in range(4):
                lead_note = melody[melody_base + beat_index]
                lead_start = bar_start + beat_index * BEAT
                add_tone(music, lead_start + BEAT * 0.08, BEAT * 0.76, lead_note, 0.052, "lead")

            if bar_index in (1, 5, 7):
                for sparkle in range(3):
                    add_tone(
                        music,
                        bar_start + BAR * 0.68 + sparkle * 0.09,
                        0.33,
                        chord[sparkle % len(chord)] + 24,
                        0.022,
                        "bell",
                    )

    loop = music[LOOP_SAMPLES : LOOP_SAMPLES * 2].copy()
    dry = loop.copy()
    loop += np.roll(dry, round(BEAT * 0.75 * SAMPLE_RATE)) * 0.11
    loop += np.roll(dry, round(BEAT * 1.5 * SAMPLE_RATE)) * 0.055

    loop = np.tanh(loop * 1.25)
    peak = float(np.max(np.abs(loop)))
    if peak:
        loop *= 0.82 / peak
    return loop


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    audio = render_loop()
    pcm = np.int16(np.clip(audio, -1, 1) * 32767)
    with wave.open(str(OUTPUT), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(pcm.tobytes())
    print(f"Created {OUTPUT} ({len(audio) / SAMPLE_RATE:.1f}s, {OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
