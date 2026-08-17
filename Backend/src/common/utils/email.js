// Email delivery utility using Resend API (via native fetch).
// Supports sending password reset emails with a professional HTML template.
// If RESEND_API_KEY is not configured (e.g. during local dev), logs the reset URL to console.

export async function sendPasswordResetEmail({ to, url, userName }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "Pollaris <onboarding@resend.dev>";
  const name = userName || "there";

  const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Pollaris password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 20px; }
    .container { max-width: 520px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 32px; }
    .logo { font-size: 20px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 24px; }
    h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
    p { font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 20px; }
    .button-wrap { margin: 28px 0; }
    .btn { display: inline-block; background-color: #f4f4f5; color: #09090b !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; }
    .subtext { font-size: 12px; color: #71717a; border-top: 1px solid #27272a; padding-top: 20px; margin-top: 28px; }
    .link-fallback { color: #a1a1aa; word-break: break-all; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">✦ Pollaris</div>
    <h1>Reset your password</h1>
    <p>Hi ${name},</p>
    <p>We received a request to reset the password for your Pollaris account. Click the button below to choose a new password:</p>
    <div class="button-wrap">
      <a href="${url}" class="btn" target="_blank" rel="noopener noreferrer">Reset Password</a>
    </div>
    <p>If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.</p>
    <div class="subtext">
      <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
      <p class="link-fallback">${url}</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  if (!apiKey) {
    console.log("==================================================");
    console.log("🔑 [POLLARIS AUTH] Password Reset Link (No RESEND_API_KEY found):");
    console.log(`To: ${to}`);
    console.log(`Reset URL: ${url}`);
    console.log("==================================================");
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: "Reset your Pollaris password",
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Failed to send email via Resend:", errorData);
      throw new Error(errorData.message || "Failed to send reset email");
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (error) {
    console.error("Resend delivery error:", error);
    // In dev or on failure, also log the link to console so development isn't blocked
    console.log(`[POLLARIS AUTH FALLBACK] Password Reset URL for ${to}: ${url}`);
    throw error;
  }
}
