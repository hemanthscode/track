import nodemailer from "nodemailer";
import { config } from "./env.js";
import logger from "../utils/logger.js";

let transporter = null;

export const initializeEmail = () => {
  try {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth,
    });

    // Verify connection (async, don't block startup)
    transporter.verify((error) => {
      if (error) {
        logger.error("Email verification failed", { error: error.message });
      } else {
        logger.info("✅ Email service ready");
      }
    });

    return transporter;
  } catch (error) {
    logger.error("Failed to initialize email", { error: error.message });
    throw error;
  }
};

export const getEmailTransporter = () => {
  if (!transporter) {
    return initializeEmail();
  }
  return transporter;
};

export const emailConfig = {
  from: config.email.from,
  templates: {
    passwordReset: {
      subject: "Password Reset Request",
      text: (resetUrl) =>
        `You requested a password reset. Click here: ${resetUrl}\n\nIf you didn't request this, ignore this email.`,
      html: (resetUrl, username) => `
        <h2>Password Reset Request</h2>
        <p>Hi ${username},</p>
        <p>You requested to reset your password. Click the button below:</p>
        <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    },
    budgetAlert: {
      subject: "Budget Alert: Spending Limit Reached",
      text: (category, spent, limit) =>
        `Alert: You've spent ${spent} out of ${limit} in ${category} category.`,
      html: (category, spent, limit, percentage) => `
        <h2>Budget Alert</h2>
        <p>You've reached ${percentage}% of your ${category} budget!</p>
        <p><strong>Spent:</strong> ₹${spent}</p>
        <p><strong>Limit:</strong> ₹${limit}</p>
        <p>Consider reviewing your expenses to stay within budget.</p>
      `,
    },
    emailVerification: {
      subject: "Verify Your Email Address",
      html: (verificationUrl, username) => `
        <h2>Welcome to Expense Tracker!</h2>
        <p>Hi ${username},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="background: #10B981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `,
    },
  },
};

export default { initializeEmail, getEmailTransporter, emailConfig };
