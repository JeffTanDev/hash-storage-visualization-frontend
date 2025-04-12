import React, { useState, useEffect } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container
} from '@mui/material';
import HashVisualization from './components/HashVisualization';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [hashResult, setHashResult] = useState(null);
  const [storageNodes, setStorageNodes] = useState([]);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [collisionMethod, setCollisionMethod] = useState('chaining');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  useEffect(() => {
    fetchStorageNodes();
  
    const handleResetEvent = () => setResetDialogOpen(true);
    window.addEventListener('triggerResetDialog', handleResetEvent);
  
    return () => {
      window.removeEventListener('triggerResetDialog', handleResetEvent);
    };
  }, []);
  

  const fetchStorageNodes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/storage-nodes');
      const data = await response.json();
      setStorageNodes(data);
    } catch (error) {
      setError('Failed to fetch storage nodes');
      setOpenSnackbar(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Please enter some data');
      setOpenSnackbar(true);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, method: collisionMethod }),
      });

      if (!response.ok) throw new Error('Failed to generate hash');

      const result = await response.json();
      setHashResult(result);
      await fetchStorageNodes();
    } catch (error) {
      setError(error.message);
      setOpenSnackbar(true);
    }
  };

  const handleMethodChange = (method) => {
    setCollisionMethod(method);
    setHashResult(null);
  };

  const handleReset = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/reset', {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to reset storage nodes');

      setHashResult(null);
      await fetchStorageNodes();
      setResetDialogOpen(false);
      setError('Storage nodes have been reset');
      setOpenSnackbar(true);
    } catch (error) {
      setError(error.message);
      setOpenSnackbar(true);
    }
  };

  return (
    <div className="App">
      <Container maxWidth="lg">
        <Box sx={{ my: 6, textAlign: 'center' }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#fff' }}>
            Hash Storage Visualization System
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#ccc', mt: 1 }}>
            An intelligent storage system built on hash functions and collision resolution.
          </Typography>

          <Paper
            elevation={4}
            sx={{
              p: 4,
              mt: 3,
              backgroundColor: '#141414',
              borderRadius: '24px',
              maxWidth: '700px',
              mx: 'auto'
            }}
          >
            <form onSubmit={handleSubmit}>
              <TextField
                label="Enter Data"
                variant="outlined"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                fullWidth
                InputLabelProps={{ style: { color: 'white' } }}
                InputProps={{ style: { color: 'white' } }}
                sx={{
                  '& label.Mui-focused': { color: 'white' },
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: 'white' },
                    '&:hover fieldset': { borderColor: 'white' },
                    '&.Mui-focused fieldset': { borderColor: 'white' },
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  mt: 4,
                  backgroundColor: '#fff',
                  color: '#000',
                  fontWeight: 'bold',
                  borderRadius: '16px',
                  py: 1.5,
                  fontSize: '1rem',
                  '&:hover': { backgroundColor: '#e0e0e0' }
                }}
              >
                GENERATE HASH
              </Button>
            </form>
          </Paper>

          <Box sx={{ mt: 6 }}>
            <HashVisualization
              hashResult={hashResult}
              storageNodes={storageNodes}
              onMethodChange={handleMethodChange}
            />
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={error.includes('Failed') ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle>Reset Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to reset all storage nodes? This will clear all stored data and cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleReset} color="error" variant="contained">
            Reset
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default App;
