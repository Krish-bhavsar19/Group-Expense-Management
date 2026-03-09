import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import '../styles/dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        // Fetch user data
        const fetchUserData = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data.success) {
                    setUserData(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="dashboard-loading-spinner">
                    <div className="spinner-ring"></div>
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Navigation */}
            <nav className="dashboard-nav">
                <div className="dashboard-nav-logo" onClick={() => navigate('/')}>
                    <span>💸</span>
                    <span>BillSplit</span>
                </div>
                <div className="dashboard-nav-links">
                    <a href="/dashboard" className="active">Dashboard</a>
                    <a href="/groups">Groups</a>
                    <button className="dashboard-logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </nav>

            <div className="dashboard-content">
                {/* Welcome Header */}
                <div className="dashboard-welcome">
                    <h1>Welcome, {userData?.name || user?.name}! 👋</h1>
                    <p>{userData?.email || user?.email}</p>
                </div>

                {/* Main Card */}
                <div className="dashboard-main-card">
                    <span className="celebration-icon">🎉</span>
                    <h2>Authentication Successful!</h2>
                    <p>
                        Your authentication system is working perfectly! You're now ready to start building
                        the group expense management features.
                    </p>

                    {/* Features Checklist */}
                    <div className="dashboard-features">
                        <h3>✅ Completed Features</h3>
                        <ul>
                            <li><span className="check-icon">✓</span> Email/Password Registration</li>
                            <li><span className="check-icon">✓</span> Email OTP Verification</li>
                            <li><span className="check-icon">✓</span> JWT Authentication</li>
                            <li><span className="check-icon">✓</span> Google OAuth Integration</li>
                            <li><span className="check-icon">✓</span> Password Reset</li>
                            <li><span className="check-icon">✓</span> Protected Routes</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="dashboard-actions">
                        <button
                            className="dashboard-action-btn"
                            onClick={() => navigate('/groups')}
                        >
                            👥 My Groups
                        </button>
                    </div>

                    {/* Coming Next */}
                    <div className="dashboard-coming-next">
                        <p>📌 Coming Next: Expense Tracking with Voice Input & Receipt Upload, Subgroups, and Chat</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
