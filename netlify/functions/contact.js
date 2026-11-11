// Visitor input goes into HTML email, so every field is escaped before it is used there.
const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Caps on each field, in characters. The maxlength attributes on the form in
// src/components/CTA.astro use the same numbers.
const MAX_LENGTH = {
  name: 100,
  company: 100,
  email: 254,
  phone: 40,
  message: 5000,
};

// A real submission with every field at its cap stays well under this.
const MAX_BODY_LENGTH = 20000;

// The pattern browsers check <input type="email"> against, with a dot required in the domain.
// It refuses the commas, quotes and angle brackets the old /^[^\s@]+@[^\s@]+\.[^\s@]+$/ let through.
const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Line breaks and other control characters only belong in the message.
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;

const badRequest = (error) => ({
  statusCode: 400,
  body: JSON.stringify({ error }),
});

// Returns the submitted JSON object, or null when the body is not one.
const parseSubmission = (body) => {
  if (!body || body.length > MAX_BODY_LENGTH) return null;
  try {
    const submission = JSON.parse(body);
    if (!submission || typeof submission !== 'object' || Array.isArray(submission)) return null;
    return submission;
  } catch {
    return null;
  }
};

// Returns the trimmed fields, or the reason the submission was refused.
const validate = (submission) => {
  const fields = {};
  for (const [field, maxLength] of Object.entries(MAX_LENGTH)) {
    const value = submission[field] ?? '';
    if (typeof value !== 'string') return { problem: `Invalid ${field}` };
    const trimmed = value.trim();
    if (trimmed.length > maxLength) return { problem: `${field} is too long` };
    if (field !== 'message' && CONTROL_CHARACTERS.test(trimmed)) return { problem: `Invalid ${field}` };
    fields[field] = trimmed;
  }

  if (!fields.email || !fields.message) return { problem: 'Email and message are required' };
  if (!EMAIL_PATTERN.test(fields.email)) return { problem: 'Invalid email format' };

  return { fields };
};

export const handler = async (event) => {
  const nodemailer = await import('nodemailer');

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const submission = parseSubmission(event.body);
  if (!submission) return badRequest('Invalid request');

  const { fields, problem } = validate(submission);
  if (problem) return badRequest(problem);
  const { name, company, email, phone, message } = fields;

  try {
    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.eu',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Vale Contact Form" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || 'sales@valepark.org',
      subject: `New Contact Form Submission${company ? ` - ${company}` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B5EFF; border-bottom: 2px solid #5B5EFF; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          ${(name || company) ? `
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Business Information</h3>
            ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ''}
            ${name ? `<p><strong>Contact Name:</strong> ${escapeHtml(name)}</p>` : ''}
          </div>
          ` : ''}

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
            <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
            <p><strong>Phone:</strong> ${phone ? escapeHtml(phone) : 'Not provided'}</p>
          </div>

          ${message ? `
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This email was sent from the Vale marketing site contact form.</p>
            <p>Submitted on: ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
      replyTo: email,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // No confirmation mail goes to the visitor. Its address is whatever they typed,
    // so sending one would let anyone make Vale's mailbox write to any address.

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Email sent successfully',
        timestamp: new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error('Email sending error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
    };
  }
};
