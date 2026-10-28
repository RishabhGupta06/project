# Bloom — Mini Online Store

Bloom is a polished, responsive mini online store built for the frontend assignment. It presents thoughtfully designed everyday products with catalogue browsing, filtering, cart management, checkout, stock updates, and a simple admin dashboard.

## Features

- Responsive storefront for desktop and mobile
- Product catalogue with product imagery, descriptions, ratings, and stock counts
- Category filtering for Home, Kitchen, Stationery, and Accessories
- Search and sorting by featured, rating, and price
- Add-to-bag and quantity controls
- Free shipping calculation for orders over $75
- Checkout form with browser validation
- Order confirmation flow
- Stock reduction after a successful order
- Admin dashboard with revenue, orders, and inventory views
- Low-stock indicators
- Accessible button labels and responsive layout

## Tech stack

- React
- Vite
- JavaScript
- CSS
- Lucide React icons

## Run locally

Requirements:

- Node.js 18 or newer
- npm

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Production build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Admin dashboard

Open the store and click **Admin dashboard** at the bottom of the page. The dashboard includes:

- Revenue overview
- Order count
- Product count
- Low-stock count
- Recent orders
- Inventory health

## Project structure

```text
.
├── index.html
├── package.json
├── src
│   ├── main.jsx
│   └── styles.css
└── README.md
```

## Notes

This is a frontend demonstration project. Product data and order data are stored in React state for the demo, and the checkout form does not process real payments.

