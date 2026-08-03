import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const htmlPath = resolve(root, "index.html");
const html = readFileSync(htmlPath, "utf8");
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

assert.equal(packageJson.scripts?.start, "node scripts/serve.mjs", "The dependency-free local server command is missing.");
assert(existsSync(resolve(root, "scripts/serve.mjs")), "The local server script is missing.");

const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(script, "The inline game script was not found.");
new vm.Script(script, { filename: "index.html:inline-script" });

const categoryPattern = /\n\s{6}(\w+):\s*\{[\s\S]*?atlas:\s*"([^"]+)"[\s\S]*?cellRatio:\s*([\d.]+)[\s\S]*?cards:\s*makeCards\(\[([^\]]*)\]\)\n\s{6}\}/g;
const categories = [...html.matchAll(categoryPattern)].map(match => ({
  key: match[1],
  atlas: match[2],
  cellRatio: Number(match[3]),
  words: [...match[4].matchAll(/"([A-Z]+)"/g)].map(word => word[1])
}));

assert.equal(categories.length, 13, "Expected exactly 13 categories.");
assert.equal(new Set(categories.map(category => category.key)).size, 13, "Category keys must be unique.");

for (const category of categories) {
  assert.equal(category.words.length, 20, `${category.key} must contain exactly 20 words.`);
  assert.equal(new Set(category.words).size, 20, `${category.key} contains duplicate words.`);
  assert(category.words.every(word => /^[A-Z]+$/.test(word)), `${category.key} contains an unsupported spelling.`);
  assert([1, 1.2].includes(category.cellRatio), `${category.key} has an unexpected atlas cell ratio.`);
  assert(category.atlas.endsWith("-atlas-clean.webp"), `${category.key} must use a normalized WebP atlas.`);
  assert(existsSync(resolve(root, category.atlas)), `Missing asset: ${category.atlas}`);
}

assert.equal(categories.reduce((sum, category) => sum + category.words.length, 0), 260, "Expected 260 words in total.");

const pagesBlock = html.match(/const CATEGORY_PAGES = \[([\s\S]*?)\];/)?.[1];
assert(pagesBlock, "CATEGORY_PAGES was not found.");
const pageKeys = [...pagesBlock.matchAll(/keys:\s*\[([^\]]+)\]/g)]
  .flatMap(match => [...match[1].matchAll(/"([a-z]+)"/g)].map(key => key[1]));
assert.deepEqual(new Set(pageKeys), new Set(categories.map(category => category.key)), "Menu pages must contain every category exactly once.");
assert.equal(pageKeys.length, categories.length, "Menu pages contain a duplicate category.");

