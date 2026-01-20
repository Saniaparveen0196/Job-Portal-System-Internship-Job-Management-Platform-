import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Button, Chip } from '@mui/material';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/helpers';

const JobApplications = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState([]);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchApplications();
  }, [id]);

  const fetchApplications = async () => {
    try {
      const response = await api.get(`/jobs/${id}/applications/`);
      setApplications(response.data);
      // Fetch job details
      const jobResponse = await api.get(`/jobs/${id}/`);
      setJob(jobResponse.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      if (error.response?.status === 403 || error.response?.status === 404) {
        showError('You do not have permission to view applications for this job');
      } else {
        showError('Failed to load applications');
      }
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading applications..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Applications for {job?.title}
      </Typography>

      {applications.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No applications yet
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {applications.map((app) => (
            <Card key={app.id} sx={{ transition: 'all 0.3s ease' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6">
                      {app.student.first_name} {app.student.last_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Applied: {formatDate(app.applied_date)}
                    </Typography>
                    {app.cover_letter && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {app.cover_letter.substring(0, 200)}...
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                    <Button
                      variant="outlined"
                      component={Link}
                      to={`/recruiter/applications/${app.id}`}
                    >
                      View Details
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

export default JobApplications;
