const ASSETS = {
  cat: {
    idle: "assets/space/characters/cat-astronaut-idle-game.png",
    aim: "assets/space/characters/cat-astronaut-aim-game.png",
    shoot: "assets/space/characters/cat-astronaut-shoot-game.png",
    happy: "assets/space/characters/cat-astronaut-happy-game.png",
    oops: "assets/space/characters/cat-astronaut-oops-game.png",
    victory: "assets/space/characters/cat-astronaut-victory-game.png",
  },
  answerPortal: "assets/space/props/answer-portal.png",
  laserHit: "assets/space/effects/laser-hit-burst.png",
  correctBurst: "assets/space/effects/correct-star-burst.png",
  wrongPuff: "assets/space/effects/wrong-dodge-puff.png",
  starFull: "assets/space/ui/star-full.png",
  starEmpty: "assets/space/ui/star-empty.png",
  music: {
    menu: "assets/space/audio/main-menu-loop.mp3",
    gameplay: "assets/space/audio/gameplay-loop.mp3",
  },
  sfx: {
    blaster: "assets/space/audio/sfx-blaster-shot.mp3",
    correct: "assets/space/audio/sfx-correct-answer.mp3",
    wrong: "assets/space/audio/sfx-wrong-answer.mp3",
    uiClick: "assets/space/audio/sfx-ui-click.mp3",
  },
};

const ALIEN_TYPES = [
  "teal",
  "blue",
  "purple",
  "star",
  "blob",
  "ufo",
  "robot",
  "golden",
].map((name) => ({
  name,
  idle: `assets/space/aliens/alien-${name}.png`,
  hit: `assets/space/aliens/alien-${name}-hit.png`,
  dodge: `assets/space/aliens/alien-${name}-dodge.png`,
}));

const ALIEN_ROUTES = ["wave", "loop", "orbit"];
const ALIEN_SIDES = ["left", "right", "top", "bottom"];
const ALIEN_LANE_SLOTS = [
  { x: 0.05, y: 0.05 },
  { x: 0.65, y: 0.08 },
  { x: 0.05, y: 0.83 },
  { x: 0.65, y: 0.86 },
];
const CORRECT_SCORE = 15;
const WRONG_SCORE_PENALTY = 3;
const BONUS_VALUES = [2, 3];
const BONUS_SPAWN_POINTS = [
  { x: 0.34, y: 0.32 },
  { x: 0.47, y: 0.38 },
  { x: 0.6, y: 0.31 },
  { x: 0.74, y: 0.39 },
  { x: 0.43, y: 0.58 },
  { x: 0.58, y: 0.56 },
  { x: 0.72, y: 0.57 },
];

const OBJECTS = {
  planet: "assets/space/objects/object-planet.png",
  star: "assets/space/objects/object-star.png",
  rocket: "assets/space/objects/object-rocket.png",
  satellite: "assets/space/objects/object-satellite.png",
  asteroid: "assets/space/objects/object-asteroid.png",
  crystals: "assets/space/objects/object-crystals.png",
  comet: "assets/space/objects/object-comet.png",
  spaceDog: "assets/space/objects/object-space-dog.png",
  book: "assets/space/objects/object-book.png",
  pen: "assets/space/objects/object-pen.png",
  pencil: "assets/space/objects/object-pencil.png",
  bag: "assets/space/objects/object-bag.png",
  bagThreePencils: "assets/space/objects/object-bag-three-pencils.png",
  desk: "assets/space/objects/object-desk.png",
  chair: "assets/space/objects/object-chair.png",
  sceneBookcaseThreeBooks: "assets/space/objects/scene-bookcase-three-books.png",
  sceneBookcaseManyBooks: "assets/space/objects/scene-bookcase-many-books.png",
  sceneDeskPencil: "assets/space/objects/scene-desk-pencil.png",
  sceneDeskTwoPencils: "assets/space/objects/scene-desk-two-pencils.png",
  sceneDeskOnePen: "assets/space/objects/scene-desk-one-pen.png",
  sceneDeskTwoPens: "assets/space/objects/scene-desk-two-pens.png",
  sceneChairWithBag: "assets/space/objects/scene-chair-with-bag.png",
};

const BLASTER_GEOMETRY = {
  gripX: 0.31,
  gripY: 0.67,
  muzzleX: 0.83,
  muzzleY: 0.49,
  minAngle: -12,
  maxAngle: 10,
};

const QUESTIONS = [
  {
    sentence: "_____ a desk in the classroom.",
    answer: "There is",
    hint: "One desk = There is",
    options: ["There is", "There are", "Is there", "Are there"],
    scene: { template: "desks", count: 1 },
  },
  {
    sentence: "_____ a lot of desks in the classroom.",
    answer: "There are",
    hint: "A lot of desks = There are",
    options: ["There is", "There are", "There isn't", "There aren't"],
    scene: { template: "desks", count: 7 },
  },
  {
    sentence: "_____ a bag next to the chair.",
    answer: "There is",
    hint: "One bag = There is",
    options: ["There is", "There are", "There isn't", "There aren't"],
    scene: { template: "bagNextToChair" },
  },
  {
    sentence: "_____ three books in the bookcase.",
    answer: "There are",
    hint: "Three books = There are",
    options: ["There is", "There are", "Is there", "Are there"],
    scene: { template: "bookcase", object: "book", count: 3 },
  },
  {
    sentence: "_____ a pencil on the desk.",
    answer: "There is",
    hint: "One pencil = There is",
    options: ["There is", "There are", "Is there", "Are there"],
    scene: { template: "onDesk", object: "pencil", count: 1 },
  },
  {
    sentence: "_____ two pens on the desk.",
    answer: "There are",
    hint: "Two pens = There are",
    options: ["There is", "There are", "There isn't", "There aren't"],
    scene: { template: "onDesk", object: "pen", count: 2 },
  },
  {
    sentence: "_____ a bag on the chair.",
    answer: "There isn't",
    hint: "No bag on the chair = There isn't",
    options: ["There isn't", "There aren't", "There is", "There are"],
    scene: { template: "emptyChair" },
  },
  {
    sentence: "_____ any books on the desk.",
    answer: "There aren't",
    hint: "No books + any = There aren't",
    options: ["There isn't", "There aren't", "Is there", "Are there"],
    scene: { template: "emptyDesk" },
  },
  {
    sentence: "_____ a chair next to the desk?",
    answer: "Is there",
    hint: "Question + one chair = Is there...?",
    options: ["Is there", "Are there", "There is", "There are"],
    scene: { template: "chairNextToDesk" },
  },
  {
    sentence: "_____ two pencils on the desk?",
    answer: "Are there",
    hint: "Question + two pencils = Are there...?",
    options: ["Is there", "Are there", "There is", "There are"],
    scene: { template: "onDesk", object: "pencil", count: 2 },
  },
  {
    sentence: "Is there a bag on the chair? _____",
    answer: "Yes, there is",
    hint: "One thing + yes = Yes, there is",
    options: ["Yes, there is", "No, there isn't", "Yes, there are", "No, there aren't"],
    scene: { template: "bagOnChair" },
  },
  {
    sentence: "Are there any pens in the bag? _____",
    answer: "No, there aren't",
    hint: "No pens + plural answer = No, there aren't",
    options: ["Yes, there is", "No, there isn't", "Yes, there are", "No, there aren't"],
    scene: { template: "inBag", object: "pen", count: 0 },
  },
];

