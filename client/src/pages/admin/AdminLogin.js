import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.scss';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('/api/admin/login', formData);
            localStorage.setItem('adminToken', res.data.token);
            
            // Set default authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
            
            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="admin-login">
            <div className="admin-login-container">
                <h2>Admin Login</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin; 