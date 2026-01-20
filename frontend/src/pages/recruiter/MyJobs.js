import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Button, Chip, IconButton } from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getJobTypeLabel } from '../../utils/helpers';

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      // Use the my_jobs endpoint to get only recruiter's jobs
      const response = await api.get('/jobs/my_jobs/');
      setJobs(response.data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      if (error.response?.status === 403) {
        alert('You need to be approved by admin to view your jobs');
      }
    }
    setLoading(false);
  };

  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    
    try {
      await api.delete(`/jobs/${jobToDelete}/`);
      fetchJobs();
      showSuccess('Job deleted successfully');
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      showError(error.response?.data?.error || 'Failed to delete job');
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading jobs..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Jobs
        </Typography>
        <Button variant="contained" component={Link} to="/recruiter/jobs/new">
          Post New Job
        </Button>
      </Box>

      {jobs.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No jobs posted yet
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {jobs.map((job) => (
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
                      <Chip
                        label={`${job.applications_count || 0} Applications`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Posted: {formatDate(job.date_posted)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      component={Link}
                      to={`/recruiter/jobs/${job.id}/applications`}
                      color="primary"
                    >
                      <Visibility />
                    </IconButton>
                    <IconButton
                      component={Link}
                      to={`/recruiter/jobs/${job.id}/edit`}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClick(job.id)} color="error">
                      <Delete />
                    </IconButton>
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
        message="Are you sure you want to delete this job? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />
    </Container>
  );
};

export default MyJobs;
