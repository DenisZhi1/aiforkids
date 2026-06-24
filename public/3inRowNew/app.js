const SIZE = 8;
const START_MOVES = 30;
const HINT_DELAY = 5000;
const LEADERBOARD_KEY = "match3_edu_leaderboard";
const THEME_KEY = "match3_edu_theme";
const SOUND_KEY = "match3_edu_sound";

const AUTHOR_HTML = `<a href="https://vk.com/deandal" target="_blank" rel="noopener noreferrer" class="ribbon-vk-link"><span class="vk-badge">ВК</span>Сладкая школа · <strong>@deandal</strong></a>`;
let messageResetTimer = null;

const pieceTypes = [
  { type: "red", name: "красный кристалл", goal: true },
  { type: "yellow", name: "желтый лист" },
  { type: "orange", name: "оранжевый самоцвет", goal: true },
  { type: "green", name: "зеленый камень" },
  { type: "blue", name: "голубой ромб" },
  { type: "purple", name: "фиолетовая конфета" }
];

const pieceMap = Object.fromEntries(pieceTypes.map((piece) => [piece.type, piece]));

const tasks = [
  { id: "quiz_001", type: "quiz", title: "Квиз", question: "Какая планета третья от Солнца?", options: ["Земля", "Марс", "Венера", "Юпитер"], answer: "Земля", explanation: "Земля находится третьей от Солнца.", points: 50 },
  { id: "quiz_002", type: "quiz", title: "Квиз", question: "Как называется столица России?", options: ["Москва", "Санкт-Петербург", "Казань", "Новосибирск"], answer: "Москва", explanation: "Столица России - Москва.", points: 50 },
  { id: "quiz_003", type: "quiz", title: "Квиз", question: "Сколько месяцев в году?", options: ["12", "10", "11", "13"], answer: "12", explanation: "В году 12 месяцев.", points: 50 },
  { id: "quiz_004", type: "quiz", title: "Квиз", question: "Какая фигура имеет три стороны?", options: ["Треугольник", "Квадрат", "Круг", "Прямоугольник"], answer: "Треугольник", explanation: "У треугольника три стороны.", points: 50 },
  { id: "quiz_005", type: "quiz", title: "Квиз", question: "Что нужно растению для роста?", options: ["Свет, вода и воздух", "Только песок", "Только камни", "Только темнота"], answer: "Свет, вода и воздух", explanation: "Растениям нужны свет, вода и воздух.", points: 50 },
  { id: "math_001", type: "math", title: "Математика", question: "У Пети было 36 карандашей. Он подарил 9. Сколько осталось?", options: ["27", "26", "28", "25"], answer: "27", explanation: "36 - 9 = 27.", points: 50 },
  { id: "math_002", type: "math", title: "Математика", question: "В одной коробке 6 конфет. Сколько конфет в 4 таких коробках?", options: ["24", "20", "22", "26"], answer: "24", explanation: "6 x 4 = 24.", points: 50 },
  { id: "math_003", type: "math", title: "Математика", question: "48 открыток разложили поровну в 6 конвертов. Сколько открыток в каждом?", options: ["8", "6", "7", "9"], answer: "8", explanation: "48 : 6 = 8.", points: 50 },
  { id: "math_004", type: "math", title: "Математика", question: "Периметр квадрата со стороной 5 см равен...", options: ["20 см", "10 см", "25 см", "15 см"], answer: "20 см", explanation: "У квадрата 4 равные стороны: 5 x 4 = 20 см.", points: 50 },
  { id: "match_001", type: "match_pairs", title: "Соедини пары", question: "Соедини величину и единицу измерения.", pairs: [{ left: "Длина", right: "сантиметр" }, { left: "Масса", right: "килограмм" }, { left: "Время", right: "минута" }], explanation: "Длину измеряют в сантиметрах, массу - в килограммах, время - в минутах.", points: 50 },
  { id: "match_002", type: "match_pairs", title: "Соедини пары", question: "Соедини слово и часть речи.", pairs: [{ left: "Бежит", right: "глагол" }, { left: "Книга", right: "существительное" }, { left: "Красивый", right: "прилагательное" }], explanation: "Глагол обозначает действие, существительное - предмет, прилагательное - признак.", points: 50 },
  { id: "fill_001", type: "fill_blank", title: "Вставь ответ", question: "Продолжи ряд: 3, 6, 9, 12, ...", answer: "15", explanation: "Каждое число увеличивается на 3.", points: 50 },
  { id: "fill_002", type: "fill_blank", title: "Вставь ответ", question: "Если 9 x 4 = 36, то 36 : 4 = ...", answer: "9", explanation: "36 : 4 = 9.", points: 50 },
  { id: "fill_003", type: "fill_blank", title: "Вставь ответ", question: "Главные члены предложения - подлежащее и ...", answer: "сказуемое", explanation: "Главные члены предложения: подлежащее и сказуемое.", points: 50 },
  { id: "logic_001", type: "logic", title: "Логика", question: "Что лишнее: яблоко, груша, морковь, слива?", options: ["Морковь", "Яблоко", "Груша", "Слива"], answer: "Морковь", explanation: "Морковь - овощ, остальные - фрукты.", points: 50 },
  { id: "logic_002", type: "logic", title: "Логика", question: "Какое число следующее: 2, 4, 8, 16, ...", options: ["32", "24", "20", "18"], answer: "32", explanation: "Каждое число умножается на 2.", points: 50 },
  { id: "logic_003", type: "logic", title: "Логика", question: "Что тяжелее: 1 кг ваты или 1 кг железа?", options: ["Одинаково", "Железо", "Вата", "Нельзя узнать"], answer: "Одинаково", explanation: "1 кг всегда равен 1 кг.", points: 50 },
  // Дополнительные квиз
  { id: "quiz_006", type: "quiz", title: "Квиз", question: "Сколько сторон у шестиугольника?", options: ["6", "4", "5", "8"], answer: "6", explanation: "Шестиугольник — 6 сторон.", points: 50 },
  { id: "quiz_007", type: "quiz", title: "Квиз", question: "Какое животное самое высокое в мире?", options: ["Жираф", "Слон", "Верблюд", "Лось"], answer: "Жираф", explanation: "Жираф — самое высокое наземное животное.", points: 50 },
  { id: "quiz_008", type: "quiz", title: "Квиз", question: "Из чего делают бумагу?", options: ["Из дерева", "Из камня", "Из металла", "Из стекла"], answer: "Из дерева", explanation: "Бумагу делают из древесной целлюлозы.", points: 50 },
  { id: "quiz_009", type: "quiz", title: "Квиз", question: "Сколько цветов у радуги?", options: ["7", "5", "6", "8"], answer: "7", explanation: "Красный, оранжевый, жёлтый, зелёный, голубой, синий, фиолетовый.", points: 50 },
  { id: "quiz_010", type: "quiz", title: "Квиз", question: "Какой орган перекачивает кровь?", options: ["Сердце", "Лёгкие", "Мозг", "Желудок"], answer: "Сердце", explanation: "Сердце — главный насос кровеносной системы.", points: 50 },
  { id: "quiz_011", type: "quiz", title: "Квиз", question: "Какая планета самая большая в Солнечной системе?", options: ["Юпитер", "Сатурн", "Уран", "Нептун"], answer: "Юпитер", explanation: "Юпитер — крупнейшая планета Солнечной системы.", points: 50 },
  { id: "quiz_012", type: "quiz", title: "Квиз", question: "Сколько букв в русском алфавите?", options: ["33", "32", "35", "30"], answer: "33", explanation: "В русском алфавите 33 буквы.", points: 50 },
  { id: "quiz_013", type: "quiz", title: "Квиз", question: "Как называется детёныш кошки?", options: ["Котёнок", "Щенок", "Телёнок", "Поросёнок"], answer: "Котёнок", explanation: "Детёныш кошки — котёнок.", points: 50 },
  { id: "quiz_014", type: "quiz", title: "Квиз", question: "В каком направлении восходит солнце?", options: ["На востоке", "На западе", "На севере", "На юге"], answer: "На востоке", explanation: "Солнце восходит на востоке и заходит на западе.", points: 50 },
  { id: "quiz_015", type: "quiz", title: "Квиз", question: "Сколько нот в музыкальной гамме?", options: ["7", "5", "8", "6"], answer: "7", explanation: "До, ре, ми, фа, соль, ля, си — семь нот.", points: 50 },
  { id: "quiz_016", type: "quiz", title: "Квиз", question: "Что изучает биология?", options: ["Живые организмы", "Числа", "Звёзды", "Горные породы"], answer: "Живые организмы", explanation: "Биология — наука о живых организмах.", points: 50 },
  { id: "quiz_017", type: "quiz", title: "Квиз", question: "Сколько континентов на Земле?", options: ["6", "5", "7", "4"], answer: "6", explanation: "Евразия, Африка, Северная Америка, Южная Америка, Австралия, Антарктида.", points: 50 },
  // Дополнительные математика
  { id: "math_005", type: "math", title: "Математика", question: "15 + 27 = ?", options: ["42", "40", "43", "44"], answer: "42", explanation: "15 + 27 = 42.", points: 50 },
  { id: "math_006", type: "math", title: "Математика", question: "100 - 63 = ?", options: ["37", "38", "36", "39"], answer: "37", explanation: "100 - 63 = 37.", points: 50 },
  { id: "math_007", type: "math", title: "Математика", question: "7 × 8 = ?", options: ["56", "54", "58", "52"], answer: "56", explanation: "7 × 8 = 56.", points: 50 },
  { id: "math_008", type: "math", title: "Математика", question: "72 ÷ 9 = ?", options: ["8", "7", "9", "6"], answer: "8", explanation: "72 ÷ 9 = 8.", points: 50 },
  { id: "math_009", type: "math", title: "Математика", question: "Периметр прямоугольника 4×6 равен...", options: ["20", "24", "10", "12"], answer: "20", explanation: "P = 2 × (4 + 6) = 20.", points: 50 },
  { id: "math_010", type: "math", title: "Математика", question: "Половина от 84 — это...", options: ["42", "40", "44", "41"], answer: "42", explanation: "84 ÷ 2 = 42.", points: 50 },
  { id: "math_011", type: "math", title: "Математика", question: "Сколько минут в 2 часах?", options: ["120", "100", "180", "60"], answer: "120", explanation: "2 × 60 = 120 минут.", points: 50 },
  { id: "math_012", type: "math", title: "Математика", question: "Площадь квадрата со стороной 6 см:", options: ["36 кв.см", "24 кв.см", "30 кв.см", "12 кв.см"], answer: "36 кв.см", explanation: "6 × 6 = 36 кв.см.", points: 50 },
  { id: "math_013", type: "math", title: "Математика", question: "3² + 4² = ?", options: ["25", "49", "14", "7"], answer: "25", explanation: "9 + 16 = 25.", points: 50 },
  { id: "math_014", type: "math", title: "Математика", question: "Сколько секунд в одной минуте?", options: ["60", "100", "30", "120"], answer: "60", explanation: "В минуте 60 секунд.", points: 50 },
  // Дополнительные вставь ответ
  { id: "fill_004", type: "fill_blank", title: "Вставь ответ", question: "2 + 2 × 2 = ...", answer: "6", explanation: "Умножение выполняется до сложения: 2 + 4 = 6.", points: 50 },
  { id: "fill_005", type: "fill_blank", title: "Вставь ответ", question: "Продолжи ряд: 1, 4, 9, 16, ...", answer: "25", explanation: "Квадраты чисел: 1², 2², 3², 4², 5² = 25.", points: 50 },
  { id: "fill_006", type: "fill_blank", title: "Вставь ответ", question: "Главный город России — ...", answer: "Москва", explanation: "Столица России — Москва.", points: 50 },
  { id: "fill_007", type: "fill_blank", title: "Вставь ответ", question: "5 × 5 × 5 = ...", answer: "125", explanation: "5³ = 125.", points: 50 },
  { id: "fill_008", type: "fill_blank", title: "Вставь ответ", question: "Продолжи: 5, 10, 15, 20, ...", answer: "25", explanation: "Каждое число увеличивается на 5.", points: 50 },
  // Дополнительные логика
  { id: "logic_004", type: "logic", title: "Логика", question: "Что лишнее: собака, кошка, воробей, корова?", options: ["Воробей", "Собака", "Кошка", "Корова"], answer: "Воробей", explanation: "Воробей — птица, остальные — млекопитающие.", points: 50 },
  { id: "logic_005", type: "logic", title: "Логика", question: "Пропущенное число: 1, 3, 5, ?, 9", options: ["7", "6", "8", "4"], answer: "7", explanation: "Нечётные числа: 1, 3, 5, 7, 9.", points: 50 },
  { id: "logic_006", type: "logic", title: "Логика", question: "Что лишнее: ручка, карандаш, линейка, лопата?", options: ["Лопата", "Ручка", "Карандаш", "Линейка"], answer: "Лопата", explanation: "Лопата — садовый инструмент, остальное — канцелярия.", points: 50 },
  { id: "logic_007", type: "logic", title: "Логика", question: "Если сейчас 10:00, который час будет через 3.5 ч?", options: ["13:30", "13:00", "14:00", "12:30"], answer: "13:30", explanation: "10:00 + 3:30 = 13:30.", points: 50 },
  { id: "logic_008", type: "logic", title: "Логика", question: "Что лишнее: роза, тюльпан, ромашка, берёза?", options: ["Берёза", "Роза", "Тюльпан", "Ромашка"], answer: "Берёза", explanation: "Берёза — дерево, остальные — цветы.", points: 50 },
  { id: "logic_009", type: "logic", title: "Логика", question: "Следующее число: 100, 90, 80, 70, ...", options: ["60", "50", "65", "75"], answer: "60", explanation: "Каждое число уменьшается на 10.", points: 50 },
  // Дополнительные пары
  { id: "match_003", type: "match_pairs", title: "Соедини пары", question: "Соедини животное и его детёныша.", pairs: [{ left: "Корова", right: "телёнок" }, { left: "Собака", right: "щенок" }, { left: "Лошадь", right: "жеребёнок" }], explanation: "Детёныш коровы — телёнок, собаки — щенок, лошади — жеребёнок.", points: 50 },
  { id: "match_004", type: "match_pairs", title: "Соедини пары", question: "Соедини страну и её столицу.", pairs: [{ left: "Франция", right: "Париж" }, { left: "Германия", right: "Берлин" }, { left: "Италия", right: "Рим" }], explanation: "Столица Франции — Париж, Германии — Берлин, Италии — Рим.", points: 50 },
  // Новые квиз-вопросы
  { id: "quiz_018", type: "quiz", title: "Квиз", question: "Какой самый большой океан на Земле?", options: ["Тихий", "Атлантический", "Индийский", "Северный Ледовитый"], answer: "Тихий", explanation: "Тихий океан — крупнейший и глубочайший.", points: 50 },
  { id: "quiz_019", type: "quiz", title: "Квиз", question: "Сколько дней в феврале в не високосный год?", options: ["28", "29", "30", "27"], answer: "28", explanation: "В обычном году февраль длится 28 дней.", points: 50 },
  { id: "quiz_020", type: "quiz", title: "Квиз", question: "Какое дерево является символом России?", options: ["Берёза", "Дуб", "Ель", "Сосна"], answer: "Берёза", explanation: "Берёза — традиционный символ России.", points: 50 },
  { id: "quiz_021", type: "quiz", title: "Квиз", question: "Как называется наука о звёздах и планетах?", options: ["Астрономия", "Биология", "Химия", "Геология"], answer: "Астрономия", explanation: "Астрономия изучает небесные тела.", points: 50 },
  { id: "quiz_022", type: "quiz", title: "Квиз", question: "Сколько граммов в одном килограмме?", options: ["1000", "100", "500", "10000"], answer: "1000", explanation: "1 кг = 1000 г.", points: 50 },
  { id: "quiz_023", type: "quiz", title: "Квиз", question: "Сколько часов в сутках?", options: ["24", "12", "48", "36"], answer: "24", explanation: "В сутках 24 часа.", points: 50 },
  { id: "quiz_024", type: "quiz", title: "Квиз", question: "Какой газ необходим нам для дыхания?", options: ["Кислород", "Азот", "Углекислый газ", "Водород"], answer: "Кислород", explanation: "Человек дышит кислородом.", points: 50 },
  { id: "quiz_025", type: "quiz", title: "Квиз", question: "Сколько сторон у куба?", options: ["6", "4", "8", "12"], answer: "6", explanation: "У куба 6 граней.", points: 50 },
  { id: "quiz_026", type: "quiz", title: "Квиз", question: "Что быстрее: звук или свет?", options: ["Свет", "Звук", "Одинаково", "Зависит от погоды"], answer: "Свет", explanation: "Свет в 900 000 раз быстрее звука.", points: 50 },
  { id: "quiz_027", type: "quiz", title: "Квиз", question: "Как называется детёныш медведя?", options: ["Медвежонок", "Лисёнок", "Волчонок", "Бобрёнок"], answer: "Медвежонок", explanation: "Детёныш медведя — медвежонок.", points: 50 },
  { id: "quiz_028", type: "quiz", title: "Квиз", question: "Сколько планет в Солнечной системе?", options: ["8", "7", "9", "10"], answer: "8", explanation: "С 2006 г. — 8 планет (Плутон исключён).", points: 50 },
  { id: "quiz_029", type: "quiz", title: "Квиз", question: "Какой самый распространённый металл в земной коре?", options: ["Алюминий", "Железо", "Медь", "Золото"], answer: "Алюминий", explanation: "Алюминий занимает 8% массы земной коры.", points: 50 },
  { id: "quiz_030", type: "quiz", title: "Квиз", question: "Что изучает история?", options: ["Прошлое человечества", "Числа", "Планеты", "Вещества"], answer: "Прошлое человечества", explanation: "История — наука о прошлом.", points: 50 },
  { id: "quiz_031", type: "quiz", title: "Квиз", question: "Сколько ног у паука?", options: ["8", "6", "4", "10"], answer: "8", explanation: "Пауки — паукообразные, имеют 8 ног.", points: 50 },
  { id: "quiz_032", type: "quiz", title: "Квиз", question: "Какая самая маленькая страна в мире?", options: ["Ватикан", "Монако", "Сан-Марино", "Лихтенштейн"], answer: "Ватикан", explanation: "Ватикан — площадью всего 0,44 км².", points: 50 },
  { id: "quiz_033", type: "quiz", title: "Квиз", question: "Что такое фотосинтез?", options: ["Выработка пищи растениями из света", "Размножение животных", "Движение звёзд", "Рост кристаллов"], answer: "Выработка пищи растениями из света", explanation: "Фотосинтез — процесс, при котором растения создают органику из света и CO₂.", points: 50 },
  { id: "quiz_034", type: "quiz", title: "Квиз", question: "Какой орган отвечает за мышление?", options: ["Мозг", "Сердце", "Лёгкие", "Желудок"], answer: "Мозг", explanation: "Мозг — центр нервной системы и мышления.", points: 50 },
  { id: "quiz_035", type: "quiz", title: "Квиз", question: "Сколько сантиметров в одном метре?", options: ["100", "10", "1000", "50"], answer: "100", explanation: "1 м = 100 см.", points: 50 },
  { id: "quiz_036", type: "quiz", title: "Квиз", question: "Как называется самая длинная река в мире?", options: ["Нил", "Амазонка", "Янцзы", "Волга"], answer: "Нил", explanation: "Нил — длиннейшая река Земли (~6 650 км).", points: 50 },
  { id: "quiz_037", type: "quiz", title: "Квиз", question: "Сколько сторон у пятиугольника?", options: ["5", "4", "6", "3"], answer: "5", explanation: "Пятиугольник имеет пять сторон.", points: 50 },
  // Новые математика
  { id: "math_015", type: "math", title: "Математика", question: "25 + 37 = ?", options: ["62", "61", "63", "60"], answer: "62", explanation: "25 + 37 = 62.", points: 50 },
  { id: "math_016", type: "math", title: "Математика", question: "200 - 85 = ?", options: ["115", "105", "125", "110"], answer: "115", explanation: "200 - 85 = 115.", points: 50 },
  { id: "math_017", type: "math", title: "Математика", question: "9 × 9 = ?", options: ["81", "72", "90", "79"], answer: "81", explanation: "9 × 9 = 81.", points: 50 },
  { id: "math_018", type: "math", title: "Математика", question: "64 ÷ 8 = ?", options: ["8", "7", "9", "6"], answer: "8", explanation: "64 ÷ 8 = 8.", points: 50 },
  { id: "math_019", type: "math", title: "Математика", question: "Периметр равностороннего треугольника со стороной 7 см:", options: ["21 см", "14 см", "28 см", "7 см"], answer: "21 см", explanation: "3 × 7 = 21 см.", points: 50 },
  { id: "math_020", type: "math", title: "Математика", question: "Сколько часов в одной неделе?", options: ["168", "24", "48", "120"], answer: "168", explanation: "7 × 24 = 168 ч.", points: 50 },
  { id: "math_021", type: "math", title: "Математика", question: "3³ (куб числа 3) = ?", options: ["27", "9", "12", "18"], answer: "27", explanation: "3 × 3 × 3 = 27.", points: 50 },
  { id: "math_022", type: "math", title: "Математика", question: "Если скорость 60 км/ч, за 3 ч проедешь...", options: ["180 км", "60 км", "90 км", "120 км"], answer: "180 км", explanation: "60 × 3 = 180 км.", points: 50 },
  // Новые вставь ответ
  { id: "fill_009", type: "fill_blank", title: "Вставь ответ", question: "Продолжи ряд: 2, 4, 6, 8, ...", answer: "10", explanation: "Чётные числа увеличиваются на 2.", points: 50 },
  { id: "fill_010", type: "fill_blank", title: "Вставь ответ", question: "12 × 12 = ...", answer: "144", explanation: "12 × 12 = 144.", points: 50 },
  { id: "fill_011", type: "fill_blank", title: "Вставь ответ", question: "Продолжи ряд Фибоначчи: 1, 1, 2, 3, 5, 8, ...", answer: "13", explanation: "Каждое число = сумма двух предыдущих: 5+8=13.", points: 50 },
  { id: "fill_012", type: "fill_blank", title: "Вставь ответ", question: "Площадь прямоугольника 5 × 4 = ... кв.см", answer: "20", explanation: "5 × 4 = 20 кв.см.", points: 50 },
  { id: "fill_013", type: "fill_blank", title: "Вставь ответ", question: "Вода закипает при ... градусах Цельсия", answer: "100", explanation: "Температура кипения воды = 100°C.", points: 50 },
  { id: "fill_014", type: "fill_blank", title: "Вставь ответ", question: "В слове «школа» ... слога", answer: "2", explanation: "Шко-ла — два слога.", points: 50 },
  { id: "fill_015", type: "fill_blank", title: "Вставь ответ", question: "Продолжи: 10, 20, 30, 40, ...", answer: "50", explanation: "Каждое число увеличивается на 10.", points: 50 },
  { id: "fill_016", type: "fill_blank", title: "Вставь ответ", question: "1 км = ... м", answer: "1000", explanation: "В одном километре 1000 метров.", points: 50 },
  // Новые логика
  { id: "logic_010", type: "logic", title: "Логика", question: "Что лишнее: тетрадь, ручка, карандаш, кирпич?", options: ["Кирпич", "Ручка", "Карандаш", "Тетрадь"], answer: "Кирпич", explanation: "Кирпич — стройматериал, остальное — канцелярия.", points: 50 },
  { id: "logic_011", type: "logic", title: "Логика", question: "Что лишнее: лето, осень, среда, зима?", options: ["Среда", "Лето", "Осень", "Зима"], answer: "Среда", explanation: "Среда — день недели, остальные — времена года.", points: 50 },
  { id: "logic_012", type: "logic", title: "Логика", question: "Если Аня старше Бори, Боря старше Вани — кто старший?", options: ["Аня", "Боря", "Ваня", "Все одинаково"], answer: "Аня", explanation: "Аня > Боря > Ваня.", points: 50 },
  { id: "logic_013", type: "logic", title: "Логика", question: "Что лишнее: треугольник, круг, красный, квадрат?", options: ["Красный", "Треугольник", "Круг", "Квадрат"], answer: "Красный", explanation: "Красный — цвет, остальные — геометрические фигуры.", points: 50 },
  { id: "logic_014", type: "logic", title: "Логика", question: "Что лишнее: январь, март, июнь, понедельник?", options: ["Понедельник", "Январь", "Март", "Июнь"], answer: "Понедельник", explanation: "Понедельник — день недели, остальные — месяцы.", points: 50 },
  { id: "logic_015", type: "logic", title: "Логика", question: "Какое число следующее: 3, 6, 12, 24, ...", options: ["48", "36", "30", "42"], answer: "48", explanation: "Каждое число умножается на 2: 24×2=48.", points: 50 },
  // Новые соедини пары
  { id: "match_005", type: "match_pairs", title: "Соедини пары", question: "Соедини слово с его антонимом.", pairs: [{ left: "Горячий", right: "холодный" }, { left: "Светлый", right: "тёмный" }, { left: "Быстрый", right: "медленный" }], explanation: "Антонимы — слова с противоположным значением.", points: 50 },
  { id: "match_006", type: "match_pairs", title: "Соедини пары", question: "Соедини число и его квадрат.", pairs: [{ left: "2", right: "4" }, { left: "3", right: "9" }, { left: "4", right: "16" }], explanation: "2²=4, 3²=9, 4²=16.", points: 50 },
  { id: "match_007", type: "match_pairs", title: "Соедини пары", question: "Соедини страну и её язык.", pairs: [{ left: "Россия", right: "русский" }, { left: "Франция", right: "французский" }, { left: "Германия", right: "немецкий" }], explanation: "Официальные языки этих стран.", points: 50 },
  { id: "match_008", type: "match_pairs", title: "Соедини пары", question: "Соедини планету с её особенностью.", pairs: [{ left: "Земля", right: "3-я от Солнца" }, { left: "Сатурн", right: "есть кольца" }, { left: "Марс", right: "красная планета" }], explanation: "Характерные черты планет.", points: 50 },
  { id: "match_009", type: "match_pairs", title: "Соедини пары", question: "Соедини действие с его символом.", pairs: [{ left: "Сложение", right: "+" }, { left: "Вычитание", right: "−" }, { left: "Умножение", right: "×" }], explanation: "Знаки арифметических операций.", points: 50 },
  { id: "match_010", type: "match_pairs", title: "Соедини пары", question: "Соедини слово и количество слогов.", pairs: [{ left: "дом", right: "1" }, { left: "школа", right: "2" }, { left: "ребёнок", right: "3" }], explanation: "Слоги: дом(1), шко-ла(2), ре-бё-нок(3).", points: 50 },
];

