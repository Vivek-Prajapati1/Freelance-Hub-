import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import './AdminRoute.scss';

const AdminRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const verifyAuth = async () => {
            const token = localStorage.getItem('adminToken');
            
            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            try {
                // Set the token in headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Verify token by making a request to the admin stats endpoint
                await axios.get('/api/admin/stats');
                
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Authentication failed:', error);
                localStorage.removeItem('adminToken');
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        verifyAuth();
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin" />;
    }

    return children;
};

export default AdminRoute; 