const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({

    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },

    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    checkIn: {
        type: Date,
        required: true
    },

    checkOut: {
        type: Date,
        required: true
    },

    guests: {
        type: Number,
        required: true,
        min: 1
    },

    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },

    paymentMethod: {
        type: String,
        enum: ["Cash"],
        default: "Cash"
    },

    paymentStatus: {
        type: String,
        enum: ["Pending", "Paid"],
        default: "Pending"
    },

    bookingStatus: {
        type: String,
        enum: ["Confirmed", "Cancelled"],
        default: "Confirmed"
    }

}, {
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema);