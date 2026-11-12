import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./Home.css";

const API_URL = "http://localhost:5000";

function Home() {

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Tax preference
    const [showTaxes, setShowTaxes] = useState(
        localStorage.getItem("showTaxes") === "true"
    );

    // Listen for tax toggle changes
    useEffect(() => {

        const updateTaxPreference = () => {

            setShowTaxes(
                localStorage.getItem("showTaxes") === "true"
            );

        };

        window.addEventListener(
            "taxPreferenceChanged",
            updateTaxPreference
        );

        return () => {

            window.removeEventListener(
                "taxPreferenceChanged",
                updateTaxPreference
            );

        };

    }, []);

    // Fetch all listings
    useEffect(() => {

        const controller = new AbortController();

        const fetchListings = async () => {

            try {

                const response = await fetch(`${API_URL}/listings`, {
                    credentials: "include",
                    signal: controller.signal
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Failed to fetch listings.");
                }

                setListings(data.listings || []);

            } catch (error) {

                if (error.name !== "AbortError") {
                    setError(error.message);
                }

            } finally {

                if (!controller.signal.aborted) {
                    setLoading(false);
                }

            }

        };

        fetchListings();

        return () => {
            controller.abort();
        };

    }, []);

    // Calculate listing price with GST
    const getListingPrice = (price) => {

        const originalPrice = Number(price || 0);

        return showTaxes
            ? originalPrice * 1.18
            : originalPrice;

    };

    return (

        <div className="app home-page">

            <Navbar />

            <main className="container">

                {loading && <p>Loading homes...</p>}

                {error && <p className="error">{error}</p>}

                {!loading && !error && listings.length === 0 && (
                    <p>No homes found.</p>
                )}

                <div className="listings">

                    {listings.map((listing, index) => (

                        <Link
                            to={`/listings/${listing._id}`}
                            key={listing._id}
                            style={{
                                color: "inherit",
                                textDecoration: "none"
                            }}
                        >

                            <article className="listing-card">

                                <img
                                    src={
                                        listing.image?.url ||
                                        "https://placehold.co/600x400?text=RoamNest"
                                    }
                                    alt={listing.title}
                                    fetchPriority={index === 0 ? "high" : "auto"}
                                    loading={index === 0 ? "eager" : "lazy"}
                                />

                                <div className="listing-info">

                                    <h3>{listing.title}</h3>

                                    <p className="price">

                                        ₹{getListingPrice(listing.price).toLocaleString(
                                            "en-IN",
                                            {
                                                maximumFractionDigits: 2
                                            }
                                        )} / night

                                    </p>

                                    {showTaxes && (
                                        <p className="tax-included">
                                            Includes 18% GST
                                        </p>
                                    )}

                                </div>

                            </article>

                        </Link>

                    ))}

                </div>

            </main>

        </div>

    );

}

export default Home;