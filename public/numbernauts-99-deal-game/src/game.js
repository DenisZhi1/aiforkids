(function () {
  "use strict";

  const WIDTH = 1600;
  const HEIGHT = 900;
  const WORLD_WIDTH = 5200;
  const MAX_CAMERA_X = WORLD_WIDTH - WIDTH;
  const CAMERA_SCROLL_SPEED = 3.12;
  const UI_FONT = '"Trebuchet MS", "Segoe UI", Arial, sans-serif';
  const ASSET_ROOT = "./public/assets/";
  const MENU_VIDEO_SRC = "./public/assets/07-screens/menu-background-video.mp4?v=20260702-27";
  const TARGET_TYPES = ["scout", "rocket", "cargo", "spinner", "zigzag"];
  const TARGET_STATES = ["flight", "fear", "hit", "captured"];
  const BONUS_POINTS = {
    satellite: 55,
    capsule: 70,
    cargo: 45,
    balloon: 40,
  };
  const NUMBER_OFFSETS = {
    scout: { flight: [39, 8], fear: [1, 11], hit: [20, 9], captured: [-24, 5] },
    rocket: { flight: [61, 16], fear: [11, 14], hit: [21, -13], captured: [-33, -5] },
    cargo: { flight: [22, 7], fear: [-4, 12], hit: [11, -4], captured: [-33, 8] },
    spinner: { flight: [29, 22], fear: [-3, 23], hit: [8, -12], captured: [-40, -3] },
    zigzag: { flight: [47, 15], fear: [5, 18], hit: [19, -7], captured: [-30, -3] },
  };
  const TEEN_TY_NUMBERS = [13, 30, 14, 40, 15, 50, 16, 60, 17, 70, 18, 80, 19, 90];
  const MISSIONS = [
    {
      id: "basics",
      title: "BASICS",
      subtitle: "NUMBERS 1-20",
      type: "standard",
      min: 1,
      max: 20,
      duration: 90,
      targetScore: 1000,
      replays: 99,
    },
    {
      id: "full-range",
      title: "FULL RANGE",
      subtitle: "NUMBERS 1-99",
      type: "standard",
      min: 1,
      max: 99,
      duration: 90,
      targetScore: 1550,
      replays: 99,
    },
    {
      id: "teen-vs-ty",
      title: "TEEN VS TY",
      subtitle: "13 OR 30?",
      type: "teenTy",
      pool: TEEN_TY_NUMBERS,
      duration: 90,
      targetScore: 1450,
      replays: 5,
    },
    {
      id: "audio-only",
      title: "AUDIO ONLY",
      subtitle: "LISTEN CLOSELY",
      type: "audio",
      min: 1,
      max: 99,
      duration: 90,
      targetScore: 1500,
      replays: 3,
    },
    {
      id: "memory-chain",
      title: "MEMORY CHAIN",
      subtitle: "3 SIGNALS",
      type: "memory",
      min: 1,
      max: 99,
      duration: 90,
      requiredChains: 4,
      replays: 3,
    },
    {
      id: "final-exam",
      title: "FINAL EXAM",
      subtitle: "3 LIVES / 1 REPLAY",
      type: "exam",
      min: 1,
      max: 99,
      duration: 90,
      targetScore: 1850,
      replays: 1,
      lives: 3,
    },
  ];

  const ONES = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  function numberToWords(value) {
    if (value < 20) return ONES[value];
    const tens = Math.floor(value / 10);
    const ones = value % 10;
    return ones ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(from, to, amount) {
    return from + (to - from) * amount;
  }

  function randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }

  function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  function roundedRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  class AudioDirector {
    constructor() {
      this.enabled = window.localStorage.getItem("numbernauts-audio-enabled") !== "false";
      this.volumes = {
        master: this.loadVolume("master", 0.85),
        music: this.loadVolume("music", 0.55),
        voice: this.loadVolume("voice", 0.95),
        effects: this.loadVolume("effects", 0.8),
      };
      this.mutedChannels = {
        music: window.localStorage.getItem("numbernauts-muted-music") === "true",
      };
      this.context = null;
      this.voice = null;
      this.sounds = {};
      this.music = new Audio();
      this.music.loop = true;
      this.music.preload = "auto";
      this.musicBlocked = false;
      this.music.addEventListener("playing", () => this.reportMusicState("playing"));
      this.music.addEventListener("pause", () => this.reportMusicState("paused"));
      this.music.addEventListener("error", () => this.reportMusicState("error"));
      this.applyMusicVolume();
      this.refreshVoices();
      if ("speechSynthesis" in window) {
        window.speechSynthesis.addEventListener("voiceschanged", () => this.refreshVoices());
      }
    }

    loadVolume(channel, fallback) {
      const stored = window.localStorage.getItem(`numbernauts-volume-${channel}`);
      if (stored === null) return fallback;
      const saved = Number(stored);
      return Number.isFinite(saved) ? clamp(saved, 0, 1) : fallback;
    }

    setVolume(channel, value) {
      if (!(channel in this.volumes)) return;
      this.volumes[channel] = clamp(value, 0, 1);
      window.localStorage.setItem(`numbernauts-volume-${channel}`, String(this.volumes[channel]));
      this.applyMusicVolume();
    }

    effectiveVolume(channel) {
      if (!this.enabled || this.mutedChannels[channel]) return 0;
      return this.volumes.master * this.volumes[channel];
    }

    isChannelMuted(channel) {
      return Boolean(this.mutedChannels[channel]);
    }

    toggleChannel(channel) {
      if (!(channel in this.mutedChannels)) return false;
      this.mutedChannels[channel] = !this.mutedChannels[channel];
      window.localStorage.setItem(`numbernauts-muted-${channel}`, String(this.mutedChannels[channel]));
      this.applyMusicVolume();
      return this.mutedChannels[channel];
    }

    applyMusicVolume() {
      this.music.volume = this.effectiveVolume("music");
      if (!this.enabled || this.mutedChannels.music || this.music.volume === 0) this.reportMusicState("muted");
      this.applyEffectsVolume();
    }

    applyEffectsVolume() {
      const volume = this.effectiveVolume("effects");
      Object.values(this.sounds).forEach((sound) => {
        sound.pool.forEach((audio) => {
          audio.volume = volume;
        });
      });
    }

    reportMusicState(state) {
      document.documentElement.dataset.musicState = state;
    }

    setMusicSource(source) {
      this.music.src = source || "";
      this.music.load();
      this.reportMusicState(source ? "ready" : "empty");
    }

    setSoundSources(files) {
      this.sounds = {};
      Object.entries(files).forEach(([key, source]) => {
        const pool = Array.from({ length: 4 }, () => {
          const audio = new Audio(source);
          audio.preload = "auto";
          audio.volume = this.effectiveVolume("effects");
          return audio;
        });
        this.sounds[key] = { pool, index: 0 };
      });
    }

    playEffect(key) {
      const sound = this.sounds[key];
      if (!sound || !this.enabled || this.effectiveVolume("effects") <= 0) return false;
      const audio = sound.pool[sound.index % sound.pool.length];
      sound.index += 1;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = this.effectiveVolume("effects");
      audio.play().catch(() => {});
      return true;
    }

    playMusic() {
      if (!this.music.src || !this.enabled || this.mutedChannels.music || this.music.volume === 0) {
        this.reportMusicState("muted");
        return;
      }
      this.music
        .play()
        .then(() => {
          this.musicBlocked = false;
          this.reportMusicState("playing");
        })
        .catch(() => {
          this.musicBlocked = true;
          this.reportMusicState("awaiting-gesture");
        });
    }

    pauseMusic() {
      this.music.pause();
    }

    stopMusic() {
      this.music.pause();
      this.music.currentTime = 0;
    }

    refreshVoices() {
      if (!("speechSynthesis" in window)) return;
      const voices = window.speechSynthesis.getVoices();
      this.voice =
        voices.find((voice) => voice.lang === "en-US" && /natural|zira|aria|samantha/i.test(voice.name)) ||
        voices.find((voice) => voice.lang === "en-US") ||
        voices.find((voice) => voice.lang.startsWith("en")) ||
        null;
    }

    unlock() {
      if (!this.context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) this.context = new AudioContext();
      }
      if (this.context && this.context.state === "suspended") this.context.resume();
    }

    toggle() {
      this.enabled = !this.enabled;
      window.localStorage.setItem("numbernauts-audio-enabled", String(this.enabled));
      this.applyMusicVolume();
      if (!this.enabled && "speechSynthesis" in window) window.speechSynthesis.cancel();
      return this.enabled;
    }

    speakNumber(number) {
      if (!this.enabled || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(numberToWords(number));
      utterance.lang = "en-US";
      utterance.rate = 0.82;
      utterance.pitch = 1.04;
      utterance.volume = this.effectiveVolume("voice");
      if (this.voice) utterance.voice = this.voice;
      window.speechSynthesis.speak(utterance);
    }

    speakSequence(numbers) {
      if (!this.enabled || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(numbers.map(numberToWords).join(", "));
      utterance.lang = "en-US";
      utterance.rate = 0.72;
      utterance.pitch = 1.04;
      utterance.volume = this.effectiveVolume("voice");
      if (this.voice) utterance.voice = this.voice;
      window.speechSynthesis.speak(utterance);
    }

    stopSpeech() {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    }

    tone(frequency, duration, type, volume, delay) {
      if (!this.enabled || !this.context) return;
      const mixedVolume = (volume || 0.08) * this.effectiveVolume("effects");
      if (mixedVolume <= 0) return;
      const start = this.context.currentTime + (delay || 0);
      const oscillator = this.context.createOscillator();
      const gain = this.context.createGain();
      oscillator.type = type || "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(mixedVolume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(this.context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.03);
    }

    shot() {
      this.tone(170, 0.08, "sine", 0.055, 0);
      this.tone(290, 0.1, "triangle", 0.04, 0.025);
    }

    correct() {
      if (this.playEffect("correct")) return;
      this.tone(520, 0.12, "sine", 0.07, 0);
      this.tone(690, 0.14, "sine", 0.065, 0.09);
      this.tone(880, 0.18, "triangle", 0.055, 0.18);
    }

    wrong() {
      if (this.playEffect("wrong")) return;
      this.tone(220, 0.13, "sawtooth", 0.035, 0);
      this.tone(160, 0.18, "triangle", 0.045, 0.11);
    }

    bonusPickup() {
      if (this.playEffect("bonusPickup")) return;
      this.tone(740, 0.12, "sine", 0.065, 0);
      this.tone(990, 0.14, "triangle", 0.055, 0.08);
    }

    overheat() {
      if (this.playEffect("overheat")) return;
      this.tone(160, 0.18, "sawtooth", 0.045, 0);
      this.tone(120, 0.26, "triangle", 0.035, 0.12);
    }

    burst() {
      [300, 420, 560, 720, 920].forEach((frequency, index) => {
        this.tone(frequency, 0.28, "sine", 0.055, index * 0.055);
      });
    }
  }

  class NumbernautsGame {
    constructor() {
      this.canvas = document.createElement("canvas");
      this.canvas.width = WIDTH;
      this.canvas.height = HEIGHT;
      this.canvas.tabIndex = 0;
      this.canvas.setAttribute("role", "application");
      this.canvas.setAttribute("aria-label", "Numbernauts 99 game canvas");
      this.canvas.style.cursor = "none";
      this.context = this.canvas.getContext("2d", { alpha: false });
      document.querySelector("#game").appendChild(this.canvas);

      this.images = {};
      this.menuVideo = this.createMenuVideo();
      this.worldLayerCache = new Map();
      this.audio = new AudioDirector();
      this.mode = "loading";
      this.pointer = { x: WIDTH / 2, y: HEIGHT / 2, active: false };
      this.targets = [];
      this.bonuses = [];
      this.decorations = [];
      this.effects = [];
      this.promptNumber = 74;
      this.promptLocked = false;
      this.score = 0;
      this.bestScore = Number(window.localStorage.getItem("numbernauts-best") || 0);
      this.campaignProgress = this.loadCampaignProgress();
      this.activeRun = this.loadActiveRun();
      this.selectedMissionIndex = 0;
      this.currentMission = null;
      this.missionPassed = false;
      this.missionStars = 0;
      this.missionErrors = 0;
      this.lives = 0;
      this.replaysRemaining = 0;
      this.memorySequence = [];
      this.memoryIndex = 0;
      this.chainsCompleted = 0;
      this.combo = 0;
      this.energy = 0;
      this.heat = 0;
      this.roundLength = 90;
      this.roundRemaining = 90;
      this.echoUntil = 0;
      this.weaponFireUntil = 0;
      this.overheatUntil = 0;
      this.nextPromptAt = 0;
      this.repeatPromptAt = 0;
      this.missionCompleteAt = 0;
      this.lastRunSaveAt = 0;
      this.feedback = null;
      this.settingsOpen = false;
      this.activeSlider = null;
      this.cursorDown = false;
      this.cursorPulseUntil = 0;
      this.lastFrame = performance.now();
      this.worldTime = 0;
      this.cameraX = MAX_CAMERA_X / 2;
      this.cameraTargetX = MAX_CAMERA_X / 2;
      this.screenShake = 0;

      this.bindInput();
      this.loadAssets();
    }

    createMenuVideo() {
      const video = document.createElement("video");
      video.src = MENU_VIDEO_SRC;
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-hidden", "true");
      video.load();
      video.play().catch(() => {});
      return video;
    }

    loadCampaignProgress() {
      try {
        const saved = JSON.parse(window.localStorage.getItem("numbernauts-campaign") || "null");
        return {
          unlocked: clamp(Number(saved?.unlocked) || 0, 0, MISSIONS.length - 1),
          stars: saved?.stars && typeof saved.stars === "object" ? saved.stars : {},
        };
      } catch (_error) {
        return { unlocked: 0, stars: {} };
      }
    }

    saveCampaignProgress() {
      window.localStorage.setItem("numbernauts-campaign", JSON.stringify(this.campaignProgress));
    }

    loadActiveRun() {
      try {
        const saved = JSON.parse(window.localStorage.getItem("numbernauts-active-run") || "null");
        if (!saved || !MISSIONS.some((mission) => mission.id === saved.missionId)) return null;
        return saved;
      } catch (_error) {
        return null;
      }
    }

    saveActiveRun() {
      if (!this.currentMission || !["playing", "paused"].includes(this.mode)) return;
      this.activeRun = {
        missionId: this.currentMission.id,
        score: this.score,
        combo: this.combo,
        energy: this.energy,
        roundRemaining: Math.max(1, this.roundRemaining),
        missionErrors: this.missionErrors,
        lives: this.lives,
        replaysRemaining: this.replaysRemaining,
        chainsCompleted: this.chainsCompleted,
        cameraX: this.cameraX,
        savedAt: Date.now(),
      };
      window.localStorage.setItem("numbernauts-active-run", JSON.stringify(this.activeRun));
      this.lastRunSaveAt = performance.now();
    }

    clearActiveRun() {
      this.activeRun = null;
      window.localStorage.removeItem("numbernauts-active-run");
    }

    assetMap() {
      const files = {
        keyArt: "00-key-art/numbernauts-key-art.png",
        bg1: "01-background/layer-01-sky.png",
        bg2: "01-background/layer-02-distant-stations.png",
        bg3: "01-background/layer-03-midground-city.png",
        bg4: "01-background/layer-04-near-decks.png",
        bg5: "01-background/layer-05-foreground-atmosphere.png",
        weaponIdle: "03-echo-magnet/idle.png",
        weaponCharging: "03-echo-magnet/charging.png",
        weaponFiring: "03-echo-magnet/firing.png",
        weaponOverheated: "03-echo-magnet/overheated.png",
        effectReticle: "05-effects/reticle.png",
        effectSoundWave: "05-effects/sound-wave.png",
        effectCorrect: "05-effects/correct-hit.png",
        effectWrong: "05-effects/wrong-puff.png",
        effectVortex: "05-effects/capture-vortex.png",
        effectCombo: "05-effects/combo-flare.png",
        effectSteam: "05-effects/overheat-steam.png",
        effectParticles: "05-effects/energy-particles.png",
        effectCharge: "05-effects/charge-ring.png",
        pauseButton: "06-ui/pause-button.png",
        replayButton: "06-ui/replay-audio.png",
        menuHandCursor: "06-ui/menu-hand-cursor.png",
        menuLogo: "06-ui/menu-overlays/menu-logo.png",
        menuPlay: "06-ui/menu-overlays/menu-play.png",
        menuSoundButton: "06-ui/menu-overlays/menu-sound.png",
        menuSettingsButton: "06-ui/menu-overlays/menu-settings.png",
        menuBeacon: "06-ui/menu-overlays/menu-beacon.png",
        hudTimerIcon: "06-ui/hud-icons/hud-timer.png",
        hudSoundIcon: "06-ui/hud-icons/hud-sound.png",
        decorationSatellite: "04-world-objects/satellite.png",
        decorationCargo: "04-world-objects/cargo-skiff.png",
        decorationBalloon: "04-world-objects/navigation-balloon.png",
        decorationCapsule: "04-world-objects/time-capsule.png",
        decorationMoon: "04-world-objects/moon.png",
        decorationPlanet: "04-world-objects/ringed-planet.png",
        decorationPassenger: "04-world-objects/passenger-shuttle.png",
        decorationSignRect: "04-world-objects/sign-rectangle.png",
        decorationSignRound: "04-world-objects/sign-round.png",
        bonusSatellite: "04-world-objects/bonus-icons/bonus-satellite.png",
        bonusCapsule: "04-world-objects/bonus-icons/bonus-capsule.png",
        bonusCargo: "04-world-objects/bonus-icons/bonus-cargo.png",
        bonusBalloon: "04-world-objects/bonus-icons/bonus-balloon.png",
      };
      TARGET_TYPES.forEach((type) => {
        TARGET_STATES.forEach((state) => {
          files[`${type}-${state}`] = `02-characters/${type}/${state}.png`;
        });
      });
      return files;
    }

    async loadAssets() {
      const files = Object.entries(this.assetMap());
      let completed = 0;
      const status = document.querySelector("#loading span");
      await Promise.all(
        files.map(
          ([key, path]) =>
            new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => {
                this.images[key] = image;
                completed += 1;
                if (status) status.textContent = `Preparing skyport... ${Math.round((completed / files.length) * 100)}%`;
                resolve();
              };
              image.onerror = () => reject(new Error(`Unable to load ${path}`));
              image.src = ASSET_ROOT + path;
            }),
        ),
      );
      document.querySelector("#loading")?.classList.add("is-hidden");
      this.audio.setMusicSource("./public/audio/menu-theme.mp3");
      this.audio.setSoundSources({
        correct: "./public/audio/sfx/correct-hit.mp3",
        wrong: "./public/audio/sfx/wrong-hit.mp3",
        bonusPickup: "./public/audio/sfx/bonus-pickup.mp3",
        overheat: "./public/audio/sfx/overheat.mp3",
      });
      this.mode = "menu";
      this.createDecorations();
      this.syncMusic();
      requestAnimationFrame((time) => this.frame(time));
    }

    bindInput() {
      const updatePointer = (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.pointer.x = ((event.clientX - rect.left) / rect.width) * WIDTH;
        this.pointer.y = ((event.clientY - rect.top) / rect.height) * HEIGHT;
        this.pointer.active = true;
      };
      this.canvas.addEventListener("pointermove", (event) => {
        updatePointer(event);
        if (this.activeSlider) {
          const isMenuMusic = this.mode === "menu" && !this.settingsOpen && this.activeSlider === "music";
          this.updateMixerVolume(this.activeSlider, this.pointer.x, isMenuMusic ? 1238 : 700, isMenuMusic ? 286 : 300);
        }
      });
      this.canvas.addEventListener("pointerdown", (event) => {
        updatePointer(event);
        this.canvas.setPointerCapture?.(event.pointerId);
        this.cursorDown = true;
        this.cursorPulseUntil = performance.now() + 180;
        this.audio.unlock();
        if (this.mode === "menu") this.syncMusic();
        this.handlePointerDown();
        this.syncMusic();
      });
      this.canvas.addEventListener("pointerup", () => {
        this.activeSlider = null;
        this.cursorDown = false;
      });
      this.canvas.addEventListener("pointercancel", () => {
        this.activeSlider = null;
        this.cursorDown = false;
      });
      this.canvas.addEventListener("pointerleave", () => {
        if (this.mode !== "playing") this.pointer.active = false;
      });
      window.addEventListener("keydown", (event) => this.handleKey(event));
      window.addEventListener("blur", () => {
        if (this.mode === "playing") this.pauseGame();
      });
      window.addEventListener("pagehide", () => this.saveActiveRun());
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.saveActiveRun();
          this.audio.pauseMusic();
          this.syncMenuVideo();
        } else {
          this.syncMusic();
        }
      });
    }

    handleKey(event) {
      if (["Enter", " "].includes(event.key) && this.mode === "menu" && !this.settingsOpen) {
        event.preventDefault();
        this.audio.unlock();
        this.showCampaign();
      } else if (event.key === "Enter" && this.mode === "campaign") {
        this.startMission(this.campaignProgress.unlocked);
      } else if (event.key === "Escape") {
        if (this.mode === "playing") this.pauseGame();
        else if (this.mode === "paused") this.resumeGame();
        else if (this.mode === "campaign") this.goToMenu();
        else if (this.settingsOpen) this.settingsOpen = false;
      } else if ((event.key === "r" || event.key === "R") && this.mode === "playing") {
        this.replayPrompt();
      } else if (event.key === "Enter" && this.mode === "results") {
        this.handleResultsPrimaryAction();
      }
    }

    handlePointerDown() {
      const x = this.pointer.x;
      const y = this.pointer.y;
      if (this.mode === "menu") {
        if (this.settingsOpen) {
          const slider = this.mixerSliderAt(x, y);
          if (distance(x, y, 1040, 370) <= 30) this.audio.toggleChannel("music");
          else if (slider) {
            this.activeSlider = slider;
            this.updateMixerVolume(slider, x);
          } else if (this.inside(x, y, 480, 700, 200, 78)) this.audio.toggle();
          else if (this.inside(x, y, 700, 700, 200, 78)) this.roundLength = this.roundLength === 90 ? 60 : 90;
          else if (this.inside(x, y, 920, 700, 200, 78)) this.settingsOpen = false;
          return;
        }
        if (distance(x, y, 1182, 842) <= 30) {
          this.toggleMenuMusic();
        } else if (this.inside(x, y, 1230, 820, 310, 58)) {
          this.activeSlider = "music";
          this.updateMixerVolume("music", x, 1238, 286);
        } else if (this.inside(x, y, 26, 810, 270, 66)) window.open("https://vk.com/deandal", "_blank", "noopener,noreferrer");
        else if (distance(x, y, 800, 640) < 120) this.showCampaign();
        else if (distance(x, y, 1446, 67) < 54) this.audio.toggle();
        else if (distance(x, y, 1535, 67) < 54) this.settingsOpen = true;
        return;
      }

      if (this.mode === "campaign") {
        if (this.inside(x, y, 42, 38, 190, 62)) {
          this.goToMenu();
          return;
        }
        for (let index = 0; index < MISSIONS.length; index += 1) {
          const rect = this.missionCardRect(index);
          if (this.inside(x, y, rect.x, rect.y, rect.width, rect.height) && index <= this.campaignProgress.unlocked) {
            this.startMission(index);
            return;
          }
        }
        if (this.inside(x, y, 595, 764, 410, 74)) this.startFreeFlight();
        return;
      }

      if (this.mode === "playing") {
        if (distance(x, y, 1542, 60) < 48) {
          this.pauseGame();
          return;
        }
        if (distance(x, y, 420, 63) < 42) {
          this.replayPrompt();
          return;
        }
        this.fireAt(x, y);
        return;
      }

      if (this.mode === "paused") {
        if (this.inside(x, y, 610, 370, 380, 78)) this.resumeGame();
        else if (this.inside(x, y, 610, 472, 380, 78)) this.restartRound();
        else if (this.inside(x, y, 610, 574, 380, 78)) this.showCampaign();
        return;
      }

      if (this.mode === "results") {
        if (this.inside(x, y, 525, 610, 550, 86)) this.handleResultsPrimaryAction();
        else if (this.inside(x, y, 650, 718, 300, 68)) this.showCampaign();
      }
    }

    inside(x, y, left, top, width, height) {
      return x >= left && x <= left + width && y >= top && y <= top + height;
    }

    syncMusic() {
      if (this.mode === "menu" && document.visibilityState !== "hidden") this.audio.playMusic();
      else this.audio.pauseMusic();
      this.syncMenuVideo();
    }

    syncMenuVideo() {
      if (!this.menuVideo) return;
      if (this.mode === "menu" && document.visibilityState !== "hidden") {
        this.menuVideo.muted = true;
        this.menuVideo.volume = 0;
        if (this.menuVideo.paused) this.menuVideo.play().catch(() => {});
      } else {
        this.menuVideo.pause();
      }
    }

    mixerSliderAt(x, y) {
      if (x < 670 || x > 1035) return null;
      const rows = [
        ["master", 260],
        ["music", 370],
        ["voice", 480],
        ["effects", 590],
      ];
      return rows.find(([, rowY]) => Math.abs(y - rowY) <= 38)?.[0] || null;
    }

    updateMixerVolume(channel, pointerX, trackX = 700, trackWidth = 300) {
      const value = clamp((pointerX - trackX) / trackWidth, 0, 1);
      this.audio.setVolume(channel, value);
      if (channel === "music" && value > 0 && this.audio.isChannelMuted("music")) this.audio.toggleChannel("music");
      if (channel === "music" && value > 0 && !this.audio.enabled) this.audio.toggle();
      if (channel === "music") this.syncMusic();
    }

    toggleMenuMusic() {
      if (!this.audio.enabled) {
        this.audio.toggle();
        if (this.audio.isChannelMuted("music")) this.audio.toggleChannel("music");
      } else {
        this.audio.toggleChannel("music");
      }
      this.syncMusic();
    }

    createDecorations() {
      this.decorations = [
        { key: "decorationPlanet", x: 285, y: 145, speed: -2, scale: 0.34, phase: 0.2, depth: 0.22 },
        { key: "decorationSatellite", x: 720, y: 215, speed: -14, scale: 0.24, phase: 0.3, depth: 0.62 },
        { key: "decorationCargo", x: 1120, y: 340, speed: 20, scale: 0.2, phase: 1.8, depth: 0.78 },
        { key: "decorationMoon", x: 1540, y: 130, speed: -4, scale: 0.22, phase: 2.4, depth: 0.28 },
        { key: "decorationBalloon", x: 1980, y: 430, speed: -6, scale: 0.19, phase: 3.1, depth: 0.7 },
        { key: "decorationPassenger", x: 2480, y: 250, speed: 17, scale: 0.19, phase: 4.2, depth: 0.58 },
        { key: "decorationSignRect", x: 2920, y: 560, speed: 0, scale: 0.22, phase: 5.1, depth: 0.92 },
        { key: "decorationSignRound", x: 3340, y: 350, speed: 0, scale: 0.18, phase: 2.7, depth: 0.82 },
        { key: "decorationPlanet", x: 3860, y: 180, speed: -3, scale: 0.28, phase: 3.4, depth: 0.25 },
        { key: "decorationCargo", x: 4240, y: 610, speed: 12, scale: 0.18, phase: 1.2, depth: 0.94 },
        { key: "decorationSatellite", x: 4680, y: 295, speed: -11, scale: 0.22, phase: 5.8, depth: 0.68 },
        { key: "decorationBalloon", x: 5050, y: 470, speed: -5, scale: 0.18, phase: 4.6, depth: 0.76 },
      ];
    }

    createBonuses() {
      const now = performance.now();
      this.bonuses = [
        { type: "satellite", key: "bonusSatellite", x: 510, y: 185, scale: 0.28, radius: 62, nextAt: now + 5600, visibleUntil: 0, phase: 0.2 },
        { type: "capsule", key: "bonusCapsule", x: 1280, y: 535, scale: 0.27, radius: 60, nextAt: now + 9800, visibleUntil: 0, phase: 1.4 },
        { type: "cargo", key: "bonusCargo", x: 2140, y: 300, scale: 0.26, radius: 62, nextAt: now + 7600, visibleUntil: 0, phase: 2.2 },
        { type: "balloon", key: "bonusBalloon", x: 3090, y: 420, scale: 0.28, radius: 66, nextAt: now + 12400, visibleUntil: 0, phase: 3.5 },
        { type: "satellite", key: "bonusSatellite", x: 3860, y: 235, scale: 0.27, radius: 62, nextAt: now + 14600, visibleUntil: 0, phase: 4.6 },
        { type: "capsule", key: "bonusCapsule", x: 4660, y: 505, scale: 0.26, radius: 60, nextAt: now + 17200, visibleUntil: 0, phase: 5.5 },
      ];
    }

    showCampaign() {
      this.saveActiveRun();
      this.mode = "campaign";
      this.settingsOpen = false;
      this.targets.length = 0;
      this.effects.length = 0;
      this.audio.stopSpeech();
      this.syncMusic();
      this.canvas.style.cursor = "none";
    }

    missionCardRect(index) {
      return {
        x: 240 + (index % 2) * 590,
        y: 184 + Math.floor(index / 2) * 174,
        width: 530,
        height: 144,
      };
    }

    startMission(index, resumeSaved = true) {
      if (index < 0 || index >= MISSIONS.length || index > this.campaignProgress.unlocked) return;
      this.selectedMissionIndex = index;
      this.currentMission = MISSIONS[index];
      const savedRun = resumeSaved && this.activeRun?.missionId === this.currentMission.id ? this.activeRun : null;
      this.startRound(savedRun);
    }

    startFreeFlight() {
      this.currentMission = null;
      this.startRound();
    }

    restartRound() {
      if (this.currentMission) {
        this.clearActiveRun();
        this.startMission(this.selectedMissionIndex, false);
      }
      else this.startFreeFlight();
    }

    handleResultsPrimaryAction() {
      if (this.currentMission && this.missionPassed && this.selectedMissionIndex < MISSIONS.length - 1) {
        this.startMission(this.selectedMissionIndex + 1);
      } else {
        this.restartRound();
      }
    }

    startRound(savedRun = null) {
      this.audio.unlock();
      this.audio.stopSpeech();
      this.mode = "playing";
      this.syncMusic();
      this.settingsOpen = false;
      this.score = 0;
      this.combo = 0;
      this.energy = 0;
      this.heat = 0;
      this.roundRemaining = this.currentMission?.duration || this.roundLength;
      this.missionPassed = false;
      this.missionStars = 0;
      this.missionErrors = 0;
      this.lives = this.currentMission?.lives || 0;
      this.replaysRemaining = this.currentMission?.replays ?? 99;
      this.memorySequence = [];
      this.memoryIndex = 0;
      this.chainsCompleted = 0;
      this.echoUntil = 0;
      this.weaponFireUntil = 0;
      this.overheatUntil = 0;
      this.nextPromptAt = 0;
      this.repeatPromptAt = 0;
      this.missionCompleteAt = 0;
      this.promptLocked = false;
      this.feedback = null;
      this.effects.length = 0;
      this.targets = [];
      this.cameraX = MAX_CAMERA_X / 2;
      this.cameraTargetX = MAX_CAMERA_X / 2;
      this.createBonuses();
      for (let index = 0; index < 22; index += 1) this.targets.push(this.createTarget(index));
      if (savedRun) {
        this.score = Math.max(0, Number(savedRun.score) || 0);
        this.combo = Math.max(0, Number(savedRun.combo) || 0);
        this.energy = clamp(Number(savedRun.energy) || 0, 0, 100);
        this.roundRemaining = clamp(
          Number(savedRun.roundRemaining) || this.roundRemaining,
          1,
          this.currentMission.duration,
        );
        this.missionErrors = Math.max(0, Number(savedRun.missionErrors) || 0);
        this.lives = clamp(Number(savedRun.lives) || this.lives, 0, this.currentMission.lives || 99);
        this.replaysRemaining = clamp(
          Number(savedRun.replaysRemaining) || 0,
          0,
          this.currentMission.replays ?? 99,
        );
        this.chainsCompleted = Math.max(0, Number(savedRun.chainsCompleted) || 0);
        this.cameraX = clamp(Number(savedRun.cameraX) || this.cameraX, 0, MAX_CAMERA_X);
        this.cameraTargetX = this.cameraX;
        this.feedback = { text: "MISSION RESUMED", color: "#62eaff", until: performance.now() + 1100 };
      }
      if (this.currentMission?.type === "memory") this.prepareMemoryChain();
      else this.choosePrompt();
      if (savedRun) this.maybeCompleteMission(performance.now());
      this.saveActiveRun();
      this.canvas.style.cursor = "none";
      this.canvas.focus();
    }

    createTarget(index) {
      const depth = randomBetween(0, 1);
      const direction = Math.random() < 0.5 ? -1 : 1;
      const scale = 0.7 + depth * 0.48;
      return {
        type: TARGET_TYPES[index % TARGET_TYPES.length],
        number: this.randomUnusedNumber(),
        x: randomBetween(120, WORLD_WIDTH - 120),
        y: 165 + depth * 390,
        baseY: 165 + depth * 390,
        vx: direction * randomBetween(55, 105) * (1.32 - depth * 0.22),
        scale,
        phase: randomBetween(0, Math.PI * 2),
        waveSpeed: randomBetween(0.8, 1.6),
        waveHeight: randomBetween(14, 38),
        rotation: 0,
        reaction: null,
        reactionAt: 0,
      };
    }

    resetTarget(target) {
      const depth = randomBetween(0, 1);
      const direction = Math.random() < 0.5 ? -1 : 1;
      target.type = TARGET_TYPES[Math.floor(Math.random() * TARGET_TYPES.length)];
      target.number = this.randomUnusedNumber(target);
      target.x = randomBetween(120, WORLD_WIDTH - 120);
      target.baseY = 165 + depth * 390;
      target.y = target.baseY;
      target.vx = direction * randomBetween(55, 112) * (1.32 - depth * 0.22);
      target.scale = 0.7 + depth * 0.48;
      target.phase = randomBetween(0, Math.PI * 2);
      target.waveSpeed = randomBetween(0.8, 1.6);
      target.waveHeight = randomBetween(14, 38);
      target.rotation = 0;
      target.reaction = null;
      target.reactionAt = 0;
    }

    missionNumberPool() {
      if (this.currentMission?.pool) return this.currentMission.pool.slice();
      const min = this.currentMission?.min || 1;
      const max = this.currentMission?.max || 99;
      return Array.from({ length: max - min + 1 }, (_, index) => min + index);
    }

    randomUnusedNumber(except) {
      const used = new Set(this.targets.filter((target) => target !== except).map((target) => target.number));
      const pool = this.missionNumberPool();
      const available = pool.filter((value) => !used.has(value));
      const source = available.length ? available : pool;
      return source[Math.floor(Math.random() * source.length)];
    }

    ensurePromptTarget(number = this.promptNumber) {
      if (!Number.isFinite(number)) return null;
      const existing = this.targets.find((target) => !target.reaction && target.number === number);
      if (existing) return existing;
      const replacement =
        this.targets.find((target) => !target.reaction) ||
        this.targets.find((target) => target.reaction !== "correct");
      if (!replacement) return null;
      replacement.number = number;
      replacement.reaction = null;
      replacement.reactionAt = 0;
      return replacement;
    }

    screenToWorldX(x) {
      return x + this.cameraX;
    }

    worldToScreenX(x, depth = 1) {
      return x - this.cameraX * depth;
    }

    visibleWorldLeft(padding = 0) {
      return this.cameraX - padding;
    }

    visibleWorldRight(padding = 0) {
      return this.cameraX + WIDTH + padding;
    }

    choosePrompt() {
      const available = this.targets.filter((target) => !target.reaction);
      if (!available.length) return;
      const target = available[Math.floor(Math.random() * available.length)];
      this.promptNumber = target.number;
      this.promptLocked = false;
      this.ensurePromptTarget(this.promptNumber);
      this.audio.speakNumber(this.promptNumber);
    }

    prepareMemoryChain() {
      const available = this.targets.filter((target) => !target.reaction);
      if (available.length < 3) return;
      const visible = available.filter(
        (target) => target.x >= this.visibleWorldLeft(160) && target.x <= this.visibleWorldRight(160),
      );
      const source = visible.length >= 3 ? visible : available;
      const shuffled = source.slice().sort(() => Math.random() - 0.5);
      this.memorySequence = shuffled.slice(0, 3).map((target) => target.number);
      this.memoryIndex = 0;
      this.promptNumber = this.memorySequence[0];
      this.promptLocked = false;
      this.ensurePromptTarget(this.promptNumber);
      this.audio.speakSequence(this.memorySequence);
    }

    replayPrompt() {
      if (this.replaysRemaining <= 0) {
        this.feedback = { text: "NO REPLAYS", color: "#ff775f", until: performance.now() + 700 };
        this.audio.wrong();
        return;
      }
      if (this.replaysRemaining < 90) this.replaysRemaining -= 1;
      if (this.currentMission?.type === "memory") this.audio.speakSequence(this.memorySequence);
      else this.audio.speakNumber(this.promptNumber);
      if (this.replaysRemaining < 90) {
        this.feedback = {
          text: `${this.replaysRemaining} REPLAY${this.replaysRemaining === 1 ? "" : "S"} LEFT`,
          color: "#62eaff",
          until: performance.now() + 650,
        };
      }
    }

    fireAt(x, y) {
      const now = performance.now();
      if (this.promptLocked || now < this.overheatUntil) return;
      const worldX = this.screenToWorldX(x);
      this.audio.shot();
      this.weaponFireUntil = now + 150;
      this.heat = clamp(this.heat + 24, 0, 110);
      const angle = Math.atan2(y - 740, x - WIDTH / 2);
      this.addEffect("effectSoundWave", lerp(WIDTH / 2, x, 0.56), lerp(740, y, 0.56), 0.56, 280, angle);

      if (this.heat >= 100) {
        this.overheatUntil = now + 1500;
        this.addEffect("effectSteam", WIDTH / 2, 670, 0.7, 1100, 0);
        this.feedback = { text: "COOLING", color: "#ffb84d", until: now + 900 };
        this.audio.overheat();
      }

      const bonus = this.bonuses.find(
        (item) => item.visibleUntil > now && distance(worldX, y, item.x, item.y) < item.radius,
      );
      if (bonus) {
        this.hitBonus(bonus, now);
        return;
      }

      const candidates = this.targets
        .filter((target) => !target.reaction)
        .sort((a, b) => b.scale - a.scale);
      const target = candidates.find((item) => distance(worldX, y, item.x, item.y) < 94 * item.scale);
      if (!target) return;
      if (target.number === this.promptNumber) this.correctHit(target, now);
      else this.wrongHit(target, now);
    }

    hitBonus(bonus, now) {
      const points = BONUS_POINTS[bonus.type] || 120;
      this.score += points;
      this.energy = clamp(this.energy + 9, 0, 100);
      this.combo += 1;
      bonus.visibleUntil = 0;
      bonus.nextAt = now + randomBetween(13500, 22000);
      this.screenShake = 4;
      this.audio.bonusPickup();
      this.feedback = { text: `BONUS +${points}`, color: "#62eaff", until: now + 720 };
      this.addEffect("effectCorrect", bonus.x, bonus.y, 0.48, 560, 0, true);
      this.addEffect("effectParticles", this.worldToScreenX(bonus.x), bonus.y, 0.72, 700, 0, false);
      this.maybeCompleteMission(now);
      this.saveActiveRun();
    }

    correctHit(target, now) {
      target.reaction = "correct";
      target.reactionAt = now;
      this.promptLocked = true;
      this.combo += 1;
      const distanceBonus = Math.round((1.2 - target.scale) * 230);
      const echoMultiplier = now < this.echoUntil ? 2 : 1;
      const points = Math.max(80, 150 + distanceBonus + this.combo * 18) * echoMultiplier;
      this.score += Math.round(points);
      this.roundRemaining += 3;
      this.energy = clamp(this.energy + 17 + Math.min(10, this.combo), 0, 100);
      this.screenShake = 8;
      this.audio.correct();
      this.addEffect("effectCorrect", target.x, target.y, 0.78 * target.scale, 620, 0, true);
      this.addEffect("effectVortex", target.x, target.y, 0.5 * target.scale, 720, 0, true);
      if (this.currentMission?.type === "memory") {
        this.memoryIndex += 1;
        if (this.memoryIndex >= this.memorySequence.length) {
          this.chainsCompleted += 1;
          this.feedback = {
            text: `CHAIN ${this.chainsCompleted}/${this.currentMission.requiredChains}  +3 SEC`,
            color: "#ffe04d",
            until: now + 850,
          };
        } else {
          this.feedback = {
            text: `SIGNAL ${this.memoryIndex + 1}/3  +3 SEC`,
            color: "#62eaff",
            until: now + 650,
          };
        }
      } else {
        this.feedback = {
          text: this.combo >= 4 ? `COMBO x${this.combo}  +3 SEC` : "PERFECT  +3 SEC",
          color: "#ffe04d",
          until: now + 700,
        };
      }
      this.nextPromptAt = now + 180;
      if (this.energy >= 100) this.activateEchoBurst(now);
      this.maybeCompleteMission(now);
      this.saveActiveRun();
    }

    wrongHit(target, now) {
      target.reaction = "wrong";
      target.reactionAt = now;
      this.combo = 0;
      this.missionErrors += 1;
      const penalty = Math.ceil(this.score * 0.25);
      this.score = Math.max(0, this.score - penalty);
      this.screenShake = 3;
      this.audio.wrong();
      this.addEffect("effectWrong", target.x, target.y, 0.58 * target.scale, 520, 0, true);
      if (this.currentMission?.type === "exam") {
        this.lives = Math.max(0, this.lives - 1);
        this.feedback = {
          text: this.lives ? `${this.lives} LIVES LEFT` : "SIGNAL LOST",
          color: "#ff775f",
          until: now + 750,
        };
        if (this.lives === 0) this.endRound();
      } else {
        this.feedback = { text: penalty ? `WRONG -${penalty}` : "TRY AGAIN", color: "#ff775f", until: now + 650 };
        if (["standard", "teenTy"].includes(this.currentMission?.type) || !this.currentMission) {
          this.repeatPromptAt = now + 470;
        }
      }
      this.saveActiveRun();
    }

    missionGoalReached() {
      if (!this.currentMission) return false;
      if (this.currentMission.type === "memory") return this.chainsCompleted >= this.currentMission.requiredChains;
      return this.score >= this.currentMission.targetScore;
    }

    maybeCompleteMission(now) {
      if (!this.missionGoalReached() || this.missionCompleteAt) return;
      this.evaluateMissionResult();
      if (!this.missionPassed) return;
      this.missionCompleteAt = now + 760;
      this.promptLocked = true;
      this.nextPromptAt = 0;
      this.repeatPromptAt = 0;
      this.feedback = { text: "MISSION COMPLETE", color: "#ffe04d", until: now + 900 };
    }

    activateEchoBurst(now) {
      this.energy = 0;
      this.echoUntil = now + 4200;
      this.feedback = { text: "ECHO TIME x2", color: "#62eaff", until: now + 1200 };
      this.addEffect("effectCharge", WIDTH / 2, HEIGHT / 2, 1.8, 1200, 0);
      this.addEffect("effectParticles", WIDTH / 2, HEIGHT / 2, 2.2, 1500, 0);
      this.audio.burst();
    }

    pauseGame() {
      if (this.mode !== "playing") return;
      this.mode = "paused";
      this.saveActiveRun();
      this.audio.stopSpeech();
      this.canvas.style.cursor = "none";
    }

    resumeGame() {
      if (this.mode !== "paused") return;
      this.mode = "playing";
      this.canvas.style.cursor = "none";
      this.lastFrame = performance.now();
    }

    goToMenu() {
      this.mode = "menu";
      this.settingsOpen = false;
      this.targets.length = 0;
      this.effects.length = 0;
      this.audio.stopSpeech();
      this.syncMusic();
      this.canvas.style.cursor = "none";
    }

    endRound() {
      if (this.mode !== "playing") return;
      this.evaluateMissionResult();
      this.clearActiveRun();
      this.mode = "results";
      this.promptLocked = true;
      this.audio.stopSpeech();
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        window.localStorage.setItem("numbernauts-best", String(this.bestScore));
      }
      this.feedback = null;
      if (this.missionPassed || !this.currentMission) {
        this.addEffect("effectCombo", WIDTH / 2, 210, 1.35, 2400, 0);
        this.audio.burst();
      } else {
        this.audio.wrong();
      }
      this.canvas.style.cursor = "none";
    }

    evaluateMissionResult() {
      if (!this.currentMission) {
        this.missionPassed = true;
        this.missionStars = 0;
        return;
      }
      const isMemory = this.currentMission.type === "memory";
      const result = isMemory ? this.chainsCompleted : this.score;
      const target = isMemory ? this.currentMission.requiredChains : this.currentMission.targetScore;
      const hasLives = this.currentMission.type !== "exam" || this.lives > 0;
      this.missionPassed = result >= target && hasLives;
      const timeBonus = this.roundRemaining >= this.currentMission.duration * 0.35;
      const accuracyBonus = this.missionErrors <= 1;
      this.missionStars = this.missionPassed ? 1 + Number(timeBonus) + Number(accuracyBonus) : 0;
      if (!this.missionPassed) return;
      const previousStars = Number(this.campaignProgress.stars[this.currentMission.id] || 0);
      this.campaignProgress.stars[this.currentMission.id] = Math.max(previousStars, this.missionStars);
      this.campaignProgress.unlocked = Math.max(
        this.campaignProgress.unlocked,
        Math.min(MISSIONS.length - 1, this.selectedMissionIndex + 1),
      );
      this.saveCampaignProgress();
    }

    addEffect(key, x, y, scale, duration, rotation, world = false) {
      this.effects.push({ key, x, y, scale, duration, rotation, world, born: performance.now() });
    }

    updateBonuses(now) {
      this.bonuses.forEach((bonus) => {
        if (bonus.visibleUntil > now) return;
        if (bonus.visibleUntil && bonus.visibleUntil <= now) {
          bonus.visibleUntil = 0;
          bonus.nextAt = now + randomBetween(12000, 21000);
        }
        if (!bonus.visibleUntil && now >= bonus.nextAt) {
          bonus.visibleUntil = now + 2400;
        }
      });
    }

    frame(time) {
      const delta = clamp((time - this.lastFrame) / 1000, 0, 0.034);
      this.lastFrame = time;
      this.worldTime += delta;
      this.update(delta, time);
      this.draw(time);
      requestAnimationFrame((nextTime) => this.frame(nextTime));
    }

    update(delta, now) {
      this.decorations.forEach((item) => {
        item.x += item.speed * delta;
        if (item.speed > 0 && item.x > WORLD_WIDTH + 180) item.x = -180;
        if (item.speed < 0 && item.x < -180) item.x = WORLD_WIDTH + 180;
      });
      this.effects = this.effects.filter((effect) => now - effect.born < effect.duration);
      this.screenShake = Math.max(0, this.screenShake - delta * 28);

      if (this.mode !== "playing") return;
      const pointerRatio = this.pointer.active ? clamp(this.pointer.x / WIDTH, 0, 1) : 0.5;
      const edgePush = clamp((pointerRatio - 0.5) / 0.32, -1, 1);
      const cameraSpeed = 1900 * CAMERA_SCROLL_SPEED;
      this.cameraTargetX = clamp(this.cameraX + edgePush * delta * cameraSpeed, 0, MAX_CAMERA_X);
      this.cameraX = lerp(this.cameraX, this.cameraTargetX, 1 - Math.pow(0.0002, delta));

      this.roundRemaining -= delta;
      this.heat = Math.max(0, this.heat - delta * 28);
      if (this.missionCompleteAt && now >= this.missionCompleteAt) {
        this.endRound();
        return;
      }
      if (this.roundRemaining <= 0) {
        this.roundRemaining = 0;
        this.endRound();
        return;
      }
      if (this.currentMission && now - this.lastRunSaveAt >= 1000) this.saveActiveRun();

      this.updateBonuses(now);
      this.maybeCompleteMission(now);
      const speedMultiplier = now < this.echoUntil ? 0.38 : 1;
      this.targets.forEach((target) => {
        const reactionAge = now - target.reactionAt;
        if (target.reaction === "wrong" && reactionAge > 620) target.reaction = null;
        if (target.reaction === "correct") return;
        target.x += target.vx * delta * speedMultiplier;
        target.phase += delta * target.waveSpeed * speedMultiplier;
        target.y = target.baseY + Math.sin(target.phase) * target.waveHeight;
        target.rotation = Math.sin(target.phase * 0.72) * 0.055;
        if (target.vx > 0 && target.x > WORLD_WIDTH + 170) target.x = -170;
        if (target.vx < 0 && target.x < -170) target.x = WORLD_WIDTH + 170;
      });
      if (!this.promptLocked) this.ensurePromptTarget(this.promptNumber);

      if (this.nextPromptAt && now >= this.nextPromptAt) {
        const captured = this.targets.find((target) => target.reaction === "correct");
        if (captured) this.resetTarget(captured);
        this.nextPromptAt = 0;
        if (this.currentMission?.type === "memory") {
          if (this.memoryIndex >= this.memorySequence.length) this.prepareMemoryChain();
          else {
            this.promptNumber = this.memorySequence[this.memoryIndex];
            this.promptLocked = false;
            this.ensurePromptTarget(this.promptNumber);
          }
        } else {
          this.choosePrompt();
        }
      }
      if (this.repeatPromptAt && now >= this.repeatPromptAt) {
        this.repeatPromptAt = 0;
        this.audio.speakNumber(this.promptNumber);
      }
    }

    draw(now) {
      const ctx = this.context;
      ctx.save();
      const shakeX = this.screenShake ? randomBetween(-this.screenShake, this.screenShake) : 0;
      const shakeY = this.screenShake ? randomBetween(-this.screenShake * 0.55, this.screenShake * 0.55) : 0;
      ctx.translate(shakeX, shakeY);
      if (this.mode === "menu" || this.settingsOpen) this.drawMenu(now);
      else if (this.mode === "campaign") this.drawCampaign(now);
      else this.drawWorld(now);
      ctx.restore();

      if (this.mode === "paused") this.drawPauseOverlay();
      else if (this.mode === "results") this.drawResultsOverlay(now);
      else if (this.settingsOpen) this.drawSettingsOverlay();
      if (this.pointer.active && this.mode !== "playing") {
        this.drawMenuHandPointer();
      }
    }

    echoPointerState() {
      const x = this.pointer.x;
      const y = this.pointer.y;
      if (this.settingsOpen) {
        if (this.mixerSliderAt(x, y)) return "slider";
        if (distance(x, y, 1040, 370) <= 30) return "hover";
        if (
          this.inside(x, y, 480, 700, 200, 78) ||
          this.inside(x, y, 700, 700, 200, 78) ||
          this.inside(x, y, 920, 700, 200, 78)
        ) {
          return "hover";
        }
        return "idle";
      }
      if (this.mode === "menu") {
        if (this.inside(x, y, 1230, 820, 310, 58)) return "slider";
        if (
          distance(x, y, 1182, 842) <= 30 ||
          this.inside(x, y, 26, 810, 270, 66) ||
          distance(x, y, 800, 640) < 120 ||
          distance(x, y, 1446, 67) < 54 ||
          distance(x, y, 1535, 67) < 54
        ) {
          return "hover";
        }
      } else if (this.mode === "campaign") {
        if (this.inside(x, y, 42, 38, 190, 62) || this.inside(x, y, 595, 764, 410, 74)) return "hover";
        for (let index = 0; index < MISSIONS.length; index += 1) {
          const rect = this.missionCardRect(index);
          if (this.inside(x, y, rect.x, rect.y, rect.width, rect.height)) {
            return index <= this.campaignProgress.unlocked ? "hover" : "locked";
          }
        }
      } else if (this.mode === "paused") {
        if (
          this.inside(x, y, 610, 370, 380, 78) ||
          this.inside(x, y, 610, 472, 380, 78) ||
          this.inside(x, y, 610, 574, 380, 78)
        ) {
          return "hover";
        }
      } else if (this.mode === "results") {
        if (this.inside(x, y, 525, 610, 550, 86) || this.inside(x, y, 650, 718, 300, 68)) return "hover";
      }
      return "idle";
    }

    drawMenuHandPointer() {
      const ctx = this.context;
      const image = this.images.menuHandCursor;
      if (image) {
        const state = this.echoPointerState();
        const width = 110;
        const height = width * (image.height / image.width);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.globalAlpha = state === "locked" ? 0.72 : 1;
        ctx.drawImage(image, this.pointer.x - width * 0.15, this.pointer.y - height * 0.035, width, height);
        ctx.restore();
        return;
      }
      const state = this.echoPointerState();
      const active = state === "hover" || state === "slider";
      const outline = active ? "#ffd23f" : "#ff9d2e";

      ctx.save();
      ctx.translate(this.pointer.x, this.pointer.y);
      ctx.rotate(-0.34);
      ctx.scale(0.72, 0.72);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = 15;
      ctx.shadowOffsetY = 8;

      ctx.strokeStyle = "rgba(10, 23, 34, 0.95)";
      ctx.lineWidth = 15;
      roundedRect(ctx, -23, 0, 46, 132, 23);
      ctx.stroke();
      roundedRect(ctx, -70, 118, 132, 92, 30);
      ctx.stroke();
      roundedRect(ctx, -60, 195, 132, 54, 18);
      ctx.stroke();

      ctx.shadowColor = "#ff9d2e";
      ctx.shadowBlur = 16;
      ctx.strokeStyle = outline;
      ctx.lineWidth = 8;
      roundedRect(ctx, -23, 0, 46, 132, 23);
      ctx.stroke();
      roundedRect(ctx, -70, 118, 132, 92, 30);
      ctx.stroke();
      roundedRect(ctx, -60, 195, 132, 54, 18);
      ctx.stroke();
      ctx.shadowColor = "transparent";

      const fingerFill = ctx.createLinearGradient(0, 0, 0, 132);
      fingerFill.addColorStop(0, "#fffdf5");
      fingerFill.addColorStop(0.52, "#f1e7d7");
      fingerFill.addColorStop(1, "#d9d0c7");
      roundedRect(ctx, -23, 0, 46, 132, 23);
      ctx.fillStyle = fingerFill;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(65, 55, 48, 0.45)";
      ctx.stroke();

      const palmFill = ctx.createLinearGradient(-70, 118, 62, 210);
      palmFill.addColorStop(0, "#fff8e8");
      palmFill.addColorStop(0.44, "#f2e7d8");
      palmFill.addColorStop(1, "#d8d0c9");
      roundedRect(ctx, -70, 118, 132, 92, 30);
      ctx.fillStyle = palmFill;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(65, 55, 48, 0.5)";
      ctx.stroke();

      const knuckleFill = ctx.createLinearGradient(0, 82, 0, 156);
      knuckleFill.addColorStop(0, "#ffd23f");
      knuckleFill.addColorStop(1, "#f06a2e");
      [-54, -22, 10, 42].forEach((x, index) => {
        roundedRect(ctx, x, 88 + index * 5, 34, 70 - index * 4, 15);
        ctx.fillStyle = knuckleFill;
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#172432";
        ctx.stroke();
      });

      ctx.fillStyle = "#62eaff";
      roundedRect(ctx, 14, 142, 30, 34, 7);
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#173044";
      ctx.stroke();

      const cuffFill = ctx.createLinearGradient(-60, 195, 72, 249);
      cuffFill.addColorStop(0, "#1b47a9");
      cuffFill.addColorStop(0.48, "#f15a2f");
      cuffFill.addColorStop(1, "#f5b33a");
      roundedRect(ctx, -60, 195, 132, 54, 18);
      ctx.fillStyle = cuffFill;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#172432";
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(-8, 16);
      ctx.lineTo(8, 16);
      ctx.moveTo(-42, 137);
      ctx.lineTo(39, 137);
      ctx.stroke();

      ctx.restore();
    }

    drawEchoPointer(now) {
      const ctx = this.context;
      const state = this.echoPointerState();
      const pressed = this.cursorDown || now < this.cursorPulseUntil;
      const locked = state === "locked";
      const slider = state === "slider";
      const engaged = state === "hover" || slider;
      const primary = engaged ? "#ffd23f" : "#6ef3ff";
      const secondary = "#ff8142";
      const radius = pressed ? 19 : engaged ? 29 : 25;
      const rotation = now / 430;
      const breathe = Math.sin(now / 150) * 2.2;

      ctx.save();
      ctx.translate(this.pointer.x, this.pointer.y);
      ctx.scale(pressed ? 0.9 : 1, pressed ? 0.9 : 1);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 12;
      ctx.strokeStyle = "rgba(8, 15, 22, 0.95)";
      ctx.lineWidth = 11;
      ctx.beginPath();
      ctx.arc(0, 0, radius + breathe, rotation, rotation + 1.18);
      ctx.arc(0, 0, radius + breathe, rotation + Math.PI * 0.82, rotation + Math.PI * 1.4);
      ctx.arc(0, 0, radius + breathe, rotation + Math.PI * 1.63, rotation + Math.PI * 2.08);
      ctx.stroke();

      ctx.shadowColor = primary;
      ctx.shadowBlur = engaged ? 26 : 18;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(0, 0, radius + breathe, rotation, rotation + 1.18);
      ctx.arc(0, 0, radius + breathe, rotation + Math.PI * 0.82, rotation + Math.PI * 1.4);
      ctx.arc(0, 0, radius + breathe, rotation + Math.PI * 1.63, rotation + Math.PI * 2.08);
      ctx.stroke();

      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 8;
      ctx.strokeStyle = "rgba(7, 20, 28, 0.9)";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(-9, 18);
      ctx.lineTo(-24, 42);
      ctx.lineTo(-13, 49);
      ctx.lineTo(1, 23);
      ctx.moveTo(15, -11);
      ctx.lineTo(33, -25);
      ctx.lineTo(41, -13);
      ctx.lineTo(20, -3);
      ctx.moveTo(-15, -11);
      ctx.lineTo(-34, -24);
      ctx.lineTo(-40, -11);
      ctx.lineTo(-20, -3);
      ctx.stroke();

      ctx.shadowColor = secondary;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = secondary;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(-9, 18);
      ctx.lineTo(-24, 42);
      ctx.lineTo(-13, 49);
      ctx.lineTo(1, 23);
      ctx.moveTo(15, -11);
      ctx.lineTo(33, -25);
      ctx.lineTo(41, -13);
      ctx.lineTo(20, -3);
      ctx.moveTo(-15, -11);
      ctx.lineTo(-34, -24);
      ctx.lineTo(-40, -11);
      ctx.lineTo(-20, -3);
      ctx.stroke();
      ctx.shadowColor = "transparent";

      const core = ctx.createRadialGradient(-3, -4, 2, 0, 0, 15);
      core.addColorStop(0, "#fffdf1");
      core.addColorStop(0.45, primary);
      core.addColorStop(1, "#102834");
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = primary;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#fff8e8";
      ctx.fill();

      if (engaged && !slider) {
        ctx.strokeStyle = primary;
        ctx.lineWidth = 4;
        const corner = 37;
        const arm = 12;
        ctx.beginPath();
        ctx.moveTo(-corner + arm, -corner);
        ctx.lineTo(-corner, -corner);
        ctx.lineTo(-corner, -corner + arm);
        ctx.moveTo(corner - arm, -corner);
        ctx.lineTo(corner, -corner);
        ctx.lineTo(corner, -corner + arm);
        ctx.moveTo(-corner, corner - arm);
        ctx.lineTo(-corner, corner);
        ctx.lineTo(-corner + arm, corner);
        ctx.moveTo(corner, corner - arm);
        ctx.lineTo(corner, corner);
        ctx.lineTo(corner - arm, corner);
        ctx.stroke();
      }

      if (slider) {
        ctx.strokeStyle = primary;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-42, 0);
        ctx.lineTo(-27, -10);
        ctx.moveTo(-42, 0);
        ctx.lineTo(-27, 10);
        ctx.moveTo(42, 0);
        ctx.lineTo(27, -10);
        ctx.moveTo(42, 0);
        ctx.lineTo(27, 10);
        ctx.stroke();
      }

      if (!locked) {
        ctx.fillStyle = "#ff7a45";
        ctx.strokeStyle = "rgba(7, 20, 28, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(22, -29);
        ctx.lineTo(36, -19);
        ctx.lineTo(20, -13);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    drawMenu(now) {
      this.drawMenuBackground();
      this.drawMenuVideoCleanupPatch(now);
      this.drawMenuLogo(now);
      this.drawMenuPlayButton(now);
      this.drawMenuTopButtons(now);
      this.context.save();
      if (!this.audio.enabled) {
        this.context.strokeStyle = "#ff5d46";
        this.context.lineWidth = 7;
        this.context.beginPath();
        this.context.moveTo(1422, 42);
        this.context.lineTo(1470, 90);
        this.context.stroke();
      }
      this.context.restore();
      this.drawCreatorLink(now);
      this.drawMenuMusicControl(now);
    }

    drawMenuBackground() {
      const videoReady = this.menuVideo && this.menuVideo.readyState >= 2 && this.menuVideo.videoWidth > 0;
      this.drawCover(videoReady ? this.menuVideo : this.images.keyArt, 0, 0, 1);
      this.context.save();
      const shade = this.context.createLinearGradient(0, 0, 0, HEIGHT);
      shade.addColorStop(0, "rgba(4, 26, 42, 0.02)");
      shade.addColorStop(0.56, "rgba(4, 22, 34, 0.04)");
      shade.addColorStop(1, "rgba(5, 16, 24, 0.12)");
      this.context.fillStyle = shade;
      this.context.fillRect(0, 0, WIDTH, HEIGHT);
      this.context.restore();
    }

    drawMenuVideoCleanupPatch(now) {
      const ctx = this.context;
      const image = this.images.menuBeacon;
      if (image) {
        const width = 128;
        const height = width * (image.height / image.width);
        const x = 1444;
        const y = 724 + Math.sin(now / 900) * 1.5;
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.shadowColor = "rgba(98, 234, 255, 0.46)";
        ctx.shadowBlur = 16;
        ctx.drawImage(image, x - width / 2, y - height / 2, width, height);
        ctx.restore();
        return;
      }

      const x = 1437;
      const y = 744;
      const drift = Math.sin(now / 900) * 1.4;
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.shadowColor = "rgba(255, 255, 255, 0.18)";
      ctx.shadowBlur = 10;

      const mist = ctx.createLinearGradient(x - 60, y - 22, x + 62, y + 20);
      mist.addColorStop(0, "rgba(164, 219, 239, 0)");
      mist.addColorStop(0.22, "rgba(205, 238, 249, 0.58)");
      mist.addColorStop(0.58, "rgba(244, 252, 255, 0.86)");
      mist.addColorStop(1, "rgba(149, 211, 235, 0)");
      ctx.fillStyle = mist;

      ctx.beginPath();
      ctx.ellipse(x - 23 + drift, y + 5, 42, 14, -0.1, 0, Math.PI * 2);
      ctx.ellipse(x + 17 + drift, y, 48, 17, 0.05, 0, Math.PI * 2);
      ctx.ellipse(x + 48 + drift, y + 9, 31, 11, 0.03, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "rgba(100, 186, 218, 0.55)";
      ctx.beginPath();
      ctx.ellipse(x + 14 + drift, y + 12, 62, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawMenuLogo(now) {
      const image = this.images.menuLogo;
      if (image) {
        const ctx = this.context;
        const pulse = 0.5 + Math.sin(now / 520) * 0.5;
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.shadowColor = `rgba(0, 0, 0, ${0.34 + pulse * 0.06})`;
        ctx.shadowBlur = 18;
        ctx.shadowOffsetY = 8;
        ctx.drawImage(image, 355, 108, 890, 390);
        ctx.restore();
        return;
      }

      const ctx = this.context;
      const pulse = 0.5 + Math.sin(now / 520) * 0.5;
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 8;
      roundedRect(ctx, 350, 116, 900, 258, 34);
      const panel = ctx.createLinearGradient(350, 116, 1250, 374);
      panel.addColorStop(0, "rgba(236, 80, 47, 0.84)");
      panel.addColorStop(0.18, "rgba(255, 246, 223, 0.9)");
      panel.addColorStop(0.5, "rgba(242, 91, 52, 0.9)");
      panel.addColorStop(0.82, "rgba(255, 245, 222, 0.9)");
      panel.addColorStop(1, "rgba(218, 62, 41, 0.86)");
      ctx.fillStyle = panel;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = 10;
      ctx.strokeStyle = "#28333c";
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.strokeStyle = `rgba(98, 234, 255, ${0.18 + pulse * 0.22})`;
      ctx.stroke();
      ctx.restore();

      this.drawLogoWord("NUMBERNAUTS", 800, 235, 92, "#fff6e8", "#17212b", 11);
      this.drawLogoWord("99", 800, 336, 128, "#ffc735", "#2a3138", 12);
    }

    drawLogoWord(text, x, y, size, fillColor, strokeColor, lineWidth) {
      const ctx = this.context;
      ctx.save();
      ctx.font = `900 ${size}px ${UI_FONT}`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(0, 0, 0, 0.34)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 5;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.strokeText(text, x, y);
      ctx.fillStyle = fillColor;
      ctx.fillText(text, x, y);
      ctx.globalAlpha = 0.36;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, x - 2, y - size * 0.14);
      ctx.restore();
    }

    drawMenuPlayButton(now) {
      const ctx = this.context;
      const x = 800;
      const y = 640;
      const hovered = this.pointer.active && distance(this.pointer.x, this.pointer.y, x, y) < 120;
      const pulse = 0.5 + Math.sin(now / 300) * 0.5;
      const image = this.images.menuPlay;
      if (image) {
        const size = hovered ? 252 : 238;
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.shadowColor = hovered ? "rgba(255, 203, 69, 0.78)" : "rgba(0, 0, 0, 0.42)";
        ctx.shadowBlur = hovered ? 24 + pulse * 8 : 14;
        ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
        ctx.restore();
        return;
      }

      ctx.save();
      ctx.shadowColor = hovered ? "rgba(255, 203, 69, 0.78)" : "rgba(0, 0, 0, 0.46)";
      ctx.shadowBlur = hovered ? 26 + pulse * 10 : 18;
      ctx.beginPath();
      ctx.arc(x, y, hovered ? 96 : 91, 0, Math.PI * 2);
      ctx.fillStyle = "#d8d2c1";
      ctx.fill();
      ctx.lineWidth = 8;
      ctx.strokeStyle = "#25313a";
      ctx.stroke();

      const buttonFill = ctx.createRadialGradient(x - 24, y - 28, 16, x, y, 82);
      buttonFill.addColorStop(0, "#ff8b5c");
      buttonFill.addColorStop(0.55, "#ee5738");
      buttonFill.addColorStop(1, "#c83326");
      ctx.beginPath();
      ctx.arc(x, y, hovered ? 72 : 67, 0, Math.PI * 2);
      ctx.fillStyle = buttonFill;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#f6c342";
      ctx.stroke();

      ctx.shadowColor = "transparent";
      ctx.beginPath();
      ctx.moveTo(x - 21, y - 35);
      ctx.lineTo(x - 21, y + 35);
      ctx.lineTo(x + 42, y);
      ctx.closePath();
      ctx.fillStyle = "#fffaf0";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(19, 31, 40, 0.48)";
      ctx.stroke();
      ctx.restore();
    }

    drawMenuTopButtons(now) {
      this.drawMenuImageIconButton(this.images.menuSoundButton, 1446, 67, 108, "speaker", now);
      this.drawMenuImageIconButton(this.images.menuSettingsButton, 1535, 67, 108, "gear", now);
    }

    drawMenuImageIconButton(image, x, y, size, fallbackIcon, now) {
      if (!image) {
        this.drawMenuIconButton(x, y, fallbackIcon, now);
        return;
      }
      const ctx = this.context;
      const hovered = this.pointer.active && distance(this.pointer.x, this.pointer.y, x, y) < 54;
      const drawSize = hovered ? size + Math.sin(now / 180) * 2 + 4 : size;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.shadowColor = hovered ? "rgba(98, 234, 255, 0.62)" : "rgba(0, 0, 0, 0.34)";
      ctx.shadowBlur = hovered ? 18 : 10;
      ctx.drawImage(image, x - drawSize / 2, y - drawSize / 2, drawSize, drawSize);
      ctx.restore();
    }

    drawMenuIconButton(x, y, icon, now) {
      const ctx = this.context;
      const hovered = this.pointer.active && distance(this.pointer.x, this.pointer.y, x, y) < 54;
      const pulse = hovered ? Math.sin(now / 180) * 2 : 0;
      ctx.save();
      ctx.shadowColor = hovered ? "rgba(98, 234, 255, 0.7)" : "rgba(0, 0, 0, 0.36)";
      ctx.shadowBlur = hovered ? 20 : 12;
      ctx.beginPath();
      ctx.arc(x, y, 42 + pulse, 0, Math.PI * 2);
      const fill = ctx.createRadialGradient(x - 12, y - 16, 8, x, y, 46);
      fill.addColorStop(0, icon === "gear" ? "#75d8ff" : "#ff8060");
      fill.addColorStop(1, icon === "gear" ? "#164b62" : "#b9362b");
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#25313a";
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#f4efe2";
      ctx.stroke();
      ctx.shadowColor = "transparent";

      ctx.fillStyle = "#fffaf0";
      ctx.strokeStyle = "#fffaf0";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      if (icon === "speaker") {
        ctx.beginPath();
        ctx.moveTo(x - 19, y - 9);
        ctx.lineTo(x - 8, y - 9);
        ctx.lineTo(x + 4, y - 20);
        ctx.lineTo(x + 4, y + 20);
        ctx.lineTo(x - 8, y + 9);
        ctx.lineTo(x - 19, y + 9);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 5, y, 18, -0.72, 0.72);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 11, 0, Math.PI * 2);
        ctx.stroke();
        for (let index = 0; index < 8; index += 1) {
          const angle = (index * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(x + Math.cos(angle) * 19, y + Math.sin(angle) * 19);
          ctx.lineTo(x + Math.cos(angle) * 27, y + Math.sin(angle) * 27);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    drawMenuMusicControl(now) {
      const ctx = this.context;
      const x = 1140;
      const y = 806;
      const width = 434;
      const height = 70;
      const trackX = 1238;
      const trackY = 850;
      const trackWidth = 286;
      const value = this.audio.volumes.music;
      const muted = !this.audio.enabled || this.audio.isChannelMuted("music") || value === 0;
      const controlHovered =
        this.pointer.active &&
        (distance(this.pointer.x, this.pointer.y, 1182, 842) <= 30 ||
          this.inside(this.pointer.x, this.pointer.y, 1230, 820, 310, 58));

      ctx.save();
      ctx.shadowColor = controlHovered ? "rgba(98, 234, 255, 0.72)" : "rgba(0, 0, 0, 0.48)";
      ctx.shadowBlur = controlHovered ? 18 + Math.sin(now / 180) * 3 : 12;
      roundedRect(ctx, x, y, width, height, 8);
      ctx.fillStyle = "rgba(21, 29, 38, 0.94)";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = controlHovered ? "#62eaff" : "#f3efe2";
      ctx.stroke();
      ctx.shadowColor = "transparent";

      roundedRect(ctx, trackX, trackY - 7, trackWidth, 14, 7);
      ctx.fillStyle = "#092735";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(243, 239, 226, 0.8)";
      ctx.stroke();

      const fillWidth = Math.max(1, trackWidth * value);
      roundedRect(ctx, trackX, trackY - 7, fillWidth, 14, 7);
      ctx.fillStyle = muted ? "#65717a" : "#62eaff";
      ctx.shadowColor = muted ? "transparent" : "#62eaff";
      ctx.shadowBlur = muted ? 0 : 10;
      ctx.fill();
      ctx.shadowColor = "transparent";

      ctx.beginPath();
      ctx.arc(trackX + trackWidth * value, trackY, 13, 0, Math.PI * 2);
      ctx.fillStyle = "#17212b";
      ctx.fill();
      ctx.lineWidth = 5;
      ctx.strokeStyle = muted ? "#89939b" : "#62eaff";
      ctx.stroke();
      ctx.restore();

      this.drawMusicMuteButton(1182, 842, "#62eaff");
      this.drawText("MUSIC", 1238, 823, 15, "left", muted ? "#aeb9c3" : "#62eaff");
      this.drawText(`${Math.round(value * 100)}%`, 1524, 823, 15, "right", muted ? "#aeb9c3" : "#fffaf0");
    }

    drawCreatorLink(now) {
      const ctx = this.context;
      const x = 26;
      const y = 810;
      const width = 270;
      const height = 66;
      const hovered = this.pointer.active && this.inside(this.pointer.x, this.pointer.y, x, y, width, height);
      ctx.save();
      ctx.shadowColor = hovered ? "rgba(98, 234, 255, 0.85)" : "rgba(0, 0, 0, 0.45)";
      ctx.shadowBlur = hovered ? 22 + Math.sin(now / 160) * 4 : 12;
      roundedRect(ctx, x, y, width, height, 8);
      ctx.fillStyle = hovered ? "rgba(20, 38, 51, 0.98)" : "rgba(21, 29, 38, 0.92)";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = hovered ? "#62eaff" : "#f3efe2";
      ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.beginPath();
      ctx.arc(x + 38, y + height / 2, 22, 0, Math.PI * 2);
      ctx.fillStyle = "#2688eb";
      ctx.fill();
      ctx.restore();

      this.drawText("VK", x + 38, y + height / 2 + 1, 17, "center", "#ffffff");
      this.drawText("CREATOR", x + 76, y + 21, 13, "left", "#62eaff");
      this.drawText("DEANDAL", x + 76, y + 45, 24, "left", "#fffaf0");

      ctx.save();
      ctx.strokeStyle = hovered ? "#ffd23f" : "#62eaff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x + 236, y + 43);
      ctx.lineTo(x + 252, y + 27);
      ctx.moveTo(x + 240, y + 27);
      ctx.lineTo(x + 252, y + 27);
      ctx.lineTo(x + 252, y + 39);
      ctx.stroke();
      ctx.restore();
    }

    drawCampaign(now) {
      this.drawCover(this.images.keyArt, 0, 0, 1.02);
      const ctx = this.context;
      ctx.save();
      ctx.fillStyle = "rgba(5, 16, 25, 0.78)";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      ctx.restore();

      this.drawText("FLIGHT ACADEMY", WIDTH / 2, 72, 56, "center", "#fffaf0");
      this.drawText("NUMBERNAUT TRAINING PROGRAM", WIDTH / 2, 124, 22, "center", "#62eaff");
      this.drawActionButton(42, 38, 190, 62, "BACK", false);

      MISSIONS.forEach((mission, index) => {
        const rect = this.missionCardRect(index);
        const unlocked = index <= this.campaignProgress.unlocked;
        const stars = Number(this.campaignProgress.stars[mission.id] || 0);
        const resumable = this.activeRun?.missionId === mission.id;
        const hovered =
          unlocked && this.pointer.active && this.inside(this.pointer.x, this.pointer.y, rect.x, rect.y, rect.width, rect.height);
        const pulse = hovered ? 0.08 + Math.sin(now / 180) * 0.03 : 0;
        ctx.save();
        roundedRect(ctx, rect.x, rect.y, rect.width, rect.height, 8);
        ctx.fillStyle = unlocked ? `rgba(21, 32, 42, ${clamp(0.94 + pulse, 0, 1)})` : "rgba(29, 34, 39, 0.9)";
        ctx.fill();
        ctx.lineWidth = hovered ? 7 : 5;
        ctx.strokeStyle = unlocked ? (index % 2 ? "#62eaff" : "#ee5738") : "#65717a";
        ctx.stroke();
        ctx.restore();

        this.drawText(String(index + 1).padStart(2, "0"), rect.x + 55, rect.y + 52, 40, "center", unlocked ? "#ffd23f" : "#7f8991");
        const titleSize = mission.title.length > 11 ? 26 : 32;
        this.drawText(mission.title, rect.x + 112, rect.y + 47, titleSize, "left", unlocked ? "#fffaf0" : "#89939b");
        this.drawText(mission.subtitle, rect.x + 112, rect.y + 91, 20, "left", unlocked ? "#62eaff" : "#69747c");
        let objective = mission.type === "memory" ? `${mission.requiredChains} CHAINS` : `${mission.targetScore} PTS`;
        if (resumable) {
          objective =
            mission.type === "memory"
              ? `${Number(this.activeRun.chainsCompleted) || 0} CHAINS SAVED`
              : `${Number(this.activeRun.score) || 0} PTS SAVED`;
        }
        this.drawText(objective, rect.x + rect.width - 44, rect.y + 98, 19, "right", unlocked ? "#ffcb45" : "#69747c");

        if (resumable) {
          this.drawText("CONTINUE", rect.x + rect.width - 42, rect.y + 43, 19, "right", "#62eaff");
        } else if (unlocked) {
          for (let star = 0; star < 3; star += 1) {
            this.drawStar(rect.x + rect.width - 106 + star * 31, rect.y + 42, 12, star < stars ? "#ffd23f" : "#48545d");
          }
        } else {
          this.drawText("LOCKED", rect.x + rect.width - 42, rect.y + 44, 20, "right", "#89939b");
        }
      });

      this.drawActionButton(595, 764, 410, 74, "FREE FLIGHT", true);
    }

    drawWorld(now) {
      const pointerX = this.pointer.active ? (this.pointer.x - WIDTH / 2) / (WIDTH / 2) : 0;
      const pointerY = this.pointer.active ? (this.pointer.y - HEIGHT / 2) / (HEIGHT / 2) : 0;
      this.drawWorldLayer(this.images.bg1, 0.12, pointerX * -2, pointerY * -1, 1.06);
      this.drawWorldLayer(this.images.bg2, 0.3, pointerX * -6, pointerY * -3, 1.08);
      this.drawWorldLayer(this.images.bg3, 0.52, pointerX * -11, pointerY * -5, 1.1);
      this.drawDecorations();
      this.drawWorldLayer(this.images.bg4, 0.8, pointerX * -16, pointerY * -7, 1.12);

      this.targets
        .slice()
        .sort((a, b) => a.y - b.y)
        .forEach((target) => this.drawTarget(target, now));

      this.drawBonuses(now);
      this.drawEffects(now, false);
      this.drawWorldLayer(this.images.bg5, 1, pointerX * -20, pointerY * -8, 1.14);
      this.drawWeapon(now);
      this.drawEffects(now, true);
      this.drawHud(now);
      if (this.mode === "playing") this.drawReticle(now);
    }

    drawCover(image, offsetX, offsetY, overscan) {
      if (!image) return;
      const sourceWidth = image.videoWidth || image.naturalWidth || image.width;
      const sourceHeight = image.videoHeight || image.naturalHeight || image.height;
      if (!sourceWidth || !sourceHeight) return;
      const scale = Math.max(WIDTH / sourceWidth, HEIGHT / sourceHeight) * (overscan || 1);
      const width = sourceWidth * scale;
      const height = sourceHeight * scale;
      this.context.drawImage(image, (WIDTH - width) / 2 + offsetX, (HEIGHT - height) / 2 + offsetY, width, height);
    }

    drawWorldLayer(image, depth, offsetX, offsetY, overscan) {
      if (!image) return;
      const layer = this.cachedWorldLayer(image, overscan);
      const sourceX = clamp(Math.round(this.cameraX * depth - offsetX), 0, layer.width - WIDTH);
      this.context.drawImage(layer, sourceX, 0, WIDTH, HEIGHT, 0, 0, WIDTH, HEIGHT);
    }

    cachedWorldLayer(image, overscan) {
      const key = `${image.src}|${overscan || 1}|${WORLD_WIDTH}x${HEIGHT}`;
      if (this.worldLayerCache.has(key)) return this.worldLayerCache.get(key);
      const scale = Math.max(WIDTH / image.width, HEIGHT / image.height) * (overscan || 1);
      const width = Math.ceil(image.width * scale);
      const height = Math.ceil(image.height * scale);
      const y = Math.round((HEIGHT - height) / 2);
      const tileWidth = Math.max(1, width - 1);
      const canvas = document.createElement("canvas");
      canvas.width = WORLD_WIDTH;
      canvas.height = HEIGHT;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      let tileIndex = -1;
      for (let x = -tileWidth; x < WORLD_WIDTH + tileWidth; x += tileWidth) {
        if (tileIndex % 2 === 0) {
          ctx.drawImage(image, x, y, width, height);
        } else {
          ctx.save();
          ctx.translate(x + width, y);
          ctx.scale(-1, 1);
          ctx.drawImage(image, 0, 0, width, height);
          ctx.restore();
        }
        tileIndex += 1;
      }
      this.worldLayerCache.set(key, canvas);
      return canvas;
    }

    drawDecorations() {
      this.decorations.forEach((item) => {
        const image = this.images[item.key];
        if (!image) return;
        const bob = Math.sin(this.worldTime * 0.8 + item.phase) * 11;
        const size = 418 * item.scale;
        const screenX = this.worldToScreenX(item.x, item.depth || 1);
        if (screenX < -size || screenX > WIDTH + size) return;
        this.context.globalAlpha = 0.78;
        this.context.drawImage(image, screenX - size / 2, item.y + bob - size / 2, size, size);
        this.context.globalAlpha = 1;
      });
    }

    drawBonuses(now) {
      this.bonuses.forEach((bonus) => {
        if (bonus.visibleUntil <= now) return;
        const remaining = bonus.visibleUntil - now;
        const intro = clamp((3000 - remaining) / 420, 0, 1);
        const outro = clamp(remaining / 420, 0, 1);
        const alpha = Math.min(intro, outro);
        const bob = Math.sin(this.worldTime * 3 + bonus.phase) * 8;
        const shine = 0.55 + Math.sin(now / 120 + bonus.phase) * 0.25;
        const size = 430 * bonus.scale * (1 + shine * 0.08);
        const screenX = this.worldToScreenX(bonus.x);
        if (screenX < -size || screenX > WIDTH + size) return;
        const image = this.images[bonus.key];

        this.context.save();
        this.context.translate(screenX, bonus.y + bob);
        this.context.globalAlpha = alpha;
        this.context.globalCompositeOperation = "screen";
        this.context.strokeStyle = `rgba(255, 210, 63, ${0.45 + shine * 0.35})`;
        this.context.shadowColor = "#ffd23f";
        this.context.shadowBlur = 18;
        this.context.lineWidth = 5;
        this.context.beginPath();
        this.context.arc(0, 0, bonus.radius + shine * 7, 0, Math.PI * 2);
        this.context.stroke();
        this.context.globalCompositeOperation = "source-over";
        if (image) {
          this.context.shadowColor = "rgba(255, 210, 63, 0.5)";
          this.context.shadowBlur = 16 + shine * 10;
          this.context.drawImage(image, -size / 2, -size / 2, size, size);
          this.context.shadowColor = "transparent";
        } else {
          this.drawBonusAsset(bonus.type, size, shine);
        }
        this.drawText(`+${BONUS_POINTS[bonus.type] || 120}`, 0, -bonus.radius - 18, 25, "center", "#ffd23f");
        this.context.restore();
      });
    }

    drawBonusAsset(type, size, shine) {
      const ctx = this.context;
      const r = size / 2;
      const core = ctx.createRadialGradient(-r * 0.22, -r * 0.24, r * 0.08, 0, 0, r);
      core.addColorStop(0, "#fff8d5");
      core.addColorStop(0.42, "#ffd23f");
      core.addColorStop(1, "#e85f36");

      ctx.save();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "#ffd23f";
      ctx.shadowBlur = 16 + shine * 8;

      if (type === "satellite") {
        ctx.fillStyle = core;
        roundedRect(ctx, -r * 0.44, -r * 0.32, r * 0.88, r * 0.64, r * 0.12);
        ctx.fill();
        ctx.lineWidth = Math.max(3, r * 0.09);
        ctx.strokeStyle = "#102834";
        ctx.stroke();
        ctx.fillStyle = "#62eaff";
        ctx.fillRect(-r * 0.22, -r * 0.16, r * 0.44, r * 0.32);
        ctx.strokeRect(-r * 0.22, -r * 0.16, r * 0.44, r * 0.32);
        ctx.fillStyle = "#fff8e8";
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#62eaff";
        ctx.lineWidth = Math.max(2, r * 0.06);
        ctx.beginPath();
        ctx.moveTo(-r * 0.46, -r * 0.08);
        ctx.lineTo(-r * 0.72, -r * 0.22);
        ctx.moveTo(r * 0.46, r * 0.08);
        ctx.lineTo(r * 0.72, r * 0.22);
        ctx.stroke();
      } else if (type === "capsule") {
        ctx.rotate(-0.18);
        ctx.fillStyle = core;
        roundedRect(ctx, -r * 0.34, -r * 0.58, r * 0.68, r * 1.16, r * 0.32);
        ctx.fill();
        ctx.lineWidth = Math.max(3, r * 0.09);
        ctx.strokeStyle = "#102834";
        ctx.stroke();
        ctx.fillStyle = "#62eaff";
        ctx.beginPath();
        ctx.arc(0, -r * 0.2, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#fff8e8";
        ctx.beginPath();
        ctx.moveTo(-r * 0.18, r * 0.2);
        ctx.lineTo(r * 0.18, r * 0.2);
        ctx.stroke();
      } else if (type === "cargo") {
        ctx.fillStyle = core;
        roundedRect(ctx, -r * 0.56, -r * 0.26, r * 1.12, r * 0.52, r * 0.1);
        ctx.fill();
        ctx.lineWidth = Math.max(3, r * 0.08);
        ctx.strokeStyle = "#102834";
        ctx.stroke();
        ctx.fillStyle = "#62eaff";
        roundedRect(ctx, -r * 0.16, -r * 0.5, r * 0.4, r * 0.34, r * 0.08);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#fff8e8";
        ctx.beginPath();
        ctx.arc(-r * 0.36, 0, r * 0.1, 0, Math.PI * 2);
        ctx.arc(r * 0.38, 0, r * 0.1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(0, -r * 0.12, r * 0.44, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = Math.max(3, r * 0.08);
        ctx.strokeStyle = "#102834";
        ctx.stroke();
        ctx.fillStyle = "#62eaff";
        roundedRect(ctx, -r * 0.2, r * 0.26, r * 0.4, r * 0.22, r * 0.07);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#fff8e8";
        ctx.lineWidth = Math.max(2, r * 0.05);
        ctx.beginPath();
        ctx.moveTo(-r * 0.2, r * 0.18);
        ctx.lineTo(-r * 0.1, r * 0.28);
        ctx.moveTo(r * 0.2, r * 0.18);
        ctx.lineTo(r * 0.1, r * 0.28);
        ctx.stroke();
      }

      ctx.restore();
    }

    targetState(target, now) {
      if (target.reaction === "wrong") return "fear";
      if (target.reaction === "correct") return now - target.reactionAt < 170 ? "hit" : "captured";
      return "flight";
    }

    drawTarget(target, now) {
      const state = this.targetState(target, now);
      const image = this.images[`${target.type}-${state}`];
      if (!image) return;
      const age = now - target.reactionAt;
      let alpha = 1;
      let scale = target.scale;
      let lift = 0;
      if (target.reaction === "correct" && age > 170) {
        const progress = clamp((age - 170) / 510, 0, 1);
        alpha = 1 - progress * 0.72;
        scale *= 1 - progress * 0.22;
        lift = progress * 54;
      }
      const size = 292 * scale;
      const offsets = NUMBER_OFFSETS[target.type][state];
      const screenX = this.worldToScreenX(target.x);
      if (screenX < -size || screenX > WIDTH + size) return;
      this.context.save();
      this.context.translate(screenX, target.y - lift);
      this.context.rotate(target.rotation);
      this.context.globalAlpha = alpha;
      this.context.drawImage(image, -size / 2, -size / 2, size, size);
      const fontSize = Math.round(48 * scale);
      this.context.font = `900 ${fontSize}px Arial, sans-serif`;
      this.context.textAlign = "center";
      this.context.textBaseline = "middle";
      this.context.lineJoin = "round";
      this.context.strokeStyle = "#16202a";
      this.context.lineWidth = Math.max(5, fontSize * 0.17);
      this.context.strokeText(String(target.number), offsets[0] * scale, offsets[1] * scale);
      this.context.fillStyle = "#fffaf0";
      this.context.fillText(String(target.number), offsets[0] * scale, offsets[1] * scale);
      this.context.restore();
    }

    drawEffects(now, foreground) {
      this.effects.forEach((effect) => {
        const isForeground = ["effectSoundWave", "effectSteam", "effectCharge", "effectParticles"].includes(effect.key);
        if (isForeground !== foreground) return;
        const image = this.images[effect.key];
        if (!image) return;
        const progress = clamp((now - effect.born) / effect.duration, 0, 1);
        const size = 418 * effect.scale * (0.84 + progress * 0.25);
        const x = effect.world ? this.worldToScreenX(effect.x) : effect.x;
        if (x < -size || x > WIDTH + size) return;
        this.context.save();
        this.context.translate(x, effect.y);
        this.context.rotate(effect.rotation || 0);
        this.context.globalAlpha = Math.sin(progress * Math.PI) * 0.94;
        this.context.globalCompositeOperation = effect.key === "effectWrong" ? "source-over" : "screen";
        this.context.drawImage(image, -size / 2, -size / 2, size, size);
        this.context.restore();
      });
    }

    drawWeapon(now) {
      let image = this.images.weaponIdle;
      if (now < this.overheatUntil) image = this.images.weaponOverheated;
      else if (now < this.weaponFireUntil) image = this.images.weaponFiring;
      else if (this.heat > 60) image = this.images.weaponCharging;
      const width = 520;
      const height = 520;
      this.context.drawImage(image, WIDTH / 2 - width / 2, 490, width, height);
    }

    drawReticle(now) {
      const ctx = this.context;
      const x = this.pointer.x;
      const y = this.pointer.y;
      const pulse = Math.sin(now / 135);
      const spin = now / 390;
      const outer = 58 + pulse * 3;

      ctx.save();
      ctx.translate(x, y);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalCompositeOperation = "screen";

      const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 78);
      glow.addColorStop(0, "rgba(255, 250, 230, 0.9)");
      glow.addColorStop(0.28, "rgba(98, 234, 255, 0.4)");
      glow.addColorStop(1, "rgba(98, 234, 255, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 78, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = "#62eaff";
      ctx.shadowBlur = 24;
      ctx.strokeStyle = "rgba(98, 234, 255, 0.96)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0, 0, outer, spin, spin + Math.PI * 0.48);
      ctx.arc(0, 0, outer, spin + Math.PI * 0.72, spin + Math.PI * 1.2);
      ctx.arc(0, 0, outer, spin + Math.PI * 1.45, spin + Math.PI * 1.9);
      ctx.stroke();

      ctx.shadowColor = "#ffd23f";
      ctx.shadowBlur = 18;
      ctx.strokeStyle = "rgba(255, 210, 63, 0.96)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 40 - pulse * 2, -spin * 1.12, -spin * 1.12 + Math.PI * 1.55);
      ctx.stroke();

      ctx.shadowColor = "#ff7646";
      ctx.shadowBlur = 14;
      ctx.strokeStyle = "#ff7646";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(-6, 0);
      ctx.moveTo(16, 0);
      ctx.lineTo(6, 0);
      ctx.moveTo(0, -16);
      ctx.lineTo(0, -6);
      ctx.moveTo(0, 16);
      ctx.lineTo(0, 6);
      ctx.stroke();

      ctx.fillStyle = "#fff8e8";
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#102834";
      ctx.stroke();

      ctx.shadowColor = "#62eaff";
      ctx.shadowBlur = 11;
      ctx.strokeStyle = "rgba(255, 248, 232, 0.9)";
      ctx.lineWidth = 3.5;
      const corner = 75;
      const arm = 19;
      ctx.beginPath();
      ctx.moveTo(-corner + arm, -corner);
      ctx.lineTo(-corner, -corner);
      ctx.lineTo(-corner, -corner + arm);
      ctx.moveTo(corner - arm, -corner);
      ctx.lineTo(corner, -corner);
      ctx.lineTo(corner, -corner + arm);
      ctx.moveTo(-corner, corner - arm);
      ctx.lineTo(-corner, corner);
      ctx.lineTo(-corner + arm, corner);
      ctx.moveTo(corner, corner - arm);
      ctx.lineTo(corner, corner);
      ctx.lineTo(corner - arm, corner);
      ctx.stroke();
      ctx.restore();

      if (this.heat > 68) {
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = `rgba(255, 96, 72, ${0.35 + this.heat / 220})`;
        ctx.shadowColor = "#ff6048";
        ctx.shadowBlur = 16;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(0, 0, 68, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (this.heat / 100));
        ctx.stroke();
        ctx.restore();
      }
    }

    drawHud(now) {
      this.drawPanel(20, 20, 220, 76, 20);
      this.drawHudIcon(this.images.hudTimerIcon, 56, 58, 64, () => this.drawClockIcon(56, 58));
      this.drawText(this.formatTime(this.roundRemaining), 145, 59, 38, "center", "#fffaf0");

      this.drawPanel(370, 16, 770, 92, 24);
      this.drawHudIcon(this.images.hudSoundIcon, 420, 62, 78, () => this.drawCircleButton(420, 62, 33, "speaker"));
      const missionType = this.currentMission?.type;
      let prompt = numberToWords(this.promptNumber).toUpperCase();
      if (["audio", "exam"].includes(missionType)) prompt = "AUDIO SIGNAL";
      if (missionType === "memory") prompt = `MEMORY SIGNAL ${Math.min(3, this.memoryIndex + 1)}/3`;
      const promptSize = prompt.length > 17 ? 35 : prompt.length > 12 ? 39 : 47;
      this.drawText(prompt, 790, 63, promptSize, "center", "#fffaf0");
      if (this.currentMission && this.replaysRemaining < 90) {
        this.drawText(`x${this.replaysRemaining}`, 470, 64, 21, "center", this.replaysRemaining ? "#62eaff" : "#ff775f");
      }

      this.drawPanel(1160, 20, 220, 76, 20);
      this.drawStar(1197, 58, 18, "#ffd23f");
      this.drawText(String(this.score).padStart(5, "0"), 1290, 59, 35, "center", "#fffaf0");

      this.drawCircleButton(1435, 59, 42, "combo");
      this.drawText(`x${Math.max(1, this.combo)}`, 1435, 59, 29, "center", this.combo > 1 ? "#ffd23f" : "#aeb9c3");
      this.drawCircleButton(1538, 59, 40, "pause");

      this.drawMissionHud();
      this.drawChargeMeter(now);
      if (this.feedback && now < this.feedback.until) {
        const remaining = (this.feedback.until - now) / 700;
        this.context.save();
        this.context.globalAlpha = clamp(remaining, 0, 1);
        this.drawText(this.feedback.text, WIDTH / 2, 155, 44, "center", this.feedback.color);
        this.context.restore();
      }
    }

    drawMissionHud() {
      if (!this.currentMission) return;
      const mission = this.currentMission;
      this.drawText(mission.title, 24, 124, 20, "left", "#fffaf0");
      if (mission.type === "memory") {
        this.drawText(`CHAINS ${this.chainsCompleted}/${mission.requiredChains}`, 24, 153, 18, "left", "#62eaff");
      } else {
        this.drawText(`TARGET ${mission.targetScore}`, 24, 153, 18, "left", "#62eaff");
      }
      if (mission.type === "exam") {
        this.drawText(`LIVES ${this.lives}/3`, WIDTH - 24, 126, 24, "right", this.lives > 1 ? "#ffd23f" : "#ff775f");
        this.drawText(`ERRORS ${this.missionErrors}`, WIDTH - 24, 155, 18, "right", "#fffaf0");
      }
    }

    drawPanel(x, y, width, height, radius) {
      const ctx = this.context;
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      roundedRect(ctx, x, y, width, height, Math.min(radius, 12));
      ctx.fillStyle = "rgba(21, 29, 38, 0.94)";
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#f3efe2";
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ee5738";
      ctx.stroke();
      ctx.restore();
    }

    drawCircleButton(x, y, radius, icon) {
      const ctx = this.context;
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "#15202a";
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#f6c342";
      ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.strokeStyle = "#62eaff";
      ctx.fillStyle = "#62eaff";
      ctx.lineWidth = 5;
      if (icon === "pause") {
        ctx.fillRect(x - 11, y - 16, 8, 32);
        ctx.fillRect(x + 4, y - 16, 8, 32);
      } else if (icon === "speaker") {
        ctx.beginPath();
        ctx.moveTo(x - 15, y - 7);
        ctx.lineTo(x - 5, y - 7);
        ctx.lineTo(x + 6, y - 17);
        ctx.lineTo(x + 6, y + 17);
        ctx.lineTo(x - 5, y + 7);
        ctx.lineTo(x - 15, y + 7);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + 6, y, 15, -0.75, 0.75);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawHudIcon(image, x, y, size, fallback) {
      if (!image) {
        fallback?.();
        return;
      }
      const ctx = this.context;
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.shadowColor = "rgba(98, 234, 255, 0.24)";
      ctx.shadowBlur = 8;
      ctx.drawImage(image, x - size / 2, y - size / 2, size, size);
      ctx.restore();
    }

    drawClockIcon(x, y) {
      const ctx = this.context;
      ctx.save();
      ctx.strokeStyle = "#62eaff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 13);
      ctx.moveTo(x, y);
      ctx.lineTo(x + 11, y + 6);
      ctx.stroke();
      ctx.restore();
    }

    drawStar(x, y, radius, color) {
      const ctx = this.context;
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < 10; i += 1) {
        const angle = -Math.PI / 2 + (i * Math.PI) / 5;
        const distanceFromCenter = i % 2 === 0 ? radius : radius * 0.46;
        const px = x + Math.cos(angle) * distanceFromCenter;
        const py = y + Math.sin(angle) * distanceFromCenter;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.restore();
    }

    drawChargeMeter(now) {
      const x = 625;
      const y = 830;
      const width = 350;
      const height = 24;
      const ctx = this.context;
      ctx.save();
      roundedRect(ctx, x - 8, y - 8, width + 16, height + 16, 18);
      ctx.fillStyle = "rgba(14, 22, 29, 0.93)";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#f4efe3";
      ctx.stroke();
      roundedRect(ctx, x, y, width, height, 12);
      ctx.fillStyle = "#0a2a39";
      ctx.fill();
      const fillWidth = width * (this.energy / 100);
      if (fillWidth > 0) {
        const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
        gradient.addColorStop(0, "#1bc4df");
        gradient.addColorStop(1, "#9cfcff");
        roundedRect(ctx, x, y, fillWidth, height, 12);
        ctx.fillStyle = gradient;
        ctx.shadowColor = "#62eaff";
        ctx.shadowBlur = this.energy > 80 ? 18 + Math.sin(now / 120) * 6 : 6;
        ctx.fill();
      }
      ctx.restore();
    }

    drawText(text, x, y, size, align, color) {
      const ctx = this.context;
      ctx.save();
      ctx.font = `800 ${size}px ${UI_FONT}`;
      ctx.textAlign = align || "center";
      ctx.textBaseline = "middle";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "rgba(12, 20, 27, 0.92)";
      ctx.lineWidth = Math.max(2, size * 0.07);
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color || "#ffffff";
      ctx.fillText(text, x, y);
      ctx.restore();
    }

    formatTime(seconds) {
      const safe = Math.max(0, Math.ceil(seconds));
      const minutes = Math.floor(safe / 60);
      return `${String(minutes).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
    }

    drawModalBackdrop() {
      this.context.save();
      this.context.fillStyle = "rgba(5, 18, 27, 0.62)";
      this.context.fillRect(0, 0, WIDTH, HEIGHT);
      this.context.restore();
    }

    drawModal(x, y, width, height, title) {
      const ctx = this.context;
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
      ctx.shadowBlur = 28;
      ctx.shadowOffsetY = 8;
      roundedRect(ctx, x, y, width, height, 16);
      const fill = ctx.createLinearGradient(0, y, 0, y + height);
      fill.addColorStop(0, "#1c2b36");
      fill.addColorStop(1, "#111a22");
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = 7;
      ctx.strokeStyle = "#f4efe2";
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#ee5738";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 36, y + 118);
      ctx.lineTo(x + width - 36, y + 118);
      ctx.strokeStyle = "rgba(98, 234, 255, 0.28)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      this.drawText(title, x + width / 2, y + 66, 44, "center", "#fffaf0");
    }

    drawActionButton(x, y, width, height, label, accent) {
      const ctx = this.context;
      ctx.save();
      ctx.shadowColor = "rgba(0, 0, 0, 0.32)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      roundedRect(ctx, x, y, width, height, 12);
      const fill = ctx.createLinearGradient(0, y, 0, y + height);
      if (accent) {
        fill.addColorStop(0, "#f26443");
        fill.addColorStop(1, "#d9472f");
      } else {
        fill.addColorStop(0, "#fffdf5");
        fill.addColorStop(1, "#e8e2d5");
      }
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.lineWidth = 4;
      ctx.strokeStyle = accent ? "#ffc83d" : "#e95636";
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 18, y + 10);
      ctx.lineTo(x + width - 18, y + 10);
      ctx.strokeStyle = accent ? "rgba(255,255,255,0.34)" : "rgba(255,255,255,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      const labelSize = label.length > 13 ? 24 : 28;
      this.drawText(label, x + width / 2, y + height / 2 + 1, labelSize, "center", accent ? "#ffffff" : "#17212b");
    }

    drawMixerSlider(channel, label, y, color) {
      const ctx = this.context;
      const value = this.audio.volumes[channel];
      const trackX = 700;
      const trackWidth = 300;
      this.drawText(label, 500, y, 24, "left", "#fffaf0");
      this.drawText(`${Math.round(value * 100)}%`, channel === "music" ? 1120 : 1090, y, 22, "right", color);

      ctx.save();
      roundedRect(ctx, trackX, y - 12, trackWidth, 24, 12);
      ctx.fillStyle = "#0a2634";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#f3efe2";
      ctx.stroke();
      const fillWidth = Math.max(1, trackWidth * value);
      roundedRect(ctx, trackX, y - 12, fillWidth, 24, 12);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = value > 0 ? 12 : 0;
      ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.beginPath();
      ctx.arc(trackX + trackWidth * value, y, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#17212b";
      ctx.fill();
      ctx.lineWidth = 7;
      ctx.strokeStyle = color;
      ctx.stroke();
      ctx.restore();
      if (channel === "music") this.drawMusicMuteButton(1040, y, color);
    }

    drawMusicMuteButton(x, y, color) {
      const ctx = this.context;
      const muted = !this.audio.enabled || this.audio.isChannelMuted("music") || this.audio.volumes.music === 0;
      const hovered = this.pointer.active && distance(this.pointer.x, this.pointer.y, x, y) <= 30;
      ctx.save();
      ctx.shadowColor = hovered ? color : "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = hovered ? 14 : 6;
      ctx.beginPath();
      ctx.arc(x, y, 24, 0, Math.PI * 2);
      ctx.fillStyle = "#14232d";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = muted ? "#ff775f" : color;
      ctx.stroke();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = muted ? "#ff775f" : color;
      ctx.strokeStyle = muted ? "#ff775f" : color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 13, y - 6);
      ctx.lineTo(x - 6, y - 6);
      ctx.lineTo(x + 2, y - 14);
      ctx.lineTo(x + 2, y + 14);
      ctx.lineTo(x - 6, y + 6);
      ctx.lineTo(x - 13, y + 6);
      ctx.closePath();
      ctx.fill();
      if (muted) {
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 7, y - 10);
        ctx.lineTo(x + 16, y + 10);
        ctx.moveTo(x + 16, y - 10);
        ctx.lineTo(x + 7, y + 10);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x + 2, y, 11, -0.72, 0.72);
        ctx.stroke();
      }
      ctx.restore();
    }

    drawPauseOverlay() {
      this.drawModalBackdrop();
      this.drawModal(550, 235, 500, 490, "PAUSED");
      const savedValue = this.currentMission?.type === "memory" ? `${this.chainsCompleted} CHAINS` : `${this.score} PTS`;
      this.drawText(`SAVED  ${savedValue}`, 800, 337, 22, "center", "#62eaff");
      this.drawActionButton(610, 370, 380, 78, "RESUME", true);
      this.drawActionButton(610, 472, 380, 78, "RESTART", false);
      this.drawActionButton(610, 574, 380, 78, "ACADEMY", false);
    }

    drawResultsOverlay(now) {
      this.drawModalBackdrop();
      const title = !this.currentMission || this.missionPassed ? "MISSION COMPLETE" : "MISSION FAILED";
      this.drawModal(470, 145, 660, 670, title);
      if (this.currentMission) {
        this.drawText(this.currentMission.title, 800, 235, 24, "center", this.missionPassed ? "#62eaff" : "#ff775f");
      }
      for (let star = 0; star < 3; star += 1) {
        const pulse = star < this.missionStars ? Math.sin(now / 260 + star) * 3 : 0;
        this.drawStar(742 + star * 58, 286, 24 + pulse, star < this.missionStars ? "#ffd23f" : "#48545d");
      }

      this.drawPanel(555, 325, 490, 92, 20);
      const isMemory = this.currentMission?.type === "memory";
      this.drawText(isMemory ? "CHAINS" : "SCORE", 670, 371, 30, "center", "#ffd23f");
      this.drawText(String(isMemory ? this.chainsCompleted : this.score), 910, 371, 43, "center", "#fffaf0");
      this.drawPanel(555, 438, 490, 92, 20);
      const target = isMemory ? this.currentMission.requiredChains : this.currentMission?.targetScore;
      this.drawText(this.currentMission ? "TARGET" : "BEST", 670, 484, 30, "center", "#62eaff");
      this.drawText(String(this.currentMission ? target : this.bestScore), 910, 484, 43, "center", "#fffaf0");

      const hasNext = this.currentMission && this.missionPassed && this.selectedMissionIndex < MISSIONS.length - 1;
      const primaryLabel = hasNext ? "NEXT MISSION" : this.currentMission ? "RETRY MISSION" : "PLAY AGAIN";
      this.drawActionButton(525, 610, 550, 86, primaryLabel, true);
      this.drawActionButton(650, 718, 300, 68, "ACADEMY", false);
    }

    drawSettingsOverlay() {
      this.drawModalBackdrop();
      this.drawModal(450, 80, 700, 760, "AUDIO MIXER");
      this.drawMixerSlider("master", "MASTER", 260, "#ffd23f");
      this.drawMixerSlider("music", "MUSIC", 370, "#62eaff");
      this.drawMixerSlider("voice", "VOICE", 480, "#7ee787");
      this.drawMixerSlider("effects", "EFFECTS", 590, "#ff775f");
      this.drawActionButton(480, 700, 200, 78, this.audio.enabled ? "MUTE" : "UNMUTE", !this.audio.enabled);
      this.drawActionButton(700, 700, 200, 78, `${this.roundLength} SEC`, false);
      this.drawActionButton(920, 700, 200, 78, "BACK", true);
    }
  }

  new NumbernautsGame();
})();
