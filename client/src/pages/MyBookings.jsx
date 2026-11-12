import "./MyBookings.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMessage } from "../context/MessageContext";

const API_URL = "http://localhost:5000";

function MyBookings() {

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState(null);

    const navigate = useNavigate();
    const { showMessage } = useMessage();

    // Fetch bookings
    const fetchBookings = async () => {

        try {

            const response = await fetch(`${API_URL}/bookings/my`, {
                credentials: "include"
            });

            const data = await response.json();

            if (response.status === 401) {
                navigate("/login", {
                    state: { from: "/my-bookings" }
                });
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || "Unable to fetch bookings.");
            }

            setBookings(data.bookings || []);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        fetchBookings();
    }, [navigate]);

    // Cancel booking
    const handleCancelBooking = async (bookingId) => {

        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmCancel) {
            return;
        }

        try {

            setCancellingId(bookingId);

            const response = await fetch(
                `${API_URL}/bookings/${bookingId}/cancel`,
                {
                    method: "PATCH",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to cancel booking.");
            }

            setBookings((previousBookings) =>
                previousBookings.map((booking) =>
                    booking._id === bookingId
                        ? { ...booking, bookingStatus: "Cancelled" }
                        : booking
                )
            );

            showMessage(
                data.message || "Booking cancelled successfully!",
                "success"
            );

        } catch (err) {

            showMessage(err.message, "error");

        } finally {

            setCancellingId(null);

        }

    };

    if (loading) {
        return (
            <p className="my-bookings-message">
                Loading bookings...
            </p>
        );
    }

    return (

        <div className="my-bookings-container">

            <h2>My Bookings</h2>

            {error && (
                <p className="my-bookings-error">{error}</p>
            )}

            {!error && bookings.length === 0 && (

                <div className="empty-bookings">

                    <h3>No bookings yet</h3>

                    <p>You haven't booked any stays yet.</p>

                    <button onClick={() => navigate("/")}>
                        Explore Listings
                    </button>

                </div>

            )}

            <div className="my-bookings-list">

                {bookings.map((booking) => (

                    <div className="my-booking-card" key={booking._id}>

                        <img
                            src={
                                booking.listing?.image?.url ||
                                booking.listing?.image
                            }
                            alt={booking.listing?.title || "Listing"}
                        />

                        <div className="my-booking-details">

                            <h3>{booking.listing?.title || "Listing"}</h3>

                            <p>{booking.listing?.location}</p>

                            <p>
                                Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                            </p>

                            <p>
                                Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                            </p>

                            <p>Guests: {booking.guests}</p>

                            <hr />

                            <h3>
                                Total: ₹{Number(booking.totalPrice).toFixed(2)}
                            </h3>

                            <p>Payment: {booking.paymentMethod}</p>

                            <p>Payment Status: {booking.paymentStatus}</p>

                            <p>Booking Status: {booking.bookingStatus}</p>

                            {booking.bookingStatus === "Confirmed" && (

                                <button
                                    className="cancel-booking-btn"
                                    onClick={() => handleCancelBooking(booking._id)}
                                    disabled={cancellingId === booking._id}
                                >
                                    {cancellingId === booking._id
                                        ? "Cancelling..."
                                        : "Cancel Booking"}
                                </button>

                            )}

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default MyBookings;