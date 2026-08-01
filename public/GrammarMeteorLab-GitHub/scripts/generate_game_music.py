"""Generate the original looping in-mission soundtrack for Galaxy Patrol."""

from pathlib import Path
import wave

import numpy as np


SAMPLE_RATE = 24_000
BPM = 108
BEAT = 60 / BPM
BAR = BEAT * 4
BARS = 8
LOOP_SECONDS = BAR * BARS
LOOP_SAMPLES = round(LOOP_SECONDS * SAMPLE_RATE)
OUTPUT = Path(__file__).resolve().parents[1] / "standalone" / "assets" / "gameplay-space-loop.wav"


def midi(note):
    return 440.0 * (2.0 ** ((note - 69) / 12.0))


def envelope(length, attack, release):
    env = np.ones(length, dtype=np.float32)
    attack_samples = min(length, max(1, round(attack * SAMPLE_RATE)))
    release_samples = min(length, max(1, round(release * SAMPLE_RATE)))
    env[:attack_samples] = np.linspace(0, 1, attack_samples, endpoint=False)
    env[-release_samples:] *= np.linspace(1, 0, release_samples, endpoint=False)
    return env


def pan_signal(signal, pan):
    angle = (pan + 1) * np.pi / 4
    return np.column_stack((signal * np.cos(angle), signal * np.sin(angle)))


def add_tone(track, start, duration, note, amplitude, voice="pulse", pan=0):
    begin = round(start * SAMPLE_RATE)
    source_offset = max(0, -begin)
    begin = max(0, begin)
    length = min(round(duration * SAMPLE_RATE) - source_offset, len(track) - begin)
    if length <= 0:
        return
    time = (np.arange(length, dtype=np.float32) + source_offset) / SAMPLE_RATE
    frequency = midi(note)

    if voice == "pad":
        base = (
            np.sin(2 * np.pi * frequency * time)
            + 0.42 * np.sin(2 * np.pi * frequency * 1.005 * time + 0.55)
            + 0.16 * np.sin(2 * np.pi * frequency * 2 * time + 1.1)
        ) / 1.58
        gate = 0.78 + 0.22 * (np.sin(2 * np.pi * (2 / BEAT) * time) > -0.2)
        signal = base * gate * envelope(length, 0.12, 0.28)
    elif voice == "bass":
        frequency_curve = frequency * (1 + 0.025 * np.exp(-time * 16))
        phase = 2 * np.pi * np.cumsum(frequency_curve) / SAMPLE_RATE
        signal = (np.sin(phase) + 0.28 * np.sin(phase * 2)) * envelope(length, 0.008, 0.16)
    elif voice == "lead":
        vibrato = 1 + 0.0025 * np.sin(2 * np.pi * 5.6 * time)
        phase = 2 * np.pi * np.cumsum(frequency * vibrato) / SAMPLE_RATE
        signal = (
            np.sin(phase)
            + 0.31 * np.sin(phase * 2 + 0.2)
            + 0.12 * np.sin(phase * 3 + 0.9)
        ) / 1.38
        signal *= envelope(length, 0.018, min(0.18, duration * 0.4))
    else:
        phase = 2 * np.pi * frequency * time
        signal = (
            np.sin(phase)
            + 0.38 * np.sin(phase * 2 + 0.4)
            + 0.14 * np.sin(phase * 4 + 1.2)
        ) / 1.5
        signal *= envelope(length, 0.006, min(0.13, duration * 0.48))

    track[begin : begin + length] += amplitude * pan_signal(signal, pan)


def add_kick(track, start, amplitude=0.17):
    begin = round(start * SAMPLE_RATE)
    length = min(round(0.24 * SAMPLE_RATE), len(track) - begin)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    frequency = 48 + 105 * np.exp(-time * 21)
    phase = 2 * np.pi * np.cumsum(frequency) / SAMPLE_RATE
    signal = np.sin(phase) * np.exp(-time * 15)
    signal += 0.055 * np.sin(2 * np.pi * 1100 * time) * np.exp(-time * 90)
    track[begin : begin + length] += amplitude * pan_signal(signal, 0)


def add_snare(track, start, seed, amplitude=0.075):
    begin = round(start * SAMPLE_RATE)
    length = min(round(0.2 * SAMPLE_RATE), len(track) - begin)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    noise = np.random.default_rng(seed).normal(0, 1, length).astype(np.float32)
    bright = noise - np.concatenate(([0], noise[:-1]))
    signal = 0.34 * bright * np.exp(-time * 20)
    signal += 0.7 * np.sin(2 * np.pi * 205 * time) * np.exp(-time * 16)
    track[begin : begin + length] += amplitude * pan_signal(signal, 0.08)


