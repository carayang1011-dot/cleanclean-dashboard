'use client'

import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

// 訂閱指定資料表的 postgres_changes，有異動時呼叫 onRefresh
export function useRealtimeTable(table: string, onRefresh: () => void) {
  const refresh = useCallback(onRefresh, [onRefresh])

  useEffect(() => {
    const channel = supabase
      .channel(`realtime-${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        () => refresh()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, refresh])
}
