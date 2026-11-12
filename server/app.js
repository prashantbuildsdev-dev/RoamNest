require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const userRouter = require("./routes/user.js");
const reviewRouter = require("./routes/review.js");
const bookingRouter = require("./routes/Booking");

const app = express();

const dbUrl = process.env.ATLASDB_URL;
const PORT = process.env.PORT || 5000;

// CORS
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:4173"
    ],
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const store = MongoStore.create({
    mongoUrl: dbUrl,
    collectionName: "roamnest_sessions",
    touchAfter: 24 * 3600
});

app.use(
    session({
        store: store,
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: false
        }
    })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Listing routes
app.use("/listings", listingRouter);

// Review routes
app.use("/listings/:id/reviews", reviewRouter);

// Authentication routes
app.use("/auth", userRouter);

//Booking Routes
app.use("/bookings", bookingRouter);

// API home route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Welcome to RoamNest API!"
    });
});

// Handle unknown routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API route not found."
    });
});

// Central error handler
app.use((err, req, res, next) => {
    console.error("Full error:", err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

// Start server
async function startServer() {
    try {
        if (!dbUrl) {
            throw new Error("ATLASDB_URL is missing from the .env file");
        }

        if (!process.env.SECRET) {
            throw new Error("SECRET is missing from the .env file");
        }

        await mongoose.connect(dbUrl);

        console.log("MongoDB Atlas connected successfully!");

        app.listen(PORT, () => {
            console.log(`RoamNest server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
}

startServer();