const LEVELS = [
  { level: 1, moves: 30, goals: [{ type: "red", count: 10 }, { type: "orange", count: 10 }], label: "Уровень 1" },
  { level: 2, moves: 26, goals: [{ type: "blue", count: 12 }, { type: "green", count: 12 }], label: "Уровень 2" },
  { level: 3, moves: 22, goals: [{ type: "yellow", count: 12 }, { type: "purple", count: 12 }], label: "Уровень 3" },
  { level: 4, moves: 20, goals: [{ type: "red", count: 14 }, { type: "blue", count: 14 }], label: "Уровень 4" },
  { level: 5, moves: 18, goals: [{ type: "orange", count: 15 }, { type: "purple", count: 15 }], label: "Уровень 5" },
];

const state = {
  board: [],
  elements: new Map(),
  score: 0,
  moves: START_MOVES,
  streak: 0,
  goals: {},
  goalCompleted: false,
  level: 0,
  mode: "idle",
  selected: null,
  hintTimer: null,
  hintMove: null,
  lastSwap: [],
  currentTask: null,
  taskAnswer: null,
  taskAnswered: false,
  taskCloseTimer: null,
  sound: localStorage.getItem(SOUND_KEY) !== "off",
  boosters: { hammer: 3, rocket: 3, rainbow: 3, bomb: 3 },
  activeTool: null,
  rocketDir: "row",
  recentTaskIds: [],
};

const els = {
  board: document.querySelector("#board"),
  cells: document.querySelector("#boardCells"),
  layer: document.querySelector("#pieceLayer"),
  fx: document.querySelector("#fxLayer"),
  score: document.querySelector("#scoreValue"),
  moves: document.querySelector("#movesValue"),
  streak: document.querySelector("#streakValue"),
  goalRows: document.querySelector("#goalRows"),
  goalCard: document.querySelector("#goalCard"),
  levelBadge: document.querySelector("#levelBadge"),
  status: document.querySelector("#statusText"),
  message: document.querySelector("#messageStrip"),
  settings: document.querySelector("#settingsBtn"),
  settingsDialog: document.querySelector("#settingsDialog"),
  closeSettings: document.querySelector("#closeSettingsBtn"),
  newGame: document.querySelector("#newGameBtn"),
  theme: document.querySelector("#themeBtn"),
  sound: document.querySelector("#soundBtn"),
  soundIcon: document.querySelector("#soundIcon"),
  pause: document.querySelector("#pauseBtn"),
  leaderboard: document.querySelector("#leaderboardBtn"),
  taskDialog: document.querySelector("#taskDialog"),
  taskKind: document.querySelector("#taskKind"),
  taskTitle: document.querySelector("#taskTitle"),
  taskQuestion: document.querySelector("#taskQuestion"),
  taskBody: document.querySelector("#taskBody"),
  taskResult: document.querySelector("#taskResult"),
  submitTask: document.querySelector("#submitTaskBtn"),
  continueTask: document.querySelector("#continueTaskBtn"),
  pauseDialog: document.querySelector("#pauseDialog"),
  resume: document.querySelector("#resumeBtn"),
  restartFromPause: document.querySelector("#restartFromPauseBtn"),
  gameOverDialog: document.querySelector("#gameOverDialog"),
  gameOverTitle: document.querySelector("#gameOverTitle"),
  finalScore: document.querySelector("#finalScore"),
  playerName: document.querySelector("#playerName"),
  saveScore: document.querySelector("#saveScoreBtn"),
  playAgain: document.querySelector("#playAgainBtn"),
  finalLeaderboard: document.querySelector("#finalLeaderboard"),
  leaderboardDialog: document.querySelector("#leaderboardDialog"),
  leaderboardList: document.querySelector("#leaderboardList"),
  closeLeaderboard: document.querySelector("#closeLeaderboardBtn"),
  boosterBtns: document.querySelectorAll(".booster"),
};

let nextId = 1;
let audioContext = null;

init();

function init() {
  initBoardCells();
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  document.body.classList.toggle("dark", savedTheme === "dark");
  updateSoundButton();
  wireEvents();
  startNewGame();
}

function initBoardCells() {
  els.cells.innerHTML = "";
  for (let i = 0; i < SIZE * SIZE; i += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    els.cells.append(cell);
  }
}

function wireEvents() {
  els.settings.addEventListener("click", () => {
    clearHint(false);
    els.settingsDialog.showModal();
  });
  els.closeSettings.addEventListener("click", () => {
    els.settingsDialog.close();
    scheduleHint();
  });
  els.newGame.addEventListener("click", startNewGame);
  els.theme.addEventListener("click", toggleTheme);
  els.sound.addEventListener("click", toggleSound);
  els.pause.addEventListener("click", pauseGame);
  els.resume.addEventListener("click", resumeGame);
  els.restartFromPause.addEventListener("click", () => {
    els.pauseDialog.close();
    startNewGame();
  });
  els.leaderboard.addEventListener("click", showLeaderboard);
  els.closeLeaderboard.addEventListener("click", () => {
    els.leaderboardDialog.close();
    scheduleHint();
  });
  els.submitTask.addEventListener("click", submitTask);
  els.continueTask.addEventListener("click", () => {
    if (state.taskCloseTimer) { clearTimeout(state.taskCloseTimer); state.taskCloseTimer = null; }
    closeTask();
  });
  els.saveScore.addEventListener("click", saveFinalScore);
  els.playAgain.addEventListener("click", () => {
    els.gameOverDialog.close();
    startNewGame();
  });
  // Booster buttons
  els.boosterBtns.forEach((btn) => {
    btn.addEventListener("click", () => activateBooster(btn.dataset.booster));
  });
}

function startNewGame() {
  closeDialogs();
  clearHint(false);
  if (state.taskCloseTimer) { clearTimeout(state.taskCloseTimer); state.taskCloseTimer = null; }
  state.elements.forEach((element) => element.remove());
  state.elements.clear();
  state.level = 0;
  const cfg = LEVELS[state.level];
  state.score = 0;
  state.moves = cfg.moves;
  state.streak = 0;
  state.goals = Object.fromEntries(cfg.goals.map(({ type, count }) => [type, count]));
  state.goalCompleted = false;
  state.mode = "idle";
  state.selected = null;
  state.lastSwap = [];
  state.recentTaskIds = [];
  state.boosters = { hammer: 3, rocket: 3, rainbow: 3, bomb: 3 };
  state.activeTool = null;
  state.rocketDir = "row";
  state.board = createPlayableBoard();
  if (els.levelBadge) els.levelBadge.textContent = cfg.label;
  renderGoalRows();
  showAuthor();
  syncUi();
  syncBoosterUi();
  syncPieces(true);
  scheduleHint();
}

function closeDialogs() {
  [els.settingsDialog, els.taskDialog, els.pauseDialog, els.gameOverDialog, els.leaderboardDialog].forEach((dialog) => {
    if (dialog.open) dialog.close();
  });
}

function createPlayableBoard() {
  for (let attempts = 0; attempts < 300; attempts += 1) {
    const board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        board[row][col] = createSafeBlock(board, row, col);
      }
    }
    if (findPossibleMove(board)) return board;
  }
  return createPlayableBoard();
}

function createSafeBlock(board, row, col) {
  const pool = shuffle(pieceTypes.map((piece) => piece.type));
  for (const type of pool) {
    const leftMatch = col >= 2 && board[row][col - 1]?.type === type && board[row][col - 2]?.type === type;
    const topMatch = row >= 2 && board[row - 1][col]?.type === type && board[row - 2][col]?.type === type;
    if (!leftMatch && !topMatch) return createBlock(type);
  }
  return createBlock(randomType());
}

function createBlock(type = randomType(), bonus = null, spawnRow = null) {
  return { id: nextId += 1, type, bonus, spawnRow };
}

function randomType() {
  return pieceTypes[Math.floor(Math.random() * pieceTypes.length)].type;
}

function syncPieces(instant = false) {
  const liveIds = new Set();
  state.board.forEach((row, rowIndex) => {
    row.forEach((block, colIndex) => {
      if (!block) return;
      liveIds.add(block.id);
      let element = state.elements.get(block.id);
      if (!element) {
        element = createPieceElement(block);
        state.elements.set(block.id, element);
        els.layer.append(element);
        const startRow = block.spawnRow ?? rowIndex;
        setPiecePosition(element, startRow, colIndex, true);
        requestAnimationFrame(() => setPiecePosition(element, rowIndex, colIndex, false));
      } else {
        updatePieceElement(element, block);
        setPiecePosition(element, rowIndex, colIndex, instant);
      }
      element.dataset.row = rowIndex;
      element.dataset.col = colIndex;
      element.classList.toggle("selected", state.selected && state.selected.row === rowIndex && state.selected.col === colIndex);
      element.classList.toggle("hint", state.hintMove && state.hintMove.from.row === rowIndex && state.hintMove.from.col === colIndex);
      if (state.hintMove && state.hintMove.from.row === rowIndex && state.hintMove.from.col === colIndex) {
        element.dataset.dir = directionSymbol(state.hintMove.from, state.hintMove.to);
        element.dataset.move = directionName(state.hintMove.from, state.hintMove.to);
      } else {
        element.removeAttribute("data-dir");
        element.removeAttribute("data-move");
      }
      block.spawnRow = null;
    });
  });

  [...state.elements.entries()].forEach(([id, element]) => {
    if (!liveIds.has(id)) {
      element.remove();
      state.elements.delete(id);
    }
  });
}

function createPieceElement(block) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "tile";
  button.dataset.id = block.id;
  updatePieceElement(button, block);

  button.addEventListener("click", () => handleTileClick(Number(button.dataset.row), Number(button.dataset.col)));
  button.addEventListener("pointerdown", (event) => {
    button.setPointerCapture(event.pointerId);
    button.dataset.startX = event.clientX;
    button.dataset.startY = event.clientY;
  });
  button.addEventListener("pointerup", (event) => handlePointerUp(event, Number(button.dataset.row), Number(button.dataset.col), button));
  button.addEventListener("pointerenter", () => {
    if (state.mode !== "idle") return;
    const r = Number(button.dataset.row);
    const c = Number(button.dataset.col);
    if (state.activeTool === "rocket") {
      state.elements.forEach((el) => {
        const er = Number(el.dataset.row);
        const ec = Number(el.dataset.col);
        el.classList.toggle("rocket-preview", state.rocketDir === "row" ? er === r : ec === c);
      });
    } else if (state.activeTool === "bomb") {
      state.elements.forEach((el) => {
        const er = Number(el.dataset.row);
        const ec = Number(el.dataset.col);
        el.classList.toggle("bomb-preview", Math.abs(er - r) <= 1 && Math.abs(ec - c) <= 1);
      });
    }
  });
  button.addEventListener("pointerleave", () => {
    if (state.activeTool === "rocket") state.elements.forEach((el) => el.classList.remove("rocket-preview"));
    else if (state.activeTool === "bomb") state.elements.forEach((el) => el.classList.remove("bomb-preview"));
  });
  return button;
}

function updatePieceElement(element, block) {
  element.dataset.type = block.type;
  if (block.bonus) {
    element.dataset.bonus = block.bonus;
  } else {
    element.removeAttribute("data-bonus");
  }
  element.setAttribute("role", "gridcell");
  element.setAttribute("aria-label", getTileLabel(block));
  const src = getGemSrc(block);
  element.innerHTML = `<img class="gem-img" src="${src}" alt="${block.type}" draggable="false">${block.bonus ? `<span class="bonus-mark">${bonusSymbol(block.bonus)}</span>` : ""}`;
}

function getGemSrc(block) {
  if (block.bonus === "row")   return "assets/pieces/spec_row.png";
  if (block.bonus === "col")   return "assets/pieces/spec_col.png";
  if (block.bonus === "bomb")  return "assets/pieces/spec_bomb.png";
  if (block.bonus === "color") return "assets/pieces/spec_color.png";
  return `assets/pieces/gem_${block.type}.png`;
}

function setPiecePosition(element, row, col, instant = false) {
  if (instant) {
    element.style.transition = "none";
  } else {
    element.style.transition = "";
  }
  element.style.setProperty("--row", row);
  element.style.setProperty("--col", col);
  element.style.left = `${col * 12.5}%`;
  element.style.top = `${row * 12.5}%`;
  if (instant) {
    element.getBoundingClientRect();
    element.style.transition = "";
  }
}

function getTileLabel(block) {
  const bonusNames = { row: "горизонтальная ракета", col: "вертикальная ракета", bomb: "бомбочка", color: "радужная звезда" };
  return `${pieceMap[block.type].name}${block.bonus ? `, ${bonusNames[block.bonus]}` : ""}`;
}

function bonusSymbol(bonus) {
  return { row: "↔", col: "↕", bomb: "✹", color: "✦" }[bonus] || "★";
}

function handlePointerUp(event, row, col, tile) {
  const dx = event.clientX - Number(tile.dataset.startX || event.clientX);
  const dy = event.clientY - Number(tile.dataset.startY || event.clientY);
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
  const target = { row, col };
  if (Math.abs(dx) > Math.abs(dy)) target.col += dx > 0 ? 1 : -1;
  else target.row += dy > 0 ? 1 : -1;
  if (inBounds(target.row, target.col)) attemptMove({ row, col }, target);
}

function handleTileClick(row, col) {
  if (!inBounds(row, col)) return;
  if (state.activeTool && state.mode === "idle") {
    applyBoosterToTile({ row, col }, state.activeTool);
    return;
  }
  if (state.mode !== "idle") return;
  clearHint(false);
  playTone(360, 0.04);
  const coord = { row, col };

  if (state.selected && sameCoord(state.selected, coord)) {
    state.selected = null;
    syncPieces();
    if (getBlock(coord)?.bonus) activateSpecialMove([coord], "Бонус сработал!");
    return;
  }

  if (!state.selected) {
    state.selected = coord;
    syncPieces();
    scheduleHint();
    return;
  }

  if (areAdjacent(state.selected, coord)) {
    attemptMove(state.selected, coord);
    return;
  }

  state.selected = coord;
  syncPieces();
  scheduleHint();
}

async function attemptMove(first, second) {
  if (state.mode !== "idle" || !areAdjacent(first, second)) return;
  clearHint(false);
  state.mode = "swapping";
  state.selected = null;
  state.lastSwap = [first, second];
  swap(first, second);
  syncPieces();
  await wait(230);

  const specialCoords = [first, second].filter((coord) => getBlock(coord)?.bonus);
  if (specialCoords.length) {
    decrementMove();
    await activateSpecialMove(specialCoords, "Бонусный ход!");
    return;
  }

  if (!findMatches(state.board).length) {
    swap(first, second);
    syncPieces();
    await wait(230);
    state.mode = "idle";
    setMessage("Почти! Попробуй другой ход.");
    playTone(180, 0.06);
    scheduleHint();
    return;
  }

  decrementMove();
  await resolveBoard(true);
}

async function activateSpecialMove(coords, message) {
  state.mode = "resolving";
  const cells = new Map();
  coords.forEach((coord) => {
    const block = getBlock(coord);
    const targetType = block?.bonus === "color" ? getColorTargetType(coord) : null;
    collectSpecialCells(coord, block, cells, targetType);
  });
  addScore(scoreSpecials(coords), coords[0]);
  setMessage(message);
  playTone(620, 0.08);
  await animateRemoval([...cells.values()]);
  removeCells(cells);
  collapseBoard();
  syncPieces();
  await wait(430);
  await resolveBoard(true);
}

async function resolveBoard(showTaskAfter) {
  state.mode = "resolving";
  let cascade = 0;
  let hadMatch = false;

  while (true) {
    const matches = findMatches(state.board);
    if (!matches.length) break;
    hadMatch = true;
    cascade += 1;
    const plan = buildRemovalPlan(matches);
    const cells = [...plan.remove.values()];
    const center = averageCell(cells);
    scoreMatches(matches, cascade, center);
    collectGoals(cells);
    setMessage(cascade === 1 ? "Отличный ход!" : `Каскад x${cascade}!`);
    playTone(440 + cascade * 80, 0.08);
    await animateRemoval(cells);
    removeCells(plan.remove);
    placeBonusBlocks(plan.bonuses);
    syncPieces();
    await wait(90);
    collapseBoard();
    syncPieces();
    await wait(470);
  }

  if (!findPossibleMove(state.board)) {
    setMessage("Перемешиваем поле!");
    await wait(380);
    shuffleBoard();
    syncPieces();
    await wait(420);
  }

  await afterMoveCleanup(showTaskAfter && hadMatch);
}

async function animateRemoval(cells) {
  cells.forEach((coord) => {
    const element = findPieceElement(coord);
    if (!element) return;
    element.classList.add("pop", "removing");
    createSparks(coord, element.dataset.type);
  });
  await wait(285);
}

function createSparks(coord, type) {
  const rect = els.board.getBoundingClientRect();
  const cell = rect.width / SIZE;
  const colors = { red: "#ff5750", yellow: "#fff05d", orange: "#ff9a27", green: "#2ee35b", blue: "#30d7ff", purple: "#c779ff" };
  for (let i = 0; i < 7; i += 1) {
    const spark = document.createElement("span");
    spark.className = "spark";
    spark.style.left = `${coord.col * cell + cell / 2 - 5}px`;
    spark.style.top = `${coord.row * cell + cell / 2 - 5}px`;
    spark.style.setProperty("--spark", colors[type] || "#fff36d");
    spark.style.setProperty("--dx", `${Math.cos((Math.PI * 2 * i) / 7) * (20 + Math.random() * 22)}px`);
    spark.style.setProperty("--dy", `${Math.sin((Math.PI * 2 * i) / 7) * (20 + Math.random() * 22)}px`);
    els.fx.append(spark);
    spark.addEventListener("animationend", () => spark.remove(), { once: true });
  }
}

function showFloatingScore(points, coord = { row: 3.5, col: 3.5 }) {
  const rect = els.board.getBoundingClientRect();
  const cell = rect.width / SIZE;
  const score = document.createElement("div");
  score.className = "floating-score";
  score.textContent = points > 0 ? `+${points}` : `${points}`;
  score.style.left = `${coord.col * cell + cell / 2 - 20}px`;
  score.style.top = `${coord.row * cell + cell / 2 - 20}px`;
  els.fx.append(score);
  score.addEventListener("animationend", () => score.remove(), { once: true });
}

function renderGoalRows() {
  if (!els.goalRows) return;
  els.goalRows.innerHTML = "";
  const cfg = LEVELS[state.level];
  cfg.goals.forEach(({ type }) => {
    const row = document.createElement("div");
    row.className = "goal-row";
    row.dataset.goalType = type;
    row.innerHTML = `<img src="assets/pieces/gem_${type}.png" class="goal-gem-img" alt="${type}"><b class="goal-count">${state.goals[type]}</b>`;
    els.goalRows.append(row);
  });
}

function collectGoals(cells) {
  cells.forEach((coord) => {
    const block = getBlock(coord);
    if (block && state.goals[block.type] !== undefined) {
      state.goals[block.type] = Math.max(0, state.goals[block.type] - 1);
    }
  });
  syncUi();
  if (Object.values(state.goals).every((v) => v === 0)) state.goalCompleted = true;
}

function collapseBoard() {
  for (let col = 0; col < SIZE; col += 1) {
    const column = [];
    for (let row = SIZE - 1; row >= 0; row -= 1) {
      if (state.board[row][col]) column.push(state.board[row][col]);
    }
    let spawnOffset = 1;
    for (let row = SIZE - 1; row >= 0; row -= 1) {
      const block = column.shift();
      if (block) {
        state.board[row][col] = block;
      } else {
        state.board[row][col] = createBlock(randomType(), null, -spawnOffset);
        spawnOffset += 1;
      }
    }
  }
}

function findMatches(board) {
  const groups = [];
  for (let row = 0; row < SIZE; row += 1) {
    let start = 0;
    for (let col = 1; col <= SIZE; col += 1) {
      const current = board[row][col];
      const previous = board[row][col - 1];
      const same = current && previous && current.type === previous.type && current.bonus !== "color" && previous.bonus !== "color";
      if (!same) {
        if (col - start >= 3) groups.push({ type: previous.type, dir: "row", cells: range(start, col - 1).map((c) => ({ row, col: c })) });
        start = col;
      }
    }
  }
  for (let col = 0; col < SIZE; col += 1) {
    let start = 0;
    for (let row = 1; row <= SIZE; row += 1) {
      const current = board[row]?.[col];
      const previous = board[row - 1][col];
      const same = current && previous && current.type === previous.type && current.bonus !== "color" && previous.bonus !== "color";
      if (!same) {
        if (row - start >= 3) groups.push({ type: previous.type, dir: "col", cells: range(start, row - 1).map((r) => ({ row: r, col })) });
        start = row;
      }
    }
  }
  return groups;
}

function buildRemovalPlan(matches) {
  const remove = new Map();
  const bonuses = new Map();
  const usedBonusCells = new Set();
  matches.forEach((match) => match.cells.forEach((coord) => remove.set(key(coord.row, coord.col), coord)));
  matches.forEach((match) => {
    const bonusType = getBonusForMatch(match, matches);
    if (!bonusType) return;
    const coord = chooseBonusCell(match);
    const block = state.board[coord.row][coord.col];
    bonuses.set(key(coord.row, coord.col), createBlock(block.type, bonusType));
    usedBonusCells.add(key(coord.row, coord.col));
  });
  [...remove.values()].forEach((coord) => {
    const block = state.board[coord.row][coord.col];
    if (block?.bonus && !usedBonusCells.has(key(coord.row, coord.col))) collectSpecialCells(coord, block, remove);
  });
  usedBonusCells.forEach((cellKey) => remove.delete(cellKey));
  return { remove, bonuses };
}

function getBonusForMatch(match, allMatches) {
  const crossing = allMatches.some((other) => other !== match && other.type === match.type && other.dir !== match.dir && match.cells.some((cell) => other.cells.some((otherCell) => sameCoord(cell, otherCell))));
  if (crossing) return "bomb";
  if (match.cells.length >= 5) return "color";
  if (match.cells.length === 4) return match.dir === "row" ? "row" : "col";
  return null;
}

function chooseBonusCell(match) {
  return state.lastSwap.find((coord) => match.cells.some((cell) => sameCoord(cell, coord))) || match.cells[Math.floor(match.cells.length / 2)];
}

function scoreMatches(matches, cascade, coord) {
  const multiplier = cascade === 1 ? 1 : cascade === 2 ? 1.5 : 2;
  const points = matches.reduce((sum, match) => sum + (match.cells.length >= 5 ? 120 : match.cells.length === 4 ? 60 : 30), 0);
  addScore(Math.round(points * multiplier), coord);
}

function collectSpecialCells(coord, block, cells, colorTargetType = null) {
  if (!block) return;
  if (block.bonus === "row") {
    for (let col = 0; col < SIZE; col += 1) cells.set(key(coord.row, col), { row: coord.row, col });
  } else if (block.bonus === "col") {
    for (let row = 0; row < SIZE; row += 1) cells.set(key(row, coord.col), { row, col: coord.col });
  } else if (block.bonus === "bomb") {
    for (let row = coord.row - 1; row <= coord.row + 1; row += 1) {
      for (let col = coord.col - 1; col <= coord.col + 1; col += 1) {
        if (inBounds(row, col)) cells.set(key(row, col), { row, col });
      }
    }
  } else if (block.bonus === "color") {
    const targetType = colorTargetType || findMostCommonType();
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (state.board[row][col]?.type === targetType) cells.set(key(row, col), { row, col });
      }
    }
    cells.set(key(coord.row, coord.col), coord);
  } else {
    cells.set(key(coord.row, coord.col), coord);
  }
}

function getColorTargetType(colorCoord) {
  const otherCoord = state.lastSwap.find((coord) => !sameCoord(coord, colorCoord));
  return otherCoord ? getBlock(otherCoord)?.type : findMostCommonType();
}

function scoreSpecials(coords) {
  return coords.reduce((sum, coord) => {
    const bonus = getBlock(coord)?.bonus;
    if (bonus === "color") return sum + 150;
    if (bonus === "bomb") return sum + 100;
    return sum + 80;
  }, 0);
}

function removeCells(cells) {
  cells.forEach((coord) => {
    if (inBounds(coord.row, coord.col)) {
      const block = state.board[coord.row][coord.col];
      if (block) {
        state.elements.get(block.id)?.remove();
        state.elements.delete(block.id);
      }
      state.board[coord.row][coord.col] = null;
    }
  });
}

function placeBonusBlocks(bonuses) {
  bonuses.forEach((block, cellKey) => {
    const [row, col] = cellKey.split(":").map(Number);
    state.board[row][col] = block;
  });
}

function findPossibleMove(board) {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col]?.bonus) {
        const target = inBounds(row, col + 1) ? { row, col: col + 1 } : { row: row + 1, col };
        if (inBounds(target.row, target.col)) return { from: { row, col }, to: target };
      }
      const current = { row, col };
      const right = { row, col: col + 1 };
      const down = { row: row + 1, col };
      if (inBounds(right.row, right.col) && swapWouldMatch(board, current, right)) return { from: current, to: right };
      if (inBounds(down.row, down.col) && swapWouldMatch(board, current, down)) return { from: current, to: down };
    }
  }
  return null;
}

function swapWouldMatch(board, first, second) {
  const copy = cloneBoard(board);
  const temp = copy[first.row][first.col];
  copy[first.row][first.col] = copy[second.row][second.col];
  copy[second.row][second.col] = temp;
  return findMatches(copy).length > 0;
}

function shuffleBoard() {
  const blocks = state.board.flat().map((block) => createBlock(block.type, block.bonus));
  for (let attempts = 0; attempts < 150; attempts += 1) {
    const shuffled = shuffle([...blocks]);
    const next = Array.from({ length: SIZE }, (_, row) => shuffled.slice(row * SIZE, row * SIZE + SIZE));
    if (!findMatches(next).length && findPossibleMove(next)) {
      state.board = next;
      playTone(300, 0.08);
      return;
    }
  }
  state.board = createPlayableBoard();
}

