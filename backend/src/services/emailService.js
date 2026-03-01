const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send alert email for a batch of matching jobs
 * @param {string} toEmail
 * @param {Object[]} jobs  - array of job rows
 */
async function sendAlertEmail(toEmail, jobs) {
  if (!jobs.length) return;

  const jobRows = jobs.map(j => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #1e293b;">
        <a href="${j.url}" style="color:#628ECB;text-decoration:none;font-weight:600;">
          ${j.title}
        </a>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#94a3b8;">
        ${j.company}
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #1e293b;color:#94a3b8;">
        ${j.location || 'N/A'}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="background:#0f172a;color:#e2e8f0;font-family:Inter,sans-serif;padding:32px;border-radius:12px;max-width:700px;margin:0 auto;">
      <h2 style="color:#628ECB;margin-bottom:4px;">JobPulse Alert</h2>
      <p style="color:#94a3b8;margin-top:0;">${jobs.length} new job${jobs.length > 1 ? 's' : ''} match your alert</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr style="background:#1e293b;">
            <th style="padding:10px 12px;text-align:left;color:#628ECB;">Role</th>
            <th style="padding:10px 12px;text-align:left;color:#628ECB;">Company</th>
            <th style="padding:10px 12px;text-align:left;color:#628ECB;">Location</th>
          </tr>
        </thead>
        <tbody>${jobRows}</tbody>
      </table>
      <p style="margin-top:24px;font-size:12px;color:#475569;">
        You're receiving this because you set up a JobPulse alert. 
        <a href="${process.env.FRONTEND_URL}/alerts" style="color:#628ECB;">Manage alerts</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"JobPulse" <${process.env.GMAIL_USER}>`,
    to: toEmail,
    subject: `🔔 ${jobs.length} new job match${jobs.length > 1 ? 'es' : ''} on JobPulse`,
    html,
  });
}

module.exports = { sendAlertEmail };