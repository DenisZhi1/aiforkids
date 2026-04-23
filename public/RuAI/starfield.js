'use strict';
/*
 * Starfield — standalone cursor effect.
 * --------------------------------------
 * Скрипт сам создаёт свой canvas в body. НИЧЕГО не нужно добавлять в HTML,
 * кроме подключения этого файла: <script src="starfield.js" defer></script>
 *
 * Звёздное поле из частиц (изумруд/фиолет/белые искры). Курсор отталкивает
 * звёзды в радиусе, они пружинят обратно. Клик = импульсный взрыв.
 */

(function () {
  // Не запускаем на touch-устройствах.
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return;

  function init() {
    if (document.getElementById('__starfield_canvas__')) return; // защита от двойной инициализации

    // === Создаём канвас ===
    const canvas = document.createElement('canvas');
    canvas.id = '__starfield_canvas__';
    // Инлайн-стили, чтобы не зависеть от CSS файла и ничего не ломать на странице.
    canvas.style.cssText =
      'position:fixed;top:0;left:0;width:100vw;height:100vh;' +
      'pointer-events:none;z-index:0;background:transparent;';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) { canvas.remove(); return; }

    // === CONFIG === (копия из прототипа, который тебе зашёл)
    const config = {
      STAR_COUNT: 500,       // можно менять; прототип показал 260 — было редковато для полного экрана
      REPEL_FORCE: 210,      // repel strength со слайдера
      REPEL_RADIUS: 110,     // repel radius со слайдера
      CLICK_FORCE: 18,
      CLICK_RADIUS: 300,
      SPRING: 0.06,
      DAMPING: 0.88,
      SIZE_MIN: 0.8,
      SIZE_MAX: 3.0,
      TWINKLE_MIN: 0.5,
      TWINKLE_MAX: 2.0,
      COLORS: [
        { r: 110, g: 231, b: 183 }, // mint-emerald
        { r: 52,  g: 211, b: 153 }, // emerald
        { r: 168, g: 85,  b: 247 }, // violet
        { r: 192, g: 132, b: 252 }, // light violet
        { r: 240, g: 240, b: 220 }  // warm white spark
      ],
      // Лёгкий "трейл" за звёздами — fade фона вместо полной очистки.
      // Это и делало прототип визуально "сочнее" — именно это ощущение.
      FADE_ALPHA: 0.28
    };

    let W = 0, H = 0, dpr = 1;
    let stars = [];
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999 };

    function resize() {
      const newW = window.innerWidth;
      const newH = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(newW * dpr);
      canvas.height = Math.floor(newH * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const first = (W === 0);
      W = newW; H = newH;
      // Первая инициализация — создать звёзды. Ресайз — сдвинуть home к новым пропорциям.
      if (first) {
        buildStars();
      } else {
        for (const s of stars) {
          s.homeX = Math.min(s.homeX, W);
          s.homeY = Math.min(s.homeY, H);
        }
      }
    }

    function buildStars() {
      stars = new Array(config.STAR_COUNT);
      for (let i = 0; i < config.STAR_COUNT; i++) {
        const c = config.COLORS[Math.floor(Math.random() * config.COLORS.length)];
        const hx = Math.random() * W;
        const hy = Math.random() * H;
        stars[i] = {
          homeX: hx, homeY: hy,
          x: hx, y: hy, vx: 0, vy: 0,
          size: config.SIZE_MIN + Math.random() * (config.SIZE_MAX - config.SIZE_MIN),
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: config.TWINKLE_MIN + Math.random() * (config.TWINKLE_MAX - config.TWINKLE_MIN),
          color: c
        };
      }
    }

    // === Events ===
    window.addEventListener('mousemove', (e) => {
      mouse.px = mouse.x; mouse.py = mouse.y;
      mouse.x = e.clientX; mouse.y = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseout', (e) => {
      if (!e.relatedTarget) { mouse.x = -9999; mouse.y = -9999; }
    });

    window.addEventListener('click', (e) => {
      const cx = e.clientX, cy = e.clientY;
      for (const s of stars) {
        const dx = s.x - cx, dy = s.y - cy;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        if (d > config.CLICK_RADIUS) continue;
        const k = Math.max(0, 1 - d / config.CLICK_RADIUS) * config.CLICK_FORCE;
        s.vx += (dx / d) * k;
        s.vy += (dy / d) * k;
      }
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      if (resizeTimer) return;
      resizeTimer = setTimeout(() => { resizeTimer = null; resize(); }, 120);
    });

    let running = true;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) running = false;
      else if (!running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
    });

    // === Animation loop === (точная копия логики из прототипа)
    let last = performance.now();
    function frame(now) {
      if (!running) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      // Полупрозрачная заливка фона — даёт эффект трейла, как в прототипе.
      // Цвет чуть темнее самого тёмного тона body-градиента, чтобы линия оставалась в тон.
      ctx.fillStyle = `rgba(4, 26, 24, ${config.FADE_ALPHA})`;
      ctx.fillRect(0, 0, W, H);

      const repelR = config.REPEL_RADIUS;
      const repelR2 = repelR * repelR;
      const force = config.REPEL_FORCE;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        const dx = s.x - mouse.x;
        const dy = s.y - mouse.y;
        const dsq = dx * dx + dy * dy;

        if (dsq < repelR2 && dsq > 0.1) {
          const d = Math.sqrt(dsq);
          const strength = (1 - d / repelR) * force * dt;
          s.vx += (dx / d) * strength;
          s.vy += (dy / d) * strength;
        }

        // Пружина домой
        s.vx += (s.homeX - s.x) * config.SPRING;
        s.vy += (s.homeY - s.y) * config.SPRING;
        s.vx *= config.DAMPING;
        s.vy *= config.DAMPING;
        s.x += s.vx;
        s.y += s.vy;

        s.twinkle += s.twinkleSpeed * dt;
        const flicker = 0.7 + 0.3 * Math.sin(s.twinkle);

        const highlight = dsq < repelR2 ? (1 - Math.sqrt(dsq) / repelR) * 0.6 : 0;
        const alpha = Math.min(1, (0.55 + highlight) * flicker);
        const c = s.color;
        const r = s.size * (1 + highlight * 0.8);

        // Halo для крупных/подсвеченных — даёт свечение
        if (s.size > 1.8 || highlight > 0.2) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${(alpha * 0.12).toFixed(3)})`;
          ctx.fill();
        }

        // Ядро звезды
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${alpha.toFixed(3)})`;
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    resize();
    requestAnimationFrame((t) => { last = t; frame(t); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
