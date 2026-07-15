const prizes = [
  "$100",
  "$200",
  "$300",
  "$500",
  "$1,000",
  "$2,000",
  "$4,000",
  "$8,000",
  "$16,000",
  "$32,000",
  "$64,000",
  "$125,000",
  "$250,000",
  "$500,000",
  "$600,000",
  "$700,000",
  "$800,000",
  "$900,000",
  "$950,000",
  "$1,000,000"
];

const prizeValues = [
  100,
  200,
  300,
  500,
  1000,
  2000,
  4000,
  8000,
  16000,
  32000,
  64000,
  125000,
  250000,
  500000,
  600000,
  700000,
  800000,
  900000,
  950000,
  1000000
];

const topicFactories = [
  createToBeQuestion,
  createArticleQuestion,
  createPluralQuestion,
  createHaveGotQuestion,
  createPossessiveQuestion,
  createCanQuestion,
  createThereQuestion,
  createPrepositionQuestion,
  createPresentSimpleQuestion,
  createDoDoesQuestion,
  createPresentContinuousQuestion,
  createSomeAnyQuestion,
  createWasWereQuestion,
  createGoingToQuestion,
  createComparativeQuestion,
  createPronounQuestion,
  createDemonstrativeQuestion,
  createHowMuchManyQuestion,
  createPossessiveSQuestion,
  createPastSimpleQuestion
];

let questions = buildQuestionSet();

const letters = ["A", "B", "C", "D"];
const coachLines = [
  "Готовы? Смотрим на правило и выбираем ответ.",
  "Сначала найдите подлежащее, потом форму глагола.",
  "Не торопитесь: один лишний вариант обычно выглядит очень уверенно.",
  "Проговорите предложение вслух - ухо часто помогает грамматике.",
  "Отличный момент для мини-правила после ответа."
];

const state = {
  index: 0,
  scoreIndex: -1,
  selected: null,
  resolved: false,
  hiddenChoices: new Set(),
  soundOn: false,
  streak: 0,
  mistakes: 0,
  correctAnswers: 0,
  answerLog: [],
  score: 0,
  used: {
    fifty: false,
    audience: false,
    hint: false
  }
};

const introScreen = document.getElementById("introScreen");
const gameScreen = document.getElementById("gameScreen");
const startGameButton = document.getElementById("startGame");
const soundToggle = document.getElementById("soundToggle");
const homeButton = document.getElementById("homeButton");
const questionCounter = document.getElementById("questionCounter");
const topicCounter = document.getElementById("topicCounter");
const bankCounter = document.getElementById("bankCounter");
const streakCounter = document.getElementById("streakCounter");
const currentPrize = document.getElementById("currentPrize");
const topicBadge = document.getElementById("topicBadge");
const levelBadge = document.getElementById("levelBadge");
const questionPrize = document.getElementById("questionPrize");
const questionText = document.getElementById("questionText");
const answersGrid = document.getElementById("answersGrid");
const prizeList = document.getElementById("prizeList");
const feedbackPanel = document.getElementById("feedbackPanel");
const fiftyButton = document.getElementById("fiftyButton");
const audienceButton = document.getElementById("audienceButton");
const hintButton = document.getElementById("hintButton");
const restartButton = document.getElementById("restartButton");
const progressFill = document.getElementById("progressFill");
const coachMessage = document.getElementById("coachMessage");
const confettiLayer = document.getElementById("confettiLayer");
const finalOverlay = document.getElementById("finalOverlay");
const finalMascot = document.getElementById("finalMascot");
const finalTitle = document.getElementById("finalTitle");
const finalMessage = document.getElementById("finalMessage");
const finalResults = document.getElementById("finalResults");
const finalAnalysis = document.getElementById("finalAnalysis");
const playAgainButton = document.getElementById("playAgainButton");

let audioContext;

startGameButton.addEventListener("click", () => {
  prepareNewRun();
  document.body.classList.add("is-playing");
  introScreen.hidden = true;
  gameScreen.hidden = false;
  finalOverlay.hidden = true;
  renderGame();
  playSound("start");
});

if (soundToggle) {
  soundToggle.addEventListener("click", () => {
    state.soundOn = !state.soundOn;
    soundToggle.textContent = state.soundOn ? "Звук: вкл" : "Звук: выкл";
    soundToggle.setAttribute("aria-pressed", String(state.soundOn));
    playSound("toggle");
  });
}

answersGrid.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-choice]");
  if (!button || state.resolved) {
    return;
  }

  const choiceIndex = Number(button.dataset.choice);
  if (state.hiddenChoices.has(choiceIndex)) {
    return;
  }

  submitAnswer(choiceIndex);
});

fiftyButton.addEventListener("click", useFiftyFifty);
audienceButton.addEventListener("click", useAudience);
hintButton.addEventListener("click", useHint);
restartButton.addEventListener("click", resetGame);
playAgainButton.addEventListener("click", resetGame);
if (homeButton) {
  homeButton.addEventListener("click", returnToMainMenu);
}

renderPrizeList();

function buildQuestionSet() {
  const selectedQuestions = [];
  const usedTexts = new Set();

  shuffle(topicFactories).forEach((factory) => {
    let question = factory();
    let attempts = 0;

    while (usedTexts.has(question.text) && attempts < 12) {
      question = factory();
      attempts += 1;
    }

    if (!usedTexts.has(question.text)) {
      usedTexts.add(question.text);
      selectedQuestions.push(question);
    }
  });

  return selectedQuestions.slice(0, prizes.length);
}

