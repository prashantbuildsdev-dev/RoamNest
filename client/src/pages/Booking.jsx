import "./Booking.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessage } from "../context/MessageContext";
import API_URL from "../api";

function Booking() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { showMessage } = useMessage();

    const [listing, setListing] = useState(null);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Get today's date
    const today = new Date();
    const todayDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");

    // Fetch listing details
    useEffect(() => {

        const fetchListing = async () => {

            try {

                const response = await fetch(
                `${API_URL}/listings/${id}`,                    {
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Listing not found.");
                }

                setListing(data.listing || data);

            } catch (err) {

                setError(err.message);

            }

        };

        fetchListing();

    }, [id]);

    // Calculate total nights
    const totalNights =
        checkIn && checkOut && new Date(checkOut) > new Date(checkIn)
            ? Math.ceil(
                (new Date(checkOut) - new Date(checkIn)) /
                (1000 * 60 * 60 * 24)
            )
            : 0;

    // Calculate base price
    const basePrice =
        listing && totalNights > 0
            ? Number(listing.price) * totalNights
            : 0;

    // GST calculation
    const gstRate = listing
        ? Number(listing.price) <= 7500 ? 5 : 18
        : 0;

    const gstAmount = Number(
        (basePrice * gstRate / 100).toFixed(2)
    );

    // Final total
    const totalPrice = Number(
        (basePrice + gstAmount).toFixed(2)
    );

    // Create booking
    const handleBooking = async (e) => {

        e.preventDefault();

        if (!checkIn || !checkOut || !guests) {
            showMessage("Please fill all booking details.", "warning");
            return;
        }

        if (new Date(checkOut) <= new Date(checkIn)) {
            showMessage(
                "Check-out date must be after check-in date.",
                "warning"
            );
            return;
        }

        if (Number(guests) < 1 || !Number.isInteger(Number(guests))) {
            showMessage("Please enter a valid number of guests.", "warning");
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(
                `${API_URL}/bookings`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        listingId: id,
                        checkIn,
                        checkOut,
                        guests: Number(guests)
                    })
                }
            );

            const data = await response.json();

            if (response.status === 401) {

                navigate("/login", {
                    state: {
                        from: `/listings/${id}/book`
                    }
                });

                return;

            }

            if (!response.ok) {
                throw new Error(data.message || "Booking failed.");
            }

            showMessage(
                data.message || "Booking confirmed successfully!",
                "success"
            );

            setTimeout(() => {
                navigate("/my-bookings");
            }, 1500);

        } catch (err) {

            showMessage(err.message, "error");

        } finally {

            setLoading(false);

        }

    };

    if (!listing && !error) {
        return <p>Loading listing details...</p>;
    }

    if (error && !listing) {
        return <p>{error}</p>;
    }

    return (

        <div className="booking-container">

            <h2>Confirm Your Booking</h2>

            <div className="booking-listing">

                <img
                    src={listing.image?.url || listing.image}
                    alt={listing.title}
                />

                <div>
                    <h3>{listing.title}</h3>
                    <p>{listing.location}</p>
                    <p>₹{listing.price} / night</p>
                </div>

            </div>

            <form onSubmit={handleBooking}>

                <div className="booking-field">

                    <label>Check-in</label>

                    <input
                        type="date"
                        min={todayDate}
                        value={checkIn}
                        onChange={(e) => {
                            setCheckIn(e.target.value);

                            if (
                                checkOut &&
                                new Date(e.target.value) >= new Date(checkOut)
                            ) {
                                setCheckOut("");
                            }
                        }}
                        required
                    />

                </div>

                <div className="booking-field">

                    <label>Check-out</label>

                    <input
                        type="date"
                        min={checkIn || todayDate}
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                    />

                </div>

                <div className="booking-field">

                    <label>Guests</label>

                    <input
                        type="number"
                        min="1"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                        required
                    />

                </div>

                <div className="booking-total">

                    <p>
                        ₹{listing.price} × {totalNights} nights
                    </p>

                    <p>
                        Base Price: ₹{basePrice.toFixed(2)}
                    </p>

                    <p>
                        GST ({gstRate}%): ₹{gstAmount.toFixed(2)}
                    </p>

                    <h3>
                        Total: ₹{totalPrice.toFixed(2)}
                    </h3>

                </div>

                <div className="booking-payment">

                    <h3>Payment Method</h3>

                    <p>Cash Payment</p>

                    <small>
                        Payment status will remain Pending until the host
                        receives the cash.
                    </small>

                </div>

                <button
                    type="submit"
                    disabled={loading || totalNights <= 0}
                >
                    {loading ? "Confirming..." : "Confirm Booking"}
                </button>

            </form>

        </div>

    );

}

export default Booking;