# Track - Expense Manager Frontend

Modern expense tracking application built with React, Vite, and TailwindCSS.

## Features

- 📊 Real-time analytics dashboard
- 💳 Transaction management
- 💰 Budget tracking
- 🔄 Recurring transactions
- 📸 AI-powered receipt OCR
- 🤖 AI financial assistant
- 📱 Responsive design
- 🌓 Dark/Light theme

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Query** - Data fetching
- **Zustand** - State management
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Create `.env` file:
\`\`\`bash
cp .env.example .env
\`\`\`

3. Start development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open http://localhost:5173

## Project Structure

\`\`\`
src/
├── components/     # Reusable UI components
├── pages/          # Route pages
├── hooks/          # Custom React hooks
├── lib/            # Utilities and API client
├── store/          # Zustand stores
├── styles/         # Global styles
└── data/           # Mock data
\`\`\`

## Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

Backend API should be running on `http://localhost:3000`

See backend documentation for API endpoints.

## License

MIT
