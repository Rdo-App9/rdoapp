// Página de Detalhes do RDO

'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { BoxIcon, BoxiconsProvider } from '@/components/ui/box-icon'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/ui/bottom-sheet'

type RDOStatus = 'draft' | 'pending' | 'signed' | 'approved'

interface MaoDeObra {
  funcao: string
  quantidade: number
}

interface Ocorrencia {
  id: string
  tipo: 'normal' | 'atencao' | 'critico'
  descricao: string
  hora: string
}

interface RDOData {
  number: string
  date: string
  status: RDOStatus
  weather: {
    manha: string
    tarde: string
  }
  maoDeObra: MaoDeObra[]
  atividades: string
  ocorrencias: Ocorrencia[]
  fotos: string[]
  assinatura?: string
  responsavel: string
}

const statusConfig: Record<RDOStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Rascunho', color: 'text-muted-foreground', bg: 'bg-muted' },
  pending: { label: 'Pendente', color: 'text-warning', bg: 'bg-warning/20' },
  signed: { label: 'Assinado', color: 'text-info', bg: 'bg-info/20' },
  approved: { label: 'Aprovado', color: 'text-success', bg: 'bg-success/20' },
}

const weatherIcons: Record<string, string> = {
  'Sol': 'bx-sun',
  'Nublado': 'bx-cloud',
  'Chuva': 'bx-cloud-rain',
  'Parcial': 'bx-cloud-lightning',
}

