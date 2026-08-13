# LIFT Database

MySQL / MariaDB schema for the LIFT e-commerce platform.

## Setup

```bash
# 1. Create the database
mysql -u root -p -e "CREATE DATABASE lift_ecommerce"

# 2. Load the schema (tables, constraints, coupon + category seed rows)
mysql -u root -p lift_ecommerce < schema.sql

# 3. Load sample products (optional, matches the frontend's demo catalog)
mysql -u root -p lift_ecommerce < seed.sql

# 4. Point the server at it
cp ../.env.example ../.env
# then edit .env: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET
```

## Files

| File | Purpose |
|---|---|
| `schema.sql` | Tables, foreign keys, coupon codes, starter categories |
| `seed.sql` | Sample products matching the frontend's built-in demo catalog |

## Entity overview

| Table | Purpose |
|---|---|
| `users` | Accounts (auth, profile, avatar/banner) |
| `categories` | Product categories |
| `products` | Catalog items |
| `coupons` | Discount codes (`LIFT10`, `WELCOME5`) |
| `cart_items` | Per-user cart lines (one row per product per user) |
| `orders` / `order_items` | Placed orders and their line items (price/name snapshotted at purchase time) |
| `follows` | Who follows whom |
| `posts` / `post_likes` / `post_comments` | Social feed on the profile/marketplace pages |
| `messages` | Direct messages between users |
| `notifications` | In-app notification bell (orders, follows, likes, comments, messages) |

## Mapping from the old localStorage prototype

The original frontend simulated a backend entirely in the browser via
`localStorage`. Each key below now has a real table so the exact same
UI can be backed by persistent, multi-user data instead:

| localStorage key | Now backed by |
|---|---|
| `launchpad_currentUser` / `launchpad_users` | `users` |
| `lift_cart_v1` | `cart_items` |
| `lift_orders_v1` | `orders`, `order_items` |
| `lift_follows_v1` | `follows` |
| `lift_messages_v1` | `messages` |
| `lift_posts_v1` | `posts`, `post_likes`, `post_comments` |
| `lift_notifications_v1` | `notifications` |
| `lift-theme` | Stays client-side (UI preference, not user data) |

## Wiring the frontend to the API

`js/lift-shop.js` currently reads/writes `localStorage` directly. To
switch it to the real backend, replace the `readJSON`/`writeJSON` calls
in each section (Cart, Orders, Social, Messaging, Notifications) with
`fetch()` calls to the matching `/api/...` route documented in
`../server/README.md` (see route files under `../server/routes/`).
The UI markup, CSS, and page flow do not need to change — only where
the data comes from.
