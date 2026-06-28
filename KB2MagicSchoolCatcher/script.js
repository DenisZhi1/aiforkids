const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const targetWordEl = document.getElementById("targetWord");
const levelTextEl = document.getElementById("levelText");
const scoreTextEl = document.getElementById("scoreText");
const streakTextEl = document.getElementById("streakText");
const heartsEl = document.getElementById("hearts");
const toastEl = document.getElementById("toast");
const startOverlay = document.getElementById("startOverlay");
const endOverlay = document.getElementById("endOverlay");
const endKickerEl = document.getElementById("endKicker");
const endTitleEl = document.getElementById("endTitle");
const finalScoreEl = document.getElementById("finalScore");
const finalStarsEl = document.getElementById("finalStars");
const resultStarsEl = document.getElementById("resultStars");
const startBtn = document.getElementById("startBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const soundBtn = document.getElementById("soundBtn");

const ALL_WORDS = [
  "teacher",
  "board",
  "cupboard",
  "bookcase",
  "ruler",
  "desk",
  "eraser",
  "schoolbag",
  "book",
  "clock",
  "pencil",
  "pen"
];

const LEVELS = [
  {
    name: "Easy",
    words: ["book", "pen", "pencil", "ruler"],
    speed: 86,
    spawn: 1180,
    goal: 6,
    bonus: 0.04
  },
  {
    name: "School Things",
    words: ["schoolbag", "eraser", "book", "pencil", "pen", "ruler"],
    speed: 104,
    spawn: 1000,
    goal: 7,
    bonus: 0.06
  },
  {
    name: "Classroom Objects",
    words: ["board", "desk", "cupboard", "bookcase", "clock"],
    speed: 122,
    spawn: 880,
    goal: 8,
    bonus: 0.07
  },
  {
    name: "Mixed",
    words: ALL_WORDS,
    speed: 138,
    spawn: 760,
    goal: 10,
    bonus: 0.08
  },
  {
    name: "Fast Stars",
    words: ALL_WORDS,
    speed: 164,
    spawn: 620,
    goal: 12,
    bonus: 0.09
  }
];

const ITEM_COLORS = {
  teacher: ["#f7c9a9", "#4f6fc9"],
  board: ["#2f7d64", "#dff7ec"],
  cupboard: ["#e2a247", "#85613c"],
  bookcase: ["#4da7a0", "#e95d86"],
  ruler: ["#ffd35c", "#715b2c"],
  desk: ["#b96e4a", "#4c8a89"],
  eraser: ["#f48ca4", "#7fc4e8"],
  schoolbag: ["#e95d86", "#ffd36b"],
  book: ["#5a79d6", "#fff6d7"],
  clock: ["#ffffff", "#2e6670"],
  pencil: ["#f6c644", "#e95d86"],
  pen: ["#2f7dbe", "#182d3d"]
};

const heroImage = new Image();
heroImage.src = "assets/hero-mouse.png";

const state = {
  width: 0,
  height: 0,
  dpr: 1,
  running: false,
  paused: false,
  finished: false,
  levelIndex: 0,
  score: 0,
  hearts: 3,
  streak: 0,
  progress: 0,
  target: "book",
  playerX: 0,
  targetX: 0,
  stars: [],
  particles: [],
  floaters: [],
  keys: new Set(),
  spawnTimer: 0,
  lastTime: 0,
  slowUntil: 0,
  muted: false,
  audio: null,
  toastTimer: 0,
  hitShake: 0
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function choose(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function resize() {
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = Math.floor(state.width * state.dpr);
  canvas.height = Math.floor(state.height * state.dpr);
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  if (!state.playerX) {
    state.playerX = state.width * 0.5;
    state.targetX = state.playerX;
  }
  state.playerX = clamp(state.playerX, heroBounds().minX, heroBounds().maxX);
  state.targetX = clamp(state.targetX, heroBounds().minX, heroBounds().maxX);
}

function heroBounds() {
  const metrics = heroMetrics();
  return {
    minX: metrics.w * 0.44,
    maxX: state.width - metrics.w * 0.44
  };
}

function heroMetrics() {
  const base = clamp(state.height * 0.36, 190, 330);
  const mobileBoost = state.width < 520 ? 1.12 : 1;
  const h = Math.min(base * mobileBoost, state.height * 0.48);
  const ratio = heroImage.naturalWidth && heroImage.naturalHeight
    ? heroImage.naturalWidth / heroImage.naturalHeight
    : 0.87;
  const w = h * ratio;
  const ground = state.height - clamp(state.height * 0.045, 20, 42);
  return {
    x: state.playerX - w * 0.5,
    y: ground - h,
    cx: state.playerX,
    ground,
    w,
    h
  };
}

function bagMetrics() {
  const hero = heroMetrics();
  const w = clamp(hero.w * 0.7, 112, 174);
  const h = clamp(hero.h * 0.24, 58, 82);
  return {
    x: hero.cx - w * 0.5,
    y: hero.y + hero.h * 0.58,
    w,
    h
  };
}

function currentLevel() {
  return LEVELS[state.levelIndex];
}

function startGame() {
  ensureAudio();
  resetGame();
  state.running = true;
  state.paused = false;
  state.finished = false;
  setPauseButton(false);
  startOverlay.classList.add("is-hidden");
  endOverlay.classList.add("is-hidden");
  showToast("Catch: " + state.target, "level");
  updateHud();
}

function resetGame() {
  state.levelIndex = 0;
  state.score = 0;
  state.hearts = 3;
  state.streak = 0;
  state.progress = 0;
  state.stars = [];
  state.particles = [];
  state.floaters = [];
  state.spawnTimer = 420;
  state.slowUntil = 0;
  state.hitShake = 0;
  pickTarget(true);
}

function pickTarget(force) {
  const words = currentLevel().words;
  let next = choose(words);
  if (!force && words.length > 1) {
    let guard = 0;
    while (next === state.target && guard < 12) {
      next = choose(words);
      guard += 1;
    }
  }
  state.target = next;
  targetWordEl.textContent = next;
}

function updateHud() {
  targetWordEl.textContent = state.target;
  levelTextEl.textContent = `${state.levelIndex + 1}`;
  scoreTextEl.textContent = `${state.score}`;
  streakTextEl.textContent = `${state.streak}`;
  renderHearts();
}

function renderHearts() {
  heartsEl.innerHTML = "";
  for (let i = 0; i < 3; i += 1) {
    const heart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    heart.setAttribute("viewBox", "0 0 24 24");
    heart.setAttribute("aria-hidden", "true");
    heart.classList.add("heart-icon");
    if (i >= state.hearts) heart.classList.add("is-empty");
    path.setAttribute("d", "M12 21s-7.2-4.5-9.4-9.1C.7 7.9 3.1 4 7 4c2.1 0 3.6 1.1 5 3 1.4-1.9 2.9-3 5-3 3.9 0 6.3 3.9 4.4 7.9C19.2 16.5 12 21 12 21z");
    heart.appendChild(path);
    heartsEl.appendChild(heart);
  }
}

function showToast(text, mood) {
  toastEl.textContent = text;
  toastEl.className = "toast is-visible" + (mood ? " " + mood : "");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    toastEl.className = "toast";
  }, 1050);
}

function ensureAudio() {
  if (state.muted) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!state.audio) state.audio = new AudioContext();
  if (state.audio.state === "suspended") state.audio.resume();
}

