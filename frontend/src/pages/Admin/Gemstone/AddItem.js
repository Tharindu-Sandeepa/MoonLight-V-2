import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { Select, MenuItem } from '@mui/material';
import Dashboard from '../Dashboard';

const theme = createTheme({
  palette: {
    primary: { main: "#1976d2" },
    secondary: { main: "#ffffff" },
  },
});

const AddItem = () => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [csrfToken, setCsrfToken] = useState('');
  const [errors, setErrors] = useState({});
  const [tokenError, setTokenError] = useState('');

  // Allowed image MIME types
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];

  // Fetch CSRF token on component mount
  useEffect(() => {
    axios.get('http://localhost:5002/api/csrf-token', { withCredentials: true })
      .then(res => {
        setCsrfToken(res.data.csrfToken);
        console.log('Fetched CSRF token:', res.data.csrfToken);
      })
      .catch(err => {
        console.error('CSRF token fetch failed:', err.response?.data || err.message);
        setTokenError('Failed to fetch CSRF token. Please refresh the page.');
      });
  }, []);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};
    if (!image) {
      newErrors.image = "Please upload an image.";
    } else if (!allowedImageTypes.includes(image.type)) {
      newErrors.image = "Only JPEG, PNG, and GIF images are allowed.";
    }
    if (!name) newErrors.name = "Please enter a name.";
    if (!type) newErrors.type = "Please select a type.";
    if (!price) newErrors.price = "Please enter a price.";
    else if (isNaN(price) || price <= 0) newErrors.price = "Price must be a positive number.";
    if (!description) newErrors.description = "Please enter a description.";
    return newErrors;
  };

  // Handle form submission
  const submitImage = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const formData = new FormData();
    formData.append("image", image);
    formData.append("name", name);
    formData.append("type", type);
    formData.append("price", price);
    formData.append("description", description);

    try {
      await axios.post('http://localhost:5002/gemupload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRF-Token': csrfToken
        },
        withCredentials: true,
      });

      setImage(null);
      setName("");
      setType("");
      setPrice("");
      setDescription("");
      setErrors({});
      console.log('Gem form submitted successfully');
    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);
      setErrors({ form: error.response?.data?.error || 'Submission failed. Please try again.' });
    }
  };

  // Handle input changes
  const onInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "image") {
      const file = e.target.files[0];
      if (file && !allowedImageTypes.includes(file.type)) {
        setErrors({ ...errors, image: "Only JPEG, PNG, and GIF images are allowed." });
        setImage(null);
      } else {
        setImage(file);
      }
    } else {
      switch (name) {
        case "name": setName(value); break;
        case "type": setType(value); break;
        case "price": setPrice(value); break;
        case "description": setDescription(value); break;
        default: break;
      }
    }
    const newErrors = validateForm();
    setErrors(newErrors);
  };

  return (
    <Dashboard title="Gem Management">
      <ThemeProvider theme={theme}>
        <Box sx={{ padding: 3, backgroundColor: "secondary.main" }}>
          <Typography variant="h4" color="primary" sx={{ mb: 2 }}>
            Add Gem Image
          </Typography>
          {tokenError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {tokenError}
            </Typography>
          )}
          {errors.form && (
            <Typography color="error" sx={{ mt: 2 }}>
              {errors.form}
            </Typography>
          )}
          <form onSubmit={submitImage}>
            <Box sx={{ mb: 2 }}>
              <TextField
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/gif"
                onChange={onInputChange}
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                error={Boolean(errors.image)}
                helperText={errors.image}
              />
            </Box>
            <TextField
              name="name"
              label="Name"
              value={name}
              onChange={onInputChange}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
            <Select
              name="type"
              label="Type"
              value={type}
              onChange={onInputChange}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              error={Boolean(errors.type)}
              helperText={errors.type}
              displayEmpty
            >
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="Ruby">Ruby</MenuItem>
              <MenuItem value="Sapphire">Sapphire</MenuItem>
              <MenuItem value="Emerald">Emerald</MenuItem>
              <MenuItem value="Diamond">Diamond</MenuItem>
              <MenuItem value="Amethyst">Amethyst</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            <TextField
              name="price"
              label="Price"
              value={price}
              onChange={onInputChange}
              variant="outlined"
              fullWidth
              sx={{ mb: 2 }}
              error={Boolean(errors.price)}
              helperText={errors.price}
            />
            <TextField
              name="description"
              label="Description"
              value={description}
              onChange={onInputChange}
              variant="outlined"
              fullWidth
              multiline
              rows={3}
              sx={{ mb: 2 }}
              error={Boolean(errors.description)}
              helperText={errors.description}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={!csrfToken || tokenError || Object.keys(validateForm()).length > 0}
            >
              Submit
            </Button>
          </form>
        </Box>
      </ThemeProvider>
    </Dashboard>
  );
};

export default AddItem;