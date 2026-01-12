// === ДЕДЛАЙНЫ (здесь добавляйте свои даты) ===
// Формат: { title: "Задание 1", iso: "YYYY-MM-DDTHH:mm:ss+03:00" }
// Рекомендуется указывать часовой пояс +03:00, чтобы парсинг был однозначен.
const DEADLINES = [

    { title: "Задание 1", iso: "2026-01-09T23:59:59+03:00" },
    { title: "Задание 2", iso: "2026-01-10T23:59:59+03:00" },
    { title: "Задание 3", iso: "2026-01-11T23:59:59+03:00" },
    { title: "Задание 4", iso: "2026-01-12T23:59:59+03:00" }
  // Пример:
  // { title: "Задание 1", iso: "2026-01-20T23:59:59+03:00" },
  // { title: "Задание 2", iso: "2026-02-01T18:00:00+03:00" }
];

// === НАСТРОЙКИ ===
//const CSV_PATH = "https://docs.google.com/spreadsheets/d/1JJfgxFl6FczKSOeSQHRk20A-iQk83buj1fgbgPbRiVU/export?format=csv&gid=613453476";
const CSV_PATH = "https://docs.google.com/spreadsheets/d/1wI-uMysC7a4naxFDRIi8Es_FVe6kKCPfiOifz3jJV5w/export?format=csv&gid=613453476";

                  
const MAX_STARS = 12;
const TASKS_PER_STAR = 1;

// Элементы таймера
const timerNowEl = document.getElementById("timerNow");
const timerCountdownEl = document.getElementById("timerCountdown");

const statusEl = document.getElementById("status");
const gridEl = document.getElementById("grid");
const emptyEl = document.getElementById("empty");
const podiumEl = document.getElementById("podium");
const searchInput = document.getElementById("searchInput");

let allStudents = [];

/* ----------------- Таймер МСК / обратный отсчёт ----------------- */

