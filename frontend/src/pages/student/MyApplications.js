import React, { useState, useEffect } from 'react';
import { 
  Container, Paper, Typography, Box, Chip, Card, CardContent, 
  Tabs, Tab, TextField, InputAdornment, Button, Alert
} from '@mui/material';
import { Search, CheckCircle, Cancel, Schedule, Visibility } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor, getJobTypeLabel } from '../../utils/helpers';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { showError } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications/');
      // Handle both paginated and non-paginated responses
      const apps = Array.isArray(response.data) 
        ? response.data 
        : (response.data.results || []);
      setApplications(apps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]); // Set to empty array on error
      showError('Failed to load applications');
    }
    setLoading(false);
  };

  const filteredApplications = (Array.isArray(applications) ? applications : []).filter(app => {
    const search = searchTerm.toLowerCase();
    return (
      app.job?.title?.toLowerCase().includes(search) ||
      app.job?.company_name?.toLowerCase().includes(search) ||
      app.status?.toLowerCase().includes(search)
    );
  });

  const applicationsByStatus = {
    all: filteredApplications,
    applied: filteredApplications.filter(app => app.status === 'applied'),
    accepted: filteredApplications.filter(app => app.status === 'accepted'),
    rejected: filteredApplications.filter(app => app.status === 'rejected'),
  };

  const getDisplayApplications = () => {
    if (tabValue === 0) return applicationsByStatus.all;
    if (tabValue === 1) return applicationsByStatus.applied;
    if (tabValue === 2) return applicationsByStatus.accepted;
    if (tabValue === 3) return applicationsByStatus.rejected;
    return applicationsByStatus.all;
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading applications..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Applications
        </Typography>
        <Button variant="outlined" component={Link} to="/student/jobs">
          Browse Jobs
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search applications by job title, company, or status..."
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

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<Schedule />} iconPosition="start" label={`All (${applicationsByStatus.all.length})`} />
          <Tab icon={<Schedule />} iconPosition="start" label={`Applied (${applicationsByStatus.applied.length})`} />
          <Tab icon={<CheckCircle />} iconPosition="start" label={`Accepted (${applicationsByStatus.accepted.length})`} />
          <Tab icon={<Cancel />} iconPosition="start" label={`Rejected (${applicationsByStatus.rejected.length})`} />
        </Tabs>
      </Paper>

      {getDisplayApplications().length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {applications.length === 0 
              ? 'No applications yet. Start applying to jobs!' 
              : 'No applications match your search'}
          </Typography>
          {applications.length === 0 && (
            <Button
              variant="contained"
              component={Link}
              to="/student/jobs"
              sx={{ mt: 2 }}
            >
              Browse Available Jobs
            </Button>
          )}
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {getDisplayApplications().map((app) => (
            <Card key={app.id} sx={{ transition: 'all 0.3s ease' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      component={Link} 
                      to={`/student/jobs/${app.job.id}`} 
                      sx={{ textDecoration: 'none', color: 'primary.main', display: 'block', mb: 1 }}
                    >
                      {app.job.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {app.job.company_name} • {app.job.location}
                    </Typography>
                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={getJobTypeLabel(app.job.job_type)} 
                        size="small" 
                        variant="outlined"
                      />
                      {app.job.salary_range && (
                        <Chip 
                          label={app.job.salary_range} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Applied:</strong> {formatDate(app.applied_date)}
                      </Typography>
                      {app.updated_at && app.updated_at !== app.applied_date && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>Updated:</strong> {formatDate(app.updated_at)}
                        </Typography>
                      )}
                    </Box>
                    {app.recruiter_notes && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <Typography variant="body2">
                          <strong>Recruiter Note:</strong> {app.recruiter_notes}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}
                      size="medium"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      component={Link}
                      to={`/student/jobs/${app.job.id}`}
                      startIcon={<Visibility />}
                    >
                      View Job
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default MyApplications;
