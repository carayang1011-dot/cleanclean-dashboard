'use client'

import { useState, useRef, useEffect } from 'react'
import { useOperator } from '@/hooks/useOperator'
import { OPERATORS } from '@/lib/types'
import { User, ChevronDown } from 'lucide-react'

export function OperatorSelector() {
  const { operator, setOperator } = useOperator()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1 rounded-xl border border-brand/30 text-brand bg-background px-3 py-1.5 text-sm font-medium hover:bg-brand/5 transition-colors"
      >
        <User size={14} />
        {operator ?? '選擇操作者'}
        <ChevronDown size={12} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[150px] rounded-xl border bg-white shadow-lg py-1">
          <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium">我是誰？</div>
          <div className="border-t my-1" />
          {OPERATORS.map(op => (
            <button
              key={op}
              type="button"
              onClick={() => { setOperator(op); setOpen(false) }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                operator === op ? 'bg-brand/10 font-medium text-brand' : 'text-gray-700'
              }`}
            >
              {op}
            </button>
          ))}
          <div className="border-t my-1" />
          <button
            type="button"
            onClick={() => { setOperator(null); setOpen(false) }}
            className="w-full text-left px-3 py-1.5 text-sm text-muted-foreground hover:bg-gray-50 transition-colors"
          >
            登出（訪客）
          </button>
        </div>
      )}
    </div>
  )
}
