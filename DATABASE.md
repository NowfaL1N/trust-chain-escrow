# Database & Data Storage

This document describes where buyer and seller data lives in this project today and how you can use a database (including MongoDB) for storage.

---

## Current state: where is data stored?

**Authentication and user data** use the **database** (MongoDB). Session data is still stored in the browser for the UI.

| Data | Where it lives |
|------|----------------|
| **Users (login/register)** | MongoDB: `users` collection. Passwords are hashed (bcrypt). Login validates email/password against the DB; if the user does not exist, the app redirects to Create Account. Registration stores new users in the DB. |
| **Login / session (UI)** | Browser: `localStorage` under `escrow_demo_auth` and `escrow_token` (JWT). Used for role, email, and API auth. |
| **Buyers / sellers (discovery cards)** | Hard-coded in the app (e.g. `SELLERS` and `BUYERS` in the dashboard pages). Not stored in a database. |
| **Transactions** | Empty arrays in the frontend (`ROWS` in transaction pages). Nothing is persisted. |
| **Contacts (received/sent requests)** | Empty arrays in the frontend. Nothing is persisted. |
| **Audit log** | Empty arrays in the frontend. Nothing is persisted. |

So today, **buyer and seller data is not stored in any central database**. When you add real “add buyer” / “add seller” or transaction flows, you will need a backend and a database to store that data so it persists and does not reset.

---

## Where should buyer and seller data be stored?

When you introduce a real backend:

- **Buyers** – e.g. a `buyers` collection/table: profile (name, email, company, etc.), linked to the user account that acts as the buyer.
- **Sellers** – e.g. a `sellers` collection/table: profile (name, email, company, etc.), linked to the user account that acts as the seller.
- **Users / auth** – e.g. a `users` collection/table: login identity, role (buyer/seller), and reference to the buyer or seller profile.
- **Transactions** – e.g. a `transactions` collection/table: parties (buyer id, seller id), amount, status, milestones, dates.
- **Contacts / requests** – e.g. a `contact_requests` collection/table: sender, receiver, status (pending/accepted/rejected), message, date.
- **Audit log** – e.g. an `audit_log` collection/table: transaction id, action, user/role, timestamp, status, details.

Your Next.js app would call API routes (or a separate backend), and those APIs would read/write this data in the database. The frontend would then display whatever is returned from the API (and would no longer rely on empty arrays or hard-coded lists).

---

## Can we use MongoDB for data storage?

**Yes. MongoDB is a good fit for storing buyer and seller data (and the rest of the app data) for this project.**

Reasons it works well here:

- **Document model** – You can store a buyer or seller as one document (e.g. `{ name, email, company, contactPerson, phone, address, ... }`) and embed or reference related data (e.g. transactions, contact requests) as needed.
- **Flexible schema** – Easy to add fields (e.g. new contact or transaction fields) without running migrations.
- **Good for app-like data** – Users, profiles, transactions, and audit events map naturally to collections and documents.
- **Ecosystem** – Works well with Node.js/Next.js (e.g. official `mongodb` driver or Mongoose). You can use it in API routes or a separate backend and keep the frontend as-is.

You would:

1. Create a MongoDB database (e.g. Atlas or self-hosted).
2. In the project, add a driver (e.g. `mongodb` or `mongoose`) and connect using a connection string (stored in env vars, e.g. `MONGODB_URI`).
3. Define collections such as: `users`, `buyers`, `sellers`, `transactions`, `contact_requests`, `audit_log`.
4. Implement API routes (or a separate backend) that:
   - Create/read/update buyers and sellers.
   - Create/read/update transactions, contact requests, and audit log entries.
5. Update the frontend to call these APIs and display the returned data instead of empty arrays or hard-coded lists.

Until you add this backend and connect MongoDB (or another database), **buyer and seller data is only in the code or in the browser (e.g. demo auth in `localStorage`) and is not stored in any database.**
