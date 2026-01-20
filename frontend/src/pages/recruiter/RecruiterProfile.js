import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, TextField, Button, Alert, Chip, Box } from '@mui/material';
import { CheckCircle, Pending } from '@mui/icons-material';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const RecruiterProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { fetchCurrentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchProfile();
    // Set up interval to check for approval status updates every 30 seconds
    const interval = setInterval(() => {
      fetchProfile();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/recruiters/profile/');
      setProfile(response.data);
      // Also refresh user context to update approval status
      await fetchCurrentUser();
    } catch (error) {
      console.error('Error fetching profile:', error);
      showError('Failed to load profile');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      await api.put('/recruiters/profile/', profile);
      showSuccess('Profile updated successfully!');
      // Refresh profile to get latest data
      await fetchProfile();
    } catch (error) {
      showError(error.response?.data?.error || 'Failed to update profile');
    }
    setSaving(false);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading profile..." />;
  if (!profile) return <LoadingSpinner fullScreen message="Profile not found" />;

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Profile
      </Typography>

      <Paper sx={{ p: 4 }}>

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6">Account Status:</Typography>
          {profile.is_approved ? (
            <Chip
              icon={<CheckCircle />}
              label="Approved"
              color="success"
              variant="outlined"
            />
          ) : (
            <Chip
              icon={<Pending />}
              label="Pending Approval"
              color="warning"
              variant="outlined"
            />
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={fetchProfile}
            sx={{ ml: 'auto' }}
          >
            Refresh Status
          </Button>
        </Box>

        {!profile.is_approved && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Your account is pending approval. You cannot post jobs until approved by an admin.
            Click "Refresh Status" to check for updates.
          </Alert>
        )}

        {profile.is_approved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Your account has been approved! You can now post jobs.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Company Name"
            margin="normal"
            value={profile.company_name || ''}
            onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Company Website"
            margin="normal"
            value={profile.company_website || ''}
            onChange={(e) => setProfile({ ...profile, company_website: e.target.value })}
          />
          <TextField
            fullWidth
            label="Location"
            margin="normal"
            value={profile.location || ''}
            onChange={(e) => setProfile({ ...profile, location: e.target.value })}
          />
          <TextField
            fullWidth
            label="Company Description"
            multiline
            rows={6}
            margin="normal"
            value={profile.company_description || ''}
            onChange={(e) => setProfile({ ...profile, company_description: e.target.value })}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 3 }}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default RecruiterProfile;
