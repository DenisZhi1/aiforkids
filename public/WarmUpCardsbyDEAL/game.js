(function () {
  "use strict";

  const prompts = window.WARMUP_PROMPTS || [];
  const state = {
    level: "ALL",
    deck: [],
    current: null,
    played: 0,
    flipped: false,
    drawing: false,
    timer: 45,
    timerRunning: false,
    timerHandle: null
  };

  const el = {
    cardsLeft: document.getElementById("cards-left"),
    questionTotal: document.getElementById("question-total"),
    levelPicker: document.getElementById("level-picker"),
    deckButton: document.getElementById("deck-button"),
    cardStage: document.getElementById("card-stage"),
    questionCard: document.getElementById("question-card"),
    cardFront: document.getElementById("card-front"),
    cardBack: document.getElementById("card-back"),
    category: document.getElementById("category"),
    questionNumber: document.getElementById("question-number"),
    cardLevel: document.getElementById("card-level"),
    helperLevel: document.getElementById("helper-level"),
    questionText: document.getElementById("question-text"),
    starter: document.getElementById("starter"),
    followUp: document.getElementById("follow-up"),
    timerCard: document.getElementById("timer-card"),
    timerDisplay: document.getElementById("timer-display"),
    timerProgress: document.getElementById("timer-progress"),
    timerButton: document.getElementById("timer-button"),
    nextButton: document.getElementById("next-button"),
    resetButton: document.getElementById("reset-button"),
    playedCount: document.getElementById("played-count")
  };

  function shuffled(items) {
    const copy = items.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const value = copy[index];
      copy[index] = copy[swapIndex];
      copy[swapIndex] = value;
    }
    return copy;
  }

  function availablePrompts() {
    return state.level === "ALL" ? prompts : prompts.filter(function (prompt) { return prompt.l === state.level; });
  }

  function categoryKey(category) {
    return category.toLowerCase().replace(/\s+/g, "-");
  }

  function setFlipped(value) {
    state.flipped = value;
    el.questionCard.classList.toggle("flipped", value);
    el.questionCard.setAttribute("aria-pressed", String(value));
    el.questionCard.setAttribute("aria-label", value ? "Show the question" : "Flip for a speaking helper");
  }

  function renderCard() {
    if (!state.current) return;
    const prompt = state.current;
    const key = categoryKey(prompt.c);
    el.category.textContent = prompt.c;
    const levelNumber = prompts.filter(function (item) { return item.l === prompt.l; }).findIndex(function (item) { return item.i === prompt.i; }) + 1;
    el.questionNumber.textContent = "#" + prompt.l + "-" + String(levelNumber).padStart(2, "0");
    el.cardLevel.textContent = prompt.l;
    el.helperLevel.textContent = prompt.l;
    el.questionText.textContent = prompt.q;
    el.starter.textContent = "“" + prompt.s + "”";
    el.followUp.textContent = prompt.f;
    el.cardFront.dataset.category = key;
    el.cardBack.dataset.category = key;
    el.cardsLeft.textContent = state.deck.length + (state.deck.length === 1 ? " card left" : " cards left");
    el.playedCount.textContent = String(state.played);
  }

  function resetTimer() {
    state.timerRunning = false;
    state.timer = 45;
    window.clearInterval(state.timerHandle);
    state.timerHandle = null;
    renderTimer();
  }

  function renderTimer() {
    const timeUp = state.timer === 0;
    el.timerDisplay.textContent = timeUp ? "TIME!" : "0:" + String(state.timer).padStart(2, "0");
    el.timerProgress.style.width = ((state.timer / 45) * 100) + "%";
    el.timerCard.classList.toggle("time-up", timeUp);
    el.timerButton.textContent = state.timerRunning ? "Pause" : timeUp ? "Reset timer" : "Start 45 sec";
  }

  function startRound() {
    const list = shuffled(availablePrompts());
    state.current = list[0] || null;
    state.deck = list.slice(1);
    state.played = list.length ? 1 : 0;
    state.drawing = false;
    setFlipped(false);
    resetTimer();
    el.questionTotal.textContent = list.length + " questions";
    renderCard();
  }

  function drawCard() {
    if (state.drawing) return;
    let refill = state.deck.slice();
    if (!refill.length) {
      refill = shuffled(availablePrompts().filter(function (prompt) {
        return !state.current || prompt.i !== state.current.i;
      }));
    }
    if (!refill.length) return;

    state.drawing = true;
    setFlipped(false);
    resetTimer();
    el.cardStage.classList.add("drawing");
    el.nextButton.disabled = true;
    el.nextButton.querySelector("span").textContent = "Drawing…";

    window.setTimeout(function () {
      state.current = refill[0];
      state.deck = refill.slice(1);
      state.played += 1;
      state.drawing = false;
      renderCard();
      el.cardStage.classList.remove("drawing");
      el.nextButton.disabled = false;
      el.nextButton.querySelector("span").textContent = "Next card";
    }, 220);
  }

  function toggleTimer() {
    if (state.timer === 0) state.timer = 45;
    state.timerRunning = !state.timerRunning;
    window.clearInterval(state.timerHandle);
    state.timerHandle = null;

    if (state.timerRunning) {
      state.timerHandle = window.setInterval(function () {
        state.timer -= 1;
        if (state.timer <= 0) {
          state.timer = 0;
          state.timerRunning = false;
          window.clearInterval(state.timerHandle);
          state.timerHandle = null;
        }
        renderTimer();
      }, 1000);
    }
    renderTimer();
  }

  el.levelPicker.addEventListener("click", function (event) {
    const button = event.target.closest("[data-level]");
    if (!button) return;
    state.level = button.dataset.level;
    el.levelPicker.querySelectorAll("[data-level]").forEach(function (item) {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    startRound();
  });

  el.deckButton.addEventListener("click", drawCard);
  el.nextButton.addEventListener("click", drawCard);
  el.questionCard.addEventListener("click", function () { setFlipped(!state.flipped); });
  el.timerButton.addEventListener("click", toggleTimer);
  el.resetButton.addEventListener("click", startRound);

  if (!prompts.length) {
    el.questionText.textContent = "Question bank could not be loaded.";
    el.nextButton.disabled = true;
    el.deckButton.disabled = true;
    return;
  }

  startRound();
}());
