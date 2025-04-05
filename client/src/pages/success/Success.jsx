import { useLocation, useNavigate } from 'react-router-dom';
import './success.scss'
import { useEffect, useState } from 'react';
import newRequest from '../../utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';

const Success = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);
    const queryClient = useQueryClient();
    
    // Get payment data from either state or URL params
    const { state } = location;
    const paymentData = state || {};
    
    useEffect(() => {
        // Invalidate queries to refresh data
        queryClient.invalidateQueries(['myGigs']);
        queryClient.invalidateQueries(['gigs']);
        
        // Countdown timer
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Redirect after countdown finishes
        const redirectTimeout = setTimeout(() => {
            navigate("/orders");
        }, 5000);
        
        return () => {
            clearInterval(timer);
            clearTimeout(redirectTimeout);
        };
    }, [navigate, queryClient]);
    
    const handleGoToOrders = () => {
        // Invalidate queries again before navigation
        queryClient.invalidateQueries(['myGigs']);
        queryClient.invalidateQueries(['gigs']);
        navigate("/orders");
    };
    
    return (
        <div className="success-container">
            <div className="success-image">
                <img src="/images/successfully-done.gif" alt="Success" />
            </div>
            <div className='success-message'>
                <h2>Payment Successful!</h2>
                <p>Your order has been confirmed.</p>
                <p>You will be redirected to the orders page in {countdown} seconds.</p>
                {paymentData.paymentId && (
                    <div className="payment-details">
                        <p>Payment ID: {paymentData.paymentId}</p>
                    </div>
                )}
            </div>
            <div className='success-note'>
                Please do not close this page while we process your order.
            </div>
            <button 
                className="goto-orders-btn"
                onClick={handleGoToOrders}
            >
                Go to Orders Page Now
            </button>
        </div>
    );
}

export default Success;