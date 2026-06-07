// Canvas de Assinatura Digital

'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { BoxIcon } from './box-icon'
import SignaturePad from 'signature_pad'

interface SignatureCanvasProps {
  onChange?: (dataUrl: string | null) => void
  initialData?: string
  className?: string
}

export function SignatureCanvas({ 
  onChange, 
  initialData,
  className 
}: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const signaturePadRef = useRef<SignaturePad | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  // Inicializar SignaturePad
  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ajustar para tela retina
    const ratio = Math.max(window.devicePixelRatio || 1, 1)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    ctx.scale(ratio, ratio)

    // Criar SignaturePad
    signaturePadRef.current = new SignaturePad(canvas, {
      backgroundColor: 'transparent',
      penColor: '#ffffff',
      minWidth: 2,
      maxWidth: 4,
    })

    // Carregar dados iniciais
    if (initialData) {
      signaturePadRef.current.fromDataURL(initialData)
      setIsEmpty(false)
    }

    // Atualizar estado quando desenhar
    signaturePadRef.current.addEventListener('endStroke', () => {
      setIsEmpty(signaturePadRef.current?.isEmpty() ?? true)
      if (onChange && signaturePadRef.current) {
        onChange(signaturePadRef.current.toDataURL())
      }
    })

    return () => {
      signaturePadRef.current?.off()
    }
  }, [initialData, onChange])

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !signaturePadRef.current) return
      
      const canvas = canvasRef.current
      const data = signaturePadRef.current.toData()
      
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(ratio, ratio)
      }
      
      signaturePadRef.current.clear()
      signaturePadRef.current.fromData(data)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const clear = useCallback(() => {
    signaturePadRef.current?.clear()
    setIsEmpty(true)
    onChange?.(null)
  }, [onChange])

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <label className="text-base font-medium text-foreground">
          Assinatura
        </label>
        <button
          type="button"
          onClick={clear}
          disabled={isEmpty}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium',
            'bg-secondary text-secondary-foreground',
            'flex items-center gap-2',
            'disabled:opacity-50 disabled:pointer-events-none',
            'active:scale-95 transition-transform'
          )}
        >
          <BoxIcon name="trash" size={16} />
          Limpar
        </button>
      </div>
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          className={cn(
            'w-full h-[200px] bg-card rounded-2xl',
            'border-2 border-dashed border-border',
            'touch-none cursor-crosshair'
          )}
        />
        
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-muted-foreground text-lg">
              Toque para assinar
            </p>
          </div>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground text-center">
        Sua assinatura será registrada com data, hora e localização
      </p>
    </div>
  )
}
