const pageParams = new URLSearchParams(window.location.search);
if (pageParams.get("embed") === "1") {
  document.documentElement.classList.add("embed-mode");
  if (document.body) {
    document.body.classList.add("embed-mode");
  } else {
    window.addEventListener("DOMContentLoaded", () => document.body.classList.add("embed-mode"), { once: true });
  }

  const scrollRatio = Number(pageParams.get("scroll") || "0");
  if (Number.isFinite(scrollRatio) && scrollRatio > 0) {
    const alignEmbedScroll = () => {
      const root = document.scrollingElement || document.documentElement;
      const max = Math.max(0, root.scrollHeight - window.innerHeight);
      window.scrollTo(0, Math.round(max * Math.min(1, Math.max(0, scrollRatio))));
    };
    window.addEventListener("load", alignEmbedScroll, { once: true });
  }
}

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

(() => {
  const topbar = document.querySelector(".topbar");
  const nav = topbar ? topbar.querySelector("nav") : null;
  if (!topbar || !nav) {
    return;
  }

  topbar.classList.add("has-mobile-menu");
  const isImagicoreHost = /(^|\.)imagicore\.hu$/i.test(window.location.hostname);
  const mainSiteOrigin = "https://danielsimon.hu";
  const toSiteHref = (path) => {
    const normalizedPath = String(path || "/");
    const absolutePath = normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
    if (!isImagicoreHost) {
      return absolutePath;
    }
    if (absolutePath === "/imagicore/") {
      return "/";
    }
    return `${mainSiteOrigin}${absolutePath}`;
  };


  const toRootHref = (href) => {
    if (!href) {
      return href;
    }
    const normalized = href.trim();
    if (!normalized || normalized.startsWith("#") || normalized.startsWith("mailto:") || normalized.startsWith("tel:")) {
      return normalized;
    }
    if (/^https?:\/\//i.test(normalized)) {
      return normalized;
    }

    const clean = normalized.replace(/^\.\/?/, "").replace(/^\.\.\//, "").replace(/^\.\.\//, "").replace(/^\.\.\//, "");
    let resolved;

    if (clean.includes("daniel-simon-channel")) {
      resolved = "/daniel-simon-channel/";
    } else if (clean.includes("aranyasokfelsofokon")) {
      resolved = "/aranyasokfelsofokon/";
    } else if (clean.endsWith("index.html") || clean === "index.html") {
      resolved = "/";
    } else if (clean.includes("imagicore.html") || clean === "imagicore" || clean.startsWith("imagicore/")) {
      resolved = "/imagicore/";
    } else if (clean.includes("youtube.html") || clean === "youtube" || clean.startsWith("youtube/")) {
      resolved = "/youtube/";
    } else if (clean.includes("rolam.html") || clean === "rolam" || clean.startsWith("rolam/")) {
      resolved = "/rolam/";
    } else if (clean.includes("kapcsolat.html") || clean === "kapcsolat" || clean.startsWith("kapcsolat/")) {
      resolved = "/kapcsolat/";
    } else if (clean.startsWith("/")) {
      resolved = clean;
    } else {
      resolved = `/${clean}`;
    }

    return toSiteHref(resolved);
  };

  nav.querySelectorAll("a[href]").forEach((a) => {
    const rawHref = a.getAttribute("href") || "";
    const nextHref = toRootHref(rawHref);
    if (nextHref && nextHref !== rawHref) {
      a.setAttribute("href", nextHref);
    }
  });

  nav.querySelectorAll(".nav-dropdown .nav-submenu a[href]").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    a.classList.remove("menu-yt-ds", "menu-yt-af");
    if (href.includes("daniel-simon-channel")) {
      a.classList.add("menu-yt-ds");
    }
    if (href.includes("aranyasokfelsofokon")) {
      a.classList.add("menu-yt-af");
    }
  });

  {
    let lower = nav.querySelector(".nav-lower");
    if (!lower) {
      lower = document.createElement("div");
      lower.className = "nav-lower";
      nav.appendChild(lower);
    }

    let social = nav.querySelector(".nav-social");
    if (!social) {
      social = document.createElement("div");
      social.className = "nav-social";
      nav.insertBefore(social, lower);
    }

    social.innerHTML = "";
    [
      { platform: "YouTube", handle: "@daniel_simon", href: "https://www.youtube.com/@daniel_simon", iconClass: "is-youtube" },
      { platform: "TikTok", handle: "@danielsimon.hu", href: "https://www.tiktok.com/@danielsimon.hu", iconClass: "is-tiktok" },
      { platform: "Instagram", handle: "@simi.ke", href: "https://www.instagram.com/simi.ke", iconClass: "is-instagram" }
    ].forEach((entry) => {
      const item = document.createElement("a");
      item.href = entry.href;
      item.target = "_blank";
      item.rel = "noopener noreferrer";
      item.className = "nav-social-link";
      item.setAttribute("aria-label", `${entry.platform} ${entry.handle}`);
      item.title = `${entry.platform} ${entry.handle}`;
      item.innerHTML = `<span class="nav-social-icon ${entry.iconClass}" aria-hidden="true"></span>`;
      social.appendChild(item);
    });
    let links = lower.querySelector(".nav-lower-links");
    if (!links) {
      links = document.createElement("div");
      links.className = "nav-lower-links";
      lower.appendChild(links);
    }

    links.innerHTML = "";
    [
      { label: "adatv\u00E9delmi t\u00E1j\u00E9koztat\u00F3", href: "/adatvedelem/" },
      { label: "impresszum", href: "/impresszum/" },
      { label: "felhaszn\u00E1l\u00E1si felt\u00E9telek", href: "/felhasznalasi-feltetelek/" },
      { label: "jogi nyilatkozat", href: "/jogi-nyilatkozat/" }
    ].forEach((entry) => {
      const item = document.createElement("a");
      item.href = toSiteHref(entry.href);
      item.textContent = entry.label;
      links.appendChild(item);
    });

    let copy = lower.querySelector(".nav-lower-copy");
    if (!copy) {
      copy = document.createElement("p");
      copy.className = "nav-lower-copy";
      lower.appendChild(copy);
    }
    copy.textContent = `${String.fromCharCode(169)} ${new Date().getFullYear()} Daniel Simon`;
  }
  if (!nav.id) {
    nav.id = "topbarNavMenu";
  }

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "topbar-menu-toggle";
  toggleBtn.setAttribute("aria-label", "Menu megnyitasa");
  toggleBtn.setAttribute("aria-expanded", "false");
  toggleBtn.setAttribute("aria-controls", nav.id);
  toggleBtn.innerHTML = "<span></span><span></span><span></span>";

  topbar.appendChild(toggleBtn);

  const closeMenu = () => {
    topbar.classList.remove("menu-open");
    document.body.classList.remove("mobile-menu-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    topbar.classList.add("menu-open");
    document.body.classList.add("mobile-menu-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  };

  toggleBtn.addEventListener("click", () => {
    if (topbar.classList.contains("menu-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.addEventListener("click", (event) => {
    const link = event.target && event.target.closest ? event.target.closest("a") : null;
    if (link) {
      closeMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (!topbar.classList.contains("menu-open")) {
      return;
    }
    if (!topbar.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1099) {
      closeMenu();
    }
  });
})();

const initAboutTimeline = () => {
  const prevCleanup = window.__aboutTimelineCleanup;
  if (typeof prevCleanup === "function") {
    prevCleanup();
  }

  const timeline = document.querySelector(".about-timeline");
  if (!timeline) {
    return;
  }

  const progressEl = timeline.querySelector(".about-timeline-progress");
  const items = Array.from(timeline.querySelectorAll(".about-timeline-item"));
  if (!progressEl || items.length === 0) {
    return;
  }

  let rafId = 0;

  const update = () => {
    rafId = 0;
    const rect = timeline.getBoundingClientRect();
    const viewportHeight = window.innerHeight || 1;
    const start = viewportHeight * 0.28;
    const total = Math.max(1, rect.height - viewportHeight * 0.22);
    const progress = Math.max(0, Math.min(1, (start - rect.top) / total));
    progressEl.style.setProperty("--timeline-progress", progress.toFixed(3));

    const focusLine = viewportHeight * 0.38;
    items.forEach((item) => {
      const itemRect = item.getBoundingClientRect();
      const center = itemRect.top + itemRect.height / 2;
      const distance = Math.abs(focusLine - center);
      const normalized = Math.min(1, distance / (viewportHeight * 0.34));
      const edgeTop = Math.min(1, Math.max(0, itemRect.bottom / (viewportHeight * 0.24)));
      const edgeBottom = Math.min(1, Math.max(0, (viewportHeight - itemRect.top) / (viewportHeight * 0.24)));
      const edgeVisibility = Math.min(edgeTop, edgeBottom);
      const focus = Math.max(0.14, ((1 - normalized) * 0.8) + (edgeVisibility * 0.2));
      item.style.setProperty("--focus", focus.toFixed(3));
      item.classList.toggle("is-focus", focus > 0.38);
      item.classList.toggle("is-readable", focus > 0.28);
    });
  };

  const requestUpdate = () => {
    if (rafId) {
      return;
    }
    rafId = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  window.__aboutTimelineCleanup = () => {
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    if (rafId) {
      window.cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };
};
const initRevealObserver = () => {
  const prevCleanup = window.__dsRevealCleanup;
  if (typeof prevCleanup === "function") {
    prevCleanup();
  }

  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length === 0) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach((el) => observer.observe(el));

  window.__dsRevealCleanup = () => {
    observer.disconnect();
    window.__dsRevealCleanup = null;
  };
};

const initGenericParallax = () => {
  const prevCleanup = window.__dsParallaxCleanup;
  if (typeof prevCleanup === "function") {
    prevCleanup();
  }

  const parallaxElements = Array.from(document.querySelectorAll("[data-parallax-speed]"));
  if (parallaxElements.length === 0) {
    return;
  }

  let ticking = false;
  const updateParallax = () => {
    const scrollY = window.scrollY || 0;
    parallaxElements.forEach((el) => {
      const speed = Number(el.getAttribute("data-parallax-speed")) || 0;
      const y = Math.round(scrollY * speed);
      el.style.transform = `translate3d(0, ${y}px, 0)`;
    });
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  updateParallax();

  window.__dsParallaxCleanup = () => {
    window.removeEventListener("scroll", onScroll);
    window.__dsParallaxCleanup = null;
  };
};
const initRandomBlobWander = () => {
  const prevCleanup = window.__dsRandomBlobCleanup;
  if (typeof prevCleanup === "function") {
    prevCleanup();
  }

  const body = document.body;
  const bgLayer = document.querySelector(".bg-layer");
  const allowed = body && (
    body.classList.contains("page-home") ||
    body.classList.contains("page-about") ||
    body.classList.contains("page-youtube") ||
    body.classList.contains("page-imagicore")
  );
  if (!bgLayer || !allowed) {
    return;
  }

  bgLayer.classList.add("random-blob-enabled");

  const field = document.createElement("div");
  field.className = "blob-field";
  bgLayer.prepend(field);

  const palettes = body.classList.contains("page-imagicore")
    ? [
        "radial-gradient(circle at 34% 32%, #77bef2bf 0%, #4568c0a8 44%, #4568c000 74%)",
        "radial-gradient(circle at 36% 30%, #8fcdf5b8 0%, #4f72cca8 45%, #4f72cc00 74%)",
        "radial-gradient(circle at 32% 34%, #5ea9ebb5 0%, #3f5fb9a5 43%, #3f5fb900 73%)",
        "radial-gradient(circle at 35% 31%, #9ed9f7b0 0%, #4568c09f 44%, #4568c000 74%)"
      ]
    : body.classList.contains("page-youtube")
      ? [
          "radial-gradient(circle at 34% 32%, #ff1f1fc4 0%, #b30000ad 44%, #b3000000 74%)",
          "radial-gradient(circle at 36% 30%, #ff4d4dbb 0%, #a00000a8 45%, #a0000000 74%)",
          "radial-gradient(circle at 32% 34%, #ff3333b8 0%, #8f0000a3 43%, #8f000000 73%)",
          "radial-gradient(circle at 35% 31%, #ff8080b0 0%, #b300009c 44%, #b3000000 74%)"
        ]
      : [
          "radial-gradient(circle at 34% 32%, #0f8d88c9 0%, #0a6662b8 44%, #0a666200 74%)",
          "radial-gradient(circle at 36% 30%, #0e807bc8 0%, #095a56b5 45%, #095a5600 74%)",
          "radial-gradient(circle at 32% 34%, #118983c7 0%, #0a5f5bb3 43%, #0a5f5b00 73%)",
          "radial-gradient(circle at 35% 31%, #0f7b76c6 0%, #095450b2 44%, #09545000 74%)"
        ];

  const rand = (min, max) => min + Math.random() * (max - min);
  const isMobileMotion =
    window.matchMedia("(max-width: 900px)").matches ||
    window.matchMedia("(pointer: coarse)").matches;
  const blobs = Array.from({ length: 4 }, (_, i) => {
    const el = document.createElement("span");
    el.className = "blob-node";
    const size = rand(700, 1100);
    el.style.setProperty("--blob-size", `${size.toFixed(0)}px`);
    el.style.setProperty("--blob-opacity", rand(0.4, 0.62).toFixed(3));
    el.style.background = palettes[i % palettes.length];
    field.appendChild(el);
    return {
      el,
      size,
      x: 0,
      y: 0,
      vx: rand(-24, 24),
      vy: rand(-24, 24)
    };
  });

  let bounds = { w: 0, h: 0 };
  const setupBounds = () => {
    const r = field.getBoundingClientRect();
    bounds.w = Math.max(1, r.width);
    bounds.h = Math.max(1, r.height);
    blobs.forEach((b) => {
      const sizeCap = Math.max(240, Math.min(bounds.w, bounds.h) * (isMobileMotion ? 0.72 : 0.92));
      if (b.size > sizeCap) {
        b.size = sizeCap;
        b.el.style.setProperty("--blob-size", `${b.size.toFixed(0)}px`);
      }

      if (b.x === 0 && b.y === 0) {
        b.x = rand(b.size * 0.55, bounds.w - b.size * 0.55);
        b.y = rand(b.size * 0.55, bounds.h - b.size * 0.55);
      } else {
        b.x = Math.min(bounds.w - b.size * 0.55, Math.max(b.size * 0.55, b.x));
        b.y = Math.min(bounds.h - b.size * 0.55, Math.max(b.size * 0.55, b.y));
      }
    });
  };

  setupBounds();

  let last = performance.now();
  let rafId = 0;
  let speedBoost = 1;
  let speedTarget = 1;
  let lastYScroll = window.scrollY || 0;
  let lastBoostTs = performance.now();
  const jitterAccel = isMobileMotion ? 34 : 58;
  const drag = isMobileMotion ? 0.976 : 0.988;
  const minSpeedBase = isMobileMotion ? 12 : 28;
  const maxSpeedBase = isMobileMotion ? 64 : 140;
  const bounceFactor = isMobileMotion ? 0.72 : 0.92;
  const boostCap = isMobileMotion ? 4.2 : 10.0;

  const step = (now) => {
    const dt = Math.min(0.05, Math.max(0.008, (now - last) / 1000));
    last = now;

    speedBoost += (speedTarget - speedBoost) * (isMobileMotion ? 0.2 : 0.28);
    speedTarget += (1 - speedTarget) * (isMobileMotion ? 0.045 : 0.015);

    blobs.forEach((b) => {
      b.vx += rand(-jitterAccel, jitterAccel) * dt * speedBoost;
      b.vy += rand(-jitterAccel, jitterAccel) * dt * speedBoost;

      b.vx *= drag;
      b.vy *= drag;

      const speed = Math.hypot(b.vx, b.vy) || 0.001;
      const minSpeed = minSpeedBase * speedBoost;
      const maxSpeed = maxSpeedBase * speedBoost;
      if (speed < minSpeed) {
        const s = minSpeed / speed;
        b.vx *= s;
        b.vy *= s;
      } else if (speed > maxSpeed) {
        const s = maxSpeed / speed;
        b.vx *= s;
        b.vy *= s;
      }

      b.x += b.vx * dt;
      b.y += b.vy * dt;

      const margin = b.size * (isMobileMotion ? 0.48 : 0.42);
      if (b.x < margin) {
        b.x = margin;
        b.vx = Math.abs(b.vx) * bounceFactor;
      } else if (b.x > bounds.w - margin) {
        b.x = bounds.w - margin;
        b.vx = -Math.abs(b.vx) * bounceFactor;
      }

      if (b.y < margin) {
        b.y = margin;
        b.vy = Math.abs(b.vy) * bounceFactor;
      } else if (b.y > bounds.h - margin) {
        b.y = bounds.h - margin;
        b.vy = -Math.abs(b.vy) * bounceFactor;
      }

      b.el.style.transform = `translate3d(${(b.x - b.size * 0.5).toFixed(2)}px, ${(b.y - b.size * 0.5).toFixed(2)}px, 0)`;
    });

    rafId = window.requestAnimationFrame(step);
  };

  rafId = window.requestAnimationFrame(step);

  const onScrollBoost = () => {
    const now = performance.now();
    const y = window.scrollY || 0;
    const dy = Math.abs(y - lastYScroll);
    const dtMs = Math.max(12, now - lastBoostTs);
    lastYScroll = y;
    lastBoostTs = now;
    const scrollVelocity = (dy / dtMs) * 16;
    const bump = Math.min(boostCap, 1.6 + scrollVelocity * (isMobileMotion ? 1.8 : 4.2));
    if (bump > speedTarget) {
      speedTarget = bump;
    }
  };

  window.addEventListener("scroll", onScrollBoost, { passive: true });
  window.addEventListener("resize", setupBounds);

  window.__dsRandomBlobCleanup = () => {
    window.removeEventListener("scroll", onScrollBoost);
    window.removeEventListener("resize", setupBounds);
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
    rafId = 0;
    field.remove();
    bgLayer.classList.remove("random-blob-enabled");
    window.__dsRandomBlobCleanup = null;
  };
};

const initImagicoreForm = () => {
  const imagiForm = document.getElementById("imagicoreForm");
  if (!imagiForm || imagiForm.dataset.bound === "1") {
    return;
  }

  imagiForm.dataset.bound = "1";
  imagiForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(imagiForm);
    const kobeEmail = imagiForm.getAttribute("data-kobe-email") || "kobe@imagicore.hu";

    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const project = formData.get("project") || "";
    const message = formData.get("message") || "";

    const subject = encodeURIComponent(`[ImagiCORE] Uj megkereses - ${project}`);
    const body = encodeURIComponent(`Nev: ${name}\nEmail: ${email}\nProjekt: ${project}\n\nUzenet:\n${message}`);

    window.location.href = `mailto:${kobeEmail}?subject=${subject}&body=${body}`;
  });
};

const normalizeBtsSrc = (src) => {
  const btsDir = "/assets/images/imagicore/bts/";
  if (!src) {
    return "";
  }
  const cleaned = String(src).replace(/\\/g, "/");
  if (/^[a-zA-Z]:\//.test(cleaned)) {
    const fileName = cleaned.split("/").pop();
    return fileName ? `${btsDir}${fileName}` : "";
  }
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://") || cleaned.startsWith("/")) {
    return cleaned;
  }
  if (cleaned.startsWith("assets/")) {
    return `/${cleaned}`;
  }
  return `${btsDir}${cleaned.split("/").pop()}`;
};

const getExistingBtsItems = (track) => {
  if (!track) {
    return [];
  }

  return Array.from(track.querySelectorAll(".story-cover"))
    .map((img, index) => ({
      src: img.getAttribute("src") || img.currentSrc || "",
      alt: img.getAttribute("alt") || "BTS - " + String(index + 1)
    }))
    .filter((item) => item.src);
};

const loadBtsItems = async (fallbackItems = []) => {
  try {
    const res = await fetch("/assets/data/bts-gallery.json", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch {
    // fallback below
  }

  if (Array.isArray(fallbackItems) && fallbackItems.length > 0) {
    return fallbackItems;
  }

  return Array.from({ length: 14 }, (_, i) => ({
    src: "/assets/images/imagicore/bts/" + String(14 - i) + ".webp",
    alt: "ImagiCORE sztori"
  }));
};

const IMAGICORE_ARTIST_NAMES = [
  "Szirota Jennifer",
  "Moby Dick",
  "BLR",
  "Tar\u00e1ny Tam\u00e1s",
  "Zolt\u00e1n Erika",
  "Audiopoeta",
  "Charlie",
  "Jolly",
  "TPX",
  "Keresztes Ildik\u00f3",
  "BALKAN FANATIK",
  "Siska",
  "The Griffins",
  "New Level Empire",
  "Krisz Rudi",
  "SuperStereo",
  "Curtis",
  "Br\u00e9da Bia",
  "Szekeres Andris",
  "Haizok Melinda",
  "Kodak",
  "Hor\u00e1nyi Juli",
  "B\u00f3di Csabi",
  "AK26",
  "Amanna",
  "Kozs\u00f3",
  "Mak\u00f3 \u00c9vi",
  "P\u00e9terfy Bori",
  "Sterbinszky",
  "P\u00e1sztor Anna",
  "DRASTIC TIMES",
  "De\u00e1k Zola",
  "T.Danny",
  "Andreas Meck",
  "Kir\u00e1ly Viktor",
  "Rusz\u00f3 Tibi",
  "Giovanni",
  "MENFIS",
  "No Midi",
  "Tak\u00e1ts Tam\u00e1s",
  "Deniz",
  "Szak\u00e1cs Gerg\u0151",
  "Republic",
  "Kis Gr\u00f3fo",
  "Baricz Gerg\u0151",
  "F\u00d6LDALATTI MOZGALOM",
  "ZANZIBAR",
  "MC Veeto",
  "G\u0151cze B\u00e1lint",
  "C-z\u00e1r",
  "George Shilling",
  "Spigiboy",
  "Z. Kiss Zal\u00e1n",
  "TKYD",
  "FankaDeli",
  "Pit",
  "Szuper\u00e1k Barbie",
  "CIMPA",
  "D\u00c9",
  "Animal Cannibals",
  "Boros Csaba",
  "T\u00f3th T\u00fcndi",
  "KRECK",
  "K\u00f6rmendi Anita (Enita)",
  "BeatKOHO",
  "Juh\u00e1sz Zolt\u00e1n",
  "Marcee",
  "Angel",
  "Nagy Fer\u00f3",
  "Bal\u00e1zs Pali",
  "streetROYAL",
  "\u00d6csk\u00f6ss",
  "Herceg D\u00e1vid",
  "Sandyka",
  "Diaz",
  "Istv\u00e1n, a kir\u00e1ly 40",
  "Dopeman",
  "Brigi",
  "SNEEZ",
  "Burai Kriszti\u00e1n"
];

const initCountUpMetrics = () => {
  const counters = Array.from(document.querySelectorAll('[data-counter-target]'));
  if (counters.length === 0) {
    return;
  }

  const formatCount = (value) => {
    return Math.floor(value).toLocaleString('hu-HU');
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCounter = (el) => {
    if (!el || el.dataset.counterStarted === 'true') {
      return;
    }
    el.dataset.counterStarted = 'true';

    const rampTarget = Number(el.getAttribute('data-counter-start')) || 0;
    const finalTarget = Number(el.getAttribute('data-counter-target')) || rampTarget;
    const totalDuration = prefersReducedMotion ? 0 : Number(el.getAttribute('data-counter-duration')) || 120000;
    const rampDuration = prefersReducedMotion ? 0 : Number(el.getAttribute('data-counter-ramp')) || 2200;

    if (totalDuration <= 0 || finalTarget <= 0) {
      el.textContent = formatCount(finalTarget);
      return;
    }

    const slowDuration = Math.max(1, totalDuration - rampDuration);
    const startedAt = performance.now();

    const tick = (now) => {
      const elapsed = now - startedAt;
      let value = 0;

      if (elapsed <= rampDuration) {
        const rampProgress = Math.min(1, elapsed / rampDuration);
        const rampEase = 1 - Math.pow(1 - rampProgress, 4);
        value = rampTarget * rampEase;
      } else {
        const slowProgress = Math.min(1, (elapsed - rampDuration) / slowDuration);
        const slowEase = 1 - Math.pow(1 - slowProgress, 1.6);
        value = rampTarget + (finalTarget - rampTarget) * slowEase;
      }

      el.textContent = formatCount(value);

      if (elapsed < totalDuration) {
        window.requestAnimationFrame(tick);
      } else {
        el.textContent = formatCount(finalTarget);
      }
    };

    window.requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(animateCounter);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

  counters.forEach((counter) => {
    const rect = counter.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
    if (alreadyVisible) {
      animateCounter(counter);
      return;
    }
    observer.observe(counter);
  });
};
const initImagicoreArtistSlot = () => {
  const prevCleanup = window.__imagicoreArtistSlotCleanup;
  if (typeof prevCleanup === "function") {
    prevCleanup();
  }

  const root = document.querySelector("[data-imagicore-artist-slot]");
  if (!root) {
    window.__imagicoreArtistSlotCleanup = null;
    return;
  }

  const reelElements = Array.from(root.querySelectorAll("[data-artist-reel]"));
  if (reelElements.length === 0) {
    window.__imagicoreArtistSlotCleanup = null;
    return;
  }

  const uniqueArtists = Array.from(
    new Set(
      IMAGICORE_ARTIST_NAMES
        .map((name) => String(name || "").trim())
        .filter(Boolean)
    )
  );

  if (uniqueArtists.length < 2) {
    window.__imagicoreArtistSlotCleanup = null;
    return;
  }

  const shuffleArtists = (source) => {
    const items = source.slice();
    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  };

  const buildArtistSequence = (seedOffset = 0) => {
    let sequence = uniqueArtists.slice();
    for (let attempt = 0; attempt < 8; attempt += 1) {
      sequence = shuffleArtists(uniqueArtists);
      if (sequence.length < 2 || sequence[0] !== sequence[sequence.length - 1]) {
        break;
      }
    }

    if (seedOffset > 0) {
      const offset = seedOffset % sequence.length;
      sequence = sequence.slice(offset).concat(sequence.slice(0, offset));
    }

    return sequence;
  };

  const normalizeLoopPosition = (viewport, segmentHeight) => {
    if (!viewport || !segmentHeight) {
      return;
    }
    if (viewport.scrollTop < segmentHeight * 0.5) {
      viewport.scrollTop += segmentHeight;
    } else if (viewport.scrollTop >= segmentHeight * 1.5) {
      viewport.scrollTop -= segmentHeight;
    }
  };

  const reelStates = [];
  let rafId = 0;
  let destroyed = false;

  reelElements.forEach((reelEl, reelIndex) => {
    const viewport = reelEl.querySelector(".artist-slot-viewport");
    const track = reelEl.querySelector(".artist-slot-track");
    if (!viewport || !track) {
      return;
    }

    const order = buildArtistSequence(reelIndex * 9);
    const repeated = order.concat(order, order);
    const fragment = document.createDocumentFragment();

    repeated.forEach((name, itemIndex) => {
      const item = document.createElement("div");
      item.className = "artist-slot-name";
      if (itemIndex < order.length || itemIndex >= order.length * 2) {
        item.classList.add("is-ghost");
      }
      item.textContent = name;
      fragment.appendChild(item);
    });

    track.innerHTML = "";
    track.appendChild(fragment);

    const state = {
      reelEl,
      viewport,
      segmentHeight: 0,
      speed: 4.1,
      hoverSlow: false,
      pauseUntil: 0,
      dragActive: false,
      dragPointerId: null,
      dragStartY: 0,
      dragStartScrollTop: 0,
      removeListeners: []
    };

    const syncMeasurements = () => {
      state.segmentHeight = track.scrollHeight / 3;
      if (state.segmentHeight > 0) {
        viewport.scrollTop = state.segmentHeight;
      }
    };

    const pauseForInteraction = (duration = 240) => {
      state.pauseUntil = Date.now() + duration;
    };

    const onWheel = (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }
    };

    const onPointerEnter = (event) => {
      if (event.pointerType === "mouse") {
        state.hoverSlow = true;
        reelEl.classList.add("is-paused");
      }
    };

    const onPointerLeave = () => {
      state.hoverSlow = false;
      reelEl.classList.remove("is-paused");
    };

    const onPointerDown = (event) => {
      state.dragActive = true;
      state.dragPointerId = event.pointerId;
      state.dragStartY = event.clientY;
      state.dragStartScrollTop = viewport.scrollTop;
      pauseForInteraction(120);
      reelEl.classList.add("is-paused");
      reelEl.classList.add("is-dragging");
      if (typeof viewport.setPointerCapture === "function") {
        try {
          viewport.setPointerCapture(event.pointerId);
        } catch {
          // ignore capture failures
        }
      }
    };

    const onPointerMove = (event) => {
      if (!state.dragActive || state.dragPointerId !== event.pointerId) {
        return;
      }

      const deltaY = event.clientY - state.dragStartY;
      viewport.scrollTop = state.dragStartScrollTop - deltaY;
      normalizeLoopPosition(viewport, state.segmentHeight);

      if (event.cancelable) {
        event.preventDefault();
      }
    };

    const finishPointerDrag = (event) => {
      if (!state.dragActive || state.dragPointerId !== event.pointerId) {
        return;
      }
      state.dragActive = false;
      state.dragPointerId = null;
      pauseForInteraction(180);
      reelEl.classList.remove("is-paused");
      reelEl.classList.remove("is-dragging");
      if (typeof viewport.releasePointerCapture === "function") {
        try {
          viewport.releasePointerCapture(event.pointerId);
        } catch {
          // ignore capture failures
        }
      }
    };

    viewport.addEventListener("wheel", onWheel, { passive: false });
    viewport.addEventListener("pointerenter", onPointerEnter);
    viewport.addEventListener("pointerleave", onPointerLeave);
    viewport.addEventListener("pointerdown", onPointerDown);
    viewport.addEventListener("pointermove", onPointerMove);
    viewport.addEventListener("pointerup", finishPointerDrag);
    viewport.addEventListener("pointercancel", finishPointerDrag);
    viewport.addEventListener("focus", () => reelEl.classList.add("is-paused"));
    viewport.addEventListener("blur", () => reelEl.classList.remove("is-paused"));

    state.removeListeners.push(
      () => viewport.removeEventListener("wheel", onWheel),
      () => viewport.removeEventListener("pointerenter", onPointerEnter),
      () => viewport.removeEventListener("pointerleave", onPointerLeave),
      () => viewport.removeEventListener("pointerdown", onPointerDown),
      () => viewport.removeEventListener("pointermove", onPointerMove),
      () => viewport.removeEventListener("pointerup", finishPointerDrag),
      () => viewport.removeEventListener("pointercancel", finishPointerDrag)
    );

    reelStates.push(state);
    window.requestAnimationFrame(syncMeasurements);
  });

  const onResize = () => {
    reelStates.forEach((state) => {
      const track = state.viewport.querySelector(".artist-slot-track");
      if (!track) {
        return;
      }
      const currentRatio = state.segmentHeight > 0 ? state.viewport.scrollTop / state.segmentHeight : 1;
      state.segmentHeight = track.scrollHeight / 3;
      if (state.segmentHeight > 0) {
        state.viewport.scrollTop = state.segmentHeight * Math.min(1.5, Math.max(0.5, currentRatio));
        normalizeLoopPosition(state.viewport, state.segmentHeight);
      }
    });
  };

  const tick = (timestamp) => {
    if (destroyed) {
      return;
    }

    if (!tick.lastTs) {
      tick.lastTs = timestamp;
    }

    const dt = Math.max(0, (timestamp - tick.lastTs) / 1000);
    tick.lastTs = timestamp;
    const now = Date.now();

    reelStates.forEach((state) => {
      if (!state.segmentHeight) {
        return;
      }
      if (state.dragActive) {
        normalizeLoopPosition(state.viewport, state.segmentHeight);
        return;
      }
      let speedFactor = 1;
      if (now < state.pauseUntil) {
        speedFactor = 0;
      } else if (state.hoverSlow) {
        speedFactor = 0.22;
      }
      if (speedFactor > 0) {
        state.viewport.scrollTop += state.speed * speedFactor * dt * 18;
        normalizeLoopPosition(state.viewport, state.segmentHeight);
      }
    });

    rafId = window.requestAnimationFrame(tick);
  };

  window.addEventListener("resize", onResize);
  rafId = window.requestAnimationFrame(tick);

  window.__imagicoreArtistSlotCleanup = () => {
    destroyed = true;
    window.removeEventListener("resize", onResize);
    if (rafId) {
      window.cancelAnimationFrame(rafId);
    }
    reelStates.forEach((state) => {
      state.removeListeners.forEach((remove) => remove());
    });
    window.__imagicoreArtistSlotCleanup = null;
  };
};

const initImagicorePressMentions = () => {
  const rows = Array.from(document.querySelectorAll(".imagicore-press-mentions .press-float-row"));
  if (rows.length === 0) {
    return;
  }

  rows.forEach((row) => {
    const track = row.querySelector(".press-float-track");
    if (!track || track.dataset.loopReady === "1") {
      return;
    }
    track.dataset.loopReady = "1";
    track.innerHTML += track.innerHTML;
  });
};


const initImagicoreShowreelAudio = () => {
  const wrap = document.querySelector(".showreel-embed-wrap");
  if (!wrap) {
    return;
  }

  const frame = wrap.querySelector(".showreel-embed");
  const toggle = wrap.querySelector(".showreel-audio-toggle");
  if (!frame || !toggle) {
    return;
  }

  if (toggle.dataset.bound === "1") {
    return;
  }
  toggle.dataset.bound = "1";

  let soundOn = false;

  const iconMuted = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 5L6 9H3v6h3l5 4z"></path><line x1="16" y1="9" x2="21" y2="15"></line><line x1="21" y1="9" x2="16" y2="15"></line></svg>';
  const iconSound = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M11 5L6 9H3v6h3l5 4z"></path><path d="M15 9.5a4.5 4.5 0 0 1 0 5"></path><path d="M17.8 7a8 8 0 0 1 0 10"></path></svg>';

  const postToPlayer = (func, args = []) => {
    if (!frame.contentWindow) {
      return;
    }
    frame.contentWindow.postMessage(JSON.stringify({
      event: "command",
      func,
      args
    }), "*");
  };

  const syncLabel = () => {
    toggle.setAttribute("aria-pressed", soundOn ? "true" : "false");
    toggle.innerHTML = soundOn ? iconSound : iconMuted;
    toggle.setAttribute("aria-label", soundOn ? "Hang kikapcsolasa" : "Hang bekapcsolasa");
  };

  const enforceMutedStart = () => {
    postToPlayer("mute");
    postToPlayer("setVolume", [0]);
    postToPlayer("playVideo");
    soundOn = false;
    syncLabel();
  };

  frame.addEventListener("load", () => {
    window.setTimeout(enforceMutedStart, 140);
  });

  toggle.addEventListener("click", () => {
    if (soundOn) {
      postToPlayer("mute");
      postToPlayer("setVolume", [0]);
      soundOn = false;
    } else {
      postToPlayer("unMute");
      postToPlayer("setVolume", [70]);
      postToPlayer("playVideo");
      soundOn = true;
    }
    syncLabel();
  });

  syncLabel();
};
const initImagicoreStories = () => {
  const removePrevHandlers = () => {
    const prev = window.__imagicoreStoriesWindowHandlers;
    if (!prev) {
      return;
    }
    if (typeof prev.onMouseMove === "function") {
      window.removeEventListener("mousemove", prev.onMouseMove);
    }
    if (typeof prev.endMouseDrag === "function") {
      window.removeEventListener("mouseup", prev.endMouseDrag);
      window.removeEventListener("blur", prev.endMouseDrag);
    }
    if (typeof prev.onTouchMove === "function") {
      window.removeEventListener("touchmove", prev.onTouchMove);
    }
    if (typeof prev.endTouchDrag === "function") {
      window.removeEventListener("touchend", prev.endTouchDrag);
      window.removeEventListener("touchcancel", prev.endTouchDrag);
    }
    if (typeof prev.onKeydown === "function") {
      window.removeEventListener("keydown", prev.onKeydown);
    }
    window.__imagicoreStoriesWindowHandlers = null;
  };

  const storiesRoot = document.querySelector("[data-imagicore-stories]");
  const track = document.getElementById("imagicoreStoryTrack");
  const pager = document.getElementById("imagicoreStoriesPager");
  const gallerySection = document.getElementById("imagicore-gallery");

  if (!storiesRoot || !track) {
    removePrevHandlers();
    window.__imagicoreStoriesRoot = null;
    return;
  }

  if (storiesRoot.dataset.bound === "1") {
    return;
  }

  if (window.__imagicoreStoriesRoot && window.__imagicoreStoriesRoot !== storiesRoot) {
    removePrevHandlers();
  }
  window.__imagicoreStoriesRoot = storiesRoot;
  storiesRoot.dataset.bound = "1";

  const prevBtn = storiesRoot.querySelector(".stories-nav.prev");
  const nextBtn = storiesRoot.querySelector(".stories-nav.next");

  const syncStoryRailState = (count) => {
    const hasStories = count > 0;
    if (gallerySection) {
      gallerySection.hidden = !hasStories;
    }
    if (prevBtn) {
      prevBtn.hidden = !hasStories || count <= 1;
    }
    if (nextBtn) {
      nextBtn.hidden = !hasStories || count <= 1;
    }
    if (pager) {
      pager.hidden = !hasStories || count <= 1;
    }
  };
  const ensureStoryModal = () => {
    let modalEl = document.getElementById("imagicoreStoryModal");
    if (!modalEl) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML =
        '<div class="story-modal" id="imagicoreStoryModal" hidden>' +
          '<div class="story-modal-backdrop" aria-hidden="true"></div>' +
          '<div class="story-modal-dialog" role="dialog" aria-modal="true" aria-label="ImagiCORE sztori">' +
            '<div class="story-modal-topbar"><span class="story-modal-progress" id="imagicoreStoryModalProgress"></span></div>' +
            '<button type="button" class="story-modal-close" data-story-close aria-label="Bezaras">&times;</button>' +
            '<button type="button" class="story-modal-nav prev" aria-label="Elozo">&#8249;</button>' +
            '<figure class="story-modal-figure">' +
              '<img id="imagicoreStoryModalImage" src="" alt="" />' +
              '<figcaption id="imagicoreStoryModalCaption"></figcaption>' +
            '</figure>' +
            '<button type="button" class="story-modal-nav next" aria-label="Kovetkezo">&#8250;</button>' +
          '</div>' +
        '</div>';
      modalEl = wrapper.firstElementChild;
      if (modalEl) {
        document.body.appendChild(modalEl);
      }
    }
    return modalEl;
  };

  const modal = ensureStoryModal();
  const modalFigure = modal ? modal.querySelector(".story-modal-figure") : null;
  const modalImage = document.getElementById("imagicoreStoryModalImage");
  const modalCaption = document.getElementById("imagicoreStoryModalCaption");
  const modalProgress = document.getElementById("imagicoreStoryModalProgress");
  const modalClose = modal ? modal.querySelector("[data-story-close]") : null;
  const modalPrev = modal ? modal.querySelector(".story-modal-nav.prev") : null;
  const modalNext = modal ? modal.querySelector(".story-modal-nav.next") : null;
  const modalBackdrop = modal ? modal.querySelector(".story-modal-backdrop") : null;

  const FACEBOOK_URL = "https://www.facebook.com/imagicore/";
  const LOGO_SRC = "/assets/images/imagicore/ic logo black white.svg";
  const STORY_DURATION_MS = 4800;
  const STORY_SWIPE_THRESHOLD = 36;
  const STORY_A11Y_LABEL = "ImagiCORE sztori";

  let stories = [];
  let activeIndex = -1;
  let timerId = null;

  const clearStoryTimer = () => {
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = null;
    }
  };

  const startProgress = () => {
    if (!modalProgress) {
      return;
    }
    modalProgress.style.transition = "none";
    modalProgress.style.width = "0%";
    window.requestAnimationFrame(() => {
      modalProgress.style.transition = "width " + STORY_DURATION_MS + "ms linear";
      modalProgress.style.width = "100%";
    });
  };

  const closeModal = () => {
    clearStoryTimer();
    if (!modal) {
      return;
    }
    modal.hidden = true;
    modal.classList.remove("is-open");
    document.body.classList.remove("story-modal-open");
    activeIndex = -1;
  };

  const showStory = (index, restartProgress = true) => {
    if (!modal || !modalImage || !modalCaption) {
      return;
    }
    if (!Array.isArray(stories) || stories.length === 0) {
      return;
    }
    if (index < 0) {
      index = 0;
    }
    if (index >= stories.length) {
      closeModal();
      return;
    }

    activeIndex = index;
    const story = stories[index];
    modalImage.src = normalizeBtsSrc(story.src);
    modalImage.alt = STORY_A11Y_LABEL;
    modalCaption.textContent = "";
    modal.hidden = false;
    modal.classList.add("is-open");
    document.body.classList.add("story-modal-open");

    clearStoryTimer();
    if (restartProgress) {
      startProgress();
    }
    timerId = window.setTimeout(() => {
      showStory(activeIndex + 1, true);
    }, STORY_DURATION_MS);
  };

  const updatePagerActive = () => {
    if (!pager || stories.length === 0) {
      return;
    }
    const dots = Array.from(pager.querySelectorAll(".stories-dot"));
    if (dots.length === 0) {
      return;
    }
    const first = track.querySelector(".story-item");
    const step = first ? Math.max(first.clientWidth + 12, 176) : 188;
    const idx = Math.max(0, Math.min(stories.length - 1, Math.round(track.scrollLeft / Math.max(1, step))));
    dots.forEach((dot, dotIdx) => dot.classList.toggle("is-active", dotIdx === idx));
  };

  const render = (items) => {
    stories = items.slice();
    syncStoryRailState(stories.length);
    track.innerHTML = "";

    stories.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "story-item";

      const media = document.createElement("div");
      media.className = "story-media";

      const openBtn = document.createElement("button");
      openBtn.type = "button";
      openBtn.className = "story-open";
      openBtn.setAttribute("data-story-index", String(index));
      openBtn.setAttribute("aria-label", `${STORY_A11Y_LABEL} megnyitasa`);

      const cover = document.createElement("img");
      cover.className = "story-cover";
      cover.loading = "lazy";
      cover.src = normalizeBtsSrc(item.src);
      cover.alt = STORY_A11Y_LABEL;
      cover.draggable = false;

      const avatarLink = document.createElement("a");
      avatarLink.className = "story-avatar-link";
      avatarLink.href = FACEBOOK_URL;
      avatarLink.target = "_blank";
      avatarLink.rel = "noopener noreferrer";
      avatarLink.setAttribute("aria-label", "ImagiCORE Facebook oldal");

      const avatar = document.createElement("img");
      avatar.className = "story-avatar-logo";
      avatar.loading = "lazy";
      avatar.src = LOGO_SRC;
      avatar.alt = "ImagiCORE";
      avatar.draggable = false;
      avatarLink.appendChild(avatar);

      openBtn.appendChild(cover);
      media.appendChild(openBtn);
      media.appendChild(avatarLink);
      card.appendChild(media);
      track.appendChild(card);
    });

    if (pager) {
      pager.innerHTML = "";
      stories.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "stories-dot";
        dot.setAttribute("aria-label", "Sztori " + (idx + 1));
        dot.addEventListener("click", () => {
          const first = track.querySelector(".story-item");
          const step = first ? Math.max(first.clientWidth + 12, 176) : 188;
          track.scrollTo({ left: step * idx, behavior: "smooth" });
          updatePagerActive();
        });
        pager.appendChild(dot);
      });
    }
    updatePagerActive();
  };

  const getStep = () => {
    const first = track.querySelector(".story-item");
    return first ? Math.max(first.clientWidth + 12, 176) : 188;
  };

  const scrollByStep = (direction) => {
    track.scrollBy({ left: direction * getStep(), behavior: "smooth" });
  };

  if (prevBtn) {
    prevBtn.addEventListener("click", () => scrollByStep(-1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => scrollByStep(1));
  }

  let autoRaf = 0;
  let autoPaused = false;
  let lastTick = 0;
  const AUTO_PX_PER_SEC = 9;

  let isDragging = false;
  let mouseDown = false;
  let suppressClickUntil = 0;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let dragDistance = 0;
  let pendingOpenIndex = -1;
  let touchDragging = false;
  let touchIdentifier = null;
  let touchStartX = 0;
  let touchStartY = 0;
  let modalTouchIdentifier = null;
  let modalTouchStartX = 0;
  let modalTouchStartY = 0;
  let modalTouchMoved = false;

  const setDragActive = (active) => {
    isDragging = active;
    touchDragging = active;
    track.classList.toggle("is-grabbing", active);
  };

  const stopAutoScroll = () => {
    if (autoRaf) {
      window.cancelAnimationFrame(autoRaf);
      autoRaf = 0;
    }
  };

  const startAutoScroll = () => {
    stopAutoScroll();
    lastTick = 0;
    const tick = (ts) => {
      if (!lastTick) {
        lastTick = ts;
      }
      const dt = Math.max(0, (ts - lastTick) / 1000);
      lastTick = ts;
      const max = Math.max(0, track.scrollWidth - track.clientWidth);
      if (!autoPaused && !isDragging && max > 0 && (!modal || modal.hidden)) {
        const nextLeft = track.scrollLeft + AUTO_PX_PER_SEC * dt;
        if (nextLeft >= max - 1) {
          track.scrollLeft = max;
          autoPaused = true;
        } else {
          track.scrollLeft = nextLeft;
        }
        updatePagerActive();
      }
      autoRaf = window.requestAnimationFrame(tick);
    };
    autoRaf = window.requestAnimationFrame(tick);
  };

  const onMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }
    const avatarLink = event.target && event.target.closest ? event.target.closest(".story-avatar-link") : null;
    if (avatarLink) {
      pendingOpenIndex = -1;
      return;
    }

    const openBtn = event.target && event.target.closest ? event.target.closest(".story-open") : null;
    if (openBtn) {
      const idxRaw = Number(openBtn.getAttribute("data-story-index"));
      pendingOpenIndex = Number.isFinite(idxRaw) ? idxRaw : -1;
    } else {
      pendingOpenIndex = -1;
    }

    mouseDown = true;
    setDragActive(false);
    autoPaused = true;
    dragStartX = event.clientX;
    dragStartScroll = track.scrollLeft;
    dragDistance = 0;
  };

  const onMouseMove = (event) => {
    if (!mouseDown) {
      return;
    }
    const dx = event.clientX - dragStartX;
    dragDistance = Math.max(dragDistance, Math.abs(dx));

    if (!isDragging && dragDistance > 6) {
      setDragActive(true);
    }
    if (!isDragging) {
      return;
    }

    track.scrollLeft = dragStartScroll - dx;
    updatePagerActive();
    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const endMouseDrag = () => {
    if (!mouseDown) {
      return;
    }

    const moved = isDragging;
    mouseDown = false;
    setDragActive(false);
    autoPaused = false;

    if (moved) {
      suppressClickUntil = Date.now() + 220;
      pendingOpenIndex = -1;
    } else if (pendingOpenIndex >= 0) {
      showStory(pendingOpenIndex, true);
      suppressClickUntil = Date.now() + 260;
      pendingOpenIndex = -1;
    }
  };

  const onTouchStart = (event) => {
    if (!event.touches || event.touches.length === 0) {
      return;
    }
    const avatarLink = event.target && event.target.closest ? event.target.closest(".story-avatar-link") : null;
    if (avatarLink) {
      pendingOpenIndex = -1;
      return;
    }

    const touch = event.changedTouches[0];
    const openBtn = event.target && event.target.closest ? event.target.closest(".story-open") : null;
    if (openBtn) {
      const idxRaw = Number(openBtn.getAttribute("data-story-index"));
      pendingOpenIndex = Number.isFinite(idxRaw) ? idxRaw : -1;
    } else {
      pendingOpenIndex = -1;
    }

    touchIdentifier = touch.identifier;
    dragStartX = touch.clientX;
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    dragStartScroll = track.scrollLeft;
    dragDistance = 0;
    autoPaused = true;
    setDragActive(false);
  };

  const onTouchMove = (event) => {
    if (touchIdentifier === null) {
      return;
    }
    const touch = Array.from(event.changedTouches || []).find((item) => item.identifier === touchIdentifier);
    if (!touch) {
      return;
    }

    const dx = touch.clientX - dragStartX;
    const dy = touch.clientY - touchStartY;

    if (!touchDragging) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
        touchIdentifier = null;
        pendingOpenIndex = -1;
        autoPaused = false;
        return;
      }
      if (Math.abs(dx) > 8) {
        setDragActive(true);
      }
    }

    dragDistance = Math.max(dragDistance, Math.abs(dx));
    if (!touchDragging) {
      return;
    }

    track.scrollLeft = dragStartScroll - dx;
    updatePagerActive();
    if (event.cancelable) {
      event.preventDefault();
    }
  };

  const endTouchDrag = (event) => {
    if (touchIdentifier === null && !touchDragging) {
      return;
    }

    const touch = Array.from(event.changedTouches || []).find((item) => item.identifier === touchIdentifier);
    if (!touch && touchIdentifier !== null) {
      return;
    }

    const moved = touchDragging || dragDistance > 8;
    touchIdentifier = null;
    setDragActive(false);
    autoPaused = false;

    if (moved) {
      suppressClickUntil = Date.now() + 280;
      pendingOpenIndex = -1;
      return;
    }

    if (pendingOpenIndex >= 0) {
      showStory(pendingOpenIndex, true);
      suppressClickUntil = Date.now() + 320;
      pendingOpenIndex = -1;
    }
  };

  const goToPreviousStory = () => {
    showStory(activeIndex <= 0 ? 0 : activeIndex - 1, true);
  };

  const goToNextStory = () => {
    showStory(activeIndex + 1, true);
  };

  const handleModalTap = (clientX, targetEl) => {
    if (!modal || modal.hidden || !modalFigure || !targetEl) {
      return false;
    }

    const interactiveTarget = targetEl.closest
      ? targetEl.closest(".story-modal-close, .story-modal-nav")
      : null;
    if (interactiveTarget) {
      return false;
    }

    const rect = modalFigure.getBoundingClientRect();
    if (!rect.width || clientX < rect.left || clientX > rect.right) {
      return false;
    }

    const relativeX = (clientX - rect.left) / rect.width;
    if (relativeX <= 0.35) {
      goToPreviousStory();
      return true;
    }
    if (relativeX >= 0.65) {
      goToNextStory();
      return true;
    }
    return false;
  };

  const ensureModalTapZones = () => {
    if (!modalFigure) {
      return;
    }

    const hasZones = modalFigure.querySelector(".story-modal-tap-zone");
    if (hasZones) {
      return;
    }

    const prevZone = document.createElement("button");
    prevZone.type = "button";
    prevZone.className = "story-modal-tap-zone prev";
    prevZone.setAttribute("aria-label", "Elozo sztori");

    const nextZone = document.createElement("button");
    nextZone.type = "button";
    nextZone.className = "story-modal-tap-zone next";
    nextZone.setAttribute("aria-label", "Kovetkezo sztori");

    modalFigure.appendChild(prevZone);
    modalFigure.appendChild(nextZone);

    prevZone.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      goToPreviousStory();
    });
    nextZone.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      goToNextStory();
    });
  };

  track.addEventListener("mousedown", onMouseDown);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", endMouseDrag);
  window.addEventListener("blur", endMouseDrag);
  track.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", endTouchDrag, { passive: true });
  window.addEventListener("touchcancel", endTouchDrag, { passive: true });

  track.addEventListener("scroll", updatePagerActive, { passive: true });
  track.addEventListener("click", (event) => {
    const avatarLink = event.target && event.target.closest ? event.target.closest(".story-avatar-link") : null;
    if (avatarLink) {
      return;
    }
    if (Date.now() < suppressClickUntil) {
      return;
    }
    const openBtn = event.target && event.target.closest ? event.target.closest(".story-open") : null;
    if (!openBtn) {
      return;
    }
    const idxRaw = Number(openBtn.getAttribute("data-story-index"));
    const idx = Number.isFinite(idxRaw) ? idxRaw : Array.from(track.querySelectorAll(".story-open")).indexOf(openBtn);
    if (idx >= 0) {
      showStory(idx, true);
      suppressClickUntil = Date.now() + 120;
    }
  });

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeModal);
  }
  if (modalPrev) {
    modalPrev.addEventListener("click", goToPreviousStory);
  }
  if (modalNext) {
    modalNext.addEventListener("click", goToNextStory);
  }
  ensureModalTapZones();
  if (modalFigure) {
    modalFigure.addEventListener("touchstart", (event) => {
      if (!event.touches || event.touches.length === 0) {
        return;
      }
      const touch = event.changedTouches[0];
      modalTouchIdentifier = touch.identifier;
      modalTouchStartX = touch.clientX;
      modalTouchStartY = touch.clientY;
      modalTouchMoved = false;
    }, { passive: true });
    modalFigure.addEventListener("touchmove", (event) => {
      if (modalTouchIdentifier === null) {
        return;
      }
      const touch = Array.from(event.changedTouches || []).find((item) => item.identifier === modalTouchIdentifier);
      if (!touch) {
        return;
      }
      if (
        Math.abs(touch.clientX - modalTouchStartX) > 10 ||
        Math.abs(touch.clientY - modalTouchStartY) > 10
      ) {
        modalTouchMoved = true;
      }
    }, { passive: true });
    modalFigure.addEventListener("touchend", (event) => {
      if (modalTouchIdentifier === null) {
        return;
      }
      const touch = Array.from(event.changedTouches || []).find((item) => item.identifier === modalTouchIdentifier);
      if (!touch) {
        return;
      }
      const deltaX = touch.clientX - modalTouchStartX;
      const deltaY = touch.clientY - modalTouchStartY;
      if (Math.abs(deltaX) >= STORY_SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          goToNextStory();
        } else {
          goToPreviousStory();
        }
      } else if (!modalTouchMoved) {
        handleModalTap(touch.clientX, event.target);
      }
      modalTouchIdentifier = null;
      modalTouchMoved = false;
    }, { passive: true });
    modalFigure.addEventListener("touchcancel", () => {
      modalTouchIdentifier = null;
      modalTouchMoved = false;
    }, { passive: true });
  }

  const onKeydown = (event) => {
    if (!modal || modal.hidden) {
      return;
    }
    if (event.key === "Escape") {
      closeModal();
      return;
    }
    if (event.key === "ArrowRight") {
      goToNextStory();
      return;
    }
    if (event.key === "ArrowLeft") {
      goToPreviousStory();
    }
  };
  window.addEventListener("keydown", onKeydown);

  window.__imagicoreStoriesWindowHandlers = { onMouseMove, endMouseDrag, onTouchMove, endTouchDrag, onKeydown };

  const emergencyItems = Array.from({ length: 14 }, (_, i) => ({
    src: "/assets/images/imagicore/bts/" + String(14 - i) + ".webp",
    alt: STORY_A11Y_LABEL
  }));
  const existingItems = getExistingBtsItems(track);
  render(existingItems.length > 0 ? existingItems : emergencyItems);
  startAutoScroll();
  storiesRoot.hidden = false;

  loadBtsItems(existingItems).then((items) => {
    if (!items || items.length === 0) {
      if (existingItems.length === 0) {
        render([]);
      }
      return;
    }
    render(items);
  }).catch(() => {
    if (existingItems.length === 0) {
      render([]);
    }
  });
};
const initPageDynamicEffects = () => {
  const prevCleanup = window.__dsDynamicCleanup;
  if (typeof prevCleanup === "function") {
    prevCleanup();
  }

  const cleaners = [];
  const addCleaner = (fn) => {
    if (typeof fn === "function") {
      cleaners.push(fn);
    }
  };

  const treasureLayer = document.querySelector(".treasure-parallax");
  const treasurePaper = treasureLayer ? treasureLayer.querySelector(".map-paper") : null;
  const treasureFront2 = treasureLayer ? treasureLayer.querySelector(".map-front-layer-2") : null;
  const treasureFront3 = treasureLayer ? treasureLayer.querySelector(".map-front-layer-3") : null;
  const treasureRoute = treasureLayer ? treasureLayer.querySelector(".treasure-route") : null;
  const treasurePath = document.getElementById("treasurePath");
  const treasureMarker = document.getElementById("treasureMarker");
  const treasureX = document.getElementById("treasureX");
  const treasureGold = document.getElementById("treasureGold");

  if (treasureLayer) {
    const hasRoute = Boolean(treasurePath && treasureMarker);
    const totalLength = hasRoute ? treasurePath.getTotalLength() : 0;
    if (hasRoute) {
      treasurePath.style.strokeDasharray = `0 ${totalLength}`;
    }

    let tickingTreasure = false;

    const updateTreasureMap = () => {
      const doc = document.documentElement;
      const scrollMax = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / scrollMax));

      if (hasRoute) {
        const reveal = Math.max(1, totalLength * p);
        treasurePath.style.strokeDasharray = `${reveal} ${totalLength}`;
        treasurePath.style.opacity = `${0.35 + p * 0.65}`;

        const markerPoint = treasurePath.getPointAtLength(reveal);
        const wobbleX = Math.sin(p * 24) * 7;
        const wobbleY = Math.cos(p * 18) * 4;
        treasureMarker.setAttribute("transform", `translate(${markerPoint.x + wobbleX} ${markerPoint.y + wobbleY})`);

        if (treasureX && treasureGold) {
          const glow = 0.38 + p * 0.62;
          treasureX.style.opacity = `${glow}`;
          treasureGold.style.opacity = `${Math.max(0.28, glow - 0.1)}`;
        }
      }

      if (treasurePaper) {
        const paperOffset = Math.round(window.scrollY * -0.13);
        treasurePaper.style.transform = "none";
        treasurePaper.style.backgroundPosition = `center ${paperOffset}px`;
      }
      if (treasureFront2) {
        const front2Offset = Math.round(window.scrollY * 0.11);
        treasureFront2.style.transform = "none";
        treasureFront2.style.backgroundPosition = `center ${front2Offset}px`;
      }
      if (treasureRoute) {
        treasureRoute.style.transform = `translate3d(0, ${Math.round(window.scrollY * -0.14)}px, 0)`;
      }
      if (treasureFront3) {
        const front3Offset = Math.round(window.scrollY * 0.2);
        treasureFront3.style.transform = "none";
        treasureFront3.style.backgroundPosition = `center ${front3Offset}px`;
      }

      tickingTreasure = false;
    };

    const onTreasureScroll = () => {
      if (!tickingTreasure) {
        window.requestAnimationFrame(updateTreasureMap);
        tickingTreasure = true;
      }
    };

    window.addEventListener("scroll", onTreasureScroll, { passive: true });
    window.addEventListener("resize", onTreasureScroll);
    addCleaner(() => {
      window.removeEventListener("scroll", onTreasureScroll);
      window.removeEventListener("resize", onTreasureScroll);
    });

    updateTreasureMap();
  }

  const compassOrb = document.querySelector(".compass-orb");
  const compassNeedle = document.querySelector(".compass-needle");

  if (compassOrb && compassNeedle) {
    const seriesPanel = document.querySelector(".arany-series");
    if (seriesPanel && compassOrb.parentElement !== seriesPanel) {
      seriesPanel.appendChild(compassOrb);
    }

    let mouseX = window.innerWidth * 0.5;
    let mouseY = window.innerHeight * 0.35;
    let rafId = null;

    const updateCompass = () => {
      const rect = compassOrb.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = mouseX - cx;
      const dy = mouseY - cy;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

      compassNeedle.style.transform = `rotate(${angle}deg)`;
      rafId = window.requestAnimationFrame(updateCompass);
    };

    const onMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const onTouchMove = (event) => {
      const t = event.touches && event.touches[0];
      if (!t) {
        return;
      }
      mouseX = t.clientX;
      mouseY = t.clientY;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    addCleaner(() => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    });

    updateCompass();
  }

  const headingStrip = document.querySelector(".af-runic-divider");

  if (headingStrip) {
    let pointerX = window.innerWidth * 0.5;
    let currentX = pointerX;
    let targetShift = 0;
    let currentShift = 0;
    let rafHeading = null;

    const setHeadingData = () => {
      const rect = headingStrip.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (currentX - rect.left) / Math.max(1, rect.width)));
      const degree = Math.round(ratio * 360);
      const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
      const dir = dirs[Math.round((degree % 360) / 45) % dirs.length];
      headingStrip.dataset.heading = `${dir} ${String(degree).padStart(3, "0")}${String.fromCharCode(176)}`;
      headingStrip.style.setProperty("--af-heading-x", `${(ratio * 100).toFixed(2)}%`);
      headingStrip.style.setProperty("--af-heading-shift", `${currentShift.toFixed(1)}px`);
    };

    const updateHeadingStrip = () => {
      currentX += (pointerX - currentX) * 0.14;
      currentShift += (targetShift - currentShift) * 0.12;
      setHeadingData();
      rafHeading = window.requestAnimationFrame(updateHeadingStrip);
    };

    const onHeadingMove = (event) => {
      pointerX = event.clientX;
      targetShift = (event.clientX - window.innerWidth * 0.5) * 0.08;
    };

    const onHeadingTouchMove = (event) => {
      const t = event.touches && event.touches[0];
      if (!t) {
        return;
      }
      pointerX = t.clientX;
      targetShift = (t.clientX - window.innerWidth * 0.5) * 0.08;
    };

    window.addEventListener("pointermove", onHeadingMove, { passive: true });
    window.addEventListener("mousemove", onHeadingMove, { passive: true });
    window.addEventListener("touchmove", onHeadingTouchMove, { passive: true });
    addCleaner(() => {
      window.removeEventListener("pointermove", onHeadingMove);
      window.removeEventListener("mousemove", onHeadingMove);
      window.removeEventListener("touchmove", onHeadingTouchMove);
      if (rafHeading) {
        window.cancelAnimationFrame(rafHeading);
      }
    });

    updateHeadingStrip();
  }

  window.__dsDynamicCleanup = () => {
    cleaners.forEach((fn) => {
      try {
        fn();
      } catch {
        // ignore cleanup errors
      }
    });
    window.__dsDynamicCleanup = null;
  };
};

