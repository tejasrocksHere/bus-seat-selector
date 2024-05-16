import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';

const GeocodeForm = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [busSide, setBusSide] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const apiKey = '63446487c5b74453892d336d19a5d503'; // Replace with your OpenCage Data API key

  const fetchCoordinates = async (location) => {
    const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${apiKey}`);
    const data = await response.json();
    if (data.results.length > 0) {
      return data.results[0].geometry;
    } else {
      throw new Error('Location not found');
    }
  };

  const calculateBusSide = (fromCoords, toCoords, time) => {
    const latitudeDifference = toCoords.lat - fromCoords.lat;
    const longitudeDifference = toCoords.lng - fromCoords.lng;

    let busSide = '';
    if (Math.abs(longitudeDifference) < Math.abs(latitudeDifference)) {
      // North/south direction is more dominant
      if (time === 'morning') {
        busSide = latitudeDifference > 0 ? 'left' : 'right';
      } else {
        busSide = latitudeDifference > 0 ? 'right' : 'left';
      }
    } else {
      // East/west direction is more dominant
      if (time === 'morning') {
        busSide = longitudeDifference > 0 ? 'right' : 'left';
      } else {
        busSide = longitudeDifference > 0 ? 'left' : 'right';
      }
    }

    return busSide;
  };

  const handleFetchCoordinates = async (event) => {
    event.preventDefault();

    try {
      const fromCoordinates = await fetchCoordinates(fromLocation);
      const toCoordinates = await fetchCoordinates(toLocation);

      const busSide = calculateBusSide(fromCoordinates, toCoordinates, timeOfDay);
      setBusSide(busSide);
    } catch (error) {
      console.error('Error fetching coordinates:', error);
    }
  };

  const handleGetLiveLocation = () => {
    setBusSide('');
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setFromLocation(`${latitude},${longitude}`);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('Error getting live location:', error);
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Geocode Locations
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ mx: 2, mt: 2 }}>
        <Typography variant="body1" gutterBottom>
          🚍 Ever found yourself on the wrong side of the bus, battling the blazing sun? Fear not! This app is here to save your ride (and your sanity). 🌞 
          Just tell us where you're starting, where you're going, and the time of day, and we'll help you avoid becoming a human rotisserie. 
          Enter the locations and let us guide you to the shady side of life. Happy riding! 🚌
        </Typography>
      </Box>
      <Box component="form" onSubmit={handleFetchCoordinates} sx={{ mt: 2, mx: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="From"
              value={fromLocation}
              onChange={(e) => setFromLocation(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="To"
              value={toLocation}
              onChange={(e) => setToLocation(e.target.value)}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <Select
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
              displayEmpty
              fullWidth
              sx={{ mt: 2 }}
            >
              <MenuItem value="" disabled>
                Select Time of Day
              </MenuItem>
              <MenuItem value="morning">Morning</MenuItem>
              <MenuItem value="evening">Evening</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
              Get Bus Side
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="secondary"
              disabled={isLoadingLocation}
              onClick={handleGetLiveLocation}
              fullWidth
              sx={{ mt: 2 }}
            >
              {isLoadingLocation ? 'Loading...' : 'Get My Live Location'}
            </Button>
          </Grid>
        </Grid>
      </Box>
      {busSide && (
        <Box sx={{ mt: 4, mx: 2 }}>
          <Typography variant="body1">Sit on the {busSide} side of the bus. 🚌</Typography>
        </Box>
      )}
    </Box>


);
};

export default GeocodeForm;