import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './login.scss';
import newRequest from "../../utils/newRequest";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const res = await newRequest.post('/auth/login', { username, password });
            localStorage.setItem("currentUser", JSON.stringify(res.data));
            window.location.href = '/'; // Force a full page reload to update the navbar
        } catch (err) {
            setError(err.response?.data || "Login failed. Please try again.");
            console.error("Login error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <form onSubmit={handleSubmit}>
                <h1>Sign in</h1>
                <label htmlFor="">Username</label>
                <input
                    type="text"
                    name="username"
                    placeholder="johndoe"
                    onChange={e => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="">Password</label>
                <input
                    type="password"
                    name="password"
                    onChange={e => setPassword(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
                {error && <div className="error">{error}</div>}
            </form>
        </div>
    );
}

export default Login;