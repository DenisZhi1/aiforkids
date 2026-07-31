const FISH_TYPES = ["orange", "clown", "red", "puffer"];
const ANSWERS = ["There is", "There are", "Is there", "Are there"];
const CORRECT_SCORE = 15;
const WRONG_PENALTY = 3;

const QUESTIONS = [
  { sentence: "_____ a crab under the pier.", answer: "There is", hint: "One crab = There is", creature: "crab", count: 1 },
  { sentence: "_____ three shells on the sand.", answer: "There are", hint: "Three shells = There are", creature: "shell", count: 3 },
  { sentence: "_____ a turtle in the sea?", answer: "Is there", hint: "One turtle + question = Is there?", creature: "turtle", count: 1 },
  { sentence: "_____ two dolphins in the sea?", answer: "Are there", hint: "Two dolphins + question = Are there?", creature: "dolphin", count: 2 },
  { sentence: "_____ one starfish on the sand.", answer: "There is", hint: "One starfish = There is", creature: "starfish", count: 1 },
  { sentence: "_____ four crabs by the rock.", answer: "There are", hint: "Four crabs = There are", creature: "crab", count: 4 },
  { sentence: "_____ a whale in the sea?", answer: "Is there", hint: "One whale + question = Is there?", creature: "whale", count: 1 },
  { sentence: "_____ three turtles in the water?", answer: "Are there", hint: "Three turtles + question = Are there?", creature: "turtle", count: 3 },
  { sentence: "_____ a jellyfish near the coral.", answer: "There is", hint: "One jellyfish = There is", creature: "jellyfish", count: 1 },
  { sentence: "_____ two sharks in the sea.", answer: "There are", hint: "Two sharks = There are", creature: "shark", count: 2 },
  { sentence: "_____ a shell on the sand?", answer: "Is there", hint: "One shell + question = Is there?", creature: "shell", count: 1 },
  { sentence: "_____ four starfish on the sand?", answer: "Are there", hint: "Four starfish + question = Are there?", creature: "starfish", count: 4 },
];

const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  result: document.getElementById("resultScreen"),
};

const playField = document.getElementById("playField");
const fishLayer = document.getElementById("fishLayer");
const clueLayer = document.getElementById("clueLayer");
const effectLayer = document.getElementById("effectLayer");
const cat = document.getElementById("cat");
const catRig = document.getElementById("catRig");
const rod = document.getElementById("rod");
const hook = document.getElementById("hook");
const fishingLine = document.getElementById("fishingLine");
const bucketWrap = document.getElementById("bucketWrap");
const scoreValue = document.getElementById("scoreValue");
const comboValue = document.getElementById("comboValue");
const questionText = document.getElementById("questionText");
const messageText = document.getElementById("messageText");
const roundValue = document.getElementById("roundValue");
const bucketCount = document.getElementById("bucketCount");
const finalScore = document.getElementById("finalScore");
const resultStars = document.getElementById("resultStars");
const gameCursor = document.getElementById("gameCursor");
const soundToggle = document.getElementById("soundToggle");
const soundIcon = document.getElementById("soundIcon");
const volumeSlider = document.getElementById("volumeSlider");
const soundControls = [
  { toggle: soundToggle, icon: soundIcon, slider: volumeSlider },
  {
    toggle: document.getElementById("startSoundToggle"),
    icon: document.getElementById("startSoundIcon"),
    slider: document.getElementById("startVolumeSlider"),
  },
];

const catchSounds = {
  correct: new Audio("assets/audio/correct-catch.mp3"),
  wrong: new Audio("assets/audio/wrong-catch.mp3"),
};

const audioState = {
  volume: 0.65,
  lastAudibleVolume: 0.65,
  muted: false,
};

const sceneMetrics = {
  fieldLeft: 0,
  fieldTop: 0,
  width: 0,
  height: 0,
  rodAnchor: { x: 0, y: 0 },
  bucket: { x: 0, y: 0 },
  water: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
};

const state = {
  screen: "start",
  questions: [],
  round: 0,
  score: 0,
  combo: 0,
  caught: 0,
  targets: [],
  resolving: false,
  turnId: 0,
  lastTime: 0,
  hook: { x: 760, y: 520, targetX: 760, targetY: 520, locked: false },
};

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("playAgainButton").addEventListener("click", startGame);
document.getElementById("replayButton").addEventListener("click", startGame);
document.getElementById("homeButton").addEventListener("click", showMenu);
document.getElementById("resultMenuButton").addEventListener("click", showMenu);
document.getElementById("nextButton").addEventListener("click", skipQuestion);
soundControls.forEach((control) => {
  control.toggle.addEventListener("click", toggleSound);
  control.slider.addEventListener("input", changeVolume);
});

