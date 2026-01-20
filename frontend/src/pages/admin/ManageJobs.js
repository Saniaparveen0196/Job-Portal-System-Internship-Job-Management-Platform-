import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Card, CardContent, Button, Chip, IconButton, 
  TextField, Alert, InputAdornment, Tooltip, Link as MuiLink
} from '@mui/material';
import { Delete, Search, Visibility } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getJobTypeLabel } from '../../utils/helpers';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await api.get('/admin/jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showError('Failed to load jobs');
    }
    setLoading(false);
  };

  const handleDeleteClick = (jobId, jobTitle) => {
    setJobToDelete({ id: jobId, title: jobTitle });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    try {
      await api.delete(`/admin/jobs/${jobToDelete.id}/delete/`);
      showSuccess('Job deleted successfully!');
      fetchJobs();
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      showError(error.response?.data?.error || 'Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const search = searchTerm.toLowerCase();
    return (
      job.title?.toLowerCase().includes(search) ||
      job.company_name?.toLowerCase().includes(search) ||
      job.location?.toLowerCase().includes(search) ||
      job.role?.toLowerCase().includes(search)
    );
  });

  if (loading) return <LoadingSpinner fullScreen message="Loading jobs..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Jobs
        </Typography>
        <Button variant="outlined" component={Link} to="/admin/dashboard">
          Back to Dashboard
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search jobs by title, company, location, or role..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {filteredJobs.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          {jobs.length === 0 ? 'No jobs found' : 'No jobs match your search'}
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredJobs.map((job) => (
            <Card key={job.id} sx={{ transition: 'all 0.3s ease' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">{job.title}</Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {job.company_name} • {job.location}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={getJobTypeLabel(job.job_type)} size="small" />
                      <Chip
                        label={job.is_active ? 'Active' : 'Inactive'}
                        color={job.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Posted: {formatDate(job.date_posted)} by {job.posted_by?.company_name || job.posted_by?.user?.username || 'Unknown'}
                    </Typography>
                    {job.applications_count > 0 && (
                      <Typography variant="body2" color="info.main" sx={{ mt: 0.5 }}>
                        {job.applications_count} application{job.applications_count !== 1 ? 's' : ''}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Tooltip title="View Job Details">
                      <IconButton
                        color="primary"
                        component={MuiLink}
                        href={`/jobs/${job.id}`}
                        target="_blank"
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Job">
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(job.id, job.title)}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setJobToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Job"
        message={jobToDelete ? `Are you sure you want to delete "${jobToDelete.title}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Container>
  );
};

export default ManageJobs;
