import React from 'react';
import { Container, Typography, Box, Button, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Work as WorkIcon, 
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  TrendingUp as TrendingIcon 
} from '@mui/icons-material';

const Home = () => {
  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box
        sx={{
          mt: { xs: 4, md: 8 },
          mb: 6,
          textAlign: 'center',
          py: { xs: 6, md: 10 },
          background: 'linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%)',
          borderRadius: 4,
          px: { xs: 2, sm: 3 },
          boxShadow: 2,
        }}
      >
        <WorkIcon sx={{ 
          fontSize: { xs: 60, md: 80 }, 
          color: 'primary.main', 
          mb: 2,
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.05)' },
            '100%': { transform: 'scale(1)' },
          }
        }} />
        
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' },
            fontWeight: 700,
            lineHeight: 1.2,
            mb: 2
          }}
        >
          Welcome to Job Portal
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{ 
            mb: 4, 
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            maxWidth: '700px',
            mx: 'auto'
          }}
        >
          Find your dream job or the perfect candidate with our powerful platform
        </Typography>
        
        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          gap: 2, 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/jobs"
            sx={{
              px: 4,
              py: 1.5,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 4,
              }
            }}
          >
            Browse Jobs
          </Button>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/signup"
            sx={{
              px: 4,
              py: 1.5,
              transition: 'all 0.3s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 2,
                borderWidth: 2,
              }
            }}
          >
            Get Started
          </Button>
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ mb: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 600,
            mb: 4
          }}
        >
          Why Choose Our Platform
        </Typography>
        
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <BusinessIcon 
                sx={{ 
                  fontSize: 50, 
                  color: 'primary.main', 
                  mb: 2,
                  backgroundColor: 'primary.light',
                  borderRadius: '50%',
                  p: 1
                }} 
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                1000+ Jobs
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Available positions across various industries
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <LocationIcon 
                sx={{ 
                  fontSize: 50, 
                  color: 'primary.main', 
                  mb: 2,
                  backgroundColor: 'primary.light',
                  borderRadius: '50%',
                  p: 1
                }} 
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Remote Options
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Work from anywhere with flexible opportunities
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <TrendingIcon 
                sx={{ 
                  fontSize: 50, 
                  color: 'primary.main', 
                  mb: 2,
                  backgroundColor: 'primary.light',
                  borderRadius: '50%',
                  p: 1
                }} 
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Fast Growing
              </Typography>
              <Typography variant="body1" color="text.secondary">
                New opportunities added daily
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <WorkIcon 
                sx={{ 
                  fontSize: 50, 
                  color: 'primary.main', 
                  mb: 2,
                  backgroundColor: 'primary.light',
                  borderRadius: '50%',
                  p: 1
                }} 
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                Trusted Companies
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Top employers from various sectors
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mt: 6, 
        mb: 4, 
        py: 6,
        backgroundColor: 'primary.light',
        borderRadius: 4,
        px: 3
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Ready to Start Your Journey?
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
          Join thousands of professionals who found their dream jobs through our platform
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          to="/signup"
          sx={{
            px: 6,
            py: 1.5,
            fontSize: '1.1rem',
            backgroundColor: 'primary.dark',
            '&:hover': {
              backgroundColor: 'primary.main',
              transform: 'translateY(-2px)',
              boxShadow: 4,
            },
            transition: 'all 0.3s'
          }}
        >
          Create Free Account
        </Button>
      </Box>

      {/* Footer Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mt: 6, 
        py: 3, 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2
      }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?
        </Typography>
        <Button 
          component={Link} 
          to="/login" 
          variant="text"
          sx={{
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline'
            }
          }}
        >
          Sign In
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mx: 2 }}>
          •
        </Typography>
        <Button 
          component={Link} 
          to="/employers" 
          variant="text"
          sx={{
            color: 'primary.main',
            '&:hover': {
              backgroundColor: 'transparent',
              textDecoration: 'underline'
            }
          }}
        >
          For Employers
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
