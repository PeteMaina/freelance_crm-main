import React from 'react';
import { Box, Typography } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'center',
        alignItems: 'center',
        gap: { xs: 1, sm: 3 },
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        bgcolor: 'transparent',
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, textAlign: 'center' }}>
        © Copyright {currentYear} ACTIVA. All rights reserved.
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500, flexWrap: 'wrap', justifyContent: 'center' }}>
        More info & founder: 
        <Typography
          component="a"
          href="https://mainapeter.netlify.app"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'primary.main',
            textDecoration: 'none',
            fontWeight: 700,
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          Peter Maina
          <OpenInNewRoundedIcon sx={{ fontSize: '1rem', mb: '2px' }} />
        </Typography>
      </Typography>
    </Box>
  );
}
