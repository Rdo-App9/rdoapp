// Dexie.js - Banco de dados IndexedDB para modo offline
import Dexie, { type Table } from 'dexie'

// ==========================================
// TIPOS PARA DADOS OFFLINE
// ==========================================

export interface OfflineUser {
  id: string
  email: string
  name: string
  role: string
  avatarUrl?: string
}

export interface OfflineProject {
  id: string
  name: string
  address: string
  city: string
  state: string
  latitude?: number
  longitude?: number
  status: string
}

export interface OfflineRDO {
  id: string
  localId: string
  projectId: string
  date: string
  number: number
  status: string
  latitude?: number
  longitude?: number
  weatherCondition?: string
  temperature?: number
  humidity?: number
  workStartTime?: string
  workEndTime?: string
  activities?: string
  observations?: string
  issues?: string
  workforce: OfflineWorkforce[]
  equipmentUsage: OfflineEquipmentUsage[]
  synced: boolean
  createdAt: string
  updatedAt: string
}

export interface OfflineWorkforce {
  id: string
  category: string
  quantity: number
  hoursWorked?: number
  notes?: string
}

export interface OfflineEquipmentUsage {
  id: string
  equipmentId: string
  equipmentName: string
  horimeterStart?: number
  horimeterEnd?: number
  hoursUsed?: number
  operatorName?: string
  notes?: string
}

export interface OfflinePhoto {
  id: string
  localId: string
  projectId: string
  rdoId?: string
  filename: string
  blob: Blob
  thumbnailBlob?: Blob
  latitude?: number
  longitude?: number
  compassBearing?: number
  timestamp: string
  category: string
  description?: string
  hasMarkup: boolean
  markupData?: string
  scannedCode?: string
  scannedCodeType?: string
  synced: boolean
}

export interface OfflineSignature {
  id: string
  localId: string
  rdoId: string
  imageData: string
  signedAt: string
  latitude?: number
  longitude?: number
  synced: boolean
}

export interface OfflineEquipment {
  id: string
  projectId: string
  name: string
  type: string
  serialNumber?: string
  qrCode?: string
  barcode?: string
  status: string
}

export interface SyncQueueItem {
  id?: number
  entityType: 'rdo' | 'photo' | 'signature' | 'emergency'
  entityId: string
  action: 'create' | 'update' | 'delete'
  payload: string
  retryCount: number
  lastError?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  createdAt: string
}

// ==========================================
// CLASSE DO BANCO DE DADOS
// ==========================================

export class ObraDB extends Dexie {
  users!: Table<OfflineUser>
  projects!: Table<OfflineProject>
  rdos!: Table<OfflineRDO>
  photos!: Table<OfflinePhoto>
  signatures!: Table<OfflineSignature>
  equipment!: Table<OfflineEquipment>
  syncQueue!: Table<SyncQueueItem>

  constructor() {
    super('ObraDB')
    
    this.version(1).stores({
      users: 'id, email',
      projects: 'id, status',
      rdos: 'id, localId, projectId, date, status, synced',
      photos: 'id, localId, projectId, rdoId, synced, category',
      signatures: 'id, localId, rdoId, synced',
      equipment: 'id, projectId, qrCode, barcode',
      syncQueue: '++id, entityType, entityId, status, createdAt'
    })
  }
}

export const db = new ObraDB()

// ==========================================
// FUNÇÕES UTILITÁRIAS
// ==========================================

export async function addToSyncQueue(
  entityType: SyncQueueItem['entityType'],
  entityId: string,
  action: SyncQueueItem['action'],
  payload: object
): Promise<void> {
  await db.syncQueue.add({
    entityType,
    entityId,
    action,
    payload: JSON.stringify(payload),
    retryCount: 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  })
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue
    .where('status')
    .anyOf(['pending', 'failed'])
    .and(item => item.retryCount < 5)
    .toArray()
}

export async function markSyncItemComplete(id: number): Promise<void> {
  await db.syncQueue.update(id, { status: 'completed' })
}

export async function markSyncItemFailed(id: number, error: string): Promise<void> {
  const item = await db.syncQueue.get(id)
  if (item) {
    await db.syncQueue.update(id, {
      status: 'failed',
      lastError: error,
      retryCount: item.retryCount + 1
    })
  }
}

export async function getPendingSyncCount(): Promise<number> {
  return db.syncQueue
    .where('status')
    .anyOf(['pending', 'failed'])
    .count()
}

export async function clearCompletedSyncItems(): Promise<void> {
  await db.syncQueue
    .where('status')
    .equals('completed')
    .delete()
}
