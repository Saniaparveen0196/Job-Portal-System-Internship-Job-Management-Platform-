import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Work,
  Description,
  CheckCircle,
  Schedule,
  Cancel,
  ArrowForward,
  People
} from '@mui/icons-material';
import { FaBriefcase, FaChartBar, FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

const RecruiterDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, fetchCurrentUser } = useAuth();
  const { showError } = useToast();

  useEffect(() => {
    fetchDashboardData();

    const handleVisibilityChange = () => {
      if (!document.hidden) fetchDashboardData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/recruiter/');
      setStats(response.data);
      if (response.data.recruiter_profile) await fetchCurrentUser();
    } catch (error) {
      showError('Failed to load dashboard data');
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  if (!stats) return <LoadingSpinner fullScreen message="No data available" />;

  const isApproved =
    user?.recruiter_profile?.is_approved ||
    stats?.recruiter_profile?.is_approved ||
    false;

  // Prepare data for display
  const applicationStatusData = stats.application_by_status?.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
  })) || [];

  const statCards = [
    {
      title: 'Total Jobs',
      value: stats.total_jobs || 0,
      icon: <FaBriefcase style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      color: 'primary'
    },
    {
      title: 'Active Jobs',
      value: stats.active_jobs || 0,
      icon: <Work sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      color: 'success'
    },
    {
      title: 'Applications',
      value: stats.total_applications || 0,
      icon: <FaChartBar style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      color: 'info'
    },
    {
      title: 'Pending Review',
      value: stats.pending_applications || 0,
      icon: <Description sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      color: 'error',
      urgent: (stats.pending_applications || 0) > 0,
    },
  ];

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 5,
        mb: 5,
        bgcolor: '#F8FAFC',
        minHeight: '100vh'
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Recruiter Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Manage your jobs and applications
          </Typography>
        </Box>
        
        {isApproved && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/recruiter/jobs/new"
            sx={{ 
              px: 3, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                opacity: 0.9,
              }
            }}
          >
            Post New Job
          </Button>
        )}
      </Box>

      {/* ALERTS */}
      <Box sx={{ mb: 4 }}>
        {!isApproved ? (
          <Alert
            severity="warning"
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'warning.light',
              mb: 3,
            }}
            action={
              <Button
                component={Link}
                to="/recruiter/profile"
                size="small"
                color="warning"
                sx={{ fontWeight: 600 }}
              >
                Update Profile
              </Button>
            }
          >
            Your account is pending admin approval. Please complete your profile for review.
          </Alert>
        ) : (
          <Alert
            severity="success"
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.light',
              mb: 3,
            }}
          >
            Your account is approved! You can now post jobs and internships.
          </Alert>
        )}

        QUICK ACTIONS
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
          }
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Quick Actions
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              <Button
                variant="contained"
                component={Link}
                to="/recruiter/jobs"
                startIcon={<Work />}
                sx={{
                  flex: 1,
                  minWidth: { xs: '100%', sm: 'auto' },
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    opacity: 0.9,
                  }
                }}
              >
                Manage Jobs
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/recruiter/applications"
                startIcon={<Description />}
                sx={{
                  flex: 1,
                  minWidth: { xs: '100%', sm: 'auto' },
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                  '&:hover': {
                    opacity: 0.9,
                  }
                }}
              >
                View Applications
              </Button>
              <Button
                variant="contained"
                component={Link}
                to="/recruiter/profile"
                startIcon={<People />}
                sx={{
                  flex: 1,
                  minWidth: { xs: '100%', sm: 'auto' },
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  '&:hover': {
                    opacity: 0.9,
                  }
                }}
              >
                Profile Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* STATISTICS CARDS */}
      <Box 
        sx={{ 
          mb: 4, 
          width: '100%',
          display: 'flex',
          gap: 3,
          flexWrap: { xs: 'wrap', md: 'nowrap' },
        }}
      >
        {statCards.map((stat, index) => (
          <Box
            key={index} 
            sx={{ 
              display: 'flex',
              flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 0' },
              minWidth: 0,
              mb: { xs: 2, md: 0 }
            }}
          >
            <Card 
              sx={{ 
                height: '100%', 
                width: '100%',
                flex: '1 1 auto',
                minWidth: 0,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '100%',
                  height: '100%',
                  background: stat.gradient,
                  opacity: 0.05,
                  zIndex: 0,
                }}
              />
              <CardContent sx={{ 
                position: 'relative', 
                zIndex: 1, 
                p: 3, 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column' 
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start', 
                  mb: 2 
                }}>
                  <Box sx={{ 
                    background: stat.gradient,
                    borderRadius: 2.5, 
                    p: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}>
                    {stat.icon}
                  </Box>
                  {stat.urgent && (
                    <Chip 
                      label="Action Required" 
                      color="error" 
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  )}
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
                {stat.urgent && stat.value > 0 && (
                  <Button
                    component={Link}
                    to="/recruiter/applications"
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForward />}
                    sx={{ 
                      mt: 2, 
                      width: '100%',
                      background: stat.gradient,
                      flexShrink: 0,
                      '&:hover': {
                        background: stat.gradient,
                        opacity: 0.9,
                      }
                    }}
                  >
                    Review Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* DATA VISUALIZATION SECTION */}
      <Box sx={{ mb: 4, width: '100%', display: 'flex', gap: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        {/* LEFT DATA CARD - Applications by Status */}
        <Box sx={{ display: 'flex', flex: { xs: '1 1 100%', lg: '1 1 0' }, minWidth: 0, mb: { xs: 3, lg: 0 } }}>
          <Card sx={{ 
            borderRadius: 3, 
            width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Applications by Status
                </Typography>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  borderRadius: 2, 
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  width: 40,
                  height: 40,
                }}>
                  <FaFileAlt style={{ fontSize: 20 }} />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {applicationStatusData.length > 0 ? (
                  applicationStatusData.map((item, index) => {
                    const icons = {
                      'Applied': <Schedule sx={{ fontSize: 20 }} />,
                      'Accepted': <CheckCircle sx={{ fontSize: 20 }} />,
                      'Rejected': <Cancel sx={{ fontSize: 20 }} />,
                      'Pending': <Schedule sx={{ fontSize: 20 }} />,
                      'Reviewed': <CheckCircle sx={{ fontSize: 20 }} />,
                    };
                    
                    const gradients = [
                      'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                      'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                      'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                      'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                      'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                    ];

                    return (
                      <Paper
                        key={index}
                        sx={{
                          p: 2.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          transition: '0.2s',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ 
                              background: gradients[index % gradients.length],
                              borderRadius: 2, 
                              p: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                            }}>
                              {icons[item.name] || <Description sx={{ fontSize: 20 }} />}
                            </Box>
                            <Box>
                              <Typography sx={{ fontWeight: 600 }}>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Applications
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {item.value}
                          </Typography>
                        </Box>
                      </Paper>
                    );
                  })
                ) : (
                  <Box sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2
                  }}>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      No application data available.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* RIGHT DATA CARD - Job Status */}
        <Box sx={{ display: 'flex', flex: { xs: '1 1 100%', lg: '1 1 0' }, minWidth: 0 }}>
          <Card sx={{ 
            borderRadius: 3, 
            width: '100%',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
            }
          }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  Job Status
                </Typography>
                <Box sx={{ 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  borderRadius: 2, 
                  p: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  width: 40,
                  height: 40,
                }}>
                  <FaBriefcase style={{ fontSize: 20 }} />
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: '0.2s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        borderRadius: 2, 
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}>
                        <CheckCircle sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          Active Jobs
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Currently active job postings
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.active_jobs || 0}
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: '0.2s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                        borderRadius: 2, 
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}>
                        <Description sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          Total Jobs
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          All job postings
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {stats.total_jobs || 0}
                    </Typography>
                  </Box>
                </Paper>

                <Paper
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: '0.2s',
                    '&:hover': {
                      transform: 'translateX(4px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ 
                        background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                        borderRadius: 2, 
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                      }}>
                        <Cancel sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 600 }}>
                          Inactive Jobs
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Closed or expired jobs
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {(stats.total_jobs || 0) - (stats.active_jobs || 0)}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* RECENT APPLICATIONS */}
      <Box sx={{ mb: 4 }}>
        <Card sx={{ 
          borderRadius: 3, 
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
          }
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600 }}>
                Recent Applications
              </Typography>
              <Button 
                variant="outlined" 
                component={Link} 
                to="/recruiter/applications"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                View All
              </Button>
            </Box>

            {stats.recent_applications?.length ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {stats.recent_applications.map((app) => (
                  <Paper
                    key={app.id}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: '0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                        transform: 'translateX(4px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography
                          component={Link}
                          to={`/recruiter/applications/${app.id}`}
                          sx={{
                            textDecoration: 'none',
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            '&:hover': {
                              textDecoration: 'underline',
                            }
                          }}
                        >
                          {app.job?.title || 'Job Title'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {app.student?.first_name} {app.student?.last_name} • 
                          Applied on {formatDate(app.applied_date)}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                          <Chip
                            label={app.status}
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              borderRadius: 1.5,
                              px: 1,
                              backgroundColor: 
                                app.status === 'accepted' ? 'success.main' :
                                app.status === 'rejected' ? 'error.main' :
                                'warning.main',
                              color: 'white',
                            }}
                          />
                        </Box>
                      </Box>
                      <Button
                        component={Link}
                        to={`/recruiter/applications/${app.id}`}
                        size="small"
                        variant="contained"
                        sx={{
                          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                          '&:hover': {
                            opacity: 0.9,
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Box sx={{ 
                textAlign: 'center', 
                py: 6,
                border: '2px dashed',
                borderColor: 'divider',
                borderRadius: 2
              }}>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  No applications yet.
                </Typography>
                <Button
                  variant="contained"
                  component={Link}
                  to="/recruiter/jobs"
                  startIcon={<AddIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                      opacity: 0.9,
                    }
                  }}
                >
                  Post a Job
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default RecruiterDashboard;


