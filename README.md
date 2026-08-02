# KasPL

KasPL is an Enterprise-Grade Point of Sale (POS) & Inventory Management system for local businesses (Koperasi/Kantin), built with strict TypeScript and modern Next.js 14 architecture. 

## 🚀 Features

- **Sprint 1: Member & Selling Session** 
  - Manage class members and strict selling sessions with lifecycle management (OPEN, LOCKED, CLOSED).
- **Sprint 2: Master Item** 
  - Centralized management for all sellable items (Food, Drink, Snack).
- **Sprint 3A: Daily Inventory** 
  - Immutable daily stock snapshots as the single source of truth during an active selling session.
- **Sprint 3B: POS Cart Engine** 
  - Real-time cart calculations linking directly to the Daily Inventory snapshots.
- **Sprint 3C: Checkout Engine** 
  - Multi-document ACID transactions via MongoDB ClientSession for guaranteed financial atomicity and idempotency.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: Strict TypeScript
- **Database**: MongoDB (Replica Set required for ACID transactions)
- **ODM**: Mongoose
- **Styling**: Tailwind CSS, shadcn/ui, Lucide Icons
- **Validation**: Zod

## 📂 Architecture & Folder Structure

The project strictly follows a **Feature-Based Architecture** and the **Repository Pattern**.

```
src/
├── app/                  # Next.js App Router (Pages & API Routes)
├── components/           # Global shared UI components
├── features/             # Feature modules (Business Logic & Data Access)
│   ├── inventory/        # Daily Inventory Feature
│   ├── item/             # Master Item Feature
│   ├── member/           # Member Feature
│   ├── pos/              # POS UI & Cart Feature
│   ├── session/          # Selling Session Feature
│   └── transaction/      # Checkout Engine Feature
│       ├── components/   # Feature-specific UI components
│       ├── models/       # Mongoose Models
│       ├── repositories/ # Database abstract layer (Requires ClientSession)
│       ├── services/     # Core Business Logic
│       ├── types/        # TypeScript Interfaces
│       └── validators/   # Zod Schemas
├── lib/                  # Shared utilities (DB connection, etc.)
└── utils/                # Helper functions (Errors, Formatters)
```

## ⚙️ Installation Guide

1. Clone the repository:
   ```bash
   git clone https://github.com/PadukaArif/KasPL.git
   cd KasPL
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the required values.
   ```bash
   cp .env.example .env
   ```
   **Note:** You MUST use a MongoDB Replica Set (e.g., MongoDB Atlas) for multi-document transactions to work.

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🔐 Environment Variables

The `.env.example` file contains all required keys. Never commit your actual `.env` file.
```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## 📜 Available Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Creates an optimized production build.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to find and fix problems.

## 📈 Future Roadmap

- **Sprint 4**: Expense Management Module
- **Sprint 5**: Excel Export & Receipt Printing
- **Sprint 6**: Analytics & Dashboard
- **Sprint 7**: History & Ledger
