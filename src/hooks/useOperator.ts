'use client'

import { useState, useEffect } from 'react'
import type { Operator } from '@/lib/types'

const STORAGE_KEY = 'cleanclean_operator'

export function useOperator() {
  const [operator, setOperatorState] = useState<Operator | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) setOperatorState(saved as Operator)
  }, [])

  const setOperator = (op: Operator | null) => {
    if (op) {
      localStorage.setItem(STORAGE_KEY, op)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
    setOperatorState(op)
  }

  return { operator, setOperator }
}
