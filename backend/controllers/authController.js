const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { generateOTP, sendOTPEmail, sendPasswordResetEmail } = require('../utils/email');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if user already exists
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user with OTP in auth_metadata
        const user = await User.create({
            name,
            email,
            password,
            auth_metadata: {
                otp,
                otpExpiry: otpExpiry.toISOString(),
                isEmailVerified: false,
                googleId: null,
                loginAttempts: 0,
                lastLoginAttempt: null
            }
        });

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, name);
        } catch (emailError) {
            console.error('Email send error:', emailError);
            // Continue even if email fails - user can resend
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email for OTP verification.',
            data: {
                userId: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and OTP'
            });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.auth_metadata.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Verify OTP
        if (user.auth_metadata.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check if OTP expired
        const now = new Date();
        const otpExpiry = new Date(user.auth_metadata.otpExpiry);
        if (now > otpExpiry) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Update user - mark as verified and clear OTP
        const updatedMetadata = {
            ...user.auth_metadata,
            isEmailVerified: true,
            otp: null,
            otpExpiry: null
        };
        await User.updateAuthMetadata(user.id, updatedMetadata);

        // Generate JWT token
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: 'Email verified successfully!',
            data: {
                token,
                user: User.getSafeUser({ ...user, auth_metadata: updatedMetadata })
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during OTP verification',
            error: error.message
        });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if already verified
        if (user.auth_metadata.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email already verified'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Update metadata
        const updatedMetadata = {
            ...user.auth_metadata,
            otp,
            otpExpiry: otpExpiry.toISOString()
        };
        await User.updateAuthMetadata(user.id, updatedMetadata);

        // Send OTP email
        await sendOTPEmail(email, otp, user.name);

        res.status(200).json({
            success: true,
            message: 'New OTP sent successfully! Please check your email.'
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while resending OTP',
            error: error.message
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user has a password (not OAuth-only user)
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: 'Please login using Google OAuth'
            });
        }

        // Check if email is verified
        if (!user.auth_metadata.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in',
                needsVerification: true
            });
        }

        // Verify password
        const isMatch = await User.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            data: {
                token,
                user: User.getSafeUser(user)
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: error.message
        });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email'
            });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            // Don't reveal if user exists or not
            return res.status(200).json({
                success: true,
                message: 'If an account exists with this email, a password reset OTP has been sent.'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        // Update metadata
        const updatedMetadata = {
            ...user.auth_metadata,
            otp,
            otpExpiry: otpExpiry.toISOString()
        };
        await User.updateAuthMetadata(user.id, updatedMetadata);

        // Send password reset email
        await sendPasswordResetEmail(email, otp, user.name);

        res.status(200).json({
            success: true,
            message: 'If an account exists with this email, a password reset OTP has been sent.'
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email, OTP, and new password'
            });
        }

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify OTP
        if (user.auth_metadata.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        // Check if OTP expired
        const now = new Date();
        const otpExpiry = new Date(user.auth_metadata.otpExpiry);
        if (now > otpExpiry) {
            return res.status(400).json({
                success: false,
                message: 'OTP has expired. Please request a new one.'
            });
        }

        // Update password
        await User.updatePassword(user.id, newPassword);

        // Clear OTP
        const updatedMetadata = {
            ...user.auth_metadata,
            otp: null,
            otpExpiry: null
        };
        await User.updateAuthMetadata(user.id, updatedMetadata);

        res.status(200).json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset',
            error: error.message
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            success: true,
            data: User.getSafeUser(user)
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

// @desc    Google OAuth callback success
// @route   GET /api/auth/google/success
// @access  Public (but requires Google authentication)
const googleAuthSuccess = async (req, res) => {
    try {
        if (!req.user) {
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
        }

        // Generate token
        const token = generateToken(req.user.id);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
        console.error('Google auth success error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
};

module.exports = {
    register,
    verifyOTP,
    resendOTP,
    login,
    forgotPassword,
    resetPassword,
    getMe,
    googleAuthSuccess
};
