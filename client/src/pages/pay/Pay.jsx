import React, { useEffect, useState } from "react";
import "./pay.scss";
import newRequest from "../../utils/newRequest";
import { useParams, useNavigate } from "react-router-dom";

const Pay = () => {
  const [orderData, setOrderData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ Fetch Order Data
  useEffect(() => {
    const createOrder = async () => {
      try {
        const res = await newRequest.post(`/orders/create-payment-intent/${id}`);
        setOrderData(res.data);
      } catch (err) {
        console.error("Error creating order:", err);
      }
    };
    createOrder();
  }, [id]);

  // ✅ Load Razorpay Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ✅ Handle Payment Process
  const handlePayment = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("Failed to load Razorpay. Check your internet connection.");
      return;
    }

    if (!orderData) return;

    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: orderData.amount,
      currency: orderData.currency,
      name: "Freelancing Platform",
      description: orderData.title,
      image: "your_logo_url",
      order_id: orderData.orderId,
      handler: async (response) => {
        try {
          const confirmRes = await newRequest.put("/orders", {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (confirmRes.status === 200) {
            alert("Payment successful! Order confirmed.");
            navigate("/orders");
          }
        } catch (err) {
          console.error("Payment verification failed:", err);
          alert("Payment verification failed. Please contact support.");
        }
      },
      prefill: {
        name: "John Doe",
        email: "john@example.com",
        contact: "9876543210",
      },
      theme: {
        color: "#3399cc",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="pay">
      <h2>Complete Your Payment</h2>
      {orderData ? (
        <button onClick={handlePayment} className="pay-button">
          Pay Now
        </button>
      ) : (
        <p>Loading payment details...</p>
      )}
    </div>
  );
};

export default Pay;



