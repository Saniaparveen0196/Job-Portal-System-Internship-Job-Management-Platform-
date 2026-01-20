import React from 'react';
import { Box } from '@mui/material';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageTransition = ({ children }) => {
  return (
    <Box
      sx={{
        animation: `${fadeIn} 0.4s ease-in-out`,
        width: '100%',
      }}
    >
      {children}
    </Box>
  );
};

export default PageTransition;
