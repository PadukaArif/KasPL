# KasPL v1.0 - Testing & Quality Assurance Guide

This guide provides instructions for executing tests, reproducing business flows, and validating production behavior for KasPL v1.0.

---

## 1. How to Execute Tests

### Run Full Test Suite
Executes unit tests, integration tests, business flow scenarios, and the 12-module regression suite:
```bash
npm run test
```

### Run Specific Test Categories
- **Unit Tests Only**:
  ```bash
  npx tsx --test tests/unit/*.test.ts
  ```
- **Integration Tests Only**:
  ```bash
  npx tsx --test tests/integration/*.test.ts
  ```
- **Business Flow Scenarios**:
  ```bash
  npx tsx --test tests/business-flow/*.test.ts
  ```
- **Regression Suite**:
  ```bash
  npx tsx --test tests/regression/*.test.ts
  ```

---

## 2. Business Flow Reproduction

### Scenario 1: Complete Sales Lifecycle
1. **Open Session**: Select 3 unique guardians, period month (1–12), and week (1–5). Public ID `KSP-SESSION-xxxx` generated.
2. **Prepare Inventory**: Initialize daily inventory snapshot from active Master Items. `openingStock` and `remainingStock` set to recommended values.
3. **Lock Inventory**: Transition inventory status to `LOCKED` before sales begin.
4. **Point of Sale (POS)**: Add items to cart and process CASH checkout. System validates stock availability, deducts `remainingStock`, increments `soldQuantity`, increments `CounterRepository` sequence (`TRX-YYYYMMDD-xxxxxx`), and logs transaction details.
5. **Add Expense**: Record operational or supply expenses tied to active session (`KSP-EXP-xxxxxx`).
6. **Dashboard Update**: Verify real-time summary cards (Revenue, Gross Profit, Net Profit, Items Sold, Remaining Stock, School 40% Share, Class 60% Share).
7. **Close Session**: Transition session and inventory status to `CLOSED`. Calculates final Net Profit (`Gross Profit - Expenses`) and locks 40%/60% profit distribution.
8. **Export Reports**: Generate Excel export (`/api/export/excel?sessionId=...`) and PDF/Print report (`/api/export/pdf`).

### Scenario 2: Session Reset & Historical Retention
1. **Close Active Session**: Session 1 is closed.
2. **Start New Session**: Session 2 is started.
3. **Verify Resets**: Today summary cards reset to 0 values (Revenue: 0, Net Profit: 0).
4. **Verify Aggregations**: Period/Weekly aggregation cards accumulate metrics across both Session 1 and Session 2.

### Scenario 3: Boundary & Error Prevention Scenarios
1. **Closed Session POS Checkout**: Attempting checkout without an active session throws `NO_ACTIVE_SESSION`.
2. **Post-Lock Inventory Edit**: Modifying opening stock on `LOCKED` or `CLOSED` inventory throws `INVENTORY_LOCKED`.
3. **Closed Session Expense Creation**: Adding expenses to closed sessions throws `NO_ACTIVE_SESSION`.
4. **Duplicate Active Session**: Starting a new session while another is active throws `Masih ada sesi penjualan yang aktif`.
5. **Invalid Payload / ObjectId**: Passing invalid dates or non-24-hex ObjectIds fails Zod parsing or fallback lookups safely.

---

## 3. Production Behavior Validation

Run the Quality Gate prior to deployment:
1. **TypeScript Type Check**:
   ```bash
   npx tsc --noEmit
   ```
2. **ESLint Code Verification**:
   ```bash
   npm run lint
   ```
3. **Next.js Production Build**:
   ```bash
   npm run build
   ```
4. **Automated Test Suite**:
   ```bash
   npm run test
   ```
All four checks must pass with 0 errors before releasing changes to production.
