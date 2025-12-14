/* =========================================================
   Advent Calendar Logic (Dec 15 start, 12 days)
   ========================================================= */

const debugMode = false; // If true, unlock all doors

const DAYS = window.GIFTS || [];
const gridEl = document.getElementById("calendarGrid");

// Modals
const alertOverlay = document.getElementById("alertOverlay");
const alertText = document.getElementById("alertText");
const alertCountdownEl = document.getElementById("alertCountdown");
let alertCountdownInterval = null;


const revealOverlay = document.getElementById("revealOverlay");
const revealDayNumEl = document.getElementById("revealDayNum");
const revealImage = document.getElementById("revealImage");
const openGiftBtn = document.getElementById("openGiftBtn");

const cardOverlay = document.getElementById("cardOverlay");
const cardToCapture = document.getElementById("cardToCapture");
const cardDayNumEl = document.getElementById("cardDayNum");
const cardTitle = document.getElementById("cardTitle");
const cardMessage = document.getElementById("cardMessage");
const cardFooter = document.getElementById("cardFooter");
const downloadPngBtn = document.getElementById("downloadPngBtn");
const downloadPdfBtn = document.getElementById("downloadPdfBtn");
const cardImage = document.getElementById("cardImage");


/* =========================
   🔊 Background audio (fade in/out)
   ========================= */
const bgAudio = document.getElementById("bgAudio");
const audioToggle = document.getElementById("audioToggle");

const AUDIO_TARGET_VOLUME = 0.1;  // 50%
const AUDIO_FADE_IN_MS = 4000;
const AUDIO_FADE_OUT_MS = 450;

let audioFadeRaf = null;

function setAudioButton(isOn){
  if (!audioToggle) return;
  audioToggle.setAttribute("aria-pressed", String(isOn));
  audioToggle.textContent = isOn ? "🔊 Music" : "🔇 Music";
}

function cancelAudioFade(){
  if (audioFadeRaf) cancelAnimationFrame(audioFadeRaf);
  audioFadeRaf = null;
}

function fadeAudioTo(target, durationMs){
  return new Promise((resolve) => {
    if (!bgAudio) return resolve();

    cancelAudioFade();

    const startVol = Number.isFinite(bgAudio.volume) ? bgAudio.volume : 0;
    const start = performance.now();
    const delta = target - startVol;

    const step = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      bgAudio.volume = startVol + delta * t;

      if (t < 1){
        audioFadeRaf = requestAnimationFrame(step);
      } else {
        audioFadeRaf = null;
        resolve();
      }
    };

    audioFadeRaf = requestAnimationFrame(step);
  });
}

function prepareAudio(){
  if (!bgAudio) return;
  bgAudio.muted = false;
  // ставим 0 заранее, чтобы не было "громкого щелчка" на старте
  if (bgAudio.paused) bgAudio.volume = 0;
}

async function playWithFade(){
  if (!bgAudio) return;

  prepareAudio();
  bgAudio.volume = 0;

  await bgAudio.play(); // может быть заблокировано браузером
  await fadeAudioTo(AUDIO_TARGET_VOLUME, AUDIO_FADE_IN_MS);

  setAudioButton(true);
}

async function pauseWithFade(){
  if (!bgAudio) return;

  await fadeAudioTo(0, AUDIO_FADE_OUT_MS);
  bgAudio.pause();
  bgAudio.volume = 0;

  setAudioButton(false);
}

async function tryAutoPlay(){
  if (!bgAudio) return;

  try{
    await playWithFade();
  } catch (_){
    // autoplay blocked — оставляем OFF
    bgAudio.pause();
    bgAudio.volume = 0;
    setAudioButton(false);
  }
}

audioToggle?.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (!bgAudio) return;

  if (bgAudio.paused){
    try{
      await playWithFade();
    } catch (_){
      setAudioButton(false);
    }
  } else {
    await pauseWithFade();
  }
});

