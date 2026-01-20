import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, TextField, Chip, Pagination, IconButton, Button } from '@mui/material';
import { Bookmark, BookmarkBorder, CheckCircle } from '@mui/icons-material';
import { FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getJobTypeLabel, getStatusColor } from '../../utils/helpers';

const JobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ job_type: '', location: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [applications, setApplications] = useState([]);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, [page, search, filters]);

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
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = { page, ...(search && { search }), ...filters };
      const response = await api.get('/jobs/', { params });
      setJobs(response.data.results || response.data);
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / 10));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showError('Failed to load jobs');
    }
    setLoading(false);
  };

  const toggleBookmark = async (jobId, isBookmarked) => {
    try {
      if (isBookmarked) {
        // Find and delete bookmark
        const bookmarks = await api.get('/bookmarks/');
        const bookmark = bookmarks.data.find(b => b.job.id === jobId);
        if (bookmark) {
          await api.delete(`/bookmarks/${bookmark.id}/`);
        }
      } else {
        await api.post('/bookmarks/', { job_id: jobId });
      }
      fetchJobs(); // Refresh to update bookmark status
      showSuccess(isBookmarked ? 'Bookmark removed' : 'Job bookmarked');
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      showError('Failed to update bookmark');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Browse Jobs
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Search jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TextField
          select
          label="Job Type"
          value={filters.job_type}
          onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
          SelectProps={{ native: true }}
          sx={{ minWidth: 150 }}
        >
          <option value="">All</option>
          <option value="internship">Internship</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </TextField>
      </Box>

      {loading ? (
        <LoadingSpinner fullScreen message="Loading jobs..." />
      ) : (
        <>
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} key={job.id}>
                <Card sx={{ transition: 'all 0.3s ease' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Typography variant="h6" component={Link} to={`/student/jobs/${job.id}`} sx={{ textDecoration: 'none', color: 'primary.main' }}>
                            {job.title}
                          </Typography>
                          {(() => {
                            if (!Array.isArray(applications)) return null;
                            const appliedApp = applications.find(app => app.job && app.job.id === job.id);
                            if (appliedApp) {
                              return (
                                <Chip
                                  icon={<CheckCircle />}
                                  label={`Applied (${appliedApp.status})`}
                                  color={getStatusColor(appliedApp.status)}
                                  size="small"
                                  sx={{ textTransform: 'capitalize' }}
                                />
                              );
                            }
                            return null;
                          })()}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <FaBriefcase style={{ fontSize: 16, color: '#64748b' }} />
                          <Typography variant="subtitle1" color="text.secondary">
                            {job.company_name}
                          </Typography>
                          <Box sx={{ mx: 0.5 }}>•</Box>
                          <FaMapMarkerAlt style={{ fontSize: 16, color: '#64748b' }} />
                          <Typography variant="subtitle1" color="text.secondary">
                            {job.location}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={getJobTypeLabel(job.job_type)} size="small" />
                          {job.salary_range && <Chip label={job.salary_range} size="small" variant="outlined" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Posted: {formatDate(job.date_posted)}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          {(() => {
                            if (!Array.isArray(applications)) {
                              return (
                                <Button
                                  variant="contained"
                                  size="small"
                                  component={Link}
                                  to={`/student/jobs/${job.id}`}
                                >
                                  Apply Now
                                </Button>
                              );
                            }
                            const appliedApp = applications.find(app => app.job && app.job.id === job.id);
                            if (appliedApp) {
                              return (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  component={Link}
                                  to="/student/applications"
                                >
                                  View Application Status
                                </Button>
                              );
                            }
                            return (
                              <Button
                                variant="contained"
                                size="small"
                                component={Link}
                                to={`/student/jobs/${job.id}`}
                              >
                                Apply Now
                              </Button>
                            );
                          })()}
                        </Box>
                      </Box>
                      <IconButton onClick={() => toggleBookmark(job.id, job.is_bookmarked)}>
                        {job.is_bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default JobListings;
