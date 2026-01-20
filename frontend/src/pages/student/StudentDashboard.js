import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty, Add as AddIcon } from '@mui/icons-material';
import { FaBriefcase } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, getStatusColor } from '../../utils/helpers';

const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/student/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  if (!stats) return <LoadingSpinner fullScreen message="No data available" />;

  const statCards = [
    {
      title: 'Total Applications',
      value: stats.total_applications,
      icon: <FaBriefcase style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      color: 'primary'
    },
    {
      title: 'Accepted',
      value: stats.status_summary.accepted,
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      color: 'success'
    },
    {
      title: 'Pending Review',
      value: stats.status_summary.applied,
      icon: <HourglassEmpty sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      color: 'info'
    },
    {
      title: 'Rejected',
      value: stats.status_summary.rejected,
      icon: <Cancel sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      color: 'error'
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
            Welcome to your dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Track your job applications and career progress
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/student/jobs"
          startIcon={<AddIcon />}
          size="large"
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
          Browse Jobs
        </Button>
      </Box>

      {/* STATISTICS CARDS - Updated to match AdminDashboard style */}
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
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
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
                to="/student/applications"
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
                          to={`/student/jobs/${app.job.id}`}
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
                          {app.job.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {app.job.company_name} • Applied {formatDate(app.applied_date)}
                        </Typography>
                      </Box>
                      <Chip
                        label={app.status}
                        color={getStatusColor(app.status)}
                        sx={{ 
                          fontWeight: 600,
                          borderRadius: 1.5,
                          px: 1,
                        }}
                      />
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
                  to="/student/jobs"
                  startIcon={<AddIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                      opacity: 0.9,
                    }
                  }}
                >
                  Start Applying
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default StudentDashboard;

