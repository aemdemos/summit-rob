import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

function el(tag, attrs, ...children) {
  const element = document.createElement(tag);
  if (attrs) {
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') element.className = value;
      else element.setAttribute(key, value);
    });
  }
  children.forEach((child) => {
    if (typeof child === 'string') element.append(document.createTextNode(child));
    else if (child) element.append(child);
  });
  return element;
}

/**
 * Restructures the link columns section so each H2+UL pair
 * is wrapped in its own div for CSS grid layout.
 * @param {Element} section The first footer section
 */
function buildLinkColumns(section) {
  const wrapper = section.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  const headings = wrapper.querySelectorAll('h2');
  if (headings.length <= 1) return;

  const columns = [];
  let currentCol = null;
  [...wrapper.children].forEach((child) => {
    if (child.tagName === 'H2') {
      currentCol = document.createElement('div');
      columns.push(currentCol);
    }
    if (currentCol) currentCol.append(child);
  });

  section.textContent = '';
  columns.forEach((col) => section.append(col));
}

/**
 * Parses region data from authored nested list in the footer content.
 * @param {Element} listEl The UL element containing region data
 * @returns {Array} Array of { name, languages: [{ label, href }] }
 */
function parseRegionList(listEl) {
  const regions = [];
  listEl.querySelectorAll(':scope > li').forEach((li) => {
    const subList = li.querySelector('ul');
    if (!subList) return;
    // Country name may be a text node or wrapped in <p> by the fragment loader
    const firstChild = li.firstElementChild;
    const name = (firstChild && firstChild.tagName === 'P')
      ? firstChild.textContent.trim()
      : li.childNodes[0].textContent.trim();
    const languages = [...subList.querySelectorAll('a')].map((a) => ({
      label: a.textContent.trim(),
      href: a.getAttribute('href'),
    }));
    if (name && languages.length) regions.push({ name, languages });
  });
  return regions;
}

/**
 * Builds a dropdown region/language selector from authored content.
 * @param {Element} section The last footer section
 */
function buildRegionSelector(section) {
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  const paragraphs = wrapper.querySelectorAll('p');

  let regionParagraph = null;
  paragraphs.forEach((p) => {
    if (p.textContent.trim().match(/\(English\)|\(Français\)|\(Deutsch\)|\(Español\)/)) {
      regionParagraph = p;
    }
  });
  if (!regionParagraph) return;

  const regionList = regionParagraph.nextElementSibling;
  if (!regionList || regionList.tagName !== 'UL') return;

  const regions = parseRegionList(regionList);
  if (!regions.length) return;

  const currentLabel = regionParagraph.textContent.trim();
  regionList.remove();

  // Button
  const arrow = el('span', { className: 'region-selector-arrow' }, '\u2192');
  const openBtn = el(
    'button',
    { className: 'region-selector-btn', 'aria-expanded': 'false', 'aria-label': 'Select a region and language' },
    'Select a region and language ',
    arrow,
  );
  const currentRegion = el(
    'div',
    { className: 'region-selector-current' },
    el('span', { className: 'region-selector-label' }, currentLabel),
    openBtn,
  );

  // Dropdown header
  const closeBtn = el('button', { className: 'region-selector-close', 'aria-label': 'Close' }, '\u2715');
  const dropdownHeader = el(
    'div',
    { className: 'region-selector-dropdown-header' },
    el('h3', null, 'Choose your region and language'),
    closeBtn,
  );

  // Current info
  const currentInfo = el(
    'div',
    // eslint-disable-next-line secure-coding/no-hardcoded-credentials
    { className: 'region-selector-dropdown-current' },
    el('p', null, 'Your current region and language is:'),
    el('p', null, el('strong', null, currentLabel)),
  );

  // Country list
  const list = el('div', { className: 'region-selector-list' });

  regions.forEach((region) => {
    const nameSpan = el('span', { className: 'region-selector-item-name' }, region.name);
    const chevron = el('span', { className: 'region-selector-item-chevron' }, '\u203A');
    const header = el(
      'button',
      { className: 'region-selector-item-header', 'aria-expanded': 'false' },
      nameSpan,
      chevron,
    );

    const languages = el('div', { className: 'region-selector-item-languages' });
    languages.hidden = true;

    region.languages.forEach((lang) => {
      languages.append(el('a', { href: lang.href }, lang.label));
    });

    header.addEventListener('click', () => {
      const expanded = header.getAttribute('aria-expanded') === 'true';
      list.querySelectorAll('.region-selector-item-header').forEach((h) => {
        h.setAttribute('aria-expanded', 'false');
        h.nextElementSibling.hidden = true;
      });
      if (!expanded) {
        header.setAttribute('aria-expanded', 'true');
        languages.hidden = false;
      }
    });

    list.append(el('div', { className: 'region-selector-item' }, header, languages));
  });

  const dropdownBody = el('div', { className: 'region-selector-dropdown-body' }, currentInfo, list);
  const dropdown = el('div', { className: 'region-selector-dropdown', 'aria-hidden': 'true' }, dropdownHeader, dropdownBody);

  const toggleDropdown = (open) => {
    dropdown.setAttribute('aria-hidden', String(!open));
    openBtn.setAttribute('aria-expanded', String(open));
  };

  const selectorWrapper = el('div', { className: 'region-selector' }, currentRegion, dropdown);

  openBtn.addEventListener('click', () => {
    const isOpen = openBtn.getAttribute('aria-expanded') === 'true';
    toggleDropdown(!isOpen);
    if (!isOpen) {
      // Clamp dropdown so it doesn't go above viewport
      requestAnimationFrame(() => {
        const rect = dropdown.getBoundingClientRect();
        if (rect.top < 0) {
          dropdown.style.bottom = 'auto';
          dropdown.style.top = `${-selectorWrapper.getBoundingClientRect().top + 8}px`;
        }
      });
    } else {
      dropdown.style.bottom = '';
      dropdown.style.top = '';
    }
  });
  closeBtn.addEventListener('click', () => toggleDropdown(false));

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (openBtn.getAttribute('aria-expanded') === 'true'
      && !dropdown.contains(e.target)
      && !openBtn.contains(e.target)) {
      toggleDropdown(false);
    }
  });

  regionParagraph.replaceWith(selectorWrapper);

  // Restructure: wrap legal paragraphs in a container so CSS grid
  // can place legal-left and region-selector-right as two columns
  const legalWrapper = el('div', { className: 'footer-legal' });
  const remainingParagraphs = [...wrapper.querySelectorAll(':scope > p')];
  remainingParagraphs.forEach((p) => {
    const text = p.textContent.trim();
    if (text.includes('|') || p.querySelector('a[href*="fraud"]') || p.querySelector('a[href*="terms"]')
      || p.querySelector('a[href*="government"]') || p.querySelector('a[href*="privacy"]')) {
      p.classList.add('footer-legal-links');
    } else {
      p.classList.add('footer-copyright');
    }
    legalWrapper.append(p);
  });

  // Insert legal wrapper before the region selector in the wrapper
  wrapper.insertBefore(legalWrapper, selectorWrapper);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const firstSection = footer.querySelector('.section');
  if (firstSection) buildLinkColumns(firstSection);

  const sections = footer.querySelectorAll('.section');
  const lastSection = sections[sections.length - 1];
  if (lastSection) buildRegionSelector(lastSection);

  block.append(footer);
}
