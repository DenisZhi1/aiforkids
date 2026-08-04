import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requiredFiles = [
  "index.html",
  "styles.css",
  "questions.js",
  "game.js",
  "favicon-32.png",
  "favicon-192.png",
  "apple-touch-icon.png"
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

for (const file of requiredFiles) {
  assert(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`);
}

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "questions.js"), "utf8"), sandbox, { filename: "questions.js" });
const prompts = sandbox.window.WARMUP_PROMPTS;
const levels = ["A1", "A2", "B1", "B2"];
const categories = new Set(["YOU", "PICK ONE", "IMAGINE", "STORY", "OPINION", "CHALLENGE"]);

assert(Array.isArray(prompts), "Question bank did not load");
assert(prompts.length === 160, `Expected 160 cards, found ${prompts.length}`);
assert(new Set(prompts.map((prompt) => prompt.i)).size === prompts.length, "Card IDs must be unique");
assert(new Set(prompts.map((prompt) => prompt.q.toLowerCase())).size === prompts.length, "Questions must be unique");

for (const level of levels) {
  const count = prompts.filter((prompt) => prompt.l === level).length;
  assert(count === 40, `Expected 40 ${level} cards, found ${count}`);
}

for (const prompt of prompts) {
  assert(levels.includes(prompt.l), `Invalid level on card ${prompt.i}`);
  assert(categories.has(prompt.c), `Invalid category on card ${prompt.i}`);
  assert(prompt.q && prompt.s && prompt.f, `Card ${prompt.i} has an empty field`);
  assert(/[?.]$/.test(prompt.q), `Card ${prompt.i} needs question punctuation`);
  assert(/[?]$/.test(prompt.f), `Card ${prompt.i} needs follow-up punctuation`);
}

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const game = fs.readFileSync(path.join(root, "game.js"), "utf8");
assert(html.includes('name="viewport"'), "Mobile viewport metadata is missing");
assert(html.includes('href="https://vk.ru/deandal"'), "Creator link is missing");
assert(html.includes('href="styles.css"'), "Stylesheet must use a relative path for GitHub Pages");
assert(html.includes('src="questions.js"'), "Question bank must use a relative path for GitHub Pages");
assert(html.includes('src="game.js"'), "Game script must use a relative path for GitHub Pages");
assert(html.includes('href="favicon-32.png"'), "Browser favicon is missing");
assert(html.includes('href="favicon-192.png"'), "High-resolution favicon is missing");
assert(html.includes('href="apple-touch-icon.png"'), "Apple touch icon is missing");

for (const match of game.matchAll(/getElementById\("([^"]+)"\)/g)) {
  assert(html.includes(`id="${match[1]}"`), `Missing HTML element: #${match[1]}`);
}

for (const file of ["index.html", "styles.css", "questions.js", "game.js"]) {
  const content = fs.readFileSync(path.join(root, file), "utf8");
  assert(!/localhost|127\.0\.0\.1|debugger|console\.log/.test(content), `Development-only content found in ${file}`);
}

console.log("Warm-up Deck validation passed: 160 unique cards, 40 per level, mobile metadata and relative assets verified.");