function tone(freq, delay, duration, type, gainValue) {
  if (state.muted || !state.audio) return;
  const now = state.audio.currentTime;
  const osc = state.audio.createOscillator();
  const gain = state.audio.createGain();
  osc.type = type || "sine";
  osc.frequency.setValueAtTime(freq, now + delay);
  gain.gain.setValueAtTime(0.0001, now + delay);
  gain.gain.exponentialRampToValueAtTime(gainValue || 0.08, now + delay + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + duration);
  osc.connect(gain);
  gain.connect(state.audio.destination);
  osc.start(now + delay);
  osc.stop(now + delay + duration + 0.03);
}

function playSuccess() {
  ensureAudio();
  tone(523.25, 0, 0.14, "triangle", 0.08);
  tone(659.25, 0.08, 0.15, "triangle", 0.07);
  tone(783.99, 0.16, 0.18, "triangle", 0.07);
}

function playBonus() {
  ensureAudio();
  [659.25, 783.99, 987.77, 1318.51].forEach((freq, index) => {
    tone(freq, index * 0.055, 0.18, "sine", 0.07);
  });
}

function playOops() {
  if (state.muted) return;
  ensureAudio();
  if (!state.audio) return;
  const now = state.audio.currentTime;
  const osc = state.audio.createOscillator();
  const gain = state.audio.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(110, now + 0.22);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
  osc.connect(gain);
  gain.connect(state.audio.destination);
  osc.start(now);
  osc.stop(now + 0.27);
}

function playLevel() {
  ensureAudio();
  [392, 523.25, 659.25, 1046.5].forEach((freq, index) => {
    tone(freq, index * 0.08, 0.19, "triangle", 0.075);
  });
}

