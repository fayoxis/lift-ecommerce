# LIFT E-Commerce

Restructured so a Node.js/Express backend can sit alongside the existing
static frontend.

## Structure

```
lift-ecommerce/
├── client/
│   └── public/          # your original static site, unchanged in content
│       ├── index.html          (was homepage.html)
│       ├── login.html          (was "index _login.html")
│       ├── ourservices.html
│       ├── products.html
│       ├── productsforstudent.html
│       ├── landimgpage.css
│       ├── Services.css
│       ├── jsfolder.js
│       └── jsservice.js
├── server/
│   ├── index.js          # Express app entry point
│   ├── routes/           # route definitions, mounted under /api
│   ├── controllers/      # request handlers / business logic
│   ├── models/           # data models (DB-agnostic placeholder for now)
│   ├── middleware/        # e.g. auth checks
│   └── config/            # db connection, env-driven config
├── package.json
├── .env.example
└── .gitignore
```

## What changed vs the original zip

- All frontend files were moved into `client/public/` with their relative
  links kept intact (they were all flat/relative already, so nothing broke).
- `homepage.html` → `index.html`. Every page's "Home" nav link already
  pointed at `index.html`, but that file didn't exist before — this fixes
  that broken link.
- `index _login.html` (had a space in the filename) → `login.html`.
- Added a `server/` folder with a minimal working Express skeleton: a
  `/api/health` route and an example `/api/products` route/controller, so
  you have a concrete pattern to copy when adding real endpoints.

## Running it

```bash
npm install
npm run dev      # nodemon, auto-restarts on changes
# or
npm start
```

The server serves the frontend from `client/public` and exposes the API
under `/api` (e.g. `http://localhost:3000/api/health`,
`http://localhost:3000/api/products`). Non-API GET requests that don't match
a static file fall back to `index.html`, which is convenient if you later
turn the frontend into a single-page app.

## Next steps

- Pick a database and fill in `server/config/db.js` and `server/models/`.
- Replace the placeholder data in `server/controllers/products.controller.js`
  with real queries.
- Add `auth.routes.js` / `orders.routes.js` following the same
  routes → controller pattern as `products.routes.js`, and register them in
  `server/routes/index.js`.
- Copy `.env.example` to `.env` and fill in real values (never commit `.env`).
