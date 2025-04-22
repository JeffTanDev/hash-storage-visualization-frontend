import React, { useState, useEffect } from 'react';
import { 
  Container, 
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
  DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
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
  }, []);

  const fetchStorageNodes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/storage-nodes');
      const data = await response.json();
      setStorageNodes(data);
    } catch (error) {
      console.error('Error fetching storage nodes:', error);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input, method: collisionMethod }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hash');
      }

      const result = await response.json();
      setHashResult(result);
      await fetchStorageNodes();
    } catch (error) {
      console.error('Error:', error);
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

      if (!response.ok) {
        throw new Error('Failed to reset storage nodes');
      }

      setHashResult(null);
      await fetchStorageNodes();
      setResetDialogOpen(false);
      setError('Storage nodes have been reset');
      setOpenSnackbar(true);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
      setOpenSnackbar(true);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Hash Storage Visualization
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setResetDialogOpen(true)}
          >
            Reset All
          </Button>
        </Box>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                label="Enter data to hash"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                variant="outlined"
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                size="large"
              >
                Generate Hash
              </Button>
            </Box>
          </form>
        </Paper>

        <HashVisualization 
          hashResult={hashResult} 
          storageNodes={storageNodes}
          onMethodChange={handleMethodChange}
        />
      </Box>

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
    </Container>
  );
}

export default App;