function speakWord(word) {
  if (state.muted || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.88;
  utterance.pitch = 1.1;
  utterance.volume = 0.95;
  window.speechSynthesis.speak(utterance);
}

function spawnStar() {
  const level = currentLevel();
  const bounds = heroBounds();
  const isBonus = state.score > 2 && Math.random() < level.bonus;
  const words = level.words;
  let word = state.target;
  if (!isBonus && Math.random() > 0.48 && words.length > 1) {
    const distractors = words.filter((item) => item !== state.target);
    word = choose(distractors);
  }

  const scale = clamp(Math.min(state.width, state.height) / 720, 0.78, 1.28);
  const radius = isBonus ? 34 * scale : randomBetween(30, 38) * scale;
  state.stars.push({
    id: cryptoRandom(),
    x: randomBetween(Math.max(radius + 18, bounds.minX * 0.5), Math.min(state.width - radius - 18, bounds.maxX + bounds.minX * 0.5)),
    y: -radius * 1.8,
    radius,
    word,
    bonus: isBonus,
    speed: (level.speed + randomBetween(-8, 28)) * scale,
    wobble: randomBetween(0.7, 1.9),
    phase: randomBetween(0, Math.PI * 2),
    rotation: randomBetween(-0.25, 0.25),
    spin: randomBetween(-0.8, 0.8),
    caught: false
  });
}

function cryptoRandom() {
  if (window.crypto && window.crypto.getRandomValues) {
    const data = new Uint32Array(1);
    window.crypto.getRandomValues(data);
    return data[0];
  }
  return Math.floor(Math.random() * 1000000000);
}

function update(dt, nowMs) {
  const level = currentLevel();
  const bounds = heroBounds();
  const keyboardSpeed = clamp(state.width * 0.62, 420, 760);
  if (state.keys.has("ArrowLeft") || state.keys.has("KeyA")) {
    state.targetX -= keyboardSpeed * dt;
  }
  if (state.keys.has("ArrowRight") || state.keys.has("KeyD")) {
    state.targetX += keyboardSpeed * dt;
  }
  state.targetX = clamp(state.targetX, bounds.minX, bounds.maxX);
  state.playerX += (state.targetX - state.playerX) * Math.min(1, dt * 14);
  state.playerX = clamp(state.playerX, bounds.minX, bounds.maxX);

  const slow = nowMs < state.slowUntil ? 0.55 : 1;
  state.spawnTimer -= dt * 1000 * (slow < 1 ? 0.7 : 1);
  if (state.spawnTimer <= 0) {
    spawnStar();
    state.spawnTimer = level.spawn * randomBetween(0.78, 1.16);
  }

  const bag = bagMetrics();
  for (const star of state.stars) {
    star.phase += dt * star.wobble;
    star.rotation += dt * star.spin;
    star.y += star.speed * dt * slow;
    star.x += Math.sin(star.phase) * dt * 26;

    const hitX = star.x > bag.x - star.radius * 0.32 && star.x < bag.x + bag.w + star.radius * 0.32;
    const hitY = star.y + star.radius * 0.18 > bag.y && star.y - star.radius * 0.1 < bag.y + bag.h;
    if (!star.caught && hitX && hitY) {
      star.caught = true;
      catchStar(star);
    }
  }

  state.stars = state.stars.filter((star) => !star.caught && star.y < state.height + star.radius * 2);

  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += particle.gravity * dt;
    particle.spin += particle.spinSpeed * dt;
  }
  state.particles = state.particles.filter((particle) => particle.life > 0);

  for (const floater of state.floaters) {
    floater.life -= dt;
    floater.y -= 28 * dt;
  }
  state.floaters = state.floaters.filter((floater) => floater.life > 0);

  state.hitShake = Math.max(0, state.hitShake - dt * 2.8);
}

function catchStar(star) {
  if (star.bonus) {
    state.score += 3;
    if (state.hearts < 3 && Math.random() > 0.35) {
      state.hearts += 1;
      addFloater("+1 life", star.x, star.y, "#49a66a");
    } else {
      state.slowUntil = performance.now() + 4300;
      addFloater("Slow!", star.x, star.y, "#2f7dbe");
    }
    addSparkles(star.x, star.y, "#ffd36b", 22);
    playBonus();
    showToast("Bonus +3", "good");
    updateHud();
    return;
  }

  if (star.word === state.target) {
    state.score += 1;
    state.streak += 1;
    state.progress += 1;
    addSparkles(star.x, star.y, "#ffd36b", 18);
    addFloater("+1", star.x, star.y, "#49a66a");
    playSuccess();
    speakWord(star.word);

    if (state.streak === 3) showToast("Super!", "good");
    if (state.streak === 5) showToast("Amazing!", "good");
    if (state.streak === 10) showToast("Star learner!", "good");

    if (state.progress >= currentLevel().goal) {
      advanceLevel();
    } else {
      pickTarget(false);
    }
  } else {
    state.hearts -= 1;
    state.streak = 0;
    state.hitShake = 1;
    addWrongBurst(star.x, star.y);
    addFloater("Oops", star.x, star.y, "#e95d86");
    playOops();
    if (state.hearts <= 0) {
      finishGame(false);
    }
  }

  updateHud();
}

function advanceLevel() {
  if (state.levelIndex >= LEVELS.length - 1) {
    finishGame(true);
    return;
  }
  state.levelIndex += 1;
  state.progress = 0;
  state.hearts = Math.min(3, state.hearts + 1);
  state.stars = [];
  state.slowUntil = 0;
  pickTarget(true);
  playLevel();
  showToast("Level " + (state.levelIndex + 1) + ": " + currentLevel().name, "level");
}

