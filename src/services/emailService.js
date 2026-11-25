const nodemailer = require('nodemailer');
const env = require('../config/env');
const { getTransporter } = require('../config/mailer');
const logger = require('../utils/logger');

const escapeHtml = (unsafe = '') =>
  String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/**
 * Sends a notification email to the portfolio owner and a confirmation email to the sender.
 * Never throws on transient SMTP errors so contact messages remain safely persisted.
 */
const sendContactEmails = async (contactDoc) => {
  try {
    const { transporter, mode } = await getTransporter();

    const ownerInfo = await transporter.sendMail({
      from: env.email.from,
      to: env.email.receiver,
      replyTo: `"${contactDoc.name}" <${contactDoc.email}>`,
      subject: `[Portfolio Contact] ${contactDoc.subject}`,
      text: [
        `New portfolio inquiry from ${contactDoc.name} (${contactDoc.email})`,
        `Subject: ${contactDoc.subject}`,
        '',
        contactDoc.message,
      ].join('\n'),
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">
            New Portfolio Inquiry
          </h2>
          <p><strong>From:</strong> ${escapeHtml(contactDoc.name)} (${escapeHtml(contactDoc.email)})</p>
          <p><strong>Subject:</strong> ${escapeHtml(contactDoc.subject)}</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-top: 12px; white-space: pre-wrap;">${escapeHtml(contactDoc.message)}</div>
          <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
            Message ID: ${contactDoc._id}
          </p>
        </div>
      `,
    });

    // Best-effort confirmation auto-reply to visitor
    await transporter.sendMail({
      from: env.email.from,
      to: contactDoc.email,
      subject: `Thanks for reaching out — ${env.appName}`,
      text: `Hi ${contactDoc.name},\n\nThanks for your message regarding "${contactDoc.subject}". I have received it and will get back to you soon.\n\nBest regards,\n${env.appName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
          <h2 style="color: #0f172a;">Thanks for reaching out!</h2>
          <p>Hi ${escapeHtml(contactDoc.name)},</p>
          <p>I have received your message regarding <strong>${escapeHtml(contactDoc.subject)}</strong> and will respond as soon as possible.</p>
          <p style="color: #475569; font-size: 14px;">— ${escapeHtml(env.appName)}</p>
        </div>
      `,
    });

    const previewUrl = mode === 'ethereal' ? nodemailer.getTestMessageUrl(ownerInfo) || '' : '';
    const emailStatus = mode === 'smtp' ? 'sent' : 'preview';

    if (previewUrl) {
      logger.info('Ethereal email preview available', { previewUrl });
    }

    return {
      emailStatus,
      emailPreviewUrl: previewUrl,
      emailError: '',
      mode,
    };
  } catch (err) {
    logger.error('Failed to send contact email notification', { error: err.message });
    return {
      emailStatus: 'failed',
      emailPreviewUrl: '',
      emailError: err.message,
      mode: 'error',
    };
  }
};

module.exports = {
  sendContactEmails,
};
