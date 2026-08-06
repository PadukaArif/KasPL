# KasPL Folder Architecture Guide

This document maps out the complete repository structure for **KasPL v1.0** and describes the explicit responsibility of each folder.

---

## 1. Directory Tree Map

```
KasPL/
├── .next/                    # Next.js build output cache
├── docs/                     # Full system documentation suite
├── public/                   # Static public assets (favicons, images)
├── src/
│   ├── app/                  # Next.js App Router Pages & REST API routes
│   │   ├── api/              # Internal REST API route handlers
│   │   ├── closing/          # Closing session page
│   │   ├── dashboard/        # Analytics dashboard page
│   │   ├── expense/          # Expense management page
│   │   ├── inventory/        # Daily inventory preparation page
│   │   ├── master/           # Master items & members management pages
│   │   ├── pos/              # Point of sale (POS) page
│   │   ├── report/           # Reports page
│   │   ├── session/          # Start session page
│   │   ├── settings/         # Settings page
│   │   ├── transaction/      # Transaction history page
│   │   ├── globals.css       # Tailwind CSS 4 global styles
│   │   └── layout.tsx        # Root Application Layout & Font setup
│   ├── components/           # Global reusable UI components
│   │   ├── layout/           # MainLayout, Sidebar, Navbar
│   │   ├── shared/           # ErrorState, Skeletons, PageHeader
│   │   └── ui/               # Base UI primitive components (button, dialog, input, table, badge)
│   ├── constants/            # Shared static application constants
│   ├── features/             # Feature-based modular business domains
│   │   ├── activityLog/      # System audit logging feature
│   │   ├── closing/          # Session closing & share calculation feature
│   │   ├── dashboard/        # Analytics & summary metrics feature
│   │   ├── expense/          # Expense tracking feature
│   │   ├── inventory/        # Daily inventory snapshot feature
│   │   ├── item/             # Master item catalog feature
│   │   ├── member/           # Class members feature
│   │   ├── pos/              # Point of Sale UI & cart feature
│   │   ├── report/           # Financial reporting feature
│   │   ├── session/          # Selling session feature
│   │   └── transaction/      # Checkout engine & transaction records feature
│   ├── hooks/                # Global custom React hooks (e.g. use-toast)
│   ├── lib/                  # Framework & database abstractions
│   │   ├── db/               # MongoDB connection singleton (mongodb.ts)
│   │   ├── env.ts            # Zod environment variable validation
│   │   ├── rateLimit.ts      # In-memory API rate limiter
│   │   └── utils.ts          # Classname merger utility (cn)
│   ├── types/                # Global TypeScript definitions
│   └── utils/                # Utility modules (apiResponse, date, errors, formatters, validators)
├── tests/                    # Automated testing suite
│   ├── business-flow/        # End-to-end sales lifecycle test scenarios
│   ├── fixtures/             # Reusable mock datasets
│   ├── helpers/              # Test assertion & setup helpers
│   ├── integration/          # Service & repository integration tests
│   ├── regression/           # 12-module regression test suite
│   └── unit/                 # Unit tests (formatters, validators, calculations, errors)
├── AGENTS.md                 # Agent guidance rules
├── CHANGELOG.md              # Semantic version history
├── README.md                 # Primary project overview & documentation hub
├── package.json              # NPM dependencies & scripts
├── testing_guide.md          # Manual & automated testing instructions
└── tsconfig.json             # TypeScript configuration & path aliases
```

---

## 2. Folder Responsibilities

### `src/app/`
Contains Next.js 16 App Router routing logic. Pages render client/server components; API route handlers under `src/app/api/` handle JSON HTTP requests.

### `src/features/`
Organized by business domain (POS, Inventory, Session, Transaction, Expense, Dashboard, Report, Member, Item, ActivityLog). Keeps feature components, services, repositories, validators, and models co-located for maximum modularity.

### `src/components/`
Global, non-domain specific UI elements:
- `components/ui/`: Base UI primitives (`Button`, `Dialog`, `Input`, `Table`, `Badge`, `Select`).
- `components/layout/`: Responsive Application layout shell (`MainLayout`, `Sidebar`, `Navbar`).
- `components/shared/`: Cross-cutting UI feedback states (`ErrorState`, `DashboardSkeleton`, `TableSkeleton`).

### `src/lib/`
System configuration modules:
- `lib/db/mongodb.ts`: Mongoose database connection singleton with connection caching.
- `lib/env.ts`: Runtime environment variable parser using Zod.
- `lib/rateLimit.ts`: In-memory IP rate limiter to safeguard API endpoints.

### `src/utils/`
Shared utility functions:
- `utils/formatters.ts`: Currency, number, and Indonesian date formatters.
- `utils/validators.ts`: Common validation schemas.
- `utils/errors.ts`: Service error abstraction classes.
- `utils/apiResponse.ts`: Standardized API response formatters.

### `tests/`
Contains 55 automated tests run via `npm run test` using `npx tsx --test`. Tests are isolated from production database collections using mock fixtures.
