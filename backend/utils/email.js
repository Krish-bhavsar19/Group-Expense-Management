const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    if (process.env.SENDGRID_API_KEY) {
        // SendGrid configuration
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    } else {
        // Gmail configuration
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, name) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Group Expense Manager" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Email Verification - OTP Code',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
            padding: 40px;
            color: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: white;
            color: #333;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
          }
          .otp {
            font-size: 36px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            display: inline-block;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 13px;
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 Group Expense Manager</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p class="message">Thank you for signing up. Please use the following OTP to verify your email address:</p>
            <div class="otp">${otp}</div>
            <p class="message">This OTP will expire in <strong>10 minutes</strong>.</p>
            <p class="message">If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 Group Expense Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        throw new Error('Failed to send OTP email');
    }
};

// Send password reset email
const sendPasswordResetEmail = async (email, otp, name) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Group Expense Manager" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset - OTP Code',
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            border-radius: 10px;
            padding: 40px;
            color: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
          }
          .content {
            background: white;
            color: #333;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
          }
          .otp {
            font-size: 36px;
            font-weight: bold;
            color: #f5576c;
            letter-spacing: 8px;
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-radius: 8px;
            display: inline-block;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            color: #666;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 13px;
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p class="message">You requested to reset your password. Please use the following OTP:</p>
            <div class="otp">${otp}</div>
            <p class="message">This OTP will expire in <strong>10 minutes</strong>.</p>
            <p class="message">If you didn't request this, please ignore this email and your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2026 Group Expense Manager. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
        throw new Error('Failed to send password reset email');
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    sendPasswordResetEmail
};
