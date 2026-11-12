import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./NewListing.css";

const NewListing = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        country: ""
    });

    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle image selection
    const handleImageChange = (e) => {
        const selectedImage = e.target.files[0];

        setImage(selectedImage || null);
        setError("");

        if (!selectedImage) return;

        if (!selectedImage.type.startsWith("image/")) {
            setImage(null);
            e.target.value = "";
            setError("Please select a valid image.");
            return;
        }

        if (selectedImage.size > 5 * 1024 * 1024) {
            setImage(null);
            e.target.value = "";
            setError("Image size must be less than 5 MB.");
        }
    };

    // Submit listing
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");

        const cleanedData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            price: formData.price,
            location: formData.location.trim(),
            country: formData.country.trim()
        };

        if (
            !cleanedData.title ||
            !cleanedData.description ||
            !cleanedData.location ||
            !cleanedData.country
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        if (
            cleanedData.price === "" ||
            !Number.isFinite(Number(cleanedData.price)) ||
            Number(cleanedData.price) < 0
        ) {
            setError("Please enter a valid price.");
            return;
        }

        if (!image) {
            setError("Please upload a listing image.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();

            Object.entries(cleanedData).forEach(([key, value]) => {
                data.append(key, value);
            });

            data.append("image", image);

            const response = await fetch(
                "http://localhost:5000/listings",
                {
                    method: "POST",
                    credentials: "include",
                    body: data
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || "Failed to create listing."
                );
            }

            navigate(`/listings/${result.listing._id}`);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <Navbar />

            <div className="new-listing-container">
                <h2>Add a New Listing</h2>

                {error && (
                    <div className="listing-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="new-listing-form">

                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Enter listing title"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter listing description"
                            rows="4"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Price (per night)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter price"
                            min="0"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter location"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="Enter country"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Upload Listing Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleImageChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="create-listing-btn"
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Add Listing"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default NewListing;