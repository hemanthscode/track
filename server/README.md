# Expense Tracker Backend API 🚀

**Production-grade Expense Tracker API** built with Node.js, Express, MongoDB, and AI-powered features using Groq. Features real-time analytics, OCR receipt processing, recurring transactions, budget tracking, and intelligent financial insights.

## ✨ Features

| Category | Features |
|----------|----------|
| **Core** | User auth (JWT), Transactions CRUD, Categories, Tags, Search |
| **Analytics** | Overview, Category breakdown, Trends, Comparisons, Monthly summaries |
| **Budgets** | Budget tracking, Savings goals, Progress tracking, Alerts |
| **Recurring** | Daily/Weekly/Monthly/Yearly recurring transactions, Auto-generation |
| **Receipts** | Cloudinary storage, OCR processing, Transaction linking |
| **AI** | Smart categorization, Financial insights, Budget recommendations, Chat assistant |
| **Admin** | User management, Role assignment, Account activation/deletion |
| **Advanced** | Rate limiting, Validation, Error handling, Logging, Background jobs |

## 🛠️ Tech Stack

```
Backend: Node.js 22.19.0, Express.js, TypeScript
Database: MongoDB Atlas, Mongoose ODM
Auth: JWT, bcryptjs
AI: Groq (Llama 3.3 70B), OCR processing
Storage: Cloudinary
Email: Nodemailer (Gmail)
Jobs: node-cron (Recurring tx, Budget alerts)
Validation: express-validator
Utils: date-fns, lodash, winston
Dev: nodemon, Jest, ESLint, Prettier
Deployment: Docker-ready
```

## 📁 Project Structure

```
src/
├── app.js                 # Express app setup
├── server.js              # Server initialization
├── config/                # Environment, DB, services
├── controllers/           # Business logic
├── models/                # Mongoose schemas
├── routes/                # API routes
├── middlewares/           # Auth, validation, upload
├── services/              # External services (AI, email)
├── utils/                 # Helpers, logger, errors
├── jobs/                  # Background cron jobs
└── validation/            # Express-validator schemas
```

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 22.19.0
npm >= 10
MongoDB Atlas account
Gmail app password
Cloudinary account
Groq API key
```

### Installation

```bash
# Clone & install
git clone <repo-url>
cd expense-tracker-backend
npm install

# Copy & configure env
cp .env.example .env
# Edit .env with your credentials

# Seed database (optional - realistic test data)
npm run seed:fresh

# Development
npm run dev

# Production
npm start
```

### Environment Variables

```env
# Database
DATABASE_URI=mongodb+srv://user:pass@cluster.mongodb.net/expense-tracker

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Groq AI
GROQ_API_KEY=your_groq_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@expensetracker.com
```

## 🔑 Authentication

All routes require `Authorization: Bearer <access_token>` except public auth routes.

### Token Flow

```
Login → Access Token (15m) + Refresh Token (7d)
Refresh → New Access Token
```

## 📖 API Documentation

### Base URL: `http://localhost:3000/api`

#### Health Check
```
GET /health
GET /health/detailed
```

#### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Create user account |
| `POST` | `/auth/login` | No | Login & get tokens |
| `POST` | `/auth/refresh` | No | Refresh access token |
| `POST` | `/auth/forgot-password` | No | Request password reset |
| `POST` | `/auth/reset-password` | No | Reset password |
| `POST` | `/auth/verify-email` | No | Verify email |
| `GET` | `/auth/me` | Yes | Get current user |
| `POST` | `/auth/logout` | Yes | Logout |

#### Users
| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| `GET` | `/users/profile` | Yes | No | Get profile |
| `PUT` | `/users/profile` | Yes | No | Update profile |
| `PUT` | `/users/change-password` | Yes | No | Change password |
| `GET` | `/users/login-history` | Yes | No | Login history |
| `DELETE` | `/users/deactivate` | Yes | No | Deactivate account |
| `GET` | `/users` | Yes | Yes | List all users |
| `PUT` | `/users/:id/role` | Yes | Yes | Update user role |
| `PUT` | `/users/:id/activate` | Yes | Yes | Activate user |
| `DELETE` | `/users/:id` | Yes | Yes | Soft delete |
| `DELETE` | `/users/:id/permanent` | Yes | Yes | Hard delete |

#### Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/transactions` | Yes | Create transaction |
| `GET` | `/transactions` | Yes | List transactions |
| `GET` | `/transactions/search` | Yes | Search transactions |
| `GET` | `/transactions/:id` | Yes | Get transaction |
| `PUT` | `/transactions/:id` | Yes | Update transaction |
| `DELETE` | `/transactions/:id` | Yes | Delete transaction |