// Получить ближайший будущий дедлайн из массива
function getNextDeadline() {
  const now = new Date();
  const parsed = DEADLINES
    .map((d, i) => {
      try {
        const dt = new Date(d.iso || d);
        return { index: i, title: d.title || `Задание ${i + 1}`, date: dt };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter(d => d.date instanceof Date && !Number.isNaN(d.date) && d.date > now)
    .sort((a, b) => a.date - b.date);

  return parsed.length > 0 ? parsed[0] : null;
}

// Формат времени до дедлайна: "DD д HH:MM:SS" или "HH:MM:SS" если <1 день
function formatTimeLeft(ms) {
  if (ms <= 0) return "00:00:00";
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;

  const two = (n) => String(n).padStart(2, "0");

  if (days > 0) {
    return `${days} д ${two(hours)}:${two(minutes)}:${two(seconds)}`;
  }
  return `${two(hours)}:${two(minutes)}:${two(seconds)}`;
}

// Обновить отображение текущего МСК времени и ближайшего дедлайна
function updateTimerDisplay() {
  // Текущее время в МСК строкой HH:MM:SS
  const now = new Date();
  const mskNow = now.toLocaleTimeString("ru-RU", { timeZone: "Europe/Moscow", hour12: false });
  if (timerNowEl) timerNowEl.textContent = `${mskNow} (МСК)`;

  const next = getNextDeadline();
  if (!timerCountdownEl) return;

  if (!next) {
    timerCountdownEl.textContent = "Нет предстоящих дедлайнов.";
    return;
  }

  // Разница между дедлайном и текущим моментом (UTC timeline корректен)
  const diff = next.date.getTime() - now.getTime();
  const left = formatTimeLeft(diff);

  timerCountdownEl.textContent = `Время до сдачи (${next.title}): ${left}`;
}

// Запуск обновления каждую секунду
function startDeadlineTimer() {
  updateTimerDisplay();
  setInterval(updateTimerDisplay, 1000);
}

/* ----------------- Конец таймера ----------------- */

// ====== ЗАГРУЗКА CSV ======
async function loadCSV() {
  try {
    statusEl.textContent = "Загружаю данные из CSV…";
    const res = await fetch(CSV_PATH);
    if (!res.ok) {
      throw new Error("Не получилось загрузить CSV: " + res.status);
    }

    const text = await res.text();
    console.log("CSV текст:", text.slice(0, 200));
    const students = parseCSV(text);
    allStudents = students;

    if (students.length === 0) {
      statusEl.textContent = "Записей пока нет.";
    } else {
      statusEl.textContent = "Загружено участников: " + students.length;
    }

    renderAll();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Ошибка загрузки данных. Не удалось получить данные из таблицы.";
    gridEl.innerHTML = "";
    if (podiumEl) podiumEl.innerHTML = "";
    emptyEl.style.display = "block";
  }
}

// ====== ПАРСЕР CSV ======
// Новая структура CSV (позиции колонок):
// 0 - ссылка на ВК (profile)
// 1 - имя участника (name)
// 2 - ссылка на изображение аватара (avatar)
// 3..10 - 8 полей заданий (значения пусто / 0 / 1)
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  // Пробуем определить, есть ли заголовок и пропустить его.
  const maybeHeader = lines[0].toLowerCase();
  const hasHeader = maybeHeader.includes("vk") || maybeHeader.includes("имя") || maybeHeader.includes("avatar") || maybeHeader.includes("avatar");
  const startIndex = hasHeader ? 1 : 0;

  const students = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Простой CSV-split (в текущем проекте уже используется аналогичная логика).
    // Если в будущем появятся кавычки/запятые в полях — нужно заменить на robust CSV parser.
    const parts = line.split(",");

    const profile = (parts[0] || "").trim();
    const name = (parts[1] || "").trim();
    const avatar = (parts[2] || "").trim();

    // Собираем 8 полей заданий (индексы 3..10)
    const tasks = [];
    for (let t = 3; t <= 10; t++) {
      const raw = parts[t] !== undefined ? String(parts[t]).trim() : "";
      if (raw === "") {
        tasks.push(null); // пустое поле
      } else if (raw === "0") {
        tasks.push(0);
      } else if (raw === "1") {
        tasks.push(1);
      } else {
        // Если приходит число в виде ' 1 ' или '1.0' — попытаемся привести
        const n = Number(raw);
        if (!Number.isNaN(n) && (n === 0 || n === 1)) tasks.push(n);
        else tasks.push(null);
      }
    }

    // Если нет имени — пропускаем
    if (!name) continue;

    // Считаем выполненные (единицы)
    const completed = tasks.reduce((s, v) => s + (v === 1 ? 1 : 0), 0);

    students.push({ profile, name, avatar, tasks, completed });
  }

  return students;
}

// ====== ГЛАВНЫЙ РЕНДЕР (топ-3 + список) ======
function renderAll(filterText = "") {
  const q = filterText.trim().toLowerCase();

  // 1) Подиум всегда считаем по всем ученикам
  if (!allStudents || allStudents.length === 0) {
    renderPodium([]);
  } else {
    const sortedByScoreAll = allStudents
      .slice()
      .sort((a, b) => {
        if (b.completed !== a.completed) return b.completed - a.completed;
        return a.name.localeCompare(b.name, "ru");
      });

    // ВАЖНО: выбираем не просто первые 3, а случайных людей из группы с наибольшим количеством сданных работ.
    const top3All = pickRandomTop3ByScore(sortedByScoreAll);
    renderPodium(top3All);
  }

  // 2) Список ниже — с фильтром
  let filtered = allStudents.slice();

  if (q) {
    filtered = filtered.filter(st =>
      st.name.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    gridEl.innerHTML = "";
    emptyEl.style.display = "block";
    return;
  } else {
    emptyEl.style.display = "none";
  }

  // Список по алфавиту
  const listSorted = filtered.slice().sort((a, b) =>
    a.name.localeCompare(b.name, "ru")
  );

  renderGrid(listSorted);
}

/**
 * Выбрать до 3 участников случайным образом, отдавая приоритет участникам
 * с наибольшим количеством сданных работ. Алгоритм:
 * - Группируем участников по completed (по убыванию).
 * - Берём группы по одной, перемешиваем группу и добавляем участников, пока не набрали 3.
 * - Если после лучших групп меньше 3 — продолжаем со следующими группами.
 */
function pickRandomTop3ByScore(sortedDescStudents) {
  if (!sortedDescStudents || sortedDescStudents.length === 0) return [];

  // Группируем по completed (sortedDescStudents уже отсортирован по completed desc)
  const groups = [];
  let currentScore = null;
  let currentGroup = [];
  for (const s of sortedDescStudents) {
    if (currentScore === null) {
      currentScore = s.completed;
      currentGroup = [s];
    } else if (s.completed === currentScore) {
      currentGroup.push(s);
    } else {
      groups.push({ score: currentScore, items: currentGroup.slice() });
      currentScore = s.completed;
      currentGroup = [s];
    }
  }
  if (currentGroup.length > 0) groups.push({ score: currentScore, items: currentGroup.slice() });

  const result = [];
  for (const g of groups) {
    // Перемешиваем группу (Fisher-Yates)
    shuffleArray(g.items);
    for (const item of g.items) {
      if (result.length < 3) result.push(item);
      else break;
    }
    if (result.length >= 3) break;
  }

  return result;
}

// Простой in-place Fisher-Yates shuffle
function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}


/* ====== ПОДИУМ (топ-3) ======
   renderPodium остаётся без изменений и корректно отрисует
   результаты, даже если top3 содержит < 3 элементов.
*/
function renderPodium(top3) {
  if (!podiumEl) return;
  podiumEl.innerHTML = "";

  if (!top3 || top3.length === 0) {
    const msg = document.createElement("div");
    msg.className = "meta";
    msg.textContent = "Пока недостаточно данных для отображения лидеров.";
    podiumEl.appendChild(msg);
    return;
  }

  const positions = [
    { index: 1, className: "silver", place: 2 },
    { index: 0, className: "gold",   place: 1 },
    { index: 2, className: "bronze", place: 3 }
  ];

  positions.forEach(pos => {
    const st = top3[pos.index];
    if (!st) return;

    const card = createStudentCard(st);
    card.classList.add(pos.className);

    const badge = document.createElement("div");
    badge.className = "place-badge";
    badge.textContent = pos.place + " место";
    card.appendChild(badge);

    podiumEl.appendChild(card);
  });
}

// ====== СЕТКА (Табличные строки пользователей) ======
function renderGrid(students) {
  gridEl.innerHTML = "";
  students.forEach(st => {
    const row = createStudentRow(st);
    gridEl.appendChild(row);
  });
}

// ====== СТРОКА УЧЕНИКА (новая) ======
function createStudentRow(st) {
  const row = document.createElement("article");
  row.className = "student-row";
  row.tabIndex = 0;

  // Аватар с ссылкой (profile)
  let avatarCore;
  if (st.avatar) {
    const img = document.createElement("img");
    img.src = st.avatar;
    img.alt = st.name + " — аватар";
    img.className = "student-avatar-img";
    avatarCore = img;
  } else {
    const div = document.createElement("div");
    div.className = "student-avatar-fallback";
    div.textContent = getInitials(st.name);
    avatarCore = div;
  }

  if (st.profile) {
    const a = document.createElement("a");
    a.href = st.profile;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.className = "student-avatar-link";
    a.appendChild(avatarCore);
    row.appendChild(a);
  } else {
    const wrap = document.createElement("div");
    wrap.className = "student-avatar-link";
    wrap.appendChild(avatarCore);
    row.appendChild(wrap);
  }

  // Имя
  const nameEl = document.createElement("div");
  nameEl.className = "student-name";
  nameEl.textContent = st.name;
  row.appendChild(nameEl);

  // Ячейки заданий — каждая ячейка показывает номер задания (1..8).
  // Если в TASK_LINKS указан URL — ячейка становится ссылкой, открывается в новом окне.
  const tasksWrap = document.createElement("div");
  tasksWrap.className = "tasks-cells";

  st.tasks.forEach((val, idx) => {
    const label = String(idx + 1);
    const href = TASK_LINKS[idx] && TASK_LINKS[idx].trim() !== "" ? TASK_LINKS[idx].trim() : null;

    let cellEl;
    if (href) {
      const a = document.createElement("a");
      a.className = "task-cell task-link";
      a.href = href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = label;
      cellEl = a;
    } else {
      const div = document.createElement("div");
      div.className = "task-cell";
      div.textContent = label;
      cellEl = div;
    }

    const statusText = val === 1 ? "выполнено" : val === 0 ? "не выполнено" : "нет данных";
    cellEl.setAttribute("role", "img");
    cellEl.setAttribute("aria-label", `Задание ${idx + 1}: ${statusText}`);
    cellEl.title = `Задание ${idx + 1}: ${statusText}`;

    if (val === null) {
      cellEl.classList.add("cell-empty");
    } else if (val === 0) {
      cellEl.classList.add("cell-zero");
    } else if (val === 1) {
      cellEl.classList.add("cell-one");
    } else {
      cellEl.classList.add("cell-empty");
    }

    tasksWrap.appendChild(cellEl);
  });

  row.appendChild(tasksWrap);

  if (st.completed === 8) {
    row.classList.add("completed-all");
  }

  return row;
}

// ====== КАРТОЧКА УЧЕНИКА (оставляем для подиума) ======
function createStudentCard(st) {
  const card = document.createElement("article");
  card.className = "card";

  // особые рамки
  const specialType = getSpecialType(st.name);
  if (specialType) {
    card.classList.add("special-" + specialType);
  }

  const wrap = document.createElement("div");
  wrap.className = "avatar-wrap";

  const avatarEl = createAvatarElement(st);

  const starsRing = document.createElement("div");
  starsRing.className = "stars-ring";

  // котики/зайки для Дениса и Анны
  if (specialType === "denis") {
    placeEmojiRing(starsRing, st.completed, "🐱");
  } else if (specialType === "anna") {
    placeEmojiRing(starsRing, st.completed, "🐰");
  } else {
    placeStars(starsRing, st.completed);
  }

  wrap.appendChild(avatarEl);
  wrap.appendChild(starsRing);

  const nameEl = document.createElement("div");
  nameEl.className = "name";

  const parts = st.name.split(" ").filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ") || "";

  nameEl.innerHTML = `
    <div>${firstName}</div>
    <div>${lastName}</div>
  `;

  const metaEl = document.createElement("div");
  metaEl.className = "meta";
  metaEl.innerHTML = `Выполнено заданий: <strong>${st.completed}</strong>`;

  card.appendChild(wrap);
  card.appendChild(nameEl);
  card.appendChild(metaEl);

  return card;
}

// ====== АВАТАР ======
function createAvatarElement(st) {
  let core;
  if (st.avatar) {
    const img = document.createElement("img");
    img.src = st.avatar;
    img.alt = st.name;
    img.className = "avatar";
    core = img;
  } else {
    const div = document.createElement("div");
    div.className = "avatar";
    div.textContent = getInitials(st.name);
    core = div;
  }

  if (st.profile) {
    const link = document.createElement("a");
    link.href = st.profile;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "avatar-link";
    link.appendChild(core);
    return link;
  }

  return core;
}

// ====== ВСПОМОГАТЕЛЬНЫЕ ======
function getSpecialType(name) {
  const n = name.toLowerCase();

  if (n.includes("денис") && n.includes("жихар")) return "denis";
  if (n.includes("анна") && n.includes("кудряв")) return "anna";
  if (n.includes("динара") && n.includes("губайд")) return "dinara";
  if (n.includes("любов") && n.includes("заруб")) return "lyuba";

  return null;
}

function getInitials(fullName) {
  const parts = fullName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

// ====== ЗВЁЗДЫ и остальные функции (placeStars, placeEmojiRing и т.д.) остаются без изменений ======
// -- вставляем существующие функции placeStars и placeEmojiRing ниже (не трогаем) --
function placeStars(container, completed) {
  container.innerHTML = "";
  if (completed <= 0) return;

  const big = Math.floor(completed / 5);
  const small = completed % 5;

  const bigRadius = 42;
  const smallRadius = 38;
  const bigSize = 20;
  const smallSize = 12;

  const toRad = (deg) => deg * Math.PI / 180;

  // верхняя дуга — большие
  if (big > 0) {
    const startTop = -160;
    const endTop   = -20;
    const stepTop = (endTop - startTop) / (big + 1);

    for (let i = 0; i < big; i++) {
      const angleDeg = startTop + stepTop * (i + 1);
      const angle = toRad(angleDeg);

      const x = bigRadius * Math.cos(angle);
      const y = bigRadius * Math.sin(angle);

      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "★";
      star.style.fontSize = bigSize + "px";
      star.style.transform =
        `translate(-50%, -50%) translate(${x}px, ${y}px)`;

      container.appendChild(star);
    }
  }

  // нижняя дуга — маленькие
  if (small > 0) {
    const startBottom = 20;
    const endBottom   = 160;
    const stepBottom = (endBottom - startBottom) / (small + 1);

    for (let i = 0; i < small; i++) {
      const angleDeg = startBottom + stepBottom * (i + 1);
      const angle = toRad(angleDeg);

      const x = smallRadius * Math.cos(angle);
      const y = smallRadius * Math.sin(angle);

      const star = document.createElement("span");
      star.className = "star";
      star.textContent = "★";
      star.style.fontSize = smallSize + "px";
      star.style.transform =
        `translate(-50%, -50%) translate(${x}px, ${y}px)`;

      container.appendChild(star);
    }
  }
}

function placeEmojiRing(container, completed, emoji) {
  container.innerHTML = "";

  const big = 3;   // ВСЕГДА три крупных сверху
  const small = 3; // ВСЕГДА три мелких снизу

  const bigRadius = 42;
  const smallRadius = 38;
  const bigSize = 22;
  const smallSize = 16;

  const toRad = (deg) => deg * Math.PI / 180;

  const startTop = -160;
  const endTop   = -20;
  const stepTop = (endTop - startTop) / (big + 1);

  for (let i = 0; i < big; i++) {
    const angleDeg = startTop + stepTop * (i + 1);
    const angle = toRad(angleDeg);

    const x = bigRadius * Math.cos(angle);
    const y = bigRadius * Math.sin(angle);

    const node = document.createElement("span");
    node.className = "star";
    node.textContent = emoji;
    node.style.fontSize = bigSize + "px";
    node.style.transform =
      `translate(-50%, -50%) translate(${x}px, ${y}px)`;

    container.appendChild(node);
  }

  const startBottom = 20;
  const endBottom   = 160;
  const stepBottom = (endBottom - startBottom) / (small + 1);

  for (let i = 0; i < small; i++) {
    const angleDeg = startBottom + stepBottom * (i + 1);
    const angle = toRad(angleDeg);

    const x = smallRadius * Math.cos(angle);
    const y = smallRadius * Math.sin(angle);

    const node = document.createElement("span");
    node.className = "star";
    node.textContent = emoji;
    node.style.fontSize = smallSize + "px";
    node.style.transform =
      `translate(-50%, -50%) translate(${x}px, ${y}px)`;

    container.appendChild(node);
  }
}

// === ССЫЛКИ НА ЗАДАНИЯ (вставьте сюда ваши URL)
// Порядок: TASK_LINKS[0] — ссылка для задания 1, TASK_LINKS[1] — для задания 2 и т.д.
const TASK_LINKS = [
  "https://vk.ru/wall-137991294_64622", // задача 1 — вставьте URL, например "https://site.example/task1"
  "https://vk.ru/wall-137991294_64657", // задача 2
  "https://vk.ru/wall-137991294_64657", // задача 3
  "https://vk.ru/wall-137991294_64657", // задача 4
  "https://vk.ru/wall-137991294_64657", // задача 5
  "https://vk.ru/wall-137991294_64657", // задача 6
  "https://vk.ru/wall-137991294_64657", // задача 7
  "https://vk.ru/wall-137991294_64657"  // задача 8
];

// ====== ПОИСК ======
if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    renderAll(e.target.value);
  });
}

// Старт
startDeadlineTimer();
loadCSV();
