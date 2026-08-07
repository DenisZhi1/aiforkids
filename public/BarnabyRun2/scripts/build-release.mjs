import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "dist");

const releaseFiles = [
  "index.html",
  "style.css",
  "game.bundle.js",
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
  "assets/lessons/new/grandparents-planting-tree.webp",
  "assets/models/runner-data.js",
  "assets/models/acorn-data.js",
  "assets/models/mushroom-data.js",
  "assets/models/magnet-leaf-data.js",
  "assets/models/tree-data.js",
  "assets/models/boulder-data.js",
  "assets/models/stump-data.js",
  "assets/models/lamp-post-data.js",
  "assets/models/cairn-data.js",
  "assets/models/mountain-data.js",
  "assets/models/butterfly-data.js",
  "assets/models/bird-data.js",
  "assets/models/flower-cluster-data.js",
  "assets/models/grass-tuft-data.js",
  "assets/models/fence-data.js",
  "assets/models/arch-data.js",
  "assets/models/sun-data.js"
];

await rm(output, { recursive: true, force: true });
for (const relativePath of releaseFiles) {
  const destination = path.join(output, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(root, relativePath), destination);
}
await writeFile(path.join(output, ".nojekyll"), "", "utf8");
console.log(`Release created with ${releaseFiles.length + 1} files.`);
