import React, { useReducer } from 'react'

export type FeedbackState = 'silent' | 'pending' | 'ready' | 'error'

export type CallData = Record<string, unknown>

export type CallResponse = {
  data?: CallData
}

export type CallRequest = {
  data: unknown
}

export type CallFunction = (data?: CallRequest) => Promise<CallResponse>

export type BackendActionContext = {
  feedback: FeedbackState
  response?: CallResponse
  data?: CallData
  update?: React.Dispatch<BackendAction>
  fetch?: (data?: CallRequest) => Promise<void>
}

export type BackendAction =
  | { type: 'silent' | 'pending' }
  | { type: 'ready'; response: CallResponse }
  | { type: 'error'; response: CallResponse | unknown }
  | { type: 'setData'; data: Record<string, unknown> }
  | { type: 'updateData'; data: Record<string, unknown> }

const initialState: BackendActionContext = {
  feedback: 'silent'
}

function reducer(state: BackendActionContext, action: BackendAction): BackendActionContext {
  const { type } = action

  switch (type) {
    case 'silent':
    case 'pending':
      return { feedback: type }

    case 'ready':
      return {
        feedback: type,
        response: action.response,
        data: action.response.data as Record<string, unknown>
      }

    case 'error':
      return {
        feedback: type,
        response: action.response as CallResponse
      }

    case 'setData':
      return { ...state, data: action.data }

    case 'updateData':
      return { ...state, data: { ...state?.data, ...action?.data } }

    default:
      console.error('Unknown dispatch type for useBackendAction reducer', action)
      throw new Error('Unknown dispatch type for useBackendAction reducer, contact administrator.')
  }
}

function useBackendAction(call: CallFunction): BackendActionContext {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetch = async (data?: CallRequest): Promise<void> => {
    dispatch({ type: 'pending' })

    try {
      const result = await call(data)
      dispatch({ type: 'ready', response: result })
    } catch (error) {
      console.error('Error when handling backend action', error)
      dispatch({ type: 'error', response: error })
    }
  }

  return {
    fetch,
    update: dispatch,
    data: state.data,
    response: state.response,
    feedback: state.feedback
  }
}

export default useBackendAction
