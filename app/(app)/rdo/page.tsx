// Página de listagem de RDOs

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BoxIcon, BoxiconsProvider } from '@/components/ui/box-icon'
import { NetworkStatusIndicator } from '@/components/ui/network-status'
import { BottomSheet, BottomSheetOption } from '@/components/ui/bottom-sheet'

type RDOStatus = 'draft' | 'signed' | 'approved' | 'rejected'

interface RDO {
  id: string
  number: number
  date: string
  status: RDOStatus
  weather: string
  workforce: number
  syncStatus: 'synced' | 'pending' | 'error'
}

const statusConfig: Record<RDOStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-warning/20 text-warning' },
  signed: { label: 'Assinado', color: 'bg-primary/20 text-primary' },
  approved: { label: 'Aprovado', color: 'bg-success/20 text-success' },
  rejected: { label: 'Rejeitado', color: 'bg-destructive/20 text-destructive' },
}

export default function RDOListPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<RDOStatus | 'all'>('all')
  const [showFilterSheet, setShowFilterSheet] = useState(false)

  // Mock data - em produção viria do banco
  const rdos: RDO[] = [
    { id: '1', number: 46, date: 'Hoje', status: 'draft', weather: 'Ensolarado', workforce: 12, syncStatus: 'pending' },
    { id: '2', number: 45, date: 'Ontem', status: 'signed', weather: 'Nublado', workforce: 10, syncStatus: 'synced' },
    { id: '3', number: 44, date: '02/05/2026', status: 'approved', weather: 'Ensolarado', workforce: 14, syncStatus: 'synced' },
    { id: '4', number: 43, date: '01/05/2026', status: 'approved', weather: 'Parcialmente Nublado', workforce: 11, syncStatus: 'synced' },
    { id: '5', number: 42, date: '30/04/2026', status: 'rejected', weather: 'Chuvoso', workforce: 8, syncStatus: 'synced' },
    { id: '6', number: 41, date: '29/04/2026', status: 'approved', weather: 'Ensolarado', workforce: 15, syncStatus: 'synced' },
    { id: '7', number: 40, date: '28/04/2026', status: 'approved', weather: 'Ensolarado', workforce: 13, syncStatus: 'synced' },
  ]

  const filteredRDOs = filter === 'all' 
    ? rdos 
    : rdos.filter(rdo => rdo.status === filter)

  const stats = {
    total: rdos.length,
    draft: rdos.filter(r => r.status === 'draft').length,
    signed: rdos.filter(r => r.status === 'signed').length,
    approved: rdos.filter(r => r.status === 'approved').length,
    rejected: rdos.filter(r => r.status === 'rejected').length,
  }

  return (
    <BoxiconsProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="pt-safe sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <BoxIcon name="chevron-left" size={24} />
            </button>
            <h1 className="text-lg font-bold text-foreground">Relatórios Diários</h1>
            <NetworkStatusIndicator showLabel={false} />
          </div>
        </header>

        {/* Stats */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={cn(
                'p-3 rounded-xl text-center transition-colors',
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card'
              )}
            >
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs opacity-80">Total</p>
            </button>
            <button
              type="button"
              onClick={() => setFilter('draft')}
              className={cn(
                'p-3 rounded-xl text-center transition-colors',
                filter === 'draft' ? 'bg-warning text-warning-foreground' : 'bg-card'
              )}
            >
              <p className="text-2xl font-bold">{stats.draft}</p>
              <p className="text-xs opacity-80">Rascunho</p>
            </button>
            <button
              type="button"
              onClick={() => setFilter('signed')}
              className={cn(
                'p-3 rounded-xl text-center transition-colors',
                filter === 'signed' ? 'bg-primary text-primary-foreground' : 'bg-card'
              )}
            >
              <p className="text-2xl font-bold">{stats.signed}</p>
              <p className="text-xs opacity-80">Assinado</p>
            </button>
            <button
              type="button"
              onClick={() => setFilter('approved')}
              className={cn(
                'p-3 rounded-xl text-center transition-colors',
                filter === 'approved' ? 'bg-success text-success-foreground' : 'bg-card'
              )}
            >
              <p className="text-2xl font-bold">{stats.approved}</p>
              <p className="text-xs opacity-80">Aprovado</p>
            </button>
          </div>
        </div>

        {/* Filter and actions */}
        <div className="px-6 pb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowFilterSheet(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-sm"
          >
            <BoxIcon name="filter" size={18} />
            {filter === 'all' ? 'Todos' : statusConfig[filter].label}
          </button>
          <button
            type="button"
            onClick={() => router.push('/rdo/new')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
          >
            <BoxIcon name="plus" size={18} />
            Novo RDO
          </button>
        </div>

        {/* RDO List */}
        <main className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="space-y-3">
            {filteredRDOs.map((rdo) => (
              <button
                key={rdo.id}
                type="button"
                onClick={() => router.push(`/rdo/${rdo.number}`)}
                className={cn(
                  'w-full p-4 rounded-xl bg-card',
                  'flex items-center gap-4',
                  'active:scale-98 transition-transform'
                )}
              >
                {/* Número do RDO */}
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">#{rdo.number}</span>
                </div>

                {/* Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground">RDO #{rdo.number}</p>
                    {rdo.syncStatus === 'pending' && (
                      <BoxIcon name="cloud-upload" size={16} className="text-warning" />
                    )}
                    {rdo.syncStatus === 'error' && (
                      <BoxIcon name="error-circle" size={16} className="text-destructive" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{rdo.date}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BoxIcon name="sun" size={14} />
                      {rdo.weather}
                    </span>
                    <span className="flex items-center gap-1">
                      <BoxIcon name="user" size={14} />
                      {rdo.workforce} pessoas
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className="flex flex-col items-end gap-2">
                  <span className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium',
                    statusConfig[rdo.status].color
                  )}>
                    {statusConfig[rdo.status].label}
                  </span>
                  <BoxIcon name="chevron-right" size={20} className="text-muted-foreground" />
                </div>
              </button>
            ))}

            {filteredRDOs.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <BoxIcon name="clipboard" size={32} className="text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground">Nenhum RDO encontrado</p>
                <p className="text-muted-foreground mt-1">
                  {filter !== 'all' 
                    ? `Não há RDOs com status "${statusConfig[filter].label}"`
                    : 'Comece criando um novo RDO'
                  }
                </p>
              </div>
            )}
          </div>
        </main>

        {/* Navigation bar */}
        <nav className="nav-bar">
          <div className="flex items-center justify-around">
            <button 
              className="nav-item"
              onClick={() => router.push('/dashboard')}
            >
              <BoxIcon name="home" size={24} />
              <span className="text-xs">Início</span>
            </button>
            <button className="nav-item-active">
              <BoxIcon name="clipboard" type="solid" size={24} />
              <span className="text-xs">RDOs</span>
            </button>
            <button 
              className="nav-item"
              onClick={() => router.push('/camera')}
            >
              <BoxIcon name="camera" size={24} />
              <span className="text-xs">Câmera</span>
            </button>
            <button 
              className="nav-item"
              onClick={() => router.push('/settings')}
            >
              <BoxIcon name="cog" size={24} />
              <span className="text-xs">Config</span>
            </button>
          </div>
        </nav>

        {/* Filter Bottom Sheet */}
        <BottomSheet
          open={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          title="Filtrar por Status"
        >
          <div className="space-y-3">
            <BottomSheetOption
              label="Todos os RDOs"
              description={`${stats.total} relatórios`}
              icon={<BoxIcon name="list-ul" size={24} />}
              selected={filter === 'all'}
              onClick={() => {
                setFilter('all')
                setShowFilterSheet(false)
              }}
            />
            <BottomSheetOption
              label="Rascunhos"
              description={`${stats.draft} relatórios`}
              icon={<BoxIcon name="edit" size={24} />}
              selected={filter === 'draft'}
              onClick={() => {
                setFilter('draft')
                setShowFilterSheet(false)
              }}
            />
            <BottomSheetOption
              label="Assinados"
              description={`${stats.signed} relatórios`}
              icon={<BoxIcon name="pencil" size={24} />}
              selected={filter === 'signed'}
              onClick={() => {
                setFilter('signed')
                setShowFilterSheet(false)
              }}
            />
            <BottomSheetOption
              label="Aprovados"
              description={`${stats.approved} relatórios`}
              icon={<BoxIcon name="check-circle" size={24} />}
              selected={filter === 'approved'}
              onClick={() => {
                setFilter('approved')
                setShowFilterSheet(false)
              }}
            />
            <BottomSheetOption
              label="Rejeitados"
              description={`${stats.rejected} relatórios`}
              icon={<BoxIcon name="x-circle" size={24} />}
              selected={filter === 'rejected'}
              onClick={() => {
                setFilter('rejected')
                setShowFilterSheet(false)
              }}
            />
          </div>
        </BottomSheet>
      </div>
    </BoxiconsProvider>
  )
}
