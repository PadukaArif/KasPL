# KasPL Database Schema Specification

This document provides a comprehensive reference for all 9 MongoDB collections in **KasPL v1.0**.

---

## 1. Collection Summary

| Collection Name | Model Name | Description | Generated Public ID Prefix |
|---|---|---|---|
| `items` | `Item` | Master product catalog | `KSP-ITEM-xxxx` |
| `classmembers` | `ClassMember` | Students and teachers | `KSP-MBR-xxxx` |
| `sellingsessions` | `SellingSession` | Active & historical selling sessions | `KSP-SESSION-xxxx` |
| `dailyinventories` | `DailyInventory` | Session stock snapshots | `KSP-INV-xxxxxx` |
| `transactions` | `Transaction` | Header records for POS sales | `TRX-YYYYMMDD-xxxxxx` |
| `transactiondetails` | `TransactionDetail` | Line items for transactions | N/A (Linked via `transactionId`) |
| `expenses` | `Expense` | Operational expenses | `KSP-EXP-xxxxxx` |
| `activitylogs` | `ActivityLog` | System & user action audit logs | N/A |
| `counters` | `Counter` | Atomic sequence counters | N/A |

---

## 2. Detailed Collection Specifications

### 2.1 `items`
Master products available for sale in the class store.

- **Fields**:
  - `_id`: `ObjectId` (Primary Key)
  - `publicId`: `String` (Unique, e.g. `KSP-ITEM-0001`)
  - `name`: `String` (Required, trim)
  - `category`: `String` (`FOOD` | `DRINK` | `SNACK`)
  - `costPrice`: `Number` (Required, min 0)
  - `sellingPrice`: `Number` (Required, min 0)
  - `recommendedStock`: `Number` (Default 0, min 0)
  - `displayOrder`: `Number` (Default 0)
  - `isActive`: `Boolean` (Default `true`)
  - `deletedAt`: `Date` | `null` (Soft delete timestamp)
  - `createdAt`: `Date`, `updatedAt`: `Date`
- **Indexes**:
  - `{ publicId: 1 }` (Unique)
  - `{ category: 1 }`
  - `{ name: 1 }`

---

### 2.2 `classmembers`
Class members who act as session guardians or cashiers.

- **Fields**:
  - `_id`: `ObjectId`
  - `publicId`: `String` (Unique, e.g. `KSP-MBR-0001`)
  - `name`: `String` (Required)
  - `gender`: `String` (`MALE` | `FEMALE`)
  - `attendanceNumber`: `Number` (Required)
  - `role`: `String` (`STUDENT` | `TEACHER` | `OTHER`, default `STUDENT`)
  - `isActive`: `Boolean` (Default `true`)
  - `createdAt`: `Date`, `updatedAt`: `Date`
- **Indexes**:
  - `{ publicId: 1 }` (Unique)
  - `{ attendanceNumber: 1 }`

---

### 2.3 `sellingsessions`
Represents a period of active store selling.

- **Fields**:
  - `_id`: `ObjectId`
  - `publicId`: `String` (Unique, e.g. `KSP-SESSION-0001`)
  - `periodMonth`: `Number` (1–12)
  - `periodWeek`: `Number` (1–5)
  - `startDate`: `Date`
  - `endDate`: `Date` | `null`
  - `status`: `String` (`ACTIVE` | `CLOSED`, default `ACTIVE`)
  - `guardians`: Array of `ObjectId` (Ref: `ClassMember`, exactly 3 guardians)
  - `createdAt`: `Date`, `updatedAt`: `Date`
- **Indexes**:
  - `{ publicId: 1 }` (Unique)
  - `{ status: 1 }`
  - `{ periodMonth: 1, periodWeek: 1 }`

---

### 2.4 `dailyinventories`
Stock snapshots created per item for a specific selling session.

- **Fields**:
  - `_id`: `ObjectId`
  - `publicId`: `String` (Unique, e.g. `KSP-INV-000001`)
  - `sessionId`: `ObjectId` (Ref: `SellingSession`)
  - `itemId`: `ObjectId` (Ref: `Item`)
  - `itemPublicId`: `String`
  - `itemNameSnapshot`: `String`
  - `categorySnapshot`: `String` (`FOOD` | `DRINK` | `SNACK`)
  - `costPriceSnapshot`: `Number`
  - `sellingPriceSnapshot`: `Number`
  - `displayOrderSnapshot`: `Number`
  - `openingStock`: `Number` (min 0)
  - `remainingStock`: `Number` (min 0)
  - `soldQuantity`: `Number` (default 0)
  - `status`: `String` (`OPEN` | `LOCKED` | `CLOSED`, default `OPEN`)
  - `createdAt`: `Date`, `updatedAt`: `Date`
