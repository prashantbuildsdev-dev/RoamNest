import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchBar.css";

function SearchBar() {

    const [destination, setDestination] = useState("");
    const navigate = useNavigate();

    const handleSearch = (e) => {

        e.preventDefault();

        if (!destination.trim()) return;

        navigate(`/?destination=${encodeURIComponent(destination.trim())}`);

    };

    return (

        <form className="roam-search-bar" onSubmit={handleSearch}>

            <div className="search-input-wrap">

                <input
                    type="text"
                    placeholder="Search destinations"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    aria-label="Search destinations"
                />

            </div>

            <button type="submit" className="search-submit-btn">

                <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                </svg>

                <span>Search</span>

            </button>

        </form>

    );

}

export default SearchBar;