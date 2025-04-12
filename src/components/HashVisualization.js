import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

const StorageNodeCard = ({ node, isSelected, index, onClick }) => {
  const progress = (node.usedCapacity / node.capacity) * 100;

  return (
    <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
      <Card
        onClick={() => onClick(node)}
        sx={{
          height: '100%',
          backgroundColor: '#1a1a1a',
          borderRadius: '16px',
          border: isSelected ? '2px solid #ffffff' : '1px solid #333',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          color: '#ffffff',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 6px 18px rgba(255,255,255,0.1)',
            transform: 'translateY(-4px)',
          },
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {node.name}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#ccc' }} gutterBottom>
              Capacity: {node.usedCapacity}/{node.capacity} units
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#333',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress >= 100 ? '#000' : '#fff',
                },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: '#ccc' }}>
            Status: {isSelected ? 'Active' : 'Inactive'}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

const StorageNodeDialog = ({ node, open, onClose }) => {
  if (!node) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ backgroundColor: '#ffffff', color: '#000' }}>
        {node.name} Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: '#000' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: '#ffffff', color: '#000' }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Storage Capacity
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(node.usedCapacity / node.capacity) * 100}
            sx={{ height: 10, borderRadius: 5 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {node.usedCapacity} / {node.capacity} units used
          </Typography>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Stored Items ({node.storedItems.length})
        </Typography>
        <List>
          {node.storedItems.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.content}
                secondary={`Stored at: ${new Date(item.timestamp).toLocaleString()}`}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions sx={{ backgroundColor: '#ffffff' }}>
        <Button onClick={onClose} sx={{ color: '#000' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const HashVisualization = ({ hashResult, storageNodes, onMethodChange }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [method, setMethod] = useState('chaining');

  useEffect(() => {
    const viz = document.getElementById('hash-visualization');
    if (viz) viz.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '600');
    svg.setAttribute('height', '60');

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', '300');
    text.setAttribute('y', '40');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', '#666');
    text.style.fontFamily = 'monospace';
    text.style.fontSize = '14px';

    if (hashResult) {
      text.textContent = 'Hash: ' + hashResult.hash.substring(0, 16) + '...';
    }

    svg.appendChild(text);
    viz?.appendChild(svg);
  }, [hashResult]);

  const handleNodeClick = async (node) => {
    try {
      const response = await fetch(`http://localhost:3001/api/storage-nodes/${node.id}`);
      const detailedNode = await response.json();
      setSelectedNode(detailedNode);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching node details:', error);
    }
  };

  const handleDropdownChange = (e) => {
    const newMethod = e.target.value;
    setMethod(newMethod);
    onMethodChange(newMethod);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        mt: 6,
        borderRadius: '16px',
        backgroundColor: '#ffffff !important',
        color: '#000000',
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Storage Visualization
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <FormControl
            variant="outlined"
            sx={{
              width: 250,
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            <InputLabel
              id="collision-method-label"
              sx={{
                color: '#000',
                '&.Mui-focused': {
                  color: '#000',
                },
              }}
            >
              Collision Resolution
            </InputLabel>
            <Select
              labelId="collision-method-label"
              id="collision-method"
              value={method}
              onChange={handleDropdownChange}
              input={<OutlinedInput label="Collision Resolution" />}
              sx={{
                backgroundColor: '#f0f0f0',
                color: '#000',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#000',
                },
                '.MuiSvgIcon-root': {
                  color: '#000',
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#ffffff !important',
                    color: '#000 !important',
                    '& .MuiMenuItem-root': {
                      color: '#000 !important',
                    },
                    '& .MuiMenuItem-root:hover': {
                      backgroundColor: '#f0f0f0 !important',
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#e0e0e0 !important',
                    }
                  }
                },
              }}
            >
              <MenuItem value="chaining">Chaining (Linked List)</MenuItem>
              <MenuItem value="linear-probing">Open Addressing (Linear Probing)</MenuItem>
              <MenuItem value="double-hashing">Double Hashing</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box id="hash-visualization" sx={{ display: 'flex', justifyContent: 'center', mb: 4 }} />

      <Grid container spacing={3} justifyContent="center">
        {storageNodes.map((node, index) => (
          <Grid item xs={12} sm={6} md={3} key={node.id}>
            <StorageNodeCard
              node={node}
              isSelected={hashResult && node.name === hashResult.location}
              index={index}
              onClick={handleNodeClick}
            />
          </Grid>
        ))}
      </Grid>

      <StorageNodeDialog
        node={selectedNode}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => window.dispatchEvent(new CustomEvent('triggerResetDialog'))}
          sx={{
            color: '#f44336',
            borderColor: '#f44336',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#f44336',
              color: '#fff'
            }
          }}
        >
          RESET ALL
        </Button>
      </Box>
    </Paper>
  );
};

export default HashVisualization;
