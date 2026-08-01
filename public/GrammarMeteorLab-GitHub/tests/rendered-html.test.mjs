import assert from "node:assert/strict";
import { access, readFile, readdir, stat } from "node:fs/promises";
import test from "node:test";

const projectRoot = new URL("../", import.meta.url);
const gameRoot = new URL("../standalone/", import.meta.url);
const assetsRoot = new URL("assets/", gameRoot);
const indexUrl = new URL("index.html", gameRoot);

async function gameSource() {
  return readFile(indexUrl, "utf8");
}

function withoutComments(source) {
  return source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

test("ships a complete twelve-question Galaxy Patrol mission", async () => {
  const html = await gameSource();
  const questionBlock = html.match(/const QUESTIONS = \[([\s\S]*?)\n\s*\];/);
  const questionCount = questionBlock
    ? [...questionBlock[1].matchAll(/\n\s*\{\s*visual:/g)].length
    : 0;
  const missionMarkup = html.match(/<div class="mission">([\s\S]*?)<\/div>\s*<section id="flightQuestion"/)?.[1] ?? "";

  assert.match(html, /<title>There Is \/ There Are: Galaxy Patrol<\/title>/);
  assert.match(html, /name="description"/);
  assert.equal(questionCount, 24);
  assert.match(html, /const QUESTIONS_PER_GAME = 12;/);
  assert.match(html, /id="startButton"/);
  assert.match(html, /id="pauseButton"/);
  assert.match(html, /id="resetButton"/);
  assert.match(html, /id="soundButton"/);
  assert.match(html, /id="startSoundButton"/);
  assert.match(html, /id="startVolumeSlider"/);
  assert.match(html, /id="gameVolumeSlider"/);
  assert.match(html, /id="pauseButton"[^>]*aria-label="Pause game"/);
  assert.match(html, /id="resetButton"[^>]*aria-label="Restart game"/);
  assert.match(html, /id="laserSound"[^>]*assets\/plasma-shot\.mp3/);
  assert.match(html, /id="correctSound"[^>]*assets\/correct-hit\.mp3/);
  assert.match(html, /id="wrongSound"[^>]*assets\/wrong-answer\.mp3/);
  assert.match(html, /id="finishSound"[^>]*assets\/mission-complete\.mp3/);
  assert.match(html, /id="menuMusic"[^>]*assets\/menu-space-loop\.wav/);
  assert.match(html, /id="gameMusic"[^>]*assets\/gameplay-space-loop\.wav[^>]*preload="none"/);
  assert.match(html, /SOUND_SETTINGS_KEY = "galaxy-patrol-sound"/);
  assert.match(html, /function syncSoundControls\(\)/);
  assert.match(html, /function syncGameMusic\(\)/);
  assert.match(html, /<section id="flightQuestion"[\s\S]*?<div class="hud-meters" aria-label="Game status">/);
  assert.doesNotMatch(missionMarkup, /hud-meters/);
  assert.match(html, /addEventListener\("keydown"/);
  assert.match(html, /height:100svh; min-height:0; overflow:hidden/);
  assert.match(html, /field\.focus\(\{ preventScroll:true \}\)/);
  assert.match(html, /prefers-reduced-motion: reduce/);
  assert.match(html, /const asteroidTravelTime = bossRound \? 32 : 28;/);
  assert.match(html, /\.paused \.asteroid[^}]*animation-play-state:paused !important/);
  assert.match(html, /ESC pauses the patrol/);
});

test("keeps every deployed game asset local and lightweight", async () => {
  const html = withoutComments(await gameSource());
  const references = new Set(
    [...html.matchAll(/assets\/[A-Za-z0-9._-]+\.(?:png|webp|ico|mp3|wav)/g)].map(
      match => match[0].replace("assets/", ""),
    ),
  );

  if (html.includes('assets/glow-asteroid-" + index + ".webp')) {
    for (let index = 1; index <= 6; index += 1) {
      references.add(`glow-asteroid-${index}.webp`);
    }
  }

  for (const asset of references) {
    await access(new URL(asset, assetsRoot));
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length, "HTML IDs must be unique");

  const inlineScripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  for (const [, script] of inlineScripts) {
    assert.doesNotThrow(() => new Function(script));
  }

  const entries = await readdir(assetsRoot, { withFileTypes: true });
  const totalBytes = (
    await Promise.all(
      entries.filter(entry => entry.isFile()).map(entry => stat(new URL(entry.name, assetsRoot))),
    )
  ).reduce((sum, info) => sum + info.size, 0);

  assert.ok(totalBytes < 5 * 1024 * 1024, `Assets are too large: ${totalBytes} bytes`);
  assert.doesNotMatch(html, /assets\/(?:there-is-scenes|alien-saucer|alien-portal-gate|asteroid-variants|glow-asteroid|hud-|laser-plasma|pause-button|reset-button|sound-|creator-link|galaxy-patrol-title)[^"')]*\.png/);
});

test("includes a GitHub Pages entry point and deployment workflow", async () => {
  const workflow = await readFile(
    new URL("../.github/workflows/pages.yml", import.meta.url),
    "utf8",
  );

  await access(indexUrl);
  await access(new URL("grammar-meteor-lab.html", gameRoot));
  assert.match(workflow, /branches: \["main"\]/);
  assert.match(workflow, /actions\/checkout@v6/);
  assert.match(workflow, /actions\/setup-node@v6/);
  assert.match(workflow, /node --test tests\/rendered-html\.test\.mjs/);
  assert.match(workflow, /actions\/configure-pages@v5/);
  assert.match(workflow, /actions\/upload-pages-artifact@v4/);
  assert.match(workflow, /path: \.\/standalone/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  await access(new URL("README.md", projectRoot));
  await access(new URL(".gitattributes", projectRoot));
  await access(new URL(".nojekyll", gameRoot));
});
