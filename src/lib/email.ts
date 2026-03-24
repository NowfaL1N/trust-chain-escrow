import nodemailer from "nodemailer";

/** Simple email format check so we don't call SMTP with invalid addresses */
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

function getSmtpConfig(): SmtpConfig {
  const host = (process.env.SMTP_HOST || "").trim();
  const portRaw = (process.env.SMTP_PORT || "").trim() || "587";
  const user = (process.env.SMTP_USER || "").trim();
  const pass = (process.env.SMTP_PASS || "").trim();
  const from = (process.env.SMTP_FROM || "").trim() || user;

  const port = Number(portRaw);

  if (!host || !user || !pass || !from || !port) {
    const missing = [
      !host && "SMTP_HOST",
      !port && "SMTP_PORT",
      !user && "SMTP_USER",
      !pass && "SMTP_PASS",
      !from && "SMTP_FROM",
    ].filter(Boolean);
    console.error("SMTP credentials missing in .env.local:", missing.join(", "));
    throw new Error(
      "Email service configuration incomplete. Add " +
        missing.join(", ") +
        " to .env.local and restart the server."
    );
  }

  return { host, port, user, pass, from };
}

let cachedTransporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (cachedTransporter) return cachedTransporter;
  const { host, port, user, pass } = getSmtpConfig();
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
  return cachedTransporter;
}

/**
 * Sends a verification email using SMTP (via nodemailer).
 * Configure SMTP_* variables in .env.local.
 */
export async function sendVerificationEmail(to: string, token: string, role: string): Promise<void> {
  const toAddress = (to || "").trim();
  if (!toAddress) {
    console.error("sendVerificationEmail: missing recipient");
    throw new Error("Recipient email is required");
  }
  if (!isValidEmail(toAddress)) {
    console.error("sendVerificationEmail: invalid email", toAddress);
    throw new Error("Invalid recipient email");
  }
  const config = getSmtpConfig();
  const transporter = getTransporter();

  try {
    const subject = "Your TrustChain verification token";
    const text = [
      "Hello,",
      "",
      `Your ${role} verification token is:`,
      "",
      token,
      "",
      "Use this token in the TrustChain escrow verification step.",
    ].join("\n");

    const html = `
      <p>Hello,</p>
      <p>Your <strong>${role}</strong> verification token is:</p>
      <p style="font-family: monospace; font-size: 16px;"><strong>${token}</strong></p>
      <p>Use this token in the TrustChain escrow verification step.</p>
    `;

    await transporter.sendMail({
      from: config.from,
      to: toAddress,
      subject,
      text,
      html,
    });
    console.log(`Verification email sent via SMTP to ${toAddress} (${role})`);
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
    console.error("SMTP email delivery failed:", { to: toAddress, role, err });
    throw new Error("Failed to send verification email: " + message);
  }
}

/**
 * Sends support form submissions to the TrustChain support inbox.
 */
export async function sendSupportContactEmail(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<void> {
  const name = (payload.name || "").trim();
  const email = (payload.email || "").trim();
  const subjectInput = (payload.subject || "").trim();
  const message = (payload.message || "").trim();
  const supportInbox = "trustchainescrow@gmail.com";

  if (!name || !email || !subjectInput || !message) {
    throw new Error("All support fields are required");
  }
  if (!isValidEmail(email)) {
    throw new Error("Invalid sender email");
  }

  const config = getSmtpConfig();
  const transporter = getTransporter();
  const subject = `[Support] ${subjectInput}`;
  const text = [
    "New support message received:",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Subject: ${subjectInput}`,
    "",
    "Message:",
    message,
  ].join("\n");
  const html = `
    <p><strong>New support message received</strong></p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subjectInput}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, "<br/>")}</p>
  `;

  try {
    await transporter.sendMail({
      from: config.from,
      to: supportInbox,
      replyTo: email,
      subject,
      text,
      html,
    });
    console.log(`Support contact email sent to ${supportInbox}`);
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : typeof err === "string" ? err : JSON.stringify(err);
    throw new Error("Failed to send support contact email: " + msg);
  }
}

/**
 * Sends a one-time password (OTP) for password reset.
 */
export async function sendPasswordResetOtpEmail(to: string, otp: string): Promise<void> {
  const toAddress = (to || "").trim();
  if (!toAddress) throw new Error("Recipient email is required");
  if (!isValidEmail(toAddress)) throw new Error("Invalid recipient email");

  const config = getSmtpConfig();
  const transporter = getTransporter();

  const subject = "Your TrustChain password reset OTP";
  const text = [
    "Hello,",
    "",
    "We received a request to reset your TrustChain password.",
    "Use this OTP to continue:",
    "",
    otp,
    "",
    "This OTP expires in 10 minutes.",
    "If you did not request this, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>Hello,</p>
    <p>We received a request to reset your TrustChain password.</p>
    <p>Use this OTP to continue:</p>
    <p style="font-family: monospace; font-size: 24px; letter-spacing: 4px;"><strong>${otp}</strong></p>
    <p>This OTP expires in <strong>10 minutes</strong>.</p>
    <p>If you did not request this, you can ignore this email.</p>
  `;

  await transporter.sendMail({
    from: config.from,
    to: toAddress,
    subject,
    text,
    html,
  });
}
