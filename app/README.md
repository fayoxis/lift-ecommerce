# LIFT E-Commerce — App

A restructured, full-stack version of the LIFT storefront: a clean static
frontend (`index.html` + `pages/` + `css/` + `js/` + `assets/`) backed by an
Express + MySQL API in `server/`, with the schema in `database/`.

```
App/
├── index.html            Home page (the only page at the root)
├── pages/                Every other page (login, products, cart, profile, …)
├── css/                  All stylesheets
├── js/                   All frontend JS (shared shop engine + page-specific)
├── assets/               Uploaded images (avatars, banners) — empty by default
├── server/                Express API
│   ├── index.js           App entry point
│   ├── config/db.js        MySQL connection pool
│   ├── models/              One file per entity, raw SQL via mysql2
│   ├── controllers/         Request handlers
│   ├── middleware/          JWT auth (requireAuth / optionalAuth)
│   └── routes/               Route definitions, mounted under /api
├── database/
│   ├── schema.sql          Tables, foreign keys, coupon + category seed rows
│   ├── seed.sql             Sample products (matches the frontend's demo catalog)
│   └── README.md            Schema reference + localStorage → table mapping
├── package.json
└── .env.example
```

## Why this structure

The original zip mixed a `client/public` folder (with an `assets/` folder
holding both CSS *and* JS) and a barely-started `server/` skeleton. This
version:

- Splits CSS and JS into their own top-level folders instead of one mixed
  `assets/` folder, and frees up `assets/` for actual image uploads.
- Moves every page except `index.html` into `pages/`, so the root stays
  uncluttered and matches a conventional static-site layout.
- Rewrites **every** internal link (`href`, `src`, and the ones built
  dynamically inside the shared JS for the header/footer/search/notifications)
  so navigation and redirects keep working from both the root and `pages/`.
- Replaces the placeholder Express routes with a real MySQL-backed API that
  matches the data the frontend already models (cart, orders, social feed,
  messaging, notifications) — see `database/README.md` for the full mapping
  from the old `localStorage` keys to the new tables.

## Running it

```bash
npm install

# 1. Create + load the database
mysql -u root -p -e "CREATE DATABASE lift_ecommerce"
mysql -u root -p lift_ecommerce < database/schema.sql
mysql -u root -p lift_ecommerce < database/seed.sql   # optional sample products

# 2. Configure environment
cp .env.example .env
# edit .env: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET

# 3. Start the server
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The server serves the frontend (`index.html`, `pages/`, `css/`, `js/`,
`assets/`) and exposes the API under `/api`. `server/` and `database/` are
never served as static files. Visiting `http://localhost:3000` loads the
home page; any other unmatched route falls back to `index.html`.

## Frontend page flow

```
index.html (Home)
 ├─ pages/products.html ──┬─ pages/cart.html ─ pages/order-summary.html ─ pages/payment-method.html ─┬─ pages/payment-mtn.html ────┐
 │                        │                                                                          └─ pages/payment-orange.html ─┤
 │                        │                                                                                                        ▼
 │                        └─ (guest checkout blocked → pages/login.html#login)                                    pages/order-success.html → pages/orders.html
 ├─ pages/marketplace.html ─ pages/profile.html#profileFeedPanel
 ├─ pages/ourservices.html ─ pages/productsforstudent.html
 ├─ pages/about.html · pages/contact.html · pages/how-it-works.html
 └─ Account menu (header, every page)
     ├─ pages/profile.html ─ pages/people.html ─ pages/messages.html?to=<user>
     ├─ pages/orders.html
     ├─ pages/settings.html
     └─ Log out → pages/login.html
```

`js/lift-shop.js` builds the shared header, footer, search panel, account
menu, and notification list once and injects them into every page, so all
of the links above are generated in one place (`liftUrl()` in that file
resolves them correctly whether the current page is `index.html` at the
root or a page inside `pages/`).

## API reference

All routes are mounted under `/api`. Routes marked **[auth]** require an
`Authorization: Bearer <token>` header (returned from signup/login).

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Liveness check |
| POST | `/api/auth/signup` | Create an account → `{ token, user }` |
| POST | `/api/auth/login` | `{ identifier, password }` → `{ token, user }` |
| GET [auth] | `/api/auth/me` | Current user |
| GET [auth] | `/api/users?q=` | Search / list people (for `pages/people.html`) |
| GET [auth] | `/api/users/:id` | Public profile + follower counts |
| PUT [auth] | `/api/users/me` | Update profile (`pages/settings.html`) |
| GET | `/api/products?q=&category=&minPrice=&maxPrice=` | Catalog, with the same filters `pages/products.html` and `pages/marketplace.html` already use |
| GET | `/api/products/:id` | Single product |
| GET [auth] | `/api/cart` | Cart + totals (`pages/cart.html`) |
| POST [auth] | `/api/cart/items` | `{ productId, qty }` → add to cart |
| PUT [auth] | `/api/cart/items/:productId` | `{ qty }` → set quantity |
| DELETE [auth] | `/api/cart/items/:productId` | Remove line |
| DELETE [auth] | `/api/cart` | Clear cart |
| POST [auth] | `/api/cart/coupon` | `{ code }` → apply `LIFT10` / `WELCOME5` |
| GET [auth] | `/api/orders` | Order history (`pages/orders.html`) |
| POST [auth] | `/api/orders` | `{ method, phone }` → place order from current cart |
| GET [auth] | `/api/orders/:id` | Order detail (`pages/order-success.html`, `pages/order-summary.html`) |
| POST [auth] | `/api/orders/:id/cancel` | Cancel while still "processing" |
| GET [auth] | `/api/social/feed` | Posts feed (`pages/profile.html`, `pages/marketplace.html`) |
| POST [auth] | `/api/social/posts` | `{ type, text, productId?, img? }` |
| POST/DELETE [auth] | `/api/social/posts/:postId/like` | Like / unlike |
| POST [auth] | `/api/social/posts/:postId/comments` | `{ text }` |
| POST/DELETE [auth] | `/api/social/follow/:userId` | Follow / unfollow |
| GET [auth] | `/api/messages` | Inbox threads (`pages/messages.html`) |
| GET [auth] | `/api/messages/:userId` | Conversation with one user |
| POST [auth] | `/api/messages` | `{ to, text }` → send |
| GET [auth] | `/api/notifications` | Notification bell |
| POST [auth] | `/api/notifications/read-all` | Mark all read |
| POST [auth] | `/api/notifications/:id/read` | Mark one read |

## Next steps

`js/lift-shop.js` still reads/writes `localStorage` directly for cart,
orders, social, messaging, and notifications (this keeps the demo fully
working with zero backend). To go fully live, swap those
`readJSON`/`writeJSON` calls for `fetch()` calls against the routes above —
the markup, CSS, and page flow don't need to change, only where the data
comes from.
