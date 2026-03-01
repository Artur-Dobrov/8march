/* Telegram Mini App: поздравление + анимации + модальные пожелания */
(() => {
    const tg = window.Telegram?.WebApp;

    // --- Telegram init ---
    if (tg) {
        tg.ready();
        tg.expand();
    }

    // --- Typewriter subtitle ---
    const subtitleEl = document.getElementById("subtitle");
    const subtitleText =
        "Пусть весна принесёт тебе лёгкость, тепло и много поводов улыбаться.";
    typeWriter(subtitleEl, subtitleText, 18);

    // --- Lottie animation (flower) ---
    if (window.lottie) {
        lottie.loadAnimation({
            container: document.getElementById("lottieFlower"),
            renderer: "svg",
            loop: true,
            autoplay: true,
            path: "https://assets10.lottiefiles.com/packages/lf20_jbrw3hcz.json",
        });
    }

    // --- Card entrance ---
    if (window.gsap) {
        gsap.fromTo(
            "#card",
            {y: 18, opacity: 0, scale: 0.98},
            {y: 0, opacity: 1, scale: 1, duration: 0.9, ease: "power3.out"}
        );
    }

    // --- Petals ---
    const petalsRoot = document.getElementById("petals");
    if (petalsRoot && window.gsap) spawnPetals(petalsRoot, 22);

    // --- Subtle parallax by pointer ---
    const card = document.getElementById("card");
    if (card && window.gsap) {
        window.addEventListener("pointermove", (e) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const dx = (e.clientX / w - 0.5) * 2;
            const dy = (e.clientY / h - 0.5) * 2;
            gsap.to(card, {
                rotateY: dx * 3,
                rotateX: -dy * 3,
                transformPerspective: 900,
                duration: 0.35,
                ease: "power2.out",
            });
        });
    }

    // --- Stars canvas (animated particles) ---
    initStars(document.getElementById("stars"), 90);

    // --- Buttons ---
    document.getElementById("wowBtn")?.addEventListener("click", () => {
        burstConfetti();
        pulseChips();

        if (tg) {
            tg.HapticFeedback?.impactOccurred("medium");
            tg.showPopup?.({
                title: "Для мамы ❤️",
                message:
                    "Пусть весна принесёт тебе счастье, лёгкость и много поводов улыбаться!",
                buttons: [{type: "ok", text: "Спасибо"}],
            });
        }
    });

    document.getElementById("closeBtn")?.addEventListener("click", () => {
        if (tg) tg.close();
        else window.close();
    });

    document.getElementById("shareBtn")?.addEventListener("click", async () => {
        const text = "С 8 марта! 💐";
        try {
            if (navigator.share) {
                await navigator.share({title: "Поздравление", text});
            } else {
                await navigator.clipboard.writeText(text);
                tg?.showToast?.({message: "Текст скопирован"});
            }
        } catch {
        }
    });


    // ===== Modal wishes (chips) =====
    const wishes = {
        "здоровья": {
            emoji: "🌿",
            subtitle: "Тепло и забота",
            text:
                "Желаю тебе крепкого здоровья, лёгкости и сил на всё, что приносит радость. Пусть каждый день начинается с улыбки и хорошего самочувствия.",
        },
        "радости": {
            emoji: "☀️",
            subtitle: "Пусть будет светло",
            text:
                "Пусть в твоей жизни будет больше поводов радоваться — маленьких и больших. Пусть рядом будут люди, которые согревают, а каждый день приносит что-то хорошее.",
        },
        "вдохновения": {
            emoji: "✨",
            subtitle: "Новые идеи и мечты",
            text:
                "Желаю вдохновения — в делах, в доме, в любимых занятиях. Пусть хочется пробовать новое, мечтать и создавать — в своём ритме и с удовольствием.",
        },
        "улыбок": {
            emoji: "😊",
            subtitle: "Тепло на сердце",
            text:
                "Пусть улыбок будет больше, чем забот. Пусть будет спокойно на душе, а рядом — поддержка и любовь. Я очень ценю тебя.",
        },
        "счастья": {
            emoji: "💖",
            subtitle: "Тепла в душе",
            text: "Желаю тебе настоящего счастья — спокойного, светлого, домашнего. Пусть каждый день приносит радость и уверенность, что всё будет хорошо."
        },
        "удачи": {
            emoji: "🍀",
            subtitle: "Пусть всё складывается",
            text: "Пусть удача будет рядом во всех делах — в больших и маленьких. Пусть всё получается легко, вовремя и так, как тебе хочется."
        },
        "любви": {
            emoji: "❤️",
            subtitle: "Самое важное",
            text: "Желаю любви — заботливой, тёплой и взаимной. Пусть тебя окружают люди, которые ценят и берегут тебя. Я тебя очень люблю."
        },
    };

    // Получаем элементы модалки (могут отсутствовать)
    const modal = document.getElementById("modal");
    const modalEmoji = document.getElementById("modalEmoji");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const modalText = document.getElementById("modalText");
    const modalClose = document.getElementById("modalClose");
    const modalOk = document.getElementById("modalOk");

    const modalReady =
        !!modal && !!modalEmoji && !!modalTitle && !!modalSubtitle && !!modalText;

    if (!modalReady) {
        console.warn(
            "[MiniApp] Modal markup not found. Add modal HTML to index.html (ids: modal, modalEmoji, modalTitle, modalSubtitle, modalText, modalClose, modalOk)."
        );
    }

    function openModal(key) {
        const w = wishes[key];
        if (!w) return;

        // Если модалки нет — покажем fallback через Telegram popup
        if (!modalReady) {
            if (tg?.showPopup) {
                tg.showPopup({
                    title: `Пожелание: ${key}`,
                    message: w.text,
                    buttons: [{type: "ok", text: "Спасибо ❤️"}],
                });
                tg.HapticFeedback?.impactOccurred("light");
                return;
            }

            alert(`${key.toUpperCase()}:\n\n${w.text}`);
            return;
        }

        modalEmoji.textContent = w.emoji;
        modalTitle.textContent = `Пожелание: ${key}`;
        modalSubtitle.textContent = w.subtitle;
        modalText.textContent = w.text;

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");

        if (window.gsap) {
            gsap.fromTo(
                ".modal__panel",
                {y: 14, opacity: 0, scale: 0.98},
                {y: 0, opacity: 1, scale: 1, duration: 0.22, ease: "power2.out"}
            );
        }

        tg?.HapticFeedback?.impactOccurred("light");
    }

    function closeModal() {
        if (!modal) return;
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
    }


    // клики по чипам
    document.querySelectorAll(".chip").forEach((chip) => {
        chip.style.cursor = "pointer";
        chip.addEventListener("click", () => {
            const key = chip.textContent.trim().toLowerCase();
            openModal(key);
        });
    });

    // закрытие
    modalClose?.addEventListener("click", closeModal);
    modalOk?.addEventListener("click", closeModal);

    // клик по бэкдропу (если он с data-close)
    modal?.addEventListener("click", (e) => {
        const target = e.target;
        if (target && target.dataset && "close" in target.dataset) closeModal();
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
    });

    // ---------- helpers ----------
    function typeWriter(el, text, speedMs) {
        if (!el) return;
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
                opacity: 0.55 + Math.random() * 0.4,
            });

            gsap.to(p, {
                y: window.innerHeight + 60,
                x: startX + drift,
                rotation: "+=" + (180 + Math.random() * 360),
                duration,
                delay,
                ease: "none",
                repeat: -1,
            });

            gsap.to(p, {
                opacity: 0.15 + Math.random() * 0.35,
                duration: 1.8 + Math.random() * 1.6,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
                delay,
            });
        }
    }

    function burstConfetti() {
        if (!window.confetti) return;
        const defaults = {
            spread: 80,
            ticks: 140,
            gravity: 0.85,
            decay: 0.92,
            startVelocity: 28,
            scalar: 1.0,
        };

        confetti({...defaults, particleCount: 120, origin: {x: 0.2, y: 0.2}});
        confetti({...defaults, particleCount: 120, origin: {x: 0.8, y: 0.2}});
        confetti({...defaults, particleCount: 160, origin: {x: 0.5, y: 0.3}});
    }

    function pulseChips() {
        if (!window.gsap) return;
        const chips = document.querySelectorAll(".chip");
        gsap.fromTo(
            chips,
            {y: 0},
            {
                y: -6,
                duration: 0.25,
                yoyo: true,
                repeat: 1,
                stagger: 0.04,
                ease: "power2.out",
            }
        );
    }

    function initStars(canvas, n) {
        if (!canvas) return;
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


        const stars = Array.from({length: n}, () => ({
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            r: 0.6 + Math.random() * 1.6,
            a: 0.12 + Math.random() * 0.35,
            vx: (Math.random() * 2 - 1) * 0.08,
            vy: (Math.random() * 2 - 1) * 0.08,
        }));

        (function frame() {
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            for (const s of stars) {
                s.x += s.vx;
                s.y += s.vy;

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
