# Backend Issues & Resolutions — UniTrade

**Project Name:** UniTrade Backend  
**Repository:** [https://github.com/Darkartemis810/unicode-siddharthjunior.git](https://github.com/Darkartemis810/unicode-siddharthjunior.git)  
**Document:** `BACKEND_ISSUES_AND_RESOLUTIONS.md`  
**Date:** September 8, 2026  

---

## 1. Overview of Backend Architecture

The backend of UniTrade is built with:
- **Runtime & Framework:** Node.js (v24+) & Express 5.
- **Database & ODM:** MongoDB / MongoDB Atlas with Mongoose 8.
- **Authentication:** JWT (`jsonwebtoken`) with `bcryptjs` password hashing.
- **File Handling:** Multer for multipart form uploads (documents and cover images).
- **Static Assets:** Express static middleware serving uploaded files via `/uploads`.

---

## 2. Summary Table of All Backend Issues

| Issue # | Component / File | Problem Summary | Impact / Severity | How It Was Solved |
|---|---|---|---|---|
| **1** | `backend/routes/noteRoutes.js` | Multer `fileFilter` rejected cover photos (`.png`, `.jpg`, etc.) because it only checked for document extensions (`.pdf`, `.doc`). | **Critical**: Broke the Note Upload feature whenever users attached a cover image. | Updated `fileFilter` to inspect `file.fieldname`. If `coverImage`, validate image extensions (`.png`, `.jpg`, `.jpeg`, `.webp`). If document, validate document extensions. |
| **2** | `backend/models/Note.js` | Note Mongoose schema completely lacked the `coverImage` field. | **High**: Note cover photos were not saved in MongoDB; frontend could not display thumbnails. | Added `coverImage: { type: String, default: "" }` to `Note.js` schema and assigned `/uploads/<filename>` when saving a note. |
| **3** | `backend/routes/noteRoutes.js` | Empty `catch (error)` clauses discarded exceptions without logging in `/:id/access` and `/:id/rate`. | **Medium**: Swallowed errors during note access and rating; triggered linter warnings (`no-unused-vars`). | Added structured `console.error` logs with detailed context to both endpoints. |
| **4** | `backend/middleware/authMiddleware.js` | Token verification failures in `jwt.verify` were caught with an unused `error` parameter. | **Medium**: Failed token decodes were swallowed silently without troubleshooting telemetry. | Added `console.error("Auth middleware token verification failed:", error.message)` logging. |
| **5** | `backend/routes/authRoutes.js` | The `/api/auth/me` endpoint had an empty catch block discarding `error`. | **Medium**: Errors fetching authenticated users from the database were silently dropped. | Added `console.error("Fetch user error:", error)` logging. |
| **6** | `backend/routes/resourceRoutes.js` | Both `GET /` and `POST /` routes had empty catch blocks discarding `error`. | **Medium**: Database or upload failures were unobservable. | Added `console.error` logs for both resource fetching and creation failures. |
| **7** | `backend/routes/teamRoutes.js` | Both `GET /` and `POST /` routes had empty catch blocks discarding `error`. | **Medium**: Team member query and creation errors were not logged. | Added `console.error` logs for team fetching and profile creation failures. |
| **8** | `backend/server.js` & Atlas | Connection failed with `MongooseServerSelectionError: connection timed out` (`ETIMEOUT`). | **High**: Backend could not connect to MongoDB Atlas because client machine IP was not whitelisted. | Documented the Atlas IP Whitelist procedure (`Security -> Network Access -> Add IP Address`) and provided local MongoDB fallback. |

---

## 3. Deep Dive into Each Backend Issue & Code Comparison

### Issue 1: Multer `fileFilter` Rejecting Note Uploads
#### The Problem:
In `backend/routes/noteRoutes.js`, the note upload endpoint accepts multiple fields:
```javascript
upload.fields([
  { name: "document", maxCount: 1 },
  { name: "file", maxCount: 1 },
  { name: "coverImage", maxCount: 1 }
])
```
However, the `fileFilter` function only allowed document extensions:
```javascript
// ❌ BUG: Applied to ALL incoming files including cover photos!
const fileFilter = (req, file, cb) => {
  const allowedTypes = [".pdf", ".ppt", ".pptx", ".doc", ".docx"];
  const extension = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, PPT, PPTX, DOC and DOCX files are allowed"), false);
  }
};
```
Whenever the frontend sent a note with a cover image (e.g., `cover.png` or `thumbnail.jpg`), Multer threw an error and aborted the entire upload.

#### The Solution:
Differentiate incoming files based on `file.fieldname`:
```javascript
// ✅ FIXED: Checks fieldname before applying type restrictions
const fileFilter = (req, file, cb) => {
  const allowedDocTypes = [
    ".pdf",
    ".ppt",
    ".pptx",
    ".doc",
    ".docx"
  ];
  const allowedImageTypes = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp"
  ];

  const extension = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === "coverImage") {
    if (allowedImageTypes.includes(extension)) {
      cb(null, true);
    } else {
      cb(new Error("Cover image must be a PNG, JPG, JPEG, or WEBP file"), false);
    }
    return;
  }

  if (allowedDocTypes.includes(extension)) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, PPT, PPTX, DOC and DOCX files are allowed"),
      false
    );
  }
};
```

---

### Issue 2: Missing `coverImage` in Note Schema
#### The Problem:
`backend/models/Note.js` did not define a `coverImage` attribute. When notes were saved, Mongoose stripped out the cover image path according to strict schema rules.

#### The Solution:
Added `coverImage` directly into `noteSchema` in `backend/models/Note.js`:
```javascript
// ✅ Added coverImage definition
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
And updated the route handler in `backend/routes/noteRoutes.js`:
```javascript
const coverFile = req.files?.coverImage?.[0];
const coverImagePath = coverFile ? `/uploads/${coverFile.filename}` : "";

const note = new Note({
  // ... other fields
  coverImage: coverImagePath,
  // ...
});
```

---

### Issues 3–7: Empty Catch Clauses Swallowing Runtime Errors
#### The Problem:
Throughout the backend routes and middleware, errors were discarded inside empty catch blocks:
- In `backend/middleware/authMiddleware.js`:
  ```javascript
  // ❌ Discards error
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  ```
- In `backend/routes/authRoutes.js`:
  ```javascript
  // ❌ Discards error
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
  ```
- In `backend/routes/resourceRoutes.js` and `backend/routes/teamRoutes.js`:
  ```javascript
  // ❌ Discards error
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
  ```
This broke error tracing in production, prevented developers from debugging database issues, and triggered static analysis warnings (`no-unused-vars`).

#### The Solution:
Replaced all empty catch blocks with structured console logging:
- In `authMiddleware.js`:
  ```javascript
  // ✅ Proper logging
  } catch (error) {
    console.error("Auth middleware token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  ```
- In `authRoutes.js`:
  ```javascript
  // ✅ Proper logging
  } catch (error) {
    console.error("Fetch user error:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
  ```
- In `resourceRoutes.js`, `teamRoutes.js`, and `noteRoutes.js`: Added corresponding `console.error` statements for both retrieval and creation endpoints.

---

### Issue 8: MongoDB Atlas Connectivity & IP Whitelisting
#### The Problem:
When starting the server, MongoDB connection failed with:
```
MongooseServerSelectionError: connection timed out
```
MongoDB Atlas requires client IP addresses to be whitelisted under the cluster's **Network Access** settings. If the developer switches Wi-Fi networks or starts the project from a new machine, Atlas blocks the connection.

#### The Solution:
1. Documented the resolution steps to allow developer connectivity:
   - Go to MongoDB Atlas console &rarr; **Security** &rarr; **Network Access**.
   - Click **Add IP Address** &rarr; select **Allow Access From Anywhere** (`0.0.0.0/0`) or add the current public IP.
2. Configured local MongoDB fallback:
   - In `backend/.env`:
     ```env
     PORT=5000
     MONGO_URI=mongodb://127.0.0.1:27017/unitrade
     CLIENT_URL=http://localhost:5173
     JWT_SECRET=unitrade_secret_key_123
     ```

---

## 4. Verification and Validation

After applying all fixes:
1. **Oxlint Verification:**
   ```bash
   npx oxlint --deny-warnings
   ```
   **Result:** 0 warnings and 0 errors across all backend and frontend files.
2. **Backend Route Integrity Test:**
   - Health check `GET /` &rarr; `200 OK`.
   - Token protection `GET /api/auth/me` without token &rarr; `401 Unauthorized`.
   - Multer upload middleware accepts both PDF and image uploads cleanly.

---

## 5. Summary Checklist of Modified Backend Files

- [`backend/routes/noteRoutes.js`](file:///c:/Users/kamth/Downloads/Unitrade-main/Unitrade-main/backend/routes/noteRoutes.js): Fixed dual fileFilter and added catch logging.
- [`backend/models/Note.js`](file:///c:/Users/kamth/Downloads/Unitrade-main/Unitrade-main/backend/models/Note.js): Added `coverImage` schema field.
- [`backend/middleware/authMiddleware.js`](file:///c:/Users/kamth/Downloads/Unitrade-main/Unitrade-main/backend/middleware/authMiddleware.js): Added error logging in token verification catch.
- [`backend/routes/authRoutes.js`](file:///c:/Users/kamth/Downloads/Unitrade-main/Unitrade-main/backend/routes/authRoutes.js): Added error logging in `/me` user retrieval catch.
- [`backend/routes/resourceRoutes.js`](file:///c:/Users/kamth/Downloads/Unitrade-main/Unitrade-main/backend/routes/resourceRoutes.js): Added error logging in resource endpoints.
- [`backend/routes/teamRoutes.js`](file:///c:/Users/kamth/Downloads/Unitrade-main/Unitrade-main/backend/routes/teamRoutes.js): Added error logging in team member endpoints.
- [`.gitignore`](file:///c:/Users/kamth/Downloads/Unitrade-main/Unitrade-main/.gitignore): Protected `.env`, `node_modules`, and `backend/uploads/` from accidental leaks.
