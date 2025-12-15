import nodemailer from 'nodemailer';

// Create transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL || 'jacintojimenezjimenez@gmail.com',
    pass: process.env.SMTP_PASSWORD || 'zktzjyaycotxbtwd'
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

/**
 * Send email notification when a new query is submitted
 * @param {Object} queryData - The query data including name, email, message
 * @returns {Promise} - Resolves when email is sent
 */
export const sendQueryNotification = async (queryData) => {
  const { name, age, email, phone, message, createdAt } = queryData;

  const mailOptions = {
    from: `"Idol Be - Contact Form" <${process.env.SMTP_EMAIL || 'jacintojimenezjimenez@gmail.com'}>`,
    to: 'jacintojimenezjimenez@gmail.com',
    subject: `🔔 New Contact Form Submission from ${name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin-bottom: 20px;
              text-align: center;
            }
            .header h1 {
              color: #667eea;
              margin: 0;
              font-size: 24px;
            }
            .content {
              background: white;
              padding: 25px;
              border-radius: 8px;
            }
            .field {
              margin-bottom: 20px;
              padding-bottom: 15px;
              border-bottom: 1px solid #eee;
            }
            .field:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #667eea;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .value {
              color: #333;
              font-size: 16px;
              word-wrap: break-word;
            }
            .message-box {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #667eea;
              margin-top: 10px;
              white-space: pre-wrap;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              color: white;
              font-size: 12px;
            }
            .reply-btn {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 15px;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎮 IDOL BE - New Contact Form Submission</h1>
            </div>
            
            <div class="content">
              <div class="field">
                <div class="label">👤 Name</div>
                <div class="value">${name}</div>
              </div>
              
              <div class="field">
                <div class="label">🎂 Age</div>
                <div class="value">${age} years old</div>
              </div>
              
              <div class="field">
                <div class="label">📧 Email</div>
                <div class="value"><a href="mailto:${email}">${email}</a></div>
              </div>
              
              ${phone ? `
              <div class="field">
                <div class="label">📱 Phone</div>
                <div class="value">${phone}</div>
              </div>
              ` : ''}
              
              <div class="field">
                <div class="label">📅 Submitted At</div>
                <div class="value">${new Date(createdAt).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</div>
              </div>
              
              <div class="field">
                <div class="label">💬 Message</div>
                <div class="message-box">${message}</div>
              </div>
              
              <div style="text-align: center;">
                <a href="mailto:${email}?subject=Re: Your inquiry on Idol Be&body=Hi ${name},%0D%0A%0D%0AThank you for contacting us!" class="reply-btn">
                  Reply to ${name}
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p>This email was sent from the Idol Be contact form</p>
              <p>Visit your admin panel to manage all queries</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New Contact Form Submission

Name: ${name}
Age: ${age} years old
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
Submitted At: ${new Date(createdAt).toLocaleString()}

Message:
${message}

---
Reply to: ${email}
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Query notification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending query notification email:', error);
    throw error;
  }
};

export default transporter;
