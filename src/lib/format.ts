// NT$ 金額格式化
export function formatNTD(amount: number | null | undefined): string {
  if (amount == null) return '—'
  return `NT$ ${new Intl.NumberFormat('zh-TW').format(amount)}`
}

// 日期格式化 YYYY-MM-DD → MM/DD
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// 日期範圍顯示
export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return '—'
  if (start && !end) return formatDate(start) + ' ~'
  if (!start && end) return '~ ' + formatDate(end)
  return `${formatDate(start)} ~ ${formatDate(end)}`
}

// 取當週的開始與結束（週一到週日）
export function getWeekRange(): { start: Date; end: Date } {
  const now = new Date()
  const day = now.getDay()
  const diffToMon = (day === 0 ? -6 : 1 - day)
  const start = new Date(now)
  start.setDate(now.getDate() + diffToMon - 7)
  const end = new Date(start)
  end.setDate(start.getDate() + 14)
  return { start, end }
}
