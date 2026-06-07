// Estratégia de Sincronização Offline-First
import { db, getPendingSyncItems, markSyncItemComplete, markSyncItemFailed, type SyncQueueItem } from './db'

// ==========================================
// GERENCIADOR DE STATUS DE REDE
// ==========================================

export type NetworkStatus = 'online' | 'offline' | 'syncing'

class NetworkManager {
  private status: NetworkStatus = 'online'
  private listeners: Set<(status: NetworkStatus) => void> = new Set()

  constructor() {
    if (typeof window !== 'undefined') {
      this.status = navigator.onLine ? 'online' : 'offline'
      
      window.addEventListener('online', () => this.setStatus('online'))
      window.addEventListener('offline', () => this.setStatus('offline'))
    }
  }

  getStatus(): NetworkStatus {
    return this.status
  }

  setStatus(status: NetworkStatus): void {
    if (this.status !== status) {
      this.status = status
      this.listeners.forEach(listener => listener(status))
      
      // Iniciar sincronização quando voltar online
      if (status === 'online') {
        this.triggerSync()
      }
    }
  }

  subscribe(listener: (status: NetworkStatus) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private async triggerSync(): Promise<void> {
    if (this.status !== 'online') return
    
    this.setStatus('syncing')
    try {
      await syncPendingItems()
    } finally {
      this.setStatus('online')
    }
  }

  async manualSync(): Promise<void> {
    await this.triggerSync()
  }
}

export const networkManager = new NetworkManager()

// ==========================================
// SINCRONIZAÇÃO DE DADOS
// ==========================================

async function syncPendingItems(): Promise<void> {
  const pendingItems = await getPendingSyncItems()
  
  for (const item of pendingItems) {
    try {
      await syncItem(item)
      if (item.id) {
        await markSyncItemComplete(item.id)
      }
    } catch (error) {
      if (item.id) {
        await markSyncItemFailed(
          item.id, 
          error instanceof Error ? error.message : 'Erro desconhecido'
        )
      }
    }
  }
}

async function syncItem(item: SyncQueueItem): Promise<void> {
  const payload = JSON.parse(item.payload)
  
  switch (item.entityType) {
    case 'rdo':
      await syncRDO(item.action, item.entityId, payload)
      break
    case 'photo':
      await syncPhoto(item.action, item.entityId, payload)
      break
    case 'signature':
      await syncSignature(item.action, item.entityId, payload)
      break
    case 'emergency':
      await syncEmergency(item.action, item.entityId, payload)
      break
  }
}

async function syncRDO(
  action: SyncQueueItem['action'], 
  entityId: string, 
  payload: Record<string, unknown>
): Promise<void> {
  const endpoint = '/api/rdo'
  
  switch (action) {
    case 'create':
      const createRes = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, localId: entityId })
      })
      if (!createRes.ok) throw new Error('Falha ao criar RDO')
      
      // Atualizar ID local com ID do servidor
      const { id: serverId } = await createRes.json()
      await db.rdos.where('localId').equals(entityId).modify({ 
        id: serverId, 
        synced: true 
      })
      break
      
    case 'update':
      const updateRes = await fetch(`${endpoint}/${entityId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!updateRes.ok) throw new Error('Falha ao atualizar RDO')
      await db.rdos.where('id').equals(entityId).modify({ synced: true })
      break
      
    case 'delete':
      const deleteRes = await fetch(`${endpoint}/${entityId}`, { method: 'DELETE' })
      if (!deleteRes.ok) throw new Error('Falha ao deletar RDO')
      break
  }
}

async function syncPhoto(
  action: SyncQueueItem['action'], 
  entityId: string, 
  payload: Record<string, unknown>
): Promise<void> {
  if (action === 'create') {
    const photo = await db.photos.where('localId').equals(entityId).first()
    if (!photo) return
    
    const formData = new FormData()
    formData.append('file', photo.blob, photo.filename)
    formData.append('metadata', JSON.stringify({
      localId: entityId,
      projectId: photo.projectId,
      rdoId: photo.rdoId,
      latitude: photo.latitude,
      longitude: photo.longitude,
      compassBearing: photo.compassBearing,
      timestamp: photo.timestamp,
      category: photo.category,
      description: photo.description,
      hasMarkup: photo.hasMarkup,
      markupData: photo.markupData,
      scannedCode: photo.scannedCode,
      scannedCodeType: photo.scannedCodeType
    }))
    
    const res = await fetch('/api/photos', {
      method: 'POST',
      body: formData
    })
    
    if (!res.ok) throw new Error('Falha ao sincronizar foto')
    
    const { id: serverId } = await res.json()
    await db.photos.where('localId').equals(entityId).modify({ 
      id: serverId, 
      synced: true 
    })
  }
}

async function syncSignature(
  action: SyncQueueItem['action'], 
  entityId: string, 
  payload: Record<string, unknown>
): Promise<void> {
  if (action === 'create') {
    const res = await fetch('/api/signatures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, localId: entityId })
    })
    
    if (!res.ok) throw new Error('Falha ao sincronizar assinatura')
    
    const { id: serverId } = await res.json()
    await db.signatures.where('localId').equals(entityId).modify({ 
      id: serverId, 
      synced: true 
    })
  }
}

async function syncEmergency(
  action: SyncQueueItem['action'], 
  entityId: string, 
  payload: Record<string, unknown>
): Promise<void> {
  if (action === 'create') {
    const res = await fetch('/api/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (!res.ok) throw new Error('Falha ao enviar emergência')
  }
}

// ==========================================
// HOOK PARA USO NO REACT
// ==========================================

export function useNetworkStatus() {
  if (typeof window === 'undefined') {
    return { status: 'online' as NetworkStatus, sync: async () => {} }
  }
  
  return {
    status: networkManager.getStatus(),
    sync: () => networkManager.manualSync()
  }
}
