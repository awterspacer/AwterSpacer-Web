"use strict";

/* =========================================================
   AwterSpacer — script.js
   Navigation, filters, reveals, cursor light, touch light
   ========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const primaryMenu = document.querySelector("#primary-menu");
const navigationLinks = document.querySelectorAll(".navigation-links a");
const filterButtons = document.querySelectorAll(".work-filters button");
const workScenes = document.querySelectorAll(".work-scene");
const siteHeader = document.querySelector(".site-header");
const heroSection = document.querySelector(".hero-section");
const pageSections = document.querySelectorAll("main section[id]");
const pointerLight = document.querySelector(".pointer-light");

const reducedMotionQuery = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
const finePointerQuery = window.matchMedia("(pointer: fine)");
const coarsePointerQuery = window.matchMedia("(pointer: coarse)");

const mobileMenuClass = "is-menu-open";
const activeFilterClass = "is-active";
const hiddenWorkSceneClass = "is-filtered-out";
const scrolledHeaderClass = "is-scrolled";
const revealedClass = "is-revealed";

const pointerFeatureSelectors = [
  ".hero-section",
  ".work-scene-media",
  ".plan-featured",
  ".contact-content"
];

const pointerFeatureElements = document.querySelectorAll(
  pointerFeatureSelectors.join(", ")
);

let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let pointerFrame = null;
let touchFadeTimeout = null;

/* -------------------------
   Motion preference helper
------------------------- */

function prefersReducedMotion() {
  return reducedMotionQuery.matches;
}

/* -------------------------
   Mobile navigation
------------------------- */

function closeMobileMenu() {
  if (!menuToggle || !primaryMenu) {
    return;
  }

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
  menuToggle.textContent = "Menu";

  primaryMenu.classList.remove(mobileMenuClass);
  document.body.classList.remove(mobileMenuClass);
}

function toggleMobileMenu() {
  if (!menuToggle || !primaryMenu) {
    return;
  }

  const isMenuOpen = menuToggle.getAttribute("aria-expanded") === "true";

  menuToggle.setAttribute("aria-expanded", String(!isMenuOpen));
  menuToggle.setAttribute(
    "aria-label",
    isMenuOpen ? "Open navigation menu" : "Close navigation menu"
  );
  menuToggle.textContent = isMenuOpen ? "Menu" : "Close";

  primaryMenu.classList.toggle(mobileMenuClass, !isMenuOpen);
  document.body.classList.toggle(mobileMenuClass, !isMenuOpen);
}

if (menuToggle && primaryMenu) {
  menuToggle.addEventListener("click", toggleMobileMenu);

  navigationLinks.forEach((link) => {
    link.addEventListener("click", closeMobileMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });
}

/* -------------------------
   Work filtering
------------------------- */

function filterWorkScenes(selectedCategory) {
  workScenes.forEach((workScene) => {
    const workCategory = workScene.dataset.category;
    const shouldShow =
      selectedCategory === "all" || workCategory === selectedCategory;

    workScene.classList.toggle(hiddenWorkSceneClass, !shouldShow);
    workScene.setAttribute("aria-hidden", String(!shouldShow));

    if (shouldShow) {
      workScene.classList.remove(revealedClass);

      window.requestAnimationFrame(() => {
        workScene.classList.add(revealedClass);
      });
    }
  });
}

function updateActiveFilter(selectedButton) {
  filterButtons.forEach((button) => {
    const isSelected = button === selectedButton;

    button.classList.toggle(activeFilterClass, isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;

    updateActiveFilter(button);
    filterWorkScenes(selectedCategory);
  });
});

/* -------------------------
   Scroll-aware header
------------------------- */

function updateHeaderOnScroll() {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle(scrolledHeaderClass, window.scrollY > 24);
}

updateHeaderOnScroll();

window.addEventListener("scroll", updateHeaderOnScroll, {
  passive: true
});

/* -------------------------
   Active navigation section
------------------------- */

function updateActiveNavigation(entries) {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    const activeSectionId = `#${entry.target.id}`;

    navigationLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === activeSectionId;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  });
}

if ("IntersectionObserver" in window && pageSections.length > 0) {
  const sectionObserver = new IntersectionObserver(updateActiveNavigation, {
    root: null,
    rootMargin: "-28% 0px -58% 0px",
    threshold: 0
  });

  pageSections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

/* -------------------------
   General scroll reveals
------------------------- */

const revealSelectors = [
  ".section-heading",
  ".service-card",
  ".proof-introduction",
  ".proof-card",
  ".plan-card",
  ".process-step",
  ".statement-content",
  ".statement-section > img",
  ".about-introduction",
  ".principle-card",
  ".contact-content",
  ".site-footer"
];

const revealElements = document.querySelectorAll(revealSelectors.join(", "));

function revealAllElements() {
  revealElements.forEach((element) => {
    element.classList.add(revealedClass);
  });

  workScenes.forEach((workScene) => {
    workScene.classList.add(revealedClass);
  });
}

function initializeGeneralReveals() {
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    revealAllElements();
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add(revealedClass);
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12
    }
  );

  revealElements.forEach((element, index) => {
    const staggerIndex = index % 6;

    element.style.setProperty(
      "--reveal-delay",
      `${Math.min(staggerIndex * 70, 280)}ms`
    );

    revealObserver.observe(element);
  });
}

/* -------------------------
   Editorial work-scene reveal
------------------------- */

function initializeWorkSceneReveals() {
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    workScenes.forEach((workScene) => {
      workScene.classList.add(revealedClass);
    });

    return;
  }

  const workSceneObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add(revealedClass);
        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.18
    }
  );

  workScenes.forEach((workScene) => {
    workSceneObserver.observe(workScene);
  });
}

