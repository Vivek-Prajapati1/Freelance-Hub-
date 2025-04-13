import React from 'react';
import './App.scss';
import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import Add from './pages/add/Add';
import Message from './pages/message/Message';
import Messages from './pages/messages/Messages';
import Orders from "./pages/orders/Orders.jsx";
import MyGigs from "./pages/myGigs/MyGigs";
import Gig from "./pages/gig/Gig";
import Gigs from "./pages/gigs/Gigs";
import Home from './pages/home/Home';
import Pay from './pages/pay/Pay';
import Success from './pages/success/Success';
import EditGig from './pages/editGig/EditGig';
import {
  Routes,
  Route,
  BrowserRouter as Router
} from "react-router-dom";
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import BecomeSeller from './components/becomeSeller/BecomeSeller';
import BecomeSeller2 from './components/becomeSeller2/BecomeSeller2';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRoute from './components/routing/AdminRoute';
import './utils/axiosConfig';
import AdminConversation from './pages/admin/AdminConversation';

function App() {
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className='app'>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/gigs" element={<Gigs />} />
            <Route path="/gig/:id" element={<Gig />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/mygigs" element={<MyGigs />} />
            <Route path="/add" element={<Add />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/message/:id" element={<Message />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/pay/:id" element={<Pay />} />
            <Route path="/success" element={<Success />} />
            <Route path="/becomeSeller" element={<BecomeSeller />} />
            <Route path="/becomeSeller2" element={<BecomeSeller2 />} />
            <Route path="/admin/register" element={<AdminRegister />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/conversation/:id" element={<AdminRoute><AdminConversation /></AdminRoute>} />
            <Route path="/edit-gig/:id" element={<EditGig />} />
          </Routes>
          <hr />
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
