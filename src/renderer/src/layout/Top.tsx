import React from 'react'
import { AppBar, Toolbar, Typography } from '@mui/material'

function Top(): React.ReactNode {
  return (
    <AppBar position={'fixed'} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography variant={'h6'} noWrap component={'div'}>
          Strava Nerd Tools
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

export default Top
