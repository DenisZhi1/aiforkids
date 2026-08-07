import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.querySelector("#gameCanvas");
const gameShell = document.querySelector(".game-shell");
const scoreEl = document.querySelector("#score");
const acornsEl = document.querySelector("#acorns");
const bestEl = document.querySelector("#best");
const livesEl = document.querySelector("#lives");
const loadingScreen = document.querySelector("#loadingScreen");
const startScreen = document.querySelector("#startScreen");
const gameOverScreen = document.querySelector("#gameOverScreen");
const pauseBanner = document.querySelector("#pauseBanner");
const pauseButton = document.querySelector("#pauseButton");
const startButton = document.querySelector("#startButton");
const restartButton = document.querySelector("#restartButton");
const leftButton = document.querySelector("#leftButton");
const rightButton = document.querySelector("#rightButton");
const jumpButton = document.querySelector("#jumpButton");
const loadProgress = document.querySelector("#loadProgress");
const loadPercent = document.querySelector("#loadPercent");
const loadProgressTrack = document.querySelector(".progress-track");
const loadLabel = document.querySelector("#loadLabel");
const gameMessage = document.querySelector("#gameMessage");
const resultTitle = document.querySelector("#resultTitle");
const resultScore = document.querySelector("#resultScore");
const resultDistance = document.querySelector("#resultDistance");
const resultCoins = document.querySelector("#resultCoins");
const resultBest = document.querySelector("#resultBest");
const playerNameInput = document.querySelector("#playerName");
const resultNameMessage = document.querySelector("#resultNameMessage");
const mistakeReview = document.querySelector("#mistakeReview");
const mistakeCount = document.querySelector("#mistakeCount");
const mistakeList = document.querySelector("#mistakeList");
const lessonPanel = document.querySelector("#lessonPanel");
const lessonImage = document.querySelector("#lessonImage");
const sentenceSlots = document.querySelector("#sentenceSlots");
const lessonFeedback = document.querySelector("#lessonFeedback");
const menuArt = document.querySelector("#menuArt");
const menuVideo = document.querySelector("#menuVideo");
const gameMusic = document.querySelector("#gameMusic");
const soundMixer = document.querySelector("#soundMixer");
const mixerCloseButton = document.querySelector("#mixerCloseButton");
const mixerMuteButton = document.querySelector("#mixerMuteButton");
const musicVolumeInput = document.querySelector("#musicVolume");
const musicVolumeValue = document.querySelector("#musicVolumeValue");
const effectsVolumeInput = document.querySelector("#effectsVolume");
const effectsVolumeValue = document.querySelector("#effectsVolumeValue");
const MENU_VIDEO_LOOP_SECONDS = 8;
const DEFAULT_MUSIC_VOLUME = .32;
const DEFAULT_EFFECTS_VOLUME = .78;
const SOUND_PREFERENCE_VERSION = "menu-autoplay-v1";
const PLAYER_NAME_STORAGE_KEY = "barnaby-player-name";
const menuLogo = document.querySelector("#menuLogo");
const miniLogo = document.querySelector("#miniLogo");
const favicon = document.querySelector("#favicon");
const menuSoundButton = document.querySelector("#menuSoundButton");
const gameSoundButton = document.querySelector("#gameSoundButton");
const menuSoundIcon = document.querySelector("#menuSoundIcon");
const gameSoundIcon = document.querySelector("#gameSoundIcon");
const menuSoundLabel = document.querySelector("#menuSoundLabel");
const acornCounterIcon = document.querySelector("#acornCounterIcon");
const boostIndicator = document.querySelector("#boostIndicator");
const boostTime = document.querySelector("#boostTime");
const magnetIndicator = document.querySelector("#magnetIndicator");
const magnetTime = document.querySelector("#magnetTime");

const HAS_COARSE_POINTER = window.matchMedia?.("(pointer: coarse)").matches ?? false;
const PREFERS_REDUCED_MOTION = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
const DEVICE_MEMORY_GB = Number(navigator.deviceMemory) || 8;
const DEVICE_CPU_CORES = Number(navigator.hardwareConcurrency) || 8;
const DEVICE_LONG_EDGE = Math.max(window.innerWidth, window.innerHeight);
const DEVICE_PROFILE = HAS_COARSE_POINTER
  ? (DEVICE_LONG_EDGE >= 1000 ? "tablet" : "mobile")
  : "desktop";
const LOW_POWER_DEVICE = PREFERS_REDUCED_MOTION || DEVICE_MEMORY_GB <= 4 || DEVICE_CPU_CORES <= 4;
const REALTIME_SHADOWS = DEVICE_PROFILE === "desktop" && !LOW_POWER_DEVICE;
const FIREFLY_COUNT = DEVICE_PROFILE === "mobile" ? 18 : DEVICE_PROFILE === "tablet" ? 24 : 30;
const FALLING_LEAF_COUNT = DEVICE_PROFILE === "mobile" ? 9 : DEVICE_PROFILE === "tablet" ? 13 : 18;
const GRASS_CLUMPS_PER_SIDE = DEVICE_PROFILE === "mobile" ? 2 : 3;
const FLOWER_CLUSTERS_PER_SIDE = DEVICE_PROFILE === "mobile" ? 1 : 2;
const SUN_SKY_POSITION = new THREE.Vector3(-14.5, 20.5, -82);
document.documentElement.dataset.deviceProfile = DEVICE_PROFILE;
document.documentElement.dataset.realtimeShadows = String(REALTIME_SHADOWS);

const LANES = [-3.15, 0, 3.15];
const PLAYER_Z = 4.1;
const SPAWN_Z = -82;
const SEGMENT_LENGTH = 12;
const SEGMENT_COUNT = 10;
const BASE_RUN_SPEED = 12;
const MAX_RUN_SPEED = 22.5;
const SPEED_BOOST_DURATION = 4.5;
const SPEED_BOOST_BONUS = 5.5;
const BOOST_MAX_RUN_SPEED = 28;
const MAGNET_DURATION = 10;
const MAGNET_PULL_RADIUS = 18;
const ROAD_SURFACE_Y = .08;
const PLAYER_GROUND_CLEARANCE = .055;
const WORD_TALL_OBSTACLE_CLEARANCE = 28;
const BUTTERFLY_SAFE_LANE_X = 4.25;
const BUTTERFLY_SAFE_SWAY = .12;
const BIRD_TREE_CLEARANCE_Y = 9.1;
const WILDLIFE_ROUTE_LENGTH = 150;
const WILDLIFE_ROUTE_SPEED = .36;
const BUTTERFLY_ROUTE_Z = [-12, -72, -132];
const BIRD_ROUTE_Z = [-42, -102];
const GOLDEN_ACORN_COLOR = 0xffd044;
const GOLDEN_ACORN_EMISSIVE = 0x6b2f00;
const SCORE_PER_ACORN = 25;
const SCORE_PER_CORRECT_WORD = 50;
const SCORE_PER_SENTENCE = 250;
const MAX_LIVES = 5;
const LESSONS_PER_RUN = 16;
const HEALTH_HEART_MIN_DELAY = 30;
const HEALTH_HEART_RANDOM_DELAY = 16;
let MODEL_URL = window.__BARNABY_RUNNER_URI;
let ACORN_MODEL_URL = window.__BARNABY_ACORN_URI;
let MUSHROOM_MODEL_URL = window.__BARNABY_MUSHROOM_URI;
let MAGNET_LEAF_MODEL_URL = window.__BARNABY_MAGNET_LEAF_URI;
let TREE_MODEL_URL = window.__BARNABY_TREE_URI;
let BOULDER_MODEL_URL = window.__BARNABY_BOULDER_URI;
let STUMP_MODEL_URL = window.__BARNABY_STUMP_URI;
let LAMP_POST_MODEL_URL = window.__BARNABY_LAMP_POST_URI;
let CAIRN_MODEL_URL = window.__BARNABY_CAIRN_URI;
let MOUNTAIN_MODEL_URL = window.__BARNABY_MOUNTAIN_URI;
let BUTTERFLY_MODEL_URL = window.__BARNABY_BUTTERFLY_URI;
let BIRD_MODEL_URL = window.__BARNABY_BIRD_URI;
let FLOWER_CLUSTER_MODEL_URL = window.__BARNABY_FLOWER_CLUSTER_URI;
let GRASS_TUFT_MODEL_URL = window.__BARNABY_GRASS_TUFT_URI;
let FENCE_MODEL_URL = window.__BARNABY_FENCE_URI;
let ARCH_MODEL_URL = window.__BARNABY_ARCH_URI;
let SUN_MODEL_URL = window.__BARNABY_SUN_URI;
const LESSON_IMAGES = window.__BARNABY_LESSON_IMAGES || {};
const UI_ASSETS = window.__BARNABY_UI || {};
const LESSON_BANK = [
  {
    id: "boy-sleeping",
    image: LESSON_IMAGES.sleeping,
    alt: "Мальчик спит в кровати",
    words: ["The", "boy", "is", "sleeping"],
    distractors: ["A", "girl", "are", "sleep", "running", "reads"]
  },
  {
    id: "girl-reading",
    image: LESSON_IMAGES.reading,
    alt: "Девочка читает книгу",
    words: ["The", "girl", "is", "reading"],
    distractors: ["A", "boy", "are", "read", "sleeping", "cooking"]
  },
  {
    id: "children-playing-football",
    image: LESSON_IMAGES.playing,
    alt: "Дети играют в футбол",
    words: ["The", "children", "are", "playing", "football"],
    distractors: ["A", "child", "is", "play", "reading", "cooking"]
  },
  {
    id: "woman-cooking",
    image: LESSON_IMAGES.cooking,
    alt: "Женщина готовит у плиты",
    words: ["The", "woman", "is", "cooking"],
    distractors: ["A", "man", "are", "cook", "reading", "runs"]
  },
  {
    id: "dog-running",
    image: LESSON_IMAGES.dogRunning,
    alt: "Собака бежит по парку",
    words: ["The", "dog", "is", "running"],
    distractors: ["A", "cat", "are", "run", "sleeping", "drinks"]
  },
  {
    id: "cat-drinking-milk",
    image: LESSON_IMAGES.catDrinking,
    alt: "Кошка пьёт молоко",
    words: ["The", "cat", "is", "drinking", "milk"],
    distractors: ["A", "dog", "are", "drink", "water", "running"]
  },
  {
    id: "man-painting",
    image: LESSON_IMAGES.manPainting,
    alt: "Мужчина рисует картину",
    words: ["The", "man", "is", "painting"],
    distractors: ["A", "woman", "are", "paint", "writing", "picture"]
  },
  {
    id: "girl-dancing",
    image: LESSON_IMAGES.girlDancing,
    alt: "Девочка танцует",
    words: ["The", "girl", "is", "dancing"],
    distractors: ["A", "boy", "are", "dance", "running", "sings"]
  },
  {
    id: "family-eating-dinner",
    image: LESSON_IMAGES.familyEating,
    alt: "Семья ужинает за столом",
    words: ["The", "family", "is", "eating", "dinner"],
    distractors: ["A", "children", "are", "eat", "lunch", "cooking"]
  },
  {
    id: "birds-flying",
    image: LESSON_IMAGES.birdsFlying,
    alt: "Птицы летят по небу",
    words: ["The", "birds", "are", "flying"],
    distractors: ["A", "bird", "is", "fly", "running", "sky"]
  },
  {
    id: "teacher-writing",
    image: LESSON_IMAGES.teacherWriting,
    alt: "Учительница пишет на доске",
    words: ["The", "teacher", "is", "writing"],
    distractors: ["A", "student", "are", "write", "reading", "board"]
  },
  {
    id: "baby-crying",
    image: LESSON_IMAGES.babyCrying,
    alt: "Малыш плачет",
    words: ["The", "baby", "is", "crying"],
    distractors: ["A", "boy", "are", "cry", "sleeping", "laughs"]
  },
  {
    id: "boy-riding-bike",
    image: LESSON_IMAGES.boyRidingBike,
    alt: "Мальчик едет на велосипеде по парку",
    words: ["The", "boy", "is", "riding", "a", "bike"],
    distractors: ["A", "girl", "are", "ride", "running", "bicycle"]
  },
  {
    id: "girl-watering-flowers",
    image: LESSON_IMAGES.girlWateringFlowers,
    alt: "Девочка поливает цветы из лейки",
    words: ["The", "girl", "is", "watering", "flowers"],
    distractors: ["A", "boy", "are", "water", "flower", "cooking"]
  },
  {
    id: "children-building-sandcastle",
    image: LESSON_IMAGES.childrenBuildingSandcastle,
    alt: "Дети строят песочный замок на пляже",
    words: ["The", "children", "are", "building", "a", "sandcastle"],
    distractors: ["A", "child", "is", "build", "castle", "playing"]
  },
  {
    id: "man-washing-car",
    image: LESSON_IMAGES.manWashingCar,
    alt: "Мужчина моет красную машину",
    words: ["The", "man", "is", "washing", "a", "car"],
    distractors: ["A", "woman", "are", "wash", "the", "painting"]
  },
  {
    id: "woman-taking-photo",
    image: LESSON_IMAGES.womanTakingPhoto,
    alt: "Женщина фотографирует бабочку в парке",
    words: ["The", "woman", "is", "taking", "a", "photo"],
    distractors: ["A", "man", "are", "take", "picture", "painting"]
  },
  {
    id: "rabbit-eating-carrot",
    image: LESSON_IMAGES.rabbitEatingCarrot,
    alt: "Кролик ест морковку на лугу",
    words: ["The", "rabbit", "is", "eating", "a", "carrot"],
    distractors: ["A", "cat", "are", "eat", "an", "drinking"]
  },
  {
    id: "ducks-swimming",
    image: LESSON_IMAGES.ducksSwimming,
    alt: "Три утки плывут по лесному пруду",
    words: ["The", "ducks", "are", "swimming"],
    distractors: ["A", "duck", "is", "swim", "flying", "walking"]
  },
  {
    id: "grandparents-planting-tree",
    image: LESSON_IMAGES.grandparentsPlantingTree,
    alt: "Бабушка и дедушка сажают молодое дерево",
    words: ["The", "grandparents", "are", "planting", "a", "tree"],
    distractors: ["A", "grandmother", "is", "plant", "the", "watering"]
  }
];

const scene = new THREE.Scene();
scene.background = createStorybookSkyTexture();
scene.fog = new THREE.Fog(0x8fc9ae, 34, 170);

const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
const cameraBase = new THREE.Vector3(0, 5.25, 12.8);
camera.position.copy(cameraBase);
camera.lookAt(0, 1.2, -10);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: false,
  powerPreference: "high-performance"
});
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = REALTIME_SHADOWS;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const hemisphere = new THREE.HemisphereLight(0xd9fff0, 0x294b29, 2.5);
scene.add(hemisphere);

const sunLight = new THREE.DirectionalLight(0xffe0a2, 3.2);
sunLight.position.set(-12, 19, 9);
sunLight.castShadow = REALTIME_SHADOWS;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.left = -17;
sunLight.shadow.camera.right = 17;
sunLight.shadow.camera.top = 18;
sunLight.shadow.camera.bottom = -5;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 55;
sunLight.shadow.bias = -0.0004;
scene.add(sunLight);

let sun = null;

const sunHalo = new THREE.Mesh(
  new THREE.SphereGeometry(7.1, 20, 12),
  new THREE.MeshBasicMaterial({
    color: 0xffd878,
    transparent: true,
    opacity: .13,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending
  })
);
sunHalo.position.copy(SUN_SKY_POSITION);
scene.add(sunHalo);

const world = new THREE.Group();
const trackLayer = new THREE.Group();
const sceneryLayer = new THREE.Group();
const obstacleLayer = new THREE.Group();
const acornLayer = new THREE.Group();
const mushroomLayer = new THREE.Group();
const magnetLeafLayer = new THREE.Group();
const healthHeartLayer = new THREE.Group();
const wordLayer = new THREE.Group();
const particleLayer = new THREE.Group();
const atmosphereLayer = new THREE.Group();
const mountainLayer = new THREE.Group();
const skyLayer = new THREE.Group();
world.add(trackLayer, sceneryLayer, obstacleLayer, acornLayer, mushroomLayer, magnetLeafLayer, healthHeartLayer, wordLayer, particleLayer);
scene.add(world);
scene.add(atmosphereLayer);
scene.add(mountainLayer);
scene.add(skyLayer);

const player = new THREE.Group();
const playerVisual = new THREE.Group();
player.position.set(0, 0, PLAYER_Z);
player.add(playerVisual);
scene.add(player);

