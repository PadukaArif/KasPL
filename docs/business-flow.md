# KasPL End-to-End Business Flow Specification

This document details the complete operational workflows and business rules governing **KasPL v1.0**.

---

## 1. Complete Sales Cycle Workflow

```
[ Step 1: Open Session ]
  Select Period Month & Week
  Assign Exactly 3 Class Member Guardians
  Session Status -> ACTIVE
           |
           v
[ Step 2: Prepare Inventory ]
  Snapshot Master Items to Daily Inventory
  Set Opening Stock & Remaining Stock
  Inventory Status -> OPEN
           |
           v
[ Step 3: Lock Inventory ]
  Transition Inventory Status -> LOCKED
  Opening Stock locked from further edits
           |
           v
[ Step 4: Point of Sale (POS) ]
  Select Sellable Products -> Add to Cart
  Validate Stock Availability -> Process CASH Checkout
  Atomic Transaction Created (TRX-YYYYMMDD-xxxxxx)
  Deduct remainingStock & Increment soldQuantity
           |
           v
[ Step 5: Operational Expenses ]
  Record Expenses (OPERATIONAL, RAW_MATERIAL, EQUIPMENT, OTHER)
  Tied to Active Session ID
           |
           v
[ Step 6: Real-Time Dashboard Updates ]
  Metrics recalculate: Revenue, Cost, Gross Profit, Net Profit, Shares
           |
           v
[ Step 7: Close Session ]
  Transition Session & Inventory Status -> CLOSED
  Calculate Final Net Profit = Gross Profit - Expenses
  Lock 40% School Share / 60% Class Share
           |
           v
[ Step 8: Export & Reporting ]
  Generate Excel (.xlsx) & PDF Reports
```

---

## 2. Business Rules & Financial Formulas

### Rule 1: Active Session Isolation
- Only **one** selling session can be `ACTIVE` globally at any time.
- Starting a new session while an active session exists is strictly rejected (`Masih ada sesi penjualan yang aktif`).
- POS transactions and expense additions are allowed ONLY during an `ACTIVE` session.

### Rule 2: Inventory Snapshot Integrity
- Initializing inventory snapshots copies cost price, selling price, name, and display order from Master Items.
- Modifying Master Item prices later does NOT alter existing session inventory snapshots or past transaction records.
- Opening stock edits are blocked once inventory status moves to `LOCKED` or `CLOSED`.

### Rule 3: POS Atomic Checkout & Stock Deductions
- POS checkout operates within a Mongoose transaction (`ClientSession`).
- If any cart item has `remainingStock < cartQuantity`, the transaction aborts with `OUT_OF_STOCK`.
- Sequence numbers for transaction IDs (`TRX-YYYYMMDD-xxxxxx`) increment atomically via `CounterRepository`.

### Rule 4: Profit Calculation & Distribution Share
- **Gross Revenue**: Sum of `sellingPriceSnapshot * quantity` for all sold items.
- **Gross Cost**: Sum of `costPriceSnapshot * quantity` for all sold items.
- **Gross Profit**: `Gross Revenue - Gross Cost`.
- **Net Profit**: `Gross Profit - Total Session Expenses`.
- **School Share (40%)**: `Math.round(Net Profit * 0.4)` (Only when Net Profit > 0).
- **Class Share (60%)**: `Math.round(Net Profit * 0.6)` (Only when Net Profit > 0).
- If Net Profit <= 0, both School and Class shares evaluate to 0.

### Rule 5: Session Closure & Lock
- Closing a session updates session status to `CLOSED`, sets `endDate = now()`, and transitions all associated daily inventory records to `CLOSED`.
- Once closed, transactions and expenses associated with that session become immutable.
