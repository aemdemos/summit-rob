import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';
import { createCard } from '../card/card.js';

export default function decorate(block) {
  const blockId = getBlockId('cards');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `Cards for ${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Cards');

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    ul.append(createCard(row));
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  // Add prev/next navigation buttons for horizontal scroll
  const items = ul.querySelectorAll('li');
  if (items.length > 1) {
    const nav = document.createElement('div');
    nav.className = 'cards-navigation-buttons';

    const prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'cards-prev';
    prevBtn.setAttribute('aria-label', 'Previous');

    const nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'cards-next';
    nextBtn.setAttribute('aria-label', 'Next');

    // Scrollbar progress indicator
    const scrollbar = document.createElement('div');
    scrollbar.className = 'cards-scrollbar';
    const scrollThumb = document.createElement('div');
    scrollThumb.className = 'cards-scrollbar-thumb';
    scrollbar.append(scrollThumb);

    const updateScrollbar = () => {
      const { scrollLeft, scrollWidth, clientWidth } = ul;
      const maxScroll = scrollWidth - clientWidth;
      if (maxScroll <= 0) {
        scrollbar.hidden = true;
        return;
      }
      scrollbar.hidden = false;
      const ratio = clientWidth / scrollWidth;
      const thumbWidth = Math.max(ratio * 100, 10);
      const thumbLeft = (scrollLeft / maxScroll) * (100 - thumbWidth);
      scrollThumb.style.width = `${thumbWidth}%`;
      scrollThumb.style.left = `${thumbLeft}%`;
    };

    ul.addEventListener('scroll', updateScrollbar, { passive: true });
    // Initial update after layout
    requestAnimationFrame(updateScrollbar);

    nav.append(prevBtn, nextBtn);
    block.append(scrollbar, nav);

    const scrollByCard = (direction) => {
      const cardWidth = items[0].getBoundingClientRect().width;
      const gap = parseInt(getComputedStyle(ul).gap, 10) || 0;
      ul.scrollBy({ left: direction * (cardWidth + gap), behavior: 'smooth' });
    };

    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));
  }
}