const LEVEL_TWO_QUESTIONS = [
  {
    sentence: "_____ a pen on the desk.",
    answer: "There is",
    hint: "One pen = There is",
    options: ["There is", "There are", "There isn't", "There aren't"],
    scene: { template: "onDesk", object: "pen", count: 1 },
  },
  {
    sentence: "_____ three bags next to the desks.",
    answer: "There are",
    hint: "Three bags = There are",
    options: ["There is", "There are", "Is there", "Are there"],
    scene: { template: "bagsNextToDesks" },
  },
  {
    sentence: "_____ a desk next to the chair.",
    answer: "There is",
    hint: "One desk = There is",
    options: ["There is", "There are", "Is there", "Are there"],
    scene: { template: "deskNextToChair" },
  },
  {
    sentence: "_____ a lot of books in the bookcase.",
    answer: "There are",
    hint: "A lot of books = There are",
    options: ["There is", "There are", "There isn't", "There aren't"],
    scene: { template: "bookcase", object: "book", count: 5 },
  },
  {
    sentence: "_____ a pencil in the bag.",
    answer: "There isn't",
    hint: "No pencil in the bag = There isn't",
    options: ["There isn't", "There aren't", "There is", "There are"],
    scene: { template: "inBag", object: "pencil", count: 0 },
  },
  {
    sentence: "_____ any pens on the desks.",
    answer: "There aren't",
    hint: "No pens + plural answer = There aren't",
    options: ["There isn't", "There aren't", "Is there", "Are there"],
    scene: { template: "emptyDesks", count: 2 },
  },
  {
    sentence: "_____ a chair next to the desk?",
    answer: "Is there",
    hint: "Question + one chair = Is there...?",
    options: ["Is there", "Are there", "There is", "There are"],
    scene: { template: "chairNextToDesk" },
  },
  {
    sentence: "_____ any pencils in the bag?",
    answer: "Are there",
    hint: "Question + pencils = Are there...?",
    options: ["Is there", "Are there", "There is", "There are"],
    scene: { template: "inBag", object: "pencil", count: 3 },
  },
  {
    sentence: "Are there books in the bookcase? _____",
    answer: "Yes, there are",
    hint: "Books + yes = Yes, there are",
    options: ["Yes, there is", "No, there isn't", "Yes, there are", "No, there aren't"],
    scene: { template: "bookcase", object: "book", count: 3 },
  },
  {
    sentence: "Are there a lot of desks? _____",
    answer: "Yes, there are",
    hint: "Plural things + yes = Yes, there are",
    options: ["Yes, there is", "No, there isn't", "Yes, there are", "No, there aren't"],
    scene: { template: "desks", count: 10 },
  },
  {
    sentence: "Is there a pen on the desk? _____",
    answer: "No, there isn't",
    hint: "No pen on the desk = No, there isn't",
    options: ["Yes, there is", "No, there isn't", "Yes, there are", "No, there aren't"],
    scene: { template: "emptyDesk" },
  },
  {
    sentence: "Are there any books on the desks? _____",
    answer: "No, there aren't",
    hint: "No books + plural answer = No, there aren't",
    options: ["Yes, there is", "No, there isn't", "Yes, there are", "No, there aren't"],
    scene: { template: "emptyDesks", count: 2 },
  },
];

const LEVELS = [
  {
    name: "Level 1",
    questions: QUESTIONS,
    alienNames: ["teal", "blue", "star", "blob", "purple"],
    speedMultiplier: 1,
    alienClass: "level-one",
  },
  {
    name: "Level 2",
    questions: LEVEL_TWO_QUESTIONS,
    alienNames: ["ufo", "robot", "golden", "purple", "blue"],
    speedMultiplier: 1.18,
    alienClass: "level-two",
  },
];

const screens = {
  start: document.getElementById("startScreen"),
  game: document.getElementById("gameScreen"),
  result: document.getElementById("resultScreen"),
};

const playField = document.getElementById("playField");
const alienLayer = document.getElementById("alienLayer");
const objectLayer = document.getElementById("objectLayer");
const bonusLayer = document.getElementById("bonusLayer");
const shotLayer = document.getElementById("shotLayer");
const cat = document.getElementById("cat");
const catRig = document.getElementById("catRig");
const blaster = document.getElementById("blaster");
const aimDot = document.getElementById("aimDot");
const impactEffect = document.getElementById("impactEffect");
const wrongEffect = document.getElementById("wrongEffect");
const scoreValue = document.getElementById("scoreValue");
const comboValue = document.getElementById("comboValue");
const questionText = document.getElementById("questionText");
const messageText = document.getElementById("messageText");
const roundText = document.getElementById("roundText");
const volumeControls = Array.from(document.querySelectorAll(".volume-control"));
const volumeToggles = Array.from(document.querySelectorAll(".volume-toggle"));
const volumeSliders = Array.from(document.querySelectorAll(".volume-control input[type='range']"));
const resultTitle = document.getElementById("resultTitle");
const resultScore = document.getElementById("resultScore");
const resultStars = document.getElementById("resultStars");
const nextLevelButton = document.getElementById("nextLevelButton");
const resultPanel = document.querySelector(".result-panel");
const resultCreatorLink = document.getElementById("resultCreatorLink");
let audioContext = null;
const menuMusic = createLoopingAudio(ASSETS.music.menu);
const gameplayMusic = createLoopingAudio(ASSETS.music.gameplay);
const soundEffects = {
  click: createSoundEffect(ASSETS.sfx.uiClick, 0.62),
  start: createSoundEffect(ASSETS.sfx.uiClick, 0.7),
  laser: createSoundEffect(ASSETS.sfx.blaster, 0.9),
  correct: createSoundEffect(ASSETS.sfx.correct, 0.82),
  wrong: createSoundEffect(ASSETS.sfx.wrong, 0.72),
};

const state = {
  screen: "start",
  level: 0,
  score: 0,
  levelScore: 0,
  combo: 0,
  volume: Number(volumeSliders[0]?.value || 0.65),
  lastVolume: Number(volumeSliders[0]?.value || 0.65),
  muted: false,
  round: 0,
  questions: [],
  targets: [],
  bonuses: [],
  nextBonusAt: 0,
  active: false,
  resolving: false,
  turnId: 0,
  lastTime: 0,
  aim: {
    x: 860,
    y: 360,
    targetX: 860,
    targetY: 360,
  },
  blasterAngle: 0,
};

document.getElementById("startButton").addEventListener("click", startGame);
document.getElementById("homeButton").addEventListener("click", goToMenu);
document.getElementById("restartButton").addEventListener("click", restartCurrentLevel);
document.getElementById("nextButton").addEventListener("click", skipQuestion);
document.getElementById("playAgainButton").addEventListener("click", restartCurrentLevel);
nextLevelButton.addEventListener("click", startNextLevel);
document.getElementById("backToMenuButton").addEventListener("click", goToMenu);

volumeToggles.forEach((toggle) => {
  toggle.addEventListener("click", toggleSound);
});

volumeSliders.forEach((slider) => {
  slider.addEventListener("pointerdown", unlockAudio);
  slider.addEventListener("input", () => {
    state.volume = Number(slider.value);
    state.muted = state.volume <= 0;
    if (state.volume > 0) {
      state.lastVolume = state.volume;
    }
    updateVolumeUi();
    syncMenuMusic();
  });
});

playField.addEventListener("pointermove", moveAimToPointer);
playField.addEventListener("pointerdown", (event) => {
  moveAimToPointer(event, true);
  shootNearestTarget();
});

window.addEventListener("keydown", (event) => {
  if (state.screen !== "game") {
    return;
  }

  const step = event.shiftKey ? 42 : 22;
  if (event.key === "ArrowLeft") state.aim.targetX -= step;
  if (event.key === "ArrowRight") state.aim.targetX += step;
  if (event.key === "ArrowUp") state.aim.targetY -= step;
  if (event.key === "ArrowDown") state.aim.targetY += step;
  if (event.key === " " || event.key === "Enter") {
    event.preventDefault();
    shootNearestTarget();
  }
});

