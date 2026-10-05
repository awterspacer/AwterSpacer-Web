"use strict";

/* =========================================================
   AwterSpacer — script.js
   Interaction and motion system
   ========================================================= */

const menuToggle = document.querySelector(".menu-toggle");
const primaryMenu = document.querySelector("#primary-menu");
const navigationLinks = document.querySelectorAll(".navigation-links a");
const filterButtons = document.querySelectorAll(".work-filters button");
const projectCards = document.querySelectorAll(".project-card");
const siteHeader = document.querySelector(".site-header");
const heroSection = document.querySelector(".hero-section");
const sections = document.querySelectorAll("main section[id]");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const mobileMenuClass = "is-menu-open";
const activeFilterClass = "is-active";
const hiddenProjectClass = "is-filtered-out";
const scrolledHeaderClass = "is-scrolled";
const revealedClass = "is-revealed";

/* -------------------------
   Motion preferences
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
   Portfolio filtering
------------------------- */

function filterProjects(selectedCategory) {
  projectCards.forEach((projectCard) => {
    const projectCategory = projectCard.dataset.category;
    const shouldShow =
      selectedCategory === "all" || projectCategory === selectedCategory;

    projectCard.classList.toggle(hiddenProjectClass, !shouldShow);
    projectCard.setAttribute("aria-hidden", String(!shouldShow));

    if (shouldShow) {
      projectCard.classList.remove(revealedClass);
      window.requestAnimationFrame(() => {
        projectCard.classList.add(revealedClass);
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
  button.setAttribute(
    "aria-pressed",
    String(button.dataset.filter === "all")
  );

  button.addEventListener("click", () => {
    const selectedCategory = button.dataset.filter;

    updateActiveFilter(button);
    filterProjects(selectedCategory);
  });
});

/* -------------------------
   Scroll-aware header
------------------------- */

function updateHeaderOnScroll() {
  if (!siteHeader) {
    return;
  }

  const hasScrolled = window.scrollY > 24;

  siteHeader.classList.toggle(scrolledHeaderClass, hasScrolled);
}

updateHeaderOnScroll();

window.addEventListener("scroll", updateHeaderOnScroll, {
  passive: true
});

/* -------------------------
   Active section navigation
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

if ("IntersectionObserver" in window && sections.length > 0) {
  const sectionObserver = new IntersectionObserver(updateActiveNavigation, {
    root: null,
    rootMargin: "-28% 0px -58% 0px",
    threshold: 0
  });

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

/* -------------------------
   Scroll reveal system
------------------------- */

const revealSelectors = [
  ".section-heading",
  ".service-card",
  ".project-card",
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
}

function initializeScrollReveals() {
  if (prefersReducedMotion()) {
    revealAllElements();
    return;
  }

  if (!("IntersectionObserver" in window)) {
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

initializeScrollReveals();

/* -------------------------
   Hero pointer light
------------------------- */

function updateHeroPointerLight(event) {
  if (!heroSection || prefersReducedMotion()) {
    return;
  }

  const heroBounds = heroSection.getBoundingClientRect();
  const pointerX = ((event.clientX - heroBounds.left) / heroBounds.width) * 100;
  const pointerY = ((event.clientY - heroBounds.top) / heroBounds.height) * 100;

  heroSection.style.setProperty("--pointer-x", `${pointerX}%`);
  heroSection.style.setProperty("--pointer-y", `${pointerY}%`);
}

if (heroSection && window.matchMedia("(pointer: fine)").matches) {
  heroSection.addEventListener("pointermove", updateHeroPointerLight, {
    passive: true
  });
}

/* -------------------------
   Magnetic buttons
------------------------- */

const magneticButtons = document.querySelectorAll(
  ".button-primary, .nav-contact-link"
);

function resetMagneticButton(button) {
  button.style.removeProperty("--magnetic-x");
  button.style.removeProperty("--magnetic-y");
}

function updateMagneticButton(event) {
  const button = event.currentTarget;

  if (prefersReducedMotion()) {
    return;
  }

  const buttonBounds = button.getBoundingClientRect();
  const buttonCenterX = buttonBounds.left + buttonBounds.width / 2;
  const buttonCenterY = buttonBounds.top + buttonBounds.height / 2;

  const distanceX = event.clientX - buttonCenterX;
  const distanceY = event.clientY - buttonCenterY;

  button.style.setProperty("--magnetic-x", `${distanceX * 0.14}px`);
  button.style.setProperty("--magnetic-y", `${distanceY * 0.14}px`);
}

if (window.matchMedia("(pointer: fine)").matches) {
  magneticButtons.forEach((button) => {
    button.addEventListener("pointermove", updateMagneticButton);
    button.addEventListener("pointerleave", () => {
      resetMagneticButton(button);
    });
  });
}

/* -------------------------
   Motion preference updates
------------------------- */

function handleMotionPreferenceChange() {
  if (prefersReducedMotion()) {
    revealAllElements();

    if (heroSection) {
      heroSection.style.removeProperty("--pointer-x");
      heroSection.style.removeProperty("--pointer-y");
    }

    magneticButtons.forEach(resetMagneticButton);
  }
}

reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);
