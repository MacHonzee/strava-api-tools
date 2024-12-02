import PouchDB from 'pouchdb'
import PouchDbFind from 'pouchdb-find'
import { app } from 'electron'
import path from 'node:path'

PouchDB.plugin(PouchDbFind)

class DbFactory {
  dbMap = new Map<string, PouchDB.Database>()

  create(dbName: string): PouchDB.Database {
    if (this.dbMap.has(dbName)) {
      return this.dbMap.get(dbName) as PouchDB.Database
    }

    const dbPath = path.join(app.getPath('userData'), 'pouchdb', dbName.toLowerCase())
    const db = new PouchDB(dbPath, { adapter: 'leveldb' })
    this.dbMap.set(dbName, db)
    return db
  }
}

export default new DbFactory()
