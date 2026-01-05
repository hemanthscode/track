// Application-wide constants

export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

export const TRANSACTION_CATEGORIES = {
  INCOME: ["salary", "freelance", "investment", "gift", "other"],
  EXPENSE: [
    "food",
    "housing",
    "transport",
    "utilities",
    "entertainment",
    "health",
    "education",
    "shopping",
    "subscriptions",
    "travel",
    "insurance",
    "debt",
    "miscellaneous",
  ],
};

export const RECURRING_FREQUENCIES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

export const BUDGET_TYPES = {
  BUDGET: "budget",
  SAVINGS: "savings",
};

export const BUDGET_PERIODS = {
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  YEARLY: "yearly",
};

export const USER_ROLES = {
  USER: "user",
  ADMIN: "admin",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
};

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/jpg"],
  UPLOAD_DIR: "uploads/",
};

export const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100,
  LOGIN_MAX: 5,
};

export const JWT = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
};

export const EMAIL_TEMPLATES = {
  PASSWORD_RESET: "password-reset",
  EMAIL_VERIFICATION: "email-verification",
  BUDGET_ALERT: "budget-alert",
  WEEKLY_SUMMARY: "weekly-summary",
};

export const AI_PROMPTS = {
  CATEGORIZE: `You are a financial assistant. Categorize the following transaction description into one of these categories: ${TRANSACTION_CATEGORIES.EXPENSE.join(", ")}. Respond with ONLY the category name, nothing else.`,
  INSIGHTS: "Analyze the following spending data and provide 3 actionable insights to reduce expenses.",
  CHAT: "You are a helpful financial advisor. Answer questions about the user's transactions and budgets.",
};
