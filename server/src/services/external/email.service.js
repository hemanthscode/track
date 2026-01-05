import { getEmailTransporter, emailConfig } from "../../config/email.js";
import logger from "../../utils/logger.js";
import ApiError from "../../utils/ApiError.js";

/**
 * Send email
 */
const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = getEmailTransporter();

    const mailOptions = {
      from: emailConfig.from,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info("Email sent successfully", {
      to,
      subject,
      messageId: info.messageId,
    });

    return info;
  } catch (error) {
    logger.error("Email sending failed", {
      to,
      subject,
      error: error.message,
    });
    throw ApiError.internal("Failed to send email");
  }
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (email, username, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  const template = emailConfig.templates.passwordReset;

  await sendEmail(
    email,
    template.subject,
    template.text(resetUrl),
    template.html(resetUrl, username)
  );
};

/**
 * Send email verification
 */
export const sendEmailVerification = async (email, username, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  const template = emailConfig.templates.emailVerification;

  await sendEmail(
    email,
    template.subject,
    `Verify your email: ${verificationUrl}`,
    template.html(verificationUrl, username)
  );
};

/**
 * Send budget alert email
 */
export const sendBudgetAlertEmail = async (email, username, budgetData) => {
  const { category, spent, limit } = budgetData;
  const percentage = Math.round((spent / limit) * 100);

  const template = emailConfig.templates.budgetAlert;

  await sendEmail(
    email,
    template.subject,
    template.text(category, spent, limit),
    template.html(category, spent, limit, percentage)
  );
};

/**
 * Send weekly summary email
 */
export const sendWeeklySummaryEmail = async (email, username, summaryData) => {
  const { totalIncome, totalExpenses, topCategories, savings } = summaryData;

  const html = `
    <h2>Your Weekly Financial Summary</h2>
    <p>Hi ${username},</p>
    
    <h3>Overview</h3>
    <ul>
      <li><strong>Income:</strong> ₹${totalIncome}</li>
      <li><strong>Expenses:</strong> ₹${totalExpenses}</li>
      <li><strong>Savings:</strong> ₹${savings}</li>
    </ul>
    
    <h3>Top Spending Categories</h3>
    <ul>
      ${topCategories.map((cat) => `<li>${cat.category}: ₹${cat.amount}</li>`).join("")}
    </ul>
    
    <p>Keep tracking your expenses to stay on budget!</p>
    <a href="${process.env.FRONTEND_URL}/dashboard" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Dashboard</a>
  `;

  await sendEmail(email, "Your Weekly Financial Summary", "", html);
};

export default {
  sendPasswordResetEmail,
  sendEmailVerification,
  sendBudgetAlertEmail,
  sendWeeklySummaryEmail,
};