window.addEventListener("pointerdown", handleUserAudioGesture, { passive: true });
window.addEventListener("keydown", handleUserAudioGesture);

function showScreen(name) {
  state.screen = name;
  Object.entries(screens).forEach(([screenName, element]) => {
    element.classList.toggle("is-active", screenName === name);
  });
  syncMenuMusic();
}

function toggleSound() {
  unlockAudio();

  if (state.muted || state.volume <= 0) {
    state.volume = state.lastVolume || 0.65;
    state.muted = false;
    updateVolumeUi();
    syncMenuMusic();
    playSound("click");
    return;
  }

  state.lastVolume = state.volume;
  state.volume = 0;
  state.muted = true;
  updateVolumeUi();
  syncMenuMusic();
}

function goToMenu() {
  clearTargets();
  objectLayer.innerHTML = "";
  state.active = false;
  state.resolving = false;
  state.turnId += 1;
  playSound("click");
  showScreen("start");
}

function enterFullscreen() {
  if (location.hostname === "127.0.0.1" || location.hostname === "localhost") {
    return;
  }

  const root = document.documentElement;
  if (document.fullscreenElement || !root.requestFullscreen) {
    return;
  }

  root.requestFullscreen({ navigationUI: "hide" }).catch(() => {});
}

function startGame() {
  state.level = 0;
  startLevel(true);
}

function restartCurrentLevel() {
  startLevel(true);
}

function startNextLevel() {
  if (state.level >= LEVELS.length - 1) {
    restartCurrentLevel();
    return;
  }

  state.level += 1;
  startLevel(false);
}

function startLevel(resetScore = true) {
  playSound("start");
  enterFullscreen();
  const field = getFieldSize();
  if (resetScore) {
    state.score = 0;
  }
  state.levelScore = 0;
  state.combo = 0;
  state.round = 0;
  state.questions = shuffle([...getCurrentLevel().questions]);
  state.active = true;
  state.resolving = false;
  state.aim.x = field.width * 0.68 || 860;
  state.aim.y = field.height * 0.48 || 360;
  state.aim.targetX = state.aim.x;
  state.aim.targetY = state.aim.y;
  state.bonuses = [];
  showScreen("game");
  setCat("idle");
  updateHud();
  nextQuestion();
}

function skipQuestion() {
  if (state.screen !== "game") {
    return;
  }
  playSound("click");
  state.round += 1;
  nextQuestion();
}

function nextQuestion() {
  clearTargets();
  state.resolving = false;
  state.turnId += 1;
  const questions = getCurrentQuestions();

  if (state.round >= questions.length) {
    finishGame();
    return;
  }

  const question = questions[state.round];
  questionText.textContent = question.sentence;
  messageText.textContent = "Read. Tap the right answer.";
  roundText.textContent = `${state.round + 1} / ${questions.length}`;
  setCat("idle");
  renderSceneObjects(question.scene);
  spawnAliens(question);
  scheduleNextBonus(randomBetween(2.4, 4.8));
  updateHud();
}

function finishGame() {
  const hasNextLevel = state.level < LEVELS.length - 1;
  clearTargets();
  objectLayer.innerHTML = "";
  state.active = false;
  state.resolving = false;
  setCat("victory");
  resultTitle.textContent = `${getCurrentLevel().name} Complete!`;
  resultScore.textContent = `Score: ${state.score}`;
  nextLevelButton.hidden = !hasNextLevel;
  nextLevelButton.querySelector("span").textContent = hasNextLevel ? `Level ${state.level + 2}` : "Level Complete";
  resultPanel.classList.toggle("is-final", !hasNextLevel);
  resultCreatorLink.hidden = hasNextLevel;
  renderStars();
  showScreen("result");
}

function renderStars() {
  resultStars.innerHTML = "";
  const maxScore = getCurrentQuestions().length * CORRECT_SCORE;
  const ratio = state.levelScore / maxScore;
  const stars = ratio >= 0.78 ? 3 : ratio >= 0.5 ? 2 : ratio >= 0.2 ? 1 : 0;

  for (let index = 0; index < 3; index += 1) {
    const img = document.createElement("img");
    img.src = index < stars ? ASSETS.starFull : ASSETS.starEmpty;
    img.alt = index < stars ? "Full star" : "Empty star";
    resultStars.appendChild(img);
  }
}

function getCurrentLevel() {
  return LEVELS[state.level] || LEVELS[0];
}

function getCurrentQuestions() {
  return state.questions.length ? state.questions : getCurrentLevel().questions;
}

function renderSceneObjects(scene) {
  objectLayer.innerHTML = "";

  if (!scene) {
    return;
  }

  if (scene.template === "bookcase") {
    renderBookcaseScene(scene);
    return;
  }

  if (scene.template === "bagOnChair") {
    renderBagOnChairScene();
    return;
  }

  getSceneItems(scene).forEach((item, index) => renderSceneItem(item, index));
}

function getSceneItems(scene) {
  if (scene.template === "desks" || scene.template === "emptyDesks") {
    return makeDeskItems(scene.count || 1);
  }

  if (scene.template === "emptyDesk") {
    return makeDeskItems(1);
  }

  if (scene.template === "onDesk") {
    const sceneAsset = getOnDeskSceneAsset(scene.object, scene.count || 1);

    if (sceneAsset) {
      return [sceneItem(sceneAsset, 36, 35, "clamp(142px, 14vw, 230px)", 2)];
    }

    return [
      ...makeDeskItems(1, { left: 42, top: 49, width: "clamp(92px, 8vw, 132px)" }),
      ...makeItemsOnDesk(scene.object, scene.count || 1),
    ];
  }

  if (scene.template === "bagNextToChair") {
    return [
      sceneItem("chair", 49, 49, "clamp(70px, 6.2vw, 100px)", 1),
      sceneItem("bag", 42, 52, "clamp(64px, 5.7vw, 92px)", 2, -8),
    ];
  }

  if (scene.template === "chairNextToDesk" || scene.template === "deskNextToChair") {
    return [
      sceneItem("desk", 41, 47, "clamp(92px, 8vw, 132px)", 1),
      sceneItem("chair", 51, 50, "clamp(72px, 6.4vw, 102px)", 2),
    ];
  }

  if (scene.template === "emptyChair") {
    return [sceneItem("chair", 47, 50, "clamp(80px, 7vw, 112px)", 1)];
  }

  if (scene.template === "inBag") {
    const normalizedObject = String(scene.object || "").replace(/s$/, "");

    if (normalizedObject === "pencil" && scene.count === 3) {
      return [sceneItem("bagThreePencils", 43, 39, "clamp(130px, 12vw, 190px)", 1)];
    }

    return [
      sceneItem("bag", 45, 50, "clamp(82px, 7.2vw, 116px)", 1),
      ...makeItemsInBag(scene.object, scene.count || 0),
    ];
  }

  if (scene.template === "bagsNextToDesks") {
    return [
      sceneItem("desk", 34, 45, "clamp(76px, 6.5vw, 108px)", 1),
      sceneItem("bag", 39, 49, "clamp(52px, 4.8vw, 76px)", 2, -6),
      sceneItem("desk", 46, 52, "clamp(76px, 6.5vw, 108px)", 1),
      sceneItem("bag", 51, 56, "clamp(52px, 4.8vw, 76px)", 2, 5),
      sceneItem("desk", 56, 42, "clamp(76px, 6.5vw, 108px)", 1),
      sceneItem("bag", 61, 46, "clamp(52px, 4.8vw, 76px)", 2, -4),
    ];
  }

  if (scene.object && scene.count > 0) {
    return makeRepeatedItems(scene.object, scene.count);
  }

  return [];
}

function makeRepeatedItems(object, count) {
  const slots = [
    { left: 35, top: 33 },
    { left: 45, top: 26 },
    { left: 42, top: 51 },
    { left: 52, top: 42 },
    { left: 34, top: 61 },
  ];

  return Array.from({ length: count }, (_, index) => {
    const slot = slots[index % slots.length];
    return sceneItem(
      object,
      slot.left + Math.floor(index / slots.length) * 6,
      slot.top + Math.floor(index / slots.length) * 5,
      count >= 3 ? "clamp(46px, 5.9vw, 78px)" : undefined,
      1
    );
  });
}

function getOnDeskSceneAsset(object, count) {
  const normalizedObject = String(object || "").replace(/s$/, "");
  const normalizedCount = Number(count);

  if (normalizedObject === "pencil" && normalizedCount === 1) {
    return "sceneDeskPencil";
  }

  if (normalizedObject === "pencil" && normalizedCount === 2) {
    return "sceneDeskTwoPencils";
  }

  if (normalizedObject === "pen" && normalizedCount === 1) {
    return "sceneDeskOnePen";
  }

  if (normalizedObject === "pen" && normalizedCount === 2) {
    return "sceneDeskTwoPens";
  }

  return null;
}

function makeDeskItems(count, override = {}) {
  const single = [sceneItem("desk", override.left || 42, override.top || 47, override.width || "clamp(92px, 8vw, 132px)", 1)];

  if (count <= 1) {
    return single;
  }

  if (count >= 9) {
    const classroomSlots = [
      { left: 28, top: 34 },
      { left: 38, top: 39 },
      { left: 48, top: 34 },
      { left: 58, top: 39 },
      { left: 68, top: 34 },
      { left: 31, top: 53 },
      { left: 42, top: 58 },
      { left: 53, top: 53 },
      { left: 64, top: 58 },
      { left: 75, top: 53 },
    ];

    return Array.from({ length: count }, (_, index) => {
      const slot = classroomSlots[index % classroomSlots.length];
      return sceneItem("desk", slot.left, slot.top, "clamp(48px, 4.5vw, 70px)", 1);
    });
  }

  if (count >= 6) {
    const lotSlots = [
      { left: 31, top: 38 },
      { left: 42, top: 43 },
      { left: 53, top: 38 },
      { left: 64, top: 44 },
      { left: 35, top: 56 },
      { left: 48, top: 59 },
      { left: 61, top: 56 },
      { left: 72, top: 54 },
    ];

    return Array.from({ length: count }, (_, index) => {
      const slot = lotSlots[index % lotSlots.length];
      return sceneItem("desk", slot.left, slot.top, "clamp(56px, 5.3vw, 84px)", 1);
    });
  }

  const slots = [
    { left: 34, top: 42 },
    { left: 45, top: 50 },
    { left: 56, top: 42 },
    { left: 39, top: 58 },
    { left: 52, top: 58 },
  ];

  return Array.from({ length: count }, (_, index) => {
    const slot = slots[index % slots.length];
    return sceneItem("desk", slot.left, slot.top, "clamp(66px, 6vw, 96px)", 1);
  });
}

function makeItemsOnDesk(object, count) {
  const normalizedObject = String(object || "").replace(/s$/, "");
  const slots = [
    { left: 43.4, top: 47.3, rotate: -8 },
    { left: 46.1, top: 47.7, rotate: 8 },
    { left: 41.6, top: 48.1, rotate: -14 },
    { left: 48.3, top: 47.9, rotate: 12 },
    { left: 44.8, top: 46.9, rotate: 3 },
  ];

  return Array.from({ length: count }, (_, index) => {
    const slot = slots[index % slots.length];
    return sceneItem(normalizedObject, slot.left, slot.top, "clamp(28px, 2.7vw, 42px)", 3, slot.rotate);
  });
}

function makeItemsInBag(object, count) {
  const slots = [
    { left: 47, top: 47, rotate: -12 },
    { left: 49, top: 46, rotate: 9 },
    { left: 46, top: 45.8, rotate: 14 },
    { left: 50.4, top: 48, rotate: -8 },
  ];

  return Array.from({ length: count }, (_, index) => {
    const slot = slots[index % slots.length];
    return sceneItem(object, slot.left, slot.top, "clamp(28px, 3vw, 44px)", 3, slot.rotate);
  });
}

function renderBookcaseScene(scene) {
  const asset = scene.count > 3 ? "sceneBookcaseManyBooks" : "sceneBookcaseThreeBooks";
  renderSceneItem(sceneItem(asset, 38, 28, "clamp(150px, 14vw, 235px)", 1), 0);
}

function renderBagOnChairScene() {
  renderSceneItem(
    sceneItem("sceneChairWithBag", 43, 37, "clamp(150px, 14vw, 220px)", 2),
    0
  );
}

function renderSceneItem(item, index) {
  if (!OBJECTS[item.object]) {
    return;
  }

  const img = document.createElement("img");
  img.className = "scene-object";
  img.src = OBJECTS[item.object];
  img.alt = "";
  img.style.left = `${item.left}%`;
  img.style.top = `${item.top}%`;
  img.style.animationDelay = `${index * -0.7}s`;

  if (item.width) {
    img.style.width = item.width;
  }

  if (item.z) {
    img.style.zIndex = String(item.z);
  }

  if (item.rotate) {
    img.style.transform = `rotate(${item.rotate}deg)`;
  }

  objectLayer.appendChild(img);
}

function sceneItem(object, left, top, width, z = 1, rotate = 0) {
  return { object, left, top, width, z, rotate };
}

function spawnAliens(question) {
  const level = getCurrentLevel();
  const options = shuffle([...question.options]);
  const field = getFieldSize();
  const flights = makeAlienFlightPlans(options.length, field, level.speedMultiplier || 1);
  const types = pickAlienTypes(options.length, level.alienNames);

  options.forEach((answer, index) => {
    const type = types[index];
    const flight = flights[index];
    const button = document.createElement("button");
    button.className = `alien ${level.alienClass || ""}`.trim();
    button.type = "button";
    button.dataset.answer = answer;
    button.setAttribute("aria-label", `Shoot alien with answer ${answer}`);

    const image = document.createElement("img");
    image.className = "alien-image";
    image.src = type.idle;
    image.alt = "";
    button.appendChild(image);

    const label = document.createElement("span");
    label.className = "answer-label";
    const labelText = document.createElement("span");
    labelText.textContent = answer;
    label.appendChild(labelText);
    button.appendChild(label);

    alienLayer.appendChild(button);

    const target = {
      element: button,
      image,
      label,
      labelText,
      type,
      answer,
      baseX: flight.x,
      baseY: flight.y,
      renderX: flight.x,
      renderY: flight.y,
      phase: flight.phase,
      amplitude: flight.amplitude,
      frequency: flight.frequency,
      route: flight.route,
      side: flight.side,
      vx: flight.vx,
      vy: flight.vy,
      homeX: flight.homeX,
      homeY: flight.homeY,
      radiusX: flight.radiusX,
      radiusY: flight.radiusY,
      orbitSpeed: flight.orbitSpeed,
      direction: flight.direction,
      locked: false,
      mode: "fly",
      scale: 1,
      rotation: 0,
    };

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      aimAtTarget(target);
      shootTarget(target);
    });

    state.targets.push(target);
    renderTarget(target);
  });
}

function pickAlienTypes(count, names = null) {
  const preferred = names?.length
    ? names.map((name) => ALIEN_TYPES.find((alien) => alien.name === name)).filter(Boolean)
    : [];
  const source = preferred.length ? preferred : ALIEN_TYPES;
  const picked = shuffle([...source]);

  while (picked.length < count) {
    picked.push(...shuffle([...source]));
  }

  return picked.slice(0, count);
}

function makeAlienFlightPlans(count, field, speedMultiplier = 1) {
  const sides = shuffle([...ALIEN_SIDES]);
  const lanes = shuffle([...ALIEN_LANE_SLOTS]);

  return Array.from({ length: count }, (_, index) =>
    createAlienFlightPlan(field, sides[index % sides.length], index, speedMultiplier, lanes[index % lanes.length])
  );
}

function createAlienFlightPlan(
  field,
  side = randomItem(ALIEN_SIDES),
  index = 0,
  speedMultiplier = 1,
  lane = randomItem(ALIEN_LANE_SLOTS)
) {
  const zone = getAlienFlightZone(field);
  const zoneWidth = zone.maxX - zone.minX;
  const zoneHeight = zone.maxY - zone.minY;
  const narrowField = field.width <= 700;
  const shortField = field.height <= 600;
  const jitter = narrowField ? 4 : 10;
  const x = zone.minX + zoneWidth * lane.x + randomBetween(-jitter, jitter);
  const y = zone.minY + zoneHeight * lane.y + randomBetween(-jitter, jitter);
  const phase = Math.random() * Math.PI * 2;
  const horizontalDirection = lane.x < 0.5 ? 1 : -1;
  const verticalDirection = lane.y < 0.5 ? -1 : 1;
  const horizontalSpeed = randomBetween(36, 49) * speedMultiplier;
  const verticalSpeed = randomBetween(14, 22) * speedMultiplier;

  return {
    x,
    y,
    homeX: x,
    homeY: y,
    vx: horizontalDirection * horizontalSpeed,
    vy: verticalDirection * verticalSpeed,
    side,
    phase,
    amplitude: randomBetween(18, 34),
    frequency: randomBetween(0.72, 0.94) * speedMultiplier,
    orbitSpeed: randomBetween(0.73, 0.97) * speedMultiplier,
    radiusX: randomBetween(narrowField ? 14 : shortField ? 16 : 24, narrowField ? 24 : shortField ? 28 : 42),
    radiusY: randomBetween(narrowField ? 8 : shortField ? 7 : 12, narrowField ? 14 : shortField ? 12 : 22),
    direction: index % 2 === 0 ? 1 : -1,
    route: randomItem(ALIEN_ROUTES),
  };
}

function getAlienFlightZone(field) {
  if (field.width <= 700) {
    const targetWidth = 150;
    const minX = 30;
    const maxX = Math.max(minX + 120, field.width - targetWidth - 30);
    const minY = Math.max(205, field.height * 0.24);
    const maxY = Math.max(minY + 170, Math.min(410, field.height - 306));

    return { minX, maxX, minY, maxY };
  }

  const minX = Math.min(Math.max(280, field.width * 0.24), field.width - 260);
  const maxX = Math.max(minX + 190, field.width - 290);
  const minY = field.height <= 600
    ? Math.max(142, field.height * 0.28)
    : Math.min(Math.max(190, field.height * 0.25), field.height - 285);
  const bottomReserve = Math.max(245, field.height * 0.28);
  const maxY = field.height <= 600
    ? Math.max(minY + 170, field.height - 172)
    : Math.max(minY + 180, field.height - bottomReserve);

  return { minX, maxX, minY, maxY };
}

function pickDiagonalTargetX(startX, zone, overshoot) {
  const width = zone.maxX - zone.minX;
  const center = (zone.minX + zone.maxX) * 0.5;
  const direction = startX <= center ? 1 : -1;
  const shift = randomBetween(Math.max(150, width * 0.34), Math.max(230, width * 0.72));

  return clamp(startX + direction * shift, zone.minX - overshoot, zone.maxX + overshoot);
}

function pickDiagonalTargetY(startY, zone, overshoot) {
  const height = zone.maxY - zone.minY;
  const center = (zone.minY + zone.maxY) * 0.5;
  const direction = startY <= center ? 1 : -1;
  const shift = randomBetween(Math.max(88, height * 0.42), Math.max(138, height * 0.82));

  return clamp(startY + direction * shift, zone.minY - overshoot * 0.45, zone.maxY + overshoot * 0.45);
}

function ensureAlienMotion(vx, vy, speed, side) {
  const primaryMinimum = speed * 0.74;
  const secondaryMinimum = Math.max(32, speed * 0.34);

  if (side === "left" || side === "right") {
    return {
      vx: ensureSignedMinimum(vx, primaryMinimum, side === "left" ? 1 : -1),
      vy: ensureSignedMinimum(vy, secondaryMinimum, Math.random() < 0.5 ? 1 : -1),
    };
  }

  return {
    vx: ensureSignedMinimum(vx, secondaryMinimum, Math.random() < 0.5 ? 1 : -1),
    vy: ensureSignedMinimum(vy, primaryMinimum, side === "top" ? 1 : -1),
  };
}

function ensureSignedMinimum(value, minimum, fallbackDirection) {
  const direction = Math.sign(value) || fallbackDirection;
  return Math.abs(value) < minimum ? direction * minimum : value;
}

function clearTargets() {
  state.targets.forEach((target) => target.element.remove());
  state.targets = [];
  clearBonuses();
  shotLayer.innerHTML = "";
}

function clearBonuses() {
  state.bonuses.forEach((bonus) => bonus.element.remove());
  state.bonuses = [];
  if (bonusLayer) {
    bonusLayer.innerHTML = "";
  }
}

function moveAimToPointer(event, snap = false) {
  const rect = playField.getBoundingClientRect();
  state.aim.targetX = clamp(event.clientX - rect.left, 24, rect.width - 24);
  state.aim.targetY = clamp(event.clientY - rect.top, 118, rect.height - 24);

  if (snap) {
    state.aim.x = state.aim.targetX;
    state.aim.y = state.aim.targetY;
  }
}

function aimAtTarget(target) {
  const center = getTargetCenter(target);
  state.aim.targetX = center.x;
  state.aim.targetY = center.y;
  state.aim.x = center.x;
  state.aim.y = center.y;
}

function shootNearestTarget() {
  if (state.resolving || state.screen !== "game") {
    return;
  }

  const target = getNearestTarget();
  if (target) {
    shootTarget(target);
    return;
  }

  playMissShot();
}

function getNearestTarget() {
  let best = null;
  let bestDistance = Infinity;

  state.targets.forEach((target) => {
    if (target.locked) {
      return;
    }
    const center = getTargetCenter(target);
    const distance = Math.hypot(center.x - state.aim.x, center.y - state.aim.y);

    if (distance < bestDistance) {
      best = target;
      bestDistance = distance;
    }
  });

  return bestDistance < 220 ? best : null;
}

