import { defineConfig, type Plugin, type PreviewServer, type ViteDevServer } from 'vite'
import react from '@vitejs/plugin-react'

const SHEET_ID = '1CO_4WBuD23-o8fCHg4Y4f1jr77kS7TgVXw7Ku9YQqbY'

const SHEET_SOURCES = {
  markets:
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`,
  competitions:
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Competitions`,
  products:
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=ProductID`,
  sports:
    `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=SportID`,
} as const

async function fetchSheet(url: string): Promise<string> {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: {
      Accept: 'text/csv,text/plain,*/*',
    },
  })
  const text = await response.text()
  if (!response.ok) {
    throw new Error(text || `Sheet fetch failed (${response.status})`)
  }
  return text
}

function attachSheetMiddleware(server: ViteDevServer | PreviewServer) {
  const routes: Record<string, keyof typeof SHEET_SOURCES> = {
    '/api/sheet/markets.csv': 'markets',
    '/api/sheet.csv': 'markets',
    '/api/sheet/competitions.csv': 'competitions',
    '/api/sheet/products.csv': 'products',
    '/api/sheet/sports.csv': 'sports',
  }

  for (const [path, key] of Object.entries(routes)) {
    server.middlewares.use(path, async (_req, res) => {
      try {
        const text = await fetchSheet(SHEET_SOURCES[key])
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/csv; charset=utf-8')
        res.setHeader('Cache-Control', 'no-store')
        res.end(text)
      } catch (error) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'text/plain; charset=utf-8')
        res.end(error instanceof Error ? error.message : 'Sheet proxy failed')
      }
    })
  }
}

function googleSheetPlugin(): Plugin {
  return {
    name: 'google-sheet-csv',
    configureServer(server) {
      attachSheetMiddleware(server)
    },
    configurePreviewServer(server) {
      attachSheetMiddleware(server)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), googleSheetPlugin()],
})
