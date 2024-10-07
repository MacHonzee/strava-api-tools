import React from 'react'
import AppProviders from './layout/AppProviders'
import Top from './layout/Top'
import LeftMenu from './layout/LeftMenu'
import RouterContent from './layout/RouterContent'

function App(): React.ReactNode {
  return (
    <AppProviders>
      <Top />
      <LeftMenu />
      <RouterContent />
    </AppProviders>
  )
}

export default App