function shootTarget(target) {
  if (target.locked || state.resolving || state.screen !== "game") {
    return;
  }

  const question = getCurrentQuestions()[state.round];
  const turnId = state.turnId;
  const center = getTargetCenter(target);
  target.locked = true;
  state.resolving = true;
  setCat("shoot");
  playBlasterKick();
  playLaserTo(center.x, center.y);

  if (target.answer === question.answer) {
    target.mode = "hit";
    target.image.src = target.type.hit;
    target.element.classList.add("is-hit");
    target.labelText.textContent = "Correct!";
    playSound("correct");
    state.combo += 1;
    applyScoreDelta(CORRECT_SCORE, center.x, center.y);
    messageText.textContent = "Yes! Good job!";
    updateHud();

    setTimeout(() => {
      if (state.turnId !== turnId || state.screen !== "game") {
        return;
      }
      playEffect(impactEffect, center.x, center.y, ASSETS.laserHit);
      setCat("happy");
    }, 170);

    setTimeout(() => {
      if (state.turnId !== turnId || state.screen !== "game") {
        return;
      }
      playEffect(impactEffect, center.x, center.y, ASSETS.correctBurst);
    }, 560);

    setTimeout(() => {
      if (state.turnId !== turnId || state.screen !== "game") {
        return;
      }
      state.round += 1;
      nextQuestion();
    }, 1250);
    return;
  }

  target.mode = "wrong";
  target.image.src = target.type.dodge;
  target.element.classList.add("is-wrong");
  target.labelText.textContent = "Try again!";
  playWrongMarker(target);
  playSound("wrong");
  state.combo = 0;
  applyScoreDelta(-WRONG_SCORE_PENALTY, center.x, center.y);
  messageText.textContent = question.hint;
  updateHud();

  setTimeout(() => {
    if (state.turnId !== turnId || state.screen !== "game") {
      return;
    }
    playEffect(wrongEffect, center.x, center.y, ASSETS.wrongPuff);
    setCat("oops");
  }, 140);

  setTimeout(() => {
    if (state.turnId !== turnId || state.screen !== "game") {
      return;
    }
    restoreWrongTarget(target);
    setCat("idle");
    state.resolving = false;
  }, 1080);
}

function restoreWrongTarget(target) {
  if (!target.element.isConnected) {
    return;
  }

  target.mode = "fly";
  target.locked = false;
  target.image.src = target.type.idle;
  target.element.classList.remove("is-wrong");
  target.labelText.textContent = target.answer;
  target.rotation = 0;
  target.scale = 1;
}

function playWrongMarker(target) {
  const marker = document.createElement("span");
  marker.className = "wrong-marker";
  marker.textContent = "!";
  target.element.appendChild(marker);
  setTimeout(() => marker.remove(), 920);
}

function showScorePopup(x, y, amount) {
  const popup = document.createElement("div");
  popup.className = "score-popup";
  popup.classList.toggle("is-negative", amount < 0);
  popup.textContent = amount > 0 ? `+${amount}` : `${amount}`;
  popup.style.left = `${x}px`;
  popup.style.top = `${y}px`;
  shotLayer.appendChild(popup);
  setTimeout(() => popup.remove(), 980);
}

function applyScoreDelta(amount, x, y) {
  if (amount > 0) {
    state.score += amount;
    state.levelScore += amount;
    showScorePopup(x, y, amount);
    return amount;
  }

  const penalty = Math.min(Math.abs(amount), state.score);
  if (penalty <= 0) {
    return 0;
  }

  state.score -= penalty;
  state.levelScore = Math.max(0, state.levelScore - penalty);
  showScorePopup(x, y, -penalty);
  return -penalty;
}

function scheduleNextBonus(delay = randomBetween(4.6, 8.2)) {
  state.nextBonusAt = performance.now() / 1000 + delay;
}

function updateBonuses(dt, time) {
  if (state.screen !== "game" || !state.active) {
    return;
  }

  if (state.bonuses.length === 0 && time >= state.nextBonusAt) {
    spawnBonus(time);
  }

  state.bonuses.slice().forEach((bonus) => {
    if (time >= bonus.expiresAt) {
      removeBonus(bonus);
      return;
    }

    bonus.x += bonus.vx * dt;
    bonus.y += bonus.vy * dt;
    bonus.rotation += bonus.spin * dt;
    bonus.scale = 0.92 + Math.sin(time * 5 + bonus.phase) * 0.08;

    const bounds = getBonusBounds(getFieldSize());
    if (bonus.x < bounds.minX || bonus.x > bounds.maxX) {
      bonus.vx *= -1;
      bonus.x = clamp(bonus.x, bounds.minX, bounds.maxX);
    }
    if (bonus.y < bounds.minY || bonus.y > bounds.maxY) {
      bonus.vy *= -1;
      bonus.y = clamp(bonus.y, bounds.minY, bounds.maxY);
    }

    renderBonus(bonus);
  });
}

function spawnBonus(time) {
  if (!bonusLayer) {
    return;
  }

  const field = getFieldSize();
  const point = getBonusSpawnPoint(field);
  const value = randomItem(BONUS_VALUES);
  const button = document.createElement("button");
  const image = document.createElement("img");
  const label = document.createElement("span");
  const bonus = {
    element: button,
    value,
    x: point.x,
    y: point.y,
    vx: randomBetween(-28, 28) || 22,
    vy: randomBetween(-22, 22) || -18,
    rotation: randomBetween(-12, 12),
    spin: randomBetween(-70, 70),
    scale: 1,
    phase: Math.random() * Math.PI * 2,
    expiresAt: time + randomBetween(2, 3),
  };

  button.className = "bonus-token";
  button.type = "button";
  button.setAttribute("aria-label", `Collect bonus plus ${value}`);

  image.src = ASSETS.starFull;
  image.alt = "";
  label.textContent = `+${value}`;

  button.append(image, label);
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    collectBonus(bonus);
  });

  bonusLayer.appendChild(button);
  state.bonuses.push(bonus);
  renderBonus(bonus);
}

function getBonusSpawnPoint(field) {
  const bounds = getBonusBounds(field);

  for (let attempt = 0; attempt < 14; attempt += 1) {
    const anchor = randomItem(BONUS_SPAWN_POINTS);
    const x = clamp(anchor.x * field.width + randomBetween(-42, 42), bounds.minX, bounds.maxX);
    const y = clamp(anchor.y * field.height + randomBetween(-34, 34), bounds.minY, bounds.maxY);

    if (isBonusSpotClear(x, y)) {
      return { x, y };
    }
  }

  const fallback = BONUS_SPAWN_POINTS[Math.floor(state.round % BONUS_SPAWN_POINTS.length)];
  return {
    x: clamp(fallback.x * field.width, bounds.minX, bounds.maxX),
    y: clamp(fallback.y * field.height, bounds.minY, bounds.maxY),
  };
}

function getBonusBounds(field) {
  let minX = Math.max(300, field.width * 0.24);
  let maxX = field.width - Math.max(180, field.width * 0.1);
  let minY = Math.max(190, field.height * 0.25);
  let maxY = field.height - Math.max(170, field.height * 0.22);

  if (maxX - minX < 120) {
    minX = Math.max(82, field.width * 0.24);
    maxX = Math.max(minX + 120, field.width * 0.78);
  }

  if (maxY - minY < 100) {
    minY = Math.max(150, field.height * 0.28);
    maxY = Math.max(minY + 100, field.height * 0.72);
  }

  maxX = Math.min(maxX, field.width - 54);
  maxY = Math.min(maxY, field.height - 110);

  if (maxX - minX < 80) {
    minX = Math.max(54, maxX - 80);
  }

  if (maxY - minY < 80) {
    minY = Math.max(128, maxY - 80);
  }

  return {
    minX,
    maxX,
    minY,
    maxY,
  };
}

function isBonusSpotClear(x, y) {
  return state.targets.every((target) => {
    if (!target.element.isConnected || target.locked) {
      return true;
    }

    const center = getTargetCenter(target);
    return Math.hypot(center.x - x, center.y - y) > 165;
  });
}

function collectBonus(bonus) {
  if (!bonus.element.isConnected) {
    return;
  }

  applyScoreDelta(bonus.value, bonus.x, bonus.y);
  playSound("bonus");
  messageText.textContent = `Bonus! +${bonus.value}`;
  updateHud();
  removeBonus(bonus);
}

function removeBonus(bonus) {
  bonus.element.remove();
  state.bonuses = state.bonuses.filter((item) => item !== bonus);
  if (state.bonuses.length === 0) {
    scheduleNextBonus();
  }
}

