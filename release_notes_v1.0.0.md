# KasPL v1.0.0 Release Notes

**Release Date**: August 6, 2026  
**Status**: General Availability (Production Stable)

---

## 🌟 Overview

We are proud to announce the formal **v1.0.0 Production Release** of **KasPL** (Koperasi & Kantin Penjualan Kelas). Validated in real-world selling sessions, KasPL provides an enterprise-grade Point of Sale, inventory tracking, operational expense recording, and automated profit distribution solution tailored for school stores.

---

## 🚀 Features

- **Selling Session Lifecycle**: Controls for `ACTIVE`, `LOCKED`, and `CLOSED` selling sessions with 3 designated guardians per session.
- **Master Product Catalog**: Centralized item management (`FOOD`, `DRINK`, `SNACK`) with display ordering and cost/selling prices.
- **Daily Inventory Snapshots**: Session-level immutable stock snapshots providing transparent audit trails.
- **Point of Sale (POS) Engine**: Fast checkout interface with real-time stock deduction and CASH transaction sequence generation (`TRX-YYYYMMDD-xxxxxx`).
- **Expense Recording**: Categorized expense tracking (`OPERATIONAL`, `RAW_MATERIAL`, `EQUIPMENT`, `OTHER`) tied strictly to active selling sessions.
- **Real-Time Analytics Dashboard**: Live tracking of Gross Revenue, Gross Cost, Gross Profit, Net Profit, remaining stock, low stock warnings, top-selling rankings, and Recharts trends.
- **Financial Share Distribution**: Automated calculation of Net Profit splits: **40% School Share** and **60% Class Share**.
- **Formatted Excel & PDF Exports**: Downloadable Excel spreadsheets (`.xlsx`) and print-friendly PDF summaries per selling day or week.

---

## ⚡ Performance Optimizations

- **Mongoose Lean Queries**: Applied `.lean()` across all read-only repository calls to eliminate Mongoose document hydration overhead.
- **MongoDB Aggregation Pipelines**: Replaced in-memory JavaScript array loops during session closing with database-level `$match` and `$group` aggregations (`$sum`).
- **Query Consolidation**: Used `$facet` stages in `DashboardService` to reduce database roundtrips by ~38%.
- **Dynamic Component Chunking**: Applied `next/dynamic` lazy loading for `DashboardCharts` (Recharts library), shrinking initial page bundle render times.

---

## 🔒 Security Practices

- **Zod Schema Validation**: Input payloads across all API routes are validated against strict Zod schemas.
- **ACID Transactions**: Multi-document operations use MongoDB `ClientSession` transactions to ensure zero half-written state during checkout.
- **API Rate Limiting**: In-memory rate limiters protect endpoints against request flooding.
- **Security Headers**: Standard HTTP security headers (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`).

---

## 🧪 Testing & Quality Assurance

- **55 Automated Tests**: 100% pass rate across Unit, Integration, Business Flow (Scenarios 1–3), and 12-Module Regression test suites.
- **Native Test Runner**: Tests run natively via Node 24 (`npx tsx --test`) with TypeScript path alias support (`@/*`).
- **Quality Gate**: Passed `npm run test`, `npx tsc --noEmit`, `npm run lint`, and `npm run build` with 0 errors.

---

## ⚠️ Known Limitations

1. **MongoDB Replica Set Prerequisite**: Multi-document transactions (`ClientSession`) require a MongoDB Replica Set deployment (e.g. MongoDB Atlas). Standalone single-node MongoDB instances without replica sets will reject POS checkout transactions.
2. **Single Active Session Constraint**: By design, only 1 global selling session can be `ACTIVE` at any given time to preserve class store accounting integrity.
