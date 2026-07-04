const syllables = [
  "bā", "pó", "mǎi", "qiè", "ěr", "tā", "biǎo",
  "dé", "dè", "nà", "kuài", "piào", "kè", "nèi",
  "gěi", "tù", "lüè", "nǎo", "xī", "tiě", "jǐ",
  "tuō", "máo", "qié", "bǎi", "lüè", "xià", "xiǎo",
  "fú", "bō", "niǎo", "qù", "lǎo", "jiào", "pài",
  "huā", "dú", "táo", "nèi", "tuǐ", "nǚ", "qiáo",
  "lǜ", "bǎo", "péi", "dào", "tiào", "běi", "diào"
];

const pandaCount = 10;
const praise = ["很好!", "太好了!", "真棒!", "继续!", "找到了!"];
const misses = ["Еще ищем", "Почти", "Продолжаем", "Следующий слог"];

const grid = document.querySelector("#grid");
const score = document.querySelector("#score");
const status = document.querySelector("#status");
const foundStrip = document.querySelector("#foundStrip");
const pandaTemplate = document.querySelector("#pandaTemplate");
const newRoundButton = document.querySelector("#newRound");
const showAnswerButton = document.querySelector("#showAnswer");
const soundToggleButton = document.querySelector("#soundToggle");
const soundIcon = document.querySelector("#soundIcon");
const soundVolume = document.querySelector("#soundVolume");
const winLayer = document.querySelector("#winLayer");
const winEffects = document.querySelector("#winEffects");
const playAgainButton = document.querySelector("#playAgain");
const winPanda = document.querySelector("#winPanda");
const leafLayer = document.querySelector("#leafLayer");
const successSound = new Audio("assets/success.mp3");
const missSound = new Audio("assets/miss.mp3");
successSound.preload = "auto";
missSound.preload = "auto";

let pandas = new Set();
let opened = new Set();
let found = 0;
let answersShown = false;
let roundComplete = false;
let soundEnabled = localStorage.getItem("pandaSoundEnabled") !== "false";
let masterVolume = Number(localStorage.getItem("pandaMasterVolume") || 0.65);

if (Number.isNaN(masterVolume)) {
  masterVolume = 0.65;
}

masterVolume = Math.min(1, Math.max(0, masterVolume));

function clonePanda() {
  return pandaTemplate.content.firstElementChild.cloneNode(true);
}

function playSound(source, baseVolume) {
  if (!soundEnabled || masterVolume <= 0) {
    return;
  }

  const sound = source.cloneNode();
  sound.volume = Math.min(1, baseVolume * masterVolume);
  sound.play().catch(() => {});
}

function playSuccessSound() {
  playSound(successSound, 0.32);
}

function playMissSound() {
  playSound(missSound, 0.24);
}

function updateSoundUi() {
  soundIcon.textContent = soundEnabled && masterVolume > 0 ? "🔊" : "🔇";
  soundToggleButton.classList.toggle("is-muted", !soundEnabled || masterVolume === 0);
  soundToggleButton.setAttribute("aria-label", soundEnabled ? "Выключить звук" : "Включить звук");
  soundToggleButton.title = soundEnabled ? "Выключить звук" : "Включить звук";
  soundVolume.value = String(masterVolume);
}

function createLeafLayer() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 24; index += 1) {
    const leaf = document.createElement("span");
    leaf.className = "floating-leaf";
    leaf.style.setProperty("--x", `${Math.random() * 100}vw`);
    leaf.style.setProperty("--delay", `${Math.random() * -18}s`);
    leaf.style.setProperty("--duration", `${14 + Math.random() * 12}s`);
    leaf.style.setProperty("--scale", `${0.7 + Math.random() * 0.9}`);
    leaf.style.setProperty("--drift", `${-80 + Math.random() * 160}px`);
    fragment.append(leaf);
  }

  leafLayer.replaceChildren(fragment);
}

function createCellEffect(button, type) {
  const effect = document.createElement("span");
  const count = type === "poof" ? 12 : 14;
  effect.className = `cell-effect ${type}`;

  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count + Math.random() * 0.35;
    const distance = type === "poof" ? 26 + Math.random() * 24 : 32 + Math.random() * 36;

    piece.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    piece.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    piece.style.setProperty("--delay", `${index * 18}ms`);
    effect.append(piece);
  }

  if (type === "sparkle") {
    const label = document.createElement("span");
    label.className = "cell-praise";
    label.textContent = "太棒!";
    effect.append(label);
  }

  button.append(effect);
  window.setTimeout(() => effect.remove(), type === "poof" ? 780 : 980);
}

function renderWinEffects() {
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < 42; index += 1) {
    const confetti = document.createElement("span");
    confetti.className = "confetti";
    confetti.style.setProperty("--x", `${Math.random() * 100}vw`);
    confetti.style.setProperty("--delay", `${Math.random() * 500}ms`);
    confetti.style.setProperty("--duration", `${1600 + Math.random() * 1300}ms`);
    confetti.style.setProperty("--spin", `${Math.random() * 480 - 240}deg`);
    fragment.append(confetti);
  }

  for (let index = 0; index < 6; index += 1) {
    const lantern = document.createElement("span");
    lantern.className = "sky-lantern";
    lantern.style.setProperty("--x", `${12 + index * 15 + Math.random() * 6}vw`);
    lantern.style.setProperty("--delay", `${index * 170}ms`);
    lantern.style.setProperty("--duration", `${3200 + Math.random() * 1200}ms`);
    fragment.append(lantern);
  }

  winEffects.replaceChildren(fragment);
}

