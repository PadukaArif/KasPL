# KasPL Deployment & Hosting Guide

This document details environment configuration, production build execution, MongoDB Atlas setup, and deployment on Vercel or custom Linux VPS instances.

---

## 1. Prerequisites & Environment Setup

### Environment Variables
Create a `.env` file in the project root:

```env
# MongoDB Connection String (Replica Set Required)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/kaspl_db?retryWrites=true&w=majority

# Public Base URL
NEXT_PUBLIC_APP_URL=https://kaspl.vercel.app

# Node Environment
NODE_ENV=production
```

> [!IMPORTANT]
> A **MongoDB Replica Set** (e.g. MongoDB Atlas cluster) is **mandatory** because KasPL POS checkout uses multi-document ACID transactions via `startSession()`. Single-node standalone MongoDB instances without replica sets will reject transactions.

---

## 2. Local Environment Setup

1. Clone repository and install dependencies:
   ```bash
   git clone https://github.com/PadukaArif/KasPL.git
   cd KasPL
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Run verification tests:
   ```bash
   npm run test
   ```

---

## 3. Production Build Execution

Compile the production bundle locally or in CI/CD pipelines:

```bash
# Typecheck
npx tsc --noEmit

# Lint
npm run lint

# Build
npm run build

# Start Production Server
npm run start
```

---

## 4. MongoDB Atlas Connection Setup

1. Log into [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create an **M0 (Free Tier)** or higher cluster (all Atlas clusters run as Replica Sets automatically).
3. Under **Database Access**, create a database user with `readWrite` permissions.
4. Under **Network Access**, add IP address `0.0.0.0/0` (or Vercel deployment IP ranges).
5. Copy the connection string format:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/kaspl_db?retryWrites=true&w=majority`
6. Set `MONGODB_URI` in `.env` / Vercel Environment Variables.

---

## 5. Vercel Deployment

1. Push your repository to GitHub / GitLab.
2. Log into [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import the `KasPL` repository.
4. Framework Preset: **Next.js**.
5. Configure Environment Variables in Vercel settings:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_APP_URL`
   - `NODE_ENV = production`
6. Click **Deploy**.
7. Vercel will automatically build and publish the application with Serverless API route support.
