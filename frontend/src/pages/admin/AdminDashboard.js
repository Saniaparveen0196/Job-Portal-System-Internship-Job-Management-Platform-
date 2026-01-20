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
  Divider,
  Stack
} from '@mui/material';
import {
  People,
  Work,
  Description,
  TrendingUp,
  CheckCircle,
  Schedule,
  Cancel,
  ArrowForward
} from '@mui/icons-material';
import { FaUserGraduate, FaBriefcase, FaChartBar, FaUsers, FaFileAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard/admin/');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showError('Failed to load dashboard data');
    }
    setLoading(false);
  };

  if (loading) return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  if (!stats) return <LoadingSpinner fullScreen message="No data available" />;

  const userGrowthData = [
    { name: 'Total Users', value: stats.users.total },
    { name: 'Students', value: stats.users.students },
    { name: 'Recruiters', value: stats.users.recruiters },
  ];

  const applicationStatusData = stats.applications.by_status.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
  }));

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      icon: <FaUserGraduate style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
      color: 'primary',
      breakdown: [
        { label: 'Students', value: stats.users.students },
        { label: 'Recruiters', value: stats.users.recruiters },
      ]
    },
    {
      title: 'Total Jobs',
      value: stats.jobs.total,
      icon: <FaBriefcase style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
      color: 'success'
    },
    {
      title: 'Applications',
      value: stats.applications.total,
      icon: <FaChartBar style={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
      color: 'info'
    },
    {
      title: 'Pending Recruiters',
      value: stats.users.pending_recruiters,
      icon: <TrendingUp sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
      color: 'error',
      urgent: stats.users.pending_recruiters > 0,
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
            Admin Dashboard
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Monitor and manage your job portal platform
          </Typography>
        </Box>
      </Box>

      {/* QUICK ACTIONS */}
      <Card sx={{ 
        borderRadius: 3, 
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        mb: 4,
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
              to="/admin/users"
              startIcon={<People />}
              sx={{
                flex: 1,
                minWidth: { xs: '100%', sm: 'auto' },
                py: 1.5,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                '&:hover': {
                  opacity: 0.9,
                }
              }}
            >
              Manage Users
            </Button>
            <Button
              variant="contained"
              component={Link}
              to="/admin/jobs"
              startIcon={<Work />}
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
              Manage Jobs
            </Button>
            <Button
              variant="contained"
              component={Link}
              to="/admin/applications"
              startIcon={<Description />}
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
              Monitor Applications
            </Button>
          </Box>
        </CardContent>
      </Card>

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
                {stat.breakdown && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                    {stat.breakdown.map((item, idx) => (
                      <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography variant="caption" fontWeight={600}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
                <Box sx={{ flexGrow: 1 }} />
                {stat.urgent && stat.value > 0 && (
                  <Button
                    component={Link}
                    to="/admin/users"
                    variant="contained"
                    size="small"
                    endIcon={<ArrowForward />}
                    sx={{ 
                      mt: 2, 
                      width: '100%',
                      background: stat.gradient,
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

      {/* CHARTS SECTION */}
      <Box sx={{ mb: 4, width: '100%', display: 'flex', gap: 3, flexWrap: { xs: 'wrap', lg: 'nowrap' } }}>
        {/* USER DISTRIBUTION CHART */}
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
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    User Distribution
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Breakdown of user types
                  </Typography>
                </Box>
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
                  <FaUsers style={{ fontSize: 20 }} />
                </Box>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userGrowthData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userGrowthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {userGrowthData.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.name}: ${item.value}`}
                    sx={{
                      bgcolor: `${COLORS[index % COLORS.length]}15`,
                      color: COLORS[index % COLORS.length],
                      fontWeight: 600,
                      borderRadius: 1.5,
                      px: 1,
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* APPLICATIONS BY STATUS CHART */}
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
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Applications by Status
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current application statistics
                  </Typography>
                </Box>
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
              
              <Divider sx={{ mb: 3 }} />
              
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={applicationStatusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#cbd5e1"
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                    stroke="#cbd5e1"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[8, 8, 0, 0]}
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {applicationStatusData.map((item, index) => {
                  const icons = {
                    'Applied': <Schedule sx={{ fontSize: 16 }} />,
                    'Accepted': <CheckCircle sx={{ fontSize: 16 }} />,
                    'Rejected': <Cancel sx={{ fontSize: 16 }} />,
                  };
                  return (
                    <Chip
                      key={index}
                      icon={icons[item.name] || <Description sx={{ fontSize: 16 }} />}
                      label={`${item.name}: ${item.value}`}
                      sx={{
                        bgcolor: `${COLORS[index % COLORS.length]}15`,
                        color: COLORS[index % COLORS.length],
                        fontWeight: 600,
                        borderRadius: 1.5,
                        px: 1,
                      }}
                    />
                  );
                })}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
