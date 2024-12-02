import { ipcMain } from 'electron'
import AthleteEntity from '../entities/athlete'

function declareAthleteHandles(): void {
  ipcMain.handle('athlete-get', async (_, id) => await AthleteEntity.get(id))
  ipcMain.handle('athlete-list', async () => await AthleteEntity.list())
  ipcMain.handle('athlete-create', async (_, data) => await AthleteEntity.create(data))
  ipcMain.handle('athlete-update', async (_, data) => await AthleteEntity.update(data))
  ipcMain.handle('athlete-delete', async (_, id, rev) => await AthleteEntity.delete(id, rev))
}

export function declareEntityHandles(): void {
  declareAthleteHandles()
}
