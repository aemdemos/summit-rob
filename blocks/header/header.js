import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    // collapse menu on escape press
    window.addEventListener('keydown', closeOnEscape);
    // collapse menu on focus lost
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

function getDirectTextContent(menuItem) {
  const menuLink = menuItem.querySelector(':scope > :where(a,p)');
  if (menuLink) {
    return menuLink.textContent.trim();
  }
  return Array.from(menuItem.childNodes)
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
}

const MAX_BREADCRUMB_DEPTH = 20;

/** Pixels scrolled before nav bar returns to solid white (hero blend mode only). */
const HEADER_SOLID_AFTER_SCROLL_Y = 32;

/**
 * Optional URL for the brand logo when the bar is transparent over the hero (on-dark
 * treatment: white wordmark, white tile, black “rh”). Set any of:
 * - Page meta: `<meta name="logo-hero" content="https://…/logo-hero.svg">`
 * - Nav fragment: `data-logo-hero="https://…"` on `.nav-brand img` or `.nav-brand a`
 * @param {Element | null} brandLink
 * @param {HTMLImageElement | null} brandImg
 * @returns {string}
 */
function resolveHeroLogoSrc(brandLink, brandImg) {
  const fromImg = brandImg?.dataset?.logoHero || brandImg?.getAttribute?.('data-logo-hero');
  if (fromImg) return new URL(fromImg, window.location.href).href;
  const fromLink = brandLink?.dataset?.logoHero || brandLink?.getAttribute?.('data-logo-hero');
  if (fromLink) return new URL(fromLink, window.location.href).href;
  const rawMeta = getMetadata('logo-hero');
  const fromMeta = rawMeta.split(',')[0].trim();
  if (fromMeta) return new URL(fromMeta, window.location.href).href;
  return '';
}

/**
 * When the page has a hero under the fixed header, keep the nav bar transparent at
 * scroll 0 so the hero image shows through; add solid white bar after slight scroll,
 * when the mobile menu is open, or when a desktop megamenu is open.
 * @param {HTMLElement} navWrapper
 * @param {HTMLElement} nav
 */
function setupHeroHeaderBlend(navWrapper, nav) {
  const main = document.querySelector('main');
  const heroRoot = main?.querySelector('.hero, .section.hero-container, [data-block-name="hero"]');
  if (!heroRoot) return;

  const navSections = nav.querySelector('.nav-sections');
  const brandLink = navWrapper.querySelector('.nav-brand a');
  const brandImg = navWrapper.querySelector('.nav-brand img');
  const heroLogoSrc = resolveHeroLogoSrc(brandLink, brandImg);

  const isDesktopMegamenuOpen = () => isDesktop.matches && !!navSections?.querySelector(
    ':scope .default-content-wrapper > ul > li[aria-expanded="true"]',
  );

  const update = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const mobileMenuOpen = !isDesktop.matches && nav.getAttribute('aria-expanded') === 'true';
    const solid = y > HEADER_SOLID_AFTER_SCROLL_Y || mobileMenuOpen || isDesktopMegamenuOpen();
    navWrapper.classList.toggle('nav-wrapper-scrolled', solid);

    if (heroLogoSrc && brandImg) {
      if (brandImg.dataset.logoDefaultSrc === undefined) {
        brandImg.dataset.logoDefaultSrc = brandImg.getAttribute('src') || '';
      }
      const next = solid ? brandImg.dataset.logoDefaultSrc : heroLogoSrc;
      if (brandImg.getAttribute('src') !== next) {
        brandImg.setAttribute('src', next);
      }
      brandImg.toggleAttribute('data-hero-logo-active', !solid);
    } else if (brandImg) {
      brandImg.removeAttribute('data-hero-logo-active');
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  isDesktop.addEventListener('change', update);
  update();

  const observer = new MutationObserver(update);
  observer.observe(nav, { attributes: true, attributeFilter: ['aria-expanded'] });
  if (navSections) {
    observer.observe(navSections, {
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-expanded'],
    });
  }
}

async function buildBreadcrumbsFromNavTree(nav, currentUrl) {
  const crumbs = [];

  const homeUrl = document.querySelector('.nav-brand a[href]').href;

  let menuItem = Array.from(nav.querySelectorAll('a')).find((a) => a.href === currentUrl);
  if (menuItem) {
    let depth = 0;
    do {
      const link = menuItem.querySelector(':scope > a');
      crumbs.unshift({ title: getDirectTextContent(menuItem), url: link ? link.href : null });
      menuItem = menuItem.closest('ul')?.closest('li');
      depth += 1;
    } while (menuItem && depth < MAX_BREADCRUMB_DEPTH);
  } else if (currentUrl !== homeUrl) {
    crumbs.unshift({ title: getMetadata('og:title'), url: currentUrl });
  }

  crumbs.unshift({ title: 'Home', url: homeUrl });

  // last link is current page and should not be linked
  if (crumbs.length > 1) {
    crumbs.at(-1).url = null;
  }
  crumbs.at(-1)['aria-current'] = 'page';
  return crumbs;
}

async function buildBreadcrumbs() {
  const breadcrumbs = document.createElement('nav');
  breadcrumbs.className = 'breadcrumbs';

  const crumbs = await buildBreadcrumbsFromNavTree(document.querySelector('.nav-sections'), document.location.href);

  const ol = document.createElement('ol');
  ol.append(...crumbs.map((item) => {
    const li = document.createElement('li');
    if (item['aria-current']) li.setAttribute('aria-current', item['aria-current']);
    if (item.url) {
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.title;
      li.append(a);
    } else {
      li.textContent = item.title;
    }
    return li;
  }));

  breadcrumbs.append(ol);
  return breadcrumbs;
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });
    navSections.querySelectorAll('.button-container').forEach((buttonContainer) => {
      buttonContainer.classList.remove('button-container');
      buttonContainer.querySelector('.button').classList.remove('button');
    });
  }

  // Restructure dropdowns with many items but no sidebar (e.g. Consulting)
  // into a 2-column gray card matching the original layout.
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      const dropdown = navSection.querySelector(':scope > ul');
      if (!dropdown) return;
      const hasSidebar = dropdown.querySelector(':scope > li > ul');
      const items = dropdown.querySelectorAll(':scope > li');
      if (!hasSidebar && items.length >= 8) {
        const card = document.createElement('div');
        card.className = 'nav-mega-card';
        // Move items 3+ (after promo image + promo text) into the card
        [...items].slice(2).forEach((li) => card.append(li));
        dropdown.append(card);
      }
    });
  }

  const navTools = nav.querySelector('.nav-tools');
  if (navTools) {
    const search = navTools.querySelector('a[href*="search"]');
    if (search && search.textContent === '') {
      search.setAttribute('aria-label', 'Search');
    }
  }

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);

  setupHeroHeaderBlend(navWrapper, nav);

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    navWrapper.append(await buildBreadcrumbs());
  }
}
