import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth pages
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import OTPVerification from './components/Auth/OTPVerification';
import ForgotPassword from './components/Auth/ForgotPassword';
import GoogleCallback from './components/Auth/GoogleCallback';

// Main pages
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetails from './pages/GroupDetails';
import JoinGroup from './pages/JoinGroup';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import Settlement from './pages/Settlement';

function App() {
    return (
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <AuthProvider>
                <Router>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/verify-otp" element={<OTPVerification />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/auth/google/callback" element={<GoogleCallback />} />
                        <Route path="/invite/:inviteCode" element={<JoinGroup />} />

                        {/* Protected routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
                        <Route path="/groups/:id" element={<ProtectedRoute><GroupDetails /></ProtectedRoute>} />
                        <Route path="/groups/:groupId/expenses" element={<ProtectedRoute><Expenses /></ProtectedRoute>} />
                        <Route path="/groups/:groupId/add-expense" element={<ProtectedRoute><AddExpense /></ProtectedRoute>} />
                        <Route path="/groups/:groupId/settlement" element={<ProtectedRoute><Settlement /></ProtectedRoute>} />

                        {/* Default redirect */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Routes>
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
