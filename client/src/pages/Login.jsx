import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Auth.css";
import Navbar from "../components/Navbar";
import { useMessage } from "../context/MessageContext";
import API_URL from "../api";

function Login() {

    const navigate = useNavigate();
    const location = useLocation();
    const { showMessage } = useMessage();

    const redirectTo = location.state?.from || "/";

    const [formData, setFormData] = useState({
        username: "",
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

    // Handle login
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        const username = formData.username.trim();
        const password = formData.password;

        if (!username || !password) {
            showMessage("Username and password are required.", "warning");
            return;
        }

        setLoading(true);

        try {

            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    username,
                    password
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Login failed.");
            }

            showMessage("Login successful! Welcome back.", "success");

            navigate(redirectTo, { replace: true });

        } catch (error) {

            showMessage(error.message, "error");

        } finally {

            setLoading(false);

        }

    };

    return (
        <>
            <Navbar />

            <div className="auth-page">

                <h1 className="auth-heading">Login</h1>

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
                            <label htmlFor="password">Password</label>

                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter password"
                                value={formData.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Logging in..." : "Login"}
                        </button>

                    </form>

                    <p className="auth-switch">
                        Don't have an account? <Link to="/signup">Sign up</Link>
                    </p>

                </div>

            </div>
        </>
    );

}

export default Login;