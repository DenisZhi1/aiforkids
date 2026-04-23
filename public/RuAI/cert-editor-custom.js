const CERTIFICATE_EDITOR_STATE_VERSION = 1;
const CUSTOM_EDITOR_STORAGE_KEY = `cert-editor-custom-${CERTIFICATE_EDITOR_STATE_VERSION}`;

// ВСТАВЬТЕ СЮДА ССЫЛКУ ИЛИ ПУТЬ К НОВОМУ PNG-СЕРТИФИКАТУ.
const TEMPLATE_IMAGE_URL = "cert/happyfarmer.png";

const DEFAULT_NAME = "Имя Фамилия";
const REVIEW_URL = "https://vk.ru/deandal?w=wall-137991294_66385";

const DEFAULTS = {
  nameX: 1379,
  nameY: 935,
  nameFontFamily: '"Sofia Sans Condensed", sans-serif',
  nameFontWeight: "686",
  nameFontSize: 147,
  dateX: 1851,
  dateY: 1181,
  dateFontWeight: "400",
  dateFontSize: 50
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
const DATE_FONT_STACK = '"Glacial Indifference", "Montserrat", "Arial Narrow", Arial, sans-serif';
const NAME_FILL_STYLE = "#24207a";
const DATE_FILL_STYLE = "#414141";

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
const dateInput = document.getElementById("dateInput");
const dateXInput = document.getElementById("dateXInput");
const dateYInput = document.getElementById("dateYInput");
const dateSizeInput = document.getElementById("dateSizeInput");
const dateSizeValue = document.getElementById("dateSizeValue");
const dateWeightInput = document.getElementById("dateWeightInput");
const dateWeightValue = document.getElementById("dateWeightValue");

const state = {
  ...DEFAULTS,
  ...loadStoredSettings(CUSTOM_EDITOR_STORAGE_KEY),
  name: DEFAULT_NAME,
  date: formatToday()
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
  state.dateFontWeight = String(clamp(Number(state.dateFontWeight) || Number(DEFAULTS.dateFontWeight), FONT_WEIGHT_MIN, FONT_WEIGHT_MAX));
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

  dateInput.addEventListener("input", () => {
    state.date = dateInput.value;
    renderAndPersist();
  });

  dateXInput.addEventListener("input", () => {
    state.dateX = parseNumberInput(dateXInput, state.dateX);
    renderAndPersist();
  });

  dateYInput.addEventListener("input", () => {
    state.dateY = parseNumberInput(dateYInput, state.dateY);
    renderAndPersist();
  });

  dateSizeInput.addEventListener("input", () => {
    state.dateFontSize = parseNumberInput(dateSizeInput, state.dateFontSize);
    syncSizeDisplays();
    renderAndPersist();
  });

  dateWeightInput.addEventListener("input", () => {
    state.dateFontWeight = dateWeightInput.value;
    syncWeightDisplays();
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
  editorSubtitle.textContent = "Отдельная копия редактора для следующего PNG-шаблона.";
}

function loadTemplate() {
  const imageUrl = String(TEMPLATE_IMAGE_URL || "").trim();

  if (!imageUrl) {
    statusMessage.textContent = "Укажите ссылку на PNG-шаблон в cert-editor-custom.js в константе TEMPLATE_IMAGE_URL.";
    downloadButton.disabled = true;
    return;
  }

  statusMessage.textContent = "Загружаем новый PNG-шаблон сертификата…";
  templateImage.onload = async () => {
    templateLoaded = true;
    canvas.width = templateImage.naturalWidth;
    canvas.height = templateImage.naturalHeight;
    clampSettingsToCanvas();
    syncInputsFromState();
    await waitForFonts();
    renderCertificate();
    downloadButton.disabled = false;
    statusMessage.textContent = "Готово. Можешь настраивать новый сертификат.";
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
  dateInput.value = state.date;
  dateXInput.value = String(state.dateX);
  dateYInput.value = String(state.dateY);
  dateSizeInput.value = String(state.dateFontSize);
  dateWeightInput.value = String(state.dateFontWeight);
  syncWeightDisplays();
  syncSizeDisplays();
}

function syncWeightDisplays() {
  nameWeightValue.textContent = String(state.nameFontWeight);
  dateWeightValue.textContent = String(state.dateFontWeight);
}

function syncSizeDisplays() {
  nameSizeValue.textContent = String(state.nameFontSize);
  dateSizeValue.textContent = String(state.dateFontSize);
}

function renderAndPersist() {
  saveStoredSettings(CUSTOM_EDITOR_STORAGE_KEY, {
    nameX: state.nameX,
    nameY: state.nameY,
    nameFontFamily: state.nameFontFamily,
    nameFontWeight: state.nameFontWeight,
    nameFontSize: state.nameFontSize,
    dateX: state.dateX,
    dateY: state.dateY,
    dateFontWeight: state.dateFontWeight,
    dateFontSize: state.dateFontSize
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

  drawText({
    text: state.date,
    x: state.dateX,
    y: state.dateY,
    fontSize: state.dateFontSize,
    fontWeight: state.dateFontWeight,
    fontFamily: DATE_FONT_STACK,
    fillStyle: DATE_FILL_STYLE
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
  statusMessage.textContent = "Готовим PNG для скачивания…";

  try {
    await waitForFonts();
    renderCertificate();

    const safeName = slugify(state.name || "student");
    const downloadName = `certificate-custom-${safeName || "student"}.png`;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = downloadName;
    link.click();
    statusMessage.textContent = `PNG готов. Скачан файл ${downloadName}.`;
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
  state.dateX = clamp(Math.round(state.dateX), 0, canvas.width);
  state.dateY = clamp(Math.round(state.dateY), 0, canvas.height);
  state.nameFontSize = clamp(Math.round(state.nameFontSize), 12, 240);
  state.dateFontSize = clamp(Math.round(state.dateFontSize), 12, 160);
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

function formatToday() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  return `${day}.${month}.${year}`;
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

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
