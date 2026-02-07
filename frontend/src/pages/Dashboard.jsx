import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

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
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{ color: 'white', fontSize: '20px', fontFamily: 'Inter, sans-serif' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'Inter, sans-serif',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                {/* Header */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '30px 40px',
                    marginBottom: '30px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <div>
                        <h1 style={{
                            fontSize: '36px',
                            fontWeight: '800',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '8px'
                        }}>
                            Welcome, {userData?.name || user?.name}! 👋
                        </h1>
                        <p style={{ color: '#666', fontSize: '16px' }}>
                            {userData?.email || user?.email}
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '12px 28px',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
                            transition: 'transform 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        Logout
                    </button>
                </div>

                {/* Main Content */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '20px',
                    padding: '50px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '80px', marginBottom: '20px' }}>🎉</div>
                    <h2 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        color: '#333',
                        marginBottom: '16px'
                    }}>
                        Authentication Successful!
                    </h2>
                    <p style={{
                        fontSize: '18px',
                        color: '#666',
                        lineHeight: '1.6',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}>
                        Your authentication system is working perfectly! You're now ready to start building
                        the group expense management features.
                    </p>

                    <div style={{
                        marginTop: '40px',
                        padding: '24px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        textAlign: 'left'
                    }}>
                        <h3 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: '#333',
                            marginBottom: '16px'
                        }}>
                            ✅ Completed Features:
                        </h3>
                        <ul style={{
                            listStyle: 'none',
                            padding: 0,
                            fontSize: '16px',
                            lineHeight: '2'
                        }}>
                            <li>✓ Email/Password Registration</li>
                            <li>✓ Email OTP Verification</li>
                            <li>✓ JWT Authentication</li>
                            <li>✓ Google OAuth Integration</li>
                            <li>✓ Password Reset</li>
                            <li>✓ Protected Routes</li>
                        </ul>
                    </div>

                    <div style={{
                        marginTop: '30px',
                        display: 'flex',
                        gap: '15px',
                        justifyContent: 'center'
                    }}>
                        <button
                            onClick={() => navigate('/groups')}
                            style={{
                                padding: '15px 35px',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                        >
                            👥 My Groups
                        </button>
                    </div>

                    <div style={{
                        marginTop: '30px',
                        padding: '24px',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        borderRadius: '12px',
                        border: '2px solid rgba(102, 126, 234, 0.3)'
                    }}>
                        <p style={{
                            fontSize: '16px',
                            color: '#555',
                            fontWeight: '600'
                        }}>
                            📌 Coming Next: Expense Tracking with Voice Input & Receipt Upload, Subgroups, and Chat
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