playField.addEventListener("pointermove", moveHookFromPointer);
playField.addEventListener("pointerdown", moveHookFromPointer);
window.addEventListener("resize", handleResize);

setupGameCursor();
Object.values(catchSounds).forEach((sound) => { sound.preload = "auto"; });
updateAudioControls();

function toggleSound(event) {
  const button = event?.currentTarget;
  button?.classList.remove("is-switching");
  void button?.offsetWidth;
  button?.classList.add("is-switching");
  window.setTimeout(() => button?.classList.remove("is-switching"), 300);

  if (audioState.muted || audioState.volume === 0) {
    audioState.volume = audioState.lastAudibleVolume;
    audioState.muted = false;
  } else {
    audioState.lastAudibleVolume = audioState.volume;
    audioState.volume = 0;
    audioState.muted = true;
  }
  updateAudioControls();
}

function changeVolume(event) {
  audioState.volume = Number(event.currentTarget.value) / 100;
  audioState.muted = audioState.volume === 0;
  if (audioState.volume > 0) {
    audioState.lastAudibleVolume = audioState.volume;
  }
  updateAudioControls();
}

function updateAudioControls() {
  soundControls.forEach((control) => {
    control.slider.value = String(Math.round(audioState.volume * 100));
    control.icon.src = audioState.muted ? "assets/ui/sound-off.webp?v=1" : "assets/ui/sound-on.webp?v=1";
    control.toggle.setAttribute("aria-pressed", String(audioState.muted));
    control.toggle.setAttribute("aria-label", audioState.muted ? "Turn sound on" : "Mute sound");
  });
}

function playCatchSound(type) {
  if (audioState.muted || audioState.volume === 0) {
    return;
  }
  const sound = catchSounds[type];
  sound.pause();
  sound.currentTime = 0;
  sound.volume = audioState.volume;
  sound.play().catch(() => {});
}

function setupGameCursor() {
  if (!gameCursor || !window.matchMedia("(pointer: fine)").matches) {
    return;
  }

  const cursorPosition = { x: -100, y: -100, targetX: -100, targetY: -100 };
  document.documentElement.classList.add("has-game-cursor");

  window.addEventListener("pointermove", (event) => {
    cursorPosition.targetX = event.clientX;
    cursorPosition.targetY = event.clientY;
    if (!gameCursor.classList.contains("is-visible")) {
      cursorPosition.x = event.clientX;
      cursorPosition.y = event.clientY;
      gameCursor.classList.add("is-visible");
    }
  });

  window.addEventListener("pointerover", (event) => {
    const interactive = event.target instanceof Element && event.target.closest("button, a, input");
    gameCursor.classList.toggle("is-hovering", Boolean(interactive));
  });
  window.addEventListener("pointerdown", () => gameCursor.classList.add("is-pressed"));
  window.addEventListener("pointerup", () => gameCursor.classList.remove("is-pressed"));
  document.documentElement.addEventListener("mouseleave", () => gameCursor.classList.remove("is-visible"));
  window.addEventListener("blur", () => gameCursor.classList.remove("is-visible", "is-pressed"));

  function animateCursor() {
    cursorPosition.x += (cursorPosition.targetX - cursorPosition.x) * 0.42;
    cursorPosition.y += (cursorPosition.targetY - cursorPosition.y) * 0.42;
    gameCursor.style.transform = `translate3d(${cursorPosition.x}px, ${cursorPosition.y}px, 0)`;
    requestAnimationFrame(animateCursor);
  }

  requestAnimationFrame(animateCursor);
}

function startGame() {
  state.questions = shuffle([...QUESTIONS]);
  state.round = 0;
  state.score = 0;
  state.combo = 0;
  state.caught = 0;
  state.resolving = false;
  state.turnId += 1;
  bucketCount.textContent = "0";
  showScreen("game");
  refreshSceneMetrics();
  resetHook();
  updateHud();
  showQuestion();
}

function showMenu() {
  state.turnId += 1;
  state.targets = [];
  fishLayer.replaceChildren();
  clueLayer.replaceChildren();
  showScreen("start");
}

