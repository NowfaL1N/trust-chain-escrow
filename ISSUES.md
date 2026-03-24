# Issues & Process (B2B Escrow SaaS)

This document lists issues that can occur in this project, solutions applied so far, and the process followed to date. **Transaction details are not implemented** — all transaction/escrow data is placeholder UI only.

---

## Issues That Occurred & Solutions Applied

### 1. Next.js build cache error
- **Issue:** `Error: Cannot find module './948.js'` in `.next/server/webpack-runtime.js` when running dev or loading pages.
- **Cause:** Stale or corrupted `.next` build cache (missing webpack chunk).
- **Solution:** Delete `.next` and optionally `node_modules/.cache`, then run a fresh build.
  ```powershell
  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
  npm run build
  npm run dev
  ```

### 2. Login always showing “Invalid password”
- **Issue:** User entered a password but saw “Invalid password” (validation was strict).
- **Solution:** For demo, any non-empty password is accepted. Password is trimmed; error is shown only when the field is empty. Added hint: “Demo: enter any password to sign in.” Error message updated to “Please enter your password.” when empty.

### 3. Nav links not working
- **Issue:** Documentation, Create account, Login, and Support in the nav pointed to `#` and did nothing.
- **Solution:** Added real routes and wired nav:
  - Documentation → `/documentation`
  - Create account / Register → `/register`
  - Login → `/login`
  - Support → `/support`
  - Footer: Privacy Policy, Terms of Service, Security Standards → `/documentation`

### 4. No role selection before login
- **Issue:** Users could not choose Buyer vs Seller before signing in.
- **Solution:** Home (`/`) is now a role selection page (“I’m a Buyer” / “I’m a Seller”). Choosing one goes to `/login?role=buyer` or `/login?role=seller`. Login shows role-specific copy and redirects to the correct dashboard after success. Added “Not a buyer/seller? Choose role” on the login page.

### 5. Missing dashboards and sidebar
- **Issue:** Only a simple dashboard existed; no Transactions, Contacts, or Audit Log.
- **Solution:** Implemented full dashboard layout from reference design:
  - Fixed left sidebar: B2B Escrow, Buyer/Seller Portal, Dashboard, Transactions, Contacts, Audit Log, “+ New Transaction.”
  - Top header: page title, breadcrumbs, search, notifications, user + Log out.
  - Footer: copyright, Support, Privacy Policy, Terms of Service.
  - All sidebar links go to the correct buyer/seller routes.

### 6. Lucide icon import error
- **Issue:** `'Sort' is not exported from 'lucide-react'` in buyer and seller Contacts pages.
- **Solution:** Replaced `Sort` with `ArrowDownAZ` for the Sort button icon.

### 7. Unused import in dashboard shell
- **Issue:** ESLint error: `'EscrowLogo' is defined but never used` in `dashboard-shell.tsx`.
- **Solution:** Removed `EscrowLogo` import; sidebar uses the inline logo block (Shield icon + “B2B Escrow” text).

### 8. PowerShell command separator
- **Issue:** `&&` is not valid in PowerShell; script failed during `create-next-app`.
- **Solution:** Use `;` instead of `&&` for chaining commands in PowerShell.

---

## Potential Issues (Not Yet Addressed)

- **Auth is demo only:** Session is stored in `localStorage` (`escrow_demo_auth`). No server-side auth; incognito or clearing storage logs the user out. No JWT or secure session.
- **No transaction details:** Transaction IDs, amounts, statuses, and tables are static/placeholder. No real CRUD, API, or database for transactions.
- **Search / filters / export:** Header search, Contacts filter, Audit log search, and Export CSV / Monthly Report are UI only; no backend.
- **Accept / Reject contact:** Buttons on contact cards do not persist state or call an API.
- **New Transaction:** Stepper and “Transaction details” are placeholders; no form submission or escrow creation.
- **Direct dashboard URL without login:** Handled — user is redirected to `/login?role=buyer` or `/login?role=seller` if not “logged in” (no `escrow_demo_auth` in localStorage).
- **Wrong role on dashboard:** Handled — e.g. opening `/dashboard/seller` with buyer auth redirects to `/login?role=seller`.

---

## Process Followed Till Now

1. **Design source:** Stitch design files (e.g. `user_login_screen`, `buyer_dashboard_overview`, `transaction_audit_logging`, `contact_request_management`) used as UI/UX reference.
2. **Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui, Manrope font. No payment or transaction backend.
3. **Flow:** Role selection (/) → Login (/login?role=…) → Buyer or Seller dashboard with sidebar (Dashboard, Transactions, Contacts, Audit Log, New Transaction). Register and Support/Documentation are separate pages.
4. **Scope:** UI/UX only. No payment processing, no real transaction details, no persistence beyond demo auth in localStorage. Transaction-related screens show placeholder data only; **transaction details are not added** in this phase.

---

## Summary

| Area              | Status |
|-------------------|--------|
| Login / Register  | Working (demo auth, any non-empty password) |
| Role selection    | Working |
| Buyer dashboard   | Working (overview, Transactions, Contacts, Audit Log, New Transaction as UI) |
| Seller dashboard  | Working (same structure) |
| Nav / links       | Working |
| Transaction data  | **Not added** — placeholder only |
| Payments / escrow | Not in scope |