function finishGame(won) {
  state.running = false;
  state.finished = true;
  state.stars = [];
  state.particles = [];
  const totalGoal = LEVELS.reduce((sum, level) => sum + level.goal, 0);
  const stars = clamp(Math.ceil((state.score / totalGoal) * 5), won ? 3 : 1, 5);
  endKickerEl.textContent = won ? "Great job!" : "Keep trying!";
  endTitleEl.textContent = won ? "You know your school words!" : "School words are waiting!";
  finalScoreEl.textContent = `${state.score}`;
  finalStarsEl.textContent = `${stars}`;
  resultStarsEl.innerHTML = "";
  for (let i = 0; i < 5; i += 1) {
    const span = document.createElement("span");
    span.innerHTML = i < stars ? "&#9733;" : "&#9734;";
    resultStarsEl.appendChild(span);
  }
  endOverlay.classList.remove("is-hidden");
  updateHud();
}

function addSparkles(x, y, color, count) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + randomBetween(-0.25, 0.25);
    const speed = randomBetween(72, 220);
    state.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 160,
      size: randomBetween(4, 8),
      color,
      life: randomBetween(0.48, 0.82),
      maxLife: 0.82,
      spin: randomBetween(0, Math.PI),
      spinSpeed: randomBetween(-6, 6),
      shape: "star"
    });
  }
}

function addWrongBurst(x, y) {
  for (let i = 0; i < 16; i += 1) {
    state.particles.push({
      x,
      y,
      vx: randomBetween(-150, 150),
      vy: randomBetween(-180, 40),
      gravity: 240,
      size: randomBetween(5, 10),
      color: i % 2 ? "#e95d86" : "#5f6670",
      life: randomBetween(0.32, 0.65),
      maxLife: 0.65,
      spin: 0,
      spinSpeed: 0,
      shape: "circle"
    });
  }
}

function addFloater(text, x, y, color) {
  state.floaters.push({
    text,
    x,
    y,
    color,
    life: 0.85,
    maxLife: 0.85
  });
}

function draw(timeMs) {
  ctx.clearRect(0, 0, state.width, state.height);
  drawClassroom(timeMs);
  drawStars();
  drawHero();
  drawParticles();
  drawFloaters();
  if (state.paused && state.running) drawPauseVeil();
}

function drawClassroom(timeMs) {
  const w = state.width;
  const h = state.height;
  const floorTop = h * 0.73;
  const wall = ctx.createLinearGradient(0, 0, 0, floorTop);
  wall.addColorStop(0, "#bfe7de");
  wall.addColorStop(0.72, "#e6f4d7");
  wall.addColorStop(1, "#f8df91");
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, floorTop);

  drawWindow(w * 0.08, h * 0.14, clamp(w * 0.18, 120, 220), clamp(h * 0.22, 105, 170), timeMs);
  drawPoster(w * 0.77, h * 0.16, clamp(w * 0.15, 92, 160), clamp(h * 0.18, 90, 142));
  drawBoard(w * 0.34, h * 0.14, clamp(w * 0.31, 220, 390), clamp(h * 0.24, 120, 210));
  drawShelf(w * 0.08, h * 0.46, clamp(w * 0.23, 170, 310), clamp(h * 0.14, 70, 120));
  drawCupboard(w * 0.78, h * 0.44, clamp(w * 0.14, 96, 150), clamp(h * 0.23, 130, 210));

  ctx.fillStyle = "#d89b62";
  ctx.fillRect(0, floorTop, w, h - floorTop);
  ctx.fillStyle = "rgba(102, 73, 48, 0.15)";
  for (let y = floorTop + 22; y < h; y += 34) {
    ctx.fillRect(0, y, w, 2);
  }
  ctx.strokeStyle = "rgba(102, 73, 48, 0.22)";
  ctx.lineWidth = 2;
  for (let x = -w * 0.1; x < w * 1.1; x += 88) {
    ctx.beginPath();
    ctx.moveTo(x, floorTop);
    ctx.lineTo(x + (w * 0.5 - x) * 0.32, h);
    ctx.stroke();
  }

  const shine = ctx.createRadialGradient(w * 0.5, h * 0.58, 20, w * 0.5, h * 0.58, w * 0.65);
  shine.addColorStop(0, "rgba(255, 255, 255, 0.18)");
  shine.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, w, h);
}

function drawWindow(x, y, w, h, timeMs) {
  roundRect(x, y, w, h, 8);
  ctx.fillStyle = "#fffaf0";
  ctx.fill();
  roundRect(x + 8, y + 8, w - 16, h - 16, 6);
  const sky = ctx.createLinearGradient(0, y, 0, y + h);
  sky.addColorStop(0, "#8ad3e8");
  sky.addColorStop(1, "#d9fff4");
  ctx.fillStyle = sky;
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + 8);
  ctx.lineTo(x + w * 0.5, y + h - 8);
  ctx.moveTo(x + 8, y + h * 0.52);
  ctx.lineTo(x + w - 8, y + h * 0.52);
  ctx.stroke();

  ctx.fillStyle = "#ffd36b";
  ctx.beginPath();
  ctx.arc(x + w * 0.78, y + h * 0.26, h * 0.14, 0, Math.PI * 2);
  ctx.fill();

  const cloudX = x + ((timeMs * 0.008) % (w * 0.3));
  drawCloud(cloudX + w * 0.18, y + h * 0.36, w * 0.12);
}

