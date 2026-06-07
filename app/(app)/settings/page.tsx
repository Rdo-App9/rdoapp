// Página de Configurações

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BoxIcon, BoxiconsProvider } from '@/components/ui/box-icon'
import { cn } from '@/lib/utils'
import { BottomSheet } from '@/components/ui/bottom-sheet'

interface SettingItem {
  icon: string
  label: string
  value?: string
  action?: () => void
  danger?: boolean
}

interface SettingSection {
  title: string
  items: SettingItem[]
}

export default function SettingsPage() {
  const router = useRouter()
  const [showLogoutSheet, setShowLogoutSheet] = useState(false)
  const [showClearCacheSheet, setShowClearCacheSheet] = useState(false)
  
  // Mock user data
  const user = {
    name: 'João Silva',
    email: 'joao.silva@construtech.com.br',
    role: 'Engenheiro de Obra',
    avatar: null
  }
  
  const currentProject = {
    name: 'Edifício Aurora',
    code: 'PRJ-2024-001'
  }

  const sections: SettingSection[] = [
    {
      title: 'Conta',
      items: [
        { icon: 'bx-user', label: 'Perfil', value: user.name, action: () => {} },
        { icon: 'bx-envelope', label: 'E-mail', value: user.email },
        { icon: 'bx-id-card', label: 'Função', value: user.role },
      ]
    },
    {
      title: 'Projeto',
      items: [
        { icon: 'bx-building', label: 'Obra Atual', value: currentProject.name, action: () => router.push('/login') },
        { icon: 'bx-hash', label: 'Código', value: currentProject.code },
      ]
    },
    {
      title: 'Aplicativo',
      items: [
        { icon: 'bx-bell', label: 'Notificações', action: () => {} },
        { icon: 'bx-cloud-download', label: 'Dados Offline', value: '128 MB', action: () => {} },
        { icon: 'bx-sync', label: 'Sincronização', value: 'Automática', action: () => {} },
        { icon: 'bx-trash', label: 'Limpar Cache', action: () => setShowClearCacheSheet(true), danger: true },
      ]
    },
    {
      title: 'Suporte',
      items: [
        { icon: 'bx-help-circle', label: 'Central de Ajuda', action: () => {} },
        { icon: 'bx-bug', label: 'Reportar Problema', action: () => {} },
        { icon: 'bx-info-circle', label: 'Versão', value: '1.0.0' },
      ]
    },
  ]

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
            <h1 className="text-xl font-semibold text-foreground">Configurações</h1>
            <div className="w-11" />
          </div>
        </header>

        {/* Profile Card */}
        <div className="px-6 py-6">
          <div className="bg-card rounded-2xl p-6 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <BoxIcon name="bx-user" className="text-3xl text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-foreground truncate">{user.name}</h2>
              <p className="text-sm text-muted-foreground truncate">{user.role}</p>
              <p className="text-xs text-muted-foreground truncate mt-1">{currentProject.name}</p>
            </div>
            <button className="w-11 h-11 rounded-xl bg-background flex items-center justify-center active:scale-95 transition-transform">
              <BoxIcon name="bx-edit" className="text-xl text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="px-6 space-y-6">
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                {section.title}
              </h3>
              <div className="bg-card rounded-2xl overflow-hidden">
                {section.items.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    disabled={!item.action}
                    className={cn(
                      "w-full flex items-center gap-4 px-5 py-4 transition-colors",
                      item.action && "active:bg-muted/50",
                      index !== section.items.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      item.danger ? "bg-destructive/20" : "bg-muted"
                    )}>
                      <BoxIcon 
                        name={item.icon} 
                        className={cn(
                          "text-xl",
                          item.danger ? "text-destructive" : "text-foreground"
                        )} 
                      />
                    </div>
                    <span className={cn(
                      "flex-1 text-left font-medium",
                      item.danger ? "text-destructive" : "text-foreground"
                    )}>
                      {item.label}
                    </span>
                    {item.value && (
                      <span className="text-sm text-muted-foreground">{item.value}</span>
                    )}
                    {item.action && (
                      <BoxIcon name="bx-chevron-right" className="text-xl text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutSheet(true)}
            className="w-full bg-card rounded-2xl px-5 py-4 flex items-center gap-4 active:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
              <BoxIcon name="bx-log-out" className="text-xl text-destructive" />
            </div>
            <span className="flex-1 text-left font-medium text-destructive">Sair da Conta</span>
            <BoxIcon name="bx-chevron-right" className="text-xl text-muted-foreground" />
          </button>
        </div>

        {/* Bottom Navigation */}
        <nav className="nav-bar">
          <div className="flex items-center justify-around">
            <button onClick={() => router.push('/dashboard')} className="nav-item">
              <BoxIcon name="bx-home" className="text-2xl" />
              <span className="text-xs">Início</span>
            </button>
            <button onClick={() => router.push('/rdo')} className="nav-item">
              <BoxIcon name="bx-file" className="text-2xl" />
              <span className="text-xs">RDOs</span>
            </button>
            <button onClick={() => router.push('/camera')} className="nav-item">
              <BoxIcon name="bx-camera" className="text-2xl" />
              <span className="text-xs">Câmera</span>
            </button>
            <button className="nav-item-active">
              <BoxIcon name="bxs-cog" className="text-2xl" />
              <span className="text-xs">Config</span>
            </button>
          </div>
        </nav>

        {/* Logout Confirmation Sheet */}
        <BottomSheet
          isOpen={showLogoutSheet}
          onClose={() => setShowLogoutSheet(false)}
          title="Sair da Conta"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground text-center">
              Tem certeza que deseja sair? Dados não sincronizados podem ser perdidos.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogoutSheet(false)}
                className="h-14 rounded-xl bg-card border border-border font-medium text-foreground active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={() => router.push('/login')}
                className="h-14 rounded-xl bg-destructive font-medium text-destructive-foreground active:scale-95 transition-transform"
              >
                Sair
              </button>
            </div>
          </div>
        </BottomSheet>

        {/* Clear Cache Confirmation Sheet */}
        <BottomSheet
          isOpen={showClearCacheSheet}
          onClose={() => setShowClearCacheSheet(false)}
          title="Limpar Cache"
        >
          <div className="space-y-4">
            <p className="text-muted-foreground text-center">
              Isso removerá todos os dados offline. Você precisará baixar novamente ao reconectar.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowClearCacheSheet(false)}
                className="h-14 rounded-xl bg-card border border-border font-medium text-foreground active:scale-95 transition-transform"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowClearCacheSheet(false)}
                className="h-14 rounded-xl bg-destructive font-medium text-destructive-foreground active:scale-95 transition-transform"
              >
                Limpar
              </button>
            </div>
          </div>
        </BottomSheet>
      </div>
    </BoxiconsProvider>
  )
}
