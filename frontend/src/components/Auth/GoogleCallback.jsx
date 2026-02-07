import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            navigate('/login', {
                state: { error: 'Google authentication failed. Please try again.' }
            });
            return;
        }

        if (token) {
            // Get user data
            const fetchUser = async () => {
                try {
                    const response = await api.get('/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    if (response.data.success) {
                        login(response.data.data, token);
                        navigate('/dashboard');
                    }
                } catch (err) {
                    navigate('/login', {
                        state: { error: 'Failed to authenticate. Please try again.' }
                    });
                }
            };

            fetchUser();
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, login]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontFamily: 'Inter, sans-serif',
            fontSize: '20px'
        }}>
            <div>
                <div className="spinner" style={{
                    margin: '0 auto 20px',
                    width: '40px',
                    height: '40px',
                    borderWidth: '4px'
                }}></div>
                Completing authentication...
            </div>
        </div>
    );
};

export default GoogleCallback;
