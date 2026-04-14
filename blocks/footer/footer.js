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
 * Expected structure: <ul><li>Country Name<ul><li><a href="/path">Language</a></li>...</ul></li>...</ul>
 * @param {Element} listEl The UL element containing region data
 * @returns {Array} Array of { name, languages: [{ label, href }] }
 */
function parseRegionList(listEl) {
  const regions = [];
  listEl.querySelectorAll(':scope > li').forEach((li) => {
    const subList = li.querySelector('ul');
    if (!subList) return;
    // Country name is the text content before the nested UL
    const name = li.childNodes[0].textContent.trim();
    const languages = [...subList.querySelectorAll('a')].map((a) => ({
      label: a.textContent.trim(),
      href: a.getAttribute('href'),
    }));
    if (name && languages.length) regions.push({ name, languages });
  });
  return regions;
}

/**
 * Builds the region/language selector from authored content.
 * Finds the region paragraph + following nested list in the last section.
 * @param {Element} section The last footer section
 */
function buildRegionSelector(section) {
  const wrapper = section.querySelector('.default-content-wrapper') || section;
  const paragraphs = wrapper.querySelectorAll('p');

  // Find the paragraph with current region label (e.g. "United States (English)")
  let regionParagraph = null;
  paragraphs.forEach((p) => {
    if (p.textContent.trim().match(/\(English\)|\(Français\)|\(Deutsch\)|\(Español\)/)) {
      regionParagraph = p;
    }
  });
  if (!regionParagraph) return;

  // Find the UL that follows the region paragraph (the authored region list)
  const regionList = regionParagraph.nextElementSibling;
  if (!regionList || regionList.tagName !== 'UL') return;

  const regions = parseRegionList(regionList);
  if (!regions.length) return;

  const currentLabel = regionParagraph.textContent.trim();

  // Remove the authored list from DOM (it's now data)
  regionList.remove();

  // Build selector UI
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

  // Modal
  const closeBtn = el('button', { className: 'region-selector-close', 'aria-label': 'Close' }, '\u2715');
  const modalHeader = el(
    'div',
    { className: 'region-selector-modal-header' },
    el('h2', null, 'Choose your region and language'),
    closeBtn,
  );

  const currentInfo = el(
    'div',
    { className: 'region-selector-modal-current' },
    el('p', null, 'Your current region and language is:'),
    el('p', null, el('strong', null, currentLabel)),
  );

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

  const modalBody = el('div', { className: 'region-selector-modal-body' }, currentInfo, list);
  const panel = el('div', { className: 'region-selector-panel' }, modalHeader, modalBody);
  const modal = el('div', { className: 'region-selector-modal', 'aria-hidden': 'true' }, panel);

  const toggleModal = (open) => {
    modal.setAttribute('aria-hidden', String(!open));
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  };

  openBtn.addEventListener('click', () => toggleModal(true));
  closeBtn.addEventListener('click', () => toggleModal(false));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) toggleModal(false);
  });

  const selectorWrapper = el('div', { className: 'region-selector' }, currentRegion, modal);
  regionParagraph.replaceWith(selectorWrapper);
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
