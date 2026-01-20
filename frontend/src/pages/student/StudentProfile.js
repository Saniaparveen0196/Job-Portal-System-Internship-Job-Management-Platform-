import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, TextField, Button, Alert } from '@mui/material';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/students/profile/');
      setProfile(response.data);
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
      await api.put('/students/profile/', profile);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      showError('Failed to update profile');
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

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="First Name"
            margin="normal"
            value={profile.first_name || ''}
            onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            required
          />
          <TextField
            fullWidth
            label="Last Name"
            margin="normal"
            value={profile.last_name || ''}
            onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
            required
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
            label="Skills (comma-separated)"
            margin="normal"
            value={profile.skills || ''}
            onChange={(e) => setProfile({ ...profile, skills: e.target.value })}
          />
          <TextField
            fullWidth
            label="Education"
            multiline
            rows={3}
            margin="normal"
            value={profile.education || ''}
            onChange={(e) => setProfile({ ...profile, education: e.target.value })}
          />
          <TextField
            fullWidth
            label="Experience"
            multiline
            rows={3}
            margin="normal"
            value={profile.experience || ''}
            onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
          />
          <TextField
            fullWidth
            label="Bio"
            multiline
            rows={3}
            margin="normal"
            value={profile.bio || ''}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
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

export default StudentProfile;
