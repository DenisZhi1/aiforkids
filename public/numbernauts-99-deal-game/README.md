# Numbernauts 99

Educational arcade game for practicing English numbers from 1 to 99.

## Play

Open `http://127.0.0.1:4173/` while the local server is running.

## Controls

- Mouse or touch: aim and fire the Echo Magnet.
- Speaker button: repeat the current English number.
- Pause button or `Esc`: pause and resume.
- `R`: repeat the number.
- `Enter`: start a round or play again.

## Game Loop

- Listen to and read the English number at the top of the screen.
- Catch the Numbernaut carrying the matching digits.
- Correct distant targets award more points.
- Consecutive correct answers build a combo.
- A full energy meter automatically starts four seconds of `Echo Time x2`.
- Rapid firing overheats the Echo Magnet briefly.
- Each round lasts 90 seconds by default; 60 seconds is available in Settings.

The game uses the browser's English speech voice and runs without external packages or network assets.
