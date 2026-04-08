/**
 * Decorates the hero block.
 * @param {Element} block The hero block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 1) return;

  // Expect: row with [image, content] or single-column rows
  const firstRow = rows[0];
  const cols = [...firstRow.children];

  let picture;
  let contentEl;

  if (cols.length >= 2) {
    // Two-column layout: image | content
    const [imgCol, textCol] = cols;
    picture = imgCol.querySelector('picture');
    contentEl = textCol;
  } else {
    // Look for picture in any row
    picture = block.querySelector('picture');
    // Content is everything that's not the picture
    [contentEl] = cols;
  }

  // Build hero structure
  block.textContent = '';

  // Background image
  if (picture) {
    const bgDiv = document.createElement('div');
    bgDiv.classList.add('hero-bg');
    bgDiv.append(picture);
    block.append(bgDiv);
  }

  // Content overlay
  const content = document.createElement('div');
  content.classList.add('hero-content');

  if (contentEl) {
    // Move all content children
    while (contentEl.firstChild) {
      content.append(contentEl.firstChild);
    }
  }

  // Find button links and wrap in CTA container
  const buttonLinks = content.querySelectorAll('.button-container, .button-wrapper');
  if (buttonLinks.length > 0) {
    const ctaWrapper = document.createElement('div');
    ctaWrapper.classList.add('hero-cta');
    buttonLinks.forEach((bc) => ctaWrapper.append(bc));
    content.append(ctaWrapper);
  }

  block.append(content);
}
