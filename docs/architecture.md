# KasPL Architecture Specification

This document details the multi-layered architecture, data flow patterns, dependency boundaries, and ACID transaction rules implemented in **KasPL v1.0**.

---

## 1. System Layer Diagram

```
+-----------------------------------------------------------------------+
|                         PRESENTATION LAYER                            |
|    Next.js 16 App Router Pages (/pos, /dashboard, /report, /expense)   |
|    React 19 Client Components, shadcn/ui, Tailwind CSS 4, Recharts    |
+-----------------------------------------------------------------------+
                                   |
                                   v  (HTTP REST / JSON)
+-----------------------------------------------------------------------+
|                            API LAYER                                  |
|         Route Handlers (src/app/api/*) + Zod Input Validation         |
+-----------------------------------------------------------------------+
                                   |
                                   v  (TypeScript Service Methods)
+-----------------------------------------------------------------------+
|                          SERVICE LAYER                                |
|        Business Logic, Profit Share Rules, Calculations, Errors       |
|    (TransactionService, SessionService, InventoryService, etc.)       |
+-----------------------------------------------------------------------+
                                   |
                                   v  (Mongoose ClientSession / Model)
+-----------------------------------------------------------------------+
|                         REPOSITORY LAYER                              |
|         Abstract Data Access, Projections, Lean DB Execution          |
|    (TransactionRepository, InventoryRepository, ItemRepository)       |
+-----------------------------------------------------------------------+
                                   |
                                   v  (MongoDB Wire Protocol)
+-----------------------------------------------------------------------+
|                         DATABASE LAYER                                |
|             MongoDB Replica Set (ACID Multi-Doc Transactions)          |
+-----------------------------------------------------------------------+
```

---

## 2. Layer Responsibilities & Boundaries

### Presentation Layer (`src/app` & `src/features/*/components`)
- Responsible purely for user interaction, state rendering, and user feedback.
- Client components fetch data from internal REST API routes (`/api/*`).
- Dynamic component loading (`next/dynamic`) separates heavy charting and report dialog chunks from initial page loads.

### API Layer (`src/app/api/*`)
- Entry point for HTTP requests.
- Parses request bodies and query parameters.
- Invokes Zod validator schemas.
- Translates `ServiceError` instances into structured JSON responses (`{ success: false, error: string, code: string }`).

### Service Layer (`src/features/*/services`)
- Contains pure business logic, calculations, and state transition guards.
- Enforces session lock checks (`ACTIVE` vs `LOCKED` vs `CLOSED`).
- Calculates revenue, cost, profit, and profit distribution shares (40% School / 60% Class).
- Coordinates multi-repository interactions within MongoDB transactions (`ClientSession`).

### Repository Layer (`src/features/*/repositories`)
- Encapsulates database interaction logic.
- Executes Mongoose queries with field projections (`.select(...)`) and read-only un-hydrated output (`.lean()`).
- Abstracts MongoDB query syntax away from service rules.

### Database Layer (MongoDB)
- Multi-document transactions using a Replica Set ensure atomic write operations during POS checkout.

---

## 3. ACID Transaction Lifecycle (POS Checkout Example)

```
Client POS Checkout Request
           |
           v
POST /api/transaction/checkout
           |
           v
TransactionService.checkout(payload)
           |
   [ startSession() ]
           |
           +---> 1. Find and lock active DailyInventory records
           |
           +---> 2. Validate stock availability (remainingStock >= quantity)
           |
           +---> 3. Calculate subtotal revenue, cost, and profit
           |
           +---> 4. Deduct remainingStock and increment soldQuantity
           |
           +---> 5. Increment Counter sequence (TRX-YYYYMMDD-xxxxxx)
           |
           +---> 6. Insert Transaction header & TransactionDetail rows
           |
           +---> 7. Write ActivityLog record
           |
   [ commitTransaction() ]  ---> SUCCESS: Returns CheckoutSuccessData
   [ abortTransaction() ]   ---> FAILURE: Rollback all changes safely
```

---

## 4. Architectural Rules & Constraints

1. **No Direct Model Access from UI**: Presentation components MUST NOT import Mongoose models directly; data flow goes strictly through API routes or server actions.
2. **Repository Abstraction**: Services access database models exclusively via Repository methods.
3. **Immutability of Closed Data**: Sessions, transactions, and inventory items marked `CLOSED` cannot be updated or deleted.
