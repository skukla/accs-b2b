import { readBlockConfig } from '../../scripts/aem.js';
import {
  checkIsAuthenticated,
  CORE_FETCH_GRAPHQL,
  rootLink,
  CUSTOMER_LOGIN_PATH,
} from '../../scripts/commerce.js';
import '../../scripts/initializers/account.js';

const DASHBOARD_QUERY = `
  query getAccountDashboard {
    customer {
      firstname
      lastname
      orders(pageSize: 100, sort: { sort_field: CREATED_AT, sort_direction: DESC }) {
        total_count
        items {
          number
          order_date
          status
          total {
            grand_total { value currency }
          }
          items {
            product_name
            product_sku
            quantity_ordered
          }
          payment_methods { name type }
        }
      }
    }
  }
`;

const PO_QUERY = `
  query getPurchaseOrders {
    customer {
      purchase_orders(pageSize: 100, currentPage: 1) {
        total_count
        items {
          uid
          number
          created_at
          status
          grand_total { value currency }
        }
      }
    }
  }
`;

async function queryCommerce(query) {
  try {
    const { data, errors } = await CORE_FETCH_GRAPHQL.fetchGraphQL(query);
    if (errors?.length) throw new Error(errors[0].message);
    return data;
  } catch (e) {
    console.warn('[account-dashboard-jg] query failed:', e.message);
    return null;
  }
}

function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0);
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
}

function getTopProducts(orders, limit = 5) {
  const map = {};
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const k = item.product_sku;
      if (!map[k]) map[k] = { name: item.product_name, sku: k, qty: 0 };
      map[k].qty += item.quantity_ordered || 0;
    });
  });
  return Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, limit);
}

function buildSkeleton() {
  const el = document.createElement('div');
  el.className = 'ad-skeleton';
  el.innerHTML = `
    <div class="ad-sk-bar ad-sk-title"></div>
    <div class="ad-sk-stats">
      <div class="ad-sk-card"></div>
      <div class="ad-sk-card"></div>
      <div class="ad-sk-card"></div>
      <div class="ad-sk-card"></div>
    </div>
    <div class="ad-sk-bar"></div>
    <div class="ad-sk-bar ad-sk-short"></div>
    <div class="ad-sk-bar ad-sk-short"></div>
    <div class="ad-sk-bar ad-sk-short"></div>
  `;
  return el;
}

function statusClass(status = '') {
  return `ad-status--${status.toLowerCase().replace(/[\s_]+/g, '-')}`;
}

