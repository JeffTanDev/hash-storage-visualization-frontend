import React, { useState } from 'react';
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
  Chip,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import LinkIcon from '@mui/icons-material/Link';
import * as d3 from 'd3';

const StorageNodeCard = ({ node, isSelected, index, onClick }) => {
  const progress = (node.usedCapacity / node.capacity) * 100;
  const chainLength = node.chain ? node.chain.length : 0;

  return (
    <Fade in={true} timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
      <Card 
        onClick={() => onClick(node)}
        sx={{ 
          height: '100%',
          backgroundColor: isSelected ? '#e8f5e9' : '#f5f5f5',
          border: isSelected ? '2px solid #4caf50' : '1px solid #e0e0e0',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: 3
          }
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6" component="div">
              {node.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {node.collisions > 0 && (
                <Tooltip title={`${node.collisions} collision(s)`}>
                  <Chip 
                    icon={<WarningIcon />} 
                    label={`${node.collisions} collision(s)`}
                    color="warning"
                    size="small"
                  />
                </Tooltip>
              )}
              {chainLength > 0 && (
                <Tooltip title={`${chainLength} items in chain`}>
                  <Chip 
                    icon={<LinkIcon />} 
                    label={`${chainLength} in chain`}
                    color="info"
                    size="small"
                  />
                </Tooltip>
              )}
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Capacity: {node.usedCapacity}/{node.capacity} units
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: progress > 90 ? '#f44336' : '#4caf50'
                }
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
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
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {node.name} Details
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
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
          {node.collisions > 0 && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              This node has {node.collisions} collision(s)
            </Typography>
          )}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Stored Items
        </Typography>
        <List>
          {node.storedItems && node.storedItems.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.content}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Hash: {item.id}
                    </Typography>
                    <br />
                    {item.originalLocation !== node.name && (
                      <Typography component="span" variant="body2" color="warning.main">
                        Collision: Originally assigned to {item.originalLocation}
                        {item.stepSize && ` (Step size: ${item.stepSize})`}
                      </Typography>
                    )}
                    <br />
                    <Typography component="span" variant="body2" color="text.secondary">
                      Stored at: {new Date(item.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
          {node.chain && node.chain.map((item) => (
            <ListItem key={item.id} divider>
              <ListItemText
                primary={item.content}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      Hash: {item.id}
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="info.main">
                      Stored in chain
                    </Typography>
                    <br />
                    <Typography component="span" variant="body2" color="text.secondary">
                      Stored at: {new Date(item.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const HashVisualization = ({ hashResult, storageNodes, onMethodChange }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  React.useEffect(() => {
    // Clear previous visualization
    d3.select('#hash-visualization').selectAll('*').remove();

    if (!hashResult) {
      // Create initial visualization
      const svg = d3.select('#hash-visualization')
        .append('svg')
        .attr('width', 600)
        .attr('height', 100);

      svg.append('text')
        .attr('x', 300)
        .attr('y', 50)
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .style('font-family', 'monospace')
        .style('font-size', '14px')
        .text('Enter data to generate hash...');
      return;
    }

    // Create SVG for hash visualization
    const svg = d3.select('#hash-visualization')
      .append('svg')
      .attr('width', 600)
      .attr('height', 120);

    // Add hash value display with animation
    const hashText = svg.append('text')
      .attr('x', 300)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#666')
      .style('font-family', 'monospace')
      .style('font-size', '14px');

    // Animate the hash text
    hashText
      .text('Hash: ' + hashResult.hash.substring(0, 16) + '...')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .style('opacity', 1);

    // Add collision information
    if (hashResult.details.isCollision) {
      const collisionInfo = svg.append('g')
        .attr('transform', 'translate(300, 70)');

      collisionInfo.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', '#f44336')
        .style('font-size', '14px')
        .text(`Collision! Originally assigned to ${hashResult.details.originalLocation}`);

      if (hashResult.details.collisionMethod === 'double-hashing') {
        collisionInfo.append('text')
          .attr('text-anchor', 'middle')
          .attr('fill', '#2196f3')
          .style('font-size', '12px')
          .attr('y', 20)
          .text(`Step Size: ${hashResult.details.stepSize}, Probe Sequence: ${hashResult.details.probeSequence}`);
      }

      collisionInfo.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', '#666')
        .style('font-size', '12px')
        .attr('y', 40)
        .text(`Method: ${hashResult.details.collisionMethod}`);

      collisionInfo.selectAll('text')
        .style('opacity', 0)
        .transition()
        .duration(1000)
        .style('opacity', 1);
    }
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

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          Storage Visualization
        </Typography>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Collision Resolution Method</InputLabel>
          <Select
            defaultValue="chaining"
            onChange={(e) => onMethodChange(e.target.value)}
            label="Collision Resolution Method"
          >
            <MenuItem value="chaining">Chaining (Linked List)</MenuItem>
            <MenuItem value="linear-probing">Open Addressing (Linear Probing)</MenuItem>
            <MenuItem value="double-hashing">Double Hashing</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Hash Display */}
      <Box id="hash-visualization" sx={{ display: 'flex', justifyContent: 'center', mb: 4 }} />
      
      {/* Storage Nodes Grid */}
      <Grid container spacing={3}>
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

      {/* Storage Node Details Dialog */}
      <StorageNodeDialog
        node={selectedNode}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </Paper>
  );
};

export default HashVisualization; 