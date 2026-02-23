'use strict';

(function () {
  const jokes = [
    'Как я рад, что у вас так много свободного времени.',
    'Печеньки сами себя не поймают, но вы стараетесь.',
    'Ваше трудолюбие измеряется в крошках.',
    'Можно было бы учить языки, но печеньки важнее.',
    'Вы точно не робот. Роботы так не кликают.',
    'Еще десяточка? Конечно, кто мы такие, чтобы спорить.',
    'Уровень концентрации: печеньки.',
    'Если это медитация, то вы уже просветлены.',
    'Пальцы тренируются, карма растет.',
    'Скорость кликов достойна уважения и легкой тревоги.',
    'Кто-то сказал "продуктивность"? Это про вас.',
    'Печенье падает, вы ловите. Вселенная в балансе.',
    'Секрет успеха: много печенья и никакой спешки.',
    'Ваш рекорд выглядит подозрительно вкусно.',
    'Печеньки — новая валюта. Вы богаты.',
    'С таким темпом вы скоро откроете пекарню.',
    'У вас талант находить печенье даже в хаосе.',
    'Поймали 10? Мир стал немного хрустящим.',
    'Стабильность — это когда каждые 10 печенек шутка.',
    'Мышка гордится вами, а клавиатура завидует.',
    'Вы — герой перекуса.',
    'Сила воли? Нет, сила печенья.',
    'Еще немного, и вы напишете диссертацию по кликам.',
    'Крошки на полу — ваш личный бренд.',
    'День, когда вы остановитесь, еще не наступил.',
    'Вы удивительно устойчивы к сладкому.',
    'Если бы печенье было спортом, вы в сборной.',
    'Печенье падает редко, но вы всегда готовы.',
    'Каждый клик — маленькая победа над скукой.',
    'Ваши 10 печенек звучат как аплодисменты.',
    'Вы явно тренировались на чаепитиях.',
    'Печенье — это просто, вы — сложны и велики.',
    'Руки в тонусе, настроение в сахаре.',
    'Ваш счетчик — это эпос.',
    'Проверено: скука проигрывает вам 10:0.',
    'Вам бы в охотники за метеорами, но печенье важнее.',
    'У вас отличная реакция на сладкое.',
    'С каждым кликом жизнь становится мягче.',
    'Печенье находит вас, вы находите печенье.',
    'Если кто-то спросит, вы заняты исследованиями.',
    'Пальцы: работают. Печенье: добыто.',
    'Вы — главная причина, почему печенье падает.',
    'Ещё 10, и вы официально эксперт.',
    'Секрет успеха — игнорировать здравый смысл.',
    'Печенье не просило, но вы настояли.',
    'Сладкая дисциплина — ваш конек.',
    'Ваша статистика выглядит слишком вкусно.',
    'Даже время уважает ваш клик.',
    'Вы уверенно идете к вершинам печенья.',
    'Каждые 10 печенек делают мир чуть ярче.'
  ];

  const countKey = 'cookie_idle_count_v1';
  const seenKey = 'cookie_idle_seen_v1';
  const congratsKey = 'cookie_idle_congrats_v1';
  const totalMessages = 50;
  const savedCount = Number.parseInt(localStorage.getItem(countKey) || '0', 10) || 0;
  const savedSeen = (() => {
    try {
      const raw = JSON.parse(localStorage.getItem(seenKey) || '[]');
      if (Array.isArray(raw)) return raw.filter((n) => Number.isInteger(n));
      return [];
    } catch {
      return [];
    }
  })();

  const state = {
    count: savedCount,
    seen: new Set(savedSeen),
    congratsShown: localStorage.getItem(congratsKey) === '1',
    pendingCongrats: false,
    nextEventAt: (Math.floor(savedCount / 10) + 1) * 10,
    dropTimer: null,
    isModalOpen: false
  };

  const style = document.createElement('style');
  style.textContent = `
    #cookie-hud {
      position: fixed !important;
      top: 8px;
      right: 8px;
      z-index: 2000 !important;
      font-family: 'Press Start 2P', system-ui, sans-serif;
      color: #fef3c7;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.45);
      display: grid;
      gap: 4px;
      text-align: right;
      pointer-events: none;
    }
    #cookie-hud .cookie-box {
      background: rgba(19, 18, 12, 0.78);
      border: 1px solid rgba(253, 230, 138, 0.4);
      padding: 4px 6px;
      border-radius: 6px;
      pointer-events: auto;
    }
    #cookie-hud .cookie-label {
      font-size: 7px;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      opacity: 0.7;
    }
    #cookie-hud .cookie-value {
      margin-top: 2px;
      font-size: 10px;
      color: #fbbf24;
    }

    .cookie-item {
      position: fixed !important;
      top: -60px;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      background:
        radial-gradient(circle at 30% 30%, #fef3c7 0%, #fde68a 38%, #f59e0b 70%, #b45309 100%);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
      border: 2px solid rgba(120, 53, 15, 0.65);
      cursor: pointer;
      z-index: 1001;
      animation: cookie-fall var(--fall-duration) linear forwards;
      transform-origin: center;
      display: grid;
      place-items: center;
    }
    .cookie-item::after {
      content: '';
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(120, 53, 15, 0.6);
      box-shadow:
        10px 6px 0 rgba(120, 53, 15, 0.45),
        -8px 8px 0 rgba(120, 53, 15, 0.5),
        6px -6px 0 rgba(120, 53, 15, 0.5),
        -10px -4px 0 rgba(120, 53, 15, 0.4);
    }

    @keyframes cookie-fall {
      0% { transform: translateY(0px) rotate(0deg); opacity: 0.9; }
      100% { transform: translateY(var(--fall-distance)) rotate(360deg); opacity: 1; }
    }

    body.cookie-paused .cookie-item {
      animation-play-state: paused;
    }

    #cookie-modal {
      position: fixed !important;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(11, 12, 15, 0.68);
      z-index: 3000 !important;
      font-family: 'Press Start 2P', system-ui, sans-serif;
      padding: 20px;
    }
    #cookie-modal.open {
      display: flex;
    }
    #cookie-modal .cookie-modal-card {
      background: #111827;
      border-radius: 18px;
      border: 1px solid rgba(253, 230, 138, 0.4);
      max-width: 520px;
      width: 100%;
      padding: 24px;
      color: #fef3c7;
      text-align: center;
      box-shadow: 0 18px 40px rgba(0, 0, 0, 0.4);
    }
    #cookie-modal .cookie-modal-card.glow {
      border-color: rgba(251, 191, 36, 0.9);
      animation: cookie-glow 1.2s ease-in-out infinite;
      box-shadow: 0 0 30px rgba(251, 191, 36, 0.45), 0 18px 40px rgba(0, 0, 0, 0.55);
    }
    @keyframes cookie-glow {
      0% { transform: scale(1); filter: brightness(1); }
      50% { transform: scale(1.02); filter: brightness(1.15); }
      100% { transform: scale(1); filter: brightness(1); }
    }
    #cookie-modal .cookie-modal-text {
      font-size: 12px;
      line-height: 1.6;
    }
    #cookie-modal button {
      margin-top: 18px;
      background: #f59e0b;
      border: none;
      color: #111827;
      font-size: 12px;
      padding: 10px 18px;
      border-radius: 999px;
      cursor: pointer;
      font-family: inherit;
      letter-spacing: 0.03em;
    }
    #cookie-modal button:hover {
      background: #fbbf24;
    }
  `;
  document.head.appendChild(style);

  const hud = document.createElement('div');
  hud.id = 'cookie-hud';
  hud.innerHTML = `
    <div class="cookie-box">
      <div class="cookie-label">Печеньки</div>
      <div class="cookie-value" id="cookie-count">0</div>
    </div>
    <div class="cookie-box">
      <div class="cookie-label">Сообщения</div>
      <div class="cookie-value" id="cookie-messages">0/${totalMessages}</div>
    </div>
  `;
  document.body.appendChild(hud);

  const modal = document.createElement('div');
  modal.id = 'cookie-modal';
  modal.innerHTML = `
    <div class="cookie-modal-card">
      <div class="cookie-modal-text" id="cookie-modal-text"></div>
      <button type="button" id="cookie-modal-close">Продолжить</button>
    </div>
  `;
  document.body.appendChild(modal);

  const countEl = hud.querySelector('#cookie-count');
  const messagesEl = hud.querySelector('#cookie-messages');
  const modalText = modal.querySelector('#cookie-modal-text');
  const modalClose = modal.querySelector('#cookie-modal-close');
  const modalCard = modal.querySelector('.cookie-modal-card');

  function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  function updateCounters() {
    countEl.textContent = state.count;
    localStorage.setItem(countKey, String(state.count));
    messagesEl.textContent = `${state.seen.size}/${totalMessages}`;
  }

  function persistSeen() {
    localStorage.setItem(seenKey, JSON.stringify([...state.seen]));
  }

  function showModal(message) {
    state.isModalOpen = true;
    document.body.classList.add('cookie-paused');
    modalCard.classList.remove('glow');
    modalText.textContent = message;
    modal.classList.add('open');
    if (state.dropTimer) {
      clearTimeout(state.dropTimer);
      state.dropTimer = null;
    }
  }

  function showCongratsModal() {
    state.isModalOpen = true;
    state.congratsShown = true;
    localStorage.setItem(congratsKey, '1');
    document.body.classList.add('cookie-paused');
    modalCard.classList.add('glow');
    modalText.textContent = 'Поздравляю! Вы собрали все 50 сообщений и стали королем печенек!';
    modal.classList.add('open');
    if (state.dropTimer) {
      clearTimeout(state.dropTimer);
      state.dropTimer = null;
    }
  }

  function hideModal() {
    state.isModalOpen = false;
    modal.classList.remove('open');
    modalCard.classList.remove('glow');
    document.body.classList.remove('cookie-paused');
    if (state.pendingCongrats && !state.congratsShown) {
      state.pendingCongrats = false;
      showCongratsModal();
      return;
    }
    scheduleDrop();
  }

  modalClose.addEventListener('click', hideModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      hideModal();
    }
  });

  function spawnCookie() {
    if (state.isModalOpen) return;
    const cookie = document.createElement('div');
    cookie.className = 'cookie-item';
    cookie.style.left = `${randomBetween(5, 95)}vw`;
    const fallDistance = window.innerHeight + 160;
    cookie.style.setProperty('--fall-duration', `${randomBetween(6, 9)}s`);
    cookie.style.setProperty('--fall-distance', `${fallDistance}px`);

    cookie.addEventListener('click', () => {
      if (state.isModalOpen) return;
      state.count += 1;
      updateCounters();
      cookie.remove();
      if (state.count >= state.nextEventAt) {
        state.nextEventAt += 10;
        if (state.seen.size < totalMessages) {
          const remaining = jokes
            .map((_, index) => index)
            .filter((index) => !state.seen.has(index));
          const pick = remaining[Math.floor(Math.random() * remaining.length)];
          state.seen.add(pick);
          persistSeen();
          updateCounters();
          if (state.seen.size === totalMessages && !state.congratsShown) {
            state.pendingCongrats = true;
          }
          showModal(jokes[pick]);
        } else if (!state.congratsShown) {
          showCongratsModal();
        }
      }
    }, { once: true });

    cookie.addEventListener('animationend', () => {
      cookie.remove();
    });

    document.body.appendChild(cookie);
  }

  function scheduleDrop() {
    if (state.isModalOpen) return;
    if (state.dropTimer) clearTimeout(state.dropTimer);
    state.dropTimer = setTimeout(() => {
      spawnCookie();
      scheduleDrop();
    }, randomBetween(3000, 5000));
  }

  updateCounters();
  scheduleDrop();
})();