initPageDynamicEffects();

const initLatestYoutubeWidgets = () => {
  const widgets = Array.from(document.querySelectorAll(".af-youtube-widget"));
  const body = document.body;
  if (!body || widgets.length === 0) {
    return;
  }

  const rawHandle = String(body.dataset.ytHandle || "").trim();
  const handle = rawHandle.replace(/^@/, "");
  const channelId = String(body.dataset.ytChannelId || "").trim();
  const latestVideoId = String(body.dataset.ytLatestVideoId || "").trim();
  const uploadsPlaylistId = /^UC[\w-]+$/.test(channelId) ? `UU${channelId.slice(2)}` : "";
  const channelUrl = handle
    ? `https://www.youtube.com/@${handle}`
    : channelId
      ? `https://www.youtube.com/channel/${channelId}`
      : "https://www.youtube.com/";

  let embedSrc = "";
  let latestHref = channelUrl;
  let statusText = "Mindig a legfrissebb felt\u00F6lt\u00E9s a csatorn\u00E1r\u00F3l.";

  if (/^[\w-]{11}$/.test(latestVideoId)) {
    embedSrc = `https://www.youtube.com/embed/${encodeURIComponent(latestVideoId)}?rel=0&modestbranding=1&playsinline=1`;
    latestHref = `https://www.youtube.com/watch?v=${encodeURIComponent(latestVideoId)}`;
    statusText = "A legfrissebb publikus felt\u00F6lt\u00E9s a csatorn\u00E1r\u00F3l.";
  } else if (uploadsPlaylistId) {
    embedSrc = `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(uploadsPlaylistId)}&rel=0&modestbranding=1&playsinline=1`;
  } else if (handle) {
    embedSrc = `https://www.youtube.com/embed?listType=user_uploads&list=${encodeURIComponent(handle)}&rel=0&modestbranding=1&playsinline=1`;
  }

  if (!embedSrc) {
    return;
  }

  widgets.forEach((widget, index) => {
    const frameWrap = widget.querySelector(".af-youtube-widget__frame-wrap");
    const status = widget.querySelector(".af-youtube-widget__status");
    const actionLink = widget.querySelector(".af-youtube-widget__header .btn");
    const coverLink = frameWrap ? frameWrap.querySelector(".af-youtube-widget__cover-link") : null;
    if (!frameWrap) {
      return;
    }

    if (actionLink) {
      actionLink.href = latestHref;
    }
    if (coverLink) {
      coverLink.href = latestHref;
      coverLink.setAttribute("aria-label", "Legfrissebb YouTube vide\u00F3 megnyit\u00E1sa");
    }

    let frame = frameWrap.querySelector("iframe");
    if (!frame) {
      frameWrap.innerHTML = "";
      frame = document.createElement("iframe");
      frame.id = widget.id ? `${widget.id}LatestVideoFrame` : `latestVideoFrame${index}`;
      frame.title = `${document.title} YouTube vide\u00F3k`;
      frame.loading = "lazy";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.allowFullscreen = true;
      frameWrap.appendChild(frame);
    }

    frame.src = embedSrc;

    if (status) {
      status.textContent = statusText;
    }
  });
};

