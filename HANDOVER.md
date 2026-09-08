# Project Handover Guide — UniTrade

Welcome to the **UniTrade** repository! This handover document is written for any engineer, contributor, or evaluator who clones or forks this repository. It provides everything you need to know to set up, run, test, and develop both the frontend and backend smoothly.

---

## 1. Repository Quick Links & Overview

- **GitHub Repository:** [https://github.com/Darkartemis810/unicode-siddharthjunior.git](https://github.com/Darkartemis810/unicode-siddharthjunior.git)
- **Primary Tech Stack:**
  - **Frontend:** React 19, Vite 8, Vanilla CSS (Dark glassmorphism design system).
  - **Backend:** Node.js (v18+ / v24 recommended), Express 5, Mongoose 8.
  - **Database:** MongoDB (Local instance or MongoDB Atlas Cloud).
  - **Authentication:** JWT (`jsonwebtoken`) & `bcryptjs`.
  - **File Uploads:** Multer with dedicated filters for documents and image previews.
  - **Code Quality:** Oxlint (`oxlint --deny-warnings`).

---

## 2. Directory Structure

```text
Unitrade-main/
│
├── src/                          # React Frontend source code
│   ├── App.jsx                   # Main application shell with tab routers & state
│   ├── App.css                   # Custom modern dark design system & responsive rules
│   ├── main.jsx                  # React DOM entrypoint
│   └── assets/                   # Static logos, icons, and hero illustrations
│
├── backend/                      # Node.js + Express API server
│   ├── models/                   # Mongoose schemas
│   │   ├── Note.js               # Study notes schema (with coverImage & rating)
│   │   ├── Product.js            # Marketplace listings schema
│   │   ├── Resource.js           # PYQs & study resources schema
│   │   ├── TeamMember.js         # Hackathon team finder profiles
│   │   └── User.js               # User accounts schema (roles: Student/Faculty)
│   │
│   ├── routes/                   # Express API endpoints
│   │   ├── authRoutes.js         # /api/auth (register, login, /me)
│   │   ├── noteRoutes.js         # /api/notes (upload, access, download, rate)
│   │   ├── productRoutes.js      # /api/products & /api/listings
│   │   ├── resourceRoutes.js     # /api/resources (PYQs, lab manuals)
│   │   └── teamRoutes.js         # /api/team (hackathon teammate profiles)
│   │
│   ├── middleware/
│   │   └── authMiddleware.js     # Bearer JWT token verification & role enforcement
│   │
│   ├── uploads/                  # Local storage directory for uploaded files
│   ├── server.js                 # Server entry point and MongoDB connection
│   └── package.json              # Backend dependencies
│
├── README.md                     # Architecture overview and full error audit table
├── TESTING_REPORT.md             # Complete test results & execution matrix
├── BACKEND_ISSUES_AND_RESOLUTIONS.md # Deep dive on all backend bugs and how they were solved
├── HANDOVER.md                   # This onboarding and handover guide
├── package.json                  # Frontend dependencies and Vite scripts
└── .gitignore                    # Prevents leaking .env, uploads, and node_modules
```

---

## 3. Step-by-Step Setup Guide

Follow these exact steps after cloning the repository.

### Step 1: Clone the Repository
```bash
git clone https://github.com/Darkartemis810/unicode-siddharthjunior.git
cd unicode-siddharthjunior
```

---

### Step 2: Configure the Backend Environment
1. Navigate into `backend/`:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend/` directory:
   ```bash
   # Windows PowerShell:
   New-Item -ItemType File -Name .env
   ```
4. Paste the following configuration into `backend/.env`:
   ```env
   PORT=5000
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=unitrade_super_secret_jwt_key_2026

   # Choose Option A (Local MongoDB) OR Option B (MongoDB Atlas Cloud):
   
   # OPTION A: Local MongoDB (Recommended for offline development)
   MONGO_URI=mongodb://127.0.0.1:27017/unitrade

   # OPTION B: MongoDB Atlas (Cloud)
   # MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/unitrade?retryWrites=true&w=majority
   ```

> [!IMPORTANT]
> **If you use MongoDB Atlas:**  
> You must whitelist your IP address in the MongoDB Atlas dashboard:  
> 1. Go to **Network Access** &rarr; click **Add IP Address**.  
> 2. Choose **Allow Access From Anywhere (`0.0.0.0/0`)** for quick development or enter your current public IP.  
> If you don't whitelist your IP, the backend will exit with `ETIMEOUT`.

5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   You should see:
   ```text
   MongoDB connected successfully ✅
   UniTrade Backend running on http://localhost:5000
   ```

---

### Step 3: Configure and Run the Frontend
1. Open a new terminal and return to the project root:
   ```bash
   cd ..
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the printed local URL (typically `http://localhost:5173`).

---

## 4. How to Verify & Run Tests

Before committing any new code, run the following verification checks:

### 1. Static Linting (Strict Zero-Warning Check)
Run Oxlint to verify that there are no syntax bugs, unused variables, or React rule violations:
```bash
npx oxlint --deny-warnings
```
**Target Result:** `Found 0 warnings and 0 errors.`

### 2. Frontend Production Build
Validate that the React frontend bundles cleanly without missing imports or syntax issues:
```bash
npm run build
```
**Target Result:** Production bundle created in `dist/` with zero errors.

### 3. Backend Health Check
In your browser or via curl/Postman, make a `GET` request:
```bash
curl http://localhost:5000/
```
**Response:** `{"message":"UniTrade Backend is running successfully 🚀"}`

---

## 5. Key Architecture Gotchas & Notes for New Developers

1. **Multer File Uploads (`backend/routes/noteRoutes.js`):**
   - Notes accept both a document file (`.pdf`, `.ppt`, `.pptx`, `.doc`, `.docx`) and an optional `coverImage` preview (`.png`, `.jpg`, `.jpeg`, `.webp`).
   - If you ever add new file extensions, make sure to update both `allowedDocTypes` and `allowedImageTypes` in `fileFilter`.

2. **Frontend Offline Resiliency (`src/App.jsx`):**
   - The frontend is designed to run even if the backend is temporarily offline. It automatically seeds default products, notes, resources, and team profiles from local seed state.
   - When the backend is online, `bootstrap()` fetches from `/api/listings`, `/api/notes`, `/api/resources`, and `/api/team`, seamlessly merging live database records.

3. **React Compiler Cleanliness (`src/App.jsx`):**
   - Never mutate global `window` objects. Use React hooks like `useRef` (e.g. `toastTimerRef`).
   - Do not invoke non-deterministic functions (e.g., `Date.now()`, `Math.random()`) directly inside render paths. Use ref counters (`localIdSeqRef.current++`) for client-side keys.

4. **Security & Ignored Files (`.gitignore`):**
   - `backend/.env` is git-ignored to prevent leaking database credentials.
   - `backend/uploads/` is git-ignored (except for `.gitkeep`) to prevent bloating the Git repository with large binary uploads.

---

## 6. Support Documentation in This Repository

If you need deeper insights into any specific area of the codebase, consult the documentation files included in this repo:

- **[`README.md`](README.md):** Complete project summary, feature guide, and error resolution table.
- **[`TESTING_REPORT.md`](TESTING_REPORT.md):** Full QA execution report with test matrices and status checks.
- **[`BACKEND_ISSUES_AND_RESOLUTIONS.md`](BACKEND_ISSUES_AND_RESOLUTIONS.md):** Technical deep-dive into the Multer bug, Note model schema, and error-handling improvements.
