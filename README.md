# 💰 Group Expense Management Platform

A full-stack web application for managing group expenses with features like group creation, expense tracking, settlements, subgroups, and integrated chat.

## 🎯 Current Status: Phase 1 Complete

✅ **Authentication System Fully Implemented**
- Email/Password registration with OTP verification
- JWT token-based authentication
- Google OAuth 2.0 integration
- Password reset functionality
- Protected routes and middleware

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- React Router DOM for routing
- Axios for API calls
- Google OAuth library
- Premium UI with CSS animations

### Backend
- **Node.js** with Express
- **MySQL** for database
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **Nodemailer** for email OTP
- **bcryptjs** for password hashing

## 📁 Project Structure

```
Group_Expanse_management/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── passport.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   └── auth.js
│   ├── utils/
│   │   ├── email.js
│   │   └── jwt.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   ├── OTPVerification.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── GoogleCallback.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── config/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx
│   │   ├── styles/
│   │   │   └── auth.css
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- Gmail account (for sending OTP emails) OR SendGrid API key
- Google Cloud Console project (for OAuth)

### 1. Database Setup

1. Install MySQL and start the MySQL service
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

1. Navigate to backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

4. Configure `.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=group_expense_management

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Google OAuth (Get from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Email Configuration (Option 1: Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Email Configuration (Option 2: SendGrid)
# SENDGRID_API_KEY=your_sendgrid_api_key

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session Secret
SESSION_SECRET=your_session_secret_key
```

#### 📧 Gmail Setup for OTP Emails

1. Enable 2-Step Verification in your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Generate an App Password
4. Use this App Password in `EMAIL_PASSWORD`

#### 🔑 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen
6. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
7. Copy **Client ID** and **Client Secret** to `.env`

5. Start the backend server:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create `.env` file:

```bash
cp .env.example .env
```

4. Configure `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

5. Start the frontend:

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🧪 Testing the Application

### 1. Email/Password Registration Flow

1. Go to `http://localhost:5173/signup`
2. Fill in the registration form
3. Check your email for OTP code
4. Enter OTP to verify email
5. Login with your credentials

### 2. Google OAuth Flow

1. Go to `http://localhost:5173/login`
2. Click "Continue with Google"
3. Select your Google account
4. You'll be redirected to dashboard

### 3. Password Reset Flow

1. Go to `http://localhost:5173/forgot-password`
2. Enter your email
3. Check email for OTP
4. Enter OTP and new password
5. Login with new password

## 📋 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/verify-otp` | Verify email OTP | Public |
| POST | `/api/auth/resend-otp` | Resend OTP | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password | Public |
| GET | `/api/auth/me` | Get current user | Private |
| GET | `/api/auth/google` | Initiate Google OAuth | Public |
| GET | `/api/auth/google/callback` | Google OAuth callback | Public |

## 🎨 Features

### Current Features (Phase 1)

✅ User registration with email verification  
✅ OTP-based email verification (10-minute expiry)  
✅ Secure password hashing with bcrypt  
✅ JWT token authentication  
✅ Google OAuth 2.0 integration  
✅ Password reset with OTP  
✅ Protected routes  
✅ Premium UI with animations  
✅ Responsive design  
✅ Auto-focus OTP inputs  
✅ Countdown timer for OTP  
✅ Password strength indicator  

### Upcoming Features

📌 **Phase 2: Group Management**
- Create and manage groups
- Add/remove members
- Group settings and permissions

📌 **Phase 3: Expense Tracking**
- Add expenses to groups
- Track who paid and who owes
- Calculate settlements
- Monthly transaction tracking

📌 **Phase 4: Subgroups**
- Create subgroups within main groups
- Manage partial transactions
- Isolated expense tracking

📌 **Phase 5: Chat Feature**
- Real-time group chat
- Message history
- Notifications

## 🔒 Security Features

- Passwords hashed with bcryptjs (10 salt rounds)
- JWT tokens with configurable expiry
- OTP stored in single JSON column (not separate columns)
- Protected routes with middleware
- CORS configuration
- Input validation
- SQL injection prevention with parameterized queries
- XSS protection

## 🎯 Database Schema

### Users Table

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Can be NULL for OAuth users
    auth_metadata JSON DEFAULT (JSON_OBJECT()),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);
```

**auth_metadata JSON structure:**
```json
{
  "otp": "123456",
  "otpExpiry": "2026-02-06T22:00:00Z",
  "isEmailVerified": false,
  "googleId": null,
  "loginAttempts": 0,
  "lastLoginAttempt": null
}
```

## 📝 Environment Variables Reference

### Backend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Backend server port | `5000` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `DB_NAME` | Database name | `group_expense_management` |
| `JWT_SECRET` | Secret key for JWT | Random string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | From Google Console |
| `EMAIL_USER` | Gmail address | `youremail@gmail.com` |
| `EMAIL_PASSWORD` | Gmail app password | From Google Account |
| `FRONTEND_URL` | Frontend URL | `http://localhost:5173` |

### Frontend `.env`

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID | Same as backend |

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;
```

### Email Not Sending

1. Check Gmail App Password is correct
2. Verify 2-Step Verification is enabled
3. Check spam folder
4. Try SendGrid as alternative

### Google OAuth Not Working

1. Verify redirect URI matches exactly
2. Check Client ID and Secret
3. Ensure Google+ API is enabled
4. Clear browser cache and try again

### Port Already in Use

```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 5173
npx kill-port 5173
```

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

Future phases will be implemented. Stay tuned!

---

**Created with ❤️ using React, Node.js, and MySQL**
