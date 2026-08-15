# Healthcare Application - Comprehensive Gap & Issue Analysis

> **Date:** 2026-04-13
> **Scope:** Full-stack audit of backend (FastAPI), frontend (React/TypeScript), ML service (TensorFlow), and infrastructure
> **Purpose:** Identify all gaps, logic bugs, security vulnerabilities, and missing functionality before making the application production-grade

---

## Table of Contents

1. [Critical Security Issues](#1-critical-security-issues)
2. [Logic Bugs](#2-logic-bugs)
3. [Frontend-Backend Mismatches](#3-frontend-backend-mismatches)
4. [Missing Functionality](#4-missing-functionality)
5. [Performance & Scalability Issues](#5-performance--scalability-issues)
6. [Data Integrity Issues](#6-data-integrity-issues)
7. [Frontend Quality Issues](#7-frontend-quality-issues)
8. [Configuration & Deployment Issues](#8-configuration--deployment-issues)
9. [Summary Priority Matrix](#9-summary-priority-matrix)

---

## 1. Critical Security Issues

### 1.1 Default Secret Key Used in Production

- **File:** `backend/main.py` (line 53)
- **Code:** `SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")`
- **Impact:** If the environment variable is not set, anyone who reads the source code (or guesses the default) can forge valid JWT tokens and impersonate any user, including admins.
- **Severity:** CRITICAL
- **Fix:** Remove the default value. Raise an error on startup if `SECRET_KEY` is not set.

---

### 1.2 Google OAuth Users Have Empty Password

- **File:** `backend/main.py` (line 643)
- **Code:** `"password": ""`
- **Impact:** Google OAuth users are created with an empty password string. If `verify_password("", "")` ever returns true (bcrypt edge case), anyone could log into any Google-authenticated account via the standard `/token` login endpoint.
- **Severity:** CRITICAL
- **Fix:** Set password to `None` or a random unguessable hash for OAuth users. Block password login for accounts with `auth_provider: "google"`.

---

### 1.3 WebSocket Authentication Bypass

- **File:** `backend/main.py` (lines 1991-1998), `backend/websocket_manager.py` (line 31)
- **Issue:** Two problems:
  1. `ws_manager.connect()` calls `websocket.accept()` regardless of authentication result.
  2. There is no verification that the authenticated user matches the `user_id` in the URL path. Any authenticated user can join any chat by changing the URL.
- **Severity:** CRITICAL
- **Fix:** Only accept the WebSocket after successful authentication. Verify that the authenticated user's ID matches either the `doctor_id` or `user_id` in the URL.

---

### 1.4 Chat History Authorization Flaw

- **File:** `backend/main.py` (lines 2036-2037)
- **Code:** `user_ids = conversation_id.split("_")`
- **Issue:** Conversation IDs use the format `{doctor_profile_id}_{user_id}`. The `doctor_profile_id` is from the `doctors` collection, not the `users` collection. When a doctor tries to access their chat history, their `user_id` won't match the `doctor_profile_id`, so authorization always fails for doctors (unless they are admin).
- **Severity:** HIGH
- **Fix:** Look up the doctor's `user_id` from the doctors collection when checking authorization, or include the doctor's user ID in the conversation ID.

---

### 1.5 File Upload Path Traversal

- **File:** `backend/main.py` (line 1691)
- **Code:** `file_path = f"uploads/{current_user['id']}_{file.filename}"`
- **Issue:** The filename comes directly from the user upload. A malicious filename like `../../etc/passwd` or `../main.py` could write files outside the intended `uploads/` directory.
- **Severity:** HIGH
- **Fix:** Sanitize the filename using `os.path.basename()` or generate a UUID-based filename. Never use user-supplied filenames directly in file paths.

---

### 1.6 ML Service Has No Authentication and Wide-Open CORS

- **File:** `ml_model/main.py` (line 15)
- **Code:** `allow_origins=["*"]`
- **Issue:** The ML service has zero authentication and accepts requests from any origin. Anyone who discovers port 8001 can submit unlimited prediction requests, potentially causing resource exhaustion (ML inference is CPU/GPU intensive).
- **Severity:** HIGH
- **Fix:** Add API key authentication between the backend and ML service. Restrict CORS to only the backend origin. Do not expose the ML service port publicly.

---

### 1.7 Admin Role Self-Registration

- **File:** `backend/main.py` (line 104)
- **Code:** `role: Literal["admin", "doctor", "user"]`
- **Issue:** The `UserCreate` model accepts `admin` as a valid role. Anyone can sign up as an admin via the public `/signup` endpoint and gain full admin access to the system (view all users, deactivate accounts, view all appointments, etc.).
- **Severity:** CRITICAL
- **Fix:** Restrict the signup endpoint to `user` and `doctor` roles only. Admin accounts should only be created through a separate, secured process (e.g., CLI command, database seed, or existing admin invitation).

---

## 2. Logic Bugs

### 2.1 Route Ordering Bug - `/doctors/me` Never Matches

- **File:** `backend/main.py` (lines 1161 vs 1223)
- **Issue:** `@app.get("/doctors/{doctor_id}")` is defined at line 1161, **before** `@app.get("/doctors/me")` at line 1223. FastAPI matches routes top-to-bottom, so a request to `/doctors/me` is captured by the `{doctor_id}` parameter with `doctor_id="me"`, which returns a 404 ("Doctor not found"). The same issue affects:
  - `GET /doctors/me/stats` (line 1243)
  - `GET /doctors/me/patients` (line 1288)
  - `GET /doctors/me/schedule` (line 1334)
- **Severity:** CRITICAL (breaks all doctor-specific functionality)
- **Fix:** Move all `/doctors/me*` routes **above** `/doctors/{doctor_id}`.

---

### 2.2 Appointment Creation Ignores `patient_id` from Request Body

- **File:** `backend/main.py` (line 1473)
- **Code:** `appointment_dict["patient_id"] = current_user["id"]`
- **Issue:** The `AppointmentCreate` model inherits from `AppointmentBase` which **requires** a `patient_id` field. The frontend must send it, but the backend overwrites it with the current user's ID. This is both confusing (requiring a field that's ignored) and potentially a security issue (the original patient_id from the request is visible in the dict before being overwritten).
- **Severity:** MEDIUM
- **Fix:** Remove `patient_id` from `AppointmentCreate`. Set it server-side only from the authenticated user.

---

### 2.3 Duplicate Analysis Endpoints with Different Behavior

- **File:** `backend/main.py`
- **Issue:** Three analysis endpoints exist with different behaviors and response shapes:

| Endpoint | Line | Behavior |
|----------|------|----------|
| `POST /analysis/upload` | 1680 | Saves file to disk, calls ML service, stores full result |
| `POST /api/analysis/lung-disease` | 1840 | Calls ML service, stores minimal result (different schema) |
| `POST /analysis/audio` | 1784 | Returns **hardcoded dummy data** - no real analysis |

- The frontend uses different endpoints in different places, receiving different response shapes.
- **Severity:** HIGH
- **Fix:** Consolidate into a single analysis endpoint with a consistent response schema. Remove the dummy endpoint.

---

### 2.4 WebSocket Double-Accept Bug

- **File:** `backend/websocket_manager.py` (line 31), `backend/main.py` (line 1998)
- **Issue:** The chat endpoint flow is:
  1. `ws_auth.verify_connection(websocket)` — may close the WebSocket on auth failure
  2. `ws_manager.connect(websocket, user_id)` — calls `websocket.accept()` unconditionally
- If authentication fails, the WebSocket is already closed, then `connect()` tries to accept a closed socket, causing an exception.
- Even on success, `accept()` may be called twice if the middleware already accepted it.
- **Severity:** MEDIUM
- **Fix:** Only call `accept()` once, in one place, after authentication succeeds.

---

### 2.5 Chat Message Not Echoed Back to Sender

- **File:** `backend/main.py` (line 2024)
- **Code:** `await ws_manager.send_personal_message(message, data["receiver_id"])`
- **Issue:** After storing a message, it is only sent to the receiver. The sender never receives:
  - Confirmation that the message was saved
  - The server-assigned `id` and `timestamp`
  - Any error if storage failed
- **Severity:** MEDIUM
- **Fix:** Send the stored message (with server-assigned ID and timestamp) back to the sender as well.

---

### 2.6 Rate Limiting on WebSocket Checks Wrong User

- **File:** `backend/websocket_manager.py` (line 123)
- **Code:** `_check_rate_limit(user_id)` inside `send_personal_message`
- **Issue:** Rate limiting is applied to the **recipient** of the message, not the sender. A malicious sender can flood messages without ever being rate-limited.
- **Severity:** MEDIUM
- **Fix:** Apply rate limiting when **receiving** messages from the WebSocket, not when sending to recipients.

---

### 2.7 Message Encryption Fails Silently

- **File:** `backend/websocket_manager.py` (lines 81-95)
- **Issue:** If encryption fails, the method returns the **plaintext** message (line 87). If decryption fails, it returns the **encrypted gibberish** (line 95). Both failures are logged but otherwise silent, leading to data inconsistency.
- **Severity:** LOW
- **Fix:** Raise an exception or return a clear error instead of silently falling back. Messages should either be fully encrypted or the operation should fail explicitly.

---

## 3. Frontend-Backend Mismatches

### 3.1 Three Duplicate WebSocket Implementations

- **Files:**
  - `frontend/src/services/websocket.ts` — Full-featured with mock mode, 429 lines
  - `frontend/src/services/websocketService.ts` — Different API using builder pattern, 277 lines
  - `frontend/src/services/ChatService.ts` — Third implementation, 104 lines
- **Issue:** Three completely separate WebSocket service implementations with different APIs, behaviors, and mock mode strategies. This causes confusion about which one is actually in use, potential duplicate connections, and inconsistent behavior across different chat components.
- **Severity:** HIGH
- **Fix:** Consolidate into a single WebSocket service. Remove the unused implementations.

---

### 3.2 Analysis Response Shape Mismatch

- **Frontend expects** (`RespiratoryAnalysis.tsx`, lines 37-48):
  ```typescript
  details: {
    score: number
    risk: string
    patterns: {
      wheezing: number
      coughing: number
      shortness_of_breath: number
    }
  }
  ```
- **Backend returns** (`main.py`, lines 1728-1735):
  ```python
  details: ["Detected condition: Pneumonia", "Confidence level: 85.0%", ...]
  ```
- **Impact:** The frontend receives a string array but expects a structured object. It works around this by **generating hardcoded fake values** (line 229: `wheezing: 0.2, coughing: 0.3, shortness_of_breath: 0.1`), meaning the UI shows fabricated data to users.
- **Severity:** HIGH
- **Fix:** Align the backend response schema with what the frontend expects, or update the frontend to correctly display the backend's actual response.

---

### 3.3 WebSocket URL Double-Protocol Bug

- **File:** `frontend/src/services/websocketService.ts` (line 81)
- **Code:** `` const wsUrl = `${wsProtocol}//${this.baseUrl}/chat/...` ``
- **Issue:** `this.baseUrl` is set from `VITE_WS_URL` which defaults to `ws://localhost:8000`. The constructed URL becomes `ws://ws://localhost:8000/chat/...` — double protocol prefix. This will always fail to connect.
- **Severity:** HIGH
- **Fix:** Either store only the host:port in `baseUrl` (without protocol), or don't prepend the protocol in the URL construction.

---

### 3.4 Frontend Calls Non-Existent or Mismatched Endpoints

- **File:** `frontend/src/services/api.ts` (line 226)
- **Issue:** `analysisApi.analyzeLungDisease` calls `/api/analysis/lung-disease`, but `RespiratoryAnalysis.tsx` (line 178) uses raw `fetch` to call `/analysis/upload` instead. Neither endpoint returns a response matching the `Analysis` interface defined in `api.ts` (which expects `disease_type`, `confidence`, `result` fields).
- **Severity:** MEDIUM
- **Fix:** Use a single analysis endpoint consistently. Update the API service and the page component to use the same endpoint and response type.

---

## 4. Missing Functionality

### 4.1 Forgot Password Does Not Send Email

- **File:** `backend/main.py` (lines 799-801)
- **Code:**
  ```python
  # TODO: In production, send email with reset link
  # reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
  # send_email(forgot_request.email, reset_link)
  ```
- **Issue:** The password reset flow generates a token and stores it in the database, but the email sending is **commented out**. The function `send_password_reset()` exists in `email_service.py` (line 344) and is fully implemented, but it is never called. Users who forget their password have no way to receive the reset link.
- **Severity:** HIGH
- **Fix:** Uncomment and connect the `send_password_reset` function call.

---

### 4.2 No Static File Serving for Uploads

- **File:** `backend/main.py` (line 902)
- **Code:** `avatar_url = f"/{file_path}"`
- **Issue:** Uploaded avatars are saved to `uploads/avatars/` and the URL is stored as `/uploads/avatars/filename.jpg`. However, FastAPI **never mounts a static file route** for the `uploads/` directory. All avatar URLs will return 404. Same issue affects uploaded analysis audio files.
- **Severity:** HIGH
- **Fix:** Add `app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")` to serve uploaded files. Alternatively, use a CDN or cloud storage.

---

### 4.3 Payment System is Completely Mock

- **File:** `backend/main.py` (line 2056), `frontend/src/pages/Payment.tsx` (line 29)
- **Issue:**
  - Backend always returns `"status": "success"` regardless of input
  - No validation of card numbers, UPI IDs, or bank details
  - Consultation fee is hardcoded as `500` on the frontend
  - No integration with any payment gateway (Razorpay, Stripe, etc.)
  - No payment amount comes from the doctor/appointment — it's purely frontend-decided
- **Severity:** MEDIUM (expected for a demo, but noted for production)
- **Fix:** Integrate a real payment gateway or clearly mark the payment flow as a demo/simulation in the UI.

---

### 4.4 Missing Python Dependencies in `requirements.txt`

- **File:** `backend/requirements.txt`
- **Missing packages:**
  - `google-auth` and `google-auth-oauthlib` — Required by `main.py` line 23: `from google.oauth2 import id_token`
  - `PyJWT` — Required by `websocket_manager.py` line 7: `import jwt` (note: `python-jose` is a different package)
- **Impact:** Application crashes on import if these packages are not installed.
- **Severity:** HIGH
- **Fix:** Add `google-auth` and `PyJWT` to `requirements.txt`.

---

### 4.5 No Appointment Status Transition Validation

- **File:** `backend/main.py` (lines 1558-1586)
- **Issue:** The appointment update endpoint accepts any status value without validating that the transition makes sense. Currently possible invalid transitions:
  - `completed` → `pending` (re-opening a completed appointment)
  - `cancelled` → `confirmed` (reviving a cancelled appointment)
  - `completed` → `cancelled` (cancelling after completion)
- **Severity:** MEDIUM
- **Fix:** Implement a state machine for appointment status transitions:
  ```
  pending → confirmed, cancelled
  confirmed → completed, cancelled
  cancelled → (terminal state)
  completed → (terminal state)
  ```

---

### 4.6 No Backend Health Check Endpoint

- **File:** `backend/main.py`
- **Issue:** The ML service has a `/health` endpoint, but the main backend only has a root `/` that returns a generic welcome message. There is no health check that verifies database connectivity, dependency service availability, etc.
- **Severity:** LOW
- **Fix:** Add a `/health` endpoint that checks MongoDB connection status and optionally ML service availability.

---

## 5. Performance & Scalability Issues

### 5.1 N+1 Query Pattern in Multiple Endpoints

- **Affected endpoints and files:**

| Endpoint | File Location | Issue |
|----------|---------------|-------|
| `GET /admin/appointments` | `main.py` lines 1088-1095 | Fetches patient + doctor per appointment in loop |
| `GET /doctors/me/patients` | `main.py` lines 1316-1319 | Fetches user per unique patient in loop |
| `GET /doctors/me/schedule` | `main.py` lines 1371-1373 | Fetches patient per appointment in loop |

- **Impact:** With 100 appointments, the admin endpoint makes ~200 extra DB queries (1 patient + 1 doctor per appointment). Response time scales linearly with data volume.
- **Fix:** Use MongoDB `$lookup` aggregation, or batch-fetch all needed users/doctors with `$in` queries.

---

### 5.2 Loading All Records into Memory for Filtering

- **File:** `backend/main.py` (line 1263)
- **Code:** `all_appointments = await appointments_collection.find({"doctor_id": doctor["id"]}).to_list(length=None)`
- **Issue:** Doctor stats endpoint fetches **all** appointments for the doctor into memory, then filters in Python for today's count, pending count, etc. With thousands of appointments, this wastes memory and time.
- **Fix:** Use MongoDB aggregation pipeline with `$match` and `$group` to compute counts server-side.

---

### 5.3 No Pagination on Multiple Endpoints

| Endpoint | Returns |
|----------|---------|
| `GET /doctors` | ALL doctors |
| `GET /hospitals` | ALL hospitals |
| `GET /appointments` | ALL appointments for user |
| `GET /analysis` | ALL analyses for user |
| `GET /users` | ALL users (admin) |
| `GET /payments` | ALL payments for user |

- **Impact:** As data grows, these endpoints will become slow and transfer excessive data.
- **Fix:** Add `skip` and `limit` query parameters with sensible defaults (e.g., 20 items per page).

---

### 5.4 WebSocket Manager Creates Separate MongoDB Connection

- **File:** `backend/websocket_manager.py` (line 24)
- **Issue:** `WebSocketManager.__init__` creates its own `AsyncIOMotorClient`, separate from the main application's connection pool in `database.py`. This means two independent connection pools to the same database, doubling resource usage. The scheduler (`appointment_scheduler.py` line 35) creates yet a **third** connection.
- **Fix:** Share a single `AsyncIOMotorClient` instance across all components.

---

## 6. Data Integrity Issues

### 6.1 No Transactions for Multi-Collection Operations

- **File:** `backend/main.py` (lines 527-546)
- **Issue:** User signup with role `doctor` performs two operations:
  1. Insert user document into `users` collection (line 527)
  2. Insert doctor profile into `doctors` collection (line 546)
- If step 2 fails, you have a user with `role: "doctor"` but no doctor profile — an **orphaned state** that will cause 404 errors on all doctor-specific endpoints.
- **Same pattern in:** Google OAuth signup (lines 650-667)
- **Fix:** Use MongoDB transactions (replica set required) or implement compensating actions (delete user if doctor insert fails).

---

### 6.2 Soft Delete Does Not Cascade

- **File:** `backend/main.py` (line 1055)
- **Issue:** When an admin "deletes" a user (sets `is_active: False`), no cascading actions occur:
  - Doctor profile remains active and visible in doctor listings
  - Pending/confirmed appointments are not cancelled
  - The user can still appear in chat connections
  - Notifications continue to be created for the user
- **Fix:** Implement cascade logic: deactivate doctor profile, cancel pending appointments, and clean up related data.

---

### 6.3 No Duplicate Payment Protection

- **File:** `backend/main.py` (lines 2060-2061)
- **Issue:** There is no check if a payment already exists for a given appointment. A user (or a buggy frontend retry) can create multiple "successful" payments for the same appointment.
- **Fix:** Add a unique constraint or check for existing successful payments before creating a new one.

---

## 7. Frontend Quality Issues

### 7.1 Auth Token in localStorage (XSS Vulnerable)

- **File:** `frontend/src/hooks/useAuth.ts` (line 36)
- **Issue:** JWT token and full user object (including email, role, phone) are stored in `localStorage`. If any XSS vulnerability exists anywhere in the app, an attacker can steal the token and impersonate the user.
- **Severity:** MEDIUM (industry-wide issue, but important for healthcare)
- **Fix:** Consider using `httpOnly` cookies for token storage. At minimum, don't store the full user object in localStorage.

---

### 7.2 Zustand Store Named as Hook

- **File:** `frontend/src/hooks/useAuth.ts` (line 27)
- **Code:** `export const useAuth = create<AuthState>(...)`
- **Issue:** This is a Zustand store exported with a hook-like name. Every component using `useAuth()` subscribes to the **entire** store, causing unnecessary re-renders when any auth field changes (e.g., `loading` toggling causes all components to re-render).
- **Fix:** Use Zustand selectors: `useAuth(state => state.user)` to subscribe to specific fields only.

---

### 7.3 Inconsistent API Usage

- **File:** `frontend/src/pages/RespiratoryAnalysis.tsx` (line 178)
- **Issue:** This page uses raw `fetch()` with manual token handling instead of the centralized `apiClient` from `api.ts`. This means:
  - Error handling differs from the rest of the app
  - Token refresh/401 handling from the interceptor is bypassed
  - The API base URL is duplicated
- **Same issue in:** `ChatService.ts` (line 80), `websocket.ts` (line 370)
- **Fix:** Use `apiClient` consistently across all pages.

---

### 7.4 Debug Console.log Statements in Production Code

- **Affected files:**
  - `frontend/src/pages/Login.tsx` (lines 63, 74)
  - `frontend/src/services/websocket.ts` (lines 29, 121, 151, 301, etc.)
  - `frontend/src/services/websocketService.ts` (lines 33, 83, 93, etc.)
  - `frontend/src/pages/RespiratoryAnalysis.tsx` (lines 170, 186)
- **Issue:** Dozens of `console.log` statements expose internal details (token existence, message payloads, API responses) in the browser console.
- **Fix:** Remove debug logs or replace with a conditional logger that's silent in production.

---

## 8. Configuration & Deployment Issues

### 8.1 Deprecated FastAPI Lifecycle Events

- **File:** `backend/main.py` (lines 84, 90)
- **Code:** `@app.on_event("startup")` and `@app.on_event("shutdown")`
- **Issue:** These decorators are deprecated in FastAPI 0.100+ in favor of the `lifespan` context manager pattern.
- **Fix:**
  ```python
  from contextlib import asynccontextmanager

  @asynccontextmanager
  async def lifespan(app: FastAPI):
      await connect_to_mongo()
      await scheduler.start()
      yield
      await scheduler.stop()
      await close_mongo_connection()

  app = FastAPI(lifespan=lifespan)
  ```

---

### 8.2 `datetime.utcnow()` is Deprecated

- **Files:** Used throughout `backend/main.py`, `backend/websocket_manager.py`, `backend/appointment_scheduler.py`
- **Issue:** `datetime.utcnow()` is deprecated in Python 3.12+ and returns a naive datetime. Should use timezone-aware datetimes.
- **Fix:** Replace with `datetime.now(timezone.utc)` throughout.

---

### 8.3 No `.env.example` Files

- **Issue:** New developers must read the code or documentation to discover required environment variables. There are no `.env.example` files to guide setup.
- **Fix:** Create `.env.example` files for both `backend/` and `frontend/` with all required variables and placeholder values.

---

### 8.4 Frontend Build May Include Deleted Package References

- **Git status shows:**
  ```
  D frontend/frontend/package-lock.json
  D frontend/frontend/package.json
  ```
- **Issue:** There appears to be a nested `frontend/frontend/` directory that was deleted but not committed. This suggests a past directory structure issue.
- **Fix:** Commit the deletion to clean up the repository.

---

## 9. Summary Priority Matrix

### P0 - Blocking (Must Fix Before Any Deployment)

| # | Issue | Section |
|---|-------|---------|
| 1 | Admin role self-registration via public signup | 1.7 |
| 2 | Route ordering bug - `/doctors/me` never matches | 2.1 |
| 3 | Missing Python dependencies (`google-auth`, `PyJWT`) | 4.4 |
| 4 | File upload path traversal vulnerability | 1.5 |
| 5 | WebSocket authentication bypass (no user verification) | 1.3 |

### P1 - Critical (Must Fix Before Production)

| # | Issue | Section |
|---|-------|---------|
| 1 | Default secret key fallback | 1.1 |
| 2 | Google OAuth empty password vulnerability | 1.2 |
| 3 | Forgot password email not being sent | 4.1 |
| 4 | No static file serving for uploads/avatars | 4.2 |
| 5 | Analysis response shape mismatch (fake data shown to users) | 3.2 |
| 6 | WebSocket double-accept bug | 2.4 |
| 7 | Three duplicate WebSocket service implementations | 3.1 |

### P2 - Important (Should Fix for Production Quality)

| # | Issue | Section |
|---|-------|---------|
| 1 | N+1 query patterns in admin/doctor endpoints | 5.1 |
| 2 | No pagination on multiple endpoints | 5.3 |
| 3 | No transactions for multi-collection operations | 6.1 |
| 4 | Duplicate analysis endpoints with different schemas | 2.3 |
| 5 | No appointment status transition validation | 4.5 |
| 6 | Mock payment system with no real integration | 4.3 |
| 7 | Chat message not echoed back to sender | 2.5 |
| 8 | Chat history authorization flaw for doctors | 1.4 |

### P3 - Quality (Nice to Have for Polish)

| # | Issue | Section |
|---|-------|---------|
| 1 | Console.log debug statements in production code | 7.4 |
| 2 | Deprecated FastAPI lifecycle events | 8.1 |
| 3 | localStorage XSS vulnerability for auth tokens | 7.1 |
| 4 | Hardcoded payment amount | 4.3 |
| 5 | No backend health check endpoint | 4.6 |
| 6 | Deprecated `datetime.utcnow()` usage | 8.2 |
| 7 | WebSocket rate limiting checks wrong user | 2.6 |
| 8 | Separate MongoDB connections per component | 5.4 |
| 9 | Soft delete does not cascade | 6.2 |
| 10 | No duplicate payment protection | 6.3 |

---

## Total Issues Found

| Category | Count |
|----------|-------|
| Critical Security Issues | 7 |
| Logic Bugs | 7 |
| Frontend-Backend Mismatches | 4 |
| Missing Functionality | 6 |
| Performance & Scalability | 4 |
| Data Integrity | 3 |
| Frontend Quality | 4 |
| Configuration & Deployment | 4 |
| **Total** | **39** |

---

> **Next Steps:** Address issues in priority order (P0 → P1 → P2 → P3). Each fix should be verified with testing before moving to the next priority level.
