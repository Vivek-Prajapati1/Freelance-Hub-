import React, { useEffect, useState } from "react";
import "./pay.scss";
import newRequest from "../../utils/newRequest";
import { useParams, useNavigate } from "react-router-dom";

const Pay = () => {
  const [orderData, setOrderData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const getErrorMessage = (error) => {
    if (!error?.response) {
      return "Network error. Please check your connection.";
    }
    return error.response?.data?.message || error.message || "An unexpected error occurred.";
  };

  const checkAndCreateOrder = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // First check if there's an existing incomplete order
      const ordersRes = await newRequest.get("/orders");
      const existingOrder = ordersRes.data.find(
        order => order.gigId === id && !order.isCompleted
      );

      if (existingOrder) {
        setOrderData({
          orderId: existingOrder.payment_intent,
          amount: existingOrder.price * 100,
          currency: "INR",
          title: existingOrder.title
        });
        return;
      }

      // Create new order if no existing incomplete order
      const res = await newRequest.post(`/orders/create-payment-intent/${id}`);
      setOrderData(res.data);
    } catch (err) {
      console.error("Error handling order:", err);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // Effect for initial order creation
  useEffect(() => {
    let mounted = true;

    const initOrder = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // First check if there's an existing incomplete order
        const ordersRes = await newRequest.get("/orders");
        if (!mounted) return;

        const existingOrder = ordersRes.data.find(
          order => order.gigId === id && !order.isCompleted
        );

        if (existingOrder && mounted) {
          setOrderData({
            orderId: existingOrder.payment_intent,
            amount: existingOrder.price * 100,
            currency: "INR",
            title: existingOrder.title
          });
          return;
        }

        // Create new order if no existing incomplete order
        const res = await newRequest.post(`/orders/create-payment-intent/${id}`);
        if (mounted) {
          setOrderData(res.data);
        }
      } catch (err) {
        if (mounted) {
          console.error("Error handling order:", err);
          setError(getErrorMessage(err));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initOrder();

    return () => {
      mounted = false;
    };
  }, [id]);

  // Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Payment Process
  const handlePayment = async () => {
    if (isLoading || isProcessing) return;

    try {
      setIsProcessing(true);
      setError(null);

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error("Failed to load payment system. Please refresh the page.");
      }

      if (!orderData) {
        throw new Error("Order data not available. Please try again.");
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_test_T1RXzNt1fdadjw",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Freelancing Platform",
        description: orderData.title,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const confirmRes = await newRequest.put("/orders", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (confirmRes.status === 200) {
              // Navigate to success page
              navigate("/success", { 
                state: { 
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id
                }
              });
            }
          } catch (err) {
            console.error("Payment verification failed:", err);
            setError(getErrorMessage(err));
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          }
        },
        theme: {
          color: "#1dbf73"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initialization error:", error);
      setError(getErrorMessage(error));
      setIsProcessing(false);
    }
  };

  // Manual retry handler
  const handleRetry = () => {
    setError(null);
    setOrderData(null);
    checkAndCreateOrder();
  };

  return (
    <div className="pay">
      <h2>Complete Your Payment</h2>
      {error ? (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            onClick={handleRetry}
            className="retry-button"
            disabled={isLoading}
          >
            Try Again
          </button>
        </div>
      ) : isLoading ? (
        <div className="loading-container">
          <p>Creating your order...</p>
        </div>
      ) : orderData ? (
        <button 
          onClick={handlePayment} 
          className="pay-button" 
          disabled={isLoading || isProcessing}
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </button>
      ) : (
        <p>Loading payment details...</p>
      )}
    </div>
  );
};

export default Pay;