const clock = new THREE.Clock();
let mixer = null;
let currentAction = null;
let actions = {};
let playerHandBone = null;
let heldMagnetLeaf = null;
let heldMagnetEffectGroup = null;
const heldMagnetParticles = [];
const heldMagnetFieldRings = [];
const fireflies = [];
const butterflies = [];
const forestBirds = [];
const fallingLeaves = [];
const swayingFlowers = [];
const swayingGrass = [];
const butterflyWingUniforms = [];
const birdWingUniforms = [];
let atmosphereTime = 0;
let usesProceduralPlayerMotion = false;
let modelReady = false;
let playerModelReady = false;
let acornModelReady = false;
let acornTemplate = null;
let mushroomModelReady = false;
let mushroomTemplate = null;
let magnetLeafModelReady = false;
let magnetLeafTemplate = null;
let treeModelReady = false;
let treeTemplate = null;
let lampPostModelReady = false;
let lampPostTemplate = null;
let mountainModelReady = false;
let mountainTemplate = null;
let butterflyModelReady = false;
let butterflyTemplate = null;
let birdModelReady = false;
let birdTemplate = null;
let flowerClusterModelReady = false;
let flowerClusterTemplate = null;
let grassTuftModelReady = false;
let grassTuftTemplate = null;
let fenceModelReady = false;
let fenceTemplate = null;
let archModelReady = false;
let archTemplate = null;
let sunModelReady = false;
let sunTemplate = null;
let skyBuilt = false;
let forestBuilt = false;
let modelObstaclesReady = false;
const modelObstacleTemplates = {};
const obstacleRules = { stump: "jump", boulder: "jump", cairn: "jump", rock: "jump" };
const tallObstacleTypes = new Set(["boulder", "cairn"]);
const obstacleJumpClearance = { stump: .55, boulder: .72, cairn: .82, rock: .65 };
const wordTextureCache = new Map();
let lessonIndex = 0;
let lessonDeck = LESSON_BANK.slice();
let lastStartingLessonId = "";
let lessonProgress = 0;
let wavesUntilCorrect = 1;
let lessonTransition = 0;
let messageTimer = 0;
let audioContext = null;
let soundEnabled = readSoundPreference();
let menuVideoAudioUnlocked = soundEnabled;
let musicVolume = readVolumePreference("barnaby-music-volume", DEFAULT_MUSIC_VOLUME);
let effectsVolume = readVolumePreference("barnaby-effects-volume", DEFAULT_EFFECTS_VOLUME);
let renderedLives = -1;
let renderedScore = -1;
let renderedAcorns = -1;
let renderedBest = -1;
let renderScale = 1;
let performanceSampleSeconds = 0;
let performanceSampleFrames = 0;
let lastIdleRenderTime = 0;
const wordCardImage = new Image();
const heldItemWorldPosition = new THREE.Vector3();
const heldItemWorldQuaternion = new THREE.Quaternion();
const playerVisualWorldQuaternion = new THREE.Quaternion();

const state = {
  running: false,
  paused: false,
  lane: 1,
  targetLane: 1,
  y: 0,
  velocityY: 0,
  grounded: true,
  lives: MAX_LIVES,
  acorns: 0,
  score: 0,
  distance: 0,
  best: readBest(),
  speed: BASE_RUN_SPEED,
  obstacleTimer: 2.8,
  acornTimer: 3.5,
  mushroomTimer: 10,
  magnetLeafTimer: 17,
  healthHeartTimer: HEALTH_HEART_MIN_DELAY,
  wordTimer: 1.1,
  boostTimer: 0,
  magnetTimer: 0,
  invulnerable: 0,
  shake: 0,
  elapsed: 0,
  obstacles: [],
  acornItems: [],
  mushrooms: [],
  magnetLeaves: [],
  healthHearts: [],
  wordItems: [],
  correctWords: 0,
  mistakes: 0,
  sentences: 0,
  mistakeDetails: [],
  particles: []
};

const shared = createSharedAssets();
const healthHeartTemplate = createHealthHeartTemplate();
applyUiAssets();
updateSoundControls();
loadBarnaby();
loadAcornModel();
loadMushroomModel();
loadMagnetLeafModel();
loadTreeModel();
  loadLampPostModel();
  loadMountainModel();
  loadButterflyModel();
  loadBirdModel();
  loadFlowerClusterModel();
  loadGrassTuftModel();
  loadFenceModel();
  loadArchModel();
  loadSunModel();
load3DObstacleModels();
resize();
updateHud();

function applyUiAssets() {
  if (UI_ASSETS.loadingBackground) {
    document.documentElement.style.setProperty("--ui-loading-background", `url("${UI_ASSETS.loadingBackground}")`);
  }
  if (UI_ASSETS.loadingBarFrame) {
    document.documentElement.style.setProperty("--ui-loading-bar-frame", `url("${UI_ASSETS.loadingBarFrame}")`);
  }
  if (UI_ASSETS.menuArt) {
    menuArt.src = UI_ASSETS.menuArt;
    menuVideo.poster = UI_ASSETS.menuArt;
  }
  syncMenuVideoSound();
  if (UI_ASSETS.logo) {
    menuLogo.src = UI_ASSETS.logo;
    miniLogo.src = UI_ASSETS.logo;
  }
  if (UI_ASSETS.favicon) favicon.href = UI_ASSETS.favicon;
  if (UI_ASSETS.acornIcon) acornCounterIcon.src = UI_ASSETS.acornIcon;
  if (UI_ASSETS.wordCard) {
    document.documentElement.style.setProperty("--ui-word-card", `url("${UI_ASSETS.wordCard}")`);
    wordCardImage.addEventListener("load", () => {
      for (const texture of wordTextureCache.values()) texture.dispose();
      wordTextureCache.clear();
    }, { once: true });
    wordCardImage.src = UI_ASSETS.wordCard;
  }
  if (UI_ASSETS.wordCardCorrect) {
    document.documentElement.style.setProperty("--ui-word-card-correct", `url("${UI_ASSETS.wordCardCorrect}")`);
  }
}

function syncMenuVideoSound() {
  const audible = menuVideoAudioUnlocked && soundEnabled && !startScreen.classList.contains("hidden");
  menuVideo.muted = !audible;
  menuVideo.defaultMuted = !audible;
  menuVideo.volume = audible ? .72 : 0;
}

function playMenuVideo() {
  startScreen.classList.remove("video-playing");
  syncMenuVideoSound();
  if (menuVideo.readyState > 0) menuVideo.currentTime = 0;
  const playback = menuVideo.play();
  if (playback?.then) {
    playback.then(() => startScreen.classList.add("video-playing")).catch(() => {
      menuVideoAudioUnlocked = false;
      menuVideo.muted = true;
      menuVideo.volume = 0;
      updateSoundControls();
      const silentPlayback = menuVideo.play();
      if (silentPlayback?.then) silentPlayback.then(() => startScreen.classList.add("video-playing")).catch(() => {});
    });
  }
}

function unlockMenuVideoSound() {
  if (menuVideoAudioUnlocked || startScreen.classList.contains("hidden")) return;
  menuVideoAudioUnlocked = true;
  syncMenuVideoSound();
  updateSoundControls();
  if (soundEnabled && menuVideo.paused) {
    const playback = menuVideo.play();
    if (playback?.catch) playback.catch(() => {});
  }
}

document.addEventListener("pointerdown", unlockMenuVideoSound, { passive: true });
document.addEventListener("keydown", unlockMenuVideoSound);

function syncGameMusic({ restart = false } = {}) {
  gameMusic.volume = musicVolume;
  gameMusic.muted = !soundEnabled;
  if (restart) gameMusic.currentTime = 0;
  const shouldPlay = state.running && !state.paused && soundEnabled && !document.hidden;
  if (!shouldPlay) {
    gameMusic.pause();
    return;
  }
  const playback = gameMusic.play();
  if (playback?.catch) playback.catch(() => {});
}

menuVideo.addEventListener("playing", () => startScreen.classList.add("video-playing"));
menuVideo.addEventListener("waiting", () => startScreen.classList.remove("video-playing"));
menuVideo.addEventListener("stalled", () => startScreen.classList.remove("video-playing"));
function loopMenuVideoSegment() {
  if (startScreen.classList.contains("hidden")) return;
  if (!menuVideo.ended && menuVideo.currentTime < MENU_VIDEO_LOOP_SECONDS) return;
  menuVideo.currentTime = 0;
  const playback = menuVideo.play();
  if (playback?.catch) playback.catch(() => {});
}
menuVideo.addEventListener("timeupdate", loopMenuVideoSegment);
menuVideo.addEventListener("ended", loopMenuVideoSegment);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    menuVideo.pause();
    startScreen.classList.remove("video-playing");
  } else if (!startScreen.classList.contains("hidden")) {
    playMenuVideo();
  }
});

function setLoadingProgress(percent, label, isError = false) {
  const value = Math.max(0, Math.min(100, Math.round(percent)));
  loadProgress.style.width = `${value}%`;
  loadPercent.textContent = isError ? "!" : `${value}%`;
  loadProgressTrack.setAttribute("aria-valuenow", String(value));
  loadingScreen.classList.toggle("loading-error", isError);
  if (label) loadLabel.textContent = label;
}

function createStorybookSkyTexture() {
  const skyCanvas = document.createElement("canvas");
  skyCanvas.width = 1024;
  skyCanvas.height = 512;
  const context = skyCanvas.getContext("2d");

  const skyGradient = context.createLinearGradient(0, 0, 0, skyCanvas.height);
  skyGradient.addColorStop(0, "#4f9ed2");
  skyGradient.addColorStop(.48, "#8fd4c3");
  skyGradient.addColorStop(.76, "#c8e5b1");
  skyGradient.addColorStop(1, "#f2d18b");
  context.fillStyle = skyGradient;
  context.fillRect(0, 0, skyCanvas.width, skyCanvas.height);

  const horizonGlow = context.createRadialGradient(512, 132, 10, 512, 132, 330);
  horizonGlow.addColorStop(0, "rgba(255,244,183,.7)");
  horizonGlow.addColorStop(.35, "rgba(255,221,145,.26)");
  horizonGlow.addColorStop(1, "rgba(255,221,145,0)");
  context.fillStyle = horizonGlow;
  context.fillRect(0, 0, skyCanvas.width, skyCanvas.height);

  paintHorizonLayer(context, 386, "rgba(73,133,105,.42)", 54, 11);
  paintHorizonLayer(context, 425, "rgba(48,105,82,.58)", 42, 23);
  paintHorizonLayer(context, 466, "rgba(31,80,61,.76)", 31, 37);

  const texture = new THREE.CanvasTexture(skyCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

function paintHorizonLayer(context, baseY, color, amplitude, phase) {
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, 512);
  context.lineTo(0, baseY);
  for (let x = 0; x <= 1024; x += 64) {
    const wave = Math.sin((x + phase * 9) * .012) * amplitude * .32;
    const ridge = ((x / 64 + phase) % 3) * amplitude * .08;
    context.lineTo(x, baseY - amplitude * .42 - wave - ridge);
  }
  context.lineTo(1024, 512);
  context.closePath();
  context.fill();
}

function createSharedAssets() {
  const mat = {
    road: new THREE.MeshStandardMaterial({ color: 0xb98953, roughness: 1 }),
    roadDark: new THREE.MeshStandardMaterial({ color: 0x6f4930, roughness: 1 }),
    lane: new THREE.MeshStandardMaterial({ color: 0xe8c98e, roughness: 1 }),
    grass: new THREE.MeshStandardMaterial({ color: 0x367447, roughness: 1 }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x754626, roughness: 1 }),
    leavesA: new THREE.MeshStandardMaterial({ color: 0x236b42, roughness: 1 }),
    leavesB: new THREE.MeshStandardMaterial({ color: 0x3d8b4a, roughness: 1 }),
    leavesC: new THREE.MeshStandardMaterial({ color: 0x69a84d, roughness: 1 }),
    gold: new THREE.MeshStandardMaterial({ color: 0xffc83d, metalness: 0.58, roughness: 0.24, emissive: 0x6f3900, emissiveIntensity: 0.18 }),
    goldEdge: new THREE.MeshStandardMaterial({ color: 0xffe88a, metalness: 0.5, roughness: 0.22 }),
    rope: new THREE.MeshStandardMaterial({ color: 0xe4c383, roughness: 1 }),
    rock: new THREE.MeshStandardMaterial({ color: 0x718071, roughness: 1 }),
    red: new THREE.MeshStandardMaterial({ color: 0xc85634, roughness: .8 }),
    spark: new THREE.MeshBasicMaterial({ color: 0xffe66f }),
    obstacleShadow: new THREE.MeshBasicMaterial({ color: 0x15351f, transparent: true, opacity: .24, depthWrite: false }),
    grassLight: new THREE.MeshStandardMaterial({ color: 0x93dc54, roughness: .92 }),
    mushroomStem: new THREE.MeshStandardMaterial({ color: 0xffedc2, roughness: .85 }),
    mushroomCap: new THREE.MeshStandardMaterial({ color: 0xf14f45, roughness: .72 }),
    environmentShadow: new THREE.MeshBasicMaterial({ color: 0x123f28, transparent: true, opacity: .18, depthWrite: false }),
    butterflyBlue: new THREE.MeshStandardMaterial({ color: 0x55c7ff, emissive: 0x0b4168, emissiveIntensity: .18, roughness: .55 }),
    butterflyPink: new THREE.MeshStandardMaterial({ color: 0xff70c5, emissive: 0x6a1649, emissiveIntensity: .16, roughness: .55 }),
    bird: new THREE.MeshStandardMaterial({ color: 0x3867a8, roughness: .78 }),
    leafGold: new THREE.MeshStandardMaterial({ color: 0xffb52e, roughness: .78 }),
    leafRed: new THREE.MeshStandardMaterial({ color: 0xe85a3e, roughness: .78 })
  };

  return {
    mat,
    roadGeometry: new THREE.BoxGeometry(9.5, .16, SEGMENT_LENGTH + .08),
    shoulderGeometry: new THREE.BoxGeometry(.34, .21, SEGMENT_LENGTH + .08),
    dashGeometry: new THREE.BoxGeometry(.09, .035, 1.8),
    trunkGeometry: new THREE.CylinderGeometry(.36, .5, 3.7, 7),
    crownGeometry: new THREE.IcosahedronGeometry(1.7, 1),
    rockGeometry: new THREE.DodecahedronGeometry(1.05, 0),
    sparkGeometry: new THREE.OctahedronGeometry(.1, 0),
    obstacleShadowGeometry: new THREE.CircleGeometry(1, 28),
    mushroomStemGeometry: new THREE.CylinderGeometry(.065, .09, .3, 7),
    mushroomCapGeometry: new THREE.SphereGeometry(.18, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2),
    bushGeometry: new THREE.IcosahedronGeometry(.62, 1),
    forestLeafGeometry: new THREE.DodecahedronGeometry(.14, 0),
    environmentShadowGeometry: new THREE.CircleGeometry(1, 20),
    butterflyBodyGeometry: new THREE.CapsuleGeometry(.065, .28, 3, 6),
    butterflyWingGeometry: new THREE.SphereGeometry(.2, 7, 5),
    birdBodyGeometry: new THREE.SphereGeometry(.22, 7, 5),
    birdWingGeometry: new THREE.ConeGeometry(.13, .72, 3),
    birdBeakGeometry: new THREE.ConeGeometry(.07, .2, 5)
  };
}

function createHealthHeartTemplate() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -.88);
  shape.bezierCurveTo(-.18, -.62, -.88, -.24, -.88, .36);
  shape.bezierCurveTo(-.88, .83, -.3, 1.03, 0, .55);
  shape.bezierCurveTo(.3, 1.03, .88, .83, .88, .36);
  shape.bezierCurveTo(.88, -.24, .18, -.62, 0, -.88);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: .34,
    steps: 1,
    curveSegments: 14,
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: .09,
    bevelThickness: .08
  });
  geometry.center();

  const group = new THREE.Group();
  const heart = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
    color: 0xff2857,
    emissive: 0x7a001e,
    emissiveIntensity: .32,
    metalness: .28,
    roughness: .24
  }));
  heart.castShadow = false;
  heart.receiveShadow = false;
  group.add(heart);

  const highlight = new THREE.Mesh(
    new THREE.SphereGeometry(.13, 10, 7),
    new THREE.MeshBasicMaterial({ color: 0xffdce6, transparent: true, opacity: .9 })
  );
  highlight.position.set(-.3, .35, .25);
  highlight.scale.set(.72, 1.35, .38);
  group.add(highlight);

  const sparkleGeometry = new THREE.OctahedronGeometry(.075, 0);
  const sparkleMaterial = new THREE.MeshBasicMaterial({ color: 0xfff18a });
  for (const [x, y, scale] of [[-.7, -.18, .8], [.69, .38, 1], [.52, -.55, .62]]) {
    const sparkle = new THREE.Mesh(sparkleGeometry, sparkleMaterial);
    sparkle.position.set(x, y, .16);
    sparkle.scale.setScalar(scale);
    group.add(sparkle);
  }
  group.scale.setScalar(.78);
  return group;
}

function buildForest() {
  swayingFlowers.length = 0;
  swayingGrass.length = 0;
  const grass = new THREE.Mesh(new THREE.PlaneGeometry(110, 210), shared.mat.grass);
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(0, -.12, -70);
  grass.receiveShadow = true;
  scene.add(grass);

  buildMountainHorizon();

  buildFireflies();
  buildForestWildlife();

  for (let i = 0; i < SEGMENT_COUNT; i += 1) {
    const track = new THREE.Group();
    track.position.z = PLAYER_Z - i * SEGMENT_LENGTH;

    const road = new THREE.Mesh(shared.roadGeometry, shared.mat.road);
    road.receiveShadow = true;
    track.add(road);

    for (const x of [-4.82, 4.82]) {
      const shoulder = new THREE.Mesh(shared.shoulderGeometry, shared.mat.roadDark);
      shoulder.position.set(x, .035, 0);
      shoulder.receiveShadow = true;
      track.add(shoulder);
    }

    for (const x of [-1.58, 1.58]) {
      for (const z of [-4.2, 0, 4.2]) {
        const dash = new THREE.Mesh(shared.dashGeometry, shared.mat.lane);
        dash.position.set(x, .102, z);
        dash.receiveShadow = true;
        track.add(dash);
      }
    }
    trackLayer.add(track);

    const scenery = makeScenerySegment(i);
    scenery.position.z = PLAYER_Z - i * SEGMENT_LENGTH;
    sceneryLayer.add(scenery);
  }
}

function maybeBuildForest() {
  if (forestBuilt || !treeModelReady || !lampPostModelReady || !mountainModelReady || !butterflyModelReady || !birdModelReady || !flowerClusterModelReady || !grassTuftModelReady || !fenceModelReady || !archModelReady) return;
  forestBuilt = true;
  buildForest();
}

