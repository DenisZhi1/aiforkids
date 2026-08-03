# Word Garden

Word Garden is a colorful browser spelling game for preschool and primary learners of English. Children look at a picture and drag or tap the correct letters into place.

## Highlights

- 260 illustrated English words
- 13 categories with 20 cards each
- drag-and-drop and tap controls
- a different card order on every category visit
- word-level progress saved in the browser
- keyboard-friendly letter controls
- responsive layout for desktop, tablet, and mobile
- a bright apple-and-W logo shared by the interface and favicon
- small custom garden cursors for mouse and trackpad users
- no framework, server, account, or installation required

## Categories

| First Words | Move & Explore | My World |
| --- | --- | --- |
| Animals | Actions | Jobs |
| Home | Weather & Seasons | Feelings |
| Food | Sports & Hobbies | Birthday & Party |
| Colours | Transport | Nature |
| Places |  |  |

## Run locally

The game is completely static and has no external runtime dependencies. You can open `index.html` directly or, if Node.js is installed, run the included local server:

```sh
npm start
```

Then open `http://127.0.0.1:8765`.

## Publish with GitHub Pages

1. Create a new GitHub repository.
2. Upload the contents of this folder to the repository root and push the `main` branch.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/(root)`, then save.

The included `.nojekyll` file keeps the deployment as a plain static site. No build workflow is required.

## Validate the release

The game itself does not require Node.js. If Node.js is available, run the included release check:

```bash
npm test
```

The validator checks JavaScript syntax, all 13 categories, 260 word entries, menu grouping, every referenced image asset, the apple logo, favicons, and custom cursors.

## Project structure

```text
.
├── index.html               # complete game UI, styles, and logic
├── assets/                  # optimized WebP background and picture atlases
├── scripts/validate.mjs     # dependency-free release validator
├── IMAGEGEN-PROMPTS.md      # generation notes for the new atlases
├── favicon.svg / .ico       # Word Garden apple favicon
├── apple-touch-icon.png     # home-screen icon for Apple devices
├── garden-*.svg             # custom mouse cursors
└── .nojekyll
```

## Privacy and compatibility

Progress is stored only in the visitor's `localStorage`. The game does not send analytics or personal information anywhere.

## Credits

Created by [deandal](https://vk.ru/deandal). The game illustrations were created with OpenAI's built-in image generation and optimized to WebP for the web release.

## License

No open-source license is included yet. Add the license you want before allowing third-party redistribution or modification.