function scheduleHint() {
  clearHint(false);
  if (state.mode !== "idle") return;
  state.hintTimer = window.setTimeout(() => {
    if (state.mode !== "idle") return;
    state.hintMove = findPossibleMove(state.board);
    if (state.hintMove) {
      setMessage("Есть хороший ход!");
      syncPieces();
    }
  }, HINT_DELAY);
}

function clearHint(shouldRender = true) {
  window.clearTimeout(state.hintTimer);
  state.hintTimer = null;
  state.hintMove = null;
  if (shouldRender) syncPieces();
}

function pickTask() {
  const recent = state.recentTaskIds;
  const available = tasks.filter((t) => !recent.includes(t.id));
  const pool = available.length ? available : tasks;
  const task = pool[Math.floor(Math.random() * pool.length)];
  state.recentTaskIds = [...recent.slice(-Math.floor(tasks.length * 0.6)), task.id];
  return task;
}

function showTask() {
  clearHint(false);
  state.mode = "task";
  state.currentTask = pickTask();
  state.taskAnswer = null;
  state.taskAnswered = false;
  els.taskKind.textContent = state.currentTask.title;
  els.taskTitle.textContent = "Бонусный вопрос";
  els.taskQuestion.textContent = state.currentTask.question;
  els.taskResult.textContent = "";
  els.taskResult.className = "task-result";
  els.submitTask.classList.remove("hidden");
  els.continueTask.classList.add("hidden");
  els.continueTask.textContent = "Дальше";
  renderTaskBody(state.currentTask);
  els.taskDialog.showModal();
}

function renderTaskBody(task) {
  els.taskBody.innerHTML = "";
  if (["quiz", "math", "logic"].includes(task.type)) {
    shuffle([...task.options]).forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-button";
      button.textContent = option;
      button.addEventListener("click", () => {
        state.taskAnswer = option;
        els.taskBody.querySelectorAll(".option-button").forEach((item) => item.classList.remove("selected"));
        button.classList.add("selected");
      });
      els.taskBody.append(button);
    });
    return;
  }
  if (task.type === "fill_blank") {
    const input = document.createElement("input");
    input.className = "fill-input";
    input.placeholder = "Твой ответ";
    input.addEventListener("input", () => { state.taskAnswer = input.value; });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); submitTask(); }
    });
    els.taskBody.append(input);
    setTimeout(() => input.focus(), 50);
    return;
  }
  if (task.type === "match_pairs") {
    const rights = shuffle(task.pairs.map((pair) => pair.right));
    task.pairs.forEach((pair, index) => {
      const row = document.createElement("div");
      row.className = "pair-row";
      const left = document.createElement("div");
      left.className = "pair-left";
      left.textContent = pair.left;
      const select = document.createElement("select");
      select.className = "pair-select";
      select.dataset.left = pair.left;
      select.innerHTML = `<option value="">Выбери пару</option>${rights.map((right) => `<option value="${escapeHtml(right)}">${escapeHtml(right)}</option>`).join("")}`;
      select.addEventListener("change", collectPairAnswers);
      if (index === 0) setTimeout(() => select.focus(), 50);
      row.append(left, select);
      els.taskBody.append(row);
    });
  }
}

function collectPairAnswers() {
  state.taskAnswer = [...els.taskBody.querySelectorAll(".pair-select")].map((select) => ({ left: select.dataset.left, right: select.value }));
}

function submitTask() {
  if (!state.currentTask || state.taskAnswered) return;
  const task = state.currentTask;
  const result = checkTaskAnswer(task, state.taskAnswer);
  state.taskAnswered = true;

  // Highlight correct / wrong option buttons
  const allBtns = [...els.taskBody.querySelectorAll(".option-button")];
  const selectedBtn = allBtns.find((b) => b.classList.contains("selected"));
  const correctBtn = allBtns.find((b) => normalizeAnswer(b.textContent) === normalizeAnswer(task.answer));
  if (result.correct) {
    selectedBtn?.classList.add("correct");
    playTone(880, 0.1);
  } else {
    selectedBtn?.classList.add("wrong");
    if (correctBtn) correctBtn.classList.add("correct");
    playTone(210, 0.1);
  }
  // Disable all option buttons after answer
  allBtns.forEach((b) => { b.disabled = true; });

  if (result.correct) {
    state.streak += 1;
    let bonus = task.points;
    if (state.streak === 3) bonus += 30;
    if (state.streak === 5) bonus += 70;
    addScore(bonus);
    els.taskResult.textContent = `Верно! +${bonus} очков`;
    els.taskResult.className = "task-result good";
  } else {
    state.streak = 0;
    state.score = Math.max(0, state.score - 20);
    showFloatingScore(-20);
    els.taskResult.textContent = `Почти! ${task.explanation}`;
    els.taskResult.className = "task-result bad";
  }
  syncUi();
  els.submitTask.classList.add("hidden");
  els.continueTask.classList.remove("hidden");

  // Auto-close: 2s for correct, 3.5s for wrong
  const delay = result.correct ? 2000 : 3500;
  let remaining = Math.ceil(delay / 1000);
  els.continueTask.textContent = `Дальше (${remaining})`;
  const countInterval = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      els.continueTask.textContent = `Дальше (${remaining})`;
    } else {
      els.continueTask.textContent = "Дальше";
      clearInterval(countInterval);
    }
  }, 1000);
  state.taskCloseTimer = setTimeout(() => {
    clearInterval(countInterval);
    state.taskCloseTimer = null;
    closeTask();
  }, delay);
}

function checkTaskAnswer(task, answer) {
  if (task.type === "match_pairs") {
    const correct = task.pairs.every((pair) => answer?.some((item) => item.left === pair.left && item.right === pair.right));
    return { correct, answer: task.pairs.map((pair) => `${pair.left} - ${pair.right}`).join("; ") };
  }
  const normalizedAnswer = normalizeAnswer(answer);
  const normalizedCorrect = normalizeAnswer(task.answer);
  const numeric = !Number.isNaN(Number(normalizedCorrect)) && !Number.isNaN(Number(normalizedAnswer));
  return { correct: numeric ? Number(normalizedAnswer) === Number(normalizedCorrect) : normalizedAnswer === normalizedCorrect, answer: task.answer };
}

function closeTask() {
  if (state.taskCloseTimer) { clearTimeout(state.taskCloseTimer); state.taskCloseTimer = null; }
  els.taskDialog.close();
  state.currentTask = null;
  state.taskAnswered = false;
  els.continueTask.textContent = "Дальше";
  if (state.goalCompleted) {
    goalVictory();
    return;
  }
  if (state.moves <= 0) {
    endGame();
    return;
  }
  state.mode = "idle";
  showAuthor();
  syncPieces();
  scheduleHint();
}

async function goalVictory() {
  clearHint(false);
  state.mode = "gameOver";
  const moveBonus = state.moves * 50;
  addScore(moveBonus);
  setMessage(`Цель выполнена! +${moveBonus} за оставшиеся ходы!`);
  playTone(880, 0.15);
  const count = Math.min(state.moves, 12);
  for (let i = 0; i < count; i += 1) {
    await wait(90 * i);
    showFloatingScore(50, { row: Math.random() * 7, col: Math.random() * 7 });
  }
  await wait(1400);
  advanceLevel();
}

async function advanceLevel() {
  const next = state.level + 1;
  if (next >= LEVELS.length) {
    if (els.gameOverTitle) els.gameOverTitle.textContent = "Победа!";
    endGame();
    return;
  }
  const prevScore = state.score;
  closeDialogs();
  clearHint(false);
  state.level = next;
  const cfg = LEVELS[state.level];
  state.moves = cfg.moves;
  state.goals = Object.fromEntries(cfg.goals.map(({ type, count }) => [type, count]));
  state.goalCompleted = false;
  state.mode = "idle";
  state.selected = null;
  state.lastSwap = [];
  state.elements.forEach((element) => element.remove());
  state.elements.clear();
  state.board = createPlayableBoard();
  state.score = prevScore;
  if (els.levelBadge) els.levelBadge.textContent = cfg.label;
  renderGoalRows();
  setMessage(`Уровень ${cfg.level}! Удачи!`);
  syncUi();
  syncBoosterUi();
  syncPieces(true);
  scheduleHint();
}

function endGame() {
  clearHint(false);
  state.mode = "gameOver";
  if (els.gameOverTitle) els.gameOverTitle.textContent = "Финиш";
  els.finalScore.textContent = state.score;
  els.playerName.value = "";
  renderLeaderboard();
  els.gameOverDialog.showModal();
  setTimeout(() => els.playerName.focus(), 50);
}

// ── BOOSTER SYSTEM ──

function clearRocketPreview() {
  state.elements.forEach((el) => el.classList.remove("rocket-preview"));
}

function clearBombPreview() {
  state.elements.forEach((el) => el.classList.remove("bomb-preview"));
}

