(() => {
  const tg = window.Telegram?.WebApp;

  if (tg) {
    tg.ready();
    tg.expand();
  }

  const subtitleEl = document.getElementById("subtitle");
  const subtitleText = "Пусть весна принесёт тебе лёгкость, тепло и много поводов улыбаться.";
  typeWriter(subtitleEl, subtitleText, 18);

  lottie.loadAnimation({
    container: document.getElementById("lottieFlower"),
    renderer: "svg",
    loop: true,
    autoplay: true,
    path: "https://assets10.lottiefiles.com/packages/lf20_jbrw3hcz.json"
  });

  gsap.fromTo("#card",
    { y: 18, opacity: 0, scale: 0.98 },
    { y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power3.out" }
  );

  const petalsRoot = document.getElementById("petals");
  spawnPetals(petalsRoot, 22);

  const card = document.getElementById("card");
  window.addEventListener("pointermove", (e) => {
    const w = window.innerWidth, h = window.innerHeight;
    const dx = (e.clientX / w - 0.5) * 2;
    const dy = (e.clientY / h - 0.5) * 2;
    gsap.to(card, { rotateY: dx * 3, rotateX: -dy * 3, transformPerspective: 900, duration: 0.35, ease: "power2.out" });
  });

  initStars(document.getElementById("stars"), 90);

  document.getElementById("wowBtn").addEventListener("click", () => {
    burstConfetti();
    pulseChips();
    if (tg) tg.HapticFeedback?.impactOccurred("medium");
  });

  document.getElementById("closeBtn").addEventListener("click", () => {
    if (tg) tg.close();
    else window.close();
  });

  document.getElementById("shareBtn").addEventListener("click", async () => {
    const text = "С 8 марта! 💐";
    try {
      if (navigator.share) await navigator.share({ title: "Поздравление", text });
      else {
        await navigator.clipboard.writeText(text);
        if (tg) tg.showToast?.({ message: "Текст скопирован" });
      }
    } catch {}
  });

  function typeWriter(el, text, speedMs) {
    let i = 0;
    const tick = () => {
      i++;
      el.textContent = text.slice(0, i);
      if (i < text.length) setTimeout(tick, speedMs);
    };
    tick();
  }

  function spawnPetals(root, count) {
    for (let i = 0; i < count; i++) {
      const p = document.createElement("div");
      p.className = "petal";
      root.appendChild(p);

      const startX = Math.random() * window.innerWidth;
      const delay = Math.random() * 4;
      const duration = 6 + Math.random() * 6;
      const drift = (Math.random() * 2 - 1) * 120;

      gsap.set(p, {
        x: startX,
        y: -40 - Math.random() * 300,
        rotation: Math.random() * 360,
        scale: 0.7 + Math.random() * 0.9,
        opacity: 0.55 + Math.random() * 0.4
      });

      gsap.to(p, {
        y: window.innerHeight + 60,
        x: startX + drift,
        rotation: "+=" + (180 + Math.random() * 360),
        duration,
        delay,
        ease: "none",
        repeat: -1
      });
    }
  }

  function burstConfetti() {
    const defaults = { spread: 80, ticks: 140, gravity: 0.85, decay: 0.92, startVelocity: 28, scalar: 1.0 };
    confetti({ ...defaults, particleCount: 120, origin: { x: 0.2, y: 0.2 } });
    confetti({ ...defaults, particleCount: 120, origin: { x: 0.8, y: 0.2 } });
    confetti({ ...defaults, particleCount: 160, origin: { x: 0.5, y: 0.3 } });
  }

  function pulseChips() {
    const chips = document.querySelectorAll(".chip");
    gsap.fromTo(chips, { y: 0 }, { y: -6, duration: 0.25, yoyo: true, repeat: 1, stagger: 0.04, ease: "power2.out" });
  }

  function initStars(canvas, n) {
    const ctx = canvas.getContext("2d");
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    function resize() {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);


    const stars = Array.from({ length: n }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 0.6 + Math.random() * 1.6,
      a: 0.12 + Math.random() * 0.35,
      vx: (Math.random() * 2 - 1) * 0.08,
      vy: (Math.random() * 2 - 1) * 0.08,
    }));

    (function frame(){
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const s of stars) {
        s.x += s.vx; s.y += s.vy;
        if (s.x < -10) s.x = window.innerWidth + 10;
        if (s.x > window.innerWidth + 10) s.x = -10;
        if (s.y < -10) s.y = window.innerHeight + 10;
        if (s.y > window.innerHeight + 10) s.y = -10;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.a})`;
        ctx.fill();
      }
      requestAnimationFrame(frame);
    })();
  }
})();