initLatestYoutubeWidgets();

const initInlineYoutubeCards = () => {
  const cards = Array.from(document.querySelectorAll("[data-inline-video]"));

  if (cards.length === 0) {
    return;
  }

  const activateCard = (card) => {
    if (!card || card.dataset.videoLoaded === "true") {
      return;
    }

    const videoId = String(card.dataset.videoId || "").trim();
    const videoTitle = String(card.dataset.videoTitle || document.title).trim();

    if (!/^[\w-]{11}$/.test(videoId)) {
      return;
    }

    card.dataset.videoLoaded = "true";
    card.classList.add("is-playing");
    card.innerHTML = "";

    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
    frame.title = videoTitle;
    frame.loading = "lazy";
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    frame.allowFullscreen = true;
    card.appendChild(frame);
  };

  cards.forEach((card) => {
    const trigger = card.querySelector(".ds-feature-media__launch");
    if (!trigger) {
      return;
    }

    trigger.addEventListener("click", () => activateCard(card));
  });
};

initInlineYoutubeCards();
(() => {
  const cards = Array.from(document.querySelectorAll("[data-project-card]"));

  if (cards.length === 0) {
    return;
  }

  const closeCard = (card) => {
    const trigger = card.querySelector("[data-project-toggle]");
    const details = card.querySelector("[data-project-details]");

    card.classList.remove("is-open");
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }
    if (details) {
      details.hidden = true;
    }
  };

  const openCard = (card, options = {}) => {
    const trigger = card.querySelector("[data-project-toggle]");
    const details = card.querySelector("[data-project-details]");
    const shouldScroll = Boolean(options.scroll);

    if (!trigger || !details) {
      return;
    }

    cards.forEach((item) => {
      if (item !== card) {
        closeCard(item);
      }
    });

    card.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    details.hidden = false;

    if (shouldScroll && window.matchMedia("(max-width: 900px)").matches) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  cards.forEach((card) => {
    const trigger = card.querySelector("[data-project-toggle]");
    const details = card.querySelector("[data-project-details]");

    if (!trigger || !details) {
      return;
    }

    closeCard(card);

    trigger.addEventListener("click", () => {
      const willOpen = !card.classList.contains("is-open");
      cards.forEach(closeCard);
      if (willOpen) {
        openCard(card, { scroll: true });
      }
    });
  });
})();

