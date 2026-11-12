import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";
import { useMessage } from "../context/MessageContext";

const API_URL = "http://localhost:5000";

function Signup() {

    const navigate = useNavigate();
    const { showMessage } = useMessage();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };

    // Handle signup
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        const username = formData.username.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password;

        if (!username || !email || !password) {
            showMessage("All fields are required.", "warning");
            return;
        }

        if (password.length < 8) {
            showMessage("Password must be at least 8 characters long.", "warning");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(`${API_URL}/auth/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Signup failed.");
            }

            showMessage("Account created successfully!", "success");

            navigate("/");

        } catch (error) {

            showMessage(error.message, "error");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="auth-page">

            <h1 className="auth-heading">SignUp on RoamNest</h1>

            <div className="auth-container">

                <form onSubmit={handleSubmit}>

                    <div className="auth-form-group">
                        <label htmlFor="username">Username</label>

                        <input
                            type="text"
                            id="username"
                            name="username"
                            placeholder="Enter username"
                            value={formData.username}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="email">Email</label>

                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email"
                            value={formData.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="auth-form-group">
                        <label htmlFor="password">Password</label>

                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            minLength="8"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Account..." : "SignUp"}
                    </button>

                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Login</Link>
                </p>

            </div>

        </div>

    );

}

export default Signup;