/**
 * Pulse AI — Email Service
 *
 * Sends transactional emails (approval, rejection, welcome).
 * Uses SMTP via nodemailer. Configure with env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * Falls back to console logging when SMTP is not configured.
 */

const nodemailer = require("nodemailer");
const config = require("../config");
const logger = require("../lib/logger");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: parseInt(config.SMTP_PORT, 10) || 587,
      secure: parseInt(config.SMTP_PORT, 10) === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS,
      },
    });
    logger.info("Email transporter configured via SMTP");
  } else {
    logger.warn("SMTP not configured — emails will be logged to console only");
  }

  return transporter;
}

const FROM = config.SMTP_FROM || "Pulse AI <noreply@pulse-ai.com>";
const FRONTEND_URL = config.FRONTEND_URL || "https://pulse-ai-lake.vercel.app";

const EmailService = {
  /**
   * Send approval confirmation email
   */
  async sendApprovalEmail(to, name) {
    const displayName = name || "there";
    const subject = "🎉 You're approved! Welcome to Pulse AI";
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:32px;">
          <svg viewBox="0 0 64 64" width="48" height="48"><circle cx="32" cy="32" r="30" fill="#DC2F3D"/><path d="M8 32H22L27 18L36 46L41 32H56" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h1 style="font-size:24px;color:#14171A;margin-bottom:8px;">You're approved!</h1>
        <p style="font-size:16px;color:#5B6168;line-height:1.6;">Hi ${displayName},</p>
        <p style="font-size:16px;color:#5B6168;line-height:1.6;">Great news — your early access request has been approved. You can now log in and start using Pulse AI's healthcare assistant.</p>
        <div style="text-align:center;margin:32px 0;">
          <a href="${FRONTEND_URL}/#early-access" style="display:inline-block;background:#DC2F3D;color:white;padding:14px 32px;border-radius:100px;text-decoration:none;font-size:16px;font-weight:500;">Open Pulse AI</a>
        </div>
        <p style="font-size:14px;color:#8B9096;line-height:1.6;">If you have any questions, just reply to this email.</p>
        <hr style="border:none;border-top:1px solid #E7E4E0;margin:32px 0;" />
        <p style="font-size:12px;color:#8B9096;text-align:center;">Pulse AI — Healthcare guidance, powered by intelligence.</p>
      </div>
    `;
    const text = `Hi ${displayName},\n\nYour early access request has been approved! You can now log in and start using Pulse AI.\n\nOpen Pulse AI: ${FRONTEND_URL}\n\n— Pulse AI Team`;

    return this.send(to, subject, html, text, "approval");
  },

  /**
   * Send rejection email
   */
  async sendRejectionEmail(to, name) {
    const displayName = name || "there";
    const subject = "Update on your Pulse AI early access request";
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:32px;">
          <svg viewBox="0 0 64 64" width="48" height="48"><circle cx="32" cy="32" r="30" fill="#DC2F3D"/><path d="M8 32H22L27 18L36 46L41 32H56" stroke="white" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <h1 style="font-size:24px;color:#14171A;margin-bottom:8px;">Early access update</h1>
        <p style="font-size:16px;color:#5B6168;line-height:1.6;">Hi ${displayName},</p>
        <p style="font-size:16px;color:#5B6168;line-height:1.6;">Thank you for your interest in Pulse AI. Unfortunately, we're unable to approve your early access request at this time. We'll keep you in mind for future openings.</p>
        <p style="font-size:16px;color:#5B6168;line-height:1.6;">If you believe this was a mistake, please reply to this email.</p>
        <hr style="border:none;border-top:1px solid #E7E4E0;margin:32px 0;" />
        <p style="font-size:12px;color:#8B9096;text-align:center;">Pulse AI — Healthcare guidance, powered by intelligence.</p>
      </div>
    `;
    const text = `Hi ${displayName},\n\nThank you for your interest in Pulse AI. Unfortunately, we're unable to approve your early access request at this time.\n\nIf you believe this was a mistake, please reply to this email.\n\n— Pulse AI Team`;

    return this.send(to, subject, html, text, "rejection");
  },

  /**
   * Core send method
   */
  async send(to, subject, html, text, type = "transactional") {
    const transport = getTransporter();

    if (!transport) {
      // No SMTP configured — log to console for dev
      logger.info({ to, subject, type }, `📧 Email (${type}) — SMTP not configured, logged to console`);
      console.log(`\n📧 [${type.toUpperCase()}] To: ${to}\n   Subject: ${subject}\n   ${text}\n`);
      return { sent: false, reason: "smtp_not_configured" };
    }

    try {
      const info = await transport.sendMail({
        from: FROM,
        to,
        subject,
        html,
        text,
      });
      logger.info({ to, subject, type, messageId: info.messageId }, `📧 Email sent (${type})`);
      return { sent: true, messageId: info.messageId };
    } catch (err) {
      logger.error({ err: err.message, to, subject, type }, `📧 Email failed (${type})`);
      return { sent: false, reason: err.message };
    }
  },
};

module.exports = EmailService;