function activateBooster(type) {
  if (state.mode !== "idle") return;
  if (state.boosters[type] <= 0) {
    setMessage("Бустер закончился!");
    return;
  }

  // Rocket cycles: OFF → ROW → COL → OFF
  if (type === "rocket") {
    if (state.activeTool !== "rocket") {
      state.activeTool = "rocket";
      state.rocketDir = "row";
      syncBoosterUi();
      setMessage("Ракета → СТРОКА · ещё раз = СТОЛБЕЦ");
    } else if (state.rocketDir === "row") {
      state.rocketDir = "col";
      setMessage("Ракета → СТОЛБЕЦ · ещё раз = отмена");
    } else {
      state.activeTool = null;
      clearRocketPreview();
      syncBoosterUi();
      setMessage("Ракета отменена");
    }
    return;
  }

  if (state.activeTool === type) {
    state.activeTool = null;
    clearBombPreview();
    syncBoosterUi();
    setMessage("Бустер отменён");
    return;
  }
  state.activeTool = type;
  syncBoosterUi();
  const hints = {
    hammer:  "Молоток: кликни на любую фишку",
    rainbow: "Радуга: кликни — уберёт все фишки этого цвета",
    bomb:    "Бомба: кликни на фишку — взорвёт 3×3",
  };
  setMessage(hints[type] ?? "");
}

async function applyBoosterToTile(coord, tool) {
  if (!inBounds(coord.row, coord.col)) return;
  state.boosters[tool] -= 1;
  state.activeTool = null;
  clearRocketPreview();
  clearBombPreview();
  syncBoosterUi();
  clearHint(false);
  state.mode = "resolving";

  const remove = new Map();
  if (tool === "hammer") {
    remove.set(key(coord.row, coord.col), coord);
  } else if (tool === "rocket") {
    if (state.rocketDir === "row") {
      for (let c = 0; c < SIZE; c += 1) remove.set(key(coord.row, c), { row: coord.row, col: c });
    } else {
      for (let r = 0; r < SIZE; r += 1) remove.set(key(r, coord.col), { row: r, col: coord.col });
    }
    state.rocketDir = state.rocketDir === "row" ? "col" : "row";
  } else if (tool === "rainbow") {
    const targetType = getBlock(coord)?.type;
    if (targetType) {
      for (let r = 0; r < SIZE; r += 1) {
        for (let c = 0; c < SIZE; c += 1) {
          if (state.board[r][c]?.type === targetType) remove.set(key(r, c), { row: r, col: c });
        }
      }
    }
  } else if (tool === "bomb") {
    clearBombPreview();
    for (let r = coord.row - 1; r <= coord.row + 1; r += 1) {
      for (let c = coord.col - 1; c <= coord.col + 1; c += 1) {
        if (inBounds(r, c)) remove.set(key(r, c), { row: r, col: c });
      }
    }
  }

  const coords = [...remove.values()];
  if (coords.length === 0) {
    state.mode = "idle";
    return;
  }
  await animateRemoval(coords);
  collectGoals(coords);
  removeCells(coords);
  addScore(coords.length * 15, averageCell(coords));
  collapseBoard();
  syncPieces();
  await wait(350);
  await resolveBoard(1);
  await afterMoveCleanup(false);
}

function syncBoosterUi() {
  els.boosterBtns.forEach((btn) => {
    const type = btn.dataset.booster;
    const count = state.boosters[type];
    const badge = btn.querySelector("b");
    if (badge) badge.textContent = count;
    btn.disabled = count === 0;
    btn.classList.toggle("booster--active", state.activeTool === type);
    btn.classList.toggle("booster--empty", count === 0);
  });
}

function saveFinalScore() {
  const name = sanitizeName(els.playerName.value);
  const list = getLeaderboard();
  list.push({ name, score: state.score, date: new Date().toISOString() });
  list.sort((a, b) => b.score - a.score);
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list.slice(0, 10)));
  renderLeaderboard();
  setMessage("Результат сохранен!");
}

function getLeaderboard() {
  try {
    const parsed = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function renderLeaderboard() {
  const list = getLeaderboard();
  const html = list.length ? list.map((item) => `<li><strong>${escapeHtml(item.name)}</strong> - ${item.score}</li>`).join("") : "<li>Пока пусто</li>";
  els.finalLeaderboard.innerHTML = html;
  els.leaderboardList.innerHTML = html;
}

function showLeaderboard() {
  clearHint(false);
  renderLeaderboard();
  els.settingsDialog.close();
  els.leaderboardDialog.showModal();
}

function pauseGame() {
  if (!["idle", "task"].includes(state.mode)) return;
  clearHint(false);
  if (state.mode === "task") return;
  els.settingsDialog.close();
  state.mode = "paused";
  els.pauseDialog.showModal();
}

function resumeGame() {
  els.pauseDialog.close();
  state.mode = "idle";
  scheduleHint();
}

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark");
  localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
}

function toggleSound() {
  state.sound = !state.sound;
  localStorage.setItem(SOUND_KEY, state.sound ? "on" : "off");
  updateSoundButton();
  playTone(520, 0.05);
}

function updateSoundButton() {
  els.sound.title = state.sound ? "Выключить звук" : "Включить звук";
  els.sound.setAttribute("aria-label", els.sound.title);
  if (els.soundIcon) {
    els.soundIcon.src = state.sound ? "assets/ui/icon_sound_on.png" : "assets/ui/icon_sound_off.png";
    els.soundIcon.alt = state.sound ? "Звук вкл" : "Звук выкл";
  }
}

async function afterMoveCleanup(shouldShowTask) {
  if (state.goalCompleted) {
    await goalVictory();
    return;
  }
  if (state.moves <= 0) {
    endGame();
    return;
  }
  state.mode = "idle";
  if (shouldShowTask) showTask();
  else scheduleHint();
}

function addScore(points, coord) {
  state.score = Math.max(0, state.score + points);
  syncUi();
  if (points) showFloatingScore(points, coord);
}

function decrementMove() {
  state.moves = Math.max(0, state.moves - 1);
  syncUi();
}

function syncUi() {
  els.score.textContent = state.score;
  els.moves.textContent = state.moves;
  els.streak.textContent = state.streak;
  els.status.textContent = state.mode === "idle" ? "Собери фишки и реши бонусный вопрос" : "Минуточку, поле играет";
  // Update goal counts
  if (els.goalRows) {
    els.goalRows.querySelectorAll(".goal-row").forEach((row) => {
      const count = row.querySelector(".goal-count");
      if (count) count.textContent = state.goals[row.dataset.goalType] ?? 0;
    });
  }
  if (els.goalCard) {
    const almostDone = Object.values(state.goals).some((v) => v > 0 && v <= 3);
    const allDone = state.goalCompleted;
    els.goalCard.classList.toggle("goal-card--almost", almostDone && !allDone);
    els.goalCard.classList.toggle("goal-card--done", allDone);
  }
}

function setMessage(message) {
  clearTimeout(messageResetTimer);
  els.message.textContent = message;
  messageResetTimer = setTimeout(() => { els.message.innerHTML = AUTHOR_HTML; }, 3500);
}

function showAuthor() {
  clearTimeout(messageResetTimer);
  els.message.innerHTML = AUTHOR_HTML;
}

function getBlock(coord) {
  return state.board[coord.row][coord.col];
}

function swap(first, second) {
  const temp = state.board[first.row][first.col];
  state.board[first.row][first.col] = state.board[second.row][second.col];
  state.board[second.row][second.col] = temp;
}

function findPieceElement(coord) {
  const block = getBlock(coord);
  return block ? state.elements.get(block.id) : null;
}

function findMostCommonType() {
  const counts = {};
  state.board.flat().forEach((block) => {
    if (block?.type) counts[block.type] = (counts[block.type] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || randomType();
}

function averageCell(cells) {
  if (!cells.length) return { row: 3.5, col: 3.5 };
  return {
    row: cells.reduce((sum, cell) => sum + cell.row, 0) / cells.length,
    col: cells.reduce((sum, cell) => sum + cell.col, 0) / cells.length
  };
}

function cloneBoard(board) {
  return board.map((row) => row.map((block) => (block ? { ...block } : null)));
}

function areAdjacent(first, second) {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;
}

function sameCoord(first, second) {
  return first.row === second.row && first.col === second.col;
}

function inBounds(row, col) {
  return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
}

function key(row, col) {
  return `${row}:${col}`;
}

function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[randomIndex]] = [items[randomIndex], items[index]];
  }
  return items;
}

function directionSymbol(from, to) {
  if (to.col > from.col) return "→";
  if (to.col < from.col) return "←";
  if (to.row > from.row) return "↓";
  return "↑";
}

function directionName(from, to) {
  if (to.col > from.col) return "right";
  if (to.col < from.col) return "left";
  if (to.row > from.row) return "down";
  return "up";
}

function normalizeAnswer(value) {
  return String(value ?? "").trim().toLowerCase().replaceAll("ё", "е");
}

function sanitizeName(value) {
  const clean = String(value || "").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, 12);
  return clean || "Игрок";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function playTone(frequency, duration) {
  if (!state.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = frequency;
    oscillator.type = "sine";
    gain.gain.setValueAtTime(0.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    state.sound = false;
  }
}
