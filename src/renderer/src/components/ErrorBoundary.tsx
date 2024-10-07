import React, { ErrorInfo, ReactNode } from 'react'
import ErrorBox from './ErrorBox'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorBox error={this.state.error} />
    }

    return this.props.children
  }
}

export default ErrorBoundary
