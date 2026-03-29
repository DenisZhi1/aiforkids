const CERTIFICATE_EDITOR_STATE_VERSION = 2;
const CUSTOM_EDITOR_STORAGE_KEY = `cert-editor-custom-${CERTIFICATE_EDITOR_STATE_VERSION}`;

// ВСТАВЬТЕ СЮДА ССЫЛКУ ИЛИ ПУТЬ К НОВОМУ PNG-СЕРТИФИКАТУ.
const TEMPLATE_IMAGE_URL = "cert/happyfarmer.png";

const DEFAULT_NAME = "Имя Фамилия";
const REVIEW_URL = "https://vk.ru/wall-137991294_66385";

const DEFAULTS = {
  nameX: 1379,
  nameY: 992,
  nameFontFamily: '"Sofia Sans Condensed", sans-serif',
  nameFontWeight: "448",
  nameFontSize: 93
};

const NAME_FONT_OPTIONS = [
  { label: "Times New Roman", value: '"Times New Roman", Georgia, serif' },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Garamond", value: 'Garamond, "Times New Roman", serif' },
  { label: "Advent Pro", value: '"Advent Pro", sans-serif' },
  { label: "Montserrat", value: '"Montserrat", Arial, sans-serif' },
  { label: "Sofia Sans Condensed", value: '"Sofia Sans Condensed", sans-serif' },
  { label: "Trebuchet MS", value: '"Trebuchet MS", Arial, sans-serif' },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Courier New", value: '"Courier New", monospace' }
];

const FONT_WEIGHT_MIN = 100;
const FONT_WEIGHT_MAX = 900;
const NAME_FILL_STYLE = "#000000";

const editorTitle = document.getElementById("editorTitle");
const editorSubtitle = document.getElementById("editorSubtitle");
const downloadButton = document.getElementById("downloadButton");
const statusMessage = document.getElementById("statusMessage");
const canvas = document.getElementById("certificateCanvas");
const ctx = canvas.getContext("2d");
const celebrationModal = document.getElementById("celebrationModal");
const celebrationCloseButton = document.getElementById("celebrationCloseButton");

const nameInput = document.getElementById("nameInput");
const nameXInput = document.getElementById("nameXInput");
const nameYInput = document.getElementById("nameYInput");
const nameFontInput = document.getElementById("nameFontInput");
const nameWeightInput = document.getElementById("nameWeightInput");
const nameWeightValue = document.getElementById("nameWeightValue");
const nameSizeInput = document.getElementById("nameSizeInput");
const nameSizeValue = document.getElementById("nameSizeValue");

const state = {
  ...DEFAULTS,
  ...loadStoredSettings(CUSTOM_EDITOR_STORAGE_KEY),
  name: DEFAULT_NAME
};

const templateImage = new Image();
let templateLoaded = false;

populateFontOptions();
ensureValidFontFamily();
ensureValidWeights();
syncInputsFromState();
bindControls();
bindCelebrationModal();
updateHeader();
loadTemplate();

function populateFontOptions() {
  const optionsMarkup = NAME_FONT_OPTIONS.map((font) => {
    return `<option value="${escapeHtml(font.value)}">${escapeHtml(font.label)}</option>`;
  }).join("");
  nameFontInput.innerHTML = optionsMarkup;
}

function ensureValidFontFamily() {
  const isKnownFont = NAME_FONT_OPTIONS.some((font) => font.value === state.nameFontFamily);
  if (!isKnownFont) {
    state.nameFontFamily = DEFAULTS.nameFontFamily;
  }
}

function ensureValidWeights() {
  state.nameFontWeight = String(clamp(Number(state.nameFontWeight) || Number(DEFAULTS.nameFontWeight), FONT_WEIGHT_MIN, FONT_WEIGHT_MAX));
}

function bindControls() {
  nameInput.addEventListener("input", () => {
    state.name = nameInput.value;
    renderAndPersist();
  });

  nameXInput.addEventListener("input", () => {
    state.nameX = parseNumberInput(nameXInput, state.nameX);
    renderAndPersist();
  });

  nameYInput.addEventListener("input", () => {
    state.nameY = parseNumberInput(nameYInput, state.nameY);
    renderAndPersist();
  });

  nameFontInput.addEventListener("change", () => {
    state.nameFontFamily = nameFontInput.value;
    renderAndPersist();
  });

  nameWeightInput.addEventListener("input", () => {
    state.nameFontWeight = nameWeightInput.value;
    syncWeightDisplays();
    renderAndPersist();
  });

  nameSizeInput.addEventListener("input", () => {
    state.nameFontSize = parseNumberInput(nameSizeInput, state.nameFontSize);
    syncSizeDisplays();
    renderAndPersist();
  });

  downloadButton.addEventListener("click", downloadCertificate);
}

