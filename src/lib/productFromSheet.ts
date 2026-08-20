import Papa from 'papaparse'
import { parseExternalIds } from './competitionFromSheet'
import type { MatchPhase } from './sports'

export type ProductIds = Record<MatchPhase, string[]>

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

function phaseFromProductName(name: string): MatchPhase | null {
  const value = name.trim().toLowerCase()
  if (value === 'pre-match' || value === 'prematch') return 'preMatch'
  if (value === 'in-play' || value === 'inplay') return 'inPlay'
  return null
}

export function rowsToProductIds(rows: Record<string, string>[]): ProductIds {
  const productIds: ProductIds = {
    preMatch: [],
    inPlay: [],
  }

  for (const row of rows) {
    const productName = field(row, 'Product', 'product', 'Phase', 'phase')
    const ids = parseExternalIds(
      field(row, 'productID', 'ProductID', 'Product Id', 'ID', 'Id'),
    )
    const phase = phaseFromProductName(productName)
    if (!phase || ids.length === 0) continue
    productIds[phase].push(...ids)
  }

  return productIds
}

export function getSelectedProductIds(
  phases: MatchPhase[],
  productIds: ProductIds,
): string[] {
  const values: string[] = []
  for (const phase of phases) {
    values.push(...productIds[phase])
  }
  return values
}

export function parseProductsCsv(csv: string): ProductIds {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  })
  return rowsToProductIds(parsed.data)
}
