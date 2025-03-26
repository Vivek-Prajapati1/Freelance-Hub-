import React, { useEffect, useState } from "react";
import './messages.scss';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import moment from 'moment';

const Messages = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const queryClient = useQueryClient();
    const [timeAgo, setTimeAgo] = useState({});

    const { isLoading, error, data } = useQuery({
        queryKey: ["conversations"],
        queryFn: () =>
            newRequest.get(`/conversations`).then((res) => {
                return res.data;
            }),
        enabled: !!currentUser,
        refetchInterval: 30000, // Refetch every 30 seconds
    });

    const mutation = useMutation({
        mutationFn: (id) => {
            return newRequest.put(`/conversations/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["conversations"]);
        },
    });

    const handleRead = (id) => {
        mutation.mutate(id);
    };

    // Update time ago every minute
    useEffect(() => {
        const updateTimeAgo = () => {
            if (data) {
                const newTimeAgo = {};
                data.forEach((conversation) => {
                    newTimeAgo[conversation.id] = moment(conversation.updatedAt).fromNow();
                });
                setTimeAgo(newTimeAgo);
            }
        };

        updateTimeAgo();
        const interval = setInterval(updateTimeAgo, 60000); // Update every minute

        return () => clearInterval(interval);
    }, [data]);

    if (!currentUser) {
        return (
            <div className="messages">
                <div className="container">
                    <h2>Please login to view messages</h2>
                    <Link to="/login" className="link">Login</Link>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="messages">
                <div className="container">
                    <h2>Loading messages...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="messages">
                <div className="container">
                    <h2>Something went wrong. Please try again later.</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="messages">
            <div className="container">
                <div className="title">
                    <h1>Messages</h1>
                </div>
                {data && data.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>{currentUser.isSeller ? "Buyer" : "Seller"}</th>
                                <th>Last Message</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((c) => (
                                <tr
                                    className={
                                        ((currentUser.isSeller && !c.readBySeller) ||
                                            (!currentUser.isSeller && !c.readByBuyer)) &&
                                        "active"
                                    }
                                    key={c.id}
                                >
                                    <td>
                                        <div className="user-info">
                                            <img 
                                                src={c.otherUser?.img || '/images/noavtar.jpeg'} 
                                                alt={c.otherUser?.username} 
                                                className="user-avatar"
                                            />
                                            <span>{c.otherUser?.username || 'Unknown User'}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <Link to={`/message/${c.id}`} className="link">
                                            {c?.lastMessage?.substring(0, 100)}...
                                        </Link>
                                    </td>
                                    <td className="time-ago">{timeAgo[c.id] || moment(c.updatedAt).fromNow()}</td>
                                    <td>
                                        {((currentUser.isSeller && !c.readBySeller) ||
                                            (!currentUser.isSeller && !c.readByBuyer)) && (
                                                <button onClick={() => handleRead(c.id)}>
                                                    Mark as Read
                                                </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-messages">
                        <h2>No messages yet</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Messages;
