(function () {
  const CHECKOUT_SELECTOR = ".checkout";
  const TRACKING_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "utm_id", "src", "off", "fbclid", "gclid", "ttclid", "msclkid"];

  function storedTrackingParams() {
    const params = new URLSearchParams();

    TRACKING_KEYS.forEach((key) => {
      const direct = localStorage.getItem("tracking_" + key);
      if (direct) params.set(key, direct);
    });

    Object.keys(localStorage).forEach((key) => {
      if (!key.startsWith("tracking_utm_")) return;
      const cleanKey = key.replace("tracking_", "");
      const value = localStorage.getItem(key);
      if (value) params.set(cleanKey, value);
    });

    return params;
  }

  function applyTrackingToCheckoutLinks() {
    const tracking = storedTrackingParams();
    if (!tracking.toString()) return;

    document.querySelectorAll(CHECKOUT_SELECTOR).forEach((link) => {
      try {
        const url = new URL(link.href, window.location.href);
        tracking.forEach((value, key) => url.searchParams.set(key, value));
        link.href = url.toString();
      } catch (error) {
        console.warn("Nao foi possivel aplicar UTMs ao checkout.", error);
      }
    });
  }

  function setupCountdown() {
    const countdown = document.getElementById("countdown");
    if (!countdown) return;

    const storageKey = "neurokids_countdown_end";
    const now = Date.now();
    let end = Number(localStorage.getItem(storageKey));

    if (!end || end < now) {
      end = now + 10 * 60 * 1000;
      localStorage.setItem(storageKey, String(end));
    }

    function tick() {
      const remaining = Math.max(0, end - Date.now());
      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      countdown.textContent = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    tick();
    setInterval(tick, 1000);
  }

  function setupFaq() {
    document.querySelectorAll(".faq-item button").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".faq-item");
        const opened = item.classList.toggle("open");
        button.querySelector("span").textContent = opened ? "-" : "+";
      });
    });
  }

  function setupRevealAnimation() {
    const elements = document.querySelectorAll(".reveal");

    if (!("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("in-view"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });

    elements.forEach((element) => observer.observe(element));
  }

  function setupExitModal() {
    const modal = document.getElementById("exitModal");
    if (!modal) return;

    let opened = false;
    const openModal = () => {
      if (opened || sessionStorage.getItem("neurokids_exit_modal_seen")) return;
      opened = true;
      sessionStorage.setItem("neurokids_exit_modal_seen", "1");
      modal.classList.add("open");
      modal.setAttribute("aria-hidden", "false");
    };

    const closeModal = () => {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
    };

    document.addEventListener("mouseleave", (event) => {
      if (event.clientY <= 0) openModal();
    });

    let lastScroll = window.scrollY;
    window.addEventListener("scroll", () => {
      const current = window.scrollY;
      const goingUpFast = current < lastScroll - 120 && current > 700;
      lastScroll = current;
      if (goingUpFast) openModal();
    }, { passive: true });

    document.querySelectorAll("[data-close-modal]").forEach((element) => {
      element.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeModal();
    });
  }

  function setupSmoothCtas() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const target = document.querySelector(anchor.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setupYear() {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  }

  function setupCheckoutEvents() {
    document.querySelectorAll(CHECKOUT_SELECTOR).forEach((link) => {
      link.addEventListener("click", () => {
        if (typeof fbq === "function") fbq("track", "InitiateCheckout");
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTrackingToCheckoutLinks();
    setupCountdown();
    setupFaq();
    setupRevealAnimation();
    setupExitModal();
    setupSmoothCtas();
    setupYear();
    setupCheckoutEvents();
  });
})();
