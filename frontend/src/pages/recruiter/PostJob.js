import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
} from '@mui/material';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const PostJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company_name: '',
    role: '',
    location: '',
    job_type: 'full-time',
    salary_range: '',
    requirements: '',
    benefits: '',
    tags: '',
    deadline: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isEdit) {
      fetchJob();
    }
  }, [id]);

  const fetchJob = async () => {
    setFetching(true);
    try {
      const response = await api.get(`/jobs/${id}/`);
      const job = response.data;
      setFormData({
        title: job.title,
        description: job.description,
        company_name: job.company_name,
        role: job.role,
        location: job.location,
        job_type: job.job_type,
        salary_range: job.salary_range || '',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        tags: job.tags || '',
        deadline: job.deadline || '',
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      showError('Failed to load job details');
    }
    setFetching(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await api.put(`/jobs/${id}/`, formData);
        showSuccess('Job updated successfully!');
      } else {
        await api.post('/jobs/', formData);
        showSuccess('Job posted successfully!');
      }
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 1500);
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.detail ||
                          (typeof error.response?.data === 'string' ? error.response.data : 'Failed to save job');
      if (error.response?.status === 403) {
        showError('You need to be approved by admin before posting jobs');
      } else {
        showError(errorMessage);
      }
    }
    setLoading(false);
  };

  if (fetching) return <LoadingSpinner fullScreen message="Loading job details..." />;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {isEdit ? 'Edit Job' : 'Post New Job'}
      </Typography>

      <Paper sx={{ p: 4 }}>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Job Title"
            margin="normal"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Company Name"
            margin="normal"
            value={formData.company_name}
            onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Role"
            margin="normal"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Location"
            margin="normal"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
          <TextField
            fullWidth
            select
            label="Job Type"
            margin="normal"
            value={formData.job_type}
            onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
            required
          >
            <MenuItem value="internship">Internship</MenuItem>
            <MenuItem value="full-time">Full-time</MenuItem>
            <MenuItem value="part-time">Part-time</MenuItem>
            <MenuItem value="contract">Contract</MenuItem>
          </TextField>
          <TextField
            fullWidth
            label="Salary Range"
            margin="normal"
            value={formData.salary_range}
            onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
            placeholder="e.g., $50,000 - $70,000"
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={6}
            margin="normal"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Requirements"
            multiline
            rows={4}
            margin="normal"
            value={formData.requirements}
            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          />
          <TextField
            fullWidth
            label="Benefits"
            multiline
            rows={4}
            margin="normal"
            value={formData.benefits}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            margin="normal"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />
          <TextField
            fullWidth
            label="Deadline"
            type="date"
            margin="normal"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Job' : 'Post Job'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default PostJob;
