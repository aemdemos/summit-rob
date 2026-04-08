/**
 * Decorates the stats block with data visualization cards.
 * @param {Element} block The stats block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  block.textContent = '';

  const grid = document.createElement('div');
  grid.classList.add('stats-grid');

  rows.forEach((row, index) => {
    const cols = [...row.children];
    const card = document.createElement('div');
    card.classList.add('stats-card');
    if (index === 0) card.classList.add('stats-card-featured');

    const content = cols[0] || row;
    const h3 = content.querySelector('h3');
    const p = content.querySelector('p');

    if (h3) {
      const dataPoint = document.createElement('div');
      dataPoint.classList.add('stats-data-point');
      dataPoint.textContent = h3.textContent;
      card.append(dataPoint);
    }

    if (p) {
      const desc = document.createElement('div');
      desc.classList.add('stats-description');
      desc.textContent = p.textContent;
      card.append(desc);
    }

    grid.append(card);
  });

  block.append(grid);
}
