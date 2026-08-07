import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");
const fail = (message) => { throw new Error(message); };

const required = [
  "index.html",
  "style.css",
  "game.bundle.js",
  ".nojekyll",
  "assets/audio/barnaby-game-music.mp3",
  "assets/video/capybara-waves-menu.mp4",
  "assets/ui/barnaby-cursor.png",
  "assets/ui/barnaby-favicon.webp",
  "assets/ui/sound-mixer-panel.webp",
  "assets/ui/ui-assets-data.js",
  "assets/lessons/lesson-images-data.js",
  "assets/lessons/lesson-images-extra.js",
  "assets/lessons/new/boy-riding-bike.webp",
  "assets/lessons/new/girl-watering-flowers.webp",
  "assets/lessons/new/children-building-sandcastle.webp",
  "assets/lessons/new/man-washing-car.webp",
  "assets/lessons/new/woman-taking-photo.webp",
  "assets/lessons/new/rabbit-eating-carrot.webp",
  "assets/lessons/new/ducks-swimming.webp",
  "assets/lessons/new/grandparents-planting-tree.webp"
];

for (const relativePath of required) await access(path.join(output, relativePath));

const html = await readFile(path.join(output, "index.html"), "utf8");
const css = await readFile(path.join(output, "style.css"), "utf8");
if (!html.includes("Barnaby Word Run") || !html.includes("game.bundle.js")) fail("Release HTML is incomplete");
if (!html.includes("<script defer")) fail("Large embedded assets must load without blocking HTML parsing");
if (!css.includes("100dvh") || !css.includes("@media (pointer: coarse)")) fail("Responsive layout is missing");

const modelDirectory = path.join(output, "assets/models");
const modelScripts = (await readdir(modelDirectory)).filter((name) => name.endsWith("-data.js"));
if (modelScripts.length !== 17) fail(`Expected 17 optimized 3D model bundles, found ${modelScripts.length}`);
for (const name of modelScripts) {
  const content = await readFile(path.join(modelDirectory, name), "utf8");
  const match = content.match(/base64,([A-Za-z0-9+/=]+)";/);
  if (!match) fail(`Embedded model is malformed: ${name}`);
  const glb = Buffer.from(match[1], "base64");
  if (glb.toString("ascii", 0, 4) !== "glTF" || glb.readUInt32LE(4) !== 2) {
    fail(`Embedded model is not a GLB 2.0 file: ${name}`);
  }
  if (glb.readUInt32LE(8) !== glb.length) fail(`Embedded model length is invalid: ${name}`);
  const jsonLength = glb.readUInt32LE(12);
  const document = JSON.parse(glb.subarray(20, 20 + jsonLength).toString("utf8").trim());
  const binHeader = 20 + jsonLength;
  const binLength = glb.readUInt32LE(binHeader);
  for (const view of document.bufferViews || []) {
    if ((view.byteOffset || 0) + view.byteLength > binLength) {
      fail(`Embedded model has an invalid buffer view: ${name}`);
    }
  }
}

async function collectFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolutePath));
    else files.push(absolutePath);
  }
  return files;
}

const files = await collectFiles(output);
const releasePaths = new Set(files.map((file) => path.relative(output, file).split(path.sep).join("/")));
const localReferences = new Set();
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) localReferences.add(match[1]);
for (const match of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) localReferences.add(match[1]);
for (const reference of localReferences) {
  if (/^(?:https?:|data:|#)/.test(reference) || !reference) continue;
  const cleanReference = reference.split("#")[0].split("?")[0].replace(/^\.\//, "");
  if (!releasePaths.has(cleanReference)) fail(`Release reference has a missing or case-mismatched file: ${cleanReference}`);
}

let totalBytes = 0;
for (const file of files) {
  const info = await stat(file);
  totalBytes += info.size;
  if (info.size > 3 * 1024 * 1024) fail(`Release file exceeds 3 MB: ${path.relative(output, file)}`);
}
if (totalBytes > 20 * 1024 * 1024) fail(`Release exceeds 20 MB: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

console.log(`Release verified: ${files.length} files, ${(totalBytes / 1024 / 1024).toFixed(1)} MB.`);
