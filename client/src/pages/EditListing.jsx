import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./EditListing.css";
import API_URL from "../api";


function EditListing() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [listing, setListing] = useState({
        title: "",
        description: "",
        price: "",
        location: "",
        country: ""
    });

    const [image, setImage] = useState(null);
    const [currentImage, setCurrentImage] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Fetch listing
    useEffect(() => {

        const fetchListing = async () => {

            try {

                const response = await fetch(
                    `${API_URL}/listings/${id}`,
                    {
                        credentials: "include"
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || "Listing not found.");
                }

                const item = data.listing;

                setListing({
                    title: item.title || "",
                    description: item.description || "",
                    price: item.price ?? "",
                    location: item.location || "",
                    country: item.country || ""
                });

                setCurrentImage(item.image?.url || "");

            } catch (error) {

                setError(error.message);

            } finally {

                setLoading(false);

            }

        };

        fetchListing();

    }, [id]);

    // Handle input changes
    const handleChange = (e) => {

        const { name, value } = e.target;

        setListing((previous) => ({
            ...previous,
            [name]: value
        }));

    };

    // Handle image selection
    const handleImageChange = (e) => {

        const selectedImage = e.target.files[0];

        if (!selectedImage) {
            setImage(null);
            return;
        }

        if (!selectedImage.type.startsWith("image/")) {
            setError("Please select a valid image.");
            e.target.value = "";
            setImage(null);
            return;
        }

        if (selectedImage.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5 MB.");
            e.target.value = "";
            setImage(null);
            return;
        }

        setError("");
        setImage(selectedImage);

    };

    // Update listing
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (saving) return;

        const cleanData = {
            title: listing.title.trim(),
            description: listing.description.trim(),
            price: listing.price,
            location: listing.location.trim(),
            country: listing.country.trim()
        };

        if (
            !cleanData.title ||
            !cleanData.description ||
            !cleanData.location ||
            !cleanData.country
        ) {
            setError("All fields are required.");
            return;
        }

        const price = Number(cleanData.price);

        if (!Number.isFinite(price) || price < 0 || cleanData.price === "") {
            setError("Please enter a valid price.");
            return;
        }

        setSaving(true);
        setError("");

        try {

            const formData = new FormData();

            Object.entries(cleanData).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (image) {
                formData.append("image", image);
            }

            const response = await fetch(
                `${API_URL}/listings/${id}`,
                {
                    method: "PUT",
                    credentials: "include",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Unable to update listing.");
            }

            navigate(`/listings/${id}`);

        } catch (error) {

            setError(error.message);

        } finally {

            setSaving(false);

        }

    };

    if (loading) {
        return <p className="edit-loading">Loading listing...</p>;
    }

    if (error && !listing.title) {
        return <p className="edit-error">{error}</p>;
    }

    return (

        <div className="edit-listing-container">

            <h2>Edit Your Listing</h2>

            {error && (
                <div className="edit-error">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <div className="edit-form-group">
                    <label>Title</label>

                    <input
                        type="text"
                        name="title"
                        value={listing.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="edit-form-group">
                    <label>Description</label>

                    <textarea
                        name="description"
                        value={listing.description}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="edit-form-group">
                    <label>Current Image</label>

                    {currentImage && (
                        <img
                            src={currentImage}
                            alt="Current listing"
                            className="edit-current-image"
                        />
                    )}

                    <label>Upload New Image (Optional)</label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                </div>

                <div className="edit-form-group">
                    <label>Price</label>

                    <input
                        type="number"
                        name="price"
                        value={listing.price}
                        onChange={handleChange}
                        min="0"
                        required
                    />
                </div>

                <div className="edit-form-group">
                    <label>Location</label>

                    <input
                        type="text"
                        name="location"
                        value={listing.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="edit-form-group">
                    <label>Country</label>

                    <input
                        type="text"
                        name="country"
                        value={listing.country}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="edit-submit-btn"
                    disabled={saving}
                >
                    {saving ? "Saving..." : "Save Changes"}
                </button>

            </form>

        </div>

    );

}

export default EditListing;