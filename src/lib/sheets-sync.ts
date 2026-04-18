// Fire-and-forget sync to Google Sheets via Apps Script Web App
// Set GOOGLE_SHEETS_WEBHOOK_URL in .env.local / Vercel env vars to activate
export function syncToSheets(
  table: string,
  action: 'create' | 'update' | 'delete',
  row: Record<string, any>
): void {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL
  if (!url) return
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ table, action, row }),
  }).catch(() => {})
}
