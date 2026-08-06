# KasPL Developer & Contribution Guide

This guide explains how to maintain, extend, and contribute to **KasPL v1.0** while adhering to established architectural patterns.

---

## 1. Feature Architecture Pattern

KasPL organizes business modules inside `src/features/[featureName]/`. Every feature directory follows this standard structure:

```
src/features/[featureName]/
├── components/       # Feature-specific React UI components
├── models/           # Mongoose schemas and interfaces
├── repositories/     # Data access layer
├── services/         # Business logic layer
├── types/            # TypeScript interfaces and types
└── validators/       # Zod schemas for input validation
```

---

## 2. Step-by-Step Developer Guides

### How to Add a New Feature

1. **Define Types & Models**:
   - Create `src/features/[featureName]/types/[featureName].types.ts`.
   - Create `src/features/[featureName]/models/[featureName].model.ts`. Define Mongoose Schema, indexes, and interfaces.
2. **Create Zod Validators**:
   - Create `src/features/[featureName]/validators/[featureName].validator.ts` for payload validation.
3. **Build Repository**:
   - Create `src/features/[featureName]/repositories/[featureName].repository.ts`. Use `.lean()` for read-only queries.
4. **Implement Service**:
   - Create `src/features/[featureName]/services/[featureName].service.ts`. Put calculation logic, session guards, and transactions here.
5. **Add API Route Handler**:
   - Create `src/app/api/[featureName]/route.ts`. Parse Zod input and delegate to Service method.
6. **Create UI Components**:
   - Create components in `src/features/[featureName]/components/` and page route under `src/app/[featureName]/page.tsx`.
7. **Write Tests**:
   - Add unit and integration tests in `tests/unit/` and `tests/integration/`.

---

## 3. Coding & Naming Conventions

### File Naming
- Components: `PascalCase.tsx` (e.g. `POSComponent.tsx`, `CheckoutDialog.tsx`)
- Services / Repositories / Models / Validators: `camelCase.feature.ts` (e.g. `expense.service.ts`, `expense.repository.ts`, `expense.model.ts`)
- Utility functions: `camelCase.ts` (e.g. `formatters.ts`, `validators.ts`)

### Code Style
- Strict TypeScript (`"strict": true`).
- Export explicit function return types for public API methods.
- Use `ServiceError` or domain-specific errors (`ExpenseServiceError`, `InventoryServiceError`) for unexpected failures.

---

## 4. Database & Query Guidelines

1. **Always use `.lean()` on read-only queries**:
   ```ts
   return Item.find(filter).sort({ displayOrder: 1 }).lean();
   ```
2. **Use projections when fetching specific fields**:
   ```ts
   return SellingSession.findOne({ publicId }).select('_id status').lean();
   ```
3. **ACID Transactions**: When modifying multiple collections atomically, pass `{ session }` to all Mongoose operations.
