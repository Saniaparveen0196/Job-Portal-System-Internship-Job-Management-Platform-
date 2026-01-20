import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  MenuItem,
  TextField,
  Alert,
} from '@mui/material';
import { Message } from '@mui/icons-material';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isRecruiter } = useAuth();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const { showSuccess, showError } = useToast();
  
  // Determine if we're in admin context
  const isAdminView = isAdmin || location.pathname.startsWith('/admin');

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/applications/${id}/`);
      setApplication(response.data);
      setStatus(response.data.status);
      setNotes(response.data.recruiter_notes || '');
    } catch (error) {
      console.error('Error fetching application:', error);
      showError('Failed to load application details');
    }
    setLoading(false);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);

    try {
      await api.put(`/applications/${id}/update_status/`, {
        status,
        recruiter_notes: notes,
      });
      showSuccess('Application status updated successfully!');
      fetchApplication();
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail ||
                          'Failed to update application status';
      if (error.response?.status === 403) {
        showError('You do not have permission to update this application');
      } else {
        showError(errorMessage);
      }
    }
    setUpdating(false);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading application details..." />;
  if (!application) return <LoadingSpinner fullScreen message="Application not found" />;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" component="h1">
          Application Details
        </Typography>
        {isAdminView && (
          <Button
            variant="outlined"
            component={Link}
            to="/admin/applications"
          >
            Back to Applications
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          {application.job.title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {application.job.company_name}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Applicant Information
            </Typography>
            {!isAdminView && (
              <Button
                variant="outlined"
                component={Link}
                to={`/recruiter/messages?student_id=${application.student.id}`}
                startIcon={<Message />}
              >
                Message Student
              </Button>
            )}
          </Box>
          <Typography variant="body1">
            <strong>Name:</strong> {application.student.first_name} {application.student.last_name}
          </Typography>
          <Typography variant="body1">
            <strong>Email:</strong> {application.student.user?.email || 'N/A'}
          </Typography>
          <Typography variant="body1">
            <strong>Applied:</strong> {formatDate(application.applied_date)}
          </Typography>
          <Typography variant="body1">
            <strong>Status:</strong>{' '}
            <Chip
              label={application.status}
              color={getStatusColor(application.status)}
              sx={{ textTransform: 'capitalize' }}
            />
          </Typography>
        </Box>

        {application.cover_letter && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Cover Letter
            </Typography>
            <Typography variant="body1" paragraph>
              {application.cover_letter}
            </Typography>
          </Box>
        )}

        {application.resume && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resume
            </Typography>
            <Button
              variant="outlined"
              href={application.resume}
              target="_blank"
            >
              View Resume
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Update Application Status
          </Typography>

          <TextField
            fullWidth
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            margin="normal"
          >
            <MenuItem value="applied">Applied</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Notes (Optional)"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />

          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={updating}
            sx={{ mt: 2 }}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default ApplicationDetails;
