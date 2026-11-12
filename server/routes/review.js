const express = require("express");
const router = express.Router({ mergeParams: true });

const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const reviewController = require("../controllers/reviews.js");
const { validateReview } = require("../middleware/validate.js");

// Check login
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            success: false,
            message: "Please log in first."
        });
    }

    next();
};

// Check review author
const isReviewAuthor = async (req, res, next) => {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
        return res.status(404).json({
            success: false,
            message: "Review not found."
        });
    }

    if (!review.author || !review.author.equals(req.user._id)) {
        return res.status(403).json({
            success: false,
            message: "You can delete only your own reviews."
        });
    }

    next();
};

// Create review
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);

// Delete review
router.delete(
    "/:reviewId",
    isLoggedIn,
    wrapAsync(isReviewAuthor),
    wrapAsync(reviewController.deleteReview)
);

module.exports = router;