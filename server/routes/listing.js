const express = require("express");
const router = express.Router();
const multer = require("multer");


const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const listingController = require("../controllers/listings.js");
const { validateListing } = require("../middleware/validate.js");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

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

// Check listing owner
const isOwner = async (req, res, next) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        return res.status(404).json({
            success: false,
            message: "Listing not found."
        });
    }

    if (!listing.owner || !listing.owner.equals(req.user._id)) {
        return res.status(403).json({
            success: false,
            message: "You are not the owner of this listing."
        });
    }

    next();
};

// All listings
router.get("/", wrapAsync(listingController.index));

// Create listing
router.post(
    "/",
    isLoggedIn,
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.createListing)
);

// Show one listing
router.get("/:id", wrapAsync(listingController.showListing));

// Update listing
router.put(
    "/:id",
    isLoggedIn,
    wrapAsync(isOwner),
    upload.single("image"),
    validateListing,
    wrapAsync(listingController.updateListing)
);

// Delete listing
router.delete(
    "/:id",
    isLoggedIn,
    wrapAsync(isOwner),
    wrapAsync(listingController.deleteListing)
);

module.exports = router;