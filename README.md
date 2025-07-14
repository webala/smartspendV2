# SmartSpend V2

A modern personal finance management application built with React and Express.js.

## Project Structure

```
smartspendV2/
├── backend/          # Express.js API server
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js  # Database connection
│   │   └── index.js         # Main server file
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/         # React.js application
│   ├── src/
│   ├── public/
│   └── package.json
├── package.json      # Workspace configuration
└── README.md
```

## Technology Stack

- **Backend**: Express.js, Node.js, MongoDB, Mongoose
- **Frontend**: React.js, Vite
- **Database**: MongoDB
- **Package Manager**: pnpm
- **Workspace**: pnpm workspaces

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

### Development

To start both backend and frontend in development mode:

```bash
pnpm run dev
```

To start servers individually:

```bash
# Backend only (runs on port 3001)
pnpm run dev:backend

# Frontend only (runs on port 5173)
pnpm run dev:frontend
```

### Build

To build the entire application:

```bash
pnpm run build
```

## Database Models

The application uses MongoDB with Mongoose for data modeling:

- **User**: Stores user account information and authentication details
- **Expense**: Tracks individual expense entries with categories and dates
- **FinancialGoal**: Manages financial goals with progress tracking
- **Income**: Stores monthly income data for budgeting
- **BuddyRelationship**: Manages buddy connections between users

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register or login to receive a JWT token
2. Include the token in the Authorization header: `Bearer <token>`
3. All endpoints except `/auth/register` and `/auth/login` require authentication

## AI Features

The application integrates with Ollama for AI-powered financial advice:

- **Financial Advice**: Get personalized recommendations based on your data
- **Spending Analysis**: Analyze spending patterns and identify optimization opportunities
- **Budget Recommendations**: Get AI-generated budget suggestions

**Prerequisites for AI features:**

- Install and run Ollama locally
- Download a compatible model (e.g., llama2)
- Ensure Ollama is running on `http://localhost:11434`

### API Endpoints

#### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get user profile (protected)

#### Expenses

- `GET /expenses/analytics` - Get expense analytics (protected)
- `POST /expenses` - Create new expense (protected)
- `GET /expenses` - Get user expenses with filtering (protected)
- `PUT /expenses/:id` - Update expense (protected)
- `DELETE /expenses/:id` - Delete expense (protected)

#### Financial Goals

- `GET /goals/analytics` - Get goal analytics (protected)
- `POST /goals` - Create new goal (protected)
- `GET /goals` - Get user goals (protected)
- `PUT /goals/:id` - Update goal (protected)
- `DELETE /goals/:id` - Delete goal (protected)
- `PUT /goals/:id/progress` - Update goal progress (protected)

#### Income

- `GET /income/analytics` - Get income analytics (protected)
- `POST /income` - Set/update monthly income (protected)
- `GET /income` - Get income history (protected)
- `GET /income/:month` - Get income for specific month (protected)
- `DELETE /income/:id` - Delete income entry (protected)

#### Buddy System

- `POST /buddies/request` - Send buddy request (protected)
- `POST /buddies/accept/:id` - Accept buddy request (protected)
- `POST /buddies/reject/:id` - Reject buddy request (protected)
- `GET /buddies/requests` - Get pending requests (protected)
- `GET /buddies` - Get buddies and their goals (protected)
- `DELETE /buddies/:id` - Remove buddy (protected)

#### AI Financial Agent

- `POST /ai/advice` - Get personalized financial advice (protected)
- `POST /ai/analyze` - Analyze spending patterns (protected)
- `POST /ai/budget` - Get budget recommendations (protected)

#### System

- `GET /` - API status and endpoints
- `GET /api/health` - Health check with database status

## Environment Variables

### Backend

Create a `.env` file in the `backend` directory:

```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smartspendv2
JWT_SECRET=your-super-secret-jwt-key-here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

**Note**:

- For local MongoDB: Use `mongodb://localhost:27017/smartspendv2`
- For MongoDB Atlas: Use your connection string from MongoDB Atlas
- Make sure to replace the database name (`smartspendv2`) with your preferred name
- Replace `JWT_SECRET` with a secure random string for production
- For AI features, make sure Ollama is running locally on port 11434

## Scripts

- `pnpm run dev` - Start both frontend and backend in development mode
- `pnpm run build` - Build both applications
- `pnpm run dev:backend` - Start backend only
- `pnpm run dev:frontend` - Start frontend only
- `pnpm run install:all` - Install all dependencies
- `pnpm run clean` - Remove all node_modules

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