for (const background of [...html.matchAll(/url\("(assets\/[^"]+)"\)/g)].map(match => match[1])) {
  assert(background.endsWith(".webp"), `Background is not WebP: ${background}`);
  assert(existsSync(resolve(root, background)), `Missing background: ${background}`);
}

const pngAssets = [...html.matchAll(/assets\/[^"')]+\.png/g)].map(match => match[0]);
assert.deepEqual(pngAssets, ["assets/drag-hand-icon.png"], "Only the small transparent hand icon may use PNG.");
assert(existsSync(resolve(root, "assets/drag-hand-icon.png")), "The drag-hand instruction icon is missing.");
assert(html.includes('class="brand-logo" src="apple-touch-icon.png"'), "The apple logo is missing from the interface.");
for (const favicon of ["favicon.svg", "favicon.ico", "favicon-32.png", "apple-touch-icon.png"]) {
  assert(existsSync(resolve(root, favicon)), `Missing favicon asset: ${favicon}`);
  assert(html.includes(`href="${favicon}"`), `Favicon is not linked from the page: ${favicon}`);
}
for (const cursor of ["garden-cursor.svg", "garden-pointer.svg"]) {
  assert(existsSync(resolve(root, cursor)), `Missing cursor asset: ${cursor}`);
  assert(html.includes(`url("${cursor}")`), `Cursor is not used by the page: ${cursor}`);
}
assert(html.includes("wordGardenCompletedWords"), "Word-level progress storage is missing.");
assert(html.includes("state.sessionCards = completedCards.concat(remainingCards)"), "Random category ordering is missing.");
assert(!html.includes("backdrop-filter:"), "Large backdrop filters can cause animation lag on mobile devices.");
assert(!html.includes("background-attachment: fixed"), "Fixed backgrounds can cause scroll lag on mobile devices.");
assert(!html.includes("createLogoRenderer"), "The retired WebGL logo renderer must not return.");
assert(html.includes("state.dragFrame = requestAnimationFrame"), "Pointer movement must be limited to one update per animation frame.");
assert((html.match(/el\.confetti\.replaceChildren\(\)/g) || []).length >= 3, "Confetti must be removed whenever a celebration closes.");
assert(html.includes('decoding="async" fetchpriority="high"'), "The active picture atlas must decode asynchronously.");
assert(html.includes("viewport-fit=cover"), "The viewport must support iPhone and iPad safe areas.");
assert(html.includes("env(safe-area-inset-top, 0px)"), "Safe-area padding is missing.");
assert(html.includes("(orientation: landscape) and (max-height: 520px)"), "Compact phone landscape layout is missing.");
assert(html.includes("@media (max-width: 360px)"), "The extra-small Android layout is missing.");
assert(html.includes(".progress-track { display: none; }"), "Phone headers must use the compact progress display.");
assert(html.includes('drag.pointerType === "touch" ? 16 : 8'), "Touch input needs a larger tap tolerance.");
assert(html.includes("event.currentTarget.setPointerCapture?.(event.pointerId)"), "Touch dragging must retain pointer capture.");
assert(html.includes("Drag or tap the letters onto the outlines"), "The controls must explain both mouse and touch input.");
const requiredQuestions = [
  'question: "What animal is it?"',
  'question: "What is it?"',
  'question: "What colour is it?"',
  'question: "What place is this?"',
  'question: "What can the child do?"',
  'question: "What can you see in the picture?"',
  'question: "What sport or hobby is shown?"',
  'question: "What vehicle is it?"',
  'question: "What is this person\'s job?"',
  'question: "How does the child feel?"',
  'question: "What can you see at the party?"',
  'question: "What can you see in nature?"',
  'GRAPES: "What fruit are these?"',
  'SUNNY: "What is the weather like?"',
  'STORM: "What kind of weather is this?"',
  'RAINBOW: "What can you see in the sky?"',
  'RAIN: "What is falling from the clouds?"',
  'SNOW: "What is falling from the sky?"',
  'WIND: "What is blowing?"',
  'SPRING: "What season is it?"',
  'FOG: "What makes it hard to see?"',
  'ICE: "What is frozen water called?"',
  'PARTY: "What is happening?"',
  'BIRTHDAY: "What are they celebrating?"',
  'INVITE: "What can you do before the party?"',
  'WISH: "What can you make on your birthday?"',
  'GUEST: "Who can you see at the party?"',
  'MUSIC: "What can you hear at the party?"',
  'DANCE: "What can the child do at the party?"',
  'GAME: "What can children play at the party?"',
  'PHOTO: "What can you take at the party?"'
];
for (const requiredQuestion of requiredQuestions) {
  assert(html.includes(requiredQuestion), `Required question is missing or changed: ${requiredQuestion}`);
}

const questionTexts = [...html.matchAll(/(?:question|[A-Z]+):\s*"([A-Z][^"]*\?)"/g)].map(match => match[1]);
assert(questionTexts.length >= requiredQuestions.length, "The question audit found fewer prompts than expected.");
for (const question of questionTexts) {
  assert(!/\s{2,}/.test(question), `Question contains repeated spaces: ${question}`);
  assert(!/\s\?/.test(question), `Question contains a space before its question mark: ${question}`);
}
for (const retiredQuestion of ["Which animal is this?", "Which colour is this?", "What place is it?", "What is the child doing?", "What is the weather or season?"]) {
  assert(!html.includes(retiredQuestion), `Outdated question remains: ${retiredQuestion}`);
}

console.log(`Word Garden release check passed: ${categories.length} categories, 260 words, ${categories.length + 2} optimized image assets, apple logo, 4 favicon formats, 2 custom cursors.`);