- **Indexes**:
  - `{ publicId: 1 }` (Unique)
  - `{ sessionId: 1, itemId: 1 }` (Compound Unique)
  - `{ sessionId: 1 }`
  - `{ status: 1 }`

---

### 2.5 `transactions`
Header transaction records created upon POS checkout.

- **Fields**:
  - `_id`: `ObjectId`
  - `publicId`: `String` (Unique, e.g. `TRX-20260805-000001`)
  - `version`: `Number` (default 1)
  - `businessDate`: `String` (YYYY-MM-DD)
  - `periodMonth`: `Number`
  - `periodWeek`: `Number`
  - `sessionId`: `ObjectId` (Ref: `SellingSession`)
  - `sessionPublicId`: `String`
  - `cashierMemberId`: `String`
  - `cashierName`: `String`
  - `guardianMemberIds`: Array of `String`
  - `guardianNames`: Array of `String`
  - `paymentMethod`: `String` (`CASH`)
  - `totalItems`: `Number`
  - `totalQuantity`: `Number`
  - `grossRevenue`: `Number`
  - `grossCost`: `Number`
  - `grossProfit`: `Number`
  - `netProfit`: `Number`
  - `status`: `String` (`SUCCESS` | `CANCELLED`, default `SUCCESS`)
  - `createdAt`: `Date`, `updatedAt`: `Date`
- **Indexes**:
  - `{ publicId: 1 }` (Unique)
  - `{ businessDate: 1 }`
  - `{ periodMonth: 1, periodWeek: 1 }`
  - `{ sessionId: 1 }`
  - `{ createdAt: -1 }`

---

### 2.6 `transactiondetails`
Line items belonging to a transaction header.

- **Fields**:
  - `_id`: `ObjectId`
  - `transactionId`: `ObjectId` (Ref: `Transaction`)
  - `inventoryId`: `ObjectId` (Ref: `DailyInventory`)
  - `itemId`: `ObjectId` (Ref: `Item`)
  - `itemPublicId`: `String`
  - `itemNameSnapshot`: `String`
  - `categorySnapshot`: `String`
  - `costPriceSnapshot`: `Number`
  - `sellingPriceSnapshot`: `Number`
  - `quantity`: `Number`
  - `subtotalRevenue`: `Number`
  - `subtotalCost`: `Number`
  - `subtotalProfit`: `Number`
  - `createdAt`: `Date`, `updatedAt`: `Date`
- **Indexes**:
  - `{ transactionId: 1 }`
  - `{ inventoryId: 1 }`

---

### 2.7 `expenses`
Operational expenses recorded during a session.

- **Fields**:
  - `_id`: `ObjectId`
  - `publicId`: `String` (Unique, e.g. `KSP-EXP-000001`)
  - `sessionId`: `ObjectId` (Ref: `SellingSession`)
  - `title`: `String`
  - `category`: `String` (`OPERATIONAL` | `RAW_MATERIAL` | `EQUIPMENT` | `OTHER`)
  - `amount`: `Number` (min 0)
  - `notes`: `String` (Optional)
  - `expenseDate`: `Date`
  - `deletedAt`: `Date` | `null`
  - `createdAt`: `Date`, `updatedAt`: `Date`
- **Indexes**:
  - `{ publicId: 1 }` (Unique)
  - `{ sessionId: 1 }`
  - `{ category: 1, expenseDate: -1 }`

---

### 2.8 `activitylogs`
System and user action audit logs.

- **Fields**:
  - `_id`: `ObjectId`
  - `action`: `String`
  - `actor`: `String` (default `SYSTEM`)
  - `details`: `String`
  - `entity`: `String` (Optional)
  - `entityId`: `String` (Optional)
  - `sessionId`: `ObjectId` (Optional)
  - `createdAt`: `Date`, `updatedAt`: `Date`
- **Indexes**:
  - `{ createdAt: -1 }`

---

### 2.9 `counters`
Sequence generator counter for atomic numbering.

- **Fields**:
  - `_id`: `ObjectId`
  - `name`: `String` (e.g. `TRX`)
  - `date`: `String` (e.g. `20260805`)
  - `sequence`: `Number` (Incremented atomically)
- **Indexes**:
  - `{ name: 1, date: 1 }` (Compound Unique)
