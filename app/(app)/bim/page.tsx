// Página de Integração BIM 4D - Visualização e controle de elementos

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { BoxIcon, BoxiconsProvider } from '@/components/ui/box-icon'
import { BottomSheet, BottomSheetOption } from '@/components/ui/bottom-sheet'
import { NetworkStatusIndicator } from '@/components/ui/network-status'

type BIMElementStatus = 'planned' | 'in_progress' | 'completed' | 'delayed' | 'blocked'
type ViewMode = 'list' | 'timeline'

interface BIMElement {
  id: string
  guid: string
  name: string
  type: string
  level: string
  status: BIMElementStatus
  progress: number
  plannedStart: string
  plannedEnd: string
  actualStart?: string
  actualEnd?: string
}

const statusConfig: Record<BIMElementStatus, { label: string; color: string; bgColor: string }> = {
  planned: { label: 'Planejado', color: 'text-muted-foreground', bgColor: 'bg-muted/50' },
  in_progress: { label: 'Em Execução', color: 'text-warning', bgColor: 'bg-warning/20' },
  completed: { label: 'Concluído', color: 'text-success', bgColor: 'bg-success/20' },
  delayed: { label: 'Atrasado', color: 'text-destructive', bgColor: 'bg-destructive/20' },
  blocked: { label: 'Bloqueado', color: 'text-destructive', bgColor: 'bg-destructive/20' },
}

const elementTypes = [
  { value: 'all', label: 'Todos' },
  { value: 'wall', label: 'Paredes' },
  { value: 'slab', label: 'Lajes' },
  { value: 'column', label: 'Pilares' },
  { value: 'beam', label: 'Vigas' },
  { value: 'foundation', label: 'Fundação' },
  { value: 'installation', label: 'Instalações' },
]

const levels = [
  { value: 'all', label: 'Todos os Níveis' },
  { value: 'foundation', label: 'Fundação' },
  { value: 'ground', label: 'Térreo' },
  { value: '1st', label: '1º Pavimento' },
  { value: '2nd', label: '2º Pavimento' },
  { value: '3rd', label: '3º Pavimento' },
  { value: 'roof', label: 'Cobertura' },
]

// Mock data
const mockElements: BIMElement[] = [
  {
    id: '1',
    guid: '2O2Fr$t4X7Zf8NOew3FL9T',
    name: 'Pilar P1',
    type: 'column',
    level: 'ground',
    status: 'completed',
    progress: 100,
    plannedStart: '2026-04-01',
    plannedEnd: '2026-04-05',
    actualStart: '2026-04-01',
    actualEnd: '2026-04-04',
  },
  {
    id: '2',
    guid: '2O2Fr$t4X7Zf8NOew3FL9U',
    name: 'Pilar P2',
    type: 'column',
    level: 'ground',
    status: 'completed',
    progress: 100,
    plannedStart: '2026-04-01',
    plannedEnd: '2026-04-05',
    actualStart: '2026-04-02',
    actualEnd: '2026-04-05',
  },
  {
    id: '3',
    guid: '2O2Fr$t4X7Zf8NOew3FL9V',
    name: 'Viga V1',
    type: 'beam',
    level: 'ground',
    status: 'in_progress',
    progress: 60,
    plannedStart: '2026-04-06',
    plannedEnd: '2026-04-10',
    actualStart: '2026-04-06',
  },
  {
    id: '4',
    guid: '2O2Fr$t4X7Zf8NOew3FL9W',
    name: 'Laje L1',
    type: 'slab',
    level: '1st',
    status: 'planned',
    progress: 0,
    plannedStart: '2026-04-11',
    plannedEnd: '2026-04-15',
  },
  {
    id: '5',
    guid: '2O2Fr$t4X7Zf8NOew3FL9X',
    name: 'Parede PAR-01',
    type: 'wall',
    level: 'ground',
    status: 'delayed',
    progress: 30,
    plannedStart: '2026-04-03',
    plannedEnd: '2026-04-08',
    actualStart: '2026-04-05',
  },
  {
    id: '6',
    guid: '2O2Fr$t4X7Zf8NOew3FL9Y',
    name: 'Instalação Elétrica - Térreo',
    type: 'installation',
    level: 'ground',
    status: 'blocked',
    progress: 0,
    plannedStart: '2026-04-12',
    plannedEnd: '2026-04-20',
  },
]

