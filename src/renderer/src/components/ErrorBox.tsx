import React, { useState, ForwardedRef } from 'react'
import { Alert, AlertTitle, IconButton, Collapse, Paper, SxProps, Theme } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

interface ErrorBoxProps {
  error?: {
    message: React.ReactNode
    code?: string
    params?: Record<string, unknown>
    response?: {
      data?: unknown
      status?: number
    }
    trace?: React.ReactNode
    stack?: React.ReactNode
  }
  userError?: {
    title?: React.ReactNode
    message: React.ReactNode
  }
  sx?: SxProps<Theme>
}

const ErrorBox = React.forwardRef(function ErrorBox(
  props: ErrorBoxProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [open, setOpen] = useState(false)

  function getAlertAction(): React.ReactNode {
    if (!props.error) return null

    return (
      <IconButton size="large" onClick={() => setOpen(!open)}>
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </IconButton>
    )
  }

  function getErrorDetail(): React.ReactNode {
    if (!props.error) return null

    const { message, code, params, response } = props.error
    return (
      <Collapse in={open}>
        <Paper sx={{ mt: 4, p: 2 }}>
          {message}
          <pre style={{ width: '100%', maxWidth: '75vw' }}>
            {JSON.stringify({ message, code, params, response: response?.data }, null, 2)}
          </pre>
          <pre style={{ width: '100%', maxWidth: '75vw' }}>
            {props.error.trace || props.error.stack}
          </pre>
        </Paper>
      </Collapse>
    )
  }

  function getErrorTitle(): React.ReactNode {
    if (props.userError) {
      return <AlertTitle>{props.userError.title}</AlertTitle>
    } else if (props.error?.response?.status === 403) {
      return <AlertTitle>Nedostatečné oprávnění</AlertTitle>
    } else {
      return <AlertTitle>Neočekávaná chyba</AlertTitle>
    }
  }

  function getErrorMessage(): React.ReactNode {
    if (props.userError) {
      return props.userError.message
    } else if (props.error?.response?.status === 403) {
      return 'K požadované funkčnosti nemáte dostatečné oprávnění.'
    } else {
      return 'Při běhu aplikace nastala neočekávaná chyba.'
    }
  }

  return (
    <Alert
      ref={ref}
      sx={{ width: '100%', ...props.sx }}
      severity={'error'}
      action={getAlertAction()}
    >
      {getErrorTitle()}
      {getErrorMessage()}
      {getErrorDetail()}
    </Alert>
  )
})

ErrorBox.displayName = 'ErrorBox'

export default ErrorBox
