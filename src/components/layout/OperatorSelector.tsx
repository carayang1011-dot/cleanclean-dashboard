'use client'

import { useOperator } from '@/hooks/useOperator'
import { OPERATORS } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, User } from 'lucide-react'

export function OperatorSelector() {
  const { operator, setOperator } = useOperator()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-xl border border-brand/30 text-brand bg-background px-3 py-1.5 text-sm font-medium hover:bg-brand/5 transition-colors">
        <User size={14} />
        {operator ?? '選擇操作者'}
        <ChevronDown size={12} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>我是誰？</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {OPERATORS.map((op) => (
          <DropdownMenuItem
            key={op}
            onClick={() => setOperator(op)}
            className={operator === op ? 'bg-brand/10 font-medium' : ''}
          >
            {op}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setOperator(null)} className="text-muted-foreground">
          登出（訪客）
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
