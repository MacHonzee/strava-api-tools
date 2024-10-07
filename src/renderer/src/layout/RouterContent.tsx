import React from 'react'
import { Box, Container, Toolbar } from '@mui/material'
import Routes from './Routes'

function RouterContent(): React.ReactNode {
  return (
    <Box
      component="main"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        p: 3,
        height: '100vh',
        minHeight: '100vh',
        overflow: 'auto',
        '@media print': { overflow: 'visible !important' }
      }}
    >
      <Toolbar sx={{ displayPrint: 'none' }} />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1, '@media print': { mt: 0, pb: 2 } }}>
        <Routes />
      </Container>
    </Box>
  )
}

export default RouterContent
