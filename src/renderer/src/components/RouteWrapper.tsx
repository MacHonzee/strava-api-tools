import React from 'react'
import ErrorBoundary from './ErrorBoundary'

function RouteWrapper({ children }: React.PropsWithChildren): React.ReactNode {
  return <ErrorBoundary>{children}</ErrorBoundary>
}

export default RouteWrapper