function showScreen(name) {
  state.screen = name;
  Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle("is-active", key === name));
}

function showQuestion() {
  if (state.round >= state.questions.length) {
    finishGame();
    return;
  }

  state.turnId += 1;
  state.resolving = false;
  const question = state.questions[state.round];
  questionText.textContent = question.sentence;
  messageText.textContent = "Move the hook. Catch the right fish!";
  catRig.classList.remove("is-happy", "is-thinking", "is-casting");
  refreshSceneMetrics();
  renderClue(question);
  spawnFish(question);
  updateHud();
  resetHook();
}

function renderClue(question) {
  const group = document.createElement("div");
  group.className = "clue-group";

  for (let index = 0; index < question.count; index += 1) {
    const image = document.createElement("img");
    image.src = `assets/fish/creature-${question.creature}.webp`;
    image.alt = "";
    group.append(image);
  }

  clueLayer.replaceChildren(group);
}

function spawnFish(question) {
  fishLayer.replaceChildren();
  state.targets = [];

  const field = sceneMetrics;
  const lanes = shuffle([
    { x: 0.39, y: 0.61 },
    { x: 0.66, y: 0.58 },
    { x: 0.45, y: 0.79 },
    { x: 0.73, y: 0.78 },
  ]);
  const types = shuffle([...FISH_TYPES]).slice(0, ANSWERS.length);
  const answerOrder = shuffle([...ANSWERS]);

  answerOrder.forEach((answer, index) => {
    const type = types[index];
    const element = document.createElement("button");
    element.className = "fish-target";
    element.type = "button";
    element.setAttribute("aria-label", `Catch fish with answer ${answer}`);

    const image = document.createElement("img");
    image.className = "fish-sprite";
    image.src = baseFish(type);
    image.dataset.fishType = type;
    image.alt = "";

    const label = document.createElement("span");
    label.className = "answer-label";
    label.textContent = answer;
    element.append(image, label);
    fishLayer.append(element);

    const size = element.getBoundingClientRect();
    const lane = lanes[index];
    const target = {
      answer,
      type,
      element,
      image,
      label,
      x: field.width * lane.x,
      y: field.height * lane.y,
      vx: randomBetween(34, 55) * (index % 2 === 0 ? 1 : -1),
      vy: randomBetween(7, 15) * (index < 2 ? 1 : -1),
      width: size.width || 170,
      height: size.height || 140,
      phase: Math.random() * Math.PI * 2,
      mode: "swim",
      opacity: 1,
      catchProgress: 0,
    };

    element.addEventListener("click", () => catchFish(target));
    state.targets.push(target);
  });
}

function catchFish(target) {
  if (state.resolving || target.mode !== "swim" || state.screen !== "game") {
    return;
  }

  state.resolving = true;
  state.hook.locked = true;
  state.hook.targetX = target.x + target.width * 0.5;
  state.hook.targetY = target.y + target.height * 0.35;
  catRig.classList.remove("is-casting");
  void catRig.offsetWidth;
  catRig.classList.add("is-casting");
  const question = state.questions[state.round];
  const turnId = state.turnId;
  playCatchSound(target.answer === question.answer ? "correct" : "wrong");

  setTimeout(() => {
    if (turnId !== state.turnId || state.screen !== "game") {
      return;
    }
    resolveCatch(target, question);
  }, 360);
}

function resolveCatch(target, question) {
  const centerX = target.x + target.width * 0.5;
  const centerY = target.y + target.height * 0.42;

  if (target.answer === question.answer) {
    target.mode = "caught";
    target.image.src = caughtFish(target.type);
    target.label.textContent = "Caught!";
    target.element.classList.add("is-caught");
    state.score += CORRECT_SCORE;
    state.combo += 1;
    state.caught += 1;
    bucketCount.textContent = String(state.caught);
    messageText.textContent = "Great catch! That is right!";
    catRig.classList.remove("is-thinking");
    catRig.classList.add("is-happy");
    bucketWrap.classList.remove("is-catching");
    void bucketWrap.offsetWidth;
    bucketWrap.classList.add("is-catching");
    addEffect("assets/effects/water-splash.webp", centerX, centerY);
    addEffect("assets/effects/correct-stars.webp", centerX, centerY - 12);
    addScorePop(`+${CORRECT_SCORE}`, centerX, centerY, false);
    updateHud();

    setTimeout(() => {
      state.round += 1;
      showQuestion();
    }, 1100);
    return;
  }

  target.mode = "wrong";
  target.image.src = wrongFish(target.type);
  target.label.textContent = "Try again!";
  target.element.classList.add("is-wrong");
  target.vx *= -1.7;
  state.score = Math.max(0, state.score - WRONG_PENALTY);
  state.combo = 0;
  messageText.textContent = question.hint;
  catRig.classList.remove("is-happy");
  catRig.classList.add("is-thinking");
  addEffect("assets/effects/wrong-puff.webp", centerX, centerY);
  addScorePop(`-${WRONG_PENALTY}`, centerX, centerY, true);
  updateHud();

  setTimeout(() => {
    if (!target.element.isConnected || state.screen !== "game") {
      return;
    }
    target.mode = "swim";
    target.image.src = baseFish(target.type);
    target.label.textContent = target.answer;
    target.element.classList.remove("is-wrong");
    catRig.classList.remove("is-thinking");
    state.resolving = false;
    state.hook.locked = false;
  }, 950);
}