function bindCelebrationModal() {
  if (!celebrationModal) return;

  celebrationCloseButton?.addEventListener("click", hideCelebrationModal);
  celebrationModal.querySelectorAll("[data-modal-close=\"true\"]").forEach((node) => {
    node.addEventListener("click", hideCelebrationModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && celebrationModal.getAttribute("aria-hidden") === "false") {
      hideCelebrationModal();
    }
  });
}

function updateHeader() {
  editorTitle.textContent = "Редактор сертификата";
  editorSubtitle.textContent = "Одна страница для настройки и скачивания сертификата.";
}

function loadTemplate() {
  const imageUrl = String(TEMPLATE_IMAGE_URL || "").trim();

  if (!imageUrl) {
    statusMessage.textContent = "Укажите ссылку на PNG-шаблон в cert-editor-custom.js в константе TEMPLATE_IMAGE_URL.";
    downloadButton.disabled = true;
    return;
  }

  statusMessage.textContent = "Загружаем шаблон сертификата…";
  templateImage.onload = async () => {
    templateLoaded = true;
    canvas.width = templateImage.naturalWidth;
    canvas.height = templateImage.naturalHeight;
    clampSettingsToCanvas();
    syncInputsFromState();
    await waitForFonts();
    renderCertificate();
    downloadButton.disabled = false;
    statusMessage.textContent = "Готово. Можешь настраивать и скачивать сертификат.";
  };

  templateImage.onerror = () => {
    statusMessage.textContent = "Не удалось загрузить PNG-шаблон. Проверьте ссылку в TEMPLATE_IMAGE_URL.";
  };

  templateImage.src = imageUrl;
}

function syncInputsFromState() {
  nameInput.value = state.name;
  nameXInput.value = String(state.nameX);
  nameYInput.value = String(state.nameY);
  nameFontInput.value = state.nameFontFamily;
  nameWeightInput.value = String(state.nameFontWeight);
  nameSizeInput.value = String(state.nameFontSize);
  syncWeightDisplays();
  syncSizeDisplays();
}

function syncWeightDisplays() {
  nameWeightValue.textContent = String(state.nameFontWeight);
}

function syncSizeDisplays() {
  nameSizeValue.textContent = String(state.nameFontSize);
}

function renderAndPersist() {
  saveStoredSettings(CUSTOM_EDITOR_STORAGE_KEY, {
    nameX: state.nameX,
    nameY: state.nameY,
    nameFontFamily: state.nameFontFamily,
    nameFontWeight: state.nameFontWeight,
    nameFontSize: state.nameFontSize
  });

  if (!templateLoaded) return;
  renderCertificate();
}

function renderCertificate() {
  if (!templateLoaded) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(templateImage, 0, 0, canvas.width, canvas.height);

  drawText({
    text: state.name,
    x: state.nameX,
    y: state.nameY,
    fontSize: state.nameFontSize,
    fontWeight: state.nameFontWeight,
    fontFamily: state.nameFontFamily,
    fillStyle: NAME_FILL_STYLE
  });
}

function drawText({ text, x, y, fontSize, fontWeight, fontFamily, fillStyle }) {
  if (!text) return;

  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.fillText(text, x, y);
  ctx.restore();
}

async function downloadCertificate() {
  if (!templateLoaded) return;

  downloadButton.disabled = true;
  statusMessage.textContent = "Готовим сертификат для скачивания…";

  try {
    await waitForFonts();
    renderCertificate();

    const safeName = slugify(state.name || "student");
    const downloadName = `certificate-custom-${safeName || "student"}.png`;
    const certificateBlob = await canvasToBlob(canvas);
    const link = document.createElement("a");
    const objectUrl = URL.createObjectURL(certificateBlob);
    link.href = objectUrl;
    link.download = downloadName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    statusMessage.textContent = `Сертификат готов. Скачан файл ${downloadName}.`;
    showCelebrationModal();
  } finally {
    downloadButton.disabled = false;
  }
}

function showCelebrationModal() {
  if (!celebrationModal) return;
  celebrationModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function hideCelebrationModal() {
  if (!celebrationModal) return;
  celebrationModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function clampSettingsToCanvas() {
  if (!canvas.width || !canvas.height) return;

  state.nameX = clamp(Math.round(state.nameX), 0, canvas.width);
  state.nameY = clamp(Math.round(state.nameY), 0, canvas.height);
  state.nameFontSize = clamp(Math.round(state.nameFontSize), 12, 240);
}

function parseNumberInput(input, fallback) {
  const parsed = Number(input.value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.round(parsed);
}

function loadStoredSettings(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveStoredSettings(storageKey, settings) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings));
  } catch {
    // Игнорируем storage errors, чтобы редактор продолжал работать.
  }
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function waitForFonts() {
  if (document.fonts && document.fonts.ready) {
    return document.fonts.ready.catch(() => undefined);
  }
  return Promise.resolve();
}

function canvasToBlob(canvasElement) {
  return new Promise((resolve, reject) => {
    canvasElement.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }

      reject(new Error("Не удалось подготовить PNG сертификата."));
    }, "image/png");
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
