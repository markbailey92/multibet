import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { MAX_LEGS, type Leg } from '../types'

type LegsContextValue = {
  legs: Leg[]
  maxLegs: number
  atCapacity: boolean
  /** Toggle a leg by id; if adding would exceed max, no-op. */
  toggleLeg: (leg: Leg) => boolean
  /**
   * For single-select markets: selecting a new option replaces any leg
   * already on this scope; selecting the same option removes it.
   */
  setScopeLeg: (scopeId: string, leg: Leg | null) => boolean
  removeLeg: (id: string) => void
  clearLegs: () => void
  loadLegs: (legs: Leg[]) => void
  getScopeLeg: (scopeId: string) => Leg | undefined
  hasLeg: (id: string) => boolean
}

const LegsContext = createContext<LegsContextValue | null>(null)

export function LegsProvider({ children }: { children: ReactNode }) {
  const [legs, setLegs] = useState<Leg[]>([])

  const removeLeg = useCallback((id: string) => {
    setLegs((current) => current.filter((leg) => leg.id !== id))
  }, [])

  const clearLegs = useCallback(() => setLegs([]), [])

  const loadLegs = useCallback((next: Leg[]) => {
    setLegs(structuredClone(next).slice(0, MAX_LEGS))
  }, [])

  const toggleLeg = useCallback((leg: Leg) => {
    let ok = true
    setLegs((current) => {
      if (current.some((item) => item.id === leg.id)) {
        return current.filter((item) => item.id !== leg.id)
      }
      if (current.length >= MAX_LEGS) {
        ok = false
        return current
      }
      return [...current, leg]
    })
    return ok
  }, [])

  const setScopeLeg = useCallback((scopeId: string, leg: Leg | null) => {
    let ok = true
    setLegs((current) => {
      const withoutScope = current.filter((item) => item.scopeId !== scopeId)
      if (!leg) return withoutScope

      const alreadySame = current.some((item) => item.id === leg.id)
      if (alreadySame) {
        return withoutScope
      }

      if (withoutScope.length >= MAX_LEGS) {
        ok = false
        return current
      }
      return [...withoutScope, leg]
    })
    return ok
  }, [])

  const getScopeLeg = useCallback(
    (scopeId: string) => legs.find((leg) => leg.scopeId === scopeId),
    [legs],
  )

  const hasLeg = useCallback(
    (id: string) => legs.some((leg) => leg.id === id),
    [legs],
  )

  const value = useMemo(
    () => ({
      legs,
      maxLegs: MAX_LEGS,
      atCapacity: legs.length >= MAX_LEGS,
      toggleLeg,
      setScopeLeg,
      removeLeg,
      clearLegs,
      loadLegs,
      getScopeLeg,
      hasLeg,
    }),
    [legs, toggleLeg, setScopeLeg, removeLeg, clearLegs, loadLegs, getScopeLeg, hasLeg],
  )

  return <LegsContext.Provider value={value}>{children}</LegsContext.Provider>
}

export function useLegs() {
  const ctx = useContext(LegsContext)
  if (!ctx) throw new Error('useLegs must be used within LegsProvider')
  return ctx
}
