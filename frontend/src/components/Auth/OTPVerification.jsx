import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../config/api';
import '../../styles/auth.css';

const OTPVerification = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const email = location.state?.email;
    const name = location.state?.name || 'User';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [timer, setTimer] = useState(600); // 10 minutes
    const [canResend, setCanResend] = useState(false);

    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            navigate('/signup');
        }
    }, [email, navigate]);

    useEffect(() => {
        // Countdown timer
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

    const handleChange = (index, value) => {
        if (isNaN(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all filled
        if (index === 5 && value && newOtp.every(digit => digit !== '')) {
            handleSubmit(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = pastedData.split('');

        if (newOtp.every(char => !isNaN(char))) {
            setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
            if (newOtp.length === 6) {
                handleSubmit(newOtp.join(''));
            }
        }
    };

    const handleSubmit = async (otpCode = null) => {
        const otpValue = otpCode || otp.join('');

        if (otpValue.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/verify-otp', {
                email,
                otp: otpValue
            });

            if (response.data.success) {
                setSuccess('Email verified successfully! Redirecting...');
                login(response.data.data.user, response.data.data.token);
                setTimeout(() => navigate('/dashboard'), 1500);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/auth/resend-otp', { email });

            if (response.data.success) {
                setSuccess('New OTP sent to your email!');
                setTimer(600);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">📧</div>
                    <h1 className="auth-title">Verify Your Email</h1>
                    <p className="auth-subtitle">
                        We've sent a 6-digit code to <strong>{email}</strong>
                    </p>
                </div>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="otp-container">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength="1"
                            className="otp-input"
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            disabled={loading}
                            autoFocus={index === 0}
                        />
                    ))}
                </div>

                <div className={`otp-timer ${timer === 0 ? 'expired' : ''}`}>
                    {timer > 0 ? (
                        <>Time remaining: {formatTime(timer)}</>
                    ) : (
                        <>OTP expired. Please request a new one.</>
                    )}
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleSubmit()}
                    disabled={loading || otp.some(digit => digit === '')}
                    style={{ marginTop: '24px' }}
                >
                    {loading ? (
                        <>
                            <span className="spinner"></span>
                            Verifying...
                        </>
                    ) : (
                        'Verify Email'
                    )}
                </button>

                <div className="auth-footer" style={{ marginTop: '20px' }}>
                    Didn't receive the code?{' '}
                    <span
                        className={`resend-link ${!canResend ? 'disabled' : ''}`}
                        onClick={handleResend}
                    >
                        Resend OTP
                    </span>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;