function buildMountainHorizon() {
  mountainLayer.clear();
  const placements = [
    { x: 0, y: -1.5, z: -110, scale: 1.08, rotation: Math.PI },
    { x: -34, y: -2.1, z: -116, scale: .82, rotation: Math.PI * .78 },
    { x: 34, y: -2.25, z: -118, scale: .78, rotation: Math.PI * 1.2 }
  ];
  for (const placement of placements) {
    const mountain = mountainTemplate.clone(true);
    mountain.position.set(placement.x, placement.y, placement.z);
    mountain.scale.setScalar(placement.scale);
    mountain.rotation.y = placement.rotation;
    mountainLayer.add(mountain);
  }
}

function buildSkyModels() {
  skyLayer.clear();

  sun = sunTemplate.clone(true);
  sun.position.copy(SUN_SKY_POSITION);
  sun.rotation.set(-.08, -.22, 0);
  sun.userData.baseY = SUN_SKY_POSITION.y;
  skyLayer.add(sun);
  sunHalo.position.copy(SUN_SKY_POSITION);
  document.documentElement.dataset.sky3d = "sun-only";
}

function maybeBuildSky() {
  if (skyBuilt || !sunModelReady) return;
  skyBuilt = true;
  buildSkyModels();
  maybeFinishLoading();
}

function buildFireflies() {
  atmosphereLayer.clear();
  fireflies.length = 0;
  const glowCanvas = document.createElement("canvas");
  glowCanvas.width = 64;
  glowCanvas.height = 64;
  const context = glowCanvas.getContext("2d");
  const glow = context.createRadialGradient(32, 32, 2, 32, 32, 31);
  glow.addColorStop(0, "rgba(255,255,210,1)");
  glow.addColorStop(.18, "rgba(255,229,101,.96)");
  glow.addColorStop(.48, "rgba(255,191,48,.34)");
  glow.addColorStop(1, "rgba(255,181,40,0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(glowCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({
    map: texture,
    color: 0xffe477,
    transparent: true,
    opacity: .88,
    depthWrite: false,
    fog: true,
    blending: THREE.AdditiveBlending
  });
  const random = mulberry32(40217);
  for (let index = 0; index < FIREFLY_COUNT; index += 1) {
    const firefly = new THREE.Sprite(material);
    const side = index % 2 ? 1 : -1;
    const baseY = .7 + random() * 3.8;
    const baseScale = .22 + random() * .22;
    firefly.position.set(side * (5.4 + random() * 10), baseY, -7 - random() * 108);
    firefly.scale.setScalar(baseScale);
    firefly.userData.baseY = baseY;
    firefly.userData.baseScale = baseScale;
    firefly.userData.phase = random() * Math.PI * 2;
    firefly.userData.speed = .8 + random() * 1.3;
    fireflies.push(firefly);
    atmosphereLayer.add(firefly);
  }
}

function buildForestWildlife() {
  butterflies.length = 0;
  forestBirds.length = 0;
  fallingLeaves.length = 0;
  const random = mulberry32(73041);

  for (let index = 0; index < BUTTERFLY_ROUTE_Z.length; index += 1) {
    const butterfly = new THREE.Group();
    const visual = butterflyTemplate.clone(true);
    visual.rotation.y = index % 2 ? Math.PI : 0;
    butterfly.add(visual);

    const side = index % 2 ? 1 : -1;
    const baseX = side * (BUTTERFLY_SAFE_LANE_X + random() * .08);
    const baseY = 2.5 + random();
    const baseScale = .72 + random() * .34;
    butterfly.position.set(baseX, baseY, BUTTERFLY_ROUTE_Z[index]);
    butterfly.scale.setScalar(baseScale);
    butterfly.userData = {
      baseX,
      baseY,
      baseScale,
      side,
      airLane: "road-edge-clearance",
      phase: random() * Math.PI * 2,
      speed: 1.2 + random() * 1.1,
      visual
    };
    butterfly.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = false;
      object.receiveShadow = false;
    });
    butterflies.push(butterfly);
    atmosphereLayer.add(butterfly);
  }

  for (let index = 0; index < BIRD_ROUTE_Z.length; index += 1) {
    const bird = new THREE.Group();
    const visual = birdTemplate.clone(true);
    bird.add(visual);

    const side = index % 2 ? 1 : -1;
    const baseX = side * (5.1 + random() * 4.2);
    const baseY = BIRD_TREE_CLEARANCE_Y + random() * 1.8;
    const baseScale = .78 + random() * .3;
    bird.position.set(baseX, baseY, BIRD_ROUTE_Z[index]);
    bird.rotation.y = side > 0 ? -.3 : .3;
    bird.scale.setScalar(baseScale);
    bird.userData = {
      baseX,
      baseY,
      baseScale,
      side,
      airLane: "above-tree-canopy",
      phase: random() * Math.PI * 2,
      speed: .55 + random() * .35,
      visual
    };
    bird.traverse((object) => {
      if (!object.isMesh) return;
      object.castShadow = false;
      object.receiveShadow = false;
    });
    forestBirds.push(bird);
    atmosphereLayer.add(bird);
  }

  for (let index = 0; index < FALLING_LEAF_COUNT; index += 1) {
    const leaf = new THREE.Mesh(
      shared.forestLeafGeometry,
      index % 3 === 0 ? shared.mat.leafRed : shared.mat.leafGold
    );
    const side = index % 2 ? 1 : -1;
    const baseX = side * (5.2 + random() * 11);
    leaf.position.set(baseX, .8 + random() * 5.4, -4 - random() * 112);
    leaf.scale.set(1, .22, .62);
    leaf.userData = {
      baseX,
      phase: random() * Math.PI * 2,
      fallSpeed: .28 + random() * .4,
      spin: .8 + random() * 1.5
    };
    leaf.castShadow = false;
    leaf.receiveShadow = false;
    fallingLeaves.push(leaf);
    atmosphereLayer.add(leaf);
  }
}

function updateAtmosphere(dt) {
  atmosphereTime += dt;
  if (sun) {
    sun.rotation.y += dt * .075;
    sun.rotation.z = Math.sin(atmosphereTime * .23) * .025;
    sun.position.y = sun.userData.baseY + Math.sin(atmosphereTime * .35) * .16;
  }
  for (const uniform of butterflyWingUniforms) uniform.value = atmosphereTime;
  for (const uniform of birdWingUniforms) uniform.value = atmosphereTime;
  for (const firefly of fireflies) {
    const pulse = .68 + Math.sin(atmosphereTime * 3.8 + firefly.userData.phase) * .32;
    firefly.position.y = firefly.userData.baseY + Math.sin(atmosphereTime * firefly.userData.speed + firefly.userData.phase) * .28;
    firefly.scale.setScalar(firefly.userData.baseScale * Math.max(.28, pulse));
  }
  for (const butterfly of butterflies) {
    const route = atmosphereTime * butterfly.userData.speed + butterfly.userData.phase;
    const flutter = Math.sin(atmosphereTime * 12 + butterfly.userData.phase);
    butterfly.position.x = butterfly.userData.baseX + Math.sin(route) * BUTTERFLY_SAFE_SWAY;
    butterfly.position.y = butterfly.userData.baseY + Math.sin(route * 2) * .58 + Math.cos(route * .65) * .16;
    butterfly.rotation.y = Math.cos(route) * .58;
    butterfly.rotation.x = Math.sin(route * 1.35) * .16;
    butterfly.rotation.z = -Math.cos(route) * .18 + flutter * .08;
    butterfly.userData.visual.scale.set(1 - Math.abs(flutter) * .025, .92 + Math.abs(flutter) * .1, 1);
  }
  for (const bird of forestBirds) {
    const route = atmosphereTime * bird.userData.speed + bird.userData.phase;
    const flap = Math.sin(atmosphereTime * 8.2 + bird.userData.phase) * .48;
    bird.position.x = bird.userData.baseX + Math.sin(route) * 4.1;
    bird.position.y = Math.max(BIRD_TREE_CLEARANCE_Y, bird.userData.baseY + Math.sin(route * 1.15) * .72);
    bird.rotation.x = -.1 + Math.cos(route * 1.2) * .12;
    bird.rotation.y = Math.cos(route) * .42;
    bird.rotation.z = flap * .2 - Math.cos(route) * .16;
    bird.userData.visual.position.y = Math.abs(flap) * .05;
    bird.userData.visual.scale.set(1 - Math.abs(flap) * .025, 1 + Math.abs(flap) * .08, 1);
  }
  for (const leaf of fallingLeaves) {
    leaf.position.x = leaf.userData.baseX + Math.sin(atmosphereTime * 1.35 + leaf.userData.phase) * .75;
    leaf.position.y -= dt * leaf.userData.fallSpeed;
    leaf.rotation.x += dt * leaf.userData.spin;
    leaf.rotation.y += dt * leaf.userData.spin * .62;
    leaf.rotation.z = Math.sin(atmosphereTime * 1.9 + leaf.userData.phase) * .9;
    if (leaf.position.y < .08) leaf.position.y = 4.2 + (leaf.userData.phase % 1.8);
  }
  for (const plant of swayingGrass) {
    const breeze = atmosphereTime * plant.userData.swaySpeed + plant.userData.swayPhase;
    plant.rotation.z = plant.userData.baseRotationZ + Math.sin(breeze) * plant.userData.swayAmount;
    plant.rotation.x = plant.userData.baseRotationX + Math.cos(breeze * .82) * plant.userData.swayAmount * .32;
  }
  for (const plant of swayingFlowers) {
    const breeze = atmosphereTime * plant.userData.swaySpeed + plant.userData.swayPhase;
    plant.rotation.z = plant.userData.baseRotationZ + Math.sin(breeze) * plant.userData.swayAmount;
    plant.rotation.x = plant.userData.baseRotationX + Math.cos(breeze * .76) * plant.userData.swayAmount * .28;
  }
}

function addInstanceBatch(group, geometry, material, transforms, receiveShadow = true) {
  if (!transforms.length) return null;
  const batch = new THREE.InstancedMesh(geometry, material, transforms.length);
  const dummy = new THREE.Object3D();
  transforms.forEach((transform, index) => {
    dummy.position.set(transform.x, transform.y, transform.z);
    dummy.rotation.set(transform.rx || 0, transform.ry || 0, transform.rz || 0);
    dummy.scale.set(transform.sx ?? 1, transform.sy ?? transform.sx ?? 1, transform.sz ?? transform.sx ?? 1);
    dummy.updateMatrix();
    batch.setMatrixAt(index, dummy.matrix);
  });
  batch.instanceMatrix.needsUpdate = true;
  batch.castShadow = false;
  batch.receiveShadow = receiveShadow;
  batch.frustumCulled = true;
  group.add(batch);
  return batch;
}

function makeScenerySegment(index) {
  const group = new THREE.Group();
  const random = mulberry32(9127 + index * 971);
  const mushroomStems = [];
  const mushroomCaps = [];

  for (const side of [-1, 1]) {
    const tree = makeTree(random);
    const treeX = side * (6.7 + random() * 7.2);
    const treeZ = -4.8 + random() * 9.6;
    tree.position.set(treeX, 0, treeZ);
    const treeScale = .78 + random() * .34;
    tree.scale.setScalar(treeScale);
    tree.rotation.y = random() * Math.PI * 2;
    group.add(tree);

    const treeShadow = new THREE.Mesh(shared.environmentShadowGeometry, shared.mat.environmentShadow);
    treeShadow.rotation.x = -Math.PI / 2;
    treeShadow.position.set(treeX, -.095, treeZ + .22);
    treeShadow.scale.set(2.2 * treeScale, 1.25 * treeScale, 1);
    group.add(treeShadow);

    for (let clump = 0; clump < GRASS_CLUMPS_PER_SIDE; clump += 1) {
      const tuft = grassTuftTemplate.clone(true);
      const baseRotationZ = (random() - .5) * .045;
      tuft.position.set(side * (5.25 + random() * 7.2), 0, -5.4 + random() * 10.8);
      tuft.rotation.set(0, random() * Math.PI * 2, baseRotationZ);
      tuft.scale.setScalar(.76 + random() * .5);
      tuft.userData = {
        baseRotationX: 0,
        baseRotationZ,
        swayPhase: random() * Math.PI * 2,
        swaySpeed: .8 + random() * .42,
        swayAmount: .025 + random() * .018
      };
      swayingGrass.push(tuft);
      group.add(tuft);
    }

    for (let flower = 0; flower < FLOWER_CLUSTERS_PER_SIDE; flower += 1) {
      const cluster = flowerClusterTemplate.clone(true);
      const baseRotationZ = (random() - .5) * .035;
      cluster.position.set(side * (5.45 + random() * 6.2), 0, -5 + random() * 10);
      cluster.rotation.set(0, random() * Math.PI * 2, baseRotationZ);
      cluster.scale.setScalar(.74 + random() * .42);
      cluster.userData = {
        baseRotationX: 0,
        baseRotationZ,
        swayPhase: random() * Math.PI * 2,
        swaySpeed: .66 + random() * .32,
        swayAmount: .032 + random() * .018
      };
      swayingFlowers.push(cluster);
      group.add(cluster);
    }

    for (let mushroom = 0; mushroom < 2; mushroom += 1) {
      const x = treeX + (random() - .5) * 1.6;
      const z = treeZ + (random() - .5) * 1.4;
      const scale = .72 + random() * .48;
      mushroomStems.push({ x, y: .15 * scale, z, sx: scale, sy: scale, sz: scale });
      mushroomCaps.push({ x, y: .3 * scale, z, sx: scale, sy: scale, sz: scale, ry: random() * Math.PI });
    }

    if ((index + (side > 0 ? 2 : 0)) % 3 === 0) {
      const post = makeTrailPost();
      post.position.set(side * 5.55, 0, -2.5 + random() * 5);
      post.rotation.y = random() * Math.PI * 2;
      group.add(post);
    }

    if ((index + (side > 0 ? 1 : 0)) % 4 === 0) {
      const fence = makeForestFence(side, random);
      group.add(fence);
    }

  }

  addInstanceBatch(group, shared.mushroomStemGeometry, shared.mat.mushroomStem, mushroomStems);
  addInstanceBatch(group, shared.mushroomCapGeometry, shared.mat.mushroomCap, mushroomCaps);

  if (index % 5 === 2) group.add(makeForestArch());
  return group;
}

function makeForestFence(side, random) {
  const fence = fenceTemplate.clone(true);
  fence.position.set(side * (6.2 + random() * .7), 0, -3.3 + random() * 6.6);
  fence.rotation.y = (fenceTemplate.userData.longAxis === "x" ? Math.PI / 2 : 0) + (random() - .5) * .12;
  return fence;
}

function makeForestArch() {
  const arch = archTemplate.clone(true);
  arch.rotation.y = archTemplate.userData.longAxis === "z" ? Math.PI / 2 : 0;
  return arch;
}

function makeTree() {
  return treeTemplate.clone(true);
}

function makeTrailPost() {
  return lampPostTemplate.clone(true);
}

function loadBarnaby() {
  const loader = new GLTFLoader();
  loader.load(
    MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;
        const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
        const shadowFreeMaterials = sourceMaterials.map((material) => new THREE.MeshBasicMaterial({
          name: `${material?.name || "Barnaby"}-shadow-free`,
          map: material?.map || null,
          color: 0xffffff,
          side: material?.side ?? THREE.FrontSide,
          transparent: false,
          opacity: 1,
          alphaTest: 0,
          depthTest: true,
          depthWrite: true,
          fog: true,
          toneMapped: true
        }));
        object.material = Array.isArray(object.material) ? shadowFreeMaterials : shadowFreeMaterials[0];
      });

      const initialBox = new THREE.Box3().setFromObject(model);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      const scale = Math.min(
        2.55 / Math.max(initialSize.y, .001),
        2.75 / Math.max(initialSize.x, .001)
      );
      model.scale.setScalar(scale);

      const box = new THREE.Box3().setFromObject(model);
      model.position.x = -(box.min.x + box.max.x) * .5;
      model.position.y = ROAD_SURFACE_Y + PLAYER_GROUND_CLEARANCE - box.min.y;
      model.position.z = -(box.min.z + box.max.z) * .5;
      model.rotation.y = Math.PI;
      playerVisual.add(model);
      playerHandBone = model.getObjectByName("RightHand") || model.getObjectByName("LeftHand");
      maybeCreateHeldMagnetLeaf();

      if (gltf.animations.length) {
        usesProceduralPlayerMotion = false;
        mixer = new THREE.AnimationMixer(model);
        const findClip = (part) => gltf.animations.find((clip) => clip.name.toLowerCase().includes(part));
        const walkingSource = findClip("walking") || findClip("walk") || findClip("run") || gltf.animations[0];
        const runningSource = findClip("running") || findClip("run") || walkingSource;
        const jumpingSource = findClip("jump") || runningSource;
        const walking = makeInPlaceClip(walkingSource, "walk");
        const running = makeInPlaceClip(runningSource, "run");
        const jumping = makeInPlaceClip(jumpingSource, "jump");
        actions = {
          walk: mixer.clipAction(walking),
          run: mixer.clipAction(running),
          jump: mixer.clipAction(jumping)
        };
        actions.walk.setEffectiveTimeScale(.72);
        actions.run.setEffectiveTimeScale(1.12);
        actions.jump.setEffectiveTimeScale(.92);
        actions.jump.setLoop(THREE.LoopOnce, 1);
        actions.jump.clampWhenFinished = true;
        mixer.addEventListener("finished", (event) => {
          if (event.action === actions.jump && state.running) setAnimation("run", .14);
        });
        setAnimation("walk", 0);
      } else {
        mixer = null;
        actions = {};
        currentAction = null;
        usesProceduralPlayerMotion = true;
      }
      document.documentElement.dataset.playerModel = "Meshy_AI_capybara_no_tail_biped_Animation_Run_Turn_Left_withSkin.glb";
      document.documentElement.dataset.playerMotion = usesProceduralPlayerMotion ? "procedural" : "gltf-in-place";
      playerModelReady = true;
      maybeFinishLoading();
    },
    (event) => {
      if (!event.total) return;
      const percent = Math.max(4, Math.min(98, Math.round((event.loaded / event.total) * 100)));
      setLoadingProgress(percent, `Загрузка 3D-модели · ${percent}%`);
    },
    (error) => {
      console.error("Barnaby model could not be loaded", error);
      document.documentElement.dataset.playerModel = "load-error";
      setLoadingProgress(100, "Модель не загрузилась. Запустите START BARNABY.cmd", true);
    }
  );
}