(() => {
  document.documentElement.classList.add("js-nav");

  const topbar = document.querySelector(".topbar");
  const nav = topbar ? topbar.querySelector("nav") : null;

  let routeProgress = null;
  let routeProgressTimer = null;

  const ensureRouteProgress = () => {
    if (routeProgress) {
      return routeProgress;
    }
    routeProgress = document.getElementById("routeProgress");
    if (routeProgress) {
      return routeProgress;
    }
    routeProgress = document.createElement("div");
    routeProgress.id = "routeProgress";
    routeProgress.className = "route-progress";
    document.body.appendChild(routeProgress);
    return routeProgress;
  };

  const startRouteProgress = () => {
    const bar = ensureRouteProgress();
    if (!bar) {
      return;
    }

    if (routeProgressTimer) {
      window.clearTimeout(routeProgressTimer);
      routeProgressTimer = null;
    }

    bar.classList.remove("is-done");
    bar.classList.add("is-active");
  };

  const finishRouteProgress = () => {
    const bar = ensureRouteProgress();
    if (!bar) {
      return;
    }

    bar.classList.add("is-done");
    routeProgressTimer = window.setTimeout(() => {
      bar.classList.remove("is-active", "is-done");
      routeProgressTimer = null;
    }, 320);
  };

  const setPageReady = () => {
    if (!document.body) {
      return;
    }
    document.body.classList.add("page-ready");
    document.body.classList.remove("page-leaving");
  };

  const closeMobileMenu = () => {
    if (!topbar) {
      return;
    }
    topbar.classList.remove("menu-open");
    document.body.classList.remove("mobile-menu-open");
    const toggle = topbar.querySelector(".topbar-menu-toggle");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    }
  };

  const normalizePath = (pathname) => String(pathname || "/").replace(/\/+$/, "") || "/";
  const getLocationKey = (urlLike) => {
    const url = new URL(urlLike, window.location.href);
    return `${normalizePath(url.pathname)}${url.search}`;
  };
  let currentLocationKey = getLocationKey(window.location.href);

  const shouldMarkYoutubeActive = (path) => {
    const p = normalizePath(path).toLowerCase();
    return p.endsWith("/youtube") || p.includes("/daniel-simon-channel") || p.includes("/aranyasokfelsofokon");
  };

  const syncActiveNav = (urlLike) => {
    if (!nav) {
      return;
    }

    const current = new URL(urlLike, window.location.href);
    const currentPath = normalizePath(current.pathname);
    const youtubeActive = shouldMarkYoutubeActive(currentPath);

    nav.querySelectorAll("a.active").forEach((a) => a.classList.remove("active"));

    nav.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      let target;
      try {
        target = new URL(a.href, window.location.href);
      } catch {
        return;
      }

      const targetPath = normalizePath(target.pathname);

      if (youtubeActive && shouldMarkYoutubeActive(targetPath)) {
        a.classList.add("active");
        return;
      }

      if (targetPath === currentPath) {
        a.classList.add("active");
      }
    });
  };

  const refreshBasicUi = (urlLike) => {
    const yearEl = document.getElementById("year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
    syncActiveNav(urlLike);
    closeMobileMenu();
    initRevealObserver();
    initAboutTimeline();
    initGenericParallax();
    initRandomBlobWander();
    initImagicoreForm();
    initImagicoreShowreelAudio();
    initImagicoreStories();
    initCountUpMetrics();
    initImagicoreArtistSlot();
    initImagicorePressMentions();
    initPageDynamicEffects();
  };

  const getStylesheetSet = (doc) => {
    const baseUrl = window.location.origin;
    return Array.from(doc.querySelectorAll('head link[rel="stylesheet"][href]'))
      .map((link) => {
        try {
          return new URL(link.getAttribute("href"), baseUrl).href;
        } catch {
          return "";
        }
      })
      .filter(Boolean);
  };

  const hasSameStylesheetSet = (nextDoc) => {
    const currentSet = getStylesheetSet(document);
    const nextSet = getStylesheetSet(nextDoc);
    if (currentSet.length !== nextSet.length) {
      return false;
    }
    return currentSet.every((href, index) => href === nextSet[index]);
  };

  const scrollToHashTarget = (hash, behavior = "smooth", updateUrl = true) => {
    const rawId = String(hash || "").replace(/^#/, "").trim();
    if (!rawId) {
      return false;
    }

    let targetId = rawId;
    try {
      targetId = decodeURIComponent(rawId);
    } catch {
      targetId = rawId;
    }

    const target = document.getElementById(targetId);
    if (!target) {
      return false;
    }

    const prefersReducedMotion = Boolean(
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );

    target.scrollIntoView({
      behavior: behavior === "smooth" && !prefersReducedMotion ? "smooth" : "auto",
      block: "start"
    });

    if (updateUrl) {
      const baseUrl = `${window.location.pathname}${window.location.search}`;
      window.history.replaceState(window.history.state, "", `${baseUrl}#${encodeURIComponent(targetId)}`);
    }

    return true;
  };

  const isManagedNavLink = (anchor, event) => {
    if (!anchor || !anchor.href || !nav) {
      return false;
    }

    if (!nav.contains(anchor)) {
      return false;
    }

    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)) {
      return false;
    }

    if (anchor.hasAttribute("download")) {
      return false;
    }

    if (anchor.target && anchor.target.toLowerCase() === "_blank") {
      return false;
    }

    const hrefAttr = anchor.getAttribute("href") || "";
    if (!hrefAttr || hrefAttr.startsWith("#") || hrefAttr.startsWith("mailto:") || hrefAttr.startsWith("tel:")) {
      return false;
    }

    let url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      return false;
    }

    if (url.origin !== window.location.origin) {
      return false;
    }

    return normalizePath(url.pathname) !== normalizePath(window.location.pathname) || url.search !== window.location.search;
  };

  const swapMain = async (targetUrl, replaceState = false) => {
    startRouteProgress();
    try {
      const res = await fetch(targetUrl, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const html = await res.text();
      const parser = new DOMParser();
      const nextDoc = parser.parseFromString(html, "text/html");

      if (!hasSameStylesheetSet(nextDoc)) {
        window.location.href = targetUrl;
        return;
      }

      const nextMain = nextDoc.querySelector("main");
      const currentMain = document.querySelector("main");

      if (!nextMain || !currentMain) {
        throw new Error("Missing <main> on target or current page.");
      }

      const syncBodyBackdrop = () => {
        const currentTopbar = document.querySelector("header.topbar");
        const nextTopbar = nextDoc.querySelector("header.topbar");
        if (!currentTopbar || !nextTopbar || !nextDoc.body) {
          return;
        }

        let cursor = document.body.firstElementChild;
        while (cursor && cursor !== currentTopbar) {
          const next = cursor.nextElementSibling;
          cursor.remove();
          cursor = next;
        }

        const backdropNodes = [];
        for (const child of Array.from(nextDoc.body.children)) {
          if (child === nextTopbar) {
            break;
          }
          backdropNodes.push(child);
        }

        backdropNodes.forEach((node) => {
          currentTopbar.parentNode.insertBefore(node.cloneNode(true), currentTopbar);
        });
      };

      syncBodyBackdrop();

      const nextBodyClass = nextDoc.body ? nextDoc.body.className : "";
      const keep = [];
      if (document.body.classList.contains("page-ready")) {
        keep.push("page-ready");
      }
      document.body.className = `${nextBodyClass} ${keep.join(" ")}`.trim();

      if (nextDoc.body) {
        Array.from(document.body.attributes)
          .filter((attr) => attr.name && attr.name.startsWith("data-"))
          .forEach((attr) => document.body.removeAttribute(attr.name));

        Array.from(nextDoc.body.attributes)
          .filter((attr) => attr.name && attr.name.startsWith("data-"))
          .forEach((attr) => document.body.setAttribute(attr.name, attr.value));
      }

      currentMain.replaceWith(nextMain);

      const nextTitle = nextDoc.querySelector("title");
      if (nextTitle) {
        document.title = nextTitle.textContent || document.title;
      }

      const nextMetaDesc = nextDoc.querySelector('meta[name="description"]');
      let currentMetaDesc = document.querySelector('meta[name="description"]');
      if (nextMetaDesc) {
        if (!currentMetaDesc) {
          currentMetaDesc = document.createElement("meta");
          currentMetaDesc.setAttribute("name", "description");
          document.head.appendChild(currentMetaDesc);
        }
        currentMetaDesc.setAttribute("content", nextMetaDesc.getAttribute("content") || "");
      }

      if (replaceState) {
        window.history.replaceState({}, "", targetUrl);
      } else {
        window.history.pushState({}, "", targetUrl);
      }

      currentLocationKey = getLocationKey(targetUrl);
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      refreshBasicUi(targetUrl);
      finishRouteProgress();
    } catch {
      window.location.href = targetUrl;
    }
  };

  document.addEventListener("click", (event) => {
    const hashAnchor = event.target && event.target.closest ? event.target.closest('a[href^="#"]') : null;
    if (hashAnchor) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return;
      }
      if (hashAnchor.hasAttribute("download")) {
        return;
      }
      if (hashAnchor.target && hashAnchor.target.toLowerCase() === "_blank") {
        return;
      }

      const hrefAttr = hashAnchor.getAttribute("href") || "";
      if (scrollToHashTarget(hrefAttr, "smooth", true)) {
        event.preventDefault();
        closeMobileMenu();
      }
      return;
    }

    const anchor = event.target && event.target.closest ? event.target.closest("a") : null;
    if (!isManagedNavLink(anchor, event)) {
      return;
    }

    event.preventDefault();
    swapMain(anchor.href, false);
  });

  window.addEventListener("popstate", () => {
    const targetLocationKey = getLocationKey(window.location.href);
    if (targetLocationKey === currentLocationKey) {
      if (window.location.hash) {
        scrollToHashTarget(window.location.hash, "auto", false);
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      }
      closeMobileMenu();
      return;
    }
    swapMain(window.location.href, true);
  });

  window.addEventListener("pageshow", () => {
    currentLocationKey = getLocationKey(window.location.href);
    setPageReady();
    refreshBasicUi(window.location.href);
  });

  currentLocationKey = getLocationKey(window.location.href);
  setPageReady();
  refreshBasicUi(window.location.href);
})();



































































































