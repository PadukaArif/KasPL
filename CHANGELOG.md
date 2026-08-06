# Changelog - KasPL

All notable changes to the KasPL project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-06

### Added
- **Sprint 1 (Session & Class Members)**:
  - Class member management model, validator, repository, and service.
  - Selling session lifecycle (`ACTIVE`, `CLOSED`) with 3 designated guardians per session.
- **Sprint 2 (Master Items)**:
  - Master item management catalog (`FOOD`, `DRINK`, `SNACK`) with display ordering and cost/selling price tracking.
- **Sprint 3A & 3B (Daily Inventory & POS Engine)**:
  - Daily inventory snapshot initialization per selling session (`OPEN`, `LOCKED`, `CLOSED`).
  - Real-time Point of Sale (POS) cart calculation engine with live stock validation.
- **Sprint 3C (Checkout Engine & Transactions)**:
  - ACID multi-document transactions using MongoDB `ClientSession`.
  - Transaction sequence generation (`TRX-YYYYMMDD-xxxxxx`) and transaction detail snapshots.
- **Sprint 4 (Expense Management)**:
  - Operational expense module supporting categories (`OPERATIONAL`, `RAW_MATERIAL`, `EQUIPMENT`, `OTHER`).
  - Session-level expense isolation and validation rules.
- **Sprint 5 (Exports & Reports)**:
  - Excel spreadsheet generation (`/api/export/excel`) using `ExcelJS`.
  - Printable PDF summary generation (`/api/export/pdf`) and daily detail modal reports.
- **Sprint 6 (Analytics Dashboard)**:
  - Summary metrics (Revenue, Gross Profit, Net Profit, Remaining Stock, School 40% Share, Class 60% Share).
  - Top-selling product rankings, low stock warnings, and interactive Recharts visualizations.
- **Phase 3 (Performance Optimization)**:
  - Mongoose read-only `.lean()` query optimizations.
  - Reduced MongoDB roundtrips using `$facet` aggregations in `DashboardService`.
  - Database-level aggregations in `ClosingService.calculateSummary`.
  - Dynamic import lazy loading for `DashboardCharts` component.
- **Phase 4 (Automated Test Suite)**:
  - Comprehensive 55-test suite across Unit, Integration, Business Flow (Scenarios 1–3), and 12-Module Regression testing.
  - Native Node 24 test runner setup via `npx tsx --test`.
- **Phase 5 (Documentation & Developer Experience)**:
  - Professional `README.md`, `CHANGELOG.md`, `testing_guide.md`, and complete `/docs` suite (`architecture.md`, `database.md`, `api.md`, `business-flow.md`, `deployment.md`, `developer-guide.md`, `folder-structure.md`).

### Milestones
- **Real-World Selling Session Launch**: Validated in real-world selling sessions with 100% financial accuracy and zero transactional data loss.