function drawCloud(x, y, size) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.beginPath();
  ctx.arc(x, y, size * 0.45, 0, Math.PI * 2);
  ctx.arc(x + size * 0.42, y - size * 0.18, size * 0.55, 0, Math.PI * 2);
  ctx.arc(x + size * 0.9, y, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

function drawBoard(x, y, w, h) {
  roundRect(x, y, w, h, 8);
  ctx.fillStyle = "#f8c458";
  ctx.fill();
  roundRect(x + 9, y + 9, w - 18, h - 18, 5);
  ctx.fillStyle = "#2f7d64";
  ctx.fill();

  ctx.strokeStyle = "rgba(217, 255, 244, 0.42)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i += 1) {
    const yy = y + h * (0.26 + i * 0.15);
    ctx.beginPath();
    ctx.moveTo(x + 28, yy);
    ctx.lineTo(x + w - 28, yy + Math.sin(i) * 4);
    ctx.stroke();
  }

  drawIcon("pencil", x + w * 0.18, y + h * 0.5, clamp(h * 0.3, 30, 52));
  drawIcon("book", x + w * 0.5, y + h * 0.52, clamp(h * 0.32, 34, 56));
  drawIcon("ruler", x + w * 0.8, y + h * 0.5, clamp(h * 0.3, 30, 52));
}

function drawPoster(x, y, w, h) {
  roundRect(x, y, w, h, 8);
  ctx.fillStyle = "#fffaf0";
  ctx.fill();
  ctx.fillStyle = "#e95d86";
  ctx.fillRect(x + 10, y + 10, w - 20, 14);
  drawIcon("clock", x + w * 0.5, y + h * 0.58, Math.min(w, h) * 0.44);
}

function drawShelf(x, y, w, h) {
  ctx.fillStyle = "#9c7250";
  roundRect(x, y + h * 0.78, w, h * 0.13, 5);
  ctx.fill();
  const bookHeights = [0.58, 0.47, 0.68, 0.52, 0.62, 0.44];
  for (let i = 0; i < 6; i += 1) {
    const bookW = w * 0.08;
    const bookH = h * bookHeights[i];
    const bx = x + w * 0.08 + i * w * 0.105;
    const by = y + h * 0.78 - bookH;
    ctx.fillStyle = ["#5a79d6", "#49a66a", "#e95d86", "#ffd36b", "#4da7a0", "#f28d57"][i];
    roundRect(bx, by, bookW, bookH, 4);
    ctx.fill();
  }
  drawIcon("eraser", x + w * 0.78, y + h * 0.52, h * 0.38);
}

