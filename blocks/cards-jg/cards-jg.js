import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const cells = [...row.children];
    // Column layout: [0]=image, [1]=title, [2]=body, [3]=background-color, [4]=text-color

    const bgColor = cells[3]?.textContent.trim();
    const textColor = cells[4]?.textContent.trim();
    if (bgColor) li.style.backgroundColor = bgColor;
    if (textColor) li.style.color = textColor;

    // Image (optional)
    if (cells[0]?.querySelector('picture')) {
      const imgDiv = document.createElement('div');
      imgDiv.className = 'cards-jg-image';
      while (cells[0].firstChild) imgDiv.append(cells[0].firstChild);
      li.append(imgDiv);
    }

    // Card body
    const cardBody = document.createElement('div');
    cardBody.className = 'cards-jg-body';

    // Title → bold h3
    const titleText = cells[1]?.textContent.trim();
    if (titleText) {
      const h3 = document.createElement('h3');
      h3.className = 'cards-jg-title';
      h3.textContent = titleText;
      cardBody.append(h3);
    }

    // Body richtext
    const bodyCell = cells[2];
    if (bodyCell) {
      const hasContent = bodyCell.children.length > 0 || bodyCell.textContent.trim();
      if (hasContent) {
        const bodyContent = document.createElement('div');
        bodyContent.className = 'cards-jg-body-text';
        if (bodyCell.children.length > 0) {
          while (bodyCell.firstChild) bodyContent.append(bodyCell.firstChild);
        } else {
          const p = document.createElement('p');
          p.textContent = bodyCell.textContent.trim();
          bodyContent.append(p);
        }
        cardBody.append(bodyContent);
      }
    }

    if (cardBody.children.length) li.append(cardBody);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }])));
  block.replaceChildren(ul);
}
