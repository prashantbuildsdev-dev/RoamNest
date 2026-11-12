module.exports.validateListing = (req, res, next) => {
    const { error } = require("../schema.js")
        .listingSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details.map((detail) => detail.message).join(", ")
        });
    }

    next();
};

module.exports.validateReview = (req, res, next) => {
    const { error } = require("../schema.js")
        .reviewSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details.map((detail) => detail.message).join(", ")
        });
    }

    next();
};