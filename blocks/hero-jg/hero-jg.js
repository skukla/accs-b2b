import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  // Read all config rows (every row after the first content row is a key-value config pair)
  const allRows = [...block.querySelectorAll(':scope > div')];
  const configRows = allRows.slice(1);
  const config = {};

  configRows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length >= 2) {
      const key = cells[0].textContent.trim().toLowerCase();
      const value = cells[1].textContent.trim();
      if (key) config[key] = value;
    }
    row.remove();
  });

  // Apply text color
  if (config['text-color']) {
    block.style.setProperty('--hero-jg-text-color', config['text-color']);
  }

  // Apply CTA button background opacity (0–100, default 24)
  if (config['cta-button-opacity'] !== undefined && config['cta-button-opacity'] !== '') {
    const opacity = Math.min(100, Math.max(0, parseFloat(config['cta-button-opacity']) || 24));
    block.style.setProperty('--hero-jg-cta-opacity', `${opacity}%`);
  }

  const contentCell = block.querySelector('div:nth-child(1)>div:nth-child(1)');
  if (!contentCell) return;

  const heromain = document.createElement('div');
  heromain.className = 'hero-jg-main';

  [...contentCell.children].forEach((row) => {
    const herocontent = document.createElement('div');
    herocontent.className = 'hero-jg-content';

    const heroimage = document.createElement('div');
    heroimage.className = 'hero-jg-image';
    const herobody = document.createElement('div');
    herobody.className = 'hero-jg-body';

    // Move each child to either heroimage (if picture) or herobody (otherwise)
    while (row.firstElementChild) {
      const child = row.firstElementChild;
      if (child.querySelector && child.querySelector('picture')) {
        heroimage.append(child);
      } else {
        herobody.append(child);
      }
    }

    herocontent.append(heroimage);
    herocontent.append(herobody);
    heromain.append(herocontent);
  });

  // Optimize all images
  heromain.querySelectorAll('picture > img').forEach((img) => {
    const src = img.getAttribute('src') || img.src;
    const alt = img.getAttribute('alt') || '';
    if (src) {
      img.closest('picture').replaceWith(createOptimizedPicture(src, alt, false, [{ width: '750' }]));
    }
  });
  block.replaceChildren(heromain);
}