initializeGeneralReveals();
initializeWorkSceneReveals();

/* -------------------------
   Global pointer light
------------------------- */

function setPointerLightPosition(x, y) {
  if (!pointerLight) {
    return;
  }

  pointerLight.style.left = `${x}px`;
  pointerLight.style.top = `${y}px`;
}

function renderPointerLight() {
  setPointerLightPosition(pointerX, pointerY);
  pointerFrame = null;
}

function queuePointerLightPosition(x, y) {
  pointerX = x;
  pointerY = y;

  if (pointerFrame !== null) {
    return;
  }

  pointerFrame = window.requestAnimationFrame(renderPointerLight);
}

function showPointerLight() {
  if (!pointerLight || prefersReducedMotion()) {
    return;
  }

  pointerLight.classList.add("is-visible");
}

function hidePointerLight() {
  if (!pointerLight) {
    return;
  }

  pointerLight.classList.remove("is-visible");
  pointerLight.classList.remove("is-touching");
  pointerLight.classList.remove("is-featured");
}

function setPointerFeatureState(target) {
  if (!pointerLight || !target) {
    return;
  }

  const isFeatureArea = Array.from(pointerFeatureElements).some((element) =>
    element.contains(target)
  );

  pointerLight.classList.toggle("is-featured", isFeatureArea);
}

function updateHeroPointerLight(event) {
  if (!heroSection || prefersReducedMotion()) {
    return;
  }

  const heroBounds = heroSection.getBoundingClientRect();
  const heroPointerX =
    ((event.clientX - heroBounds.left) / heroBounds.width) * 100;
  const heroPointerY =
    ((event.clientY - heroBounds.top) / heroBounds.height) * 100;

  heroSection.style.setProperty("--pointer-x", `${heroPointerX}%`);
  heroSection.style.setProperty("--pointer-y", `${heroPointerY}%`);
}

function handleFinePointerMove(event) {
  if (prefersReducedMotion()) {
    return;
  }

  queuePointerLightPosition(event.clientX, event.clientY);
  showPointerLight();
  setPointerFeatureState(event.target);

  if (heroSection && heroSection.contains(event.target)) {
    updateHeroPointerLight(event);
  }
}

function initializeFinePointerLight() {
  if (!pointerLight || !finePointerQuery.matches || prefersReducedMotion()) {
    return;
  }

  window.addEventListener("pointermove", handleFinePointerMove, {
    passive: true
  });

  window.addEventListener("blur", hidePointerLight, {
    passive: true
  });
}

/* -------------------------
   Mobile touch light
------------------------- */

function handleTouchStart(event) {
  if (!pointerLight || prefersReducedMotion()) {
    return;
  }

  const touchPoint = event.touches[0];

  if (!touchPoint) {
    return;
  }

  window.clearTimeout(touchFadeTimeout);

  queuePointerLightPosition(touchPoint.clientX, touchPoint.clientY);

  pointerLight.classList.add("is-visible");
  pointerLight.classList.add("is-touching");

  const touchTarget = document.elementFromPoint(
    touchPoint.clientX,
    touchPoint.clientY
  );

  setPointerFeatureState(touchTarget);
}

function handleTouchEnd() {
  if (!pointerLight) {
    return;
  }

  pointerLight.classList.remove("is-touching");

  touchFadeTimeout = window.setTimeout(() => {
    hidePointerLight();
  }, 260);
}

function initializeTouchLight() {
  if (!pointerLight || !coarsePointerQuery.matches || prefersReducedMotion()) {
    return;
  }

  window.addEventListener("touchstart", handleTouchStart, {
    passive: true
  });

  window.addEventListener("touchend", handleTouchEnd, {
    passive: true
  });

  window.addEventListener("touchcancel", handleTouchEnd, {
    passive: true
  });
}

initializeFinePointerLight();
initializeTouchLight();

/* -------------------------
   Magnetic primary actions
------------------------- */

const magneticButtons = document.querySelectorAll(
  ".button-primary, .nav-contact-link"
);

function resetMagneticButton(button) {
  button.style.removeProperty("--magnetic-x");
  button.style.removeProperty("--magnetic-y");
}

function updateMagneticButton(event) {
  if (prefersReducedMotion()) {
    return;
  }

  const button = event.currentTarget;
  const buttonBounds = button.getBoundingClientRect();
  const buttonCenterX = buttonBounds.left + buttonBounds.width / 2;
  const buttonCenterY = buttonBounds.top + buttonBounds.height / 2;

  const distanceX = event.clientX - buttonCenterX;
  const distanceY = event.clientY - buttonCenterY;

  button.style.setProperty("--magnetic-x", `${distanceX * 0.14}px`);
  button.style.setProperty("--magnetic-y", `${distanceY * 0.14}px`);
}

if (finePointerQuery.matches) {
  magneticButtons.forEach((button) => {
    button.addEventListener("pointermove", updateMagneticButton);

    button.addEventListener("pointerleave", () => {
      resetMagneticButton(button);
    });
  });
}

/* -------------------------
   Reduced-motion handling
------------------------- */

function handleMotionPreferenceChange() {
  if (!prefersReducedMotion()) {
    return;
  }

  revealAllElements();

  if (heroSection) {
    heroSection.style.removeProperty("--pointer-x");
    heroSection.style.removeProperty("--pointer-y");
  }

  if (pointerLight) {
    pointerLight.classList.remove(
      "is-visible",
      "is-touching",
      "is-featured"
    );
  }

  magneticButtons.forEach(resetMagneticButton);
}

if (typeof reducedMotionQuery.addEventListener === "function") {
  reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
} else {
  reducedMotionQuery.addListener(handleMotionPreferenceChange);
}