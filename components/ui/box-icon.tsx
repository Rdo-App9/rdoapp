// Componente de ícones usando Boxicons
// Documentação: https://boxicons.com/

'use client'

import { cn } from '@/lib/utils'

export type BoxIconName = 
  // Navigation & UI
  | 'home' | 'menu' | 'x' | 'chevron-left' | 'chevron-right' | 'chevron-down' | 'chevron-up'
  | 'plus' | 'minus' | 'check' | 'search' | 'filter' | 'sort-alt-2'
  // User & Auth
  | 'user' | 'user-circle' | 'log-out' | 'log-in' | 'lock-alt' | 'envelope'
  // Document & Files
  | 'file' | 'file-blank' | 'folder' | 'clipboard' | 'edit' | 'trash'
  // Camera & Media
  | 'camera' | 'image' | 'images' | 'video' | 'microphone' | 'qr-scan' | 'barcode'
  // Location & Maps
  | 'map' | 'map-pin' | 'current-location' | 'compass' | 'navigation'
  // Weather
  | 'sun' | 'cloud' | 'cloud-rain' | 'cloud-lightning' | 'wind' | 'droplet'
  // Construction & Work
  | 'building' | 'buildings' | 'hard-hat' | 'wrench' | 'cog' | 'ruler'
  // Time & Calendar
  | 'calendar' | 'calendar-check' | 'time' | 'history' | 'stopwatch'
  // Status & Alerts
  | 'check-circle' | 'x-circle' | 'error-circle' | 'info-circle' | 'bell' | 'bell-ring'
  | 'shield-check' | 'error' | 'alarm-exclamation'
  // Communication
  | 'phone' | 'phone-call' | 'message-square-dots' | 'send'
  // Network & Sync
  | 'wifi' | 'wifi-off' | 'cloud-upload' | 'cloud-download' | 'refresh' | 'sync'
  // BIM & 3D
  | 'cube' | 'cube-alt' | 'layer' | 'layer-plus' | 'grid-alt' | 'shape-square'
  // Misc
  | 'dots-vertical-rounded' | 'dots-horizontal-rounded' | 'expand' | 'exit-fullscreen'
  | 'share' | 'download' | 'upload' | 'link' | 'copy' | 'eye' | 'eye-off'
  | 'pencil' | 'paint-roll' | 'palette'

export type BoxIconType = 'regular' | 'solid' | 'logos'

interface BoxIconProps {
  name: BoxIconName
  type?: BoxIconType
  size?: number | string
  className?: string
  color?: string
}

export function BoxIcon({ 
  name, 
  type = 'regular', 
  size = 24, 
  className,
  color 
}: BoxIconProps) {
  const prefix = type === 'regular' ? 'bx' : type === 'solid' ? 'bxs' : 'bxl'
  const iconClass = `${prefix} ${prefix}-${name}`
  
  return (
    <i 
      className={cn(iconClass, className)}
      style={{ 
        fontSize: typeof size === 'number' ? `${size}px` : size,
        color,
        lineHeight: 1
      }}
      aria-hidden="true"
    />
  )
}

// Hook para carregar CSS do Boxicons
export function useBoxicons() {
  if (typeof window !== 'undefined') {
    const linkId = 'boxicons-css'
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css'
      document.head.appendChild(link)
    }
  }
}

// Componente provider que carrega o CSS
export function BoxiconsProvider({ children }: { children: React.ReactNode }) {
  useBoxicons()
  return <>{children}</>
}
