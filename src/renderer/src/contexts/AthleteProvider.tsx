import React from 'react'
import useBackend from '@renderer/hooks/useBackend'
import { Calls } from '@renderer/calls/calls'

interface AthleteContextType {
  athlete?: Athlete
  getAthlete(): Promise<Athlete>
}

export const AthleteContext = React.createContext({} as AthleteContextType)
export const useAthlete = (): AthleteContextType => React.useContext(AthleteContext)

export function AthleteProvider({ children }: React.PropsWithChildren): React.ReactNode {
  const athleteCall = useBackend(handleLoadAthlete)

  function handleLoadAthlete(): Promise<Athlete> {
    return Calls.Athlete.loadSelf()
  }

  return children
}
