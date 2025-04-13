import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './AdminConversation.scss';

const AdminConversation = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('adminToken');
                
                if (!token) {
                    navigate('/admin');
                    return;
                }

                // Set the token in headers
                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                // Get conversation data
                const conversationRes = await axios.get(`/api/admin/conversation/${id}`, config);
                const conv = conversationRes.data;
                
                if (!conv.buyerId || !conv.sellerId) {
                    throw new Error('Invalid conversation data: Missing user information');
                }

                setConversation(conv);

                // Get messages for this conversation
                const messagesRes = await axios.get(`/api/admin/messages/${id}`, config);
                console.log('Messages response:', messagesRes.data);
                
                setMessages(messagesRes.data);
                setError(null);
            } catch (err) {
                console.error('Error details:', err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('adminToken');
                    navigate('/admin');
                    return;
                }
                setError(err.response?.data?.message || err.message || 'Error fetching conversation');
                setConversation(null);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };

        if (!id) {
            setError('Invalid conversation ID');
            setLoading(false);
            return;
        }

        fetchData();
    }, [id, navigate]);

    const handleBack = () => {
        navigate('/admin/dashboard'); // Navigate to the admin dashboard
    };

    if (loading) {
        return (
            <div className="admin-conversation">
                <div className="loading">
                    <div className="loading-spinner"></div>
                    <p>Loading conversation...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-conversation">
                <div className="error">
                    <p>{error}</p>
                    <Link to="/admin/dashboard" className="back-btn">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    if (!conversation || !conversation.buyerId || !conversation.sellerId) {
        return (
            <div className="admin-conversation">
                <div className="error">
                    <p>Invalid conversation data</p>
                    <Link to="/admin/dashboard" className="back-btn">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-conversation">
            <div className="header">
                <Link to="/admin/dashboard" className="back-btn">
                    ← Back to Messages
                </Link>
                <h2>Conversation Details</h2>
                <div className="conversation-info">
                    <div className="participant">
                        <span className="label">Buyer:</span>
                        <span className="name">
                            {conversation.buyerId.username}
                            {conversation.buyerId.email && ` (${conversation.buyerId.email})`}
                        </span>
                    </div>
                    <div className="participant">
                        <span className="label">Seller:</span>
                        <span className="name">
                            {conversation.sellerId.username}
                            {conversation.sellerId.email && ` (${conversation.sellerId.email})`}
                        </span>
                    </div>
                </div>
            </div>

            <div className="messages-container">
                {messages && messages.length > 0 ? (
                    messages.map((message) => (
                        <div 
                            key={message._id} 
                            className={`message ${message.senderRole?.toLowerCase()}`}
                        >
                            <div className="message-content">
                                <div className="message-header">
                                    <span className="username">
                                        {message.userId?.username || 'Unknown User'} 
                                        <span className="role">({message.senderRole || 'Unknown Role'})</span>
                                    </span>
                                    <span className="time">
                                        {new Date(message.createdAt).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text">{message.desc}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-messages">
                        <p>No messages in this conversation yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminConversation; 