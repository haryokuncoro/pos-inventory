# POS Inventory

A store-scoped point-of-sale and inventory dashboard built with Next.js. It brings catalog management, checkout, stock tracking, sales reporting, receipts, and store administration into one application.

## What it includes

### POS and inventory

- Search active products and variants from the sales screen.
- Build carts with quantity changes, fixed or percentage discounts, and configurable tax.
- Accept cash, QRIS, card, and transfer payments.
- Validate stock and payment amounts before completing a sale.
- Decrease stock and write inventory transactions atomically when a sale is completed.
- Manage products with multiple variants, SKUs, cost prices, selling prices, stock quantities, and active status.
- Create and manage product categories.
- Import products and initial stock from CSV with a downloadable template, row validation, duplicate-SKU detection, and automatic category creation.

### Sales and receipts

- Browse store sales history with invoice, cashier, totals, status, and sale date.
- View today's sales count and revenue.
- Review sales grouped by product and category, including best-selling products.
- Open a printable receipt for a transaction.
- Include store contact details, receipt header/footer text, payment information, tax, discounts, totals, and change on receipts.

### Administration

- Email/password authentication with Better Auth.
- Google OAuth support when configured.
- Protected dashboard routes and permission checks for administrative features.
- Manage users and roles.
- Update the active store's name, code, address, phone, email, logo URL, currency, timezone, tax settings, negative-stock policy, and receipt branding.
- Keep store catalog, sales, payments, and inventory data isolated by store ID.

## Tech stack

- Next.js 15 App Router and Turbopack
- React 19 and TypeScript
- Tailwind CSS 4
- Drizzle ORM with PostgreSQL / Neon
- Better Auth
- React Hook Form and Zod
- Papa Parse for CSV imports
- Base UI and shadcn-style components

## Routes

- `/login` and `/register` - authentication
- `/dashboard/sales` - point of sale
- `/dashboard/sales/reports` - sales history and reports
- `/dashboard/products` - products, variants, and CSV import
- `/dashboard/categories` - product categories
- `/dashboard/users` - user management
- `/dashboard/settings/store` - store and receipt settings
- `/dashboard/settings/profile` - signed-in user profile
- `/sales/receipt/[id]` - printable transaction receipt

## Getting started

### Prerequisites

- Node.js with npm
- A PostgreSQL database, such as Neon

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create `.env` in the project root:

```env
DATABASE_URL="your_postgres_connection_string"
BETTER_AUTH_SECRET="your_auth_secret"
BETTER_AUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
```

The Google variables are needed only when Google sign-in is enabled. `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` are required for a local run.

### 3. Create the database schema

Generate a migration after schema changes, then apply migrations:

```bash
npm run generate
npm run migrate
```

### 4. Seed data (optional)

```bash
npm run db:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register or sign in, then configure the store before using the POS.

## Desktop application

Electron packaging is available for macOS and Windows. The desktop launcher runs the existing Next.js application on a local loopback server and opens it in a native window.

### Desktop development

With the regular environment variables configured, run:

```bash
npm run dev:desktop
```

### Build a desktop package

```bash
npm run build:desktop
```

Artifacts are written to `release/`. Build Windows installers on Windows or CI. The packaged app supplies a private database location in its per-user application-data directory; the SQLite migration will use this location without requiring a database server.

> The current desktop packaging foundation still uses the configured PostgreSQL database. The planned offline release will replace this with an application-local SQLite database, local-only email/password authentication, and backup/restore support.

## Available scripts

```bash
npm run dev       # Start the development server
npm run dev:desktop # Start Next.js and Electron for desktop development
npm run build     # Create a production build
npm run build:desktop # Package a desktop application
npm run start:desktop # Launch Electron against the local packaged server
npm run start     # Start the production server
npm run lint      # Run ESLint
npm run generate  # Generate Drizzle migrations
npm run migrate   # Apply Drizzle migrations
npm run db:seed   # Seed the database
```
