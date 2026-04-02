# Account Dashboard

A self-service account dashboard block that gives authenticated customers a quick-glance overview of their account activity, including orders, purchase orders, total spend, and most-purchased products. All data is fetched live from Adobe Commerce.

## What It Shows

| Section | Description |
|---|---|
| **Total Orders** | Lifetime count of all orders placed |
| **Total Spent** | Sum of all order grand totals |
| **Purchase Orders** | Count of B2B purchase orders (shows — if not a B2B account) |
| **Top Product** | The most-ordered product by quantity |
| **Recent Orders** | Configurable number of most recent orders with status, date, total, and link to details |
| **Purchase Orders table** | Recent POs with status and total (only shown for B2B accounts) |
| **Most Purchased Products** | Top 5 products ranked by total quantity ordered across all orders |

## Fields

| Field | Description | Default |
|---|---|---|
| `title` | Dashboard heading | `My Account Dashboard` |
| `recent-orders-count` | Number of recent orders/POs to display | `5` |

## Authentication

- **Signed in**: Dashboard loads and displays live data from Adobe Commerce.
- **Signed out**: A sign-in prompt is shown with a link to the login page. No data is fetched.

Verification uses the `auth_dropin_user_token` cookie set by the Commerce auth dropin.

## Data Source

All data is fetched via the Commerce Core GraphQL API using `CORE_FETCH_GRAPHQL` from `scripts/commerce.js`. Two parallel queries are made:

1. **Customer orders** — fetches up to 100 most recent orders including line items (for top product calculation)
2. **Purchase orders** — fetches B2B purchase orders; gracefully returns `—` if the account is not B2B-enabled

## Authoring in DA.live

1. Insert an **Account Dashboard** block on any account page (e.g. `/customer/account`).
2. Optionally update the **Dashboard Title** and **Recent Orders / POs to Display** fields in the properties panel.
3. The block requires no other configuration — it reads commerce data at runtime.

## Status Badge Colors

| Status | Color |
|---|---|
| Complete / Approved | Green |
| Pending / Pending Approval | Yellow |
| Processing | Blue |
| Canceled / Rejected | Red |
| Other | Grey |

## Order Detail Links

- Order details link to `/customer/order-details?orderRef={orderNumber}`
- PO details link to `/customer/purchase-order-details?id={uid}`
- "View all orders" links to `/customer/orders`
- "View all POs" links to `/customer/purchase-orders`

These paths match the Commerce dropin routing constants in `scripts/commerce.js`.