function renderBonus(bonus) {
  bonus.element.style.left = `${bonus.x}px`;
  bonus.element.style.top = `${bonus.y}px`;
  bonus.element.style.transform = `translate(-50%, -50%) scale(${bonus.scale}) rotate(${bonus.rotation}deg)`;
}

function playMissShot() {
  const x = state.aim.x;
  const y = state.aim.y;
  const turnId = state.turnId;
  state.resolving = true;
  state.combo = 0;
  setCat("shoot");
  playBlasterKick();
  playLaserTo(x, y);
  updateHud();
  messageText.textContent = "Tap an answer.";

  setTimeout(() => {
    if (state.turnId !== turnId || state.screen !== "game") {
      return;
    }
    playEffect(wrongEffect, x, y, ASSETS.wrongPuff);
    playSound("wrong");
    setCat("oops");
  }, 130);

  setTimeout(() => {
    if (state.turnId === turnId && state.screen === "game") {
      state.resolving = false;
      setCat("idle");
    }
  }, 680);
}

function updateHud() {
  scoreValue.textContent = state.score;
  comboValue.textContent = state.combo;
}

function unlockAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function handleUserAudioGesture() {
  unlockAudio();
  syncMenuMusic();
}

function createLoopingAudio(src) {
  if (typeof Audio === "undefined") {
    return null;
  }

  const track = new Audio(src);
  track.loop = true;
  track.preload = "auto";
  track.volume = 0;
  return track;
}

function createSoundEffect(src, gain = 1) {
  if (typeof Audio === "undefined") {
    return null;
  }

  const audio = new Audio(src);
  audio.preload = "auto";
  return { audio, gain };
}

function playAudioEffect(effect, effectiveVolume) {
  if (!effect) {
    return false;
  }

  const audio = effect.audio.cloneNode(true);
  audio.volume = clamp(effectiveVolume * effect.gain, 0, 1);
  audio.currentTime = 0;
  audio.play().catch(() => {});
  return true;
}

function syncMenuMusic() {
  const effectiveVolume = getEffectiveVolume();

  syncBackgroundTrack(menuMusic, state.screen === "start" || state.screen === "result", effectiveVolume * 0.55);
  syncBackgroundTrack(gameplayMusic, state.screen === "game", effectiveVolume * 0.42);
}

function syncBackgroundTrack(track, shouldPlay, volume) {
  if (!track) {
    return;
  }

  const musicVolume = clamp(volume, 0, 1);
  track.volume = musicVolume;

  if (!shouldPlay || musicVolume <= 0) {
    track.pause();
    return;
  }

  track.play().catch(() => {});
}

function playSound(type) {
  const context = unlockAudio();
  const effectiveVolume = getEffectiveVolume();

  if (!context || effectiveVolume <= 0) {
    return;
  }

  if (playAudioEffect(soundEffects[type], effectiveVolume)) {
    return;
  }

  const patterns = {
    click: [{ frequency: 520, duration: 0.055, type: "triangle", gain: 0.11 }],
    start: [
      { frequency: 440, duration: 0.075, type: "triangle", gain: 0.1 },
      { frequency: 660, delay: 0.08, duration: 0.12, type: "triangle", gain: 0.12 },
    ],
    laser: [{ frequency: [660, 1380], duration: 0.18, type: "sawtooth", gain: 0.12 }],
    correct: [
      { frequency: 660, duration: 0.08, type: "triangle", gain: 0.12 },
      { frequency: 880, delay: 0.08, duration: 0.1, type: "triangle", gain: 0.12 },
      { frequency: 1180, delay: 0.18, duration: 0.13, type: "triangle", gain: 0.1 },
    ],
    wrong: [
      { frequency: 260, duration: 0.12, type: "square", gain: 0.08 },
      { frequency: 190, delay: 0.1, duration: 0.14, type: "square", gain: 0.07 },
    ],
    bonus: [
      { frequency: 620, duration: 0.09, type: "triangle", gain: 0.08 },
      { frequency: 820, delay: 0.07, duration: 0.11, type: "triangle", gain: 0.09 },
      { frequency: 1080, delay: 0.15, duration: 0.16, type: "sine", gain: 0.08 },
    ],
  };

  (patterns[type] || patterns.click).forEach((note) => playNote(context, note, effectiveVolume));
}

function getEffectiveVolume() {
  return state.muted ? 0 : state.volume;
}

function updateVolumeUi() {
  const isMuted = state.muted || state.volume <= 0;

  volumeSliders.forEach((slider) => {
    slider.value = String(state.volume);
  });

  volumeControls.forEach((control) => {
    control.classList.toggle("is-muted", isMuted);
  });

  volumeToggles.forEach((toggle) => {
    toggle.setAttribute("aria-pressed", String(isMuted));
    toggle.setAttribute("aria-label", isMuted ? "Unmute sound" : "Mute sound");
  });
}

function playNote(context, note, effectiveVolume = getEffectiveVolume()) {
  const start = context.currentTime + (note.delay || 0);
  const duration = note.duration || 0.1;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const volume = effectiveVolume * (note.gain || 0.1);

  oscillator.type = note.type || "triangle";

  if (Array.isArray(note.frequency)) {
    oscillator.frequency.setValueAtTime(note.frequency[0], start);
    oscillator.frequency.exponentialRampToValueAtTime(note.frequency[1], start + duration);
  } else {
    oscillator.frequency.setValueAtTime(note.frequency, start);
  }

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume), start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function setCat(mode) {
  const isPlaying = state.screen === "game" && mode !== "victory";
  const isSad = isPlaying && mode === "oops";
  const visualMode = isPlaying ? (isSad ? "oops" : "idle") : mode;
  const catSource = ASSETS.cat[visualMode] || ASSETS.cat.idle;
  cat.src = catSource;
  cat.classList.toggle("is-sad", isSad);
  blaster.hidden = !isPlaying || isSad;
}

function animate(time = 0) {
  const dt = Math.min(0.04, (time - state.lastTime) / 1000 || 0);
  state.lastTime = time;

  if (state.screen === "game") {
    animateAim(dt);
    animateBlaster();
    animateAliens(dt, time / 1000);
    updateBonuses(dt, time / 1000);
  }

  requestAnimationFrame(animate);
}

function animateAim(dt) {
  const field = getFieldSize();
  state.aim.targetX = clamp(state.aim.targetX, 24, field.width - 24);
  state.aim.targetY = clamp(state.aim.targetY, 118, field.height - 24);
  state.aim.x += (state.aim.targetX - state.aim.x) * Math.min(1, dt * 14);
  state.aim.y += (state.aim.targetY - state.aim.y) * Math.min(1, dt * 14);

  aimDot.style.left = `${state.aim.x}px`;
  aimDot.style.top = `${state.aim.y}px`;
}

function animateBlaster() {
  const base = getBlasterBase();
  state.blasterAngle = clamp(
    radiansToDegrees(Math.atan2(state.aim.y - base.y, state.aim.x - base.x)),
    BLASTER_GEOMETRY.minAngle,
    BLASTER_GEOMETRY.maxAngle
  );
  blaster.style.transform = `rotate(${state.blasterAngle}deg)`;
}

