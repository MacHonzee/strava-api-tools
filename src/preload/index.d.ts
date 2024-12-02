import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      Athlete: {
        get: (id: string) => Promise<Athlete>
        loadSelf: () => Promise<Athlete>
        list: () => Promise<Athlete[]>
        create: (data: Partial<Athlete>) => Promise<Athlete>
        update: (data: Athlete) => Promise<Athlete>
        delete: (id: string, rev: string) => Promise<void>
      }
    }
  }

  interface Athlete {
    _id: string
    _rev: string
    username: string
    resource_state: number
    firstname: string
    lastname: string
    bio: string
    city: string
    state: string
    country: string
    sex: 'M' | 'F'
    premium: boolean
    summit: boolean
    created_at: Date
    updated_at: Date
    badge_type_id: number
    weight: number
    profile_medium: string
    profile: string
    friend: unknown
    follower: unknown
  }
}
