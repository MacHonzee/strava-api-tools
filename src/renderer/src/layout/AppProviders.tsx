import React from 'react'
import { Box, CssBaseline, Theme } from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { SystemStyleObject } from '@mui/system/styleFunctionSx'
import { BrowserRouter } from 'react-router-dom'
import ErrorBoundary from '../components/ErrorBoundary'
import { csCZ } from '@mui/material/locale'

const mdTheme = createTheme({}, csCZ)

const GlobalCss = (theme: Theme): SystemStyleObject<Theme> => ({
  display: 'flex',
  '& .MuiFormLabel-asterisk': { color: theme.palette.error.main }
})

interface AppProvidersProps {
  children: React.ReactNode
}

function AppProviders({ children }: AppProvidersProps): React.ReactNode {
  return (
    <Box sx={GlobalCss}>
      <CssBaseline />
      <ErrorBoundary>
        <ThemeProvider theme={mdTheme}>
          <BrowserRouter>{children}</BrowserRouter>
        </ThemeProvider>
      </ErrorBoundary>
    </Box>
  )
}

export default AppProviders