function animateAliens(dt, time) {
  const field = getFieldSize();

  state.targets.forEach((target) => {
    if (target.mode === "fly" || target.mode === "wrong") {
      target.baseX += target.vx * dt;
      target.baseY += target.vy * dt;

      if (![target.baseX, target.baseY, target.vx, target.vy].every(Number.isFinite)) {
        resetAlienFlight(target, field);
      } else {
        keepAlienInFlightZone(target, field);
      }

      target.renderX = target.baseX;
      target.renderY = target.baseY;
      target.rotation = Math.sin(time * target.frequency + target.phase) * 2.2;
      target.scale = 1 + Math.sin(time * 1.25 + target.phase) * 0.018;
    } else if (target.mode === "hit") {
      target.renderY -= dt * 28;
      target.rotation += dt * 120;
      target.scale = Math.max(0.82, target.scale - dt * 0.12);
    }

  });

  state.targets.forEach((target) => renderTarget(target));
}

function keepAlienInFlightZone(target, field) {
  const zone = getAlienFlightZone(field);

  if (target.baseX <= zone.minX && target.vx < 0) {
    target.baseX = zone.minX;
    target.vx = Math.abs(target.vx);
  } else if (target.baseX >= zone.maxX && target.vx > 0) {
    target.baseX = zone.maxX;
    target.vx = -Math.abs(target.vx);
  }

  if (target.baseY <= zone.minY && target.vy < 0) {
    target.baseY = zone.minY;
    target.vy = Math.abs(target.vy);
  } else if (target.baseY >= zone.maxY && target.vy > 0) {
    target.baseY = zone.maxY;
    target.vy = -Math.abs(target.vy);
  }
}

function isAlienPastField(target, field) {
  const padding = 240;

  return (
    target.baseX < -padding ||
    target.baseX > field.width + padding ||
    target.baseY < -padding ||
    target.baseY > field.height + padding
  );
}

function resetAlienFlight(target, field) {
  const flight = createAlienFlightPlan(
    field,
    randomItem(ALIEN_SIDES),
    Math.floor(Math.random() * 4),
    getCurrentLevel().speedMultiplier || 1
  );

  target.baseX = flight.x;
  target.baseY = flight.y;
  target.homeX = flight.homeX;
  target.homeY = flight.homeY;
  target.renderX = flight.x;
  target.renderY = flight.y;
  target.phase = flight.phase;
  target.amplitude = flight.amplitude;
  target.frequency = flight.frequency;
  target.route = flight.route;
  target.side = flight.side;
  target.vx = flight.vx;
  target.vy = flight.vy;
  target.radiusX = flight.radiusX;
  target.radiusY = flight.radiusY;
  target.orbitSpeed = flight.orbitSpeed;
  target.direction = flight.direction;
}

function renderTarget(target) {
  target.element.style.left = `${target.renderX}px`;
  target.element.style.top = `${target.renderY}px`;
  target.element.style.transform = `scale(${target.scale}) rotate(${target.rotation}deg)`;
}

function getRouteOffset(target, time) {
  const theta = time * target.orbitSpeed * target.direction + target.phase;
  const motionScale = target.motionScale || 1;
  const radiusX = target.radiusX * motionScale;
  const radiusY = target.radiusY * motionScale;

  if (target.route === "loop") {
    return {
      x: Math.cos(theta) * radiusX,
      y: Math.sin(theta) * radiusY,
    };
  }

  if (target.route === "orbit") {
    return {
      x: Math.cos(theta) * radiusX,
      y: Math.sin(theta * 1.12 + 0.7) * radiusY,
    };
  }

  return {
    x: Math.sin(theta) * radiusX,
    y: Math.sin(theta * 0.74 + 1.15) * radiusY,
  };
}

function playBlasterKick() {
  blaster.classList.remove("is-shooting");
  void blaster.offsetWidth;
  blaster.classList.add("is-shooting");
}

function playLaserTo(x, y) {
  playSound("laser");
  const origin = getBlasterMuzzle();
  const length = Math.hypot(x - origin.x, y - origin.y);
  const angleRadians = Math.atan2(y - origin.y, x - origin.x);
  const angle = radiansToDegrees(angleRadians);
  const beam = document.createElement("div");
  const flash = document.createElement("div");
  const ring = document.createElement("div");
  const particles = [];

  beam.className = "laser-beam";
  beam.style.left = `${origin.x}px`;
  beam.style.top = `${origin.y}px`;
  beam.style.width = `${Math.max(32, length)}px`;
  beam.style.transform = `translateY(-50%) rotate(${angle}deg)`;

  flash.className = "muzzle-flash";
  flash.style.left = `${origin.x}px`;
  flash.style.top = `${origin.y}px`;

  ring.className = "laser-impact-ring";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;

  for (let index = 0; index < 10; index += 1) {
    const particle = document.createElement("span");
    const distance = length * randomBetween(0.14, 0.94);
    const sideOffset = randomBetween(-11, 11);
    const sparkAngle = angleRadians + randomBetween(-1.15, 1.15);
    const sparkDistance = randomBetween(22, 66);
    const particleX = origin.x + Math.cos(angleRadians) * distance + Math.cos(angleRadians + Math.PI / 2) * sideOffset;
    const particleY = origin.y + Math.sin(angleRadians) * distance + Math.sin(angleRadians + Math.PI / 2) * sideOffset;

    particle.className = "laser-particle";
    particle.style.left = `${particleX}px`;
    particle.style.top = `${particleY}px`;
    particle.style.setProperty("--spark-x", `${Math.cos(sparkAngle) * sparkDistance}px`);
    particle.style.setProperty("--spark-y", `${Math.sin(sparkAngle) * sparkDistance}px`);
    particles.push(particle);
  }

  shotLayer.append(beam, flash, ring, ...particles);
  setTimeout(() => {
    beam.remove();
    flash.remove();
    ring.remove();
    particles.forEach((particle) => particle.remove());
  }, 560);
}

function playEffect(effectElement, x, y, src) {
  effectElement.src = src;
  effectElement.classList.remove("is-active");
  void effectElement.offsetWidth;
  effectElement.style.left = `${x}px`;
  effectElement.style.top = `${y}px`;
  effectElement.classList.add("is-active");
}

function getTargetCenter(target) {
  return {
    x: target.renderX + target.element.offsetWidth * 0.5,
    y: target.renderY + target.element.offsetHeight * 0.38,
  };
}

function getBlasterBase() {
  const fieldRect = playField.getBoundingClientRect();
  const rigRect = catRig.getBoundingClientRect();

  return {
    x: rigRect.left - fieldRect.left + rigRect.width * 0.5,
    y: rigRect.top - fieldRect.top + rigRect.height * 0.59,
  };
}

function getBlasterMuzzle() {
  const base = getBlasterBase();
  const radians = (state.blasterAngle * Math.PI) / 180;
  const localX = blaster.offsetWidth * (BLASTER_GEOMETRY.muzzleX - BLASTER_GEOMETRY.gripX);
  const localY = blaster.offsetHeight * (BLASTER_GEOMETRY.muzzleY - BLASTER_GEOMETRY.gripY);

  return {
    x: base.x + localX * Math.cos(radians) - localY * Math.sin(radians),
    y: base.y + localX * Math.sin(radians) + localY * Math.cos(radians),
  };
}

function getFieldSize() {
  return {
    width: playField.clientWidth || 1280,
    height: playField.clientHeight || 720,
  };
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function radiansToDegrees(value) {
  return (value * 180) / Math.PI;
}

function preload() {
  const paths = [
    ...Object.values(ASSETS.cat),
    ASSETS.answerPortal,
    ASSETS.laserHit,
    ASSETS.correctBurst,
    ASSETS.wrongPuff,
    ASSETS.starFull,
    ASSETS.starEmpty,
    ...ALIEN_TYPES.flatMap((alien) => [alien.idle, alien.hit, alien.dodge]),
    ...Object.values(OBJECTS),
  ];

  paths.forEach((path) => {
    const image = new Image();
    image.src = path;
  });
}

preload();
updateVolumeUi();
showScreen("start");
requestAnimationFrame(animate);