export default function RDODetailPage() {
  const router = useRouter()
  const params = useParams()
  const rdoNumber = params.number as string
  
  const [showActionsSheet, setShowActionsSheet] = useState(false)
  const [activeTab, setActiveTab] = useState<'resumo' | 'mao-de-obra' | 'ocorrencias' | 'fotos'>('resumo')

  // Mock RDO data
  const rdo: RDOData = {
    number: rdoNumber,
    date: '15/01/2024',
    status: 'signed',
    weather: {
      manha: 'Sol',
      tarde: 'Parcial'
    },
    maoDeObra: [
      { funcao: 'Pedreiro', quantidade: 8 },
      { funcao: 'Servente', quantidade: 12 },
      { funcao: 'Carpinteiro', quantidade: 4 },
      { funcao: 'Armador', quantidade: 6 },
      { funcao: 'Eletricista', quantidade: 2 },
      { funcao: 'Encanador', quantidade: 2 },
    ],
    atividades: 'Concretagem do 3º pavimento tipo concluída. Início da montagem das formas do 4º pavimento. Instalações elétricas do 2º pavimento em andamento. Execução de contrapiso na área comum do térreo.',
    ocorrencias: [
      { id: '1', tipo: 'normal', descricao: 'Entrega de aço para armação recebida às 08:30', hora: '08:30' },
      { id: '2', tipo: 'atencao', descricao: 'Atraso de 1h no início da concretagem por falta de caminhão betoneira', hora: '10:00' },
      { id: '3', tipo: 'normal', descricao: 'Visita técnica do engenheiro estrutural para verificação das formas', hora: '14:00' },
    ],
    fotos: ['foto1.jpg', 'foto2.jpg', 'foto3.jpg', 'foto4.jpg'],
    assinatura: 'assinado',
    responsavel: 'João Silva'
  }

  const totalEfetivo = rdo.maoDeObra.reduce((acc, item) => acc + item.quantidade, 0)
  const status = statusConfig[rdo.status]

  const tabs = [
    { id: 'resumo', label: 'Resumo', icon: 'bx-list-ul' },
    { id: 'mao-de-obra', label: 'Efetivo', icon: 'bx-hard-hat' },
    { id: 'ocorrencias', label: 'Ocorrências', icon: 'bx-error-circle' },
    { id: 'fotos', label: 'Fotos', icon: 'bx-image' },
  ] as const

  return (
    <BoxiconsProvider>
      <div className="min-h-screen bg-background pb-24">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
          <div className="safe-area-top" />
          <div className="flex items-center justify-between px-6 h-16">
            <button 
              onClick={() => router.back()}
              className="w-11 h-11 rounded-xl bg-card flex items-center justify-center active:scale-95 transition-transform"
            >
              <BoxIcon name="bx-chevron-left" className="text-2xl text-foreground" />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-semibold text-foreground">RDO #{rdo.number}</h1>
              <p className="text-xs text-muted-foreground">{rdo.date}</p>
            </div>
            <button 
              onClick={() => setShowActionsSheet(true)}
              className="w-11 h-11 rounded-xl bg-card flex items-center justify-center active:scale-95 transition-transform"
            >
              <BoxIcon name="bx-dots-vertical-rounded" className="text-2xl text-foreground" />
            </button>
          </div>
        </header>

        {/* Status Card */}
        <div className="px-6 py-4">
          <div className="bg-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("px-3 py-1.5 rounded-full text-sm font-medium", status.bg, status.color)}>
                {status.label}
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <BoxIcon name={weatherIcons[rdo.weather.manha] || 'bx-sun'} className="text-lg" />
                  <span>Manhã</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BoxIcon name={weatherIcons[rdo.weather.tarde] || 'bx-cloud'} className="text-lg" />
                  <span>Tarde</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{totalEfetivo}</p>
                <p className="text-xs text-muted-foreground">Efetivo</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{rdo.ocorrencias.length}</p>
                <p className="text-xs text-muted-foreground">Ocorrências</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{rdo.fotos.length}</p>
                <p className="text-xs text-muted-foreground">Fotos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 mb-4">
          <div className="bg-card rounded-2xl p-1.5 flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors",
                  activeTab === tab.id 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground active:bg-muted"
                )}
              >
                <BoxIcon name={tab.icon} className="text-lg" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-6">
          {activeTab === 'resumo' && (
            <div className="space-y-4">
              <div className="bg-card rounded-2xl p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Atividades Executadas</h3>
                <p className="text-foreground leading-relaxed">{rdo.atividades}</p>
              </div>
              <div className="bg-card rounded-2xl p-5">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Responsável</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <BoxIcon name="bx-user" className="text-xl text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{rdo.responsavel}</p>
                    <p className="text-xs text-muted-foreground">Engenheiro de Obra</p>
                  </div>
                  {rdo.assinatura && (
                    <div className="ml-auto flex items-center gap-1.5 text-success">
                      <BoxIcon name="bx-check-circle" className="text-lg" />
                      <span className="text-sm">Assinado</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mao-de-obra' && (
            <div className="bg-card rounded-2xl overflow-hidden">
              {rdo.maoDeObra.map((item, index) => (
                <div 
                  key={item.funcao}
                  className={cn(
                    "flex items-center justify-between px-5 py-4",
                    index !== rdo.maoDeObra.length - 1 && "border-b border-border/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <BoxIcon name="bx-hard-hat" className="text-xl text-foreground" />
                    </div>
                    <span className="font-medium text-foreground">{item.funcao}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-foreground">{item.quantidade}</span>
                    <span className="text-sm text-muted-foreground">pessoas</span>
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-4 bg-primary/10">
                <span className="font-semibold text-foreground">Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-primary">{totalEfetivo}</span>
                  <span className="text-sm text-muted-foreground">pessoas</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ocorrencias' && (
            <div className="space-y-3">
              {rdo.ocorrencias.length === 0 ? (
                <div className="bg-card rounded-2xl p-8 text-center">
                  <BoxIcon name="bx-check-circle" className="text-4xl text-success mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma ocorrência registrada</p>
                </div>
              ) : (
                rdo.ocorrencias.map((ocorrencia) => (
                  <div key={ocorrencia.id} className="bg-card rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                        ocorrencia.tipo === 'critico' && "bg-destructive/20",
                        ocorrencia.tipo === 'atencao' && "bg-warning/20",
                        ocorrencia.tipo === 'normal' && "bg-muted"
                      )}>
                        <BoxIcon 
                          name={
                            ocorrencia.tipo === 'critico' ? 'bx-error' :
                            ocorrencia.tipo === 'atencao' ? 'bx-error-circle' : 'bx-info-circle'
                          } 
                          className={cn(
                            "text-xl",
                            ocorrencia.tipo === 'critico' && "text-destructive",
                            ocorrencia.tipo === 'atencao' && "text-warning",
                            ocorrencia.tipo === 'normal' && "text-muted-foreground"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground leading-relaxed">{ocorrencia.descricao}</p>
                        <p className="text-xs text-muted-foreground mt-2">{ocorrencia.hora}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'fotos' && (
            <div className="grid grid-cols-2 gap-3">
              {rdo.fotos.length === 0 ? (
                <div className="col-span-2 bg-card rounded-2xl p-8 text-center">
                  <BoxIcon name="bx-image" className="text-4xl text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Nenhuma foto registrada</p>
                </div>
              ) : (
                rdo.fotos.map((foto, index) => (
                  <div 
                    key={index}
                    className="aspect-square bg-card rounded-2xl flex items-center justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50" />
                    <BoxIcon name="bx-image" className="text-4xl text-muted-foreground" />
                    <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded-lg">
                      <span className="text-xs text-white">{index + 1}/{rdo.fotos.length}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation */}
        <nav className="nav-bar">
          <div className="flex items-center justify-around">
            <button onClick={() => router.push('/dashboard')} className="nav-item">
              <BoxIcon name="bx-home" className="text-2xl" />
              <span className="text-xs">Início</span>
            </button>
            <button onClick={() => router.push('/rdo')} className="nav-item-active">
              <BoxIcon name="bxs-file" className="text-2xl" />
              <span className="text-xs">RDOs</span>
            </button>
            <button onClick={() => router.push('/camera')} className="nav-item">
              <BoxIcon name="bx-camera" className="text-2xl" />
              <span className="text-xs">Câmera</span>
            </button>
            <button onClick={() => router.push('/settings')} className="nav-item">
              <BoxIcon name="bx-cog" className="text-2xl" />
              <span className="text-xs">Config</span>
            </button>
          </div>
        </nav>

        {/* Actions Sheet */}
        <BottomSheet
          isOpen={showActionsSheet}
          onClose={() => setShowActionsSheet(false)}
          title="Ações"
        >
          <div className="space-y-2">
            <button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl active:bg-muted transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <BoxIcon name="bx-edit" className="text-xl text-foreground" />
              </div>
              <span className="font-medium text-foreground">Editar RDO</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl active:bg-muted transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <BoxIcon name="bx-copy" className="text-xl text-foreground" />
              </div>
              <span className="font-medium text-foreground">Duplicar</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl active:bg-muted transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <BoxIcon name="bx-download" className="text-xl text-foreground" />
              </div>
              <span className="font-medium text-foreground">Exportar PDF</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl active:bg-muted transition-colors">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                <BoxIcon name="bx-share-alt" className="text-xl text-foreground" />
              </div>
              <span className="font-medium text-foreground">Compartilhar</span>
            </button>
            <button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl active:bg-muted transition-colors">
              <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                <BoxIcon name="bx-trash" className="text-xl text-destructive" />
              </div>
              <span className="font-medium text-destructive">Excluir</span>
            </button>
          </div>
        </BottomSheet>
      </div>
    </BoxiconsProvider>
  )
}