// начальное состояние
prepareAudio();
setAudioButton(false);
tryAutoPlay();


// If autoplay is blocked, start audio on the first user interaction anywhere
// If autoplay is blocked, start audio on the first user interaction anywhere
function enableAudioOnFirstGesture(){
  if (!bgAudio) return;

  const start = async () => {
    try{
      // запуск именно через fade, чтобы не было "тишины" (volume=0)
      if (bgAudio.paused) await playWithFade();
    } catch(_) {
      setAudioButton(false);
    }
  };

  window.addEventListener("pointerdown", start, { capture: true, once: true });
  window.addEventListener("keydown", start, { capture: true, once: true });
}

enableAudioOnFirstGesture();





function showCopyToast(text = "Copied! ✅"){
  let toast = document.getElementById("copyToast");
  if (!toast){
    toast = document.createElement("div");
    toast.id = "copyToast";
    toast.className = "copy-toast";
    toast.setAttribute("aria-live", "polite");
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  toast.classList.add("show");
  window.clearTimeout(showCopyToast._t);
  showCopyToast._t = window.setTimeout(() => toast.classList.remove("show"), 2000);
}

async function copyTextToClipboard(text){
  // Clipboard API работает на https/localhost. Для file:// может не сработать.
  try{
    if (navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch(_) {}

  // Fallback
  try{
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch(_) {
    return false;
  }
}

// Click-to-copy on cardMessage
cardMessage.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation(); // чтобы клик не воспринимался как клик по оверлею
  const text = (cardMessage.textContent || "").trim();
  if (!text) return;

  const ok = await copyTextToClipboard(text);
  showCopyToast(ok ? "Промпт скопирован ✅" : "Copy failed ❌");
});






let activeDay = 1;

function getGift(day){
  return DAYS.find(g => g.day === day) || null;
}
/** Create a date at local noon to avoid DST edge-cases */
function dateAtNoon(year, monthIndex, day){
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

function formatDecDate(d){
  // Always show "Dec X" like spec text
  const day = d.getDate();
  return `${day} декабря`;
}

function stopAlertCountdown(){
  if (alertCountdownInterval){
    clearInterval(alertCountdownInterval);
    alertCountdownInterval = null;
  }
}

function renderAlertCountdown(ms){
  if (!alertCountdownEl) return;

  const total = Math.max(0, Math.ceil(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  alertCountdownEl.innerHTML = `
    <div class="countdown-box"><div class="countdown-num">${days}</div><div class="countdown-label">days</div></div>
    <div class="countdown-box"><div class="countdown-num">${hours}</div><div class="countdown-label">hours</div></div>
    <div class="countdown-box"><div class="countdown-num">${mins}</div><div class="countdown-label">mins</div></div>
    <div class="countdown-box"><div class="countdown-num">${secs}</div><div class="countdown-label">secs</div></div>
  `;
}

function startAlertCountdown(targetDate){
  stopAlertCountdown();

  const tick = () => {
    const ms = targetDate - new Date();
    renderAlertCountdown(ms);

    if (ms <= 0){
      stopAlertCountdown();
      // на всякий — обновим двери, если наступил момент
      buildDoors();
      alertText.textContent = "✅ Уже можно открывать!";
    }
  };

  tick();
  alertCountdownInterval = setInterval(tick, 1000);
}


function daysBetween(a, b){
  // a and b are Date objects; calculate whole days (noon-based)
  const ms = 24 * 60 * 60 * 1000;
  return Math.floor((b - a) / ms);
}

function getUnlockCount(){
  if (debugMode) return 12;

  const now = new Date();
  const year = now.getFullYear();
  const start = dateAtNoon(year, 11, 15); // Dec is monthIndex 11
  const today = dateAtNoon(year, now.getMonth(), now.getDate());

  const diff = daysBetween(start, today); // 0 means Dec 15
  const unlocked = diff >= 0 ? Math.min(12, diff + 1) : 0;
  return unlocked;
}

function openModal(overlayEl){
  overlayEl.classList.add("open");
  overlayEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(overlayEl){
  overlayEl.classList.remove("open");
  overlayEl.setAttribute("aria-hidden", "true");

  if (overlayEl === alertOverlay) stopAlertCountdown();


  // If no modals left open, restore scroll
  const anyOpen = document.querySelector(".modal-overlay.open");
  if (!anyOpen) document.body.style.overflow = "";
}

function wireModalClose(){
  // Close buttons
  document.querySelectorAll("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-close");
      const el = document.getElementById(id);
      if (el) closeModal(el);
    });
  });

  // Backdrop click closes (only if clicking overlay, not the modal itself)
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
  });

  // ESC closes the topmost modal
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const top = Array.from(document.querySelectorAll(".modal-overlay.open")).pop();
    if (top) closeModal(top);
  });
}

