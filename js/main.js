(() => {
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");

  const openNav = () => {
    mobileNav.removeAttribute("hidden");
    requestAnimationFrame(() => mobileNav.classList.add("open"));
    menuBtn.setAttribute("aria-expanded", "true");
  };

  const closeNav = () => {
    mobileNav.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    mobileNav.addEventListener("transitionend", () => {
      if (!mobileNav.classList.contains("open")) {
        mobileNav.setAttribute("hidden", "");
      }
    }, { once: true });
  };

  menuBtn?.addEventListener("click", () => {
    if (mobileNav.classList.contains("open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  mobileNav?.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", closeNav);
  });

  // Active nav highlight (index.html only)
  const navLinks = [...document.querySelectorAll(".nav a")];
  const sections = [
    ["#home", "Home"],
    ["#how", "How It Works"],
    ["#explore", "Explore"],
    ["#creators", "Creators"],
    ["#businesses", "Businesses"],
    ["#faqs", "FAQs"],
  ];
  const hasSections = sections.some(([sel]) => document.querySelector(sel));
  const header = document.querySelector(".header");

  const syncNav = () => {
    if (header) header.classList.toggle("is-solid", window.scrollY > 80);
    if (!hasSections) return;
    const headerH = header?.offsetHeight || 76;
    const y = window.scrollY + headerH + 34;
    let current = "Home";
    for (const [sel, label] of sections) {
      const el = document.querySelector(sel);
      if (!el) continue;
      const top = sel === "#home" ? 0 : el.offsetTop;
      if (y >= top) current = label;
    }
    navLinks.forEach((a) => {
      const key = a.dataset.nav || a.textContent.trim();
      a.classList.toggle("active", key === current);
    });
  };
  window.addEventListener("scroll", syncNav, { passive: true });

  // Demo modal
  const modal = document.getElementById("demoModal");
  const closeModal = () => {
    modal?.setAttribute("hidden", "");
    if (lastFocus) lastFocus.focus();
  };
  let lastFocus = null;
  const openModal = () => {
    lastFocus = document.activeElement;
    modal?.removeAttribute("hidden");
    modal?.querySelector("button, a")?.focus();
  };
  modal?.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  modal?.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !modal) return;
    const focusable = modal.querySelectorAll('button, a, input, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Image zoom on click
  const zoomOverlay = document.createElement("div");
  zoomOverlay.className = "zoom-overlay";
  zoomOverlay.innerHTML = '<button class="zoom-close">&times;</button><img class="zoom-img" src="" alt="" />';
  document.body.appendChild(zoomOverlay);

  const zoomImg = zoomOverlay.querySelector(".zoom-img");
  const zoomClose = zoomOverlay.querySelector(".zoom-close");

  document.querySelectorAll(".fopt-art img").forEach((img) => {
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      zoomImg.src = img.src;
      zoomImg.alt = img.alt;
      zoomOverlay.classList.add("active");
      lastZoom = document.activeElement;
      zoomClose.focus();
    });
  });

  let lastZoom = null;
  zoomClose.addEventListener("click", () => { zoomOverlay.classList.remove("active"); lastZoom?.focus(); });
  zoomOverlay.addEventListener("click", () => { zoomOverlay.classList.remove("active"); lastZoom?.focus(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { zoomOverlay.classList.remove("active"); lastZoom?.focus(); }
  });

  // Carousel navigation
  document.querySelectorAll(".carousel").forEach((carousel) => {
    const track = carousel.querySelector(".car-track");
    const slides = track?.querySelectorAll(".slide");
    const view = carousel.querySelector(".car-view");
    const prev = carousel.querySelector(".car-prev");
    const next = carousel.querySelector(".car-next");
    if (!track || !slides?.length || !prev || !next || !view) return;

    // Custom 3D Coverflow
    if (carousel.id === "sneak-carousel" || carousel.id === "creators-carousel" || carousel.id === "vendors-carousel") {
      let activeIndex = 0;
      
      const updateCoverflow = () => {
        slides.forEach((slide, i) => {
          slide.className = "slide"; // Reset classes
          const offset = i - activeIndex;
          
          if (offset === 0) {
            slide.classList.add("cf-center", "active");
          } else if (offset === -1) {
            slide.classList.add("cf-prev-1");
          } else if (offset === 1) {
            slide.classList.add("cf-next-1");
          } else if (offset === -2) {
            slide.classList.add("cf-prev-2");
          } else if (offset === 2) {
            slide.classList.add("cf-next-2");
          } else {
            slide.classList.add("cf-hidden");
          }
        });
        
        prev.disabled = activeIndex <= 0;
        next.disabled = activeIndex >= slides.length - 1;
      };

      prev.addEventListener("click", () => {
        if (activeIndex > 0) {
          activeIndex--;
          updateCoverflow();
        }
      });

      next.addEventListener("click", () => {
        if (activeIndex < slides.length - 1) {
          activeIndex++;
          updateCoverflow();
        }
      });

      // Swipe support for Coverflow
      let startX = 0;
      view.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
      view.addEventListener("touchend", (e) => {
        const diffX = e.changedTouches[0].clientX - startX;
        if (diffX > 50 && activeIndex > 0) {
          activeIndex--; updateCoverflow();
        } else if (diffX < -50 && activeIndex < slides.length - 1) {
          activeIndex++; updateCoverflow();
        }
      });

      updateCoverflow();
      return; // Skip the generic sliding logic
    }

    const getVisible = () => {
      if (!view || !slides[0]) return 4;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const slideW = slides[0].offsetWidth + gap;
      return Math.max(1, Math.round(view.offsetWidth / slideW));
    };

    let idx = 0;
    const update = () => {
      const visible = getVisible();
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const slideW = slides[0].offsetWidth + gap;
      const maxIdx = Math.max(0, slides.length - visible);
      if (idx > maxIdx) idx = maxIdx;
      track.style.transform = `translateX(-${idx * slideW}px)`;
      prev.disabled = idx <= 0;
      next.disabled = idx >= maxIdx;
    };

    let resizeTimer;
    const debouncedUpdate = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(update, 100);
    };

    prev.addEventListener("click", () => { if (idx > 0) { idx--; update(); } });
    next.addEventListener("click", () => { const max = slides.length - getVisible(); if (idx < max) { idx++; update(); } });
    update();

    // Touch Swipe Gestures
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;

    view.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isSwiping = true;
      track.style.transition = "none";
    }, { passive: true });

    view.addEventListener("touchmove", (e) => {
      if (!isSwiping) return;
      currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      
      const visible = getVisible();
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const slideW = slides[0].offsetWidth + gap;
      const baseTranslate = -idx * slideW;
      
      const maxTranslate = 0;
      const minTranslate = -Math.max(0, slides.length - visible) * slideW;
      let newTranslate = baseTranslate + diffX;
      
      // Edge resistance
      if (newTranslate > maxTranslate) newTranslate = maxTranslate + (newTranslate - maxTranslate) * 0.3;
      if (newTranslate < minTranslate) newTranslate = minTranslate + (newTranslate - minTranslate) * 0.3;
      
      track.style.transform = `translateX(${newTranslate}px)`;
    }, { passive: true });

    view.addEventListener("touchend", () => {
      if (!isSwiping) return;
      isSwiping = false;
      track.style.transition = "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      
      const diffX = currentX - startX;
      const threshold = 55;
      const visible = getVisible();
      const max = slides.length - visible;
      
      if (diffX < -threshold && idx < max) {
        idx++;
      } else if (diffX > threshold && idx > 0) {
        idx--;
      }
      update();
    }, { passive: true });

    window.addEventListener("resize", debouncedUpdate);
  });

  /* ───── file upload ───── */
  const uploadBtn = document.getElementById("uploadBtn");
  const fileInput = document.getElementById("fileInput");

  if (uploadBtn && fileInput) {
    uploadBtn.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const uploadBtnText = uploadBtn.querySelector("span");
      if (uploadBtnText) uploadBtnText.textContent = "Uploading...";
      uploadBtn.disabled = true;

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload?filename=" + encodeURIComponent(file.name), {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data.url) {
          // Show the uploaded image preview
          const img = new Image();
          img.src = data.url;
          img.style.maxWidth = "200px";
          img.style.marginTop = "10px";
          uploadBtn.parentNode.appendChild(img);
          uploadBtnText.textContent = "Upload Photo";
          uploadBtn.disabled = false;
        } else {
          alert("Upload failed: " + (data.error || "Unknown error"));
          uploadBtnText.textContent = "Upload Photo";
          uploadBtn.disabled = false;
        }
      } catch (err) {
        console.error("Upload error:", err);
        alert("Upload failed. Please try again.");
        uploadBtnText.textContent = "Upload Photo";
        uploadBtn.disabled = false;
      }
    });
  }

/* ───── scroll reveal ───── */
  if ("IntersectionObserver" in window) {
    const revealed = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealed.add(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".section-reveal").forEach((el) => observer.observe(el));

    /* ───── stat counter ───── */
    let counted = false;
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          statsObserver.disconnect();

          const animatable = [
            { el: entry.target.querySelector(".stat:nth-child(1) strong"), target: 1250, suffix: "+" },
            { el: entry.target.querySelector(".stat:nth-child(2) strong"), target: 350, suffix: "+" },
            { el: entry.target.querySelector(".stat:nth-child(3) strong"), target: 100, suffix: "+" },
          ];

          const duration = 1500;
          const start = performance.now();

          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            animatable.forEach(({ el, target, suffix }) => {
              const current = Math.round(ease * target);
              el.textContent = current.toLocaleString() + suffix;
            });
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });

    const statsCard = document.querySelector(".stats-card");
    if (statsCard) statsObserver.observe(statsCard);
  }
})();

/* The intro overlay is owned entirely by the inline script in index.html.
   It used to also be handled here on window.load, which could never fire if
   the load event had already happened, leaving the overlay stuck on screen. */
