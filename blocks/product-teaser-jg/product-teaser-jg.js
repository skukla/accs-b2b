import { readBlockConfig } from '../../scripts/aem.js';
import {
  renderPrice, performCatalogServiceQuery, mapProductAcdl, encodeSkuForUrl,
} from '../product-teaser/product-teaser-utils.js';
import { rootLink } from '../../scripts/commerce.js';

const productTeaserV2Query = `query productTeaserV2($sku: String!) {
  products(skus: [$sku]) {
    sku
    urlKey
    name
    externalId
    addToCartAllowed
    shortDescription
    __typename
    images(roles: []) {
      label
      url
    }
    ... on SimpleProductView {
      price {
        ...priceFields
      }
    }
    ... on ComplexProductView {
      priceRange {
        minimum {
          ...priceFields
        }
        maximum {
          ...priceFields
        }
      }
    }
  }
}
fragment priceFields on ProductViewPrice {
  regular {
    amount {
      currency
      value
    }
  }
  final {
    amount {
      currency
      value
    }
  }
}`;

function renderPlaceholder(config, block) {
  block.textContent = '';
  block.appendChild(document.createRange().createContextualFragment(`
    <div class="image">
      <div class="placeholder"></div>
    </div>
    <div class="details">
      <h1></h1>
      <div class="price"></div>
      <div class="short-description"></div>
      <div class="actions">
        ${config['details-button'] ? '<a href="#" class="button primary disabled">Details</a>' : ''}
        ${config['cart-button'] ? '<button class="secondary" disabled>Add to Cart</button>' : ''}
      </div>
    </div>
  `));
}

function isAemAssetsUrl(url) {
  try {
    const parsedUrl = new URL(url, window.location);
    return parsedUrl.pathname.includes('/adobe/assets/');
  } catch {
    return false;
  }
}

function renderAemAssetsImage(product, imageUrl, label, size) {
  const { name } = product;
  const urlParts = imageUrl.split('/');
  const assetId = urlParts[urlParts.length - 1];
  const baseUrl = imageUrl.replace(`/${assetId}`, '');

  const createUrlForWidth = (url, w, format) => {
    const newUrl = new URL(url, window.location);
    const seoName = name.replace(' ', '-');
    newUrl.pathname = `${newUrl.pathname}/${assetId}/as/${seoName}.${format}`;
    newUrl.searchParams.set('width', w);
    newUrl.searchParams.delete('quality');
    newUrl.searchParams.delete('dpr');
    newUrl.searchParams.delete('bg-color');
    return newUrl.toString();
  };

  const createUrlForDpi = (url, w, format) => `${createUrlForWidth(url, w, format)} 1x, ${createUrlForWidth(url, w * 2, format)} 2x, ${createUrlForWidth(url, w * 3, format)} 3x`;

  const webpUrl = createUrlForDpi(baseUrl, size, 'webp');
  const jpgUrl = createUrlForDpi(baseUrl, size, 'jpg');

  return document.createRange().createContextualFragment(`<picture>
      <source srcset="${webpUrl}" />
      <source srcset="${jpgUrl}" />
      <img height="${size}" width="${size}" src="${createUrlForWidth(baseUrl, size, 'jpg')}" loading="eager" alt="${label}" />
    </picture>
  `);
}

function renderStandardImage(imageUrl, label, size) {
  const fullUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
  return document.createRange().createContextualFragment(`<picture>
      <img width="${size}" src="${fullUrl}" loading="eager" alt="${label}" />
    </picture>
  `);
}

function renderImage(product, size = 250) {
  const { url: imageUrl, label } = product.images[0];
  if (isAemAssetsUrl(imageUrl)) {
    return renderAemAssetsImage(product, imageUrl, label, size);
  }
  return renderStandardImage(imageUrl, label, size);
}

function renderProduct(product, config, block) {
  const {
    name, urlKey, sku, price, priceRange, addToCartAllowed, __typename, shortDescription,
  } = product;

  const currency = price?.final?.amount?.currency || priceRange?.minimum?.final?.amount?.currency;
  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  });

  block.textContent = '';

  let addToCartButtonHtml = '';
  if (config['cart-button']) {
    if (__typename === 'SimpleProductView' && addToCartAllowed) {
      addToCartButtonHtml = '<button class="add-to-cart secondary">Add to Cart</button>';
    } else {
      addToCartButtonHtml = '<button class="add-to-cart secondary" disabled>Add to Cart</button>';
    }
  }

  const shortDescHtml = shortDescription
    ? `<div class="short-description">${shortDescription}</div>`
    : '';

  const fragment = document.createRange().createContextualFragment(`
    <div class="image">
    </div>
    <div class="details">
      <h1>${name}</h1>
      <div class="price">${renderPrice(product, priceFormatter.format)}</div>
      ${shortDescHtml}
      <div class="actions">
        ${config['details-button'] ? `<a href="${rootLink(`/products/${urlKey}/${encodeSkuForUrl(sku)}`)}" class="button primary">Details</a>` : ''}
        ${addToCartButtonHtml}
      </div>
    </div>
  `);

  fragment.querySelector('.image').appendChild(renderImage(product, 250));

  const addToCartButton = fragment.querySelector('.add-to-cart');
  if (addToCartButton && !addToCartButton.disabled && __typename === 'SimpleProductView' && addToCartAllowed) {
    addToCartButton.addEventListener('click', async () => {
      const values = [{
        optionsUIDs: [],
        quantity: 1,
        sku: product.sku,
      }];
      const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
      window.adobeDataLayer.push({ productContext: mapProductAcdl(product) });
      console.debug('onAddToCart', values);
      addProductsToCart(values);
    });
  }

  block.appendChild(fragment);
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  config['details-button'] = config['details-button'] === true || config['details-button'] === 'true';
  config['cart-button'] = config['cart-button'] === true || config['cart-button'] === 'true';

  // Apply custom colors via CSS custom properties
  if (config['background-color']) {
    block.style.setProperty('--pt-jg-bg-color', config['background-color']);
  }
  if (config['text-color']) {
    block.style.setProperty('--pt-jg-text-color', config['text-color']);
  }

  renderPlaceholder(config, block);

  const { products } = await performCatalogServiceQuery(productTeaserV2Query, {
    sku: config.sku,
  });
  if (!products || products.length === 0 || !products[0].sku) {
    return;
  }
  const [product] = products;
  product.images = product.images.map((image) => ({ ...image, url: image.url.replace(/^https?:/, '') }));

  renderProduct(product, config, block);
}
