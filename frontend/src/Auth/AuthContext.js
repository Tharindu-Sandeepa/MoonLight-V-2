import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Create the context
const AuthContext = createContext();

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [username, setUsername] = useState('');
  const [type, setType] = useState('');
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  // Function to fetch user data
  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5002/api/user/myaccount', {
        withCredentials: true, // Include cookies in the request
      });
      console.log('fetchUser response:', res.data); // Debug response
      setUser(res.data);
      setUsername(res.data.username || 'No username found');
      setType(res.data.type || 'No type found');
    } catch (error) {
      console.error('Error fetching user:', error.response?.data || error.message);
      setUser(null);
      setUsername('');
      setType('');
    }
  };

  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      await axios.post('http://localhost:5002/api/refresh-token', {}, {
        withCredentials: true,
      });
      console.log('Token refreshed successfully');
      await fetchUser();
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      toast.error('Session expired. Please log in again.');
      setUser(null);
      setUsername('');
      setType('');
      navigate('/login');
    }
  };

  // useEffect to fetch user data on mount and set up token refresh
  useEffect(() => {
    fetchUser();

    // Set up interval to refresh token every 10 minutes
    const refreshInterval = setInterval(() => {
      refreshAccessToken();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  // Cart functions (unchanged)
  const addItemToCart = (item) => {
    if (!user) {
      toast.error('You must be logged in to add items to the cart!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate('/login');
    } else {
      setCart((prev) => [...prev, { ...item, qty: 1 }]);
      toast.success('Item added to cart!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      navigate('/cart');
    }
  };

  const removeItemFromCart = (item) => {
    setCart((prev) => prev.filter((it) => it._id !== item._id));
  };

  const addQty = (id) => {
    const index = cart.findIndex((it) => it._id === id);
    if (index === -1) return;
    const updatedItem = { ...cart[index], qty: cart[index].qty + 1 };
    const updatedCart = [...cart];
    updatedCart[index] = updatedItem;
    setCart(updatedCart);
  };

  const removeQty = (id) => {
    const index = cart.findIndex((it) => it._id === id);
    if (index === -1) return;
    if (cart[index].qty === 1) {
      const updatedCart = cart.filter((item) => item._id !== id);
      setCart(updatedCart);
      return;
    }
    const updatedItem = { ...cart[index], qty: cart[index].qty - 1 };
    const updatedCart = [...cart];
    updatedCart[index] = updatedItem;
    setCart(updatedCart);
  };

  const contextValue = {
    username,
    type,
    user,
    cart,
    addItemToCart,
    removeItemFromCart,
    addQty,
    removeQty,
    fetchUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};