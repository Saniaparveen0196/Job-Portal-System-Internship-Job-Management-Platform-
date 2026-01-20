import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, Grid, IconButton } from '@mui/material';
import { Bookmark } from '@mui/icons-material';
import { FaBriefcase, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getJobTypeLabel } from '../../utils/helpers';

const BookmarkedJobs = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/bookmarks/');
      setBookmarks(response.data);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      showError('Failed to load bookmarked jobs');
    }
    setLoading(false);
  };

  const removeBookmark = async (bookmarkId) => {
    try {
      await api.delete(`/bookmarks/${bookmarkId}/`);
      showSuccess('Bookmark removed');
      fetchBookmarks();
    } catch (error) {
      console.error('Error removing bookmark:', error);
      showError('Failed to remove bookmark');
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading bookmarked jobs..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bookmarked Jobs
      </Typography>

      {bookmarks.length === 0 ? (
        <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No bookmarked jobs yet
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {bookmarks.map((bookmark) => (
            <Grid item xs={12} key={bookmark.id}>
              <Card sx={{ transition: 'all 0.3s ease' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component={Link} to={`/student/jobs/${bookmark.job.id}`} sx={{ textDecoration: 'none', color: 'primary.main', mb: 0.5, display: 'block' }}>
                        {bookmark.job.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FaBriefcase style={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="subtitle1" color="text.secondary">
                          {bookmark.job.company_name}
                        </Typography>
                        <Box sx={{ mx: 0.5 }}>•</Box>
                        <FaMapMarkerAlt style={{ fontSize: 16, color: '#64748b' }} />
                        <Typography variant="subtitle1" color="text.secondary">
                          {bookmark.job.location}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Bookmarked: {formatDate(bookmark.created_at)}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => removeBookmark(bookmark.id)}>
                      <Bookmark color="primary" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default BookmarkedJobs;