#### Recurring Transactions
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/recurring` | Yes | Create recurring |
| `GET` | `/recurring` | Yes | List recurring |
| `GET` | `/recurring/:id` | Yes | Get recurring |
| `PUT` | `/recurring/:id` | Yes | Update recurring |
| `POST` | `/recurring/:id/cancel` | Yes | Cancel recurring |
| `DELETE` | `/recurring/:id` | Yes | Delete recurring |
| `GET` | `/recurring/:id/upcoming` | Yes | Get upcoming instances |

#### Budgets & Savings
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/budgets` | Yes | Create budget/savings |
| `GET` | `/budgets` | Yes | List budgets |
| `GET` | `/budgets/summary` | Yes | Budget summary |
| `GET` | `/budgets/:id` | Yes | Get budget |
| `PUT` | `/budgets/:id` | Yes | Update budget |
| `DELETE` | `/budgets/:id` | Yes | Delete budget |
| `POST` | `/budgets/:id/progress` | Yes | Add progress (savings) |

#### Receipts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/receipts` | Yes | Upload receipt |
| `GET` | `/receipts` | Yes | List receipts |
| `GET` | `/receipts/:id` | Yes | Get receipt |
| `POST` | `/receipts/:id/link` | Yes | Link to transaction |
| `POST` | `/receipts/:id/unlink` | Yes | Unlink from transaction |
| `DELETE` | `/receipts/:id` | Yes | Delete receipt |
| `POST` | `/receipts/:id/retry-ocr` | Yes | Retry OCR |

#### Analytics
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/analytics/overview` | Yes | Dashboard overview |
| `GET` | `/analytics/category-breakdown` | Yes | Category analysis |
| `GET` | `/analytics/trends` | Yes | Spending trends |
| `GET` | `/analytics/comparisons` | Yes | Period comparisons |
| `GET` | `/analytics/monthly-summary` | Yes | Monthly report |
| `GET` | `/analytics/statistics` | Yes | Key statistics |

#### AI Features
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/ai/categorize` | Yes | AI categorize transaction |
| `POST` | `/ai/insights` | Yes | Financial insights |
| `POST` | `/ai/budget-recommendations` | Yes | AI budget suggestions |
| `POST` | `/ai/chat` | Yes | Chat with AI assistant |
| `POST` | `/ai/bulk-categorize` | Yes | Bulk categorization |

## 🧪 Testing

### Postman Collection
- Import `postman_environment.json` & `postman_collection.json`
- 68+ endpoints with auto-token management
- Full test coverage

### Seed Data
```bash
npm run seed:fresh  # Realistic test data
```

### Unit Tests
```bash
npm test  # Jest + coverage
```

## 🔧 Development

```bash
# Dev server with hot reload
npm run dev

# Lint & format
npm run lint
npm run format

# Build & start
npm run build
npm start
```

## 🐳 Docker

```dockerfile
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URI=${DATABASE_URI}
```

## 🔐 Security

- **JWT Authentication** with refresh tokens
- **Rate Limiting** (auth endpoints)
- **Input Validation** (express-validator)
- **File Upload Security** (Cloudinary, size/type limits)
- **MongoDB Sanitization** (Mongoose)
- **CORS Protection**
- **Error Handling** (no stack traces in prod)

## 📊 Background Jobs

| Job | Schedule | Purpose |
|-----|----------|---------|
| Recurring Transactions | Daily 00:00 | Generate next instances |
| Budget Alerts | Every 6 hours | Send threshold alerts |
| Budget Reset | Daily 01:00 | Reset expired budgets |

## 📈 Performance

- **MongoDB Indexes** on all query fields
- **Pagination** (default 50, max 100)
- **Caching** (Redis-ready)
- **Connection Pooling** (MongoDB)
- **Lazy Loading** (populate only when needed)

## ⚠️ Error Handling

All errors return standardized JSON:

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "statusCode": 422,
    "errors": ["Amount must be greater than 0"]
  }
}
```

## 📱 Postman Setup

1. Import environment & collection files
2. Login to auto-populate tokens
3. Test all routes in sequence
4. Environment variables auto-sync

## 🤝 Contributing

1. Fork & clone repository
2. Install dependencies: `npm install`
3. Create feature branch: `feat/your-feature`
4. Commit: `git commit -m "feat: add feature"`
5. PR to `main` branch

## 📄 License

[MIT License](LICENSE) © 2026 Expense Tracker Team

***

<div align="center">

**Built with ❤️ for financial freedom**  
⭐ Star us on GitHub! ⭐

</div>