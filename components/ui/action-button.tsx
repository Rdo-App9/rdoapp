// Botão de Ação Rápida - Touch Target 72x72px
// Otimizado para uso com luvas em canteiro de obras

'use client'

import { cn } from '@/lib/utils'
import { BoxIcon, type BoxIconName } from './box-icon'
import { forwardRef } from 'react'

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: BoxIconName
  iconType?: 'regular' | 'solid'
  label: string
  variant?: 'default' | 'primary' | 'destructive' | 'success' | 'warning'
  size?: 'default' | 'lg'
}

const variantStyles = {
  default: 'bg-card border-border text-foreground',
  primary: 'bg-primary border-primary text-primary-foreground',
  destructive: 'bg-destructive border-destructive text-destructive-foreground',
  success: 'bg-success border-success text-success-foreground',
  warning: 'bg-warning border-warning text-warning-foreground',
}

const sizeStyles = {
  default: 'min-h-[72px] min-w-[72px] p-4 rounded-2xl',
  lg: 'min-h-[100px] min-w-[100px] p-5 rounded-3xl',
}

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ 
    icon, 
    iconType = 'regular',
    label, 
    variant = 'default', 
    size = 'default',
    className, 
    disabled,
    ...props 
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'flex flex-col items-center justify-center gap-2',
          'border transition-all duration-150 select-none',
          'active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <BoxIcon 
          name={icon} 
          type={iconType}
          size={size === 'lg' ? 36 : 28} 
        />
        <span className={cn(
          'font-medium leading-tight text-center',
          size === 'lg' ? 'text-base' : 'text-sm'
        )}>
          {label}
        </span>
      </button>
    )
  }
)

ActionButton.displayName = 'ActionButton'
