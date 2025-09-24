import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../Auth/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { fetchUser } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const username = params.get('username');
    const type = params.get('type');

    if (username && type) {
      // Fetch user data to verify authentication
      fetchUser().then(() => {
        toast.success('Logged in with Google successfully!', {
          position: 'top-right',
          autoClose: 3000,
        });
        if (type === 'Admin') {
          navigate('/newum');
        } else {
          navigate('/');
        }
      }).catch(() => {
        toast.error('Google login failed.', {
          position: 'top-right',
          autoClose: 3000,
        });
        navigate('/login');
      });
    } else {
      toast.error('Google login failed.', {
        position: 'top-right',
        autoClose: 3000,
      });
      navigate('/login');
    }
  }, [navigate, location, fetchUser]);

  return <div>Loading...</div>;
};

export default AuthCallback;