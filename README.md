# KasPL v1.0 - Koperasi & Kantin Penjualan Kelas

> Enterprise-Grade Point of Sale (POS), Inventory & Financial Management System for School Class Stores.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#quality-gate)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](#license)

---

## 📌 Overview

**KasPL** is a specialized, production-tested web application designed for school class selling sessions (Kantin / Koperasi Kelas). It ensures financial integrity, stock tracking, operational expense recording, real-time analytics, and automated profit distribution calculation (40% School Share / 60% Class Share).

The application features strict session state controls (`ACTIVE`, `LOCKED`, `CLOSED`), ACID transaction safety via MongoDB client sessions, dynamic reports (Excel & PDF export), and lightweight performance optimization.

---

## ✨ Features

- **Selling Session Management**: Start sessions with 3 designated guardians, enforce active session isolation, and close sessions with automatic profit share calculations.
- **Master Item Management**: Manage catalog of sellable products categorized into `FOOD`, `DRINK`, and `SNACK` with display ordering and cost/selling prices.
- **Daily Inventory Snapshots**: Lock stock snapshots per selling session to ensure immutable audit trails and prevent stock tampering.
- **Point of Sale (POS) Engine**: Fast checkout interface with real-time stock deduction, CASH payment validation, and transactional sequence generation (`TRX-YYYYMMDD-xxxxxx`).
- **Operational Expense Tracking**: Record expenses (`OPERATIONAL`, `RAW_MATERIAL`, `EQUIPMENT`, `OTHER`) tied to active selling sessions.
- **Real-Time Analytics Dashboard**: Monitor gross revenue, cost of goods, net profit, low stock warnings, top-selling products, and interactive Recharts visualizations.
- **Financial Reports & Exports**: Export detailed Excel spreadsheets (`.xlsx`) and print-friendly PDF summaries per selling day or week.
- **Automated Quality & Regression Test Suite**: Integrated unit, integration, business flow, and 12-module regression tests (`npm run test`).

---

## 🖼️ UI Screenshots

| POS Checkout Screen | Analytics Dashboard |
|---|---|
| ![POS Screenshot Placeholder](public/favicon.ico) | ![Dashboard Screenshot Placeholder](public/favicon.ico) |

*Note: Visual interfaces can be inspected directly in the application pages under `/pos` and `/dashboard`.*

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript 5 (Strict Mode)](https://www.typescriptlang.org/)
- **UI Components**: [React 19](https://react.dev/), Tailwind CSS 4, Lucide Icons
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) (Replica Set required for ACID transactions) with [Mongoose 9](https://mongoosejs.com/)
- **Schema Validation**: [Zod 4](https://zod.dev/)
- **Charts**: [Recharts 3](https://recharts.org/) (Dynamically imported for bundle optimization)
- **Exports**: [ExcelJS 4](https://github.com/exceljs/exceljs)
- **Testing**: Node 24 Native Test Runner (`node:test` & `node:assert`) + `tsx`

---

## 📂 Folder Structure Overview

```
KasPL/
├── docs/                 # Production & developer documentation suite
├── public/               # Static assets & public icons
├── src/
│   ├── app/              # Next.js App Router pages, layouts & API routes
│   ├── components/       # Shared UI components (layout, skeletons, dialogs)
│   ├── features/         # Modular business domains (POS, Item, Session, Inventory, Expense, Report, Dashboard)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Database connection, env validation, rate limiters
│   ├── types/            # Global TypeScript interfaces
│   └── utils/            # Helper functions (formatters, validators, errors)
└── tests/                # Automated test suites (unit, integration, business-flow, regression)
```

For detailed folder responsibilities, see [docs/folder-structure.md](docs/folder-structure.md).

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: v20.x or higher (v24.x recommended)
- **MongoDB**: A running MongoDB instance with Replica Set enabled (e.g., [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/PadukaArif/KasPL.git
   cd KasPL
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your `.env` variables:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/kaspl_db?retryWrites=true&w=majority
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Start Local Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📜 Available Scripts

- `npm run dev`: Launch local Next.js development server.
- `npm run build`: Compile Next.js production build.
- `npm run start`: Launch production server.
- `npm run lint`: Execute ESLint code checks.
- `npm run test`: Run the full 55-test suite across unit, integration, business flow, and regression modules.

---

## 🧪 Testing & Quality Gate

Run all verification checks prior to committing or deploying:

```bash
npm run test         # Run unit, integration & business flow tests
npx tsc --noEmit     # Check TypeScript compilation
npm run lint         # Check ESLint formatting & rules
npm run build        # Build production bundle
```

For detailed test scenarios and reproduction steps, refer to [testing_guide.md](testing_guide.md).

---

## 🔒 Security Practices

- Input payloads sanitized and validated via Zod schemas.
- Database access abstracted behind strict Repository layers.
- In-memory rate limiting applied to key API routes.
- Multi-document ACID transactions with ClientSession ensuring idempotency and zero half-written state.

---

## 📚 Documentation Index

Explore the complete documentation in `/docs`:

- [Architecture Overview](docs/architecture.md)
- [Database Schema & Collections](docs/database.md)
- [API Reference Guide](docs/api.md)
- [Business Flow Workflows](docs/business-flow.md)
- [Deployment Guide](docs/deployment.md)
- [Developer & Contribution Guide](docs/developer-guide.md)
- [Folder Architecture Map](docs/folder-structure.md)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author & Maintainer

Developed with ❤️ for Koperasi & Kantin Penjualan Kelas.  
Maintainer: **PadukaArif / KasPL Core Team**