def add_hat(track, start, seed, amplitude=0.016, pan=0):
    begin = round(start * SAMPLE_RATE)
    length = min(round(0.055 * SAMPLE_RATE), len(track) - begin)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    noise = np.random.default_rng(seed).normal(0, 1, length).astype(np.float32)
    bright = noise - np.concatenate(([0], noise[:-1]))
    signal = bright * np.exp(-time * 65)
    track[begin : begin + length] += amplitude * pan_signal(signal, pan)


def add_riser(track, start, duration, seed):
    begin = round(start * SAMPLE_RATE)
    length = min(round(duration * SAMPLE_RATE), len(track) - begin)
    if length <= 0:
        return
    time = np.arange(length, dtype=np.float32) / SAMPLE_RATE
    noise = np.random.default_rng(seed).normal(0, 1, length).astype(np.float32)
    bright = noise - np.concatenate(([0], noise[:-1]))
    sweep = np.linspace(0.02, 1, length, dtype=np.float32) ** 2
    signal = bright * sweep * envelope(length, 0.08, 0.06) * 0.012
    track[begin : begin + length] += pan_signal(signal, -0.35)


def render_loop():
    music = np.zeros((LOOP_SAMPLES * 3, 2), dtype=np.float32)
    chords = [
        (52, 55, 59, 64), (48, 52, 55, 59), (55, 59, 62, 67), (50, 54, 57, 62),
        (52, 55, 59, 64), (48, 52, 55, 60), (45, 52, 57, 60), (47, 51, 54, 59),
    ]
    roots = [28, 24, 31, 26, 28, 24, 33, 35]
    melody = [
        76, 79, 83, 81, 79, 76, 74, 76,
        79, 83, 86, 83, 81, 79, 78, 74,
        76, 79, 83, 88, 86, 83, 81, 79,
        81, 84, 81, 79, 78, 74, 71, 74,
    ]

    for repetition in range(3):
        offset = repetition * LOOP_SECONDS
        for bar_index, chord in enumerate(chords):
            bar_start = offset + bar_index * BAR
            for note_index, note in enumerate(chord):
                add_tone(music, bar_start - 0.04, BAR + 0.16, note, 0.022, "pad", -0.28 + note_index * 0.18)

            for beat_index in range(4):
                beat_start = bar_start + beat_index * BEAT
                for half in range(2):
                    bass_start = beat_start + half * BEAT / 2
                    add_tone(music, bass_start, BEAT * 0.36, roots[bar_index], 0.058, "bass", 0)
                add_kick(music, beat_start, 0.125 if beat_index in (0, 2) else 0.072)
                if beat_index in (1, 3):
                    add_snare(music, beat_start, 3100 + bar_index * 10 + beat_index)

                for quarter in range(4):
                    step = beat_index * 4 + quarter
                    arp_note = chord[(step + bar_index) % len(chord)] + (12 if step % 4 else 24)
                    arp_start = beat_start + quarter * BEAT / 4
                    arp_pan = -0.62 if step % 2 == 0 else 0.62
                    add_tone(music, arp_start, BEAT * 0.2, arp_note, 0.024, "pulse", arp_pan)
                    if quarter % 2 == 0:
                        add_hat(music, arp_start, 4100 + bar_index * 20 + step, 0.011, -arp_pan * 0.55)

            melody_base = bar_index * 4
            for beat_index in range(4):
                lead_note = melody[melody_base + beat_index]
                if (bar_index + beat_index) % 3 != 1:
                    add_tone(
                        music,
                        bar_start + beat_index * BEAT + BEAT * 0.06,
                        BEAT * 0.7,
                        lead_note,
                        0.035,
                        "lead",
                        0.24 if beat_index % 2 else -0.2,
                    )

            if bar_index in (3, 7):
                add_riser(music, bar_start + BAR * 0.52, BAR * 0.47, 5100 + bar_index)

    loop = music[LOOP_SAMPLES : LOOP_SAMPLES * 2].copy()
    dry = loop.copy()
    delay_one = np.roll(dry[:, ::-1], round(BEAT * 0.75 * SAMPLE_RATE), axis=0)
    delay_two = np.roll(dry, round(BEAT * 1.5 * SAMPLE_RATE), axis=0)
    loop += delay_one * 0.105 + delay_two * 0.047
    loop = np.tanh(loop * 1.28)
    peak = float(np.max(np.abs(loop)))
    if peak:
        loop *= 0.8 / peak
    return loop


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    audio = render_loop()
    pcm = np.int16(np.clip(audio, -1, 1) * 32767)
    with wave.open(str(OUTPUT), "wb") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(pcm.tobytes())
    print(f"Created {OUTPUT} ({len(audio) / SAMPLE_RATE:.2f}s, {OUTPUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
