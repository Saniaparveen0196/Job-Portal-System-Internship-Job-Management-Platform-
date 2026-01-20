import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Person as PersonIcon,
  ExitToApp as LogoutIcon,
  Add as AddIcon,
  Message as MessageIcon,
} from '@mui/icons-material';
import { FaBriefcase, FaUserGraduate, FaChartBar, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout, isStudent, isRecruiter, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  // Check if recruiter is approved
  const isRecruiterApproved = isRecruiter && (user?.recruiter_profile?.is_approved || false);
  
  // Check current route
  const isLoginPage = location.pathname === '/login' || location.pathname === '/signup';
  const isRecruiterPage = location.pathname.startsWith('/recruiter');
  const isAdminPage = location.pathname.startsWith('/admin');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  const getDashboardPath = () => {
    if (isStudent) return '/student/dashboard';
    if (isRecruiter) return '/recruiter/dashboard';
    if (isAdmin) return '/admin/dashboard';
    return '/';
  };

  const getProfilePath = () => {
    if (isStudent) return '/student/profile';
    if (isRecruiter) return '/recruiter/profile';
    if (isAdmin) return '/admin/dashboard';
    return '/';
  };

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar sx={{ py: 1.5, px: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
          <FaBriefcase style={{ marginRight: 12, fontSize: 28 }} />
          <Typography 
            variant="h5" 
            component={Link} 
            to="/" 
            sx={{ 
              fontWeight: 700,
              textDecoration: 'none', 
              color: 'inherit',
              letterSpacing: '-0.02em',
            }}
          >
            JobPortal
          </Typography>
        </Box>
        
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, justifyContent: 'flex-end' }}>
            {/* Recruiter pages - only Dashboard and Messages */}
            {isRecruiterPage ? (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/recruiter/dashboard"
                  startIcon={<DashboardIcon />}
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Dashboard
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/recruiter/messages"
                  startIcon={<MessageIcon />}
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Messages
                </Button>
              </>
            ) : isAdminPage ? (
              /* Admin pages - only Dashboard */
              <Button 
                color="inherit" 
                component={Link} 
                to="/admin/dashboard"
                startIcon={<DashboardIcon />}
                sx={{ 
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                }}
              >
                Dashboard
              </Button>
            ) : (
              /* Other pages - show all options */
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/jobs"
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Browse Jobs
                </Button>
                {isRecruiterApproved && (
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to="/recruiter/jobs/new"
                    startIcon={<AddIcon />}
                    variant="outlined"
                    sx={{ 
                      borderColor: 'rgba(255, 255, 255, 0.5)', 
                      fontWeight: 600,
                      '&:hover': { 
                        borderColor: 'white', 
                        bgcolor: 'rgba(255,255,255,0.15)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    Post Job
                  </Button>
                )}
                <Button 
                  color="inherit" 
                  component={Link} 
                  to={getDashboardPath()}
                  startIcon={<DashboardIcon />}
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Dashboard
                </Button>
                {(isStudent || isRecruiter) && (
                  <Button 
                    color="inherit" 
                    component={Link} 
                    to={isStudent ? '/student/messages' : '/recruiter/messages'}
                    startIcon={<MessageIcon />}
                    sx={{ 
                      fontWeight: 500,
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                    }}
                  >
                    Messages
                  </Button>
                )}
              </>
            )}
            <Button
              color="inherit"
              onClick={handleMenuOpen}
              startIcon={<PersonIcon />}
              sx={{ 
                fontWeight: 600,
                ml: 1,
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
              }}
            >
              {user.username}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem 
                component={Link} 
                to={getProfilePath()} 
                onClick={handleMenuClose}
                sx={{ py: 1.5, px: 2 }}
              >
                <PersonIcon sx={{ mr: 1.5, fontSize: 20 }} />
                Profile
              </MenuItem>
              {isRecruiter && (
                <MenuItem 
                  component={Link} 
                  to="/recruiter/jobs" 
                  onClick={handleMenuClose}
                  sx={{ py: 1.5, px: 2 }}
                >
                  <Box component="span" sx={{ mr: 1.5, display: 'flex', alignItems: 'center' }}>
                    <FaBriefcase style={{ fontSize: 20 }} />
                  </Box>
                  My Jobs
                </MenuItem>
              )}
              {isRecruiterApproved && (
                <MenuItem 
                  component={Link} 
                  to="/recruiter/jobs/new" 
                  onClick={handleMenuClose}
                  sx={{ py: 1.5, px: 2 }}
                >
                  <AddIcon sx={{ mr: 1.5, fontSize: 20 }} />
                  Post Job
                </MenuItem>
              )}
              <MenuItem 
                onClick={handleLogout}
                sx={{ py: 1.5, px: 2, color: 'error.main' }}
              >
                <LogoutIcon sx={{ mr: 1.5, fontSize: 20 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Login/Signup pages - only show Login and Sign Up */}
            {isLoginPage ? (
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  component={Link} 
                  to="/signup"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              /* Other public pages - show all options */
              <>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/jobs"
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Browse Jobs
                </Button>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  Login
                </Button>
                <Button 
                  variant="contained"
                  component={Link} 
                  to="/signup"
                  sx={{ 
                    fontWeight: 600,
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': { 
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
