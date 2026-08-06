# KasPL API Reference Guide

This document details all internal REST API endpoints implemented in **KasPL v1.0**.

---

## 1. Response Structure Standard

All API endpoints return JSON conforming to the following payload contract:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operasi berhasil."
}
```

### Error Response
```json
{
  "success": false,
  "error": "Pesan kesalahan",
  "code": "ERROR_CODE"
}
```

---

## 2. API Endpoints

### 2.1 Selling Session API

#### `GET /api/session/active`
- **Description**: Returns the currently active selling session or `null`.
- **Response**: `{ success: true, data: SessionObject | null }`

#### `POST /api/session/start`
- **Description**: Starts a new selling session.
- **Request Body**:
  ```json
  {
    "periodMonth": 8,
    "periodWeek": 1,
    "guardians": ["KSP-MBR-0001", "KSP-MBR-0002", "KSP-MBR-0003"]
  }
  ```
- **Validation**: Requires periodMonth (1–12), periodWeek (1–5), and exactly 3 unique guardian IDs.
- **Errors**: `400 Bad Request` if another session is already active or validation fails.

#### `POST /api/session/close`
- **Description**: Closes an active selling session and locks inventory.
- **Request Body**: `{ "sessionId": "KSP-SESSION-0001" }`
- **Response**: `{ success: true, data: { summary: ClosingSummary } }`

#### `GET /api/session/summary`
- **Description**: Returns closing summary calculation metrics for a session.
- **Query Params**: `?sessionId=KSP-SESSION-0001`

---

### 2.2 Master Item API

#### `GET /api/item`
- **Description**: Retrieves paginated list of master items.
- **Query Params**: `?search=nasi&category=FOOD&page=1&limit=10`

#### `POST /api/item`
- **Description**: Creates a new master item.
- **Request Body**:
  ```json
  {
    "name": "Nasi Goreng",
    "category": "FOOD",
    "costPrice": 8000,
    "sellingPrice": 12000,
    "recommendedStock": 20,
    "displayOrder": 1
  }
  ```

#### `GET /api/item/[id]`
- **Description**: Gets single item by ObjectId or publicId (`KSP-ITEM-xxxx`).

#### `PATCH /api/item/[id]`
- **Description**: Updates master item fields.

#### `DELETE /api/item/[id]`
- **Description**: Soft deletes master item (`deletedAt = now()`, `isActive = false`).

---

### 2.3 Daily Inventory API

#### `GET /api/inventory/session/[sessionId]`
- **Description**: Fetches daily stock items for a given session.

#### `POST /api/inventory/initialize`
- **Description**: Initializes daily stock snapshots from master items.
- **Request Body**:
  ```json
  {
    "sessionId": "KSP-SESSION-0001",
    "items": [{ "itemId": "KSP-ITEM-0001", "openingStock": 20 }]
  }
  ```

#### `POST /api/inventory/lock`
- **Description**: Transitions inventory state to `LOCKED`.

#### `POST /api/inventory/close`
- **Description**: Transitions inventory state to `CLOSED`.

#### `PATCH /api/inventory/[id]`
- **Description**: Updates opening stock for an item if inventory is still `OPEN`.

#### `POST /api/inventory/sync`
- **Description**: Syncs missing master items into active session inventory.

---

### 2.4 Point of Sale (POS) API

#### `GET /api/pos/items`
- **Description**: Returns sellable inventory items for active session.

#### `POST /api/transaction/checkout`
- **Description**: Executes atomic POS checkout transaction.
- **Request Body**:
  ```json
  {
    "businessDate": "2026-08-05",
    "cart": [
      { "inventoryId": "64f1a2b3c4d5e6f7a8b9c0c1", "quantity": 2 }
    ]
  }
  ```
- **Response**: `{ success: true, data: CheckoutSuccessData }`
- **Errors**: `NO_ACTIVE_SESSION`, `OUT_OF_STOCK`, `INVENTORY_NOT_FOUND`.

#### `GET /api/transaction`
- **Description**: Paginated transaction header history (`?search=...&startDate=...&status=SUCCESS`).

#### `GET /api/transaction/[id]`
- **Description**: Retrieves transaction header and detail line items.

---

### 2.5 Expense API

#### `GET /api/expense`
- **Description**: Paginated expense list (`?search=...&category=OPERATIONAL&page=1&limit=10`).

#### `POST /api/expense`
- **Description**: Records a new expense tied to active session.
- **Request Body**:
  ```json
  {
    "title": "Beli Es Batu",
    "category": "OPERATIONAL",
    "amount": 10000,
    "notes": "Keperluan es teh"
  }
  ```

#### `GET /api/expense/[id]` / `PATCH /api/expense/[id]` / `DELETE /api/expense/[id]`
- **Description**: Fetch, update, or soft-delete expense record.

#### `GET /api/expense/summary`
- **Description**: Returns today, thisWeek, and activeSession expense totals.

---

### 2.6 Analytics & Reports API

#### `GET /api/dashboard`
- **Description**: Returns full metrics payload for operational dashboard.

#### `GET /api/report`
- **Description**: Returns period summary report aggregated by weeks and days (`?periodMonth=8`).

#### `GET /api/report/day`
- **Description**: Returns detailed day report (`?date=2026-08-05`).

---

### 2.7 Export API

#### `GET /api/export/excel`
- **Description**: Downloads formatted Excel spreadsheet (`.xlsx`) (`?sessionId=...` or `?periodMonth=...`).

#### `GET /api/export/pdf`
- **Description**: Returns HTML/print payload for PDF report output.

#### `GET /api/export/print`
- **Description**: Returns print-ready thermal/A4 receipt payload.

---

### 2.8 Class Member & Activity Log API

#### `GET /api/member` & `POST /api/member`
- **Description**: List and create class members.

#### `GET /api/activity-log`
- **Description**: Paginated audit log records.
