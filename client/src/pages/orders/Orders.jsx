import React from "react";
import './orders.scss';
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import { useNavigate } from "react-router-dom";

const Orders = () => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const navigate = useNavigate();
    const { isLoading, error, data } = useQuery({
        queryKey: ['orders'],
        queryFn: () =>
            newRequest.get(`/orders`)
                .then((res) => res.data),
        enabled: !!currentUser
    });

    const handleContact = async (order) => {
        const sellerId = order.sellerId;
        const buyerId = order.buyerId;
        const id = sellerId + buyerId;
        try {
            const res = await newRequest.get(`/conversations/single/${id}`);
            navigate(`/message/${res.data.id}`);
        } catch (error) {
            if (error.response?.status === 404) {
                const res = await newRequest.post(`/conversations`, { to: currentUser.isSeller ? buyerId : sellerId });
                navigate(`/message/${res.data.id}`);
            }
        }
    };

    if (!currentUser) {
        return (
            <div className="orders">
                <div className="container">
                    <h2>Please login to view orders</h2>
                    <button onClick={() => navigate('/login')}>Login</button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="orders">
                <div className="container">
                    <h2>Loading orders...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders">
                <div className="container">
                    <h2>Something went wrong. Please try again later.</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="orders">
            <div className="container">
                <div className="title">
                    <h1>Orders</h1>
                </div>
                {data && data.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Price</th>
                                <th>Contact</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((order) => (
                                <tr key={order._id}>
                                    <td>
                                        <img src={order.img || '/images/noimage.png'} alt={order.title} className="img" />
                                    </td>
                                    <td>{order.title}</td>
                                    <td>${order.price}</td>
                                    <td>
                                        <img 
                                            className="message" 
                                            src="/images/message.png" 
                                            alt="Message" 
                                            onClick={() => handleContact(order)} 
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-orders">
                        <h2>No orders yet</h2>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Orders;
