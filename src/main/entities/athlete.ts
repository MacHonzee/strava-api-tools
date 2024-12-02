import DbFactory from '../utils/db-factory'

class AthleteEntity {
  private db: PouchDB.Database

  constructor() {
    this.db = DbFactory.create('athlete')
  }

  async init(): Promise<void> {
    await this.db.createIndex({
      index: { fields: ['_id'] }
    })
  }

  async get(id: string): Promise<Athlete> {
    return await this.db.get(id)
  }

  async loadSelf(): Promise<Athlete> {
    const athletes = await this.list()
    return athletes[0]
  }

  async list(): Promise<Athlete[]> {
    const res = await this.db.allDocs({ include_docs: true })
    return res.rows.map((row) => row.doc as Athlete).filter((doc) => doc !== undefined)
  }

  async create(data: Athlete): Promise<Athlete> {
    const response = await this.db.post(data)
    return { ...data, _id: response.id, _rev: response.rev } as Athlete
  }

  async update(data: Athlete): Promise<Athlete> {
    const response = await this.db.put(data)
    return { ...data, _rev: response.rev } as Athlete
  }

  async delete(id: string, rev: string): Promise<PouchDB.Core.Response> {
    return await this.db.remove(id, rev)
  }
}

export default new AthleteEntity()