function drawCupboard(x, y, w, h) {
  roundRect(x, y, w, h, 8);
  ctx.fillStyle = "#e2a247";
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(x + 8, y + 8, w - 16, h * 0.28);
  ctx.strokeStyle = "rgba(74, 50, 32, 0.28)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + 10);
  ctx.lineTo(x + w * 0.5, y + h - 10);
  ctx.stroke();
  ctx.fillStyle = "#85613c";
  ctx.beginPath();
  ctx.arc(x + w * 0.42, y + h * 0.54, 4, 0, Math.PI * 2);
  ctx.arc(x + w * 0.58, y + h * 0.54, 4, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars() {
  for (const star of state.stars) {
    ctx.save();
    ctx.translate(star.x, star.y);
    ctx.rotate(star.rotation);
    ctx.shadowColor = star.bonus ? "rgba(255, 211, 107, 0.75)" : "rgba(242, 166, 90, 0.5)";
    ctx.shadowBlur = star.bonus ? 22 : 12;
    starPath(0, 0, star.radius, star.radius * 0.48);
    ctx.fillStyle = star.bonus ? "#ffd36b" : "#ffe37a";
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = Math.max(2, star.radius * 0.08);
    ctx.strokeStyle = star.bonus ? "#f28d57" : "#f2a65a";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, star.radius * 0.54, 0, Math.PI * 2);
    ctx.fillStyle = star.bonus ? "#fff7cf" : "#fffaf0";
    ctx.fill();
    if (star.bonus) {
      drawBonusIcon(0, 0, star.radius * 0.62);
    } else {
      drawIcon(star.word, 0, 0, star.radius * 0.72);
    }
    ctx.restore();
  }
}

function drawHero() {
  const hero = heroMetrics();
  const shake = state.hitShake > 0 ? Math.sin(performance.now() * 0.05) * 7 * state.hitShake : 0;
  ctx.save();
  ctx.translate(shake, 0);
  ctx.fillStyle = "rgba(31, 42, 50, 0.16)";
  ctx.beginPath();
  ctx.ellipse(hero.cx + hero.w * 0.04, hero.ground + 4, hero.w * 0.42, hero.h * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  if (heroImage.complete && heroImage.naturalWidth) {
    ctx.drawImage(heroImage, hero.x, hero.y, hero.w, hero.h);
  } else {
    ctx.fillStyle = "#ccd3d2";
    ctx.beginPath();
    ctx.ellipse(hero.cx, hero.y + hero.h * 0.48, hero.w * 0.35, hero.h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  drawSchoolbag();
  ctx.restore();
}

function drawSchoolbag() {
  const bag = bagMetrics();
  const strap = bag.w * 0.1;
  ctx.save();
  ctx.shadowColor = "rgba(31, 42, 50, 0.18)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 4;

  ctx.strokeStyle = "#9f3754";
  ctx.lineWidth = Math.max(4, bag.w * 0.045);
  ctx.beginPath();
  ctx.arc(bag.x + bag.w * 0.27, bag.y + bag.h * 0.2, bag.w * 0.18, Math.PI * 1.05, Math.PI * 1.86);
  ctx.arc(bag.x + bag.w * 0.73, bag.y + bag.h * 0.2, bag.w * 0.18, Math.PI * 1.14, Math.PI * 1.95);
  ctx.stroke();

  roundRect(bag.x, bag.y + bag.h * 0.08, bag.w, bag.h * 0.9, 10);
  const body = ctx.createLinearGradient(0, bag.y, 0, bag.y + bag.h);
  body.addColorStop(0, "#e95d86");
  body.addColorStop(1, "#c84d75");
  ctx.fillStyle = body;
  ctx.fill();
  ctx.strokeStyle = "#9f3754";
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
  roundRect(bag.x + strap, bag.y + bag.h * 0.18, bag.w - strap * 2, bag.h * 0.2, 8);
  ctx.fill();

  const labelX = bag.x + bag.w * 0.12;
  const labelY = bag.y + bag.h * 0.44;
  const labelW = bag.w * 0.76;
  const labelH = bag.h * 0.34;
  roundRect(labelX, labelY, labelW, labelH, 7);
  ctx.fillStyle = "#fffaf0";
  ctx.fill();
  ctx.strokeStyle = "rgba(31, 42, 50, 0.16)";
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#285f55";
  drawFittedText(state.target, labelX + labelW * 0.5, labelY + labelH * 0.65, labelW * 0.88, 24, 12, "900");
  ctx.restore();
}

function drawParticles() {
  for (const particle of state.particles) {
    const alpha = clamp(particle.life / particle.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.spin);
    ctx.fillStyle = particle.color;
    if (particle.shape === "star") {
      starPath(0, 0, particle.size, particle.size * 0.45);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, particle.size * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawFloaters() {
  for (const floater of state.floaters) {
    const alpha = clamp(floater.life / floater.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "900 24px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
    ctx.strokeText(floater.text, floater.x, floater.y);
    ctx.fillStyle = floater.color;
    ctx.fillText(floater.text, floater.x, floater.y);
    ctx.restore();
  }
}

function drawPauseVeil() {
  ctx.fillStyle = "rgba(17, 45, 49, 0.22)";
  ctx.fillRect(0, 0, state.width, state.height);
  ctx.fillStyle = "#fffaf0";
  ctx.font = "900 42px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Paused", state.width * 0.5, state.height * 0.5);
}

function drawIcon(word, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  const s = size;
  switch (word) {
    case "book":
      drawBookIcon(s);
      break;
    case "pen":
      drawPenIcon(s);
      break;
    case "pencil":
      drawPencilIcon(s);
      break;
    case "ruler":
      drawRulerIcon(s);
      break;
    case "eraser":
      drawEraserIcon(s);
      break;
    case "schoolbag":
      drawSchoolbagIcon(s);
      break;
    case "board":
      drawBoardIcon(s);
      break;
    case "desk":
      drawDeskIcon(s);
      break;
    case "cupboard":
      drawCupboardIcon(s);
      break;
    case "bookcase":
      drawBookcaseIcon(s);
      break;
    case "clock":
      drawClockIcon(s);
      break;
    case "teacher":
      drawTeacherIcon(s);
      break;
    default:
      drawBookIcon(s);
  }
  ctx.restore();
}

function drawBookIcon(s) {
  ctx.fillStyle = "#5a79d6";
  roundRect(-s * 0.42, -s * 0.34, s * 0.38, s * 0.68, 5);
  ctx.fill();
  ctx.fillStyle = "#6f92ec";
  roundRect(s * 0.02, -s * 0.34, s * 0.38, s * 0.68, 5);
  ctx.fill();
  ctx.fillStyle = "#fff6d7";
  ctx.fillRect(-s * 0.02, -s * 0.3, s * 0.04, s * 0.6);
  ctx.strokeStyle = "rgba(31,42,50,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-s * 0.42, -s * 0.34, s * 0.82, s * 0.68);
}

function drawPenIcon(s) {
  ctx.save();
  ctx.rotate(-0.75);
  ctx.fillStyle = "#2f7dbe";
  roundRect(-s * 0.08, -s * 0.42, s * 0.16, s * 0.68, 4);
  ctx.fill();
  ctx.fillStyle = "#182d3d";
  ctx.beginPath();
  ctx.moveTo(-s * 0.08, s * 0.24);
  ctx.lineTo(s * 0.08, s * 0.24);
  ctx.lineTo(0, s * 0.44);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#8ad3e8";
  ctx.fillRect(-s * 0.08, -s * 0.26, s * 0.16, s * 0.08);
  ctx.restore();
}

function drawPencilIcon(s) {
  ctx.save();
  ctx.rotate(-0.78);
  ctx.fillStyle = "#f6c644";
  roundRect(-s * 0.09, -s * 0.42, s * 0.18, s * 0.68, 4);
  ctx.fill();
  ctx.fillStyle = "#e95d86";
  ctx.fillRect(-s * 0.09, -s * 0.42, s * 0.18, s * 0.15);
  ctx.fillStyle = "#f4d1a1";
  ctx.beginPath();
  ctx.moveTo(-s * 0.09, s * 0.26);
  ctx.lineTo(s * 0.09, s * 0.26);
  ctx.lineTo(0, s * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#343434";
  ctx.beginPath();
  ctx.moveTo(-s * 0.035, s * 0.36);
  ctx.lineTo(s * 0.035, s * 0.36);
  ctx.lineTo(0, s * 0.45);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawRulerIcon(s) {
  ctx.save();
  ctx.rotate(-0.45);
  ctx.fillStyle = "#ffd35c";
  roundRect(-s * 0.46, -s * 0.11, s * 0.92, s * 0.22, 4);
  ctx.fill();
  ctx.strokeStyle = "#715b2c";
  ctx.lineWidth = 2;
  ctx.stroke();
  for (let i = 0; i < 7; i += 1) {
    const x = -s * 0.36 + i * s * 0.12;
    ctx.beginPath();
    ctx.moveTo(x, -s * 0.1);
    ctx.lineTo(x, i % 2 ? -s * 0.01 : s * 0.04);
    ctx.stroke();
  }
  ctx.restore();
}

function drawEraserIcon(s) {
  ctx.save();
  ctx.rotate(-0.25);
  ctx.fillStyle = "#f48ca4";
  roundRect(-s * 0.38, -s * 0.22, s * 0.5, s * 0.42, 6);
  ctx.fill();
  ctx.fillStyle = "#7fc4e8";
  roundRect(s * 0.04, -s * 0.22, s * 0.34, s * 0.42, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(31,42,50,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-s * 0.34, -s * 0.18, s * 0.68, s * 0.34);
  ctx.restore();
}

function drawSchoolbagIcon(s) {
  ctx.strokeStyle = "#9f3754";
  ctx.lineWidth = s * 0.07;
  ctx.beginPath();
  ctx.arc(0, -s * 0.18, s * 0.18, Math.PI, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#e95d86";
  roundRect(-s * 0.34, -s * 0.18, s * 0.68, s * 0.56, 8);
  ctx.fill();
  ctx.fillStyle = "#ffd36b";
  roundRect(-s * 0.2, s * 0.05, s * 0.4, s * 0.2, 5);
  ctx.fill();
  ctx.strokeStyle = "rgba(31,42,50,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBoardIcon(s) {
  ctx.fillStyle = "#f8c458";
  roundRect(-s * 0.44, -s * 0.3, s * 0.88, s * 0.6, 5);
  ctx.fill();
  ctx.fillStyle = "#2f7d64";
  roundRect(-s * 0.38, -s * 0.24, s * 0.76, s * 0.48, 4);
  ctx.fill();
  ctx.strokeStyle = "rgba(217,255,244,0.6)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-s * 0.24, -s * 0.05);
  ctx.lineTo(s * 0.22, -s * 0.05);
  ctx.moveTo(-s * 0.18, s * 0.08);
  ctx.lineTo(s * 0.18, s * 0.08);
  ctx.stroke();
}

function drawDeskIcon(s) {
  ctx.fillStyle = "#b96e4a";
  roundRect(-s * 0.44, -s * 0.18, s * 0.88, s * 0.18, 4);
  ctx.fill();
  ctx.fillStyle = "#8c573d";
  ctx.fillRect(-s * 0.37, -s * 0.01, s * 0.12, s * 0.38);
  ctx.fillRect(s * 0.25, -s * 0.01, s * 0.12, s * 0.38);
  ctx.fillStyle = "#4c8a89";
  ctx.fillRect(-s * 0.3, s * 0.15, s * 0.6, s * 0.08);
}

function drawCupboardIcon(s) {
  ctx.fillStyle = "#e2a247";
  roundRect(-s * 0.32, -s * 0.42, s * 0.64, s * 0.78, 6);
  ctx.fill();
  ctx.strokeStyle = "rgba(74,50,32,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.36);
  ctx.lineTo(0, s * 0.32);
  ctx.stroke();
  ctx.fillStyle = "#85613c";
  ctx.beginPath();
  ctx.arc(-s * 0.07, -s * 0.02, 3, 0, Math.PI * 2);
  ctx.arc(s * 0.07, -s * 0.02, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawBookcaseIcon(s) {
  ctx.fillStyle = "#4da7a0";
  roundRect(-s * 0.38, -s * 0.4, s * 0.76, s * 0.78, 5);
  ctx.fill();
  ctx.fillStyle = "#fffaf0";
  ctx.fillRect(-s * 0.3, -s * 0.28, s * 0.6, s * 0.08);
  ctx.fillRect(-s * 0.3, s * 0.02, s * 0.6, s * 0.08);
  const colors = ["#e95d86", "#ffd36b", "#5a79d6", "#49a66a"];
  for (let row = 0; row < 2; row += 1) {
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = colors[(i + row) % colors.length];
      ctx.fillRect(-s * 0.27 + i * s * 0.14, -s * 0.23 + row * s * 0.31, s * 0.08, s * 0.22);
    }
  }
}

function drawClockIcon(s) {
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2e6670";
  ctx.lineWidth = s * 0.06;
  ctx.stroke();
  ctx.strokeStyle = "#1f2a32";
  ctx.lineWidth = s * 0.035;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -s * 0.2);
  ctx.moveTo(0, 0);
  ctx.lineTo(s * 0.16, s * 0.1);
  ctx.stroke();
  ctx.fillStyle = "#e95d86";
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.04, 0, Math.PI * 2);
  ctx.fill();
}

function drawTeacherIcon(s) {
  ctx.fillStyle = "#4f6fc9";
  roundRect(-s * 0.26, s * 0.02, s * 0.52, s * 0.34, 8);
  ctx.fill();
  ctx.fillStyle = "#f7c9a9";
  ctx.beginPath();
  ctx.arc(0, -s * 0.16, s * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5b3b2a";
  ctx.beginPath();
  ctx.arc(0, -s * 0.23, s * 0.23, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1f2a32";
  ctx.beginPath();
  ctx.arc(-s * 0.07, -s * 0.16, 2.3, 0, Math.PI * 2);
  ctx.arc(s * 0.07, -s * 0.16, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#1f2a32";
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.arc(0, -s * 0.08, s * 0.07, 0.1, Math.PI - 0.1);
  ctx.stroke();
  ctx.strokeStyle = "#ffd36b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(s * 0.28, s * 0.08);
  ctx.lineTo(s * 0.44, -s * 0.2);
  ctx.stroke();
}

function drawBonusIcon(x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = "#f28d57";
  ctx.lineWidth = Math.max(4, size * 0.12);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-size * 0.24, 0);
  ctx.lineTo(size * 0.24, 0);
  ctx.moveTo(0, -size * 0.24);
  ctx.lineTo(0, size * 0.24);
  ctx.stroke();
  ctx.restore();
}

function starPath(x, y, outer, inner) {
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

function roundRect(x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) * 0.5, Math.abs(h) * 0.5);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawFittedText(text, x, y, maxWidth, maxSize, minSize, weight) {
  let size = maxSize;
  do {
    ctx.font = `${weight || "800"} ${size}px Segoe UI, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth || size <= minSize) break;
    size -= 1;
  } while (size > minSize);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function loop(timeMs) {
  if (!state.lastTime) state.lastTime = timeMs;
  const dt = Math.min(0.034, (timeMs - state.lastTime) / 1000);
  state.lastTime = timeMs;
  if (state.running && !state.paused && !state.finished) update(dt, timeMs);
  draw(timeMs);
  requestAnimationFrame(loop);
}

function pointerToCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function setTargetFromPointer(event) {
  if (!state.running || state.finished) return;
  const point = pointerToCanvas(event);
  const bounds = heroBounds();
  state.targetX = clamp(point.x, bounds.minX, bounds.maxX);
}

window.addEventListener("resize", resize);
window.addEventListener("keydown", (event) => {
  state.keys.add(event.code);
  if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) event.preventDefault();
  if (event.code === "Space" && state.running && !state.finished) togglePause();
});
window.addEventListener("keyup", (event) => {
  state.keys.delete(event.code);
});
canvas.addEventListener("pointermove", setTargetFromPointer);
canvas.addEventListener("pointerdown", (event) => {
  ensureAudio();
  setTargetFromPointer(event);
});

startBtn.addEventListener("click", startGame);
playAgainBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
soundBtn.addEventListener("click", () => {
  state.muted = !state.muted;
  if (state.muted && window.speechSynthesis) window.speechSynthesis.cancel();
  soundBtn.classList.toggle("is-muted", state.muted);
  soundBtn.setAttribute("aria-label", state.muted ? "Sound off" : "Sound on");
  if (!state.muted) playBonus();
});

function togglePause() {
  if (!state.running || state.finished) return;
  state.paused = !state.paused;
  setPauseButton(state.paused);
}

function setPauseButton(isPaused) {
  pauseBtn.setAttribute("aria-label", isPaused ? "Resume" : "Pause");
  if (isPaused) {
    pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="filled" d="M8 5v14l11-7z"></path></svg>';
  } else {
    pauseBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="filled" d="M8 5h3v14H8z"></path><path class="filled" d="M13 5h3v14h-3z"></path></svg>';
  }
}

heroImage.addEventListener("load", () => {
  resize();
});

resize();
pickTarget(true);
updateHud();
requestAnimationFrame(loop);
