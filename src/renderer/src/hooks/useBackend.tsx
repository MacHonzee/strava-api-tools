import { useEffect, useRef, DependencyList, MutableRefObject } from 'react'
import useBackendAction, { BackendActionContext, CallFunction } from './useBackendAction'

type ConditionalCall = boolean | (() => boolean)

function useBackend(
  call: CallFunction,
  dependencies: DependencyList = [],
  conditionalCall?: ConditionalCall
): BackendActionContext {
  const { data, response, feedback, fetch, update } = useBackendAction(call)

  function shouldCallBackend(): boolean {
    if (pendingCall.current) return false

    if (conditionalCall !== undefined) {
      return typeof conditionalCall === 'function' ? conditionalCall() : conditionalCall
    }

    return true
  }

  // Safety handle for React.StrictMode remounting
  const pendingCall: MutableRefObject<boolean> = useRef(false)

  useEffect(() => {
    if (shouldCallBackend()) {
      pendingCall.current = true
      fetch?.().finally(() => {
        pendingCall.current = false
      })
    }
  }, [...dependencies]) // react-hooks/exhaustive-deps handles this dependency array

  return {
    data,
    response,
    feedback,
    update,
    fetch
  }
}

export default useBackend
