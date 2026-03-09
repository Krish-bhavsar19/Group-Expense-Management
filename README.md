# 💰 Group Expense Management Platform

A modern, full-stack web application designed for effortless group expense tracking. It features comprehensive group and subgroup management, secure robust authentication, receipt uploads, AI-powered expense entry, and settlement calculation.

## 🎯 Current Status

✅ **Core Functionalities Fully Implemented**
- **Robust Authentication:** Email/Password (with OTP), Google OAuth 2.0, password reset, JWT-based security.
- **Group Management:** Create groups, invite members via links, and manage group details.
- **Subgroups:** Create isolated subgroups within main groups for focused expense tracking.
- **Expense Tracking:** Add, edit, and delete expenses. Upload receipts for proof of purchase.
- **AI-Powered Entry:** Leverage Google's Generative AI (Gemini) to parse voice transcripts or natural language inputs for quick expense creation.
- **Settlements:** Automatically calculate who owes whom and view detailed settlement charts.

## 🛠️ Tech Stack

### Frontend
- **React 18** (via Vite)
- **React Router DOM** for dynamic routing
- **Axios** for API communication
- **Framer Motion** for premium UI animations and transitions
- **Google OAuth** (`@react-oauth/google`)

### Backend
- **Node.js** with **Express.js**
- **MySQL** relational database setup
- **Google Generative AI** (`@google/generative-ai`) for smart parsing
- **JWT & Passport.js** for authentication and OAuth
- **Bcryptjs** for secure password hashing
- **Multer** for handling receipt uploads
- **Nodemailer** for email delivery (OTP)

## 📁 Project Structure

```
Group_Expanse_management/
├── backend/
│   ├── config/        # Database and passport setup
│   ├── controllers/   # Auth, Group, Subgroup, Expense, Settlement controllers
│   ├── middleware/    # Auth and validation middlewares
│   ├── models/        # Database models (User, Group, Expense, etc.)
│   ├── routes/        # API route definitions
│   ├── services/      # AI Service (Gemini integration), Email service
│   ├── utils/         # Helpers (jwt, email)
│   ├── uploads/       # Stores uploaded receipts
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI pieces (Auth, Groups, VoiceExpenseInput, etc.)
│   │   ├── config/     # API config
│   │   ├── context/    # React Context (AuthContext)
│   │   ├── pages/      # Full views (Dashboard, Groups, Home, JoinGroup, etc.)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql     # Complete database schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Gmail account (for OTP emails) OR SendGrid API key
- Google Cloud Console project (for OAuth Auth and Gemini API Key)

### 1. Database Setup
1. Install MySQL and start the service.
2. Create the database:
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE group_expense_management;
   ```
3. Run the schema:
   ```bash
   mysql -u root -p group_expense_management < database/schema.sql
   ```

### 2. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   npm install
   ```
2. Create and configure your `.env` file (`cp .env.example .env`):
   ```env
   # Server & DB Config
   PORT=5000
   NODE_ENV=development
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=group_expense_management

   # Security
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRE=7d
   SESSION_SECRET=your_session_secret_key

   # Google Integrations (OAuth & AI)
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
   GEMINI_API_KEY=your_gemini_api_key_here

   # Email Configuration (e.g., Gmail App Password)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_gmail_app_password

   # Frontend
   FRONTEND_URL=http://localhost:5173
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   npm install
   ```
2. Create and configure your `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
   *The app will run at `http://localhost:5173`.*

## 🧪 Application Flow & Usage

1. **Authentication**: Register an account via Email/OTP or log in seamlessly with Google OAuth.
2. **Dashboard**: Navigate to your personal dashboard summarizing recent activity and overall balances.
3. **Group Management**:
   - Create a new Group.
   - Generate an invite link to onboard friends securely.
   - Create **Subgroups** to isolate specific cohorts of members inside the main group.
4. **Expense Handling**:
   - Manually enter an expense, divide it evenly or by specific splits.
   - Attach image receipts for future reference.
   - Use the **Voice Expense Input/AI Parser** to quickly dictate an expense (e.g., "I paid 50 dollars for pizza yesterday for the whole group").
5. **Settlements**: Let the platform compute the minimal number of transactions required for everyone to be settled up.

## 📋 Key API Endpoints

- **Auth**: `/api/auth/register`, `/api/auth/login`, `/api/auth/google`, `/api/auth/verify-otp`
- **Groups**: `/api/groups` (GET, POST), `/api/groups/:id`
- **Subgroups**: `/api/groups/:groupId/subgroups` 
- **Expenses**: `/api/expenses` (POST, GET, PUT, DELETE), `/api/expenses/voice/parse`
- **Settlements**: `/api/settlements/:groupId`

## 🔒 Security Summary

- Passwords hashed using `bcryptjs` (10 rounds).
- Short-lived JWTs combined with HTTP-friendly patterns.
- SQL injection protection through parameterized MySQL queries.
- Strict input validation pipelines on API endpoints.
- Multer file-type validation to securely process image uploads.

## 🤝 Contributing & Future Scope
- **Phase 1-4 Complete**: Core Auth, Groups, Subgroups, Expenses, AI parsing, and Settlements are functional.
- **Phase 5 (Upcoming)**: Integrated chat rooms and real-time notifications via WebSockets.
