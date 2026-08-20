import { createContext, useContext, type ReactNode } from 'react'
import { useSheetMarkets } from '../hooks/useSheetMarkets'
import type { ProductIds, SheetSyncState } from '../lib/sheetSync'
import {
  getSportFromList,
  type Sport,
  type SportId,
} from '../lib/sports'

type SheetDataContextValue = SheetSyncState & {
  refresh: () => void
  getSport: (sportId: SportId) => Sport
}

const SheetDataContext = createContext<SheetDataContextValue | null>(null)

export function SheetDataProvider({ children }: { children: ReactNode }) {
  const sheet = useSheetMarkets()

  const value: SheetDataContextValue = {
    ...sheet,
    getSport: (sportId) => getSportFromList(sheet.sports, sportId),
  }

  return (
    <SheetDataContext.Provider value={value}>{children}</SheetDataContext.Provider>
  )
}

export function useSheetData() {
  const context = useContext(SheetDataContext)
  if (!context) {
    throw new Error('useSheetData must be used within SheetDataProvider')
  }
  return context
}

export type { ProductIds }
