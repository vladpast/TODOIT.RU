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
    ".case-card, .timeline-item, .reveal-on-scroll"
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
});