function buildDoors(){
  const unlockedCount = getUnlockCount();
  const now = new Date();
  const year = now.getFullYear();
  const start = dateAtNoon(year, 11, 15);

  gridEl.innerHTML = "";

  for (let i = 1; i <= 12; i++){
    const isUnlocked = i <= unlockedCount;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `door ${isUnlocked ? "unlocked" : "locked"}`;
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("aria-label", `Day ${i} door ${isUnlocked ? "unlocked" : "locked"}`);
    btn.dataset.day = String(i);

    const img = document.createElement("img");
    img.src = `doors/door-${i}.png`;

    img.alt = `Door image for day ${i}`;



    btn.appendChild(img);


    btn.addEventListener("click", () => {
      const day = i;

      if (!isUnlocked){
        // Shake + cute alert
        btn.classList.remove("shake");
        void btn.offsetWidth; // restart animation
        btn.classList.add("shake");

	  const unlockDate = new Date(start);
	  unlockDate.setDate(start.getDate() + (day - 1));
	  
	  // 1) текст
	  alertText.textContent = `Еще рано моя хорошая! Откроется ${formatDecDate(unlockDate)}.`;
	  
	  // 2) таймер
	  startAlertCountdown(unlockDate);
	  
	  // 3) открыть модалку
	  openModal(alertOverlay);
return;

      }

      // Unlocked: open reveal modal
      openReveal(day);
    });

    gridEl.appendChild(btn);
  }
}

function openReveal(day){
  activeDay = day;
  const gift = getGift(day);

  revealDayNumEl.textContent = String(day);
  revealImage.src = gift?.revealSrc || `reveal-day/reveal-day-${day}.jpg`;

  revealImage.alt = `Reveal image for day ${day}`;

  openModal(revealOverlay);
}

function openCard(day){
  const gift = getGift(day);

  cardDayNumEl.textContent = String(day);

  cardTitle.textContent = gift?.cardTitle || `Day ${day} - Warm Winter Wishes!`;
  cardMessage.textContent = gift?.cardMessage || "Default message...";
  cardFooter.textContent = gift?.cardFooter || "Default footer...";

  cardImage.src = gift?.cardImageSrc || "card-image.jpg";
  cardImage.alt = `Holiday card image for day ${day}`;

  openModal(cardOverlay);
}

function blobDownload(dataUrl, filename){
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function downloadAsPNG(){
  // Higher scale = better resolution
  const canvas = await html2canvas(cardToCapture, {
    backgroundColor: null,
    scale: Math.min(3, window.devicePixelRatio + 1), // good quality, not insane
    useCORS: true
  });

  const dataUrl = canvas.toDataURL("image/png", 1.0);
  blobDownload(dataUrl, `advent-card-day-${activeDay}.png`);
}

async function downloadAsPDF(){
  const canvas = await html2canvas(cardToCapture, {
    backgroundColor: "#ffffff",
    scale: Math.min(3, window.devicePixelRatio + 1),
    useCORS: true
  });

  const imgData = canvas.toDataURL("image/png", 1.0);
  const { jsPDF } = window.jspdf;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: "a4"
  });

  // Fit image to page while preserving aspect ratio
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const imgW = canvas.width;
  const imgH = canvas.height;
  const ratio = Math.min(pageW / imgW, pageH / imgH);

  const w = imgW * ratio;
  const h = imgH * ratio;
  const x = (pageW - w) / 2;
  const y = (pageH - h) / 2;

  pdf.addImage(imgData, "PNG", x, y, w, h, undefined, "FAST");
  pdf.save(`advent-card-day-${activeDay}.pdf`);
}

