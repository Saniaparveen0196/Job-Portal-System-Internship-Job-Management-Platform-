import React, { useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Box, TextField, Button, Chip, Pagination } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDate, getJobTypeLabel } from '../../utils/helpers';

const PublicJobListings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    job_type: '',
    location: '',
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchJobs();
  }, [page, search, filters]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        ...(search && { search }),
        ...(filters.job_type && { job_type: filters.job_type }),
        ...(filters.location && { location: filters.location }),
      };
      const response = await api.get('/jobs/', { params });
      setJobs(response.data.results || response.data);
      if (response.data.count) {
        setTotalPages(Math.ceil(response.data.count / 10));
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Job Listings
      </Typography>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="Search jobs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, company, or keywords..."
        />
        <TextField
          select
          label="Job Type"
          value={filters.job_type}
          onChange={(e) => setFilters({ ...filters, job_type: e.target.value })}
          SelectProps={{ native: true }}
          sx={{ minWidth: 150 }}
        >
          <option value="">All Types</option>
          <option value="internship">Internship</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </TextField>
        <TextField
          label="Location"
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
          placeholder="City, State"
        />
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <>
          <Grid container spacing={3}>
            {jobs.map((job) => (
              <Grid item xs={12} md={6} key={job.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component={Link} to={`/jobs/${job.id}`} sx={{ textDecoration: 'none', color: 'primary.main' }}>
                      {job.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {job.company_name}
                    </Typography>
                    <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip label={getJobTypeLabel(job.job_type)} size="small" />
                      <Chip label={job.location} size="small" variant="outlined" />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Posted: {formatDate(job.date_posted)}
                    </Typography>
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

export default PublicJobListings;