function skipQuestion() {
  if (state.screen !== "game" || state.resolving) {
    return;
  }
  state.combo = 0;
  state.round += 1;
  showQuestion();
}

function finishGame() {
  state.screen = "result";
  state.targets = [];
  fishLayer.replaceChildren();
  finalScore.textContent = String(state.score);
  const maxScore = QUESTIONS.length * CORRECT_SCORE;
  const stars = state.score >= maxScore * 0.82 ? 3 : state.score >= maxScore * 0.55 ? 2 : 1;
  resultStars.replaceChildren();

  for (let index = 0; index < 3; index += 1) {
    const image = document.createElement("img");
    image.src = index < stars ? "assets/ui/star-full.webp" : "assets/ui/star-empty.webp";
    image.alt = index < stars ? "Full star" : "Empty star";
    resultStars.append(image);
  }

  showScreen("result");
}

function moveHookFromPointer(event) {
  if (state.screen !== "game" || state.hook.locked) {
    return;
  }
  const water = sceneMetrics.water;
  state.hook.targetX = clamp(event.clientX - sceneMetrics.fieldLeft, water.minX, water.maxX);
  state.hook.targetY = clamp(event.clientY - sceneMetrics.fieldTop, water.minY, water.maxY);
}

function resetHook() {
  state.hook.x = sceneMetrics.width * 0.52;
  state.hook.y = sceneMetrics.height * 0.57;
  state.hook.targetX = state.hook.x;
  state.hook.targetY = state.hook.y;
  state.hook.locked = false;
}

function keepHookInWater() {
  if (state.screen !== "game") {
    return;
  }
  const water = sceneMetrics.water;
  state.hook.targetX = clamp(state.hook.targetX, water.minX, water.maxX);
  state.hook.targetY = clamp(state.hook.targetY, water.minY, water.maxY);
}

function handleResize() {
  refreshSceneMetrics();
  keepHookInWater();
}

function refreshSceneMetrics() {
  if (state.screen !== "game") {
    return;
  }

  const field = playField.getBoundingClientRect();
  const rodRect = rod.getBoundingClientRect();
  const bucketRect = bucketWrap.getBoundingClientRect();

  sceneMetrics.fieldLeft = field.left;
  sceneMetrics.fieldTop = field.top;
  sceneMetrics.width = field.width;
  sceneMetrics.height = field.height;
  sceneMetrics.water.minX = field.width * 0.34;
  sceneMetrics.water.maxX = field.width - 42;
  sceneMetrics.water.minY = Math.max(230, field.height * 0.46);
  sceneMetrics.water.maxY = field.height - 90;
  sceneMetrics.rodAnchor.x = rodRect.left - field.left + rodRect.width * 0.82;
  sceneMetrics.rodAnchor.y = rodRect.top - field.top + rodRect.height * 0.09;
  sceneMetrics.bucket.x = bucketRect.left - field.left + bucketRect.width * 0.5;
  sceneMetrics.bucket.y = bucketRect.top - field.top + bucketRect.height * 0.45;
}

