import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.scss';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGigs: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [users, setUsers] = useState([]);
    const [gigs, setGigs] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch statistics
                const statsRes = await axios.get('/api/admin/stats');
                setStats(statsRes.data);

                // Fetch users
                const usersRes = await axios.get('/api/admin/users');
                setUsers(usersRes.data);

                // Fetch gigs
                const gigsRes = await axios.get('/api/admin/gigs');
                setGigs(gigsRes.data);

                // Fetch recent orders
                const ordersRes = await axios.get('/api/admin/recent-orders');
                console.log('Recent orders data:', ordersRes.data);
                setRecentOrders(ordersRes.data);

                // Fetch messages
                const messagesRes = await axios.get('/api/admin/messages');
                setMessages(messagesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axios.delete(`/api/admin/users/${userId}`);
                setUsers(users.filter(user => user._id !== userId));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const handleDeleteGig = async (gigId) => {
        if (window.confirm('Are you sure you want to delete this gig?')) {
            try {
                await axios.delete(`/api/admin/gigs/${gigId}`);
                setGigs(gigs.filter(gig => gig._id !== gigId));
            } catch (error) {
                console.error('Error deleting gig:', error);
            }
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="sidebar">
                <h2>Admin Panel</h2>
                <nav>
                    <button 
                        className={activeTab === 'overview' ? 'active' : ''} 
                        onClick={() => setActiveTab('overview')}
                    >
                        Overview
                    </button>
                    <button 
                        className={activeTab === 'users' ? 'active' : ''} 
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button 
                        className={activeTab === 'gigs' ? 'active' : ''} 
                        onClick={() => setActiveTab('gigs')}
                    >
                        Gigs
                    </button>
                    <button 
                        className={activeTab === 'messages' ? 'active' : ''} 
                        onClick={() => setActiveTab('messages')}
                    >
                        Messages
                    </button>
                </nav>
            </div>

            <div className="main-content">
                {activeTab === 'overview' && (
                    <div className="overview">
                        <h2>Dashboard Overview</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Users</h3>
                                <p>{stats.totalUsers}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Gigs</h3>
                                <p>{stats.totalGigs}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Orders</h3>
                                <p>{stats.totalOrders}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Revenue</h3>
                                <p>&#8377;{stats.totalRevenue.toFixed(2)}</p>
                            </div>
                        </div>

                        <div className="recent-orders">
                            <h3>Recent Orders</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Buyer</th>
                                        <th>Seller</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order._id}>
                                            <td>{order._id}</td>
                                            <td>{typeof order.buyerId === 'object' ? order.buyerId.username : order.buyerId}</td>
                                            <td>{typeof order.sellerId === 'object' ? order.sellerId.username : order.sellerId}</td>
                                            <td>&#8377;{order.price}</td>
                                            <td>
                                                <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="users">
                        <h2>Users Management</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.username}</td>
                                        <td>{user.email}</td>
                                        <td>{user.isSeller ? 'Seller' : 'Buyer'}</td>
                                        <td>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'gigs' && (
                    <div className="gigs">
                        <h2>Gigs Management</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Seller</th>
                                    <th>Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gigs.map(gig => (
                                    <tr key={gig._id}>
                                        <td>{gig.title}</td>
                                        <td>{typeof gig.userId === 'object' ? gig.userId.username : 'Deleted User'}</td>
                                        <td>&#8377;{gig.price}</td>
                                        <td>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteGig(gig._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'messages' && (
                    <div className="messages">
                        <h2>Messages Management</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Participants</th>
                                    <th>Last Message</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {messages.map(conversation => {
                                    const buyerName = conversation.buyerId?.username || 'Deleted User';
                                    const sellerName = conversation.sellerId?.username || 'Deleted User';
                                    const status = conversation.readByBuyer && conversation.readBySeller ? 'Read' : 'Unread';
                                    const shortId = conversation._id.substring(0, 8) + '...';
                                    
                                    return (
                                        <tr key={conversation._id}>
                                            <td title={conversation._id}>{shortId}</td>
                                            <td>
                                                <div className="participants">
                                                    <span className="buyer">👤 {buyerName}</span>
                                                    <span className="arrow">↔️</span>
                                                    <span className="seller">💼 {sellerName}</span>
                                                </div>
                                            </td>
                                            <td className="message-preview">{conversation.lastMessage || 'No messages yet'}</td>
                                            <td>
                                                <span className={`status-badge ${status.toLowerCase()}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td>{new Date(conversation.updatedAt).toLocaleString()}</td>
                                            <td>
                                                <button 
                                                    className="view-btn"
                                                    onClick={() => navigate(`/admin/conversation/${conversation._id}`)}
                                                >
                                                    View Chat
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard; 