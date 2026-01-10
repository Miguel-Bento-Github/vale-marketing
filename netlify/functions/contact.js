export const handler = async (event) => {
  const nodemailer = await import('nodemailer');

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { name, company, email, phone, message } = JSON.parse(event.body);

    // Basic validation
    if (!email || !name || !company) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Name, company and email are required' }),
      };
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email format' }),
      };
    }

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
      subject: `New Contact Form Submission - ${company}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B5EFF; border-bottom: 2px solid #5B5EFF; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Business Information</h3>
            <p><strong>Company:</strong> ${company}</p>
            <p><strong>Contact Name:</strong> ${name}</p>
          </div>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          </div>

          ${message ? `
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Message</h3>
            <p style="white-space: pre-wrap;">${message}</p>
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

    // Send confirmation email to user
    const confirmationEmail = {
      from: `"Vale Parking" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thank you for contacting Vale',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #5B5EFF;">Thank you for your interest in Vale!</h2>

          <p>Hello ${name},</p>

          <p>We've received your message and will get back to you within 24 hours.</p>

          ${message ? `
          <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Your message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          ` : ''}

          <p>Best regards,<br>
          The Vale Team</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">
            Vale - Smart Parking Management<br>
            <a href="https://valepark.org">valepark.org</a>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(confirmationEmail);

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
