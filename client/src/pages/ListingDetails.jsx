import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "mapbox-gl/dist/mapbox-gl.css";
import Navbar from "../components/Navbar";
import "./ListingDetails.css";
import API_URL from "../api";


const fetchListingData = async (id) => {
    const response = await fetch(`${API_URL}/listings/${id}`, {
        credentials: "include"
    });

    if (!response.ok) {
        throw new Error("Failed to fetch listing details.");
    }

    const data = await response.json();

    return data.listing;
};

function ListingDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [user, setUser] = useState(null);
    const [rating, setRating] = useState("1");
    const [comment, setComment] = useState("");
    const [reviewError, setReviewError] = useState("");

    const refreshListing = async () => {
        const updatedListing = await fetchListingData(id);
        setListing(updatedListing);
    };

    useEffect(() => {

        let isMounted = true;

        const loadListing = async () => {
            try {
                const data = await fetchListingData(id);

                if (isMounted) {
                    setListing(data);
                    setError("");
                }
            } catch (error) {
                if (isMounted) {
                    setError(error.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        setLoading(true);
        loadListing();

        return () => {
            isMounted = false;
        };

    }, [id]);

    useEffect(() => {

        let isMounted = true;

        const fetchUser = async () => {
            try {
                const response = await fetch(`${API_URL}/auth/me`, {
                    credentials: "include"
                });

                const data = await response.json();

                if (isMounted) {
                    setUser(response.ok ? data.user : null);
                }
            } catch (error) {
                if (isMounted) {
                    setUser(null);
                }
            }
        };

        fetchUser();

        return () => {
            isMounted = false;
        };

    }, []);

    // Initialize Mapbox
    useEffect(() => {

        if (!listing) return;

        let map;
        let isCancelled = false;

        const mapContainer = document.getElementById("map");

        if (!mapContainer) return;

        const initializeMap = async () => {

            const mapToken = import.meta.env.VITE_MAP_TOKEN;
            const coordinates = listing.geometry?.coordinates;

            if (!mapToken) {
                console.error("Mapbox token is missing.");
                return;
            }

            if (
                !Array.isArray(coordinates) ||
                coordinates.length !== 2 ||
                !Number.isFinite(coordinates[0]) ||
                !Number.isFinite(coordinates[1])
            ) {
                console.error("Invalid listing coordinates:", coordinates);
                return;
            }

            try {

                const mapboxModule = await import("mapbox-gl");

                if (isCancelled) return;

                const mapboxgl = mapboxModule.default;

                mapboxgl.accessToken = mapToken;

                map = new mapboxgl.Map({
                    container: mapContainer,
                    style: "mapbox://styles/mapbox/streets-v12",
                    center: coordinates,
                    zoom: 9
                });

                const popupContent = document.createElement("div");

                const title = document.createElement("h4");
                title.textContent = listing.title || "RoamNest";

                const description = document.createElement("p");
                description.textContent =
                    "Exact Location will be provided after booking";

                popupContent.appendChild(title);
                popupContent.appendChild(description);

                new mapboxgl.Marker({ color: "red" })
                    .setLngLat(coordinates)
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 })
                            .setDOMContent(popupContent)
                    )
                    .addTo(map);

            } catch (error) {
                console.error("Mapbox initialization failed:", error);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                observer.disconnect();
                initializeMap();
            }
        }, {
            rootMargin: "200px"
        });

        observer.observe(mapContainer);

        return () => {
            isCancelled = true;
            observer.disconnect();

            if (map) {
                map.remove();
            }
        };

    }, [
        listing?._id,
        listing?.title,
        listing?.geometry?.coordinates?.[0],
        listing?.geometry?.coordinates?.[1]
    ]);

    // Submit review
    const handleReviewSubmit = async (e) => {

        e.preventDefault();
        setReviewError("");

        if (!comment.trim()) {
            setReviewError("Please enter a comment.");
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/listings/${id}/reviews`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        rating: Number(rating),
                        comment: comment.trim()
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to add review.");
            }

            setComment("");
            setRating("1");

            await refreshListing();

        } catch (error) {
            setReviewError(error.message);
        }
    };

    // Delete review
    const handleReviewDelete = async (reviewId) => {

        setReviewError("");

        try {

            const response = await fetch(
                `${API_URL}/listings/${id}/reviews/${reviewId}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete review.");
            }

            await refreshListing();

        } catch (error) {
            setReviewError(error.message);
        }
    };

    // Delete listing
    const handleListingDelete = async () => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this listing?"
        );

        if (!confirmed) return;

        try {

            const response = await fetch(
                `${API_URL}/listings/${id}`,
                {
                    method: "DELETE",
                    credentials: "include"
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete listing.");
            }

            alert("Listing deleted successfully!");
            navigate("/");

        } catch (error) {
            alert(error.message);
        }
    };

    const isOwner = user && listing?.owner &&
        String(listing.owner._id || listing.owner) === String(user.id);

    const reviews = Array.isArray(listing?.reviews)
        ? listing.reviews
        : [];

    if (loading) {
        return (
            <div className="app">
                <Navbar />
                <p>Loading listing details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="app">
                <Navbar />
                <p className="error">{error}</p>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="app">
                <Navbar />
                <p>Listing not found.</p>
            </div>
        );
    }

    return (
        <div className="app">
            <Navbar />

            <main className="listing-details">

                <h2>{listing.title}</h2>

                <div className="listing-card">

                    <img
                        className="listing-main-image"
                        src={
                            listing.image?.url ||
                            "https://placehold.co/900x450?text=RoamNest"
                        }
                        alt={listing.title || "Listing"}
                    />

                    <div className="listing-card-body">

                        <h3>
                            Owned by {listing.owner?.username || "RoamNest Host"}
                        </h3>

                        <p>{listing.description}</p>

                        <p>
                            <strong>Price:</strong>{" "}
                            ₹{Number(listing.price || 0).toLocaleString("en-IN")} / night
                        </p>

                        <p>
                            <strong>Location:</strong> {listing.location}
                        </p>

                        <p>
                            <strong>Country:</strong> {listing.country}
                        </p>

                        <div className="btns">

    {isOwner && (
        <>
            <Link
                to={`/listings/${listing._id}/edit`}
                className="edit-btn"
            >
                Edit
            </Link>

            <button
                type="button"
                className="delete-listing-btn"
                onClick={handleListingDelete}
            >
                Delete
            </button>
        </>
    )}

    <Link
    to={user ? `/listings/${listing._id}/book` : "/login"}
    state={!user ? {
        from: `/listings/${listing._id}/book`
    } : undefined}
    className="book-btn"
>
    Book Now
</Link>

</div>

                    </div>
                </div>

                <section className="reviews-section">

                    <h3>Leave a Review</h3>

                    {reviewError && (
                        <p className="error">{reviewError}</p>
                    )}

                    <form onSubmit={handleReviewSubmit}>

                        <label htmlFor="rating">Rating</label>

                        <fieldset className="starability-slot" aria-label="Choose a rating">

                            <input
                                type="radio"
                                id="no-rate"
                                className="input-no-rate"
                                name="rating"
                                value="0"
                                checked={rating === "0"}
                                onChange={(e) => setRating(e.target.value)}
                                aria-label="No rating"
                            />

                            <input
                                type="radio"
                                id="first-rate1"
                                name="rating"
                                value="1"
                                checked={rating === "1"}
                                onChange={(e) => setRating(e.target.value)}
                            />
                            <label htmlFor="first-rate1" title="Terrible">1 star</label>

                            <input
                                type="radio"
                                id="first-rate2"
                                name="rating"
                                value="2"
                                checked={rating === "2"}
                                onChange={(e) => setRating(e.target.value)}
                            />
                            <label htmlFor="first-rate2" title="Not good">2 stars</label>

                            <input
                                type="radio"
                                id="first-rate3"
                                name="rating"
                                value="3"
                                checked={rating === "3"}
                                onChange={(e) => setRating(e.target.value)}
                            />
                            <label htmlFor="first-rate3" title="Average">3 stars</label>

                            <input
                                type="radio"
                                id="first-rate4"
                                name="rating"
                                value="4"
                                checked={rating === "4"}
                                onChange={(e) => setRating(e.target.value)}
                            />
                            <label htmlFor="first-rate4" title="Very good">4 stars</label>

                            <input
                                type="radio"
                                id="first-rate5"
                                name="rating"
                                value="5"
                                checked={rating === "5"}
                                onChange={(e) => setRating(e.target.value)}
                            />
                            <label htmlFor="first-rate5" title="Excellent">5 stars</label>

                        </fieldset>

                        <label htmlFor="comment">Comment</label>

                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience..."
                            required
                        />

                        <button type="submit">
                            Submit Review
                        </button>

                    </form>

                    <h3>All Reviews</h3>

                    {reviews.length === 0 ? (
                        <p>No reviews yet.</p>
                    ) : (
                        reviews.map((review) => (
                            <div
                                className="review-card"
                                key={review._id}
                            >

                                <h4>
                                    {review.author?.username || "User"}
                                </h4>

                                <p
                                    className="starability-result"
                                    data-rating={Math.min(5, Math.max(0, Number(review.rating) || 0))}
                                    aria-label={`Rated ${review.rating} out of 5`}
                                />

                                <p>{review.comment}</p>

                                {user &&
                                    review.author &&
                                    String(review.author._id || review.author) ===
                                    String(user.id) && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleReviewDelete(review._id)
                                            }
                                        >
                                            Delete Review
                                        </button>
                                    )}

                            </div>
                        ))
                    )}

                </section>

                <section className="map-section">

                    <h3>Where you'll be</h3>

                    <div id="map"></div>

                </section>

            </main>
        </div>
    );
}

export default ListingDetails;