const Listing = require("../models/listing.js");
const cloudinary = require("../cloudConfig.js");



const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");

const geocodingClient = mbxGeocoding({
    accessToken: process.env.MAP_TOKEN
});



// Upload image to Cloudinary
function uploadImage(buffer) {
    return cloudinary.uploader.upload(
        `data:image/jpeg;base64,${buffer.toString("base64")}`,
        {
            folder: "RoamNest",
            resource_type: "image"
        }
    );
}

// Get all listings
module.exports.index = async (req, res) => {
    try {
        const listings = await Listing.find({})
            .populate("owner", "username email");

        res.status(200).json({
            success: true,
            count: listings.length,
            listings
        });
    } catch (error) {
        console.error("Error fetching listings:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch listings."
        });
    }
};

// Get one listing
module.exports.showListing = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await Listing.findById(id)
            .populate({
                path: "reviews",
                populate: {
                    path: "author",
                    select: "username"
                }
            })
            .populate("owner", "username email");

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found."
            });
        }

        res.status(200).json({
            success: true,
            listing
        });
    } catch (error) {
        console.error("Error fetching listing:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to fetch listing."
        });
    }
};

// Create new listing
module.exports.createListing = async (req, res) => {
    if (!req.file) {
    return res.status(400).json({
        success: false,
        message: "Please upload a listing image."
    });
}
    try {
        const { title, description, price, location, country } = req.body;

        if (
            !title ||
            !description ||
            price === undefined ||
            !location ||
            !country
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required listing details."
            });
        }

        if (
            Number(price) < 0 ||
            !Number.isFinite(Number(price))
        ) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number."
            });
        }

        // Get coordinates from Mapbox
        const geoResponse = await geocodingClient
            .forwardGeocode({
                query: `${location}, ${country}`,
                limit: 1
            })
            .send();

        const coordinates =
            geoResponse.body.features[0]?.geometry.coordinates;

        if (!coordinates) {
            return res.status(400).json({
                success: false,
                message: "Could not find coordinates for this location."
            });
        }

        let image = {
            url: "",
            filename: ""
        };

        // Upload image if provided
        if (req.file) {
            const result = await uploadImage(req.file.buffer);

            image = {
                url: result.secure_url,
                filename: result.public_id
            };
        }

        const listing = new Listing({
            title,
            description,
            price: Number(price),
            location,
            country,
            image,
            owner: req.user._id,
            geometry: {
                type: "Point",
                coordinates
            }
        });

        await listing.save();

        res.status(201).json({
            success: true,
            message: "Listing created successfully.",
            listing
        });
    } catch (error) {
        console.error("Error creating listing:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update listing
module.exports.updateListing = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, location, country } = req.body;

        const listing = await Listing.findById(id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found."
            });
        }

        if (
            price !== undefined &&
            (!Number.isFinite(Number(price)) || Number(price) < 0)
        ) {
            return res.status(400).json({
                success: false,
                message: "Price must be a valid non-negative number."
            });
        }

        // Update coordinates if location changes
        const newLocation = location || listing.location;
        const newCountry = country || listing.country;

        if (location || country) {
            const geoResponse = await geocodingClient
                .forwardGeocode({
                    query: `${newLocation}, ${newCountry}`,
                    limit: 1
                })
                .send();

            const coordinates =
                geoResponse.body.features[0]?.geometry.coordinates;

            if (!coordinates) {
                return res.status(400).json({
                    success: false,
                    message: "Could not find coordinates for this location."
                });
            }

            listing.geometry = {
                type: "Point",
                coordinates
            };
        }

        if (title !== undefined) listing.title = title;
        if (description !== undefined) listing.description = description;
        if (price !== undefined) listing.price = Number(price);
        if (location !== undefined) listing.location = location;
        if (country !== undefined) listing.country = country;

        // Replace image if a new one is provided
        if (req.file) {
            const result = await uploadImage(req.file.buffer);

            if (listing.image && listing.image.filename) {
                try {
                    await cloudinary.uploader.destroy(
                        listing.image.filename
                    );
                } catch (error) {
                    console.error(
                        "Old image cleanup failed:",
                        error.message
                    );
                }
            }

            listing.image = {
                url: result.secure_url,
                filename: result.public_id
            };
        }

        await listing.save();

        res.status(200).json({
            success: true,
            message: "Listing updated successfully.",
            listing
        });
    } catch (error) {
        console.error("Error updating listing:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to update listing."
        });
    }
};

// Delete listing
module.exports.deleteListing = async (req, res) => {
    try {
        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found."
            });
        }

        await Listing.findByIdAndDelete(id);

        if (listing.image && listing.image.filename) {
            try {
                await cloudinary.uploader.destroy(
                    listing.image.filename
                );
            } catch (error) {
                console.error(
                    "Image cleanup failed:",
                    error.message
                );
            }
        }

        res.status(200).json({
            success: true,
            message: "Listing deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting listing:", error.message);

        res.status(500).json({
            success: false,
            message: "Failed to delete listing."
        });
    }
};