function loadAcornModel() {
  const loader = new GLTFLoader();
  loader.load(
    ACORN_MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material) continue;
          material.transparent = false;
          material.opacity = 1;
          material.depthTest = true;
          material.depthWrite = true;
          material.color?.setHex(GOLDEN_ACORN_COLOR);
          material.emissive?.setHex(GOLDEN_ACORN_EMISSIVE);
          material.emissiveIntensity = .32;
          material.metalness = .52;
          material.roughness = .28;
          material.envMapIntensity = 1.15;
          material.needsUpdate = true;
        }
      });

      const initialBox = new THREE.Box3().setFromObject(model);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      const scale = .92 / Math.max(initialSize.x, initialSize.y, .001);
      model.scale.setScalar(scale);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      acornTemplate = new THREE.Group();
      acornTemplate.add(model);
      acornModelReady = true;
      document.documentElement.dataset.acornModel = "Meshy_AI_Lowpoly_Acorn_3D_0730095610_image-to-3d-texture.glb";
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Golden acorn model could not be loaded", error);
      document.documentElement.dataset.acornModel = "load-error";
      setLoadingProgress(100, "Не удалось загрузить вашу модель жёлудя", true);
    }
  );
}

function loadMushroomModel() {
  const loader = new GLTFLoader();
  loader.load(
    MUSHROOM_MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material) continue;
          material.transparent = false;
          material.opacity = 1;
          material.depthTest = true;
          material.depthWrite = true;
          material.emissiveIntensity = 0;
          material.envMapIntensity = .5;
          material.needsUpdate = true;
        }
      });

      const initialBox = new THREE.Box3().setFromObject(model);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      model.scale.setScalar(1.35 / Math.max(initialSize.x, initialSize.y, .001));
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -box.min.y, -center.z);

      mushroomTemplate = new THREE.Group();
      mushroomTemplate.add(model);
      mushroomModelReady = true;
      document.documentElement.dataset.mushroomModel = "Meshy_AI_Lowpoly_Speed_Mushroo_0730095802_image-to-3d-texture.glb";
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Speed mushroom model could not be loaded", error);
      document.documentElement.dataset.mushroomModel = "load-error";
      setLoadingProgress(100, "Не удалось загрузить вашу модель гриба", true);
    }
  );
}

function loadMagnetLeafModel() {
  const loader = new GLTFLoader();
  loader.load(
    MAGNET_LEAF_MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material) continue;
          material.transparent = false;
          material.opacity = 1;
          material.depthTest = true;
          material.depthWrite = true;
          material.emissiveIntensity = 0;
          material.envMapIntensity = .65;
          material.needsUpdate = true;
        }
      });

      const initialBox = new THREE.Box3().setFromObject(model);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      model.scale.setScalar(1.4 / Math.max(initialSize.x, initialSize.y, initialSize.z, .001));
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.set(-center.x, -box.min.y, -center.z);

      magnetLeafTemplate = new THREE.Group();
      magnetLeafTemplate.add(model);
      maybeCreateHeldMagnetLeaf();
      magnetLeafModelReady = true;
      document.documentElement.dataset.magnetLeafModel = "Meshy_AI_Lowpoly_Magnet_Leaf_3_0730095945_image-to-3d-texture.glb";
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Magnet leaf model could not be loaded", error);
      document.documentElement.dataset.magnetLeafModel = "load-error";
      setLoadingProgress(100, "Не удалось загрузить вашу модель листа-магнита", true);
    }
  );
}

function maybeCreateHeldMagnetLeaf() {
  if (heldMagnetLeaf || !playerHandBone || !magnetLeafTemplate) return;
  const visual = magnetLeafTemplate.clone(true);
  visual.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = false;
    object.frustumCulled = false;
  });
  const box = new THREE.Box3().setFromObject(visual);
  const center = box.getCenter(new THREE.Vector3());
  visual.position.sub(center);

  heldMagnetLeaf = new THREE.Group();
  heldMagnetLeaf.name = "HeldMagnetLeaf";
  heldMagnetLeaf.scale.setScalar(.42);
  heldMagnetLeaf.visible = false;
  heldMagnetLeaf.add(visual);

  heldMagnetEffectGroup = new THREE.Group();
  heldMagnetEffectGroup.name = "PurpleMagnetField";
  const purpleMaterials = [0xd66cff, 0x985cff].map((color) => new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: .92,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.AdditiveBlending
  }));
  const particleGeometry = new THREE.OctahedronGeometry(.14, 0);
  for (let index = 0; index < 8; index += 1) {
    const particle = new THREE.Mesh(particleGeometry, purpleMaterials[index % purpleMaterials.length]);
    particle.renderOrder = 6;
    particle.userData.phase = (index / 8) * Math.PI * 2;
    particle.userData.speed = 2.25 + (index % 3) * .32;
    heldMagnetParticles.push(particle);
    heldMagnetEffectGroup.add(particle);
  }

  for (let index = 0; index < 2; index += 1) {
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: index ? 0xca62ff : 0x8653ff,
      transparent: true,
      opacity: index ? .34 : .46,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(.64 + index * .2, .028, 6, 30, Math.PI * 1.48),
      ringMaterial
    );
    ring.renderOrder = 5;
    ring.userData.phase = index * Math.PI * .7;
    heldMagnetFieldRings.push(ring);
    heldMagnetEffectGroup.add(ring);
  }

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(.34, 12, 8),
    new THREE.MeshBasicMaterial({
      color: 0xb655ff,
      transparent: true,
      opacity: .18,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.AdditiveBlending
    })
  );
  glow.name = "MagnetPurpleGlow";
  heldMagnetEffectGroup.add(glow);
  heldMagnetLeaf.add(heldMagnetEffectGroup);
  playerVisual.add(heldMagnetLeaf);
}

function updateHeldMagnetLeaf() {
  if (!heldMagnetLeaf || !playerHandBone) return;
  const active = state.running && state.magnetTimer > 0;
  heldMagnetLeaf.visible = active;
  if (!active) return;

  playerHandBone.getWorldPosition(heldItemWorldPosition);
  playerVisual.worldToLocal(heldItemWorldPosition);
  heldMagnetLeaf.position.copy(heldItemWorldPosition);
  playerHandBone.getWorldQuaternion(heldItemWorldQuaternion);
  playerVisual.getWorldQuaternion(playerVisualWorldQuaternion);
  heldMagnetLeaf.quaternion
    .copy(playerVisualWorldQuaternion.invert())
    .multiply(heldItemWorldQuaternion);
  heldMagnetLeaf.rotateX(Math.PI * .5);
  heldMagnetLeaf.rotateZ(-Math.PI * .18);

  const effectTime = state.elapsed;
  for (const particle of heldMagnetParticles) {
    const angle = particle.userData.phase + effectTime * particle.userData.speed;
    const radius = .58 + Math.sin(effectTime * 2.7 + particle.userData.phase) * .12;
    particle.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle * 1.35) * .38,
      Math.sin(angle) * radius * .66
    );
    particle.rotation.x = angle * 1.4;
    particle.rotation.y = angle * 1.9;
    particle.scale.setScalar(.76 + Math.sin(effectTime * 5 + particle.userData.phase) * .24);
  }
  for (let index = 0; index < heldMagnetFieldRings.length; index += 1) {
    const ring = heldMagnetFieldRings[index];
    ring.rotation.x = Math.PI * (.18 + index * .34);
    ring.rotation.y = effectTime * (index ? -1.7 : 1.45) + ring.userData.phase;
    ring.rotation.z = effectTime * (index ? .8 : -.65);
    ring.scale.setScalar(1 + Math.sin(effectTime * 4 + ring.userData.phase) * .08);
  }
}

function loadTreeModel() {
  const loader = new GLTFLoader();
  loader.load(
    TREE_MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = true;
        object.frustumCulled = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material) continue;
          material.transparent = false;
          material.opacity = 1;
          material.depthTest = true;
          material.depthWrite = true;
          material.emissive?.set(0x000000);
          material.emissiveMap = null;
          material.emissiveIntensity = 0;
          material.envMapIntensity = .35;
          material.needsUpdate = true;
        }
      });

      const initialBox = new THREE.Box3().setFromObject(model);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      model.scale.setScalar(6.6 / Math.max(initialSize.y, .001));
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x = -center.x;
      model.position.y = -box.min.y;
      model.position.z = -center.z;

      treeTemplate = new THREE.Group();
      treeTemplate.add(model);
      treeModelReady = true;
      maybeBuildForest();
      document.documentElement.dataset.treeModel = "Meshy_AI_Arcade_Runner_Tree_0729023556_image-to-3d-texture.glb";
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Arcade runner tree model could not be loaded", error);
      document.documentElement.dataset.treeModel = "load-error";
      setLoadingProgress(100, "Не удалось загрузить вашу модель дерева", true);
    }
  );
}

function addWildlifeWingDeformation(material, species) {
  if (material.userData.barnabyWingDeformation) return;
  material.userData.barnabyWingDeformation = species;
  const frequency = species === "butterfly" ? "12.0" : "8.2";
  const amplitude = species === "butterfly" ? ".30" : ".22";
  const uniforms = species === "butterfly" ? butterflyWingUniforms : birdWingUniforms;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uFlightTime = { value: 0 };
    shader.vertexShader = `uniform float uFlightTime;\n${shader.vertexShader}`.replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
       float barnabyWingMask = smoothstep(0.16, 0.62, abs(position.x));
       float barnabyWingPulse = sin(uFlightTime * ${frequency});
       transformed.y += barnabyWingPulse * barnabyWingMask * abs(position.x) * ${amplitude};
       transformed.z += cos(uFlightTime * ${frequency}) * barnabyWingMask * 0.035;`
    );
    uniforms.push(shader.uniforms.uFlightTime);
  };
  material.customProgramCacheKey = () => `barnaby-${species}-wing-deformation-v2`;
}

function prepareWildlifeModel(model, targetSize, species) {
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = false;
    object.frustumCulled = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      material.transparent = false;
      material.opacity = 1;
      material.depthTest = true;
      material.depthWrite = true;
      material.side = THREE.DoubleSide;
      material.emissive?.set(0x000000);
      material.emissiveMap = null;
      material.emissiveIntensity = 0;
      material.metalness = 0;
      material.roughness = Math.max(.62, material.roughness ?? .62);
      material.envMapIntensity = .48;
      addWildlifeWingDeformation(material, species);
      material.needsUpdate = true;
    }
  });

  const initialBox = new THREE.Box3().setFromObject(model);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  model.scale.setScalar(targetSize / Math.max(initialSize.x, initialSize.y, initialSize.z, .001));
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -center.y, -center.z);
  const template = new THREE.Group();
  template.add(model);
  return template;
}

function makeWildlifeFallback(material, scale) {
  const template = new THREE.Group();
  const visual = new THREE.Mesh(shared.forestLeafGeometry, material);
  visual.scale.set(scale, scale * .32, scale * .72);
  visual.castShadow = false;
  visual.receiveShadow = false;
  template.add(visual);
  return template;
}

function loadButterflyModel() {
  const loader = new GLTFLoader();
  loader.load(
    BUTTERFLY_MODEL_URL,
    (gltf) => {
      butterflyTemplate = prepareWildlifeModel(gltf.scene, .95, "butterfly");
      butterflyModelReady = true;
      document.documentElement.dataset.butterflyModel = "Meshy_AI_Lowpoly_Forest_Butter_0801102447_image-to-3d-texture.glb";
      document.documentElement.dataset.wildlifeFlight = "swoop-roll-flap";
      maybeBuildForest();
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Forest butterfly model could not be loaded", error);
      butterflyTemplate = makeWildlifeFallback(shared.mat.butterflyPink, .5);
      butterflyModelReady = true;
      document.documentElement.dataset.butterflyModel = "load-error-fallback";
      maybeBuildForest();
      maybeFinishLoading();
    }
  );
}

function loadBirdModel() {
  const loader = new GLTFLoader();
  loader.load(
    BIRD_MODEL_URL,
    (gltf) => {
      birdTemplate = prepareWildlifeModel(gltf.scene, 1.55, "bird");
      birdModelReady = true;
      document.documentElement.dataset.birdModel = "Meshy_AI_Lowpoly_Forest_Bird_3_0801102510_image-to-3d-texture.glb";
      document.documentElement.dataset.wildlifeFlight = "swoop-roll-flap";
      maybeBuildForest();
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Forest bird model could not be loaded", error);
      birdTemplate = makeWildlifeFallback(shared.mat.bird, .95);
      birdModelReady = true;
      document.documentElement.dataset.birdModel = "load-error-fallback";
      maybeBuildForest();
      maybeFinishLoading();
    }
  );
}

function prepareFoliageModel(model, targetHeight) {
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = true;
    object.frustumCulled = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      material.transparent = false;
      material.opacity = 1;
      material.depthTest = true;
      material.depthWrite = true;
      material.side = THREE.DoubleSide;
      material.emissive?.set(0x000000);
      material.emissiveMap = null;
      material.emissiveIntensity = 0;
      material.metalness = 0;
      material.roughness = Math.max(.68, material.roughness ?? .68);
      material.envMapIntensity = .45;
      material.needsUpdate = true;
    }
  });

  const initialBox = new THREE.Box3().setFromObject(model);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  model.scale.setScalar(targetHeight / Math.max(initialSize.y, .001));
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.set(-center.x, -box.min.y, -center.z);
  const template = new THREE.Group();
  template.add(model);
  return template;
}

function makeFoliageFallback(material, height) {
  const template = new THREE.Group();
  const visual = new THREE.Mesh(shared.bushGeometry, material);
  visual.position.y = height * .34;
  visual.scale.set(height * .46, height * .34, height * .46);
  visual.castShadow = false;
  visual.receiveShadow = true;
  template.add(visual);
  return template;
}

function loadFlowerClusterModel() {
  const loader = new GLTFLoader();
  loader.load(
    FLOWER_CLUSTER_MODEL_URL,
    (gltf) => {
      flowerClusterTemplate = prepareFoliageModel(gltf.scene, 1.08);
      flowerClusterModelReady = true;
      document.documentElement.dataset.flowerClusterModel = "Meshy_AI_Lowpoly_Flower_Cluste_0801132916_image-to-3d-texture.glb";
      maybeBuildForest();
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Flower cluster model could not be loaded", error);
      flowerClusterTemplate = makeFoliageFallback(shared.mat.leavesC, 1.08);
      flowerClusterModelReady = true;
      document.documentElement.dataset.flowerClusterModel = "load-error-fallback";
      maybeBuildForest();
      maybeFinishLoading();
    }
  );
}

function loadGrassTuftModel() {
  const loader = new GLTFLoader();
  loader.load(
    GRASS_TUFT_MODEL_URL,
    (gltf) => {
      grassTuftTemplate = prepareFoliageModel(gltf.scene, .9);
      grassTuftModelReady = true;
      document.documentElement.dataset.grassTuftModel = "Meshy_AI_Lowpoly_Grass_Tuft_3D_0801132925_image-to-3d-texture.glb";
      document.documentElement.dataset.foliageMotion = "gentle-sway";
      maybeBuildForest();
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Grass tuft model could not be loaded", error);
      grassTuftTemplate = makeFoliageFallback(shared.mat.grassLight, .9);
      grassTuftModelReady = true;
      document.documentElement.dataset.grassTuftModel = "load-error-fallback";
      maybeBuildForest();
      maybeFinishLoading();
    }
  );
}

function prepareLandmarkModel(model, { targetHeight = 0, targetWidth = 0 }) {
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = true;
    object.frustumCulled = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      material.transparent = false;
      material.opacity = 1;
      material.depthTest = true;
      material.depthWrite = true;
      material.emissive?.set(0x000000);
      material.emissiveMap = null;
      material.emissiveIntensity = 0;
      material.roughness = Math.max(.68, material.roughness ?? .68);
      material.envMapIntensity = .42;
      material.needsUpdate = true;
    }
  });

  const initialBox = new THREE.Box3().setFromObject(model);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  const longAxis = initialSize.x >= initialSize.z ? "x" : "z";
  const sourceMeasure = targetWidth ? initialSize[longAxis] : initialSize.y;
  const targetMeasure = targetWidth || targetHeight;
  model.scale.setScalar(targetMeasure / Math.max(sourceMeasure, .001));

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.x -= center.x;
  model.position.y -= box.min.y;
  model.position.z -= center.z;

  const template = new THREE.Group();
  template.userData.longAxis = longAxis;
  template.add(model);
  return template;
}

function removeArchRoadBase(model) {
  let removedTriangles = 0;
  model.traverse((object) => {
    if (!object.isMesh || !object.geometry?.attributes?.position || !object.geometry.index) return;
    const geometry = object.geometry.clone();
    const position = geometry.attributes.position;
    const index = geometry.index;
    geometry.computeBoundingBox();
    const bounds = geometry.boundingBox;
    const size = bounds.getSize(new THREE.Vector3());
    const centerX = (bounds.min.x + bounds.max.x) * .5;
    const innerHalfWidth = size.x * .25;
    const floorTop = bounds.min.y + size.y * .11;
    const parent = new Uint32Array(position.count);
    for (let vertex = 0; vertex < parent.length; vertex += 1) parent[vertex] = vertex;

    const findRoot = (vertex) => {
      let root = vertex;
      while (parent[root] !== root) root = parent[root];
      while (parent[vertex] !== vertex) {
        const next = parent[vertex];
        parent[vertex] = root;
        vertex = next;
      }
      return root;
    };
    const joinVertices = (first, second) => {
      const firstRoot = findRoot(first);
      const secondRoot = findRoot(second);
      if (firstRoot !== secondRoot) parent[secondRoot] = firstRoot;
    };

    for (let offset = 0; offset < index.count; offset += 3) {
      const first = index.getX(offset);
      const second = index.getX(offset + 1);
      const third = index.getX(offset + 2);
      joinVertices(first, second);
      joinVertices(first, third);
    }

    const componentBounds = new Map();
    for (let vertex = 0; vertex < position.count; vertex += 1) {
      const root = findRoot(vertex);
      const x = position.getX(vertex);
      const y = position.getY(vertex);
      const current = componentBounds.get(root) || {
        minX: x,
        maxX: x,
        minY: y,
        maxY: y
      };
      current.minX = Math.min(current.minX, x);
      current.maxX = Math.max(current.maxX, x);
      current.minY = Math.min(current.minY, y);
      current.maxY = Math.max(current.maxY, y);
      componentBounds.set(root, current);
    }

    const roadBaseRoots = new Set();
    for (const [root, component] of componentBounds) {
      const insideRoad = component.minX > centerX - innerHalfWidth && component.maxX < centerX + innerHalfWidth;
      if (insideRoad && component.maxY < floorTop) roadBaseRoots.add(root);
    }

    const keptIndices = [];
    for (let offset = 0; offset < index.count; offset += 3) {
      const first = index.getX(offset);
      if (roadBaseRoots.has(findRoot(first))) {
        removedTriangles += 1;
        continue;
      }
      keptIndices.push(first, index.getX(offset + 1), index.getX(offset + 2));
    }
    geometry.setIndex(new THREE.BufferAttribute(new index.array.constructor(keptIndices), 1));
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    object.geometry = geometry;
  });
  document.documentElement.dataset.archRoadBase = removedTriangles > 0 ? "removed" : "not-found";
  return model;
}

function loadFenceModel() {
  const loader = new GLTFLoader();
  loader.load(
    FENCE_MODEL_URL,
    (gltf) => {
      fenceTemplate = prepareLandmarkModel(gltf.scene, { targetHeight: 1.65 });
      fenceModelReady = true;
      document.documentElement.dataset.fenceModel = "Meshy_AI_Lowpoly_Wooden_Fence__0802040247_image-to-3d-texture.glb";
      maybeBuildForest();
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Wooden fence model could not be loaded", error);
      fenceTemplate = new THREE.Group();
      fenceTemplate.userData.longAxis = "x";
      fenceModelReady = true;
      document.documentElement.dataset.fenceModel = "load-error-fallback";
      maybeBuildForest();
      maybeFinishLoading();
    }
  );
}

function loadArchModel() {
  const loader = new GLTFLoader();
  loader.load(
    ARCH_MODEL_URL,
    (gltf) => {
      archTemplate = prepareLandmarkModel(removeArchRoadBase(gltf.scene), { targetWidth: 11.4 });
      archModelReady = true;
      document.documentElement.dataset.archModel = "Meshy_AI_Lowpoly_Wooden_Arch_3_0802044427_image-to-3d-texture.glb";
      maybeBuildForest();
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Wooden arch model could not be loaded", error);
      archTemplate = new THREE.Group();
      archTemplate.userData.longAxis = "x";
      archModelReady = true;
      document.documentElement.dataset.archModel = "load-error-fallback";
      maybeBuildForest();
      maybeFinishLoading();
    }
  );
}

function prepareSkyModel(model, kind) {
  model.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = false;
    object.receiveShadow = false;
    object.frustumCulled = true;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      material.transparent = false;
      material.opacity = 1;
      material.depthTest = true;
      material.depthWrite = true;
      material.fog = false;
      material.metalness = 0;
      material.roughness = kind === "sun" ? .68 : .92;
      material.envMapIntensity = kind === "sun" ? .7 : .34;
      if (kind === "sun") {
        material.color?.set(0xffe177);
        material.emissive?.set(0xff9d24);
        material.emissiveIntensity = .72;
        if (material.map && !material.emissiveMap) material.emissiveMap = material.map;
        material.toneMapped = false;
      } else {
        material.color?.set(0xf3fbff);
        material.emissive?.set(0x29485d);
        material.emissiveIntensity = .09;
        material.toneMapped = true;
      }
      for (const texture of [material.map, material.normalMap, material.roughnessMap, material.metalnessMap, material.emissiveMap]) {
        if (!texture) continue;
        texture.anisotropy = Math.min(DEVICE_PROFILE === "desktop" ? 4 : 2, renderer.capabilities.getMaxAnisotropy());
      }
      material.needsUpdate = true;
    }
  });

  const initialBox = new THREE.Box3().setFromObject(model);
  const initialSize = initialBox.getSize(new THREE.Vector3());
  const targetSize = kind === "sun" ? 8.4 : 12.5;
  model.scale.setScalar(targetSize / Math.max(initialSize.x, initialSize.y, initialSize.z, .001));
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  const template = new THREE.Group();
  template.add(model);
  template.userData.kind = kind;
  return template;
}

function loadSunModel() {
  const loader = new GLTFLoader();
  loader.load(
    SUN_MODEL_URL,
    (gltf) => {
      sunTemplate = prepareSkyModel(gltf.scene, "sun");
      sunModelReady = true;
      document.documentElement.dataset.sunModel = "Meshy_AI_Lowpoly_Sun_3D_0802142705_image-to-3d-texture.glb";
      maybeBuildSky();
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("3D sun model could not be loaded", error);
      const fallback = new THREE.Mesh(
        new THREE.SphereGeometry(4.2, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xffdf72, fog: false, toneMapped: false })
      );
      sunTemplate = new THREE.Group();
      sunTemplate.add(fallback);
      sunModelReady = true;
      document.documentElement.dataset.sunModel = "load-error-fallback";
      maybeBuildSky();
    }
  );
}

function loadMountainModel() {
  const loader = new GLTFLoader();
  loader.load(
    MOUNTAIN_MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material) continue;
          material.transparent = false;
          material.opacity = 1;
          material.depthTest = true;
          material.depthWrite = true;
          material.emissive?.set(0x183d28);
          material.emissiveMap = null;
          material.emissiveIntensity = .24;
          material.roughness = Math.max(.62, material.roughness ?? .62);
          material.envMapIntensity = .42;
          material.fog = false;
          material.needsUpdate = true;
        }
      });

      const initialBox = new THREE.Box3().setFromObject(model);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      model.scale.setScalar(24 / Math.max(initialSize.y, .001));
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x = -center.x;
      model.position.y = -box.min.y;
      model.position.z = -center.z;

      mountainTemplate = new THREE.Group();
      mountainTemplate.add(model);
      mountainModelReady = true;
      document.documentElement.dataset.mountainModel = "Meshy_AI_Lowpoly_Background_Mo_0801090228_image-to-3d-texture.glb";
      maybeBuildForest();
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Background mountain model could not be loaded", error);
      document.documentElement.dataset.mountainModel = "load-error";
      setLoadingProgress(100, "Не удалось загрузить вашу 3D-модель гор", true);
    }
  );
}

function loadLampPostModel() {
  const loader = new GLTFLoader();
  loader.load(
    LAMP_POST_MODEL_URL,
    (gltf) => {
      const model = gltf.scene;
      model.traverse((object) => {
        if (!object.isMesh) return;
        object.castShadow = false;
        object.receiveShadow = true;
        object.frustumCulled = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (!material) continue;
          material.transparent = false;
          material.opacity = 1;
          material.depthTest = true;
          material.depthWrite = true;
          material.emissiveIntensity = .48;
          material.envMapIntensity = .42;
          material.needsUpdate = true;
        }
      });

      const initialBox = new THREE.Box3().setFromObject(model);
      const initialSize = initialBox.getSize(new THREE.Vector3());
      model.scale.setScalar(3.35 / Math.max(initialSize.y, .001));
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.y -= box.min.y;
      model.position.z -= center.z;

      lampPostTemplate = new THREE.Group();
      lampPostTemplate.add(model);
      lampPostModelReady = true;
      document.documentElement.dataset.lampPostModel = "Meshy_AI_Lowpoly_Lamp_Post_3D_0730150220_image-to-3d-texture.glb";
      maybeBuildForest();
      maybeFinishLoading();
    },
    undefined,
    (error) => {
      console.error("Lamp post model could not be loaded", error);
      document.documentElement.dataset.lampPostModel = "load-error";
      setLoadingProgress(100, "Не удалось загрузить вашу 3D-модель фонаря", true);
    }
  );
}


function load3DObstacleModels() {
  const definitions = {
    boulder: {
      url: BOULDER_MODEL_URL,
      width: 2.45,
      source: "Meshy_AI_Lowpoly_Boulder_3D_0730100354_image-to-3d-texture.glb"
    },
    stump: {
      url: STUMP_MODEL_URL,
      width: 2.7,
      source: "Meshy_AI_Lowpoly_Stump_3D_0730100338_image-to-3d-texture.glb"
    },
    cairn: {
      url: CAIRN_MODEL_URL,
      width: 2.7,
      source: "Meshy_AI_Lowpoly_Rock_Cairn_3D_0730150136_image-to-3d-texture.glb"
    }
  };
  const loader = new GLTFLoader();

  Promise.all(Object.entries(definitions).map(([name, definition]) => new Promise((resolve, reject) => {
    loader.load(
      definition.url,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((object) => {
          if (!object.isMesh) return;
          object.castShadow = true;
          object.receiveShadow = true;
          object.frustumCulled = true;
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          for (const material of materials) {
            if (!material) continue;
            material.transparent = false;
            material.opacity = 1;
            material.depthTest = true;
            material.depthWrite = true;
            material.emissive?.set(0x000000);
            material.emissiveMap = null;
            material.emissiveIntensity = 0;
            material.envMapIntensity = .3;
            material.needsUpdate = true;
          }
        });

        const initialBox = new THREE.Box3().setFromObject(model);
        const initialSize = initialBox.getSize(new THREE.Vector3());
        model.scale.setScalar(definition.width / Math.max(initialSize.x, initialSize.z, .001));
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.x -= center.x;
        model.position.y += ROAD_SURFACE_Y - box.min.y;
        model.position.z -= center.z;

        const template = new THREE.Group();
        template.add(model);
        template.userData.sourceModel = definition.source;
        template.userData.grounded = true;
        modelObstacleTemplates[name] = template;
        resolve();
      },
      undefined,
      reject
    );
  }))).then(() => {
    modelObstaclesReady = true;
    document.documentElement.dataset.modelObstacles = "boulder,stump,cairn,grounded";
    maybeFinishLoading();
  }).catch((error) => {
    console.error("3D obstacle models could not be loaded", error);
    document.documentElement.dataset.modelObstacles = "load-error";
    setLoadingProgress(100, "Не удалось загрузить 3D-модели камня и пня", true);
  });
}


function maybeFinishLoading() {
  if (!playerModelReady || !acornModelReady || !mushroomModelReady || !magnetLeafModelReady || !treeModelReady || !lampPostModelReady || !mountainModelReady || !butterflyModelReady || !birdModelReady || !flowerClusterModelReady || !grassTuftModelReady || !forestBuilt || !skyBuilt || !modelObstaclesReady || modelReady) return;
  releaseEmbeddedModelSources();
  modelReady = true;
  setLoadingProgress(100, "Барнаби готов к приключению!");
  window.setTimeout(() => {
    loadingScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    playMenuVideo();
  }, 320);
}

function releaseEmbeddedModelSources() {
  MODEL_URL = "";
  ACORN_MODEL_URL = "";
  MUSHROOM_MODEL_URL = "";
  MAGNET_LEAF_MODEL_URL = "";
  TREE_MODEL_URL = "";
  BOULDER_MODEL_URL = "";
  STUMP_MODEL_URL = "";
  LAMP_POST_MODEL_URL = "";
  CAIRN_MODEL_URL = "";
  MOUNTAIN_MODEL_URL = "";
  BUTTERFLY_MODEL_URL = "";
  BIRD_MODEL_URL = "";
  FLOWER_CLUSTER_MODEL_URL = "";
  GRASS_TUFT_MODEL_URL = "";
  FENCE_MODEL_URL = "";
  ARCH_MODEL_URL = "";
  SUN_MODEL_URL = "";
  for (const key of [
    "__BARNABY_RUNNER_URI",
    "__BARNABY_ACORN_URI",
    "__BARNABY_MUSHROOM_URI",
    "__BARNABY_MAGNET_LEAF_URI",
    "__BARNABY_TREE_URI",
    "__BARNABY_BOULDER_URI",
    "__BARNABY_STUMP_URI",
    "__BARNABY_LAMP_POST_URI",
    "__BARNABY_CAIRN_URI",
    "__BARNABY_MOUNTAIN_URI",
    "__BARNABY_BUTTERFLY_URI",
    "__BARNABY_BIRD_URI",
    "__BARNABY_FLOWER_CLUSTER_URI",
    "__BARNABY_GRASS_TUFT_URI",
    "__BARNABY_FENCE_URI",
    "__BARNABY_ARCH_URI",
    "__BARNABY_SUN_URI"
  ]) {
    try { delete window[key]; }
    catch { window[key] = ""; }
  }
  document.documentElement.dataset.modelSources = "released";
}

function makeInPlaceClip(sourceClip, suffix) {
  const clip = sourceClip.clone();
  clip.name = `${sourceClip.name}:${suffix}:in-place`;
  for (const track of clip.tracks) {
    const trackName = track.name.toLowerCase();
    if (!trackName.includes("hips")) continue;
    if (trackName.endsWith(".position")) {
      const firstX = track.values[0];
      const firstZ = track.values[2];
      for (let index = 0; index < track.values.length; index += 3) {
        track.values[index] = firstX;
        track.values[index + 2] = firstZ;
      }
    } else if (trackName.endsWith(".quaternion")) {
      const first = Array.from(track.values.slice(0, 4));
      for (let index = 0; index < track.values.length; index += 4) {
        track.values.set(first, index);
      }
    }
  }
  clip.resetDuration();
  return clip;
}

function setAnimation(name, fade = .18) {
  const next = actions[name];
  if (!next || next === currentAction) return;
  next.enabled = true;
  next.reset().play();
  if (currentAction) currentAction.crossFadeTo(next, fade, false);
  currentAction = next;
}

function startGame() {
  if (!modelReady) return;
  menuVideo.pause();
  startScreen.classList.remove("video-playing");
  clearDynamicObjects();
  Object.assign(state, {
    running: true,
    paused: false,
    lane: 1,
    targetLane: 1,
    y: 0,
    velocityY: 0,
    grounded: true,
    lives: MAX_LIVES,
    acorns: 0,
    score: 0,
    distance: 0,
    speed: BASE_RUN_SPEED,
    obstacleTimer: 2.7,
    acornTimer: 3.5,
    mushroomTimer: 10,
    magnetLeafTimer: 17,
    healthHeartTimer: HEALTH_HEART_MIN_DELAY + Math.random() * HEALTH_HEART_RANDOM_DELAY,
    wordTimer: 1.1,
    boostTimer: 0,
    magnetTimer: 0,
    invulnerable: 0,
    shake: 0,
    elapsed: 0,
    correctWords: 0,
    mistakes: 0,
    sentences: 0,
    mistakeDetails: []
  });
  shuffleLessonDeck(lastStartingLessonId);
  lessonProgress = 0;
  wavesUntilCorrect = 1;
  lessonTransition = 0;
  renderLesson();
  lessonPanel.classList.remove("hidden");
  boostIndicator.classList.add("hidden");
  magnetIndicator.classList.add("hidden");
  if (heldMagnetLeaf) heldMagnetLeaf.visible = false;
  player.position.set(0, 0, PLAYER_Z);
  playerVisual.scale.set(1, 1, 1);
  playerVisual.position.set(0, 0, 0);
  playerVisual.rotation.set(0, 0, 0);
  startScreen.classList.add("hidden");
  gameOverScreen.classList.add("hidden");
  pauseBanner.classList.add("hidden");
  setSoundMixerOpen(false);
  setPauseButtonState(false);
  setAnimation("run");
  ensureAudio();
  syncGameMusic({ restart: true });
  playSound("start");
  showMessage("ВПЕРЁД!");
  updateHud();
}

function clearDynamicObjects() {
  for (const item of state.wordItems) disposeWordGroup(item.group);
  obstacleLayer.clear();
  acornLayer.clear();
  mushroomLayer.clear();
  magnetLeafLayer.clear();
  healthHeartLayer.clear();
  wordLayer.clear();
  particleLayer.clear();
  state.obstacles.length = 0;
  state.acornItems.length = 0;
  state.mushrooms.length = 0;
  state.magnetLeaves.length = 0;
  state.healthHearts.length = 0;
  state.wordItems.length = 0;
  state.particles.length = 0;
}

function disposeWordGroup(group) {
  group.traverse((object) => {
    if (!object.isSprite || !object.material) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) material.dispose();
  });
}

function moveLane(direction) {
  if (!state.running || state.paused) return;
  const next = THREE.MathUtils.clamp(state.targetLane + direction, 0, 2);
  if (next === state.targetLane) return;
  state.targetLane = next;
  playSound("move");
}

function jump() {
  if (!state.running || state.paused || !state.grounded) return;
  state.velocityY = 11.8;
  state.grounded = false;
  setAnimation("jump", .08);
  playSound("jump");
}

function setPauseButtonState(isPaused) {
  const mode = isPaused ? "play" : "pause";
  const label = isPaused ? "Продолжить игру" : "Пауза";
  pauseButton.dataset.mode = mode;
  pauseButton.setAttribute("aria-label", label);
  pauseButton.title = label;
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  pauseBanner.classList.toggle("hidden", !state.paused);
  setPauseButtonState(state.paused);
  syncGameMusic();
  if (!state.paused) clock.getDelta();
}

function spawnAcornPattern() {
  const pattern = Math.floor(Math.random() * 4);
  const baseLane = Math.floor(Math.random() * 3);
  const count = pattern === 3 ? 6 : 5;
  for (let i = 0; i < count; i += 1) {
    let lane = baseLane;
    let height = 1.15;
    if (pattern === 1) lane = (baseLane + Math.floor(i / 2)) % 3;
    if (pattern === 2) height += Math.sin((i / (count - 1)) * Math.PI) * 1.65;
    if (pattern === 3) lane = i % 4 < 2 ? 0 : 2;
    createAcorn(lane, SPAWN_Z - i * 2.55, height);
  }
}

function createAcorn(lane, z, y) {
  const group = new THREE.Group();
  group.add(acornTemplate.clone(true));
  group.position.set(LANES[lane], y, z);
  group.rotation.y = Math.random() * Math.PI;
  acornLayer.add(group);
  state.acornItems.push({ group, collected: false, bob: Math.random() * Math.PI * 2 });
}

function spawnSpeedMushroom() {
  const lane = Math.floor(Math.random() * LANES.length);
  const group = new THREE.Group();
  group.add(mushroomTemplate.clone(true));
  group.position.set(LANES[lane], .1, SPAWN_Z - 6);
  group.rotation.y = Math.random() * Math.PI * 2;
  mushroomLayer.add(group);
  state.mushrooms.push({ group, lane, collected: false, bob: Math.random() * Math.PI * 2, baseY: .1 });
}

function spawnMagnetLeaf() {
  const occupiedLanes = new Set(
    state.mushrooms
      .filter((item) => Math.abs(item.group.position.z - SPAWN_Z) < 10)
      .map((item) => item.lane)
  );
  const availableLanes = [0, 1, 2].filter((lane) => !occupiedLanes.has(lane));
  const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)] ?? 1;
  const group = new THREE.Group();
  group.add(magnetLeafTemplate.clone(true));
  group.position.set(LANES[lane], .14, SPAWN_Z - 7);
  group.rotation.y = Math.random() * Math.PI * 2;
  magnetLeafLayer.add(group);
  state.magnetLeaves.push({ group, lane, collected: false, bob: Math.random() * Math.PI * 2, baseY: .14 });
}

function spawnHealthHeart() {
  if (state.lives >= MAX_LIVES || state.healthHearts.some((heart) => !heart.collected)) return false;
  const spawnZ = SPAWN_Z - 8;
  const occupiedLanes = new Set();
  for (const collection of [state.mushrooms, state.magnetLeaves, state.obstacles, state.wordItems]) {
    for (const item of collection) {
      if (item.collected || item.hit || item.remove || Math.abs(item.group.position.z - spawnZ) >= 11) continue;
      const lane = item.lane ?? nearestLane(item.group.position.x);
      occupiedLanes.add(lane);
    }
  }
  const availableLanes = [0, 1, 2].filter((lane) => !occupiedLanes.has(lane));
  if (availableLanes.length === 0) return false;
  const lane = availableLanes[Math.floor(Math.random() * availableLanes.length)];
  const group = new THREE.Group();
  group.add(healthHeartTemplate.clone(true));
  group.position.set(LANES[lane], 1.35, spawnZ);
  healthHeartLayer.add(group);
  state.healthHearts.push({
    group,
    lane,
    collected: false,
    bob: Math.random() * Math.PI * 2,
    baseY: 1.35
  });
  return true;
}

function renderLesson() {
  const lesson = getCurrentLesson();
  lessonImage.src = lesson.image || "";
  lessonImage.alt = lesson.alt;
  renderSentenceSlots();
  setLessonFeedback("Выберите первое слово");
}

function renderSentenceSlots() {
  const lesson = getCurrentLesson();
  const slots = lesson.words.map((word, index) => {
    const slot = document.createElement("span");
    slot.className = `sentence-slot${index < lessonProgress ? " filled" : ""}`;
    slot.textContent = index < lessonProgress ? word : "•••";
    slot.setAttribute("aria-label", index < lessonProgress ? word : `слово ${index + 1} ещё не собрано`);
    return slot;
  });
  sentenceSlots.replaceChildren(...slots);
}

function setLessonFeedback(text, type = "") {
  lessonFeedback.textContent = text;
  lessonFeedback.className = `lesson-feedback ${type}`.trim();
}

function flashLesson(type) {
  lessonPanel.classList.remove("flash-correct", "flash-wrong");
  void lessonPanel.offsetWidth;
  lessonPanel.classList.add(type === "correct" ? "flash-correct" : "flash-wrong");
}

function spawnWordWave() {
  const lesson = getCurrentLesson();
  const expected = lesson.words[lessonProgress];
  const usedWords = new Set();
  const lanes = [0, 1, 2].filter((lane) => !hasTallObstacleBehindWord(lane, SPAWN_Z));
  const answerInWorld = state.wordItems.some((item) => item.isAnswer && !item.collected);

  if (wavesUntilCorrect <= 0 && !answerInWorld) {
    if (lanes.length === 0) return false;
    const correctLane = Math.floor(Math.random() * lanes.length);
    for (let index = 0; index < lanes.length; index += 1) {
      const lane = lanes[index];
      const word = index === correctLane ? expected : pickDistractor(lesson, expected, usedWords);
      usedWords.add(word);
      createWordToken(word, lane, SPAWN_Z, index === correctLane);
    }
    wavesUntilCorrect = 1 + Math.floor(Math.random() * 2);
    return true;
  }

  if (lanes.length < 2) return false;
  const safeLane = Math.floor(Math.random() * lanes.length);
  for (let index = 0; index < lanes.length; index += 1) {
    if (index === safeLane) continue;
    const lane = lanes[index];
    const word = pickDistractor(lesson, expected, usedWords);
    usedWords.add(word);
    createWordToken(word, lane, SPAWN_Z, false);
  }
  if (wavesUntilCorrect > 0) wavesUntilCorrect -= 1;
  return true;
}

function hasTallObstacleBehindWord(lane, wordZ) {
  return state.obstacles.some((obstacle) => {
    if (obstacle.hit || obstacle.remove || !tallObstacleTypes.has(obstacle.type)) return false;
    if (Math.abs(obstacle.group.position.x - LANES[lane]) > .6) return false;
    const gap = wordZ - obstacle.group.position.z;
    return gap >= -1.5 && gap < WORD_TALL_OBSTACLE_CLEARANCE;
  });
}

function hasWordAheadOfTallObstacle(lane, obstacleZ) {
  return state.wordItems.some((item) => {
    if (item.collected || item.lane !== lane) return false;
    const gap = item.group.position.z - obstacleZ;
    return gap >= -1.5 && gap < WORD_TALL_OBSTACLE_CLEARANCE;
  });
}

function pickDistractor(lesson, expected, usedWords) {
  const pool = [
    ...lesson.distractors,
    ...lesson.words.filter((word) => word !== expected)
  ].filter((word) => word !== expected && !usedWords.has(word));
  return pool[Math.floor(Math.random() * pool.length)] || "not";
}

function createWordToken(word, lane, z, isAnswer) {
  const material = new THREE.SpriteMaterial({
    map: getWordTexture(word),
    transparent: true,
    alphaTest: .05,
    depthWrite: true,
    depthTest: true,
    toneMapped: false,
    fog: true
  });
  const card = new THREE.Sprite(material);
  const width = THREE.MathUtils.clamp(2.15 + word.length * .15, 2.45, 3.6);
  card.scale.set(width, 1.12, 1);
  const group = new THREE.Group();
  group.add(card);
  group.position.set(LANES[lane], 1.48, z);
  wordLayer.add(group);
  state.wordItems.push({ group, word, lane, isAnswer, collected: false, bob: Math.random() * Math.PI * 2, baseY: 1.48 });
}

function getWordTexture(word) {
  if (wordTextureCache.has(word)) return wordTextureCache.get(word);
  const label = document.createElement("canvas");
  label.width = 512;
  label.height = 180;
  const context = label.getContext("2d");
  context.clearRect(0, 0, label.width, label.height);
  if (wordCardImage.complete && wordCardImage.naturalWidth > 0) {
    context.drawImage(wordCardImage, 0, 0, label.width, label.height);
  } else {
    roundedRectPath(context, 8, 8, 496, 164, 34);
    context.fillStyle = "rgba(255, 248, 219, .98)";
    context.fill();
    context.lineWidth = 9;
    context.strokeStyle = "#dc7d21";
    context.stroke();
  }
  context.fillStyle = "#17392d";
  context.shadowColor = "rgba(255,255,255,.72)";
  context.shadowBlur = 3;
  context.shadowOffsetY = 2;
  context.textAlign = "center";
  context.textBaseline = "middle";
  let fontSize = 68;
  do {
    context.font = `900 ${fontSize}px Arial, sans-serif`;
    fontSize -= 3;
  } while (context.measureText(word).width > 365 && fontSize > 40);
  context.fillText(word, 256, 94);
  const texture = new THREE.CanvasTexture(label);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  wordTextureCache.set(word, texture);
  return texture;
}

function roundedRectPath(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function updateWords(dt) {
  for (const item of state.wordItems) {
    if (item.collected) continue;
    item.group.position.y = item.baseY + Math.sin(state.elapsed * 4.6 + item.bob) * .08;
    const dx = Math.abs(item.group.position.x - player.position.x);
    const dz = Math.abs(item.group.position.z - PLAYER_Z);
    const touchesCardVertically = state.grounded && state.y < .08;
    if (dx < 1.25 && dz < 1.35 && touchesCardVertically) collectWord(item);
  }

  state.wordItems = state.wordItems.filter((item) => {
    if (!item.collected && item.group.position.z < 15) return true;
    wordLayer.remove(item.group);
    disposeWordGroup(item.group);
    return false;
  });
}

function collectWord(item) {
  item.collected = true;
  item.group.visible = false;
  const lesson = getCurrentLesson();
  const expected = lesson.words[lessonProgress];

  if (item.word !== expected) {
    state.mistakes += 1;
    recordMistake(lesson, expected, item.word);
    state.lives -= 1;
    state.invulnerable = Math.max(state.invulnerable, .7);
    state.shake = Math.max(state.shake, .45);
    spawnHitParticles(item.group.position);
    setLessonFeedback("Не подходит — посмотрите на картинку и попробуйте ещё", "wrong");
    flashLesson("wrong");
    playSound("wrong");
    if (state.lives > 0) {
      showMessage("НЕ ТО СЛОВО!", "hit");
    } else {
      messageTimer = 0;
      gameMessage.className = "game-message";
      gameMessage.textContent = "";
      window.setTimeout(endGame, 220);
    }
    updateHud();
    return;
  }

  lessonProgress += 1;
  state.correctWords += 1;
  renderSentenceSlots();
  spawnSparkles(item.group.position);
  flashLesson("correct");
  playSound("correct");

  if (lessonProgress < lesson.words.length) {
    setLessonFeedback("Верно! Теперь найдите следующее слово", "correct");
    return;
  }

  state.sentences += 1;
  lessonTransition = 1.35;
  setLessonFeedback(`Отлично! ${formatSentence(lesson.words)}`, "correct");
  showMessage("ПРЕДЛОЖЕНИЕ СОБРАНО!", "coin");
  clearWordItems();
}

function formatSentence(words) {
  return `${words.join(" ")}.`;
}

function recordMistake(lesson, expected, selected) {
  const existing = state.mistakeDetails.find((mistake) =>
    mistake.lessonId === lesson.id && mistake.expected === expected && mistake.selected === selected
  );
  if (existing) {
    existing.count += 1;
    return;
  }
  state.mistakeDetails.push({
    lessonId: lesson.id,
    image: lesson.image,
    alt: lesson.alt,
    sentence: formatSentence(lesson.words),
    expected,
    selected,
    count: 1
  });
}

function renderMistakeReview() {
  mistakeCount.textContent = String(state.mistakes);
  mistakeReview.classList.toggle("no-mistakes", state.mistakes === 0);
  mistakeReview.open = false;

  if (state.mistakeDetails.length === 0) {
    const empty = document.createElement("p");
    empty.className = "mistake-empty";
    empty.textContent = "Ошибок нет — отличная работа!";
    mistakeList.replaceChildren(empty);
    return;
  }

  const items = state.mistakeDetails.map((mistake) => {
    const card = document.createElement("article");
    card.className = "mistake-item";
    const image = document.createElement("img");
    image.src = mistake.image || "";
    image.alt = mistake.alt;
    const text = document.createElement("div");
    const sentence = document.createElement("p");
    sentence.textContent = mistake.sentence;
    const correction = document.createElement("small");
    const selected = document.createElement("strong");
    selected.textContent = mistake.selected;
    correction.append("Выбрано: ", selected, ` · нужно: ${mistake.expected}`);
    if (mistake.count > 1) correction.append(` · повторено ${mistake.count} раза`);
    text.append(sentence, correction);
    card.append(image, text);
    return card;
  });
  mistakeList.replaceChildren(...items);
}

function clearWordItems() {
  for (const item of state.wordItems) disposeWordGroup(item.group);
  wordLayer.clear();
  state.wordItems.length = 0;
}

function updateLessonTransition(dt) {
  if (lessonTransition <= 0) return;
  lessonTransition -= dt;
  if (lessonTransition > 0) return;
  if (lessonIndex + 1 >= lessonDeck.length) {
    endGame();
    return;
  }
  lessonIndex += 1;
  lessonProgress = 0;
  wavesUntilCorrect = 1;
  state.wordTimer = .7;
  renderLesson();
}

function shuffleLessonDeck(avoidFirstId = "") {
  const usedLessonIds = new Set();
  const usedSentences = new Set();
  const usedImages = new Set();
  const nextDeck = LESSON_BANK.filter((lesson) => {
    const sentence = lesson.words.join("\u0000");
    if (usedLessonIds.has(lesson.id) || usedSentences.has(sentence) || usedImages.has(lesson.image)) return false;
    usedLessonIds.add(lesson.id);
    usedSentences.add(sentence);
    usedImages.add(lesson.image);
    return true;
  });
  for (let index = nextDeck.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextDeck[index], nextDeck[swapIndex]] = [nextDeck[swapIndex], nextDeck[index]];
  }
  if (nextDeck.length > 1 && nextDeck[0].id === avoidFirstId) {
    const swapIndex = 1 + Math.floor(Math.random() * (nextDeck.length - 1));
    [nextDeck[0], nextDeck[swapIndex]] = [nextDeck[swapIndex], nextDeck[0]];
  }
  lessonDeck = nextDeck.slice(0, Math.min(LESSONS_PER_RUN, nextDeck.length));
  lessonIndex = 0;
  lastStartingLessonId = lessonDeck[0]?.id || "";
}

function getCurrentLesson() {
  return lessonDeck[lessonIndex] || LESSON_BANK[0];
}

function spawnObstacleWave() {
  const types = state.elapsed < 10
    ? ["stump", "boulder"]
    : ["stump", "boulder", "cairn", "rock"];
  const nearbyAnswer = state.wordItems.find((item) => item.isAnswer && Math.abs(item.group.position.z - SPAWN_Z) < 7);
  const nearbyMushroom = state.mushrooms.find((item) => Math.abs(item.group.position.z - SPAWN_Z) < 9);
  const nearbyMagnetLeaf = state.magnetLeaves.find((item) => Math.abs(item.group.position.z - SPAWN_Z) < 10);
  const nearbyHealthHeart = state.healthHearts.find((item) => Math.abs(item.group.position.z - SPAWN_Z) < 12);
  const reservedLanes = new Set([nearbyAnswer?.lane, nearbyMushroom?.lane, nearbyMagnetLeaf?.lane, nearbyHealthHeart?.lane].filter((lane) => lane !== undefined));
  const doubleWave = state.elapsed > 15 && Math.random() < .32;
  const availableLanes = [0, 1, 2].filter((lane) => !reservedLanes.has(lane));
  const shuffledLanes = availableLanes.sort(() => Math.random() - .5);
  const lanes = shuffledLanes.slice(0, doubleWave ? Math.min(2, shuffledLanes.length) : 1);
  for (const lane of lanes) {
    const type = types[Math.floor(Math.random() * types.length)];
    createObstacle(type, lane, SPAWN_Z - Math.random() * 1.5);
  }
}

function createObstacle(type, lane, z) {
  let group;
  const rule = obstacleRules[type] || "jump";
  if (tallObstacleTypes.has(type) && hasWordAheadOfTallObstacle(lane, z)) return false;
  if (modelObstacleTemplates[type]) {
    group = modelObstacleTemplates[type].clone(true);
    group.rotation.y = (Math.random() - .5) * .28;
  } else {
    group = new THREE.Group();
    const rock = new THREE.Mesh(shared.rockGeometry, shared.mat.rock);
    rock.scale.set(1.2, 1.08, .95);
    rock.position.y = 1;
    rock.rotation.set(.2, .4, -.12);
    rock.castShadow = true;
    group.add(rock);
  }
  group.updateWorldMatrix(true, true);
  const collisionBox = new THREE.Box3().setFromObject(group);
  const collisionSize = collisionBox.getSize(new THREE.Vector3());
  const collisionHalfWidth = THREE.MathUtils.clamp(collisionSize.x * .5 + .42, 1.3, 2.35);
  const collisionHalfDepth = THREE.MathUtils.clamp(collisionSize.z * .5 + .72, 1.42, 2.8);
  group.position.set(LANES[lane], 0, z);
  obstacleLayer.add(group);
  state.obstacles.push({
    group,
    type,
    rule,
    hit: false,
    collisionHalfWidth,
    collisionHalfDepth,
    jumpClearance: obstacleJumpClearance[type] || .7
  });
  return true;
}

function update(dt) {
  const activeDt = Math.min(dt, .04);
  if (mixer && !state.paused) mixer.update(activeDt * (state.running ? 1.1 + state.speed / 50 : .7));
  if (!state.paused) updateAtmosphere(activeDt);

  if (!state.running || state.paused) {
    if (!state.running && !state.paused) {
      moveWorld(activeDt, 2.3);
      playerVisual.position.y = THREE.MathUtils.damp(playerVisual.position.y, 0, 10, activeDt);
      playerVisual.rotation.x = THREE.MathUtils.damp(playerVisual.rotation.x, 0, 10, activeDt);
      playerVisual.rotation.y = THREE.MathUtils.damp(playerVisual.rotation.y, 0, 10, activeDt);
      playerVisual.rotation.z = THREE.MathUtils.damp(playerVisual.rotation.z, 0, 10, activeDt);
    }
    player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, 0, activeDt * 8);
    return;
  }

  state.elapsed += activeDt;
  state.boostTimer = Math.max(0, state.boostTimer - activeDt);
  state.magnetTimer = Math.max(0, state.magnetTimer - activeDt);
  const normalSpeed = BASE_RUN_SPEED;
  const boostFactor = Math.min(1, state.boostTimer / .65);
  state.speed = Math.min(BOOST_MAX_RUN_SPEED, normalSpeed + SPEED_BOOST_BONUS * boostFactor);
  state.distance += state.speed * activeDt * .74;
  state.score =
    state.acorns * SCORE_PER_ACORN +
    state.correctWords * SCORE_PER_CORRECT_WORD +
    state.sentences * SCORE_PER_SENTENCE;
  state.obstacleTimer -= activeDt;
  state.acornTimer -= activeDt;
  state.mushroomTimer -= activeDt;
  state.magnetLeafTimer -= activeDt;
  state.healthHeartTimer -= activeDt;
  updateBoostIndicator();
  updateMagnetIndicator();
  updateLessonTransition(activeDt);
  if (!state.running) return;
  if (lessonTransition <= 0) state.wordTimer -= activeDt;
  state.invulnerable = Math.max(0, state.invulnerable - activeDt);
  state.shake = Math.max(0, state.shake - activeDt * 2.8);
  messageTimer = Math.max(0, messageTimer - activeDt);
  if (messageTimer === 0) gameMessage.classList.remove("show");

  if (state.acornTimer <= 0) {
    spawnAcornPattern();
    state.acornTimer = 7 + Math.random() * 2;
  }

  if (state.mushroomTimer <= 0) {
    spawnSpeedMushroom();
    state.mushroomTimer = 16 + Math.random() * 8;
  }

  if (state.magnetLeafTimer <= 0) {
    spawnMagnetLeaf();
    state.magnetLeafTimer = 24 + Math.random() * 10;
  }

  if (state.healthHeartTimer <= 0) {
    const heartSpawned = spawnHealthHeart();
    state.healthHeartTimer = heartSpawned
      ? HEALTH_HEART_MIN_DELAY + Math.random() * HEALTH_HEART_RANDOM_DELAY
      : state.lives < MAX_LIVES ? 7 + Math.random() * 5 : 12 + Math.random() * 8;
  }

  if (lessonTransition <= 0 && state.wordTimer <= 0) {
    const wordWaveSpawned = spawnWordWave();
    state.wordTimer = wordWaveSpawned ? 1.8 + Math.random() * .55 : .35;
  }

  if (state.obstacleTimer <= 0) {
    spawnObstacleWave();
    state.obstacleTimer = Math.max(1.45, 2.45 - state.elapsed * .009) + Math.random() * .65;
  }

  const targetX = LANES[state.targetLane];
  player.position.x = THREE.MathUtils.damp(player.position.x, targetX, 11, activeDt);
  state.lane = nearestLane(player.position.x);
  const lean = THREE.MathUtils.clamp((targetX - player.position.x) * -.055, -.14, .14);
  player.rotation.z = THREE.MathUtils.damp(player.rotation.z, lean, 10, activeDt);

  if (!state.grounded) {
    state.velocityY -= 28 * activeDt;
    state.y += state.velocityY * activeDt;
    if (state.y <= 0) {
      state.y = 0;
      state.velocityY = 0;
      state.grounded = true;
      setAnimation("run", .12);
      playSound("land");
    }
  }
  player.position.y = state.y;

  const targetScaleY = 1;
  const runPhase = state.elapsed * (12 + state.speed * .18);
  const proceduralStride = usesProceduralPlayerMotion && state.grounded;
  const bob = proceduralStride ? Math.abs(Math.sin(runPhase)) * .075 : 0;
  const sideSway = proceduralStride ? Math.sin(runPhase) * .025 : 0;
  const targetPitch = !state.grounded && usesProceduralPlayerMotion ? -.1 : 0;
  const targetScaleXZ = proceduralStride ? 1 + Math.sin(runPhase * 2) * .012 : 1;
  playerVisual.scale.x = THREE.MathUtils.damp(playerVisual.scale.x, targetScaleXZ, 16, activeDt);
  playerVisual.scale.y = THREE.MathUtils.damp(playerVisual.scale.y, targetScaleY, 16, activeDt);
  playerVisual.scale.z = THREE.MathUtils.damp(playerVisual.scale.z, targetScaleXZ, 16, activeDt);
  playerVisual.position.y = bob;
  playerVisual.rotation.x = THREE.MathUtils.damp(playerVisual.rotation.x, targetPitch, 12, activeDt);
  playerVisual.rotation.y = THREE.MathUtils.damp(playerVisual.rotation.y, sideSway, 14, activeDt);
  playerVisual.rotation.z = THREE.MathUtils.damp(playerVisual.rotation.z, -sideSway * .55, 14, activeDt);
  playerVisual.visible = state.invulnerable <= 0 || Math.floor(state.invulnerable * 12) % 2 === 0;
  updateHeldMagnetLeaf();

  moveWorld(activeDt, state.speed);
  updateAcorns(activeDt);
  updateMushrooms(activeDt);
  updateMagnetLeaves(activeDt);
  updateHealthHearts(activeDt);
  updateWords(activeDt);
  updateObstacles();
  updateParticles(activeDt);
  updateCamera();
  updateHud();
}

function moveWorld(dt, speed) {
  const movement = speed * dt;
  for (const layer of [trackLayer, sceneryLayer]) {
    for (const segment of layer.children) {
      segment.position.z += movement;
      if (segment.position.z > PLAYER_Z + SEGMENT_LENGTH) segment.position.z -= SEGMENT_COUNT * SEGMENT_LENGTH;
    }
  }
  for (const item of state.acornItems) item.group.position.z += movement;
  for (const mushroom of state.mushrooms) mushroom.group.position.z += movement;
  for (const leaf of state.magnetLeaves) leaf.group.position.z += movement;
  for (const heart of state.healthHearts) heart.group.position.z += movement;
  for (const item of state.wordItems) item.group.position.z += movement;
  for (const obstacle of state.obstacles) obstacle.group.position.z += movement;
  for (const firefly of fireflies) {
    firefly.position.z += movement * .3;
    if (firefly.position.z > 16) firefly.position.z -= 120;
  }
  for (const butterfly of butterflies) {
    butterfly.position.z += movement * WILDLIFE_ROUTE_SPEED;
    if (butterfly.position.z > 18) butterfly.position.z -= WILDLIFE_ROUTE_LENGTH;
  }
  for (const bird of forestBirds) {
    bird.position.z += movement * WILDLIFE_ROUTE_SPEED;
    if (bird.position.z > 18) bird.position.z -= WILDLIFE_ROUTE_LENGTH;
  }
  for (const leaf of fallingLeaves) {
    leaf.position.z += movement * .24;
    if (leaf.position.z > 16) leaf.position.z -= 120;
  }
}

function updateAcorns(dt) {
  for (const acorn of state.acornItems) {
    if (acorn.collected) continue;
    acorn.group.rotation.y += dt * 5.8;
    acorn.group.position.y += Math.sin(state.elapsed * 5 + acorn.bob) * dt * .12;
    const distanceToPlayer = Math.abs(acorn.group.position.z - PLAYER_Z);
    if (state.magnetTimer > 0 && distanceToPlayer < MAGNET_PULL_RADIUS) {
      const targetY = state.y + 1.25;
      acorn.group.position.x = THREE.MathUtils.damp(acorn.group.position.x, player.position.x, 8.5, dt);
      acorn.group.position.y = THREE.MathUtils.damp(acorn.group.position.y, targetY, 7, dt);
      acorn.group.position.z = THREE.MathUtils.damp(acorn.group.position.z, PLAYER_Z, 6.5, dt);
    }
    const dx = Math.abs(acorn.group.position.x - player.position.x);
    const dz = Math.abs(acorn.group.position.z - PLAYER_Z);
    const playerCenterY = state.y + 1.25;
    const dy = Math.abs(acorn.group.position.y - playerCenterY);
    if (dx < 1.15 && dz < 1.35 && dy < 1.7) collectAcorn(acorn);
  }

  state.acornItems = state.acornItems.filter((acorn) => {
    if (!acorn.collected && acorn.group.position.z < 15) return true;
    acornLayer.remove(acorn.group);
    return false;
  });
}

function collectAcorn(acorn) {
  acorn.collected = true;
  acorn.group.visible = false;
  state.acorns += 1;
  spawnSparkles(acorn.group.position);
  playSound("coin");
  if (state.acorns % 10 === 0) showMessage(`ЖЁЛУДИ ${state.acorns}!`, "coin");
}

function updateMushrooms(dt) {
  for (const mushroom of state.mushrooms) {
    if (mushroom.collected) continue;
    mushroom.group.rotation.y += dt * 3.8;
    mushroom.group.rotation.z = Math.sin(state.elapsed * 3.2 + mushroom.bob) * .08;
    mushroom.group.position.y = mushroom.baseY + Math.sin(state.elapsed * 4.4 + mushroom.bob) * .07;
    const dx = Math.abs(mushroom.group.position.x - player.position.x);
    const dz = Math.abs(mushroom.group.position.z - PLAYER_Z);
    if (dx < 1.25 && dz < 1.4 && state.y < 1.7) collectSpeedMushroom(mushroom);
  }

  state.mushrooms = state.mushrooms.filter((mushroom) => {
    if (!mushroom.collected && mushroom.group.position.z < 15) return true;
    mushroomLayer.remove(mushroom.group);
    return false;
  });
}

function collectSpeedMushroom(mushroom) {
  mushroom.collected = true;
  mushroom.group.visible = false;
  state.boostTimer = SPEED_BOOST_DURATION;
  spawnSparkles(mushroom.group.position);
  showMessage("УСКОРЕНИЕ!", "boost");
  playSound("boost");
  updateBoostIndicator();
}

function updateBoostIndicator() {
  const active = state.running && state.boostTimer > 0;
  boostIndicator.classList.toggle("hidden", !active);
  boostTime.textContent = `${state.boostTimer.toFixed(1)} с`;
}

function updateMagnetLeaves(dt) {
  for (const leaf of state.magnetLeaves) {
    if (leaf.collected) continue;
    leaf.group.rotation.y += dt * 3.2;
    leaf.group.rotation.z = Math.sin(state.elapsed * 3.5 + leaf.bob) * .1;
    leaf.group.position.y = leaf.baseY + Math.sin(state.elapsed * 4.1 + leaf.bob) * .08;
    const dx = Math.abs(leaf.group.position.x - player.position.x);
    const dz = Math.abs(leaf.group.position.z - PLAYER_Z);
    if (dx < 1.3 && dz < 1.45 && state.y < 1.7) collectMagnetLeaf(leaf);
  }

  state.magnetLeaves = state.magnetLeaves.filter((leaf) => {
    if (!leaf.collected && leaf.group.position.z < 15) return true;
    magnetLeafLayer.remove(leaf.group);
    return false;
  });
}

function collectMagnetLeaf(leaf) {
  leaf.collected = true;
  leaf.group.visible = false;
  state.magnetTimer = MAGNET_DURATION;
  spawnSparkles(leaf.group.position);
  showMessage("МАГНИТ ЖЁЛУДЕЙ!", "magnet");
  playSound("magnet");
  updateMagnetIndicator();
  updateHeldMagnetLeaf();
}

function updateHealthHearts(dt) {
  for (const heart of state.healthHearts) {
    if (heart.collected) continue;
    const phase = state.elapsed * 3.2 + heart.bob;
    heart.group.rotation.y += dt * 2.25;
    heart.group.rotation.z = Math.sin(phase * .7) * .08;
    heart.group.position.y = heart.baseY + Math.sin(phase) * .16;
    const pulse = 1 + Math.sin(phase * 1.8) * .075;
    heart.group.scale.setScalar(pulse);
    const dx = Math.abs(heart.group.position.x - player.position.x);
    const dz = Math.abs(heart.group.position.z - PLAYER_Z);
    const playerCenterY = state.y + 1.25;
    const dy = Math.abs(heart.group.position.y - playerCenterY);
    if (dx < 1.2 && dz < 1.45 && dy < 1.55) collectHealthHeart(heart);
  }

  state.healthHearts = state.healthHearts.filter((heart) => {
    if (!heart.collected && heart.group.position.z < 15) return true;
    healthHeartLayer.remove(heart.group);
    return false;
  });
}

function collectHealthHeart(heart) {
  heart.collected = true;
  heart.group.visible = false;
  state.lives = Math.min(MAX_LIVES, state.lives + 1);
  state.invulnerable = Math.max(state.invulnerable, .7);
  spawnSparkles(heart.group.position);
  showMessage("+1 ЖИЗНЬ!", "heal");
  playSound("heal");
  updateHud();
}

function updateMagnetIndicator() {
  const active = state.running && state.magnetTimer > 0;
  magnetIndicator.classList.toggle("hidden", !active);
  magnetTime.textContent = `${state.magnetTimer.toFixed(1)} с`;
}

function updateObstacles() {
  for (const obstacle of state.obstacles) {
    if (obstacle.hit) continue;
    const dx = Math.abs(obstacle.group.position.x - player.position.x);
    const dz = Math.abs(obstacle.group.position.z - PLAYER_Z);
    const collisionHalfWidth = obstacle.collisionHalfWidth || 1.3;
    const collisionHalfDepth = obstacle.collisionHalfDepth || 1.42;
    if (dx > collisionHalfWidth || dz > collisionHalfDepth) continue;

    const avoided = obstacle.rule === "jump" && !state.grounded && state.y > obstacle.jumpClearance;
    if (!avoided) hitPlayer(obstacle);
  }

  state.obstacles = state.obstacles.filter((obstacle) => {
    if (obstacle.remove) {
      obstacleLayer.remove(obstacle.group);
      return false;
    }
    if (obstacle.group.position.z < 15) return true;
    obstacleLayer.remove(obstacle.group);
    return false;
  });
}

function hitPlayer(obstacle) {
  obstacle.hit = true;
  obstacle.remove = true;
  obstacle.group.visible = false;
  if (state.invulnerable > 0) return;
  state.lives -= 1;
  state.invulnerable = 1.55;
  state.shake = 1;
  state.speed = Math.max(9.5, state.speed - 3);
  spawnHitParticles(obstacle.group.position);
  playSound("hit");
  if (state.lives > 0) {
    showMessage("ОСТОРОЖНЕЕ!", "hit");
  } else {
    messageTimer = 0;
    gameMessage.className = "game-message";
    gameMessage.textContent = "";
  }
  updateHud();
  if (state.lives <= 0) window.setTimeout(endGame, 220);
}

function spawnSparkles(position) {
  for (let i = 0; i < 8; i += 1) {
    const mesh = new THREE.Mesh(shared.sparkGeometry, shared.mat.spark);
    mesh.position.copy(position);
    mesh.position.z = PLAYER_Z - .6;
    particleLayer.add(mesh);
    state.particles.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - .5) * 4, 1.6 + Math.random() * 3.4, (Math.random() - .5) * 2),
      life: .55 + Math.random() * .25
    });
  }
}

function spawnHitParticles(position) {
  for (let i = 0; i < 10; i += 1) {
    const mesh = new THREE.Mesh(shared.sparkGeometry, i % 2 ? shared.mat.red : shared.mat.rope);
    mesh.scale.setScalar(1.4);
    mesh.position.copy(position);
    mesh.position.y = 1.1;
    particleLayer.add(mesh);
    state.particles.push({
      mesh,
      velocity: new THREE.Vector3((Math.random() - .5) * 7, 2 + Math.random() * 4, (Math.random() - .5) * 3),
      life: .6 + Math.random() * .35
    });
  }
}

function updateParticles(dt) {
  state.particles = state.particles.filter((particle) => {
    particle.life -= dt;
    particle.velocity.y -= 7 * dt;
    particle.mesh.position.addScaledVector(particle.velocity, dt);
    particle.mesh.rotation.x += dt * 7;
    particle.mesh.rotation.y += dt * 8;
    particle.mesh.scale.multiplyScalar(.975);
    if (particle.life > 0) return true;
    particleLayer.remove(particle.mesh);
    return false;
  });
}

function updateCamera() {
  const shakeStrength = state.shake * .16;
  camera.position.set(
    cameraBase.x + (Math.random() - .5) * shakeStrength,
    cameraBase.y + (Math.random() - .5) * shakeStrength,
    cameraBase.z + (Math.random() - .5) * shakeStrength
  );
  camera.lookAt(player.position.x * .08, 1.15 + state.y * .08, -10);
}

function endGame() {
  if (!state.running) return;
  state.running = false;
  state.paused = false;
  setSoundMixerOpen(false);
  syncGameMusic();
  state.y = 0;
  state.velocityY = 0;
  state.grounded = true;
  state.boostTimer = 0;
  state.magnetTimer = 0;
  state.invulnerable = 0;
  state.shake = 0;
  particleLayer.clear();
  state.particles.length = 0;
  player.position.y = 0;
  player.rotation.z = 0;
  playerVisual.position.set(0, 0, 0);
  playerVisual.rotation.set(0, 0, 0);
  playerVisual.scale.set(1, 1, 1);
  playerVisual.visible = true;
  messageTimer = 0;
  gameMessage.className = "game-message";
  gameMessage.textContent = "";
  lessonPanel.classList.add("hidden");
  boostIndicator.classList.add("hidden");
  magnetIndicator.classList.add("hidden");
  if (heldMagnetLeaf) heldMagnetLeaf.visible = false;
  setAnimation("walk", .25);
  const previousBest = state.best;
  if (state.score > state.best) {
    state.best = state.score;
    writeBest(state.best);
  }
  resultTitle.textContent = state.score > previousBest && state.score > 0
    ? "НОВЫЙ РЕКОРД!"
    : state.sentences >= 4 ? "ПРЕКРАСНАЯ РАБОТА!" : "ХОРОШАЯ ТРЕНИРОВКА!";
  resultScore.textContent = String(state.score);
  resultDistance.textContent = `${Math.floor(state.distance)} м`;
  resultCoins.textContent = String(state.sentences);
  resultBest.textContent = String(state.best);
  bestEl.textContent = String(state.best);
  renderMistakeReview();
  window.setTimeout(() => gameOverScreen.classList.remove("hidden"), 180);
}

function updateHud() {
  if (renderedScore !== state.score) {
    scoreEl.textContent = String(state.score);
    renderedScore = state.score;
  }
  if (renderedAcorns !== state.acorns) {
    acornsEl.textContent = String(state.acorns);
    renderedAcorns = state.acorns;
  }
  if (renderedBest !== state.best) {
    bestEl.textContent = String(state.best);
    renderedBest = state.best;
  }
  if (renderedLives !== state.lives) {
    const hearts = Array.from({ length: MAX_LIVES }, (_, index) => {
      const heart = document.createElement("img");
      const full = index < state.lives;
      heart.className = `life-heart${full ? "" : " empty"}`;
      heart.src = full ? UI_ASSETS.heartFull : UI_ASSETS.heartEmpty;
      heart.alt = "";
      return heart;
    });
    livesEl.replaceChildren(...hearts);
    renderedLives = state.lives;
  }
  livesEl.setAttribute("aria-label", `${state.lives} ${plural(state.lives, "жизнь", "жизни", "жизней")}`);
}

function showMessage(text, type = "") {
  gameMessage.textContent = text;
  gameMessage.className = `game-message show ${type}`.trim();
  messageTimer = type === "coin" ? .72 : 1.05;
}

function nearestLane(x) {
  let nearest = 0;
  let distance = Infinity;
  LANES.forEach((laneX, index) => {
    const current = Math.abs(laneX - x);
    if (current < distance) {
      distance = current;
      nearest = index;
    }
  });
  return nearest;
}

function resize() {
  const width = Math.max(320, window.innerWidth);
  const height = Math.max(320, window.innerHeight);
  const profileMaxRatio = DEVICE_PROFILE === "mobile"
    ? 1
    : DEVICE_PROFILE === "tablet" ? 1.15 : (LOW_POWER_DEVICE ? 1.1 : 1.35);
  const pixelBudget = DEVICE_PROFILE === "mobile"
    ? 1150000
    : DEVICE_PROFILE === "tablet" ? 2000000 : 3000000;
  const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, width * height));
  const pixelRatio = Math.max(
    .65,
    Math.min(window.devicePixelRatio || 1, profileMaxRatio * renderScale, budgetRatio)
  );
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.fov = width < 620 ? 57 : width < 980 && HAS_COARSE_POINTER ? 52 : 48;
  camera.updateProjectionMatrix();
  document.documentElement.dataset.renderScale = renderScale.toFixed(2);
}

function sampleRenderPerformance(dt) {
  if (!state.running || state.paused || dt <= 0 || dt > .2) return;
  performanceSampleSeconds += dt;
  performanceSampleFrames += 1;
  if (performanceSampleSeconds < 2.5) return;
  const fps = performanceSampleFrames / performanceSampleSeconds;
  const previousScale = renderScale;
  if (fps < 38 && renderScale > .7) renderScale = Math.max(.7, renderScale - .12);
  else if (fps > 56 && renderScale < 1) renderScale = Math.min(1, renderScale + .05);
  performanceSampleSeconds = 0;
  performanceSampleFrames = 0;
  document.documentElement.dataset.renderFps = String(Math.round(fps));
  if (Math.abs(previousScale - renderScale) > .001) resize();
}

function animate(timestamp = 0) {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const fullScreenOverlayVisible = !loadingScreen.classList.contains("hidden") || !startScreen.classList.contains("hidden");
  if (fullScreenOverlayVisible) return;
  const idleFrameInterval = state.paused ? 160 : !state.running ? 66 : 0;
  if (idleFrameInterval && timestamp - lastIdleRenderTime < idleFrameInterval) return;
  if (idleFrameInterval) lastIdleRenderTime = timestamp;
  update(dt);
  renderer.render(scene, camera);
  sampleRenderPerformance(dt);
}

function readBest() {
  try { return Number.parseInt(localStorage.getItem("barnaby-best") || "0", 10) || 0; }
  catch { return 0; }
}

function writeBest(value) {
  try { localStorage.setItem("barnaby-best", String(value)); }
  catch { /* Storage can be disabled; the run still works. */ }
}

function readPlayerName() {
  try { return (localStorage.getItem(PLAYER_NAME_STORAGE_KEY) || "").slice(0, 24); }
  catch { return ""; }
}

function writePlayerName(value) {
  try { localStorage.setItem(PLAYER_NAME_STORAGE_KEY, value.slice(0, 24)); }
  catch { /* The name field still works for the current page. */ }
}

function updateResultPlayerName() {
  const name = playerNameInput.value.trim();
  resultNameMessage.textContent = name ? `Молодец, ${name}!` : "Имя сохранится на этом устройстве";
  resultNameMessage.classList.toggle("has-name", Boolean(name));
}

function readSoundPreference() {
  try {
    if (localStorage.getItem("barnaby-sound-version") !== SOUND_PREFERENCE_VERSION) {
      localStorage.setItem("barnaby-sound-version", SOUND_PREFERENCE_VERSION);
      localStorage.setItem("barnaby-sound", "on");
      return true;
    }
    return localStorage.getItem("barnaby-sound") !== "off";
  }
  catch { return true; }
}

function writeSoundPreference() {
  try { localStorage.setItem("barnaby-sound", soundEnabled ? "on" : "off"); }
  catch { /* The sound toggle still works for the current page. */ }
}

function readVolumePreference(key, fallback) {
  try {
    const stored = Number(localStorage.getItem(key));
    return Number.isFinite(stored) && stored >= 0 && stored <= 1 ? stored : fallback;
  } catch { return fallback; }
}

function writeVolumePreference(key, value) {
  try { localStorage.setItem(key, String(value)); }
  catch { /* Volume still works for the current page. */ }
}

function plural(value, one, few, many) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function mulberry32(seed) {
  return function random() {
    let value = seed += 0x6d2b79f5;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function ensureAudio() {
  if (!soundEnabled) return;
  if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
  if (audioContext.state === "suspended") audioContext.resume();
}

function playSound(type) {
  if (!soundEnabled || effectsVolume <= 0) return;
  if (!audioContext) ensureAudio();
  if (!audioContext) return;
  const settings = {
    start: [280, 560, .16, "triangle"],
    move: [180, 230, .06, "sine"],
    jump: [240, 520, .16, "sine"],
    land: [95, 65, .07, "sine"],
    coin: [620, 940, .09, "sine"],
    boost: [360, 1180, .32, "sine"],
    magnet: [460, 920, .28, "triangle"],
    heal: [430, 980, .3, "sine"],
    correct: [520, 790, .12, "sine"],
    wrong: [190, 115, .14, "square"],
    hit: [150, 52, .25, "sawtooth"]
  }[type];
  if (!settings) return;
  const [from, to, duration, wave] = settings;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(from, now);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, to), now + duration);
  gain.gain.setValueAtTime((type === "hit" ? .1 : .055) * effectsVolume, now);
  gain.gain.exponentialRampToValueAtTime(.001, now + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + duration);
}

function updateSoundControls() {
  const icon = soundEnabled ? UI_ASSETS.soundOn : UI_ASSETS.soundOff;
  menuSoundIcon.src = icon || "";
  gameSoundIcon.src = icon || "";
  menuSoundLabel.textContent = soundEnabled ? "ЗВУК ВКЛ" : "ЗВУК ВЫКЛ";
  const label = soundEnabled ? "Выключить звук" : "Включить звук";
  menuSoundButton.setAttribute("aria-label", label);
  gameSoundButton.setAttribute("aria-label", "Открыть микшер звука");
  menuSoundButton.classList.toggle("muted", !soundEnabled);
  gameSoundButton.classList.toggle("muted", !soundEnabled);
  gameShell.classList.toggle("sound-muted", !soundEnabled);
  const menuSoundActive = menuVideoAudioUnlocked && soundEnabled;
  menuSoundIcon.src = (menuSoundActive ? UI_ASSETS.soundOn : UI_ASSETS.soundOff) || "";
  menuSoundLabel.textContent = menuSoundActive ? "ЗВУК ВКЛ" : "ЗВУК ВЫКЛ";
  menuSoundButton.setAttribute("aria-label", menuSoundActive ? "Выключить звук видео" : "Включить звук видео");
  menuSoundButton.classList.toggle("muted", !menuSoundActive);
  updateMixerControls();
}

function updateMixerControls() {
  const musicPercent = Math.round(musicVolume * 100);
  const effectsPercent = Math.round(effectsVolume * 100);
  musicVolumeInput.value = String(musicPercent);
  effectsVolumeInput.value = String(effectsPercent);
  musicVolumeValue.value = `${musicPercent}%`;
  effectsVolumeValue.value = `${effectsPercent}%`;
  musicVolumeInput.style.setProperty("--fill", `${musicPercent}%`);
  effectsVolumeInput.style.setProperty("--fill", `${effectsPercent}%`);
  mixerMuteButton.textContent = soundEnabled ? "ВЫКЛЮЧИТЬ ЗВУК" : "ВКЛЮЧИТЬ ЗВУК";
  mixerMuteButton.dataset.enabled = String(soundEnabled);
}

function setSoundMixerOpen(open) {
  const wasOpen = !soundMixer.classList.contains("hidden");
  if (open === wasOpen) return;
  soundMixer.classList.toggle("hidden", !open);
  gameSoundButton.setAttribute("aria-expanded", String(open));
}

function toggleSoundMixer() {
  setSoundMixerOpen(soundMixer.classList.contains("hidden"));
}

function setMusicVolume(value) {
  musicVolume = Math.max(0, Math.min(1, Number(value) / 100));
  writeVolumePreference("barnaby-music-volume", musicVolume);
  updateMixerControls();
  syncGameMusic();
}

function setEffectsVolume(value) {
  effectsVolume = Math.max(0, Math.min(1, Number(value) / 100));
  writeVolumePreference("barnaby-effects-volume", effectsVolume);
  updateMixerControls();
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  writeSoundPreference();
  updateSoundControls();
  syncMenuVideoSound();
  syncGameMusic();
  if (soundEnabled) {
    ensureAudio();
    playSound("correct");
    if (!startScreen.classList.contains("hidden")) {
      const playback = menuVideo.play();
      if (playback?.catch) playback.catch(() => {});
    }
  }
}

function toggleMenuVideoSound() {
  if (!menuVideoAudioUnlocked) {
    menuVideoAudioUnlocked = true;
    soundEnabled = true;
  } else {
    soundEnabled = !soundEnabled;
  }
  writeSoundPreference();
  updateSoundControls();
  syncMenuVideoSound();
  if (!soundEnabled) return;
  ensureAudio();
  playSound("correct");
  const playback = menuVideo.play();
  if (playback?.catch) playback.catch(() => {});
}

document.addEventListener("keydown", (event) => {
  const interactiveTarget = event.target instanceof Element
    && Boolean(event.target.closest("button, a, input, select, textarea, [contenteditable='true']"));
  if (interactiveTarget) return;
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", " "].includes(key)) event.preventDefault();
  if (key === "arrowleft") moveLane(-1);
  if (key === "arrowright") moveLane(1);
  if (key === "arrowup" || key === " ") jump();
  if (key === "m") toggleSound();
  if (key === "enter" && !state.running && modelReady) startGame();
});

function useTouchControl(event, action) {
  if (event.pointerType === "mouse") return;
  event.preventDefault();
  action();
  event.currentTarget.blur();
}

leftButton.addEventListener("pointerdown", (event) => useTouchControl(event, () => moveLane(-1)));
rightButton.addEventListener("pointerdown", (event) => useTouchControl(event, () => moveLane(1)));
jumpButton.addEventListener("pointerdown", (event) => useTouchControl(event, jump));
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
playerNameInput.value = readPlayerName();
updateResultPlayerName();
playerNameInput.addEventListener("input", () => {
  writePlayerName(playerNameInput.value);
  updateResultPlayerName();
});
pauseButton.addEventListener("click", (event) => {
  if (event.detail === 0) return;
  togglePause();
  pauseButton.blur();
});
menuSoundButton.addEventListener("click", toggleMenuVideoSound);
gameSoundButton.addEventListener("click", toggleSoundMixer);
mixerCloseButton.addEventListener("click", () => setSoundMixerOpen(false));
mixerMuteButton.addEventListener("click", toggleSound);
musicVolumeInput.addEventListener("input", (event) => setMusicVolume(event.currentTarget.value));
effectsVolumeInput.addEventListener("input", (event) => setEffectsVolume(event.currentTarget.value));
effectsVolumeInput.addEventListener("change", () => playSound("correct"));
document.addEventListener("pointerdown", (event) => {
  if (soundMixer.classList.contains("hidden")) return;
  if (soundMixer.contains(event.target) || gameSoundButton.contains(event.target)) return;
  setSoundMixerOpen(false);
}, { passive: true });
window.addEventListener("resize", resize);
document.addEventListener("visibilitychange", () => {
  syncGameMusic();
  if (!document.hidden && state.running && !state.paused) clock.getDelta();
});

let touchStart = null;
canvas.addEventListener("pointerdown", (event) => {
  if (!event.isPrimary || event.pointerType === "mouse") return;
  touchStart = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
});
canvas.addEventListener("pointerup", (event) => {
  if (event.pointerType === "mouse" || !touchStart || event.pointerId !== touchStart.pointerId) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 28) return;
  if (Math.abs(dx) > Math.abs(dy)) moveLane(dx > 0 ? 1 : -1);
  else if (dy < 0) jump();
});
canvas.addEventListener("pointercancel", () => { touchStart = null; });
canvas.addEventListener("contextmenu", (event) => event.preventDefault());
window.__barnabyGame = {
  debug() {
    return {
      ready: modelReady,
      running: state.running,
      paused: state.paused,
      lane: state.lane,
      targetLane: state.targetLane,
      jump: state.y,
      score: state.score,
      acorns: state.acorns,
      lives: state.lives,
      distance: Math.floor(state.distance),
      speed: Number(state.speed.toFixed(2)),
      obstacles: state.obstacles.length,
      acornItems: state.acornItems.length,
      mushrooms: state.mushrooms.length,
      boostTimer: Number(state.boostTimer.toFixed(2)),
      magnetLeaves: state.magnetLeaves.length,
      magnetTimer: Number(state.magnetTimer.toFixed(2)),
      healthHearts: state.healthHearts.length,
      healthHeartTimer: Number(state.healthHeartTimer.toFixed(2)),
      holdingMagnet: Boolean(heldMagnetLeaf?.visible),
      magnetEffects: heldMagnetParticles.length,
      fireflies: fireflies.length,
      sun3d: Boolean(sun),
      wordItems: state.wordItems.length,
      lesson: lessonIndex + 1,
      lessonTotal: lessonDeck.length,
      lessonProgress,
      expectedWord: getCurrentLesson().words[lessonProgress] || null,
      correctWords: state.correctWords,
      mistakes: state.mistakes,
      sentences: state.sentences,
      animations: Object.keys(actions),
      playerMotion: usesProceduralPlayerMotion ? "procedural" : "gltf-in-place",
      loadErrors: window.__barnabyLoadErrors
    };
  },
  start: startGame,
  moveLane,
  jump
};

animate();
