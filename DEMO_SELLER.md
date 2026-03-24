# Demo seller for testing JWT / verification emails

## 1. Create the demo seller (one-time)

With the app running (`npm run dev`), create the demo seller in the database:

- **Browser:** Open `http://localhost:3000/api/seed-demo-seller` and then send a POST request (e.g. using DevTools Console):
  ```js
  fetch('/api/seed-demo-seller', { method: 'POST' }).then(r => r.json()).then(console.log)
  ```
- **Or curl:**
  ```bash
  curl -X POST http://localhost:3000/api/seed-demo-seller
  ```

**Demo seller account:**
- **Email:** `sreeharisreehari611@gmail.com`
- **Password:** `demo123`
- **Role:** Seller

You can log in at `/login?role=seller` with these credentials.

---

## 2. Test that the verification email is received

### Option A – Send a single test email

To check that EmailJS is sending to the demo address without creating a transaction:

- **Browser:** `http://localhost:3000/api/test-verification-email` (GET or POST)
- **Or curl:**
  ```bash
  curl http://localhost:3000/api/test-verification-email
  ```

Then check **sreeharisreehari611@gmail.com** (inbox and spam) for the verification/token email.

### Option B – Full flow (transaction → email)

1. Log in as a **buyer**.
2. Go to **Dashboard → Initiate New Transaction** (or New Transaction from the sidebar).
3. In the wizard, at the **Seller** step, enter seller email: **`sreeharisreehari611@gmail.com`** and click **Continue with seller email**.
4. Complete the remaining steps (company, tokens, product, etc.).
5. When the transaction is created, the app sends verification emails to both buyer and seller; the seller email goes to **sreeharisreehari611@gmail.com**.

Check that inbox (and spam) for the JWT/token mail.

---

## EmailJS configuration

Verification emails use EmailJS. In `.env.local` you should have:

- `EMAILJS_SERVICE_ID`
- `EMAILJS_TEMPLATE_ID`
- `EMAILJS_PUBLIC_KEY`
- `EMAILJS_PRIVATE_KEY`

Your EmailJS template can use: `to_email`, `verification_token`, `role`.
