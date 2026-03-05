document.addEventListener("DOMContentLoaded", () => {
  const navLinks = Array.from(document.querySelectorAll(".nav-list a[href^='#']"));
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href") || ""))
    .filter((el) => !!el);
  const toTopBtn = document.querySelector(".to-top");
  const navList = document.querySelector(".nav-list");
  const navToggle = document.querySelector(".nav-toggle");

  // Плавная прокрутка
  function scrollToTarget(targetId) {
    const target = document.querySelector(targetId);
    if (!target) return;
    const headerOffset = 70;
    const rect = target.getBoundingClientRect();
    const offset = window.pageYOffset + rect.top - headerOffset;
    window.scrollTo({
      top: offset,
      behavior: "smooth",
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const href = link.getAttribute("href");
      if (!href) return;
      scrollToTarget(href);
      if (navList && navList.classList.contains("is-open")) {
        navList.classList.remove("is-open");
      }
    });
  });

  // Кнопка наверх
  if (toTopBtn) {
    toTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Бургер в мобильной версии
  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      navList.classList.toggle("is-open");
    });
  }

  // Подсветка активного пункта меню
  function updateActiveNav() {
    const scrollPos = window.scrollY;
    const viewportHeight = window.innerHeight || 0;
    const centerLine = scrollPos + viewportHeight / 3;

    let activeId = "";
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const top = scrollPos + rect.top;
      const bottom = top + section.offsetHeight;
      if (centerLine >= top && centerLine < bottom) {
        activeId = "#" + section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === activeId) {
        link.classList.add("is-active");
      } else {
        link.classList.remove("is-active");
      }
    });
  }

  // Появление секций и карточек при скролле
  const observerOptions = {
    threshold: 0.16,
  };

  const revealElements = document.querySelectorAll(
    ".case-card, .risk-card, .timeline-item, .reveal-on-scroll"
  );

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach((el) => {
    revealObserver.observe(el);
  });

  // Показ кнопки наверх и обновление активного меню при скролле
  function onScroll() {
    const scrolled = window.scrollY || document.documentElement.scrollTop || 0;
    if (toTopBtn) {
      if (scrolled > 400) {
        toTopBtn.classList.add("is-visible");
      } else {
        toTopBtn.classList.remove("is-visible");
      }
    }
    updateActiveNav();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateActiveNav);

  // Начальное состояние
  updateActiveNav();

  // Блок «Диагностическая беседа» (главный CTA): выпадающий список и аналитика
  const sessionMainContact = document.getElementById("session-main-contact-block");
  if (sessionMainContact) {
    const toggleBtn = sessionMainContact.querySelector(".contact-btn-toggle");
    const options = document.getElementById("session-main-contact-options");
    if (toggleBtn && options) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = sessionMainContact.classList.toggle("open");
        options.classList.toggle("show", isOpen);
        toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      document.addEventListener("click", (e) => {
        if (!sessionMainContact.contains(e.target)) {
          sessionMainContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });
      options.querySelectorAll(".contact-option").forEach((link) => {
        link.addEventListener("click", () => {
          sessionMainContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
    sessionMainContact.querySelectorAll("[data-analytics]").forEach((el) => {
      el.addEventListener("click", () => {
        const goal = el.getAttribute("data-analytics");
        if (typeof ym !== "undefined") {
          ym(106909561, "reachGoal", goal);
        }
      });
    });
  }

  // Блок «Связаться» в герое: выпадающий список и аналитика
  const heroContact = document.getElementById("hero-contact-block");
  if (heroContact) {
    const toggleBtn = heroContact.querySelector(".contact-btn-toggle");
    const options = document.getElementById("hero-contact-options");
    if (toggleBtn && options) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = heroContact.classList.toggle("open");
        options.classList.toggle("show", isOpen);
        toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      document.addEventListener("click", (e) => {
        if (!heroContact.contains(e.target)) {
          heroContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });
      options.querySelectorAll(".contact-option").forEach((link) => {
        link.addEventListener("click", () => {
          heroContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
    heroContact.querySelectorAll("[data-analytics]").forEach((el) => {
      el.addEventListener("click", () => {
        const goal = el.getAttribute("data-analytics");
        if (typeof ym !== "undefined") {
          ym(106909561, "reachGoal", goal);
        }
      });
    });
  }

  // Блок «Связаться» (раздел Ситуации): выпадающий список и аналитика
  const sessionContact = document.getElementById("session-contact-block");
  if (sessionContact) {
    const toggleBtn = sessionContact.querySelector(".contact-btn-toggle");
    const options = document.getElementById("session-contact-options");
    if (toggleBtn && options) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = sessionContact.classList.toggle("open");
        options.classList.toggle("show", isOpen);
        toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      document.addEventListener("click", (e) => {
        if (!sessionContact.contains(e.target)) {
          sessionContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });
      options.querySelectorAll(".contact-option").forEach((link) => {
        link.addEventListener("click", () => {
          sessionContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
    sessionContact.querySelectorAll("[data-analytics]").forEach((el) => {
      el.addEventListener("click", () => {
        const goal = el.getAttribute("data-analytics");
        if (typeof ym !== "undefined") {
          ym(106909561, "reachGoal", goal);
        }
      });
    });
  }

  // Блок «Связаться» (раздел Роли и форматы работы): выпадающий список и аналитика
  const formatsContact = document.getElementById("formats-contact-block");
  if (formatsContact) {
    const toggleBtn = formatsContact.querySelector(".contact-btn-toggle");
    const options = document.getElementById("formats-contact-options");
    if (toggleBtn && options) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = formatsContact.classList.toggle("open");
        options.classList.toggle("show", isOpen);
        toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      document.addEventListener("click", (e) => {
        if (!formatsContact.contains(e.target)) {
          formatsContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });
      options.querySelectorAll(".contact-option").forEach((link) => {
        link.addEventListener("click", () => {
          formatsContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
    formatsContact.querySelectorAll("[data-analytics]").forEach((el) => {
      el.addEventListener("click", () => {
        const goal = el.getAttribute("data-analytics");
        if (typeof ym !== "undefined") {
          ym(106909561, "reachGoal", goal);
        }
      });
    });
  }

  // Блок «Обсудить риски» (раздел Риски): тот же выпадающий список и аналитика
  const risksContact = document.getElementById("risks-contact-block");
  if (risksContact) {
    const toggleBtn = risksContact.querySelector(".contact-btn-toggle");
    const options = document.getElementById("risks-contact-options");
    if (toggleBtn && options) {
      toggleBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = risksContact.classList.toggle("open");
        options.classList.toggle("show", isOpen);
        toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
      document.addEventListener("click", (e) => {
        if (!risksContact.contains(e.target)) {
          risksContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        }
      });
      options.querySelectorAll(".contact-option").forEach((link) => {
        link.addEventListener("click", () => {
          risksContact.classList.remove("open");
          options.classList.remove("show");
          toggleBtn.setAttribute("aria-expanded", "false");
        });
      });
    }
    risksContact.querySelectorAll("[data-analytics]").forEach((el) => {
      el.addEventListener("click", () => {
        const goal = el.getAttribute("data-analytics");
        if (typeof ym !== "undefined") {
          ym(106909561, "reachGoal", goal);
        }
      });
    });
  }
});

