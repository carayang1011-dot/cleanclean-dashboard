import 'server-only'
import * as fs from 'fs'
import * as path from 'path'

// In-memory cache; data is read from src/local-data/*.json via fs at first access
type Row = Record<string, any>
const CACHE: Record<string, Row[]> = {}

function getTable(name: string): Row[] {
  if (!(name in CACHE)) {
    try {
      const file = path.join(process.cwd(), 'src', 'local-data', `${name}.json`)
      const raw = JSON.parse(fs.readFileSync(file, 'utf-8'))
      CACHE[name] = Array.isArray(raw) ? raw : [raw]
    } catch {
      CACHE[name] = []
    }
  }
  return CACHE[name]
}

type FilterFn = (row: Row) => boolean

class QueryBuilder {
  private _table: string
  private _filters: FilterFn[] = []
  private _orderCol: string | null = null
  private _orderAsc = true
  private _isSingle = false
  private _op: 'select' | 'insert' | 'update' | 'delete' | 'upsert' = 'select'
  private _payload: any = null
  private _limitN?: number

  constructor(table: string) { this._table = table }

  select(_cols = '*') { return this }

  order(col: string, opts?: { ascending?: boolean }) {
    this._orderCol = col
    this._orderAsc = opts?.ascending !== false
    return this
  }

  eq(col: string, val: any) {
    this._filters.push(row => row[col] === val)
    return this
  }

  ilike(col: string, pattern: string) {
    const re = new RegExp(pattern.replace(/%/g, '.*'), 'i')
    this._filters.push(row => re.test(String(row[col] ?? '')))
    return this
  }

  gte(col: string, val: any) {
    this._filters.push(row => row[col] != null && row[col] >= val)
    return this
  }

  lte(col: string, val: any) {
    this._filters.push(row => row[col] != null && row[col] <= val)
    return this
  }

  lt(col: string, val: any) {
    this._filters.push(row => row[col] != null && row[col] < val)
    return this
  }

  not(col: string, op: string, val: any) {
    if (op === 'is') this._filters.push(row => row[col] !== val && row[col] != null)
    else this._filters.push(row => row[col] !== val)
    return this
  }

  or(filterStr: string) {
    const parts = filterStr.split(',').map(p => p.trim())
    const fns: FilterFn[] = parts.map(part => {
      const m = part.match(/^(\w+)\.(ilike|eq)\.(.*?)$/)
      if (!m) return () => true
      const [, col, op, val] = m
      if (op === 'ilike') {
        const re = new RegExp(val.replace(/%/g, '.*'), 'i')
        return (row: Row) => re.test(String(row[col] ?? ''))
      }
      return (row: Row) => row[col] === val
    })
    this._filters.push(row => fns.some(fn => fn(row)))
    return this
  }

  limit(n: number) { this._limitN = n; return this }

  insert(data: Row | Row[]) {
    this._op = 'insert'
    this._payload = Array.isArray(data) ? data : [data]
    return this
  }

  update(data: Row) { this._op = 'update'; this._payload = data; return this }

  upsert(data: Row | Row[]) {
    this._op = 'upsert'
    this._payload = Array.isArray(data) ? data : [data]
    return this
  }

  delete() { this._op = 'delete'; return this }
  single() { this._isSingle = true; return this }

  then(resolve: (v: { data: any; error: any }) => void, reject?: (e: any) => void) {
    Promise.resolve().then(() => {
      try { resolve(this._exec()) } catch (e) { reject ? reject(e) : resolve({ data: null, error: e }) }
    })
  }

  private _match(rows: Row[]) {
    return rows.filter(row => this._filters.every(fn => fn(row)))
  }

  private _exec(): { data: any; error: any } {
    const now = new Date().toISOString()
    const rows = getTable(this._table)
    const uuid = () => crypto.randomUUID()

    if (this._op === 'insert') {
      const inserted = (this._payload as Row[]).map(item => ({
        id: uuid(), created_at: now, updated_at: now, ...item,
      }))
      rows.push(...inserted)
      return { data: this._isSingle ? inserted[0] ?? null : inserted, error: null }
    }

    if (this._op === 'upsert') {
      const result: Row[] = []
      for (const item of this._payload as Row[]) {
        const keyCol = 'month' in item && !('id' in item) ? 'month' : 'id'
        const idx = rows.findIndex(r => r[keyCol] === item[keyCol])
        if (idx >= 0) {
          rows[idx] = { ...rows[idx], ...item, updated_at: now }
          result.push(rows[idx])
        } else {
          const newRow = { id: uuid(), created_at: now, updated_at: now, ...item }
          rows.push(newRow)
          result.push(newRow)
        }
      }
      return { data: this._isSingle ? result[0] ?? null : result, error: null }
    }

    if (this._op === 'update') {
      let updated: Row | null = null
      for (let i = 0; i < rows.length; i++) {
        if (this._filters.every(fn => fn(rows[i]))) {
          rows[i] = { ...rows[i], ...this._payload, updated_at: now }
          updated = rows[i]
        }
      }
      return { data: this._isSingle ? updated : (updated ? [updated] : []), error: null }
    }

    if (this._op === 'delete') {
      CACHE[this._table] = rows.filter(row => !this._filters.every(fn => fn(row)))
      return { data: null, error: null }
    }

    // SELECT
    let result = this._match(rows)
    if (this._orderCol) {
      const col = this._orderCol
      const asc = this._orderAsc
      result = [...result].sort((a, b) => {
        if (a[col] == null && b[col] == null) return 0
        if (a[col] == null) return 1
        if (b[col] == null) return -1
        return a[col] < b[col] ? (asc ? -1 : 1) : a[col] > b[col] ? (asc ? 1 : -1) : 0
      })
    }
    if (this._limitN != null) result = result.slice(0, this._limitN)
    return { data: this._isSingle ? (result[0] ?? null) : result, error: null }
  }
}

export function createLocalClient() {
  return {
    from(table: string) { return new QueryBuilder(table) },
    channel(_name: string) {
      const stub: any = { on: () => stub, subscribe: () => ({}) }
      return stub
    },
    removeChannel(_ch: any) {},
  }
}
