import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  Alert,
  InputLabel,
} from '@mui/material';
import { CheckCircle, Upload } from '@mui/icons-material';
import { FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getJobTypeLabel, getStatusColor } from '../../utils/helpers';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resume, setResume] = useState(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchJobDetails();
    checkApplicationStatus();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await api.get(`/jobs/${id}/`);
      setJob(response.data);
    } catch (error) {
      console.error('Error fetching job details:', error);
      showError('Failed to load job details');
    }
    setLoading(false);
  };

  const checkApplicationStatus = async () => {
    try {
      const response = await api.get('/applications/');
      const applications = response.data;
      const existingApp = applications.find(app => app.job.id === parseInt(id));
      if (existingApp) {
        setHasApplied(true);
        setApplicationStatus(existingApp.status);
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };

  const handleApply = async () => {
    if (!resume) {
      showError('Please upload your resume');
      return;
    }

    setApplying(true);

    try {
      const formData = new FormData();
      formData.append('job_id', id);
      formData.append('resume', resume);
      if (coverLetter) {
        formData.append('cover_letter', coverLetter);
      }

      await api.post('/applications/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      showSuccess('Application submitted successfully!');
      setTimeout(() => {
        navigate('/student/applications');
      }, 1500);
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to submit application');
    }
    setApplying(false);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading job details..." />;
  if (!job) return <LoadingSpinner fullScreen message="Job not found" />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {job.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FaBriefcase style={{ fontSize: 20, color: '#64748b' }} />
          <Typography variant="h6" color="text.secondary">
            {job.company_name}
          </Typography>
          <Box sx={{ mx: 0.5 }}>•</Box>
          <FaMapMarkerAlt style={{ fontSize: 20, color: '#64748b' }} />
          <Typography variant="h6" color="text.secondary">
            {job.location}
          </Typography>
        </Box>

        <Box sx={{ mt: 2, mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={getJobTypeLabel(job.job_type)} />
          {job.salary_range && <Chip label={job.salary_range} variant="outlined" />}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Job Description
        </Typography>
        <Typography variant="body1" paragraph>
          {job.description}
        </Typography>

        {job.requirements && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Requirements
            </Typography>
            <Typography variant="body1" paragraph>
              {job.requirements}
            </Typography>
          </>
        )}

        {job.benefits && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Benefits
            </Typography>
            <Typography variant="body1" paragraph>
              {job.benefits}
            </Typography>
          </>
        )}

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Apply for this Job
        </Typography>


        {hasApplied ? (
          <Box sx={{ mt: 2, p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <CheckCircle color="success" />
              <Typography variant="h6">You have already applied for this job</Typography>
            </Box>
            <Chip
              label={`Status: ${applicationStatus}`}
              color={getStatusColor(applicationStatus)}
              sx={{ textTransform: 'capitalize', mb: 2 }}
            />
            <Box>
              <Button
                variant="outlined"
                component={Link}
                to="/student/applications"
                sx={{ mr: 2 }}
              >
                View All Applications
              </Button>
              <Button
                variant="outlined"
                component={Link}
                to="/student/jobs"
              >
                Browse More Jobs
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <InputLabel sx={{ mb: 1 }}>Upload Resume (PDF required)</InputLabel>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              fullWidth
              sx={{ mb: 2 }}
            >
              {resumeFileName || 'Choose Resume File'}
              <input
                type="file"
                accept=".pdf"
                hidden
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setResume(file);
                    setResumeFileName(file.name);
                  }
                }}
              />
            </Button>
            {resumeFileName && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Selected: {resumeFileName}
              </Typography>
            )}
            <TextField
              fullWidth
              label="Cover Letter (Optional)"
              multiline
              rows={6}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Tell the employer why you're a great fit for this position..."
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleApply}
              disabled={applying || !resume}
              size="large"
              fullWidth
            >
              {applying ? 'Submitting Application...' : 'Submit Application'}
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default JobDetails;
