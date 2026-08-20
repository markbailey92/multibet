import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getInitialSyncState,
  POLL_INTERVAL_MS,
  syncSheet,
  type SheetSyncState,
} from '../lib/sheetSync'

type SyncFingerprint = {
  marketsCsv: string
  competitionsCsv: string
  productsCsv: string
  sportsCsv: string
}

export function useSheetMarkets() {
  const [state, setState] = useState<SheetSyncState>(() => getInitialSyncState())
  const fingerprintRef = useRef<SyncFingerprint | null>(null)
  const inFlight = useRef(false)

  const refresh = useCallback(async (background = false) => {
    if (inFlight.current) return
    inFlight.current = true
    if (!background) {
      setState((prev: SheetSyncState) =>
        prev.status === 'live' || prev.status === 'cached'
          ? prev
          : { ...prev, status: 'loading', error: null },
      )
    }
    try {
      const result = await syncSheet(fingerprintRef.current)
      fingerprintRef.current = result.fingerprint
      setState(result.state)
    } finally {
      inFlight.current = false
    }
  }, [])

  useEffect(() => {
    void refresh(false)

    const interval = window.setInterval(() => {
      void refresh(true)
    }, POLL_INTERVAL_MS)

    const onFocus = () => {
      void refresh(true)
    }
    const onVisibility = () => {
      if (document.visibilityState === 'visible') onFocus()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [refresh])

  return { ...state, refresh: () => refresh(false) }
}