function samplePandaCells() {
  let positions = new Set();

  for (let attempt = 0; attempt < 800; attempt += 1) {
    positions = new Set();

    while (positions.size < pandaCount) {
      positions.add(Math.floor(Math.random() * syllables.length));
    }

    if (isSpreadOut(positions)) {
      return positions;
    }
  }

  return positions;
}

function isSpreadOut(positions) {
  const rowCounts = Array(7).fill(0);
  const columnCounts = Array(7).fill(0);

  positions.forEach((position) => {
    rowCounts[Math.floor(position / 7)] += 1;
    columnCounts[position % 7] += 1;
  });

  return Math.max(...rowCounts) <= 2 && Math.max(...columnCounts) <= 3;
}

function setStatus(text) {
  status.textContent = text;
}

function updateScore() {
  score.textContent = found;
}

function renderFoundStrip() {
  foundStrip.replaceChildren();

  for (let index = 0; index < pandaCount; index += 1) {
    const token = document.createElement("div");
    token.className = "found-token";

    if (index < found) {
      token.classList.add("is-filled");
      token.append(clonePanda());
    }

    foundStrip.append(token);
  }
}

function getTone(syllable) {
  if (/[āēīōūǖ]/u.test(syllable)) return 1;
  if (/[áéíóúǘ]/u.test(syllable)) return 2;
  if (/[ǎěǐǒǔǚ]/u.test(syllable)) return 3;
  if (/[àèìòùǜ]/u.test(syllable)) return 4;
  return 0;
}

function renderCell(index, syllable) {
  const button = document.createElement("button");
  button.className = `cell tone-${getTone(syllable)}`;
  button.type = "button";
  button.dataset.index = String(index);
  button.setAttribute("aria-label", `Слог ${syllable}`);

  const label = document.createElement("span");
  label.className = "cell-label";
  label.textContent = syllable;
  button.append(label);

  button.addEventListener("click", handleCellClick);
  return button;
}

function renderGrid() {
  grid.replaceChildren();
  syllables.forEach((syllable, index) => {
    grid.append(renderCell(index, syllable));
  });
}

function revealPanda(button) {
  const labelText = button.querySelector(".cell-label").textContent;
  button.replaceChildren();
  button.append(clonePanda());

  const label = document.createElement("span");
  label.className = "cell-label";
  label.textContent = labelText;
  button.append(label);
}

function completeRound() {
  roundComplete = true;
  setStatus("你真棒！ 你找到了10只熊猫！");
  winPanda.replaceChildren(clonePanda());
  renderWinEffects();
  winLayer.classList.remove("is-hidden");
}

function handleCellClick(event) {
  const button = event.currentTarget;
  const index = Number(button.dataset.index);

  if (roundComplete || opened.has(index)) {
    return;
  }

  opened.add(index);
  button.disabled = true;
  button.classList.remove("has-panda-hint");

  if (pandas.has(index)) {
    found += 1;
    playSuccessSound();
    button.classList.add("is-found");
    revealPanda(button);
    createCellEffect(button, "sparkle");
    updateScore();
    renderFoundStrip();

    const line = praise[Math.floor(Math.random() * praise.length)];
    setStatus(`${line} ${found}/10`);

    if (found === pandaCount) {
      window.setTimeout(completeRound, 450);
    }

    return;
  }

  createCellEffect(button, "poof");
  playMissSound();
  button.classList.add("is-miss");
  window.setTimeout(() => {
    button.classList.add("is-gone");
  }, 860);

  const line = misses[Math.floor(Math.random() * misses.length)];
  setStatus(line);
}

function showAnswers() {
  answersShown = !answersShown;
  showAnswerButton.classList.toggle("is-active", answersShown);

  grid.querySelectorAll(".cell").forEach((button) => {
    const index = Number(button.dataset.index);
    button.classList.toggle("has-panda-hint", answersShown && pandas.has(index) && !opened.has(index));
  });

  setStatus(answersShown ? "Подсказка включена" : "Подсказка выключена");
}

function startRound() {
  pandas = samplePandaCells();
  opened = new Set();
  found = 0;
  answersShown = false;
  roundComplete = false;
  winLayer.classList.add("is-hidden");
  winEffects.replaceChildren();
  showAnswerButton.classList.remove("is-active");
  updateScore();
  renderFoundStrip();
  renderGrid();
  setStatus("Раунд готов");
}

newRoundButton.addEventListener("click", startRound);
showAnswerButton.addEventListener("click", showAnswers);
soundToggleButton.addEventListener("click", () => {
  if (soundEnabled && masterVolume > 0) {
    soundEnabled = false;
  } else {
    soundEnabled = true;
    masterVolume = masterVolume > 0 ? masterVolume : 0.65;
    localStorage.setItem("pandaMasterVolume", String(masterVolume));
  }

  localStorage.setItem("pandaSoundEnabled", String(soundEnabled));
  updateSoundUi();
});
soundVolume.addEventListener("input", () => {
  masterVolume = Number(soundVolume.value);
  soundEnabled = masterVolume > 0;
  localStorage.setItem("pandaMasterVolume", String(masterVolume));
  localStorage.setItem("pandaSoundEnabled", String(soundEnabled));
  updateSoundUi();
});
playAgainButton.addEventListener("click", startRound);
winLayer.addEventListener("click", (event) => {
  if (event.target === winLayer) {
    winLayer.classList.add("is-hidden");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    winLayer.classList.add("is-hidden");
  }
});

createLeafLayer();
updateSoundUi();
startRound();
