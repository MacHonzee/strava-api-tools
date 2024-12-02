export const Calls = {
  Athlete: {
    create(data: Partial<Athlete>): Promise<Athlete> {
      return window.api.Athlete.create(data)
    },

    delete(id: string, rev: string): Promise<void> {
      return window.api.Athlete.delete(id, rev)
    },

    get(id: string): Promise<Athlete> {
      return window.api.Athlete.get(id)
    },

    loadSelf(): Promise<Athlete> {
      return window.api.Athlete.loadSelf()
    },

    list(): Promise<Athlete[]> {
      return window.api.Athlete.list()
    }
  }
}
