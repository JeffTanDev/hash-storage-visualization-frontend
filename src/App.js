import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Paper } from '@mui/material';
import HashVisualization from './components/HashVisualization';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [hashResult, setHashResult] = useState(null);
  const [storageNodes, setStorageNodes] = useState([]);

  const fetchStorageNodes = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/storage-nodes');
      const data = await response.json();
      setStorageNodes(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchStorageNodes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/hash', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input }),
      });
      const data = await response.json();
      setHashResult(data);
      // Update storage nodes after successful hash generation
      fetchStorageNodes();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Hash Storage Visualization System
        </Typography>
        
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Enter Data"
              variant="outlined"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              margin="normal"
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              Generate Hash
            </Button>
          </form>
        </Paper>

        {hashResult && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Hash Result:
            </Typography>
            <Typography variant="body1" sx={{ wordBreak: 'break-all' }}>
              {hashResult.hash}
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Storage Location:
            </Typography>
            <Typography variant="body1">
              {hashResult.location}
            </Typography>
          </Paper>
        )}

        <HashVisualization 
          hashResult={hashResult}
          storageNodes={storageNodes}
        />
      </Box>
    </Container>
  );
}

export default App;
