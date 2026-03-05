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

  // ----- Contact selector: умные fallback и единая инициализация -----
  function openTelegramWithFallback(username, text) {
    const decodedText = typeof text === "string" ? text : "";
    const webUrl = `https://t.me/${username}${decodedText ? "?text=" + encodeURIComponent(decodedText) : ""}`;
    const appUrl = `tg://resolve?domain=${username}${decodedText ? "&text=" + encodeURIComponent(decodedText) : ""}`;
    let fallbackTriggered = false;
    window.location.href = appUrl;
    const fallbackTimer = setTimeout(() => {
      if (!fallbackTriggered && document.visibilityState === "visible") {
        fallbackTriggered = true;
        window.location.href = webUrl;
      }
    }, 1500);
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        fallbackTriggered = true;
        clearTimeout(fallbackTimer);
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", () => {
      clearTimeout(fallbackTimer);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    });
  }

  function openWhatsAppWithFallback(phone, text) {
    const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
    const decodedText = typeof text === "string" ? text : "";
    const webUrl = `https://web.whatsapp.com/send?phone=${phone.replace(/^\+/, "")}&text=${encodeURIComponent(decodedText)}`;
    const appUrl = `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(decodedText)}`;
    if (isMobile) {
      let fallbackTriggered = false;
      window.location.href = appUrl;
      const fallbackTimer = setTimeout(() => {
        if (!fallbackTriggered && document.visibilityState === "visible") {
          fallbackTriggered = true;
          window.location.href = webUrl;
        }
      }, 1500);
      const onVisibilityChange = () => {
        if (document.visibilityState === "hidden") {
          fallbackTriggered = true;
          clearTimeout(fallbackTimer);
          document.removeEventListener("visibilitychange", onVisibilityChange);
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);
    } else {
      window.open(webUrl, "_blank", "noopener");
    }
  }

  async function copyToClipboard(text, displayText) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(displayText ? `Скопировано: ${displayText}` : "Скопировано в буфер обмена");
      return true;
    } catch (err) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        showToast(displayText ? `Скопировано: ${displayText}` : "Скопировано в буфер обмена");
        return true;
      } catch (err2) {
        showToast("Не удалось скопировать. Выберите вручную.");
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  }

  function showToast(message) {
    const toast = document.getElementById("contact-toast");
    if (!toast) return;
    const textEl = toast.querySelector(".toast-text");
    if (textEl) textEl.textContent = message;
    toast.classList.add("show");
    toast.setAttribute("aria-hidden", "false");
    setTimeout(() => {
      toast.classList.remove("show");
      toast.setAttribute("aria-hidden", "true");
    }, 3000);
  }

  function isDesktop() {
    return !/Android|iPhone|iPad/i.test(navigator.userAgent);
  }

  function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  function isMacDesktop() {
    const ua = navigator.userAgent;
    return /Mac/i.test(ua) && !/iPhone|iPad|iPod/i.test(ua);
  }

  function handleEmail(address, subject, body) {
    const openMailFirst = isMobile() || isMacDesktop();
    if (openMailFirst) {
      window.location.href = `mailto:${address}?subject=${encodeURIComponent(subject || "")}&body=${encodeURIComponent(body || "")}`;
    } else {
      copyToClipboard(address, address);
      setTimeout(() => {
        showToast("Email скопирован. Откройте ваш почтовый клиент.");
      }, 1500);
    }
  }

  function handlePhone(number, displayNumber) {
    const openCallFirst = isMobile() || isMacDesktop();
    if (openCallFirst) {
      window.location.href = `tel:${number}`;
    } else {
      copyToClipboard(number, displayNumber || number);
      setTimeout(() => {
        showToast("Номер скопирован. Наберите в вашем приложении.");
      }, 1500);
    }
  }

  if (!document.getElementById("contact-toast")) {
    const toast = document.createElement("div");
    toast.id = "contact-toast";
    toast.className = "contact-toast";
    toast.setAttribute("aria-hidden", "true");
    toast.innerHTML = '<span class="toast-icon">✓</span><span class="toast-text">Скопировано в буфер обмена</span>';
    document.body.appendChild(toast);
  }

  document.querySelectorAll(".contact-selector").forEach((selector) => {
    const toggleBtn = selector.querySelector(".contact-btn-toggle-main");
    const options = selector.querySelector(".contact-options");
    if (!toggleBtn || !options) return;

    let contactData = {};
    try {
      contactData = JSON.parse(selector.dataset.contactData || "{}");
    } catch (e) {
      console.error("Invalid contact data JSON:", e);
    }

    toggleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";
      toggleBtn.setAttribute("aria-expanded", !isExpanded);
      options.classList.toggle("show");
      selector.classList.toggle("open");
      if (!isExpanded && typeof ym !== "undefined") {
        ym(106909561, "reachGoal", toggleBtn.dataset.analytics || "cta_menu_open");
      }
    });

    options.querySelectorAll(".contact-option").forEach((option) => {
      option.addEventListener("click", (e) => {
        e.preventDefault();
        const channel = option.dataset.channel;
        const goal = option.dataset.analytics;
        if (typeof ym !== "undefined" && goal) {
          ym(106909561, "reachGoal", goal);
        }

        switch (channel) {
          case "telegram":
            if (contactData.telegram) {
              openTelegramWithFallback(contactData.telegram.username, contactData.telegram.text);
            }
            break;
          case "whatsapp":
            if (contactData.whatsapp) {
              openWhatsAppWithFallback(contactData.whatsapp.phone, contactData.whatsapp.text);
            }
            break;
          case "email":
            if (contactData.email) {
              handleEmail(
                contactData.email.address,
                contactData.email.subject,
                contactData.email.body
              );
            }
            break;
          case "phone":
            if (contactData.phone) {
              handlePhone(contactData.phone.number, contactData.phone.display);
            }
            break;
        }

        options.classList.remove("show");
        selector.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });

    document.addEventListener("click", (e) => {
      if (!selector.contains(e.target) && options.classList.contains("show")) {
        options.classList.remove("show");
        selector.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      }
    });
  });
});

