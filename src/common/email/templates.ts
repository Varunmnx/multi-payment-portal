// email/interfaces/email.interface.ts
export interface EmailData {
  to: string;
  subject: string;
  data: Record<string, any>;
}

export interface EmailTemplate {
  generateHtml(data: Record<string, any>): string;
  getSubject(data: Record<string, any>): string;
}

export enum EmailTemplateType {
  WELCOME = 'welcome',
  PAYMENT_CONFIRMATION = 'payment_confirmation',
  PASSWORD_RESET = 'password_reset',
}
export class WelcomeEmailTemplate implements EmailTemplate {
  generateHtml(data: { name: string; email: string; loginUrl?: string }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Our Platform</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                  text-align: center;
                  padding: 20px 0;
                  border-bottom: 2px solid #007bff;
              }
              .content {
                  padding: 30px 0;
                  line-height: 1.6;
                  color: #333;
              }
              .button {
                  display: inline-block;
                  background-color: #007bff;
                  color: white;
                  padding: 12px 24px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
              }
              .footer {
                  text-align: center;
                  padding: 20px 0;
                  border-top: 1px solid #eee;
                  color: #666;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1 style="color: #007bff; margin: 0;">Welcome to Our Platform!</h1>
              </div>
              <div class="content">
                  <h2>Hello ${data.name}!</h2>
                  <p>Thank you for joining our platform. We're excited to have you on board!</p>
                  <p>Your account has been successfully created with email: <strong>${data.email}</strong></p>
                  ${
                    data.loginUrl
                      ? `
                  <p>Click the button below to get started:</p>
                  <div style="text-align: center;">
                      <a href="${data.loginUrl}" class="button">Get Started</a>
                  </div>
                  `
                      : ''
                  }
                  <p>If you have any questions, feel free to contact our support team.</p>
              </div>
              <div class="footer">
                  <p>&copy; 2025 Your Company Name. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getSubject(data: { name: string }): string {
    return `Welcome to Our Platform, ${data.name}!`;
  }
}

export class PaymentConfirmationTemplate implements EmailTemplate {
  generateHtml(data: {
    name: string;
    orderId: string;
    amount: number;
    currency: string;
    product: string;
    transactionId: string;
    paymentDate: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                  background-color: #28a745;
                  color: white;
                  text-align: center;
                  padding: 30px 20px;
              }
              .content {
                  padding: 30px;
                  line-height: 1.6;
                  color: #333;
              }
              .payment-details {
                  background-color: #f8f9fa;
                  padding: 20px;
                  border-radius: 5px;
                  margin: 20px 0;
              }
              .detail-row {
                  display: flex;
                  justify-content: space-between;
                  margin: 10px 0;
                  padding: 8px 0;
                  border-bottom: 1px solid #dee2e6;
              }
              .detail-row:last-child {
                  border-bottom: none;
                  font-weight: bold;
                  font-size: 18px;
                  color: #28a745;
              }
              .success-icon {
                  font-size: 48px;
                  margin-bottom: 20px;
              }
              .footer {
                  text-align: center;
                  padding: 20px;
                  background-color: #f8f9fa;
                  color: #666;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="success-icon">✅</div>
                  <h1 style="margin: 0;">Payment Successful!</h1>
              </div>
              <div class="content">
                  <h2>Hello ${data.name},</h2>
                  <p>Thank you for your payment! Your transaction has been processed successfully.</p>
                  
                  <div class="payment-details">
                      <h3 style="margin-top: 0; color: #495057;">Payment Details</h3>
                      <div class="detail-row">
                          <span>Order ID:</span>
                          <span>${data.orderId}</span>
                      </div>
                      <div class="detail-row">
                          <span>Transaction ID:</span>
                          <span>${data.transactionId}</span>
                      </div>
                      <div class="detail-row">
                          <span>Product:</span>
                          <span>${data.product}</span>
                      </div>
                      <div class="detail-row">
                          <span>Payment Date:</span>
                          <span>${data.paymentDate}</span>
                      </div>
                      <div class="detail-row">
                          <span>Total Amount:</span>
                          <span>${data.currency} ${data.amount}</span>
                      </div>
                  </div>
                  
                  <p>You will receive your purchase confirmation and access details shortly.</p>
                  <p>If you have any questions about your purchase, please don't hesitate to contact our support team.</p>
              </div>
              <div class="footer">
                  <p>This is an automated email. Please do not reply to this message.</p>
                  <p>&copy; 2025 Your Company Name. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getSubject(data: { orderId: string }): string {
    return `Payment Confirmation - Order #${data.orderId}`;
  }
}

export class PasswordResetTemplate implements EmailTemplate {
  generateHtml(data: { name: string; resetUrl: string; expiresIn: string }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
              body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  background-color: #f4f4f4;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  background-color: #ffffff;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              .header {
                  background-color: #dc3545;
                  color: white;
                  text-align: center;
                  padding: 30px 20px;
              }
              .content {
                  padding: 30px;
                  line-height: 1.6;
                  color: #333;
              }
              .button {
                  display: inline-block;
                  background-color: #dc3545;
                  color: white;
                  padding: 15px 30px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                  font-weight: bold;
              }
              .warning {
                  background-color: #fff3cd;
                  border: 1px solid #ffeaa7;
                  padding: 15px;
                  border-radius: 5px;
                  margin: 20px 0;
                  color: #856404;
              }
              .footer {
                  text-align: center;
                  padding: 20px;
                  background-color: #f8f9fa;
                  color: #666;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1 style="margin: 0;">🔐 Password Reset Request</h1>
              </div>
              <div class="content">
                  <h2>Hello ${data.name},</h2>
                  <p>We received a request to reset your password. Click the button below to create a new password:</p>
                  
                  <div style="text-align: center;">
                      <a href="${data.resetUrl}" class="button">Reset Password</a>
                  </div>
                  
                  <div class="warning">
                      <strong>⚠️ Important:</strong> This link will expire in ${data.expiresIn}. If you didn't request this password reset, please ignore this email.
                  </div>
                  
                  <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
                  <p style="word-break: break-all; color: #007bff;">${data.resetUrl}</p>
                  
                  <p>For security reasons, we recommend creating a strong password that includes:</p>
                  <ul>
                      <li>At least 8 characters</li>
                      <li>Both uppercase and lowercase letters</li>
                      <li>Numbers and special characters</li>
                  </ul>
              </div>
              <div class="footer">
                  <p>If you have any questions, contact our support team.</p>
                  <p>&copy; 2025 Your Company Name. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  getSubject(): string {
    return 'Reset Your Password';
  }
}
