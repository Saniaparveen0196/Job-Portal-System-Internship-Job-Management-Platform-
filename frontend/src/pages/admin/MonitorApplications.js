import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, TextField, Alert, InputAdornment,
  Tabs, Tab, Tooltip, Button
} from '@mui/material';
import { Search, Description, CheckCircle, Cancel, Schedule } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/helpers';

const MonitorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const { showError } = useToast();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/admin/applications/');
      setApplications(response.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showError('Failed to fetch applications');
    }
    setLoading(false);
  };

  const filteredApplications = applications.filter(app => {
    const search = searchTerm.toLowerCase();
    return (
      app.job?.title?.toLowerCase().includes(search) ||
      app.job?.company_name?.toLowerCase().includes(search) ||
      app.student?.first_name?.toLowerCase().includes(search) ||
      app.student?.last_name?.toLowerCase().includes(search) ||
      app.status?.toLowerCase().includes(search)
    );
  });

  const applicationsByStatus = {
    all: filteredApplications,
    applied: filteredApplications.filter(app => app.status === 'applied'),
    accepted: filteredApplications.filter(app => app.status === 'accepted'),
    rejected: filteredApplications.filter(app => app.status === 'rejected'),
  };

  const getDisplayApplications = () => {
    if (tabValue === 0) return applicationsByStatus.all;
    if (tabValue === 1) return applicationsByStatus.applied;
    if (tabValue === 2) return applicationsByStatus.accepted;
    if (tabValue === 3) return applicationsByStatus.rejected;
    return applicationsByStatus.all;
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading applications..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Monitor Applications
        </Typography>
        <Button variant="outlined" component={Link} to="/admin/dashboard">
          Back to Dashboard
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search applications by job title, company, student name, or status..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab icon={<Description />} iconPosition="start" label={`All (${applicationsByStatus.all.length})`} />
          <Tab icon={<Schedule />} iconPosition="start" label={`Applied (${applicationsByStatus.applied.length})`} />
          <Tab icon={<CheckCircle />} iconPosition="start" label={`Accepted (${applicationsByStatus.accepted.length})`} />
          <Tab icon={<Cancel />} iconPosition="start" label={`Rejected (${applicationsByStatus.rejected.length})`} />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Job Title</strong></TableCell>
              <TableCell><strong>Company</strong></TableCell>
              <TableCell><strong>Applicant</strong></TableCell>
              <TableCell><strong>Applied Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getDisplayApplications().length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">No applications found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              getDisplayApplications().map((app) => (
                <TableRow key={app.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {app.job?.title || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{app.job?.company_name || 'N/A'}</TableCell>
                  <TableCell>
                    {app.student?.first_name} {app.student?.last_name}
                  </TableCell>
                  <TableCell>{formatDate(app.applied_date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={app.status}
                      color={getStatusColor(app.status)}
                      size="small"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Application Details">
                      <Button
                        size="small"
                        component={Link}
                        to={`/admin/applications/${app.id}`}
                        variant="outlined"
                      >
                        View
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default MonitorApplications;