/* =========================
   ❄️ Snowfall (inside .card)
   ========================= */

// ПУТИ К СНЕЖИНКАМ (подстрой под имена файлов в папке snowflakes/)
const snowflakeImages = [
  "snowflakes/snowflake1.png",
  "snowflakes/snowflake2.png",
  "snowflakes/snowflake3.png"
];

const snowLayer = document.getElementById("snowLayer");
const snowflakes = [];
let snowLastFrame = null;

function snowMaxCount(){
  // адаптивно: меньше на мобиле
  const w = snowLayer?.clientWidth || 800;
  if (w < 420) return 16;
  if (w < 820) return 24;
  return 34;
}

function createSnowflake(){
  const rectW = snowLayer.clientWidth;
  const rectH = snowLayer.clientHeight;

  const img = document.createElement("img");
  img.className = "snowflake";
  img.src = snowflakeImages[Math.floor(Math.random() * snowflakeImages.length)];
  img.alt = "";

  const startX = Math.random() * rectW;
  const startY = Math.random() * rectH; // часть уже "в воздухе"

  img.style.left = "0px";
  img.style.top = "0px";
  img.style.transform = `translate(${startX}px, ${startY}px)`;


  snowLayer.appendChild(img);

  snowflakes.push({
    el: img,
    x: startX,
    y: startY,
    speed: 18 + Math.random() * 28,     // скорость падения
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.6 + Math.random() * 0.8,
    swayAmplitude: 8 + Math.random() * 10
  });
}

function initSnowflakes(){
  if (!snowLayer) return;

  // очистка
  snowflakes.length = 0;
  snowLayer.innerHTML = "";

  const count = snowMaxCount();
  for (let i = 0; i < count; i++) createSnowflake();
  snowLastFrame = null;
}

function updateSnowfall(ts){
  if (!snowLayer) return;

  if (!snowLastFrame) snowLastFrame = ts;
  const delta = (ts - snowLastFrame) / 1000;
  snowLastFrame = ts;

  const rectW = snowLayer.clientWidth;
  const rectH = snowLayer.clientHeight;

  for (let i = 0; i < snowflakes.length; i++){
    const flake = snowflakes[i];

    flake.y += flake.speed * delta;
    flake.swayPhase += flake.swaySpeed * delta;

    const sway = Math.sin(flake.swayPhase) * flake.swayAmplitude;
    flake.el.style.transform = `translate(${flake.x + sway}px, ${flake.y}px)`;


    // если ушла вниз — возвращаем наверх
    if (flake.y > rectH + 40){
      flake.y = -40;
      flake.x = Math.random() * rectW;
      flake.el.style.left = flake.x + "px";
    }
  }

  requestAnimationFrame(updateSnowfall);
}

// старт
initSnowflakes();
requestAnimationFrame(updateSnowfall);

// ресайз: пересоздаём
let snowResizeT = null;
window.addEventListener("resize", () => {
  clearTimeout(snowResizeT);
  snowResizeT = setTimeout(initSnowflakes, 150);
});




/* =========================
   INIT
   ========================= */
wireModalClose();
buildDoors();

openGiftBtn.addEventListener("click", () => {
  closeModal(revealOverlay);
  openCard(activeDay);
});

downloadPngBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  await downloadAsPNG();
});

downloadPdfBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  e.stopPropagation();
  await downloadAsPDF();
});
