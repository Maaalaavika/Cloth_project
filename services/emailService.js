const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525', 10),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  // We use the same host port for the verification link (pointing to the server itself)
  const url = `${process.env.CLIENT_URL || 'http://localhost:5000'}/style-exchange.html#verify?token=${token}`;
  const mailOptions = {
    from: '"Style Exchange" <no-reply@styleexchange.com>',
    to: email,
    subject: 'Verify your Style Exchange Account',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2ddd5; border-radius: 12px; background: #faf7f2;">
        <h2 style="color: #2d5438;">Welcome to Style Exchange!</h2>
        <p>Thank you for registering. Please click the link below to verify your email address:</p>
        <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4a7c59; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Verify Email</a></p>
        <p>If the button doesn't work, copy and paste this link in your browser:</p>
        <p style="word-break: break-all;"><a href="${url}">${url}</a></p>
        <p>Or copy and paste this verification token in the form:</p>
        <p style="background: #e8f0eb; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 16px; font-weight: bold; text-align: center; color: #2d5438;">${token}</p>
        <br/>
        <p>Best regards,</p>
        <p>The Style Exchange Team</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Email sending failed');
  }
};

const sendPasswordReset = async (email, token) => {
  const url = `${process.env.CLIENT_URL || 'http://localhost:5000'}/style-exchange.html#reset-password?token=${token}`;
  const mailOptions = {
    from: '"Style Exchange" <no-reply@styleexchange.com>',
    to: email,
    subject: 'Reset your Style Exchange Password',
    html: `
      <div style="font-family: 'DM Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2ddd5; border-radius: 12px; background: #faf7f2;">
        <h2 style="color: #2d5438;">Reset Password Request</h2>
        <p>We received a request to reset your password. Click the link below to reset it:</p>
        <p><a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #4a7c59; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>Best regards,</p>
        <p>The Style Exchange Team</p>
      </div>
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Email sending failed');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordReset,
};
