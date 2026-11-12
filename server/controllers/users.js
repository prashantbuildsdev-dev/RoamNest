const User = require("../models/user.js");
const passport = require("passport");
const sendEmail = require("../utils/sendEmail");

// Signup
module.exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Username, email and password are required."
            });
        }

        const existingUser = await User.findOne({
            email: email.trim().toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });
        }

        const newUser = new User({
            username: username.trim(),
            email: email.trim().toLowerCase()
        });

        const registeredUser = await User.register(newUser, password);

        req.logIn(registeredUser, async (error) => {
            if (error) {
                console.error("Login after signup failed:", error.message);

                return res.status(500).json({
                    success: false,
                    message: "Account created, but automatic login failed."
                });
            }

            await sendEmail(
                registeredUser.email,
                "Welcome to RoamNest!",
                `
                    <h2>Welcome to RoamNest, ${registeredUser.username}!</h2>
                    <p>Your account has been created successfully.</p>
                    <p>You can now explore listings and book your favourite stays.</p>
                    <p>Thank you for joining RoamNest!</p>
                `
            );

            res.status(201).json({
                success: true,
                message: "Account created successfully.",
                user: {
                    id: registeredUser._id,
                    username: registeredUser.username,
                    email: registeredUser.email
                }
            });
        });

    } catch (error) {
        console.error("Signup error:", error.message);

        res.status(400).json({
            success: false,
            message: "Unable to create account. Please check your details."
        });
    }
};


// Login
module.exports.login = (req, res, next) => {
    passport.authenticate("local", (error, user, info) => {
        if (error) {
            return next(error);
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password."
            });
        }

        req.logIn(user, async (error) => {
            if (error) {
                return next(error);
            }

            await sendEmail(
                user.email,
                "RoamNest Login Notification",
                `
                    <h2>Hello ${user.username}!</h2>
                    <p>You have successfully logged in to your RoamNest account.</p>
                    <p>If this wasn't you, please secure your account.</p>
                `
            );

            res.status(200).json({
                success: true,
                message: "Login successful.",
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email
                }
            });
        });

    })(req, res, next);
};


// Logout
module.exports.logout = (req, res, next) => {
    req.logout((error) => {
        if (error) {
            return next(error);
        }

        req.session.destroy((error) => {
            if (error) {
                return next(error);
            }

            res.clearCookie("connect.sid");

            res.status(200).json({
                success: true,
                message: "Logout successful."
            });
        });
    });
};


// Get current logged-in user
module.exports.currentUser = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: "Please log in first."
        });
    }

    res.status(200).json({
        success: true,
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        }
    });
};