function renderDashboard(customer, poData, config) {
  const recentCount = Math.max(1, parseInt(config['recent-orders-count'], 10) || 5);
  const title = config.title || 'My Account Dashboard';
  const orders = customer.orders?.items || [];
  const totalOrders = customer.orders?.total_count || 0;
  const currency = orders[0]?.total?.grand_total?.currency || 'USD';
  const totalSpent = orders.reduce((sum, o) => sum + (o.total?.grand_total?.value || 0), 0);
  const topProducts = getTopProducts(orders);
  const poItems = poData?.customer?.purchase_orders?.items || [];
  const poCount = poData?.customer?.purchase_orders?.total_count ?? null;

  const wrap = document.createElement('div');
  wrap.className = 'account-dashboard-jg';

  wrap.innerHTML = `
    <header class="ad-header">
      <h1 class="ad-title">${title}</h1>
      <p class="ad-welcome">Welcome back, <strong>${customer.firstname} ${customer.lastname}</strong></p>
    </header>

    <section class="ad-stats" aria-label="Account Summary">
      <div class="ad-stat-card">
        <span class="ad-stat-value">${totalOrders}</span>
        <span class="ad-stat-label">Total Orders</span>
      </div>
      <div class="ad-stat-card">
        <span class="ad-stat-value">${formatCurrency(totalSpent, currency)}</span>
        <span class="ad-stat-label">Total Spent</span>
      </div>
      <div class="ad-stat-card">
        <span class="ad-stat-value">${poCount !== null ? poCount : '—'}</span>
        <span class="ad-stat-label">Purchase Orders</span>
      </div>
      <div class="ad-stat-card">
        <span class="ad-stat-value ad-stat-top-product" title="${topProducts[0]?.name || ''}">
          ${topProducts[0]?.name || '—'}
        </span>
        <span class="ad-stat-label">Top Product</span>
      </div>
    </section>

    <section class="ad-section">
      <div class="ad-section-header">
        <h2 class="ad-section-title">Recent Orders</h2>
        <a class="ad-view-all" href="${rootLink('/customer/orders')}">View all →</a>
      </div>
      ${orders.length ? `
        <div class="ad-table-wrap">
          <table class="ad-table">
            <thead><tr>
              <th>Order #</th><th>Date</th><th>Status</th><th>Total</th><th></th>
            </tr></thead>
            <tbody>
              ${orders.slice(0, recentCount).map((o) => `
                <tr>
                  <td><strong>${o.number}</strong></td>
                  <td>${formatDate(o.order_date)}</td>
                  <td><span class="ad-status ${statusClass(o.status)}">${o.status}</span></td>
                  <td>${formatCurrency(o.total?.grand_total?.value, o.total?.grand_total?.currency)}</td>
                  <td><a class="ad-link" href="${rootLink(`/customer/order-details?orderRef=${o.number}`)}">Details</a></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>` : '<p class="ad-empty">No orders found.</p>'}
    </section>

    ${poItems.length ? `
    <section class="ad-section">
      <div class="ad-section-header">
        <h2 class="ad-section-title">Purchase Orders</h2>
        <a class="ad-view-all" href="${rootLink('/customer/purchase-orders')}">View all →</a>
      </div>
      <div class="ad-table-wrap">
        <table class="ad-table">
          <thead><tr>
            <th>PO #</th><th>Date</th><th>Status</th><th>Total</th><th></th>
          </tr></thead>
          <tbody>
            ${poItems.slice(0, recentCount).map((po) => `
              <tr>
                <td><strong>${po.number}</strong></td>
                <td>${formatDate(po.created_at)}</td>
                <td><span class="ad-status ${statusClass(po.status)}">${po.status}</span></td>
                <td>${formatCurrency(po.grand_total?.value, po.grand_total?.currency)}</td>
                <td><a class="ad-link" href="${rootLink(`/customer/purchase-order-details?id=${po.uid}`)}">Details</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>` : ''}

    ${topProducts.length ? `
    <section class="ad-section">
      <h2 class="ad-section-title">Most Purchased Products</h2>
      <ol class="ad-top-products">
        ${topProducts.map((p) => `
          <li class="ad-top-product">
            <div class="ad-tp-info">
              <span class="ad-tp-name">${p.name}</span>
              <span class="ad-tp-sku">SKU: ${p.sku}</span>
            </div>
            <span class="ad-tp-qty">${p.qty} ordered</span>
          </li>
        `).join('')}
      </ol>
    </section>` : ''}
  `;

  return wrap;
}

function renderLoginPrompt() {
  const el = document.createElement('div');
  el.className = 'account-dashboard-jg ad-unauthenticated';
  el.innerHTML = `
    <div class="ad-login-prompt">
      <h2>Sign in to view your dashboard</h2>
      <p>Please sign in to access your orders, purchase history, and spending summary.</p>
      <a class="ad-login-btn" href="${rootLink(CUSTOMER_LOGIN_PATH)}">Sign In</a>
    </div>
  `;
  return el;
}

export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';
  block.append(buildSkeleton());

  if (!checkIsAuthenticated()) {
    block.textContent = '';
    block.append(renderLoginPrompt());
    return;
  }

  const [dashData, poData] = await Promise.all([
    queryCommerce(DASHBOARD_QUERY),
    queryCommerce(PO_QUERY),
  ]);

  block.textContent = '';

  if (!dashData?.customer) {
    block.innerHTML = '<p class="ad-error">Unable to load your dashboard. Please refresh the page or try again later.</p>';
    return;
  }

  block.append(renderDashboard(dashData.customer, poData, config));
}