export default function BIMPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedElement, setSelectedElement] = useState<BIMElement | null>(null)
  const [showFilterSheet, setShowFilterSheet] = useState(false)
  const [showStatusSheet, setShowStatusSheet] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterStatus, setFilterStatus] = useState<BIMElementStatus | 'all'>('all')

  // Filtrar elementos
  const filteredElements = mockElements.filter(el => {
    if (filterType !== 'all' && el.type !== filterType) return false
    if (filterLevel !== 'all' && el.level !== filterLevel) return false
    if (filterStatus !== 'all' && el.status !== filterStatus) return false
    return true
  })

  // Calcular estatísticas
  const stats = {
    total: mockElements.length,
    completed: mockElements.filter(e => e.status === 'completed').length,
    inProgress: mockElements.filter(e => e.status === 'in_progress').length,
    delayed: mockElements.filter(e => e.status === 'delayed').length,
  }

  const overallProgress = Math.round(
    mockElements.reduce((sum, e) => sum + e.progress, 0) / mockElements.length
  )

  // Atualizar status do elemento
  const updateElementStatus = async (status: BIMElementStatus) => {
    if (!selectedElement) return

    console.log('[v0] Updating element status:', {
      guid: selectedElement.guid,
      newStatus: status
    })

    // Aqui enviaria atualização BCF para o servidor
    setShowStatusSheet(false)
    setSelectedElement(null)
  }

  // Marcar como concluído
  const markAsCompleted = async (element: BIMElement) => {
    console.log('[v0] Marking as completed:', element.guid)
    // Aqui enviaria atualização BCF
  }

  return (
    <BoxiconsProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="pt-safe sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border">
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"
            >
              <BoxIcon name="chevron-left" size={24} />
            </button>
            <h1 className="text-lg font-bold text-foreground">BIM 4D</h1>
            <NetworkStatusIndicator showLabel={false} />
          </div>

          {/* Stats bar */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between bg-card rounded-xl p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Progresso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Concluídos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">Em Execução</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-destructive">{stats.delayed}</p>
                <p className="text-xs text-muted-foreground">Atrasados</p>
              </div>
            </div>
          </div>

          {/* View mode and filter */}
          <div className="px-6 pb-4 flex items-center justify-between">
            <div className="flex bg-secondary rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                <BoxIcon name="menu" size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  viewMode === 'timeline' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                )}
              >
                <BoxIcon name="calendar" size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilterSheet(true)}
              className={cn(
                'px-4 py-2 rounded-xl flex items-center gap-2',
                'bg-secondary text-secondary-foreground',
                'active:scale-95 transition-transform'
              )}
            >
              <BoxIcon name="filter" size={18} />
              <span className="text-sm font-medium">Filtros</span>
              {(filterType !== 'all' || filterLevel !== 'all' || filterStatus !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-6 pb-24 overflow-y-auto">
          {viewMode === 'list' ? (
            <div className="space-y-3 py-4">
              {filteredElements.length === 0 ? (
                <div className="text-center py-12">
                  <BoxIcon name="cube" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhum elemento encontrado</p>
                </div>
              ) : (
                filteredElements.map((element) => (
                  <button
                    key={element.id}
                    type="button"
                    onClick={() => setSelectedElement(element)}
                    className={cn(
                      'w-full p-4 rounded-xl bg-card text-left',
                      'active:scale-98 transition-transform'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-lg flex items-center justify-center',
                          statusConfig[element.status].bgColor
                        )}>
                          <BoxIcon 
                            name="cube" 
                            size={20} 
                            className={statusConfig[element.status].color}
                          />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{element.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {levels.find(l => l.value === element.level)?.label} • GUID: {element.guid.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        statusConfig[element.status].bgColor,
                        statusConfig[element.status].color
                      )}>
                        {statusConfig[element.status].label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{element.progress}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            'h-full rounded-full transition-all',
                            element.status === 'completed' ? 'bg-success' :
                            element.status === 'delayed' ? 'bg-destructive' :
                            element.status === 'in_progress' ? 'bg-warning' :
                            'bg-muted-foreground'
                          )}
                          style={{ width: `${element.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick complete button */}
                    {element.status === 'in_progress' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsCompleted(element)
                        }}
                        className={cn(
                          'mt-4 w-full min-h-[48px] rounded-xl',
                          'bg-success/20 text-success',
                          'font-medium flex items-center justify-center gap-2',
                          'active:scale-98 transition-transform'
                        )}
                      >
                        <BoxIcon name="check-circle" size={20} />
                        Marcar como Concluído
                      </button>
                    )}
                  </button>
                ))
              )}
            </div>
          ) : (
            // Timeline view
            <div className="py-4">
              <div className="space-y-4">
                {/* Timeline header */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="w-20">Elemento</span>
                  <div className="flex-1 flex items-center justify-between px-2">
                    <span>Abr 01</span>
                    <span>Abr 08</span>
                    <span>Abr 15</span>
                    <span>Abr 22</span>
                  </div>
                </div>

                {/* Timeline items */}
                {filteredElements.map((element) => (
                  <div key={element.id} className="flex items-center gap-4">
                    <span className="w-20 text-sm font-medium truncate">{element.name}</span>
                    <div className="flex-1 h-8 bg-secondary rounded-lg relative">
                      {/* Planned bar */}
                      <div 
                        className="absolute h-full bg-muted rounded-lg opacity-50"
                        style={{ 
                          left: '10%',
                          width: '30%'
                        }}
                      />
                      {/* Actual bar */}
                      <div 
                        className={cn(
                          'absolute h-full rounded-lg',
                          element.status === 'completed' ? 'bg-success' :
                          element.status === 'delayed' ? 'bg-destructive' :
                          element.status === 'in_progress' ? 'bg-warning' :
                          'bg-muted-foreground'
                        )}
                        style={{ 
                          left: '10%',
                          width: `${element.progress * 0.3}%`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
            <button 
              className="nav-item"
              onClick={() => router.push('/rdo')}
            >
              <BoxIcon name="clipboard" size={24} />
              <span className="text-xs">RDOs</span>
            </button>
            <button className="nav-item-active">
              <BoxIcon name="cube" type="solid" size={24} />
              <span className="text-xs">BIM</span>
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

        {/* Filter sheet */}
        <BottomSheet
          open={showFilterSheet}
          onClose={() => setShowFilterSheet(false)}
          title="Filtros"
        >
          <div className="space-y-6">
            {/* Type filter */}
            <div>
              <h3 className="text-base font-medium mb-3">Tipo de Elemento</h3>
              <div className="flex flex-wrap gap-2">
                {elementTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFilterType(type.value)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium',
                      'transition-colors',
                      filterType === type.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Level filter */}
            <div>
              <h3 className="text-base font-medium mb-3">Nível</h3>
              <div className="flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setFilterLevel(level.value)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium',
                      'transition-colors',
                      filterLevel === level.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            <div>
              <h3 className="text-base font-medium mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium',
                    'transition-colors',
                    filterStatus === 'all'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                >
                  Todos
                </button>
                {Object.entries(statusConfig).map(([value, config]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilterStatus(value as BIMElementStatus)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium',
                      'transition-colors',
                      filterStatus === value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    )}
                  >
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear filters */}
            <button
              type="button"
              onClick={() => {
                setFilterType('all')
                setFilterLevel('all')
                setFilterStatus('all')
              }}
              className={cn(
                'w-full min-h-[56px] rounded-xl',
                'bg-secondary text-secondary-foreground',
                'font-medium',
                'active:scale-98 transition-transform'
              )}
            >
              Limpar Filtros
            </button>
          </div>
        </BottomSheet>

        {/* Element detail sheet */}
        <BottomSheet
          open={selectedElement !== null && !showStatusSheet}
          onClose={() => setSelectedElement(null)}
          title={selectedElement?.name || ''}
        >
          {selectedElement && (
            <div className="space-y-6">
              {/* Status badge */}
              <div className="flex items-center justify-center">
                <span className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium',
                  statusConfig[selectedElement.status].bgColor,
                  statusConfig[selectedElement.status].color
                )}>
                  {statusConfig[selectedElement.status].label}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">GUID</span>
                  <span className="font-mono text-xs">{selectedElement.guid}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">
                    {elementTypes.find(t => t.value === selectedElement.type)?.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Nível</span>
                  <span className="font-medium">
                    {levels.find(l => l.value === selectedElement.level)?.label}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Início Planejado</span>
                  <span className="font-medium">
                    {new Date(selectedElement.plannedStart).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Fim Planejado</span>
                  <span className="font-medium">
                    {new Date(selectedElement.plannedEnd).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{selectedElement.progress}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all',
                    selectedElement.status === 'completed' ? 'bg-success' :
                    selectedElement.status === 'delayed' ? 'bg-destructive' :
                    selectedElement.status === 'in_progress' ? 'bg-warning' :
                    'bg-muted-foreground'
                  )}
                  style={{ width: `${selectedElement.progress}%` }}
                />
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setShowStatusSheet(true)}
                  className={cn(
                    'w-full min-h-[56px] rounded-xl',
                    'bg-primary text-primary-foreground',
                    'font-medium flex items-center justify-center gap-2',
                    'active:scale-98 transition-transform'
                  )}
                >
                  <BoxIcon name="edit" size={20} />
                  Atualizar Status
                </button>

                {selectedElement.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={() => {
                      markAsCompleted(selectedElement)
                      setSelectedElement(null)
                    }}
                    className={cn(
                      'w-full min-h-[56px] rounded-xl',
                      'bg-success text-success-foreground',
                      'font-medium flex items-center justify-center gap-2',
                      'active:scale-98 transition-transform'
                    )}
                  >
                    <BoxIcon name="check-circle" size={20} />
                    Marcar como Concluído
                  </button>
                )}
              </div>
            </div>
          )}
        </BottomSheet>

        {/* Status update sheet */}
        <BottomSheet
          open={showStatusSheet}
          onClose={() => setShowStatusSheet(false)}
          title="Atualizar Status"
        >
          <div className="space-y-3">
            {Object.entries(statusConfig).map(([value, config]) => (
              <BottomSheetOption
                key={value}
                label={config.label}
                selected={selectedElement?.status === value}
                onClick={() => updateElementStatus(value as BIMElementStatus)}
              />
            ))}
          </div>
        </BottomSheet>
      </div>
    </BoxiconsProvider>
  )
}
