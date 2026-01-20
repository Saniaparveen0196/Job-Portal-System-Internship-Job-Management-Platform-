import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Chip, IconButton, TextField, 
  Tabs, Tab, Alert, Tooltip, InputAdornment
} from '@mui/material';
import { CheckCircle, Cancel, Delete, Search, Person, Business, PersonAdd, Block } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [recruiters, setRecruiters] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToBlock, setUserToBlock] = useState(null);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchRecruiters();
    fetchStudents();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  };

  const fetchRecruiters = async () => {
    try {
      const response = await api.get('/admin/users/?role=recruiter');
      setRecruiters(response.data);
    } catch (error) {
      console.error('Error fetching recruiters:', error);
      setError('Failed to fetch recruiters');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get('/admin/users/?role=student');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
    }
  };

  const handleApprove = async (recruiterId) => {
    try {
      await api.put(`/admin/recruiters/${recruiterId}/approve/`);
      showSuccess('Recruiter approved successfully!');
      fetchRecruiters();
      fetchUsers();
    } catch (error) {
      console.error('Error approving recruiter:', error);
      showError(error.response?.data?.error || 'Failed to approve recruiter');
    }
  };

  const handleBlockClick = (recruiterId) => {
    setUserToBlock(recruiterId);
    setBlockDialogOpen(true);
  };

  const handleBlockConfirm = async () => {
    if (!userToBlock) return;
    
    try {
      await api.put(`/admin/recruiters/${userToBlock}/block/`);
      showSuccess('Recruiter blocked successfully!');
      fetchRecruiters();
      fetchUsers();
      setUserToBlock(null);
    } catch (error) {
      console.error('Error blocking recruiter:', error);
      showError(error.response?.data?.error || 'Failed to block recruiter');
    }
  };

  const handleDeleteClick = (userId, username) => {
    setUserToDelete({ id: userId, username });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/admin/users/${userToDelete.id}/delete/`);
      showSuccess('User deleted successfully!');
      fetchUsers();
      fetchRecruiters();
      fetchStudents();
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      showError(error.response?.data?.error || 'Failed to delete user');
    }
  };

  const filteredRecruiters = recruiters.filter(recruiter => {
    const search = searchTerm.toLowerCase();
    return (
      recruiter.username?.toLowerCase().includes(search) ||
      recruiter.email?.toLowerCase().includes(search)
    );
  });

  const filteredStudents = students.filter(student => {
    const search = searchTerm.toLowerCase();
    return (
      student.username?.toLowerCase().includes(search) ||
      student.email?.toLowerCase().includes(search)
    );
  });

  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    );
  });

  if (loading) return <LoadingSpinner fullScreen message="Loading users..." />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage Users
        </Typography>
        <Button variant="outlined" component={Link} to="/admin/dashboard">
          Back to Dashboard
        </Button>
      </Box>


      <TextField
        fullWidth
        placeholder="Search users by username, email, or role..."
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
          <Tab icon={<PersonAdd />} iconPosition="start" label={`All Users (${filteredUsers.length})`} />
          <Tab icon={<Business />} iconPosition="start" label={`Recruiters (${filteredRecruiters.length})`} />
          <Tab icon={<Person />} iconPosition="start" label={`Students (${filteredStudents.length})`} />
        </Tabs>
      </Paper>

      {/* All Users Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Joined</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role} 
                        size="small" 
                        color={user.role === 'admin' ? 'error' : user.role === 'recruiter' ? 'primary' : 'default'}
                      />
                    </TableCell>
                    <TableCell>{formatDate(user.date_joined)}</TableCell>
                    <TableCell>
                      <Tooltip title="Delete User">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(user.id, user.username)}
                            disabled={user.role === 'admin' || user.is_staff}
                          >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Recruiters Tab */}
      {tabValue === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecruiters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">No recruiters found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecruiters.map((user) => {
                  const recruiterProfile = user.recruiter_profile || {};
                  const isApproved = recruiterProfile.is_approved || false;
                  const recruiterId = recruiterProfile.id;
                  
                  return (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone_number || 'N/A'}</TableCell>
                      <TableCell>
                        <Chip
                          label={isApproved ? 'Approved' : 'Pending'}
                          color={isApproved ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {!isApproved ? (
                          <>
                            <Tooltip title="Approve Recruiter">
                              <IconButton
                                color="success"
                                size="small"
                                onClick={() => handleApprove(recruiterId)}
                              >
                                <CheckCircle />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Block Recruiter">
                              <IconButton
                                color="error"
                                size="small"
                                onClick={() => handleBlockClick(recruiterId)}
                              >
                                <Cancel />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : (
                          <Tooltip title="Block Recruiter">
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => handleBlockClick(recruiterId)}
                            >
                              <Block />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete User">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(user.id, user.username)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Students Tab */}
      {tabValue === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Username</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Phone</strong></TableCell>
                <TableCell><strong>Joined</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">No students found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone_number || 'N/A'}</TableCell>
                    <TableCell>{formatDate(user.date_joined)}</TableCell>
                    <TableCell>
                      <Tooltip title="Delete User">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteClick(user.id, user.username)}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete User"
        message={userToDelete ? `Are you sure you want to delete user "${userToDelete.username}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
      />

      <ConfirmDialog
        open={blockDialogOpen}
        onClose={() => {
          setBlockDialogOpen(false);
          setUserToBlock(null);
        }}
        onConfirm={handleBlockConfirm}
        title="Block Recruiter"
        message="Are you sure you want to block this recruiter? They will not be able to post jobs."
        confirmText="Block"
        cancelText="Cancel"
        severity="warning"
      />
    </Container>
  );
};

export default ManageUsers;
