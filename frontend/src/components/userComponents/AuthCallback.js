import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { useAuth } from '../../Auth/AuthContext';  // Assuming this is your AuthContext file

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { onLogin } = useAuth();  // If you have an onLogin function in context, use it

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const username = params.get('username');
    const type = params.get('type');

    if (token) {
      Cookies.set('token', token);
      Cookies.set('username', username);
      Cookies.set('type', type);

      // Update context or state if needed
      // onLogin({ token, type });  // If you have this

      toast.success('Logged in with Google successfully!');
      if (type === 'Admin') {
        navigate('/newum');
      } else {
        navigate('/');
      }
    } else {
      toast.error('Google login failed.');
      navigate('/login');
    }
  }, [navigate, location]);

  return <div>Loading...</div>;
};

export default AuthCallback;