function makeQuestion({ topic, level, text, correct, distractors, hint, note }) {
  const wrongChoices = unique(distractors).filter((choice) => choice !== correct);
  const choices = shuffle([correct, ...shuffle(wrongChoices).slice(0, 3)]);

  return {
    topic,
    level,
    text,
    choices,
    answer: choices.indexOf(correct),
    hint,
    note
  };
}

function createToBeQuestion() {
  const variants = [
    { subject: "I", complement: "eight years old", correct: "am", distractors: ["is", "are", "be"] },
    { subject: "My sister", complement: "happy today", correct: "is", distractors: ["am", "are", "be"] },
    { subject: "Tom and Ben", complement: "in the classroom", correct: "are", distractors: ["am", "is", "be"] },
    { subject: "The cat", complement: "under the chair", correct: "is", distractors: ["am", "are", "be"] },
    { subject: "We", complement: "ready for English", correct: "are", distractors: ["am", "is", "be"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "to be",
    level: "Warm-up",
    text: `${item.subject} ___ ${item.complement}.`,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Найдите подлежащее: I, he / she / it или we / you / they.",
    note: "В Present Simple у глагола be три формы: I am, he / she / it is, we / you / they are."
  });
}

function createArticleQuestion() {
  const variants = [
    { noun: "apple", correct: "an" },
    { noun: "orange ruler", correct: "an" },
    { noun: "egg", correct: "an" },
    { noun: "umbrella", correct: "an" },
    { noun: "banana", correct: "a" },
    { noun: "green pen", correct: "a" },
    { noun: "small robot", correct: "a" },
    { noun: "big school bag", correct: "a" }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "a / an",
    level: "Warm-up",
    text: `It is ___ ${item.noun}.`,
    correct: item.correct,
    distractors: item.correct === "an" ? ["a", "am", "are"] : ["an", "am", "are"],
    hint: "Послушайте первый звук следующего слова.",
    note: "A ставим перед согласным звуком, an - перед гласным звуком."
  });
}

function createPluralQuestion() {
  const variants = [
    { one: "child", two: "children", distractors: ["childs", "childes", "child"] },
    { one: "mouse", two: "mice", distractors: ["mouses", "mouse", "mices"] },
    { one: "man", two: "men", distractors: ["mans", "man", "mens"] },
    { one: "woman", two: "women", distractors: ["womans", "woman", "womens"] },
    { one: "box", two: "boxes", distractors: ["boxs", "box", "boxies"] },
    { one: "bus", two: "buses", distractors: ["buss", "bus", "busies"] },
    { one: "toy", two: "toys", distractors: ["toies", "toy", "toyes"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "plurals",
    level: "Warm-up",
    text: `One ${item.one}, two ___.`,
    correct: item.two,
    distractors: item.distractors,
    hint: "Подумайте, обычное это множественное число или слово-исключение.",
    note: "Многие слова получают окончание -s или -es, но irregular plurals нужно запоминать отдельно."
  });
}

function createHaveGotQuestion() {
  const variants = [
    { subject: "I", correct: "have", object: "a new pencil case" },
    { subject: "We", correct: "have", object: "three stickers" },
    { subject: "They", correct: "have", object: "blue rulers" },
    { subject: "He", correct: "has", object: "a red kite" },
    { subject: "She", correct: "has", object: "a funny puppet" },
    { subject: "My brother", correct: "has", object: "a toy train" }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "have got",
    level: "School bag",
    text: `${item.subject} ___ got ${item.object}.`,
    correct: item.correct,
    distractors: item.correct === "has" ? ["have", "is", "are"] : ["has", "is", "are"],
    hint: "He / she / it выбирают has. Остальные чаще выбирают have.",
    note: "Have got значит 'иметь'. He / she / it has got, а I / you / we / they have got."
  });
}

function createPossessiveQuestion() {
  const variants = [
    { intro: "This is Anna.", noun: "cat", correct: "her", distractors: ["his", "their", "our"] },
    { intro: "This is Tom.", noun: "bike", correct: "his", distractors: ["her", "their", "our"] },
    { intro: "This is my sister.", noun: "doll", correct: "her", distractors: ["his", "their", "our"] },
    { intro: "This is my brother.", noun: "ball", correct: "his", distractors: ["her", "their", "our"] },
    { intro: "These are Max and Leo.", noun: "robot", correct: "their", distractors: ["his", "her", "our"] },
    { intro: "This is my friend and me.", noun: "poster", correct: "our", distractors: ["his", "her", "their"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "possessives",
    level: "Family",
    text: `${item.intro} This is ___ ${item.noun}.`,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Кому принадлежит предмет: мальчику, девочке, им или нам?",
    note: "His = его, her = ее, their = их, our = наш."
  });
}

function createCanQuestion() {
  const variants = [
    { text: "A parrot ___ fly.", correct: "can", distractors: ["can't", "is", "are"], reason: "Попугай умеет летать." },
    { text: "A fish ___ ride a bike.", correct: "can't", distractors: ["can", "is", "are"], reason: "Рыба не может кататься на велосипеде." },
    { text: "A monkey ___ climb trees.", correct: "can", distractors: ["can't", "has", "is"], reason: "Обезьяна умеет лазать по деревьям." },
    { text: "A baby ___ drive a car.", correct: "can't", distractors: ["can", "has", "are"], reason: "Малыш не может водить машину." },
    { text: "A dog ___ bark.", correct: "can", distractors: ["can't", "is", "has"], reason: "Собака умеет лаять." },
    { text: "A turtle ___ run very fast.", correct: "can't", distractors: ["can", "is", "are"], reason: "Черепаха не бегает очень быстро." }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "can / can't",
    level: "Animals",
    text: item.text,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Подумайте, умеет ли герой делать это действие.",
    note: `${item.reason} После can / can't основной глагол идет без окончания.`
  });
}

