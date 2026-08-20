import Papa from 'papaparse'

export type SheetCompetition = {
  name: string
  externalIds: string[]
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

export function parseExternalIds(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

export function normalizeCompetitionKey(name: string): string {
  return name.trim().toLowerCase().replace(/[\s_-]+/g, '')
}

export function rowsToCompetitions(rows: Record<string, string>[]): SheetCompetition[] {
  const items: SheetCompetition[] = []

  for (const row of rows) {
    const name = field(row, 'Competiton', 'Competition', 'Name', 'name')
    const externalIds = parseExternalIds(field(row, 'ID', 'Id', 'id'))
    if (!name || externalIds.length === 0) continue
    items.push({ name, externalIds })
  }

  return items
}

export function parseCompetitionsCsv(csv: string): SheetCompetition[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  })
  return rowsToCompetitions(parsed.data)
}
