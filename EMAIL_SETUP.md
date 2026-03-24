# Verification email setup (SMTP via Nodemailer)

Verification tokens are sent to buyer and seller email addresses using **SMTP** with the **nodemailer** library. Configure your SMTP account (Gmail, Outlook, or your own domain) and `.env.local` using this guide.

---

## 1. Choose an email account / SMTP provider

You can use any SMTP service, for example:

- Gmail (recommended for quick local testing)
- Outlook / Office 365
- Your own domain’s SMTP server (from your hosting provider)

> For production, using a business mailbox or a transactional provider is recommended instead of a personal Gmail.

---

## 2. Configure SMTP credentials

In the project root, edit `.env.local` and add:

```env
SMTP_HOST=smtp.gmail.com          # or your provider’s SMTP host
SMTP_PORT=587                     # 587 for TLS, 465 for SSL
SMTP_USER=your_email@example.com  # SMTP username (often your email)
SMTP_PASS=your_smtp_password      # SMTP password or app password
SMTP_FROM="TrustChain <your_email@example.com>"
```

Notes:

- `SMTP_FROM` is the “From” header shown in the email client.
- For **Gmail**, you usually need an **App Password** (see below).
- After changing `.env.local`, **restart the dev server** (`npm run dev`).

---

## 3. Special notes for Gmail

If you use a personal Gmail account:

1. Enable **2‑step verification** on your Google account.
2. Create an **App Password** in Google Account → Security → App passwords.
3. Use that 16‑character password as `SMTP_PASS` (not your normal login password).
4. Keep `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587` and `SMTP_USER=your@gmail.com`.

Gmail may still rate‑limit or block excessive sending; this is fine for testing,
but for production consider a dedicated provider (SendGrid, Resend, etc.).

---

## 4. Test the email configuration

Once `.env.local` is configured and the dev server has been restarted:

1. Open in your browser:
   ```
   http://localhost:3000/api/test-verification-email?check=1
   ```
   - This returns which `SMTP_*` vars are loaded (`true` / `false`).
   - If any are `false`, fix `.env.local` and restart the server.

2. Then send a test email:
   ```
   http://localhost:3000/api/test-verification-email
   ```
   - On success, you’ll see `{ "success": true, ... }` and a test email in the inbox (or spam).
   - On failure, the JSON will include an `error` and `detail` field. Check the terminal logs for the full error from nodemailer.

---

## 5. Common issues

| Problem | What to do |
|--------|------------|
| `"Email service configuration incomplete"` | One or more of `SMTP_*` is missing or invalid in `.env.local`. Fix the values and restart the server. |
| `"Failed to send verification email: ..."` | The `detail` message will usually mention authentication, host, port, or TLS. Check `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` against your provider’s docs. |
| Connection timed out | Wrong `SMTP_HOST` or blocked port; try `587` with TLS instead of `465`, or verify that your firewall allows outgoing SMTP. |
| Authentication failed | Username/password incorrect, or app password not enabled (for Gmail). Re‑create an app password and update `SMTP_PASS`. |
| Emails not received | 1) Check spam/junk. 2) Confirm you are sending to a real address you own. 3) Some providers may silently drop messages; check provider logs if available. |

---

## 6. After setup

Once the test endpoint returns success and you receive the test email, creating a **new escrow transaction** will send verification tokens to the buyer and seller emails using your SMTP configuration. If the app shows “Email may not have been delivered”, check the server logs for the nodemailer/SMTP error and adjust your `SMTP_*` values accordingly.
