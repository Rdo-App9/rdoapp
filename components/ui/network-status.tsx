// Indicador de Status de Rede (Online/Offline/Sincronizando)

'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { BoxIcon } from './box-icon'
import { networkManager, type NetworkStatus } from '@/lib/offline/sync'
import { getPendingSyncCount } from '@/lib/offline/db'

interface NetworkStatusIndicatorProps {
  showLabel?: boolean
  className?: string
}

export function NetworkStatusIndicator({ 
  showLabel = true, 
  className 
}: NetworkStatusIndicatorProps) {
  const [status, setStatus] = useState<NetworkStatus>('online')
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    // Status inicial
    setStatus(networkManager.getStatus())
    
    // Subscrever para mudanças
    const unsubscribe = networkManager.subscribe((newStatus) => {
      setStatus(newStatus)
    })

    // Atualizar contagem de pendentes
    const updatePendingCount = async () => {
      const count = await getPendingSyncCount()
      setPendingCount(count)
    }
    
    updatePendingCount()
    const interval = setInterval(updatePendingCount, 5000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const statusConfig = {
    online: {
      icon: 'wifi' as const,
      label: 'Online',
      className: 'bg-success/20 text-success',
      dotClass: 'bg-success'
    },
    offline: {
      icon: 'wifi-off' as const,
      label: 'Offline',
      className: 'bg-destructive/20 text-destructive',
      dotClass: 'bg-destructive'
    },
    syncing: {
      icon: 'sync' as const,
      label: 'Sincronizando...',
      className: 'bg-warning/20 text-warning',
      dotClass: 'bg-warning animate-pulse'
    }
  }

  const config = statusConfig[status]

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
      config.className,
      className
    )}>
      <span className={cn('w-2 h-2 rounded-full', config.dotClass)} />
      <BoxIcon 
        name={config.icon} 
        size={18} 
        className={status === 'syncing' ? 'animate-spin' : ''}
      />
      {showLabel && (
        <span>{config.label}</span>
      )}
      {pendingCount > 0 && status !== 'syncing' && (
        <span className="ml-1 px-2 py-0.5 bg-warning/30 text-warning rounded-full text-xs">
          {pendingCount} pendente{pendingCount > 1 ? 's' : ''}
        </span>
      )}
    </div>
  )
}

// Barra compacta de status para o topo da tela
export function NetworkStatusBar() {
  const [status, setStatus] = useState<NetworkStatus>('online')

  useEffect(() => {
    setStatus(networkManager.getStatus())
    const unsubscribe = networkManager.subscribe(setStatus)
    return unsubscribe
  }, [])

  // Só mostrar quando offline ou sincronizando
  if (status === 'online') return null

  const isOffline = status === 'offline'

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 py-2 px-4',
      'flex items-center justify-center gap-2 text-sm font-medium',
      'pt-safe',
      isOffline ? 'bg-destructive text-destructive-foreground' : 'bg-warning text-warning-foreground'
    )}>
      <BoxIcon 
        name={isOffline ? 'wifi-off' : 'sync'} 
        size={16} 
        className={!isOffline ? 'animate-spin' : ''}
      />
      <span>
        {isOffline ? 'Você está offline' : 'Sincronizando dados...'}
      </span>
    </div>
  )
}
