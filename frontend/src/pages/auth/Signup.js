import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    phone_number: '',
  });
  const [studentData, setStudentData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    skills: '',
    education: '',
    experience: '',
    location: '',
  });
  const [recruiterData, setRecruiterData] = useState({
    company_name: '',
    company_description: '',
    company_website: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const userData = {
      ...formData,
      ...(role === 'student' ? studentData : recruiterData),
    };

    const result = await signup(userData, role);

    if (result.success) {
      const user = result.data.user;
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else if (user.role === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(typeof result.error === 'string' ? result.error : JSON.stringify(result.error));
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            Sign Up
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FormLabel component="legend" sx={{ mt: 2, mb: 1 }}>
              I am a:
            </FormLabel>
            <RadioGroup
              row
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <FormControlLabel value="student" control={<Radio />} label="Student" />
              <FormControlLabel value="recruiter" control={<Radio />} label="Recruiter" />
            </RadioGroup>

            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              margin="normal"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              margin="normal"
              value={formData.password2}
              onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Phone Number"
              margin="normal"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />

            {role === 'student' ? (
              <>
                <TextField
                  fullWidth
                  label="First Name"
                  margin="normal"
                  value={studentData.first_name}
                  onChange={(e) => setStudentData({ ...studentData, first_name: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  margin="normal"
                  value={studentData.last_name}
                  onChange={(e) => setStudentData({ ...studentData, last_name: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Location"
                  margin="normal"
                  value={studentData.location}
                  onChange={(e) => setStudentData({ ...studentData, location: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Skills (comma-separated)"
                  margin="normal"
                  value={studentData.skills}
                  onChange={(e) => setStudentData({ ...studentData, skills: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Education"
                  multiline
                  rows={3}
                  margin="normal"
                  value={studentData.education}
                  onChange={(e) => setStudentData({ ...studentData, education: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Experience"
                  multiline
                  rows={3}
                  margin="normal"
                  value={studentData.experience}
                  onChange={(e) => setStudentData({ ...studentData, experience: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  margin="normal"
                  value={studentData.bio}
                  onChange={(e) => setStudentData({ ...studentData, bio: e.target.value })}
                />
              </>
            ) : (
              <>
                <TextField
                  fullWidth
                  label="Company Name"
                  margin="normal"
                  value={recruiterData.company_name}
                  onChange={(e) => setRecruiterData({ ...recruiterData, company_name: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Company Website"
                  margin="normal"
                  value={recruiterData.company_website}
                  onChange={(e) => setRecruiterData({ ...recruiterData, company_website: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Location"
                  margin="normal"
                  value={recruiterData.location}
                  onChange={(e) => setRecruiterData({ ...recruiterData, location: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Company Description"
                  multiline
                  rows={4}
                  margin="normal"
                  value={recruiterData.company_description}
                  onChange={(e) => setRecruiterData({ ...recruiterData, company_description: e.target.value })}
                />
              </>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>

          <Typography variant="body2" align="center" sx={{ mt: 2 }}>
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Signup;
