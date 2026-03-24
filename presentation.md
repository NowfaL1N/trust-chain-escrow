## 1. What is this product?

This project is a **B2B escrow transaction portal** called **TrustChain**. It is a web-based platform (SaaS-style dashboard) that allows a **buyer company** and a **seller company** to safely complete high‑value transactions using an escrow workflow. The portal guides users through verifying their company, selecting a seller, generating and verifying security tokens sent over email, defining product and pricing terms, simulating payment into escrow, confirming delivery, and resolving any disputes – all inside a single, modern web UI.

## 2. Where are JWT verification tokens created?

- **Backend file**: `src/lib/auth.ts`  
  - Function `generateTransactionToken(payload)` uses the shared `JWT_SECRET` from `.env.local` to create a signed JWT that encodes the transaction ID, role (buyer or seller), and email, with a 30‑day expiry.
- **When created**: `POST /api/transactions` in `src/app/api/transactions/route.ts` calls `generateTransactionToken` twice – once for the **buyer token** and once for the **seller token** – immediately after a new escrow transaction is initiated.
- **How used**: these JWT tokens are emailed to the buyer and seller and later verified server‑side by the `verifyTransactionToken` helper (also in `src/lib/auth.ts`) via the `/api/transactions/verify-token` endpoint when the user pastes the token in the verification step of the wizard.

## 3. Where does the JWT secret come from?

- The **JWT secret** is not created by the app; it is **configured** by you in the environment.
- **File**: `.env.local` in the project root.
- **Variable**: `JWT_SECRET="your-long-random-secret-string"`.
- **Used in**: `src/lib/auth.ts` – it reads `process.env.JWT_SECRET` (with a fallback only for local dev). All JWT signing and verification (login token and transaction verification tokens) use this same secret so that tokens issued by the server can be verified later.
- **Important**: In production, set `JWT_SECRET` to a long, random, secure value (e.g. 64+ characters) and never commit it to version control; keep `.env.local` (and production env) private.
