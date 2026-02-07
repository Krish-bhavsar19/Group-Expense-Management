const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const name = profile.displayName;
                const googleId = profile.id;

                // Check if user exists
                let user = await User.findByEmail(email);

                if (user) {
                    // Update Google ID if not set
                    if (!user.auth_metadata.googleId) {
                        await User.updateGoogleAuth(user.id, googleId);
                        user.auth_metadata.googleId = googleId;
                    }
                    // Mark email as verified for Google OAuth users
                    if (!user.auth_metadata.isEmailVerified) {
                        const metadata = {
                            ...user.auth_metadata,
                            isEmailVerified: true,
                            googleId
                        };
                        await User.updateAuthMetadata(user.id, metadata);
                        user.auth_metadata = metadata;
                    }
                } else {
                    // Create new user
                    user = await User.create({
                        name,
                        email,
                        password: null, // No password for OAuth users
                        auth_metadata: {
                            isEmailVerified: true,
                            googleId,
                            otp: null,
                            otpExpiry: null,
                            loginAttempts: 0,
                            lastLoginAttempt: null
                        }
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

module.exports = passport;
