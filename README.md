# UniTrade — Campus Marketplace, Notes & Hackathon Matcher

UniTrade is an all-in-one college platform designed for students to securely buy/sell campus items, share peer-reviewed academic notes, access previous year question papers (PYQs), and discover hackathon teammates.

---

## Architecture & Technology Stack

- **Frontend:** React 19, Vite 8, Vanilla CSS (Modern glassmorphic dark design system).
- **Backend:** Node.js (v24+), Express 5, Multer, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`.
- **Database:** MongoDB / MongoDB Atlas with Mongoose ODM.
- **Linting & Code Quality:** Oxlint (`oxlint --deny-warnings`).

---

## Complete Error & Warning Audit Log

A comprehensive test suite and code diagnostic run was performed across the entire project (backend and frontend). Below is the log of all errors and warnings discovered, along with their root causes and resolutions.

| # | File / Component | Category | Severity | Issue / Error Message | Root Cause | Resolution |
|---|---|---|---|---|---|---|
| 1 | `backend/routes/noteRoutes.js` | Logic / File Upload | **Critical Bug** | `Error: Only PDF, PPT, PPTX, DOC and DOCX files are allowed` | Frontend sends multipart requests with both `file`/`document` (notes) and `coverImage` (cover image preview). Multer's single `fileFilter` was applying document extensions to image uploads. | Updated `fileFilter` to inspect `file.fieldname`. If `file.fieldname === 'coverImage'`, it validates image extensions (`.png`, `.jpg`, `.jpeg`, `.webp`). If document, it validates document extensions. |
| 2 | `backend/models/Note.js` | Schema / Data Integrity | **High Bug** | Note schema omitted `coverImage` | When note uploads succeeded, the cover photo URL was never persisted in MongoDB. | Added `coverImage: { type: String, default: "" }` to the Note schema and assigned the uploaded path in `noteRoutes.js`. |
| 3 | `backend/routes/noteRoutes.js` | Linting / Best Practices | Warning (`no-unused-vars`) | Catch clauses `catch (error)` unused on lines 157 & 177 | Error objects in note access and rating endpoints were discarded without logging. | Added `console.error` logging with contextual failure labels. |
| 4 | `backend/routes/authRoutes.js` | Linting / Best Practices | Warning (`no-unused-vars`) | Catch clause `catch (error)` unused on line 83 | Catch block in `/api/auth/me` did not log error details. | Added `console.error("Fetch user error:", error)` logging. |
| 5 | `backend/middleware/authMiddleware.js` | Linting / Best Practices | Warning (`no-unused-vars`) | Catch clause `catch (error)` unused on line 20 | Token verification failures silently swallowed errors without logging. | Added `console.error("Auth middleware token verification failed:", error.message)` logging. |
| 6 | `backend/routes/resourceRoutes.js` | Linting / Best Practices | Warning (`no-unused-vars`) | Catch clauses `catch (error)` unused on lines 13 & 30 | Errors in resource fetching and creation were ignored in catch blocks. | Added structured `console.error` statements for both endpoints. |
| 7 | `backend/routes/teamRoutes.js` | Linting / Best Practices | Warning (`no-unused-vars`) | Catch clauses `catch (error)` unused on lines 13 & 39 | Errors in team profile retrieval and profile creation were not logged. | Added structured `console.error` statements for both endpoints. |
| 8 | `src/App.jsx` | Linting / React Rules | Warning (`react(immutability)`) | Mutating `window.__ut` directly | Toast dismissal timer was stored directly on global `window.__ut`. | Replaced global variable with `useRef(null)` (`toastTimerRef`). |
| 9 | `src/App.jsx` | Linting / Best Practices | Warning (`no-unused-vars`) | Catch clause `catch (error)` unused in `addListing` | Caught network error was discarded when falling back to local state. | Added `console.warn` logging for network failure. |
| 10 | `src/App.jsx` | Linting / React Purity | Warning (`react(purity)`) | `Math.random` / `Date.now` called during render cycle | Local fallback ID generation called non-deterministic time/random functions flagged by React Compiler purity checks. | Replaced with deterministic ref-based counter `localIdSeqRef.current++`. |
| 11 | `backend/server.js` & MongoDB Atlas | Infrastructure / Network | Error (`ETIMEOUT` / Atlas handshake) | `MongooseServerSelectionError: connection timed out` | MongoDB Atlas cluster connection string `mongodb+srv://...` requires client IP whitelisting in the Atlas Network Access dashboard. | Documented configuration steps to whitelist client IP in Atlas (`0.0.0.0/0` for development or current client IP) and support local MongoDB fallback `mongodb://127.0.0.1:27017/unitrade`. |

