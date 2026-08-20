import Papa from 'papaparse'

export type SheetSport = {
  name: string
  externalId: string
}

function field(row: Record<string, string>, ...candidates: string[]): string {
  for (const key of candidates) {
    if (key in row && row[key] != null) return String(row[key]).trim()
  }
  const keys = Object.keys(row)
  for (const candidate of candidates) {
    const found = keys.find((key) =>
      key.toLowerCase().includes(candidate.toLowerCase()),
    )
    if (found) return String(row[found] ?? '').trim()
  }
  return ''
}

export function normalizeSportKey(name: string): string {
  return name.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

export function rowsToSports(rows: Record<string, string>[]): SheetSport[] {
  const items: SheetSport[] = []

  for (const row of rows) {
    const name = field(row, 'Sport', 'sport', 'Name', 'name')
    const externalId = field(row, 'SportID', 'Sport Id', 'ID', 'Id', 'id')
    if (!name || !externalId) continue
    items.push({ name, externalId })
  }

  return items
}

export function parseSportsCsv(csv: string): SheetSport[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  })
  return rowsToSports(parsed.data)
}
