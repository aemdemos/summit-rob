import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Restructures the link columns section so each H2+UL pair
 * is wrapped in its own div for CSS grid layout.
 * DA content arrives as a flat list of H2, UL siblings in one wrapper.
 * @param {Element} section The first footer section
 */
function buildLinkColumns(section) {
  const wrapper = section.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  const headings = wrapper.querySelectorAll('h2');
  if (headings.length <= 1) return;

  // Group children by H2 boundaries: each H2 starts a new column
  const columns = [];
  let currentCol = null;
  [...wrapper.children].forEach((child) => {
    if (child.tagName === 'H2') {
      currentCol = document.createElement('div');
      columns.push(currentCol);
    }
    if (currentCol) currentCol.append(child);
  });

  // Replace wrapper content with column divs
  section.textContent = '';
  columns.forEach((col) => section.append(col));
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // restructure first section into 4 link columns if needed
  const firstSection = footer.querySelector('.section');
  if (firstSection) buildLinkColumns(firstSection);

  block.append(footer);
}