---

## Detailed Resolutions

### 1. Dual-Purpose Multer File Filter in `backend/routes/noteRoutes.js`
The notes upload route accepts both a study document and an optional cover picture. The previous filter rejected image uploads because it checked every incoming file against document formats only.

**Before:**
```javascript
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".ppt", ".pptx", ".doc", ".docx"];
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(extension)) cb(null, true);
  else cb(new Error("Only PDF, PPT, PPTX, DOC and DOCX files are allowed"), false);
};
```

**After:**
```javascript
const fileFilter = (req, file, cb) => {
  const allowedDocTypes = [".pdf", ".ppt", ".pptx", ".doc", ".docx"];
  const allowedImageTypes = [".png", ".jpg", ".jpeg", ".webp"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "coverImage") {
    if (allowedImageTypes.includes(extension)) {
      return cb(null, true);
    }
    return cb(new Error("Cover image must be a PNG, JPG, JPEG, or WEBP file"), false);
  }

  if (allowedDocTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, PPT, PPTX, DOC and DOCX files are allowed"), false);
  }
};
```

### 2. Note Schema Update in `backend/models/Note.js`
Added `coverImage` to preserve uploaded cover previews:
```javascript
filePath: {
  type: String,
  required: true
},
coverImage: {
  type: String,
  default: ""
},
fileType: {
  type: String,
  default: ""
},
```

### 3. React Cleanliness & Toast Refactoring in `src/App.jsx`
- Replaced `window.__ut` with `useRef(null)`:
```javascript
const toastTimerRef = useRef(null);

const notify = (msg) => {
  setToast(msg);
  if (toastTimerRef.current) {
    window.clearTimeout(toastTimerRef.current);
  }
  toastTimerRef.current = window.setTimeout(() => setToast(""), 2600);
};
```
- Replaced non-deterministic ID generation in the fallback listing creation with a sequence counter `localIdSeqRef.current++`.

---

## Verification & Test Results

### 1. Code Quality & Lint Check
Executed `npx oxlint --deny-warnings` across all files:
```bash
$ npx oxlint --deny-warnings
Found 0 warnings and 0 errors.
Finished in 141ms on 15 files with 104 rules using 8 threads.
```
Status: **PASSED (0 errors, 0 warnings)**

### 2. Frontend Production Build
Executed `npm run build` in root:
```bash
$ npm run build
vite v8.2.2 building client environment for production...
✓ 16 modules transformed.
dist/index.html                   0.45 kB │ gzip:  0.29 kB
dist/assets/index-Cc0d14EX.css   13.49 kB │ gzip:  3.61 kB
dist/assets/index-C1kNcJiU.js   236.88 kB │ gzip: 71.66 kB
✓ built in 249ms
```
Status: **PASSED**

### 3. Backend Route & Middleware Integrity Test
Verified all mounted route groups (`/api/auth`, `/api/products`, `/api/listings`, `/api/notes`, `/api/resources`, `/api/team`):
- Root health check `GET /` responded with status `200 OK` and `{ "message": "UniTrade Backend is running successfully 🚀" }`.
- Auth middleware correctly intercepted unauthenticated requests to `GET /api/auth/me` with status `401 Unauthorized`.
Status: **PASSED**

---

## Getting Started & Running the Project

### Prerequisites
- Node.js v18+ (tested on Node.js v24)
- npm v9+
- MongoDB instance (MongoDB Atlas cluster or local MongoDB service)

### 1. Backend Setup
1. Navigate into the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/unitrade?retryWrites=true&w=majority
   CLIENT_URL=http://localhost:5173
   JWT_SECRET=your_super_secret_jwt_key
   ```
   > **Important for MongoDB Atlas:**  
   > Ensure your IP is added to the MongoDB Atlas **Network Access** IP whitelist (`Security` -> `Network Access` -> `Add IP Address` -> Select `Allow Access From Anywhere` or add your current IP address).  
   > Alternatively, you can run a local MongoDB instance: `MONGO_URI=mongodb://127.0.0.1:27017/unitrade`.
4. Start the backend server:
   ```bash
   npm run dev
   ```
   Backend will be accessible at: `http://localhost:5000`

### 2. Frontend Setup
1. From the project root:
   ```bash
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser at the local Vite URL (typically `http://localhost:5173`).

### 3. Running Linting and Verification
To run the strict lint check:
```bash
npx oxlint --deny-warnings
```
To run the production build:
```bash
npm run build
```
