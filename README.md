# POS Inventory

A Next.js point-of-sale and inventory management application for managing products, categories, users, sales transactions, and sales reports in a single dashboard.

## Features

- Secure authentication with Better Auth
  - Email/password sign in
  - Google OAuth support
  - Protected dashboard routes via middleware
- Product management
  - Create, update, and manage categories
  - Create products with multiple variants
  - Track SKU, price, stock quantity, and active status
- POS / sales workflow
  - Add products to cart
  - Select payment method and amount
  - Automatically calculate totals, discounts, and tax
  - Reduce stock on successful sales
  - Record inventory transactions
- Sales reporting
  - View transaction history
  - Inspect daily sales records and invoice data
- User management
  - Dashboard for managing users
- Database and schema
  - PostgreSQL with Drizzle ORM
  - inventory, sales, payment, and auth tables

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM
- Neon Postgres
- Better Auth
- shadcn/ui style components

## Project Structure

- `app/` – route pages and app router entry points
- `components/` – UI components for auth, dashboard, POS, products, sales, and reports
- `db/` – database schema, connection, and seed data
- `lib/` – auth setup, helper utilities, and server actions
- `migrations/` – generated SQL migrations
- `middleware.ts` – route protection for dashboard pages

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create a `.env` file in the project root with at least:

```env
DATABASE_URL="your_neon_postgres_connection_string"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
BETTER_AUTH_SECRET="your_auth_secret"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Run database migrations

```bash
npm run generate
npm run migrate
```

### 4. Seed demo data

```bash
npm run db:seed
```

### 5. Start the app

```bash
npm run dev
```

Then open http://localhost:3000

## Authentication

The app uses Better Auth with a Drizzle adapter. Authentication is protected by middleware for the `/dashboard` route group. Users can sign up, sign in, and log out from the app UI.

## Sales Flow

The POS workflow is built around the sales server actions:

- fetch active products and variants
- create sale records with invoice numbers
- validate stock, quantity, discounts, and payment
- create payment rows and inventory transactions
- update stock automatically on sale completion

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run generate
npm run migrate
npm run db:seed
```

## Notes

This project is designed as a local business inventory and POS dashboard. It is ready for extension with features like order history filtering, stock adjustments, supplier management, and admin analytics.
