const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

// Create review
module.exports.createReview = async (req, res) => {
    const { id } = req.params;
    const { comment, rating } = req.body;

    if (!comment || !comment.trim() || rating === undefined) {
        return res.status(400).json({
            success: false,
            message: "Comment and rating are required."
        });
    }

    const reviewRating = Number(rating);

    if (!Number.isInteger(reviewRating) ||
        reviewRating < 1 || reviewRating > 5) {
        return res.status(400).json({
            success: false,
            message: "Rating must be between 1 and 5."
        });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({
            success: false,
            message: "Listing not found."
        });
    }

    const review = new Review({
        comment: comment.trim(),
        rating: reviewRating,
        author: req.user._id
    });

    await review.save();

    listing.reviews.push(review._id);
    await listing.save();

    res.status(201).json({
        success: true,
        message: "Review added successfully.",
        review
    });
};

// Delete review
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {
        return res.status(404).json({
            success: false,
            message: "Listing not found."
        });
    }

    const review = await Review.findById(reviewId);

    if (!review || !listing.reviews.some(
        (item) => item.equals(reviewId)
    )) {
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

    await Review.findByIdAndDelete(reviewId);

    listing.reviews.pull(reviewId);
    await listing.save();

    res.status(200).json({
        success: true,
        message: "Review deleted successfully."
    });
};