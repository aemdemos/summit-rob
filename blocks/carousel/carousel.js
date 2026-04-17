import { moveInstrumentation, getBlockId } from '../../scripts/scripts.js';
import { createSliderControls, initSlider, showSlide } from '../../scripts/slider.js';

export { showSlide };

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

/**
 * Enables mouse-drag scrolling with momentum on a horizontally scrollable element.
 * @param {HTMLElement} el The scrollable container
 */
function enableMouseDrag(el) {
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let momentumId = 0;

  const startMomentum = () => {
    cancelAnimationFrame(momentumId);
    const decel = 0.97;
    const step = () => {
      if (Math.abs(velocity) < 0.5) return;
      el.scrollLeft -= velocity;
      velocity *= decel;
      momentumId = requestAnimationFrame(step);
    };
    momentumId = requestAnimationFrame(step);
  };

  el.addEventListener('mousedown', (e) => {
    if (e.target.closest('a, button')) return;
    cancelAnimationFrame(momentumId);
    isDown = true;
    startX = e.pageX;
    lastX = e.pageX;
    lastTime = Date.now();
    scrollStart = el.scrollLeft;
    velocity = 0;
    el.style.cursor = 'grabbing';
    el.style.scrollBehavior = 'auto';
    el.style.scrollSnapType = 'none';
    e.preventDefault();
  });

  el.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const now = Date.now();
    const dt = now - lastTime || 1;
    const dx = e.pageX - lastX;
    velocity = (dx / dt) * 32; // amplified for stronger swipe momentum
    lastX = e.pageX;
    lastTime = now;
    el.scrollLeft = scrollStart - (e.pageX - startX);
  });

  const stop = () => {
    if (!isDown) return;
    isDown = false;
    el.style.cursor = '';
    el.style.scrollBehavior = '';
    el.style.scrollSnapType = '';
    startMomentum();
  };

  el.addEventListener('mouseup', stop);
  el.addEventListener('mouseleave', stop);
}

export default async function decorate(block) {
  const blockId = getBlockId('carousel');
  block.setAttribute('id', blockId);
  block.setAttribute('aria-label', `carousel-${blockId}`);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  slidesWrapper.setAttribute('tabindex', '0');
  slidesWrapper.setAttribute('aria-label', 'Carousel slides');
  block.prepend(slidesWrapper);

  const controls = !isSingleSlide ? createSliderControls(rows.length) : null;
  if (controls) {
    block.append(controls.indicatorsNav);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, blockId);
    moveInstrumentation(row, slide);
    slidesWrapper.append(slide);
    row.remove();
  });

  container.append(slidesWrapper);
  if (controls) {
    container.append(controls.buttonsContainer);
  }
  block.prepend(container);

  enableMouseDrag(slidesWrapper);

  if (!isSingleSlide) {
    initSlider(block);
    slidesWrapper.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const current = parseInt(block.dataset.activeSlide, 10) || 0;
      const next = e.key === 'ArrowLeft' ? current - 1 : current + 1;
      e.preventDefault();
      showSlide(block, next, 'smooth');
    });
  }
}