function createThereQuestion() {
  const variants = [
    { thing: "a lamp", place: "on the desk", correct: "is", distractors: ["are", "am", "be"] },
    { thing: "two books", place: "in the bag", correct: "are", distractors: ["is", "am", "be"] },
    { thing: "one apple", place: "on the plate", correct: "is", distractors: ["are", "am", "be"] },
    { thing: "three pencils", place: "under the chair", correct: "are", distractors: ["is", "am", "be"] },
    { thing: "a poster", place: "on the wall", correct: "is", distractors: ["are", "am", "be"] },
    { thing: "five stars", place: "in the sky", correct: "are", distractors: ["is", "am", "be"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "there is / there are",
    level: "Room",
    text: `There ___ ${item.thing} ${item.place}.`,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Один предмет или несколько?",
    note: "There is используем с одним предметом, there are - с несколькими."
  });
}

function createPrepositionQuestion() {
  const variants = [
    { text: "The book is ___ the desk. It is on the top.", prep: "on", distractors: ["in", "under", "next to"] },
    { text: "The ball is ___ the chair. It is below it.", prep: "under", distractors: ["on", "in", "between"] },
    { text: "The cat is ___ the box. It is inside.", prep: "in", distractors: ["on", "under", "next to"] },
    { text: "The lamp is ___ the bed. It is beside it.", prep: "next to", distractors: ["in", "under", "between"] },
    { text: "The robot is ___ the two chairs. One chair is on the left and one is on the right.", prep: "between", distractors: ["on", "in", "under"] },
    { text: "The picture is ___ the wall. It hangs there.", prep: "on", distractors: ["under", "between", "in"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "prepositions",
    level: "Room",
    text: item.text,
    correct: item.prep,
    distractors: item.distractors,
    hint: "Нужно слово места: где находится предмет?",
    note: "Предлоги места помогают описать комнату: in, on, under, next to, between."
  });
}

function createPresentSimpleQuestion() {
  const subjects = [
    { text: "I", third: false },
    { text: "We", third: false },
    { text: "They", third: false },
    { text: "He", third: true },
    { text: "She", third: true },
    { text: "My dad", third: true }
  ];
  const actions = [
    { base: "play", third: "plays", ing: "playing", rest: "football on Sundays" },
    { base: "like", third: "likes", ing: "liking", rest: "apples" },
    { base: "read", third: "reads", ing: "reading", rest: "books after school" },
    { base: "go", third: "goes", ing: "going", rest: "to the park" },
    { base: "watch", third: "watches", ing: "watching", rest: "cartoons" }
  ];
  const subject = pick(subjects);
  const action = pick(actions);
  const correct = subject.third ? action.third : action.base;

  return makeQuestion({
    topic: "present simple",
    level: "Daily life",
    text: `${subject.text} ___ ${action.rest}.`,
    correct,
    distractors: [subject.third ? action.base : action.third, action.ing, `is ${action.base}`, `are ${action.base}`],
    hint: "С he / she / it в Present Simple часто появляется окончание -s или -es.",
    note: "В Present Simple: he / she / it likes, plays, goes; I / you / we / they like, play, go."
  });
}

function createDoDoesQuestion() {
  const variants = [
    { subject: "you", verb: "like bananas", correct: "Do", distractors: ["Does", "Is", "Are"] },
    { subject: "your mum", verb: "work in a hospital", correct: "Does", distractors: ["Do", "Is", "Are"] },
    { subject: "they", verb: "play tennis", correct: "Do", distractors: ["Does", "Is", "Are"] },
    { subject: "Tom", verb: "go to school by bus", correct: "Does", distractors: ["Do", "Is", "Are"] },
    { subject: "your friends", verb: "speak English", correct: "Do", distractors: ["Does", "Is", "Are"] },
    { subject: "she", verb: "read comics", correct: "Does", distractors: ["Do", "Is", "Are"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "do / does",
    level: "Daily life",
    text: `___ ${item.subject} ${item.verb}?`,
    correct: item.correct,
    distractors: item.distractors,
    hint: "He / she / it в вопросах Present Simple выбирают does.",
    note: "Do используем с I / you / we / they. Does используем с he / she / it."
  });
}

function createPresentContinuousQuestion() {
  const subjects = [
    { text: "I", be: "am" },
    { text: "She", be: "is" },
    { text: "Tom", be: "is" },
    { text: "The children", be: "are" },
    { text: "We", be: "are" },
    { text: "They", be: "are" }
  ];
  const actions = ["singing", "drawing", "reading", "playing", "dancing", "making a poster"];
  const subject = pick(subjects);
  const action = pick(actions);

  return makeQuestion({
    topic: "present continuous",
    level: "Actions now",
    text: `Look! ${subject.text} ___ ${action}.`,
    correct: subject.be,
    distractors: subject.be === "is" ? ["am", "are", "do"] : subject.be === "are" ? ["am", "is", "do"] : ["is", "are", "do"],
    hint: "Действие происходит сейчас: am / is / are + verb-ing.",
    note: "Present Continuous строится так: am / is / are + глагол с -ing."
  });
}

function createSomeAnyQuestion() {
  const variants = [
    { text: "I have got ___ apples in my bag.", correct: "some", distractors: ["any", "a", "an"], note: "В утвердительных предложениях часто используем some." },
    { text: "There are ___ bananas in the bag.", correct: "some", distractors: ["any", "a", "an"], note: "Some подходит для утвердительного предложения с несколькими предметами." },
    { text: "I haven't got ___ milk.", correct: "any", distractors: ["some", "a", "an"], note: "В отрицательных предложениях обычно используем any." },
    { text: "There aren't ___ oranges on the table.", correct: "any", distractors: ["some", "a", "an"], note: "В отрицании используем any: there aren't any oranges." },
    { text: "We have got ___ crayons for the picture.", correct: "some", distractors: ["any", "a", "an"], note: "В утвердительном предложении используем some: we have got some crayons." },
    { text: "There isn't ___ juice in the glass.", correct: "any", distractors: ["some", "a", "an"], note: "В отрицании используем any: there isn't any juice." }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "some / any",
    level: "Food",
    text: item.text,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Утверждение, отрицание или вопрос?",
    note: item.note
  });
}

function createWasWereQuestion() {
  const variants = [
    { subject: "I", place: "at school yesterday", correct: "was", distractors: ["were", "am", "are"] },
    { subject: "She", place: "in the park yesterday", correct: "was", distractors: ["were", "is", "are"] },
    { subject: "Tom", place: "happy last Sunday", correct: "was", distractors: ["were", "is", "are"] },
    { subject: "We", place: "at the zoo yesterday", correct: "were", distractors: ["was", "am", "is"] },
    { subject: "They", place: "at home last night", correct: "were", distractors: ["was", "is", "am"] },
    { subject: "The children", place: "in the classroom yesterday", correct: "were", distractors: ["was", "is", "am"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "was / were",
    level: "Yesterday",
    text: `${item.subject} ___ ${item.place}.`,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Yesterday / last показывают прошлое время.",
    note: "В прошлом времени: I / he / she / it was, we / you / they were."
  });
}

function createGoingToQuestion() {
  const beVariants = [
    { subject: "I", be: "am", plan: "make a card" },
    { subject: "She", be: "is", plan: "visit Grandma" },
    { subject: "Tom", be: "is", plan: "play football" },
    { subject: "We", be: "are", plan: "watch a film" },
    { subject: "They", be: "are", plan: "make a poster" }
  ];
  const goingVariants = [
    { subject: "We", be: "are", plan: "visit Grandma tomorrow" },
    { subject: "They", be: "are", plan: "play a game after school" },
    { subject: "She", be: "is", plan: "draw a picture tonight" },
    { subject: "Tom", be: "is", plan: "ride his bike tomorrow" }
  ];

  if (Math.random() > 0.45) {
    const item = pick(beVariants);
    return makeQuestion({
      topic: "going to",
      level: "Plans",
      text: `${item.subject} ___ going to ${item.plan} tomorrow.`,
      correct: item.be,
      distractors: item.be === "is" ? ["am", "are", "go"] : item.be === "are" ? ["am", "is", "go"] : ["is", "are", "go"],
      hint: "Для планов используем am / is / are + going to + verb.",
      note: "Going to помогает говорить о планах: I am going to..., she is going to..., they are going to..."
    });
  }

  const item = pick(goingVariants);
  return makeQuestion({
    topic: "going to",
    level: "Plans",
    text: `${item.subject} ${item.be} ___ ${item.plan}.`,
    correct: "going to",
    distractors: ["go to", "goes to", "went to"],
    hint: "После am / is / are для планов нужна форма going to.",
    note: "Схема планов: am / is / are + going to + основной глагол."
  });
}

function createComparativeQuestion() {
  const variants = [
    { first: "An elephant", second: "a mouse", correct: "bigger", distractors: ["big", "the biggest", "small"] },
    { first: "A cheetah", second: "a cat", correct: "faster", distractors: ["fast", "the fastest", "slow"] },
    { first: "A giraffe", second: "a dog", correct: "taller", distractors: ["tall", "the tallest", "short"] },
    { first: "Winter", second: "summer", correct: "colder", distractors: ["cold", "the coldest", "hot"] },
    { first: "A sofa", second: "a chair", correct: "bigger", distractors: ["big", "the biggest", "small"] },
    { first: "A train", second: "a bike", correct: "longer", distractors: ["long", "the longest", "short"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "comparatives",
    level: "Final",
    text: `${item.first} is ___ than ${item.second}.`,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Сравниваем два предмета. Ищите слово с -er и than.",
    note: "При сравнении двух предметов используем comparative + than: bigger than, faster than, taller than."
  });
}

function createPronounQuestion() {
  const variants = [
    { clue: "Anna is my friend.", correct: "She", rest: "is nine.", distractors: ["He", "They", "It"] },
    { clue: "Tom is in my class.", correct: "He", rest: "likes football.", distractors: ["She", "They", "It"] },
    { clue: "My mum and dad are at home.", correct: "They", rest: "are happy.", distractors: ["He", "She", "It"] },
    { clue: "This is my school bag.", correct: "It", rest: "is blue.", distractors: ["He", "She", "They"] },
    { clue: "My sister and I are pupils.", correct: "We", rest: "like English.", distractors: ["They", "He", "It"] },
    { clue: "You and Max are friends.", correct: "You", rest: "are kind.", distractors: ["We", "He", "She"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "pronouns",
    level: "People",
    text: `${item.clue} ___ ${item.rest}`,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Замените имя или предмет коротким словом: he, she, it, we, they.",
    note: "He = он, she = она, it = это/он/она для предмета или животного, we = мы, they = они."
  });
}

function createDemonstrativeQuestion() {
  const variants = [
    { text: "Near me, ___ is my pencil.", correct: "This", distractors: ["These", "Those", "They"] },
    { text: "Near me, ___ are my books.", correct: "These", distractors: ["This", "That", "It"] },
    { text: "Over there, ___ is a big kite.", correct: "That", distractors: ["Those", "These", "They"] },
    { text: "Over there, ___ are my red trainers.", correct: "Those", distractors: ["That", "This", "It"] },
    { text: "In my hand, ___ is my new ruler.", correct: "This", distractors: ["These", "Those", "They"] },
    { text: "Near me, ___ are funny toys.", correct: "These", distractors: ["This", "That", "It"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "this / these",
    level: "Classroom",
    text: item.text,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Один предмет или несколько? Близко или далеко?",
    note: "This / that используем с одним предметом. These / those используем с несколькими предметами."
  });
}

function createHowMuchManyQuestion() {
  const variants = [
    { text: "How ___ apples are there?", correct: "many", distractors: ["much", "some", "any"], note: "Apples можно посчитать, поэтому говорим how many." },
    { text: "How ___ milk is there?", correct: "much", distractors: ["many", "some", "any"], note: "Milk обычно не считаем по штукам, поэтому говорим how much." },
    { text: "How ___ pencils have you got?", correct: "many", distractors: ["much", "a", "an"], note: "Pencils можно посчитать: one pencil, two pencils." },
    { text: "How ___ juice is in the glass?", correct: "much", distractors: ["many", "a", "an"], note: "Juice - жидкость, обычно используем how much." },
    { text: "How ___ biscuits are on the plate?", correct: "many", distractors: ["much", "some", "any"], note: "Biscuits можно посчитать, поэтому how many." },
    { text: "How ___ cheese is there?", correct: "much", distractors: ["many", "some", "any"], note: "Cheese часто считаем как вещество, поэтому how much." }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "how much / many",
    level: "Food",
    text: item.text,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Можно посчитать предметы по штукам? Если да - many. Если нет - much.",
    note: item.note
  });
}

function createPossessiveSQuestion() {
  const variants = [
    { owner: "Tom", thing: "bike", correct: "Tom's", distractors: ["Toms", "Tom", "Tom is"] },
    { owner: "Anna", thing: "doll", correct: "Anna's", distractors: ["Annas", "Anna", "Anna is"] },
    { owner: "Dad", thing: "car", correct: "Dad's", distractors: ["Dads", "Dad", "Dad is"] },
    { owner: "Mum", thing: "bag", correct: "Mum's", distractors: ["Mums", "Mum", "Mum is"] },
    { owner: "Ben", thing: "robot", correct: "Ben's", distractors: ["Bens", "Ben", "Ben is"] },
    { owner: "Sally", thing: "book", correct: "Sally's", distractors: ["Sallys", "Sally", "Sally is"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "'s possessive",
    level: "Family",
    text: `This is ___ ${item.thing}.`,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Если предмет кому-то принадлежит, к имени добавляем 's.",
    note: `Чтобы сказать "${item.owner}'s ${item.thing}", добавляем 's к имени владельца.`
  });
}

function createPastSimpleQuestion() {
  const variants = [
    { subject: "I", correct: "played", rest: "football yesterday", distractors: ["play", "plays", "playing"] },
    { subject: "We", correct: "watched", rest: "a cartoon last night", distractors: ["watch", "watches", "watching"] },
    { subject: "She", correct: "visited", rest: "Grandma yesterday", distractors: ["visit", "visits", "visiting"] },
    { subject: "Tom", correct: "liked", rest: "the film last night", distractors: ["like", "likes", "liking"] },
    { subject: "They", correct: "cleaned", rest: "the room", distractors: ["clean", "cleans", "cleaning"] },
    { subject: "My dad", correct: "cooked", rest: "dinner yesterday", distractors: ["cook", "cooks", "cooking"] }
  ];
  const item = pick(variants);

  return makeQuestion({
    topic: "past simple",
    level: "Yesterday",
    text: `${item.subject} ___ ${item.rest}.`,
    correct: item.correct,
    distractors: item.distractors,
    hint: "Yesterday / last night показывают прошлое. У обычных глаголов часто появляется -ed.",
    note: "В Past Simple у обычных глаголов добавляем -ed: play - played, watch - watched, visit - visited."
  });
}

function prepareNewRun() {
  const previousTexts = new Set(questions.map((question) => question.text));
  let nextQuestions = buildQuestionSet();
  let attempts = 0;

  while (countQuestionOverlap(nextQuestions, previousTexts) > 7 && attempts < 16) {
    nextQuestions = buildQuestionSet();
    attempts += 1;
  }

  questions = nextQuestions;
  state.index = 0;
  state.scoreIndex = -1;
  state.selected = null;
  state.resolved = false;
  state.hiddenChoices = new Set();
  state.streak = 0;
  state.mistakes = 0;
  state.correctAnswers = 0;
  state.answerLog = [];
  state.score = 0;
  state.used = {
    fifty: false,
    audience: false,
    hint: false
  };
  hideFeedback();
}

function countQuestionOverlap(nextQuestions, previousTexts) {
  return nextQuestions.filter((question) => previousTexts.has(question.text)).length;
}

function renderGame() {
  const current = questions[state.index];
  const activePrize = prizes[state.index];
  const bank = formatMoney(state.score);
  const progress = ((state.index + (state.resolved ? 1 : 0)) / questions.length) * 100;

  questionCounter.textContent = `${state.index + 1} / ${questions.length}`;
  topicCounter.textContent = current.topic;
  bankCounter.textContent = bank;
  if (streakCounter) {
    streakCounter.textContent = String(state.correctAnswers);
  }
  if (currentPrize) {
    currentPrize.textContent = activePrize;
  }
  topicBadge.textContent = current.topic;
  levelBadge.textContent = current.level;
  questionPrize.textContent = `${activePrize} question`;
  questionText.textContent = current.text;
  progressFill.style.width = `${progress}%`;

  if (coachMessage && !state.resolved) {
    coachMessage.textContent = coachLines[state.index % coachLines.length];
  }

  renderAnswers(current);
  renderPrizeList();
  updateLifelines();

  if (!state.resolved && feedbackPanel.dataset.mode === "answer") {
    hideFeedback();
  }
}

function renderAnswers(current) {
  answersGrid.textContent = "";

  current.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "answer-button";
    button.type = "button";
    button.dataset.choice = String(index);
    button.setAttribute("aria-label", `${letters[index]}. ${choice}`);

    if (state.hiddenChoices.has(index)) {
      button.classList.add("hidden-choice");
      button.disabled = true;
    }

    if (state.resolved) {
      button.disabled = true;
      if (index === current.answer) {
        button.classList.add("is-correct");
      }
      if (index === state.selected && index !== current.answer) {
        button.classList.add("is-wrong");
      }
      if (index === state.selected && index === current.answer) {
        button.classList.add("is-selected");
      }
    }

    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.textContent = letters[index];

    const text = document.createElement("span");
    text.className = "answer-text";
    text.textContent = choice;

    button.append(letter, text);
    answersGrid.appendChild(button);
  });
}

function renderPrizeList() {
  prizeList.textContent = "";

  prizes
    .map((prize, index) => ({ prize, index }))
    .reverse()
    .forEach(({ prize, index }) => {
      const row = document.createElement("li");
      row.className = "prize-row";

      if (index === state.index) {
        row.classList.add("current");
      }
      if (index < state.index) {
        row.classList.add("passed");
      }
      if (index === 4 || index === 9) {
        row.classList.add("safe");
      }

      const number = document.createElement("span");
      number.className = "row-number";
      number.textContent = String(index + 1);

      const amount = document.createElement("span");
      amount.textContent = prize;

      const safe = document.createElement("span");
      safe.className = "safe-mark";
      safe.textContent = index === 4 || index === 9 ? "safe" : "";

      row.append(number, amount, safe);
      prizeList.appendChild(row);
    });
}

function submitAnswer(choiceIndex) {
  const current = questions[state.index];
  const isCorrect = choiceIndex === current.answer;
  state.selected = choiceIndex;
  state.resolved = true;

  state.answerLog.push({
    number: state.index + 1,
    prize: prizes[state.index],
    topic: current.topic,
    level: current.level,
    question: current.text,
    selectedLetter: letters[choiceIndex],
    selectedAnswer: current.choices[choiceIndex],
    correctLetter: letters[current.answer],
    correctAnswer: current.choices[current.answer],
    isCorrect,
    note: current.note
  });

  if (isCorrect) {
    state.scoreIndex = state.index;
    state.score = prizeValues[state.index];
    state.streak += 1;
    state.correctAnswers += 1;
    if (coachMessage) {
      coachMessage.textContent = `Верно! Вы поднимаетесь до ${prizes[state.index]}.`;
    }
    playSound("correct");
    launchConfetti(26);
  } else {
    state.streak = 0;
    state.mistakes += 1;
    if (coachMessage) {
      coachMessage.textContent = "Игра окончена. Разберем правило и посмотрим итог.";
    }
    playSound("wrong");
  }

  renderGame();
  if (isCorrect) {
    launchCorrectAnswerEffect(choiceIndex);
  }
  showAnswerFeedback(isCorrect);
}

function launchCorrectAnswerEffect(choiceIndex) {
  const selectedButton = answersGrid.querySelector(`button[data-choice="${choiceIndex}"]`);
  const playPanel = document.querySelector(".play-panel");
  const questionBox = document.querySelector(".question-box");

  if (playPanel) {
    playPanel.classList.add("victory-panel");
    window.setTimeout(() => playPanel.classList.remove("victory-panel"), 1100);
  }

  if (questionBox) {
    questionBox.classList.add("victory-question");
    window.setTimeout(() => questionBox.classList.remove("victory-question"), 1100);
  }

  if (!selectedButton) {
    return;
  }

  selectedButton.classList.add("victory-answer");
  window.setTimeout(() => selectedButton.classList.remove("victory-answer"), 1200);

  const rect = selectedButton.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  launchStarBurst(centerX, centerY, Math.min(rect.width, 520));
}

function launchStarBurst(centerX, centerY, spread) {
  const colors = ["#fff06c", "#ffcf4a", "#44d9ff", "#57d68d", "#ffffff", "#e848a5"];
  const amount = 34;

  for (let index = 0; index < amount; index += 1) {
    const spark = document.createElement("span");
    const angle = (Math.PI * 2 * index) / amount + Math.random() * 0.45;
    const distance = spread * (0.22 + Math.random() * 0.58);
    const size = 8 + Math.random() * 13;

    spark.className = index % 3 === 0 ? "answer-spark answer-spark-ring" : "answer-spark";
    spark.style.left = `${centerX}px`;
    spark.style.top = `${centerY}px`;
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.background = colors[index % colors.length];
    spark.style.setProperty("--burst-x", `${Math.cos(angle) * distance}px`);
    spark.style.setProperty("--burst-y", `${Math.sin(angle) * distance}px`);
    spark.style.setProperty("--burst-rotate", `${-180 + Math.random() * 360}deg`);
    spark.style.setProperty("--burst-delay", `${Math.random() * 0.08}s`);

    confettiLayer.appendChild(spark);
    window.setTimeout(() => spark.remove(), 1200);
  }
}

function showAnswerFeedback(isCorrect) {
  const current = questions[state.index];
  feedbackPanel.textContent = "";
  feedbackPanel.hidden = false;
  feedbackPanel.dataset.mode = "answer";

  const title = document.createElement("h3");
  title.textContent = isCorrect ? "Правильно!" : "Почти получилось!";

  const message = document.createElement("p");
  if (isCorrect) {
    message.textContent = state.index === questions.length - 1
      ? `Финальный вопрос взят: ${prizes[state.index]}!`
      : `Вы поднимаетесь до ${prizes[state.index]}. Текущий банк: ${formatMoney(state.score)}.`;
  } else {
    const safePrize = getSafePrize();
    state.score = moneyToNumber(safePrize);
    bankCounter.textContent = safePrize;
    message.textContent = `Правильный ответ: ${letters[current.answer]}. ${current.choices[current.answer]}. Игра окончена. Ваш выигрыш: ${safePrize}.`;
  }

  const note = document.createElement("p");
  note.textContent = current.note;

  const actions = document.createElement("div");
  actions.className = "feedback-actions";

  if (isCorrect && state.index < questions.length - 1) {
    actions.appendChild(createActionButton("Следующий вопрос", nextQuestion));
  }

  if (isCorrect && state.index === questions.length - 1) {
    actions.appendChild(createActionButton("Финальный экран", () => showFinalScreen(true)));
  }

  if (!isCorrect) {
    actions.append(
      createActionButton("Итоги игры", () => showFinalScreen(false)),
      createActionButton("Новая игра", resetGame, "quiet-button")
    );
  }

  feedbackPanel.append(title, message, note, actions);
}

function createActionButton(label, handler, className = "") {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  if (className) {
    button.className = className;
  }
  button.addEventListener("click", handler);
  return button;
}

function nextQuestion() {
  if (state.index >= questions.length - 1) {
    showFinalScreen(false);
    return;
  }

  state.index += 1;
  state.selected = null;
  state.resolved = false;
  state.hiddenChoices = new Set();
  hideFeedback();
  renderGame();
}

function resetGame() {
  prepareNewRun();
  document.body.classList.add("is-playing");
  finalOverlay.hidden = true;
  introScreen.hidden = true;
  gameScreen.hidden = false;
  renderGame();
  playSound("start");
}

function returnToMainMenu() {
  document.body.classList.remove("is-playing");
  finalOverlay.hidden = true;
  gameScreen.hidden = true;
  introScreen.hidden = false;
  hideFeedback();
  playSound("toggle");
}

function showFinalScreen(perfectFinish) {
  if (finalTitle) {
    finalTitle.textContent = perfectFinish ? "Вы стали миллионером!" : "Игра окончена";
  }
  if (finalMessage) {
    finalMessage.textContent = perfectFinish
      ? "Все 20 вопросов пройдены. Главный приз ваш!"
      : `Ваш итоговый выигрыш: ${formatMoney(state.score)}. Верных ответов: ${state.correctAnswers} из ${state.answerLog.length}.`;
  }
  if (finalMascot) {
    finalMascot.src = "assets/professor-spark.png";
    finalMascot.alt = "";
  }
  renderFinalResults();
  renderAnswerAnalysis();
  finalOverlay.hidden = false;
  launchConfetti(perfectFinish ? 80 : 36);
  playSound("finish");
}

function getSafePrize() {
  if (state.scoreIndex >= 9) {
    return prizes[9];
  }
  if (state.scoreIndex >= 4) {
    return prizes[4];
  }
  return "$0";
}

function renderFinalResults() {
  if (!finalResults) {
    return;
  }

  finalResults.textContent = "";
  const card = document.createElement("article");
  card.className = "final-team-result winner solo-result-card";

  const label = document.createElement("span");
  label.textContent = "Итог игры";

  const name = document.createElement("strong");
  name.textContent = "Grammar Millionaire Junior";

  const score = document.createElement("b");
  score.textContent = formatMoney(state.score);

  const details = document.createElement("p");
  details.textContent = `Верно: ${state.correctAnswers} из ${state.answerLog.length}`;

  card.append(label, name, score, details);
  finalResults.appendChild(card);
}

function renderAnswerAnalysis() {
  if (!finalAnalysis) {
    return;
  }

  finalAnalysis.textContent = "";
  const mistakes = state.answerLog.filter((entry) => !entry.isCorrect);

  if (mistakes.length === 0) {
    const clean = document.createElement("article");
    clean.className = "no-mistakes-card";

    const text = document.createElement("p");
    text.textContent = "Ошибок не было: можно быстро повторить самые сложные темы устно и сыграть еще раз.";

    clean.appendChild(text);
    finalAnalysis.appendChild(clean);
    return;
  }

  const list = document.createElement("div");
  list.className = "mistake-list";

  mistakes.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "mistake-card";

    const header = document.createElement("header");
    const title = document.createElement("h4");
    title.textContent = `Вопрос ${entry.number}`;

    const topic = document.createElement("span");
    topic.className = "topic-pill";
    topic.textContent = entry.topic;

    header.append(title, topic);

    const question = document.createElement("p");
    question.textContent = entry.question;

    const answers = document.createElement("div");
    answers.className = "mistake-answers";

    const chosen = document.createElement("span");
    chosen.textContent = `Ваш ответ: ${entry.selectedLetter}. ${entry.selectedAnswer}`;

    const correct = document.createElement("span");
    correct.append("Правильно: ");
    const correctValue = document.createElement("b");
    correctValue.textContent = `${entry.correctLetter}. ${entry.correctAnswer}`;
    correct.appendChild(correctValue);

    const note = document.createElement("p");
    note.textContent = entry.note;

    answers.append(chosen, correct);
    card.append(header, question, answers, note);
    list.appendChild(card);
  });

  finalAnalysis.appendChild(list);
}

function setText(element, value) {
  if (element) {
    element.textContent = value;
  }
}

function setHidden(element, value) {
  if (element) {
    element.hidden = value;
  }
}

function formatMoney(value) {
  return `$${value.toLocaleString("en-US")}`;
}

function moneyToNumber(value) {
  return Number(String(value).replace(/[$,]/g, "")) || 0;
}

function useFiftyFifty() {
  if (state.used.fifty || state.resolved) {
    return;
  }

  const current = questions[state.index];
  const wrongChoices = current.choices
    .map((_, index) => index)
    .filter((index) => index !== current.answer);

  shuffle(wrongChoices)
    .slice(0, 2)
    .forEach((index) => state.hiddenChoices.add(index));

  state.used.fifty = true;
  if (coachMessage) {
    coachMessage.textContent = "Два варианта улетели со сцены.";
  }
  playSound("lifeline");
  renderGame();
}

function useAudience() {
  if (state.used.audience || state.resolved) {
    return;
  }

  const current = questions[state.index];
  const correctPercent = 58 + Math.floor(Math.random() * 23);
  const values = [0, 0, 0, 0];
  const wrongIndexes = current.choices.map((_, index) => index).filter((index) => index !== current.answer);
  let remaining = 100 - correctPercent;

  values[current.answer] = correctPercent;
  shuffle(wrongIndexes).forEach((index, order) => {
    if (order === wrongIndexes.length - 1) {
      values[index] = remaining;
    } else {
      const max = Math.max(5, remaining - (wrongIndexes.length - order - 1) * 4);
      const value = Math.min(max, 4 + Math.floor(Math.random() * Math.max(1, max - 3)));
      values[index] = value;
      remaining -= value;
    }
  });

  state.used.audience = true;
  if (coachMessage) {
    coachMessage.textContent = "Класс проголосовал. Теперь выбирайте финальный ответ.";
  }
  playSound("lifeline");
  showAudience(values);
  updateLifelines();
}

function useHint() {
  if (state.used.hint || state.resolved) {
    return;
  }

  const current = questions[state.index];
  state.used.hint = true;
  if (coachMessage) {
    coachMessage.textContent = "Я подсвечу правило, но ответ выбираете вы.";
  }
  playSound("lifeline");
  feedbackPanel.textContent = "";
  feedbackPanel.hidden = false;
  feedbackPanel.dataset.mode = "hint";

  const title = document.createElement("h3");
  title.textContent = "Совет Professor Spark";

  const message = document.createElement("p");
  message.textContent = current.hint;

  feedbackPanel.append(title, message);
  updateLifelines();
}

function showAudience(values) {
  feedbackPanel.textContent = "";
  feedbackPanel.hidden = false;
  feedbackPanel.dataset.mode = "audience";

  const title = document.createElement("h3");
  title.textContent = "Голосование класса";

  const message = document.createElement("p");
  message.textContent = "Результаты на табло:";

  const bars = document.createElement("div");
  bars.className = "audience-bars";

  values.forEach((value, index) => {
    const row = document.createElement("div");
    row.className = "audience-row";

    const label = document.createElement("strong");
    label.textContent = letters[index];

    const meter = document.createElement("div");
    meter.className = "audience-meter";

    const fill = document.createElement("div");
    fill.className = "audience-fill";
    fill.style.width = `${value}%`;

    const percent = document.createElement("span");
    percent.textContent = `${value}%`;

    meter.appendChild(fill);
    row.append(label, meter, percent);
    bars.appendChild(row);
  });

  feedbackPanel.append(title, message, bars);
}

function updateLifelines() {
  setButtonUsed(fiftyButton, state.used.fifty);
  setButtonUsed(audienceButton, state.used.audience);
  setButtonUsed(hintButton, state.used.hint);
}

function setButtonUsed(button, used) {
  button.disabled = used || state.resolved;
  button.classList.toggle("used", used);
  button.setAttribute("aria-disabled", String(used || state.resolved));
}

function hideFeedback() {
  feedbackPanel.hidden = true;
  feedbackPanel.textContent = "";
  feedbackPanel.dataset.mode = "";
}

function launchConfetti(amount) {
  const colors = ["#ffcf4a", "#44d9ff", "#e848a5", "#57d68d", "#ffffff"];

  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement("span");
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.setProperty("--fall-delay", `${Math.random() * 0.35}s`);
    piece.style.setProperty("--fall-duration", `${1.9 + Math.random() * 1.4}s`);
    piece.style.setProperty("--fall-drift", `${-80 + Math.random() * 160}px`);
    piece.style.background = colors[index % colors.length];
    confettiLayer.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 3600);
  }
}

function playSound(type) {
  if (!state.soundOn) {
    return;
  }

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    return;
  }

  audioContext ||= new AudioCtor();

  const patterns = {
    toggle: [440],
    start: [330, 520, 660],
    lifeline: [520, 390],
    correct: [523, 659, 784],
    wrong: [220, 165],
    finish: [523, 659, 784, 1046]
  };

  patterns[type].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startAt = audioContext.currentTime + index * 0.09;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.05, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.16);

    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(startAt + 0.18);
  });
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function unique(items) {
  return [...new Set(items)];
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const nextIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[nextIndex]] = [copy[nextIndex], copy[index]];
  }
  return copy;
}
