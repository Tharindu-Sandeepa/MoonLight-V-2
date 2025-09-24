import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import UpdateUserForm from './UpdateUserForm';
import Avatar from '@mui/material/Avatar';
import { IconButton, Typography, TextField, CssBaseline, Grid, Container, Paper, ThemeProvider } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { createTheme } from '@mui/material/styles';
import { useAuth } from '../../Auth/AuthContext'; // Import useAuth
import { toast } from 'react-toastify';

const defaultTheme = createTheme();

const MyAccount = () => {
  const { user, fetchUser } = useAuth(); // Get user and fetchUser from AuthContext
  const [showForm, setShowForm] = useState(false);

  // Fetch user details on mount if not already available
  useEffect(() => {
    if (!user) {
      fetchUser().catch((error) => {
        console.error('Error fetching user details:', error);
        toast.error('Failed to load user data. Please log in again.', {
          position: 'top-right',
          autoClose: 3000,
        });
      });
    }
  }, [user, fetchUser]);

  // Function to update user details
  const updateUser = async (data) => {
    const payload = {
      id: data._id,
      name: data.name,
      email: data.email,
      tp: data.tp,
      username: data.username,
      password: data.password,
      type: data.type,
    };

    try {
      await axios.post('http://localhost:5002/api/users/updateuser', payload, {
        withCredentials: true, // Include cookies
      });
      toast.success('User updated successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setShowForm(false);
      fetchUser(); // Refresh user data
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  // Function to delete user
  const deleteUser = async () => {
    if (!user) return;

    const confirmed = window.confirm('Are you sure you want to delete this user?');
    if (!confirmed) return;

    try {
      await axios.post('http://localhost:5002/api/users/deleteuser', { id: user._id }, {
        withCredentials: true,
      });
      toast.success('User deleted successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user.', {
        position: 'top-right',
        autoClose: 3000,
      });
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ borderRadius: 10, width: '200%' }}>
            <Grid container spacing={0}>
              <Grid item xs={4} sx={{ borderTopLeftRadius: 20, borderBottomLeftRadius: 20, background: '#B2BFFF', padding: 5 }}>
                <Grid container direction="column" justifyContent="space-between" alignItems="center" style={{ height: '100%' }}>
                  <Box>
                    <AccountCircleIcon sx={{ fontSize: '170px' }} />
                  </Box>
                  <Box>
                    <Typography component="h1" variant="h5" align="center" sx={{ marginBottom: 10 }}>
                      {user && (
                        <Box>
                          <p>Hi, {user.name}</p>
                        </Box>
                      )}
                      <IconButton
                        onClick={deleteUser}
                        sx={{
                          backgroundColor: '#FF5252',
                          borderRadius: '10px',
                          padding: '10px',
                          '&:hover': {
                            backgroundColor: '#E57373',
                          },
                        }}
                        disabled={!user} // Disable if no user
                      >
                        <DeleteIcon />
                        <Typography variant="button" sx={{ marginLeft: '4px', fontWeight: 'bold', color: '#FFFFFF' }}>
                          Delete
                        </Typography>
                      </IconButton>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Grid item xs={8} sx={{ borderTopRightRadius: 20, borderBottomRightRadius: 20, padding: 4 }}>
                <Typography component="h1" variant="h7">My Account</Typography>
                <Box component="div" sx={{ mt: 3 }}>
                  {user ? (
                    <div>
                      <Box sx={{ border: '2px solid #E2EAFA', borderRadius: '10px', padding: '5px', marginBottom: '10px' }}>
                        <p>Username: {user.username}</p>
                      </Box>
                      <Box sx={{ border: '2px solid #E2EAFA', borderRadius: '10px', padding: '5px', marginBottom: '10px' }}>
                        <p>Email: {user.email}</p>
                      </Box>
                      <Box sx={{ border: '2px solid #E2EAFA', borderRadius: '10px', padding: '5px', marginBottom: '10px' }}>
                        <p>Name: {user.name}</p>
                      </Box>
                      <Box sx={{ border: '2px solid #E2EAFA', borderRadius: '10px', padding: '5px', marginBottom: '10px' }}>
                        <p>Phone: {user.tp}</p>
                      </Box>
                      {!showForm && (
                        <IconButton
                          onClick={() => setShowForm(true)}
                          sx={{
                            backgroundColor: '#B2EBF2',
                            borderRadius: '10px',
                            padding: '10px',
                            marginRight: '19px',
                            '&:hover': {
                              backgroundColor: '#81D4FA',
                            },
                          }}
                        >
                          <EditIcon />
                          <Typography variant="button" sx={{ marginLeft: '4px', fontWeight: 'bold' }}>
                            Edit
                          </Typography>
                        </IconButton>
                      )}
                      {showForm && (
                        <UpdateUserForm
                          user={user}
                          updateUser={updateUser}
                          setShowForm={setShowForm}
                        />
                      )}
                    </div>
                  ) : (
                    <Typography>Loading user data...</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default MyAccount;