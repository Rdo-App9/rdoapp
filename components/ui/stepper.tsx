// Stepper para quantidades - Botões grandes (+/-) para uso com luvas

'use client'

import { cn } from '@/lib/utils'
import { BoxIcon } from './box-icon'

interface StepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  unit?: string
  disabled?: boolean
  className?: string
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  unit,
  disabled = false,
  className
}: StepperProps) {
  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(value - step)
    }
  }

  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(value + step)
    }
  }

  const canDecrement = value - step >= min && !disabled
  const canIncrement = value + step <= max && !disabled

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <label className="block text-base font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={!canDecrement}
          className={cn(
            'w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground',
            'flex items-center justify-center',
            'active:scale-95 transition-transform duration-150',
            'disabled:opacity-40 disabled:pointer-events-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="Diminuir"
        >
          <BoxIcon name="minus" size={28} />
        </button>
        
        <div className="min-w-[100px] text-center">
          <span className="text-3xl font-bold tabular-nums text-foreground">
            {value}
          </span>
          {unit && (
            <span className="ml-1 text-lg text-muted-foreground">
              {unit}
            </span>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleIncrement}
          disabled={!canIncrement}
          className={cn(
            'w-16 h-16 rounded-2xl bg-secondary text-secondary-foreground',
            'flex items-center justify-center',
            'active:scale-95 transition-transform duration-150',
            'disabled:opacity-40 disabled:pointer-events-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
          )}
          aria-label="Aumentar"
        >
          <BoxIcon name="plus" size={28} />
        </button>
      </div>
    </div>
  )
}