function animate(time = 0) {
  const dt = Math.min(0.04, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;

  if (state.screen === "game") {
    animateHook(dt);
    animateFish(dt, time / 1000);
  }
  requestAnimationFrame(animate);
}

function animateHook(dt) {
  const speed = Math.min(1, dt * 12);
  state.hook.x += (state.hook.targetX - state.hook.x) * speed;
  state.hook.y += (state.hook.targetY - state.hook.y) * speed;
  hook.style.left = `${state.hook.x}px`;
  hook.style.top = `${state.hook.y}px`;

  const anchor = sceneMetrics.rodAnchor;
  const dx = state.hook.x - anchor.x;
  const dy = state.hook.y - anchor.y;
  const length = Math.hypot(dx, dy);
  fishingLine.style.left = `${anchor.x}px`;
  fishingLine.style.top = `${anchor.y}px`;
  fishingLine.style.height = `${length}px`;
  fishingLine.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI - 90}deg)`;

  let nearest = null;
  let nearestDistance = 90;
  state.targets.forEach((target) => {
    const distance = Math.hypot(state.hook.x - (target.x + target.width * 0.5), state.hook.y - (target.y + target.height * 0.4));
    target.element.classList.toggle("is-near", distance < 90 && target.mode === "swim");
    if (distance < nearestDistance && target.mode === "swim") {
      nearest = target;
      nearestDistance = distance;
    }
  });
  hook.classList.toggle("is-near", Boolean(nearest));
}

function animateFish(dt, time) {
  const water = sceneMetrics.water;
  const bucketX = sceneMetrics.bucket.x;
  const bucketY = sceneMetrics.bucket.y;

  state.targets.forEach((target) => {
    if (target.mode === "swim" || target.mode === "wrong") {
      target.x += target.vx * dt;
      target.y += target.vy * dt;

      if (target.x < water.minX) {
        target.x = water.minX;
        target.vx = Math.abs(target.vx);
      }
      if (target.x + target.width > water.maxX) {
        target.x = water.maxX - target.width;
        target.vx = -Math.abs(target.vx);
      }
      if (target.y < water.minY) {
        target.y = water.minY;
        target.vy = Math.abs(target.vy);
      }
      if (target.y + target.height > water.maxY) {
        target.y = water.maxY - target.height;
        target.vy = -Math.abs(target.vy);
      }

    } else if (target.mode === "caught") {
      target.catchProgress = Math.min(1, target.catchProgress + dt * 1.25);
      const eased = 1 - Math.pow(1 - target.catchProgress, 3);
      target.x += (bucketX - target.x) * eased * dt * 5.5;
      target.y += (bucketY - target.y) * eased * dt * 5.5;
      target.opacity = 1 - Math.max(0, target.catchProgress - 0.68) / 0.32;
      state.hook.targetX = target.x + target.width * 0.5;
      state.hook.targetY = target.y + target.height * 0.3;
    }

    const bob = target.mode === "swim" ? Math.sin(time * 2 + target.phase) * 5 : 0;
    const direction = target.vx >= 0 ? 1 : -1;
    target.element.style.transform = `translate3d(${target.x}px, ${target.y + bob}px, 0)`;
    target.element.style.opacity = String(target.opacity);
    const swimTilt = target.mode === "swim" ? Math.sin(time * 3.1 + target.phase) * 2.2 : 0;
    const swimScale = target.mode === "swim" ? 1 + Math.sin(time * 4 + target.phase) * 0.018 : 1;
    target.image.style.transform = `translateX(-50%) scaleX(${direction * swimScale}) rotate(${swimTilt}deg)`;
  });
}

function baseFish(type) {
  return `assets/fish/fish-${type}.webp`;
}

function caughtFish(type) {
  return `assets/animations/fish-${type}-caught.webp`;
}

function wrongFish(type) {
  return `assets/animations/fish-${type}-wrong.webp`;
}

function addEffect(source, x, y) {
  const image = document.createElement("img");
  image.className = "splash-effect";
  image.src = source;
  image.alt = "";
  image.style.left = `${x}px`;
  image.style.top = `${y}px`;
  effectLayer.append(image);
  setTimeout(() => image.remove(), 850);
}

function addScorePop(text, x, y, penalty) {
  const pop = document.createElement("span");
  pop.className = `score-pop${penalty ? " is-penalty" : ""}`;
  pop.textContent = text;
  pop.style.left = `${x}px`;
  pop.style.top = `${y}px`;
  effectLayer.append(pop);
  setTimeout(() => pop.remove(), 950);
}

function updateHud() {
  scoreValue.textContent = String(state.score);
  comboValue.textContent = String(state.combo);
  roundValue.textContent = `${Math.min(state.round + 1, QUESTIONS.length)} / ${QUESTIONS.length}`;
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

requestAnimationFrame(animate);
