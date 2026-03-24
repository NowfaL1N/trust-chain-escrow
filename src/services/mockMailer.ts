/**
 * Mock Mailer Service
 * Simulates sending emails for escrow notifications.
 *
 * Activate this when MongoDB backend is connected:
 * - Replace with nodemailer or SendGrid integration
 * - Use email templates from /templates/emails
 */

export type EmailPayload = {
  to: string;
  subject: string;
  body: string;
};

export function sendMockEmail(payload: EmailPayload): Promise<{ success: boolean; message: string }> {
  return new Promise((resolve) => {
    console.log(`[MockMailer] Sending email to: ${payload.to}`);
    console.log(`[MockMailer] Subject: ${payload.subject}`);
    console.log(`[MockMailer] Body: ${payload.body}`);

    setTimeout(() => {
      resolve({
        success: true,
        message: `Email simulated to ${payload.to}`,
      });
    }, 800);
  });
}

export async function sendTokenEmails(
  buyerEmail: string,
  sellerEmail: string,
  buyerToken: string,
  sellerToken: string
): Promise<{ success: boolean }> {
  await sendMockEmail({
    to: buyerEmail,
    subject: "Your Escrow Verification Token",
    body: `Your buyer verification token is: ${buyerToken}`,
  });
  await sendMockEmail({
    to: sellerEmail,
    subject: "Your Escrow Verification Token",
    body: `Your seller verification token is: ${sellerToken}`,
  });
  return { success: true };
}
