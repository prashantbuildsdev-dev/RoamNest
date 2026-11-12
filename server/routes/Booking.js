const express = require("express");
const router = express.Router();

const bookingController = require("../controllers/Booking");

// Check login before booking
const isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: "Please login to book a listing."
        });
    }

    next();
};

// Get logged-in user's bookings
router.get("/my", isLoggedIn, bookingController.getMyBookings);

// Create booking
router.post("/", isLoggedIn, bookingController.createBooking);

router.patch("/:bookingId/cancel", isLoggedIn, bookingController.cancelBooking);

module.exports = router;