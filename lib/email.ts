import { Resend } from "resend";

/**
 * Email sending via Resend (https://resend.com).
 *
 * Required env vars:
 *   RESEND_API_KEY  - API key from the Resend dashboard
 *   EMAIL_FROM      - verified sender, e.g. "MyTracker <noreply@yourdomain.com>"
 *                     (Resend's onboarding sandbox sender also works for testing)
 */
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM = process.env.EMAIL_FROM || "MyTracker <onboarding@resend.dev>";

export const isEmailConfigured = () => Boolean(resend);

interface DeadlineEmailParams {
  to: string;
  cardTitle: string;
  dueDate: Date;
  link: string;
}

/**
 * Send a deadline reminder email to a card's assignee.
 * Returns true if sent, false if email is not configured or sending failed.
 */
export async function sendDeadlineEmail({
  to,
  cardTitle,
  dueDate,
  link,
}: DeadlineEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn("[EMAIL] RESEND_API_KEY not set — skipping deadline email");
    return false;
  }

  const due = dueDate.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `⏰ Reminder: "${cardTitle}" is due soon`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #111;">Task deadline approaching</h2>
          <p>Your task <strong>"${cardTitle}"</strong> is due on <strong>${due}</strong>.</p>
          <p>
            <a href="${link}"
               style="display:inline-block;background:#2563eb;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">
              Open task
            </a>
          </p>
          <p style="color:#666;font-size:13px;margin-top:24px;">
            You're receiving this because you have deadline reminders enabled in MyTracker.
          </p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send deadline email:", error);
    return false;
  }
}
