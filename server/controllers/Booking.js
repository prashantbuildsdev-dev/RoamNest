const Booking = require("../models/Booking");
const Listing = require("../models/listing");
const sendEmail = require("../utils/sendEmail");

// Create new booking
module.exports.createBooking = async (req, res) => {
    try {
        const { listingId, checkIn, checkOut, guests } = req.body;

        if (!listingId || !checkIn || !checkOut || !guests) {
            return res.status(400).json({
                success: false,
                message: "Please fill all booking details."
            });
        }

        const listing = await Listing.findById(listingId)
            .populate("owner", "username email");

        if (!listing) {
            return res.status(404).json({
                success: false,
                message: "Listing not found."
            });
        }

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (
            isNaN(startDate.getTime()) ||
            isNaN(endDate.getTime()) ||
            startDate < today ||
            endDate <= startDate
        ) {
            return res.status(400).json({
                success: false,
                message: "Please select valid check-in and check-out dates."
            });
        }

        const guestCount = Number(guests);

        if (!Number.isInteger(guestCount) || guestCount < 1) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid number of guests."
            });
        }

        const existingBooking = await Booking.findOne({
            listing: listingId,
            bookingStatus: "Confirmed",
            checkIn: { $lt: endDate },
            checkOut: { $gt: startDate }
        });

        if (existingBooking) {
            return res.status(400).json({
                success: false,
                message: "This listing is already booked for these dates."
            });
        }

        const totalNights = Math.ceil(
            (endDate - startDate) / (1000 * 60 * 60 * 24)
        );

        const totalPrice = Number(listing.price) * totalNights;

        const booking = new Booking({
            listing: listing._id,
            customer: req.user._id,
            host: listing.owner?._id || listing.owner,
            checkIn: startDate,
            checkOut: endDate,
            guests: guestCount,
            totalPrice,
            paymentMethod: "Cash",
            paymentStatus: "Pending",
            bookingStatus: "Confirmed"
        });

        await booking.save();

        const customerEmail = req.user.email;
        const hostEmail = listing.owner?.email;

        const checkInDate = startDate.toLocaleDateString("en-IN");
        const checkOutDate = endDate.toLocaleDateString("en-IN");

        const emailContent = `
            <h2>New Booking - RoamNest</h2>
            <p>Listing: ${listing.title}</p>
            <p>Check-in: ${checkInDate}</p>
            <p>Check-out: ${checkOutDate}</p>
            <p>Guests: ${guestCount}</p>
            <p>Total Price: ₹${totalPrice}</p>
            <p>Payment Method: Cash</p>
            <p>Payment Status: Pending</p>
            <p>Booking Status: Confirmed</p>
        `;

        if (customerEmail) {
            await sendEmail(
                customerEmail,
                "Your RoamNest Booking is Confirmed!",
                `<h2>Booking Confirmed!</h2>
                <p>Hello ${req.user.username},</p>
                <p>Your booking has been confirmed successfully.</p>
                ${emailContent}`
            );
        }

        if (hostEmail) {
            await sendEmail(
                hostEmail,
                "New Booking Received - RoamNest",
                `<h2>New Booking Received!</h2>
                <p>Hello ${listing.owner.username},</p>
                <p>A customer has booked your listing.</p>
                ${emailContent}`
            );
        }

        res.status(201).json({
            success: true,
            message: "Booking confirmed successfully!",
            booking
        });

    } catch (error) {
        console.error("Booking error:", error);

        res.status(500).json({
            success: false,
            message: "Something went wrong while creating booking."
        });
    }
};

// Get customer's bookings
module.exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({
            customer: req.user._id
        })
        .populate({
            path: "listing",
            model: Listing
        })
        .populate("host", "username")
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            bookings
        });

    } catch (error) {
        console.error("Fetch bookings error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to fetch bookings."
        });
    }
};

// Cancel booking
module.exports.cancelBooking = async (req, res) => {
    try {

        const { bookingId } = req.params;

        const booking = await Booking.findById(bookingId)
            .populate("listing", "title")
            .populate("host", "username email");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        // Check booking ownership
        if (!booking.customer.equals(req.user._id)) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to cancel this booking."
            });
        }

        // Check booking status
        if (booking.bookingStatus !== "Confirmed") {
            return res.status(400).json({
                success: false,
                message: "This booking cannot be cancelled."
            });
        }

        // Update booking status
        booking.bookingStatus = "Cancelled";

        await booking.save();

        const listingTitle = booking.listing?.title || "Your listing";

        // Customer email
        if (req.user.email) {
            await sendEmail(
                req.user.email,
                "Booking Cancelled - RoamNest",
                `
                    <h2>Booking Cancelled</h2>
                    <p>Hello ${req.user.username},</p>
                    <p>Your booking for <b>${listingTitle}</b> has been cancelled successfully.</p>
                    <p>Booking Status: Cancelled</p>
                    <p>Thank you for using RoamNest.</p>
                `
            );
        }

        // Host email
        if (booking.host?.email) {
            await sendEmail(
                booking.host.email,
                "Booking Cancellation - RoamNest",
                `
                    <h2>Booking Cancellation Notice</h2>
                    <p>Hello ${booking.host.username},</p>
                    <p>A customer has cancelled their booking for <b>${listingTitle}</b>.</p>
                    <p>Booking Status: Cancelled</p>
                `
            );
        }

        res.status(200).json({
            success: true,
            message: "Booking cancelled successfully!"
        });

    } catch (error) {

        console.error("Booking cancellation error:", error);

        res.status(500).json({
            success: false,
            message: "Unable to cancel booking."
        });

    }
};