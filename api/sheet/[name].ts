import type { VercelRequest, VercelResponse } from '@vercel/node'

const SHEET_ID = '1CO_4WBuD23-o8fCHg4Y4f1jr77kS7TgVXw7Ku9YQqbY'

const SHEET_SOURCES = {
  markets: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
  competitions: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Competitions`,
  products: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=ProductID`,
  sports: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=SportID`,
} as const

type SheetKey = keyof typeof SHEET_SOURCES

function resolveSheetKey(name: string): SheetKey | null {
  const normalized = name.replace(/\.csv$/i, '').toLowerCase()
  if (normalized === 'markets' || normalized === 'sheet') return 'markets'
  if (normalized === 'competitions') return 'competitions'
  if (normalized === 'products') return 'products'
  if (normalized === 'sports') return 'sports'
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const raw = req.query.name
  const name = Array.isArray(raw) ? raw[0] : raw
  if (!name) {
    res.status(400).setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send('Missing sheet name')
    return
  }

  const key = resolveSheetKey(name)
  if (!key) {
    res.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send(`Unknown sheet: ${name}`)
    return
  }

  try {
    const response = await fetch(SHEET_SOURCES[key], {
      redirect: 'follow',
      headers: {
        Accept: 'text/csv,text/plain,*/*',
      },
    })
    const text = await response.text()
    if (!response.ok) {
      throw new Error(text || `Sheet fetch failed (${response.status})`)
    }

    res.status(200)
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.send(text)
  } catch (error) {
    res.status(502)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.send(error instanceof Error ? error.message : 'Sheet proxy failed')
  }
}
