'use client'

import { useState, useEffect, useRef } from 'react'

interface ResizablePanelProps {
  defaultWidth?: number
  minWidth?: number
  maxWidth?: number
  children: React.ReactNode
  onClose?: () => void
  title?: string
}

export function ResizablePanel({
  defaultWidth = 384,
  minWidth = 300,
  maxWidth = 600,
  children,
  onClose,
  title
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth)
  const [isDragging, setIsDragging] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      
      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'col-resize'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [isDragging, minWidth, maxWidth])

  return (
    <div 
      ref={panelRef}
      className="relative border-l border-border overflow-auto bg-background"
      style={{ width: `${width}px` }}
    >
      {/* Resize handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 hover:bg-primary/20 cursor-col-resize transition-all z-10"
        onMouseDown={() => setIsDragging(true)}
      />
      
      {/* Header */}
      {(title || onClose) && (
        <div className="sticky top-0 bg-background border-b border-border p-4 z-10">
          <div className="flex items-center justify-between">
            {title && <h3 className="font-semibold">{title}</h3>}
            {onClose && (
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground text-xl leading-none"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}