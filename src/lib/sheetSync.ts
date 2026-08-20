import {
  normalizeCompetitionKey,
  parseCompetitionsCsv,
  type SheetCompetition,
} from './competitionFromSheet'
import { rowsToMarkets } from './marketFromSheet'
import { parseProductsCsv, type ProductIds } from './productFromSheet'
import { normalizeSportKey, parseSportsCsv, type SheetSport } from './sportFromSheet'
import {
  FALLBACK_SPORTS,
  type Competition,
  type Sport,
  type SportId,
} from './sports'
import type { Market } from '../types'
import fallbackMarkets from '../data/markets.json'
import Papa from 'papaparse'

export const MARKETS_SHEET_PATH = '/api/sheet/markets.csv'
export const COMPETITIONS_SHEET_PATH = '/api/sheet/competitions.csv'
export const PRODUCTS_SHEET_PATH = '/api/sheet/products.csv'
export const SPORTS_SHEET_PATH = '/api/sheet/sports.csv'
/** @deprecated Use MARKETS_SHEET_PATH */
export const SHEET_PROXY_PATH = MARKETS_SHEET_PATH
export const POLL_INTERVAL_MS = 15_000
const CACHE_KEY = 'multibet.sheet.cache.v5'

type CachePayload = {
  marketsCsv: string
  competitionsCsv: string
  productsCsv: string
  sportsCsv: string
  markets: Market[]
  competitions: SheetCompetition[]
  sheetSports: SheetSport[]
  productIds: ProductIds
  sports: Sport[]
  fetchedAt: string
}

export type SheetSyncState = {
  markets: Market[]
  sports: Sport[]
  productIds: ProductIds
  status: 'loading' | 'live' | 'cached' | 'error'
  lastSyncedAt: Date | null
  error: string | null
  source: 'sheet' | 'cache' | 'fallback'
}

const EMPTY_PRODUCT_IDS: ProductIds = {
  preMatch: [],
  inPlay: [],
}

function readCache(): CachePayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CachePayload
  } catch {
    return null
  }
}

function writeCache(payload: Omit<CachePayload, 'fetchedAt'> & { fetchedAt?: string }) {
  const entry: CachePayload = {
    ...payload,
    fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
}

export function mergeSportsWithSheet(
  competitions: SheetCompetition[],
  sheetSports: SheetSport[] = [],
): Sport[] {
  const competitionExternalByKey = new Map<string, string[]>()
  for (const competition of competitions) {
    competitionExternalByKey.set(
      normalizeCompetitionKey(competition.name),
      competition.externalIds,
    )
  }

  const sportExternalByKey = new Map<string, string>()
  for (const sport of sheetSports) {
    sportExternalByKey.set(normalizeSportKey(sport.name), sport.externalId)
  }

  return FALLBACK_SPORTS.map((sport) => ({
    ...sport,
    externalId: sportExternalByKey.get(normalizeSportKey(sport.name)),
    competitions: sport.competitions.map((competition) => ({
      ...competition,
      externalIds: competitionExternalByKey.get(
        normalizeCompetitionKey(competition.name),
      ),
    })),
  }))
}

export function parseSheetCsv(csv: string): Market[] {
  const parsed = Papa.parse<Record<string, string>>(csv, {
    header: true,
    skipEmptyLines: true,
  })
  if (parsed.errors.length) {
    const fatal = parsed.errors.find((err) => err.type === 'FieldMismatch')
    if (fatal && !parsed.data.length) {
      throw new Error(fatal.message)
    }
  }
  return rowsToMarkets(parsed.data)
}

async function fetchCsv(path: string, signal?: AbortSignal): Promise<string> {
  const response = await fetch(`${path}?t=${Date.now()}`, {
    signal,
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new Error(`Sheet fetch failed (${response.status}) for ${path}`)
  }
  return response.text()
}

export async function fetchMarketsCsv(signal?: AbortSignal): Promise<string> {
  const text = await fetchCsv(MARKETS_SHEET_PATH, signal)
  if (!text.includes('Multibet Market Type') && !text.includes('order')) {
    throw new Error('Unexpected markets sheet response')
  }
  return text
}

function buildSyncPayload(
  marketsCsv: string,
  competitionsCsv: string,
  productsCsv: string,
  sportsCsv: string,
): Omit<CachePayload, 'fetchedAt'> {
  const competitions = parseCompetitionsCsv(competitionsCsv)
  const sheetSports = parseSportsCsv(sportsCsv)
  return {
    marketsCsv,
    competitionsCsv,
    productsCsv,
    sportsCsv,
    markets: parseSheetCsv(marketsCsv),
    competitions,
    sheetSports,
    productIds: parseProductsCsv(productsCsv),
    sports: mergeSportsWithSheet(competitions, sheetSports),
  }
}

export function getInitialSyncState(): SheetSyncState {
  const cache = readCache()
  if (cache?.markets?.length) {
    return {
      markets: cache.markets,
      sports: cache.sports,
      productIds: cache.productIds,
      status: 'cached',
      lastSyncedAt: cache.fetchedAt ? new Date(cache.fetchedAt) : null,
      error: null,
      source: 'cache',
    }
  }
  return {
    markets: fallbackMarkets as Market[],
    sports: FALLBACK_SPORTS,
    productIds: EMPTY_PRODUCT_IDS,
    status: 'loading',
    lastSyncedAt: null,
    error: null,
    source: 'fallback',
  }
}

type SyncFingerprint = {
  marketsCsv: string
  competitionsCsv: string
  productsCsv: string
  sportsCsv: string
}

export async function syncSheet(
  previous: SyncFingerprint | null,
  signal?: AbortSignal,
): Promise<{ fingerprint: SyncFingerprint; state: SheetSyncState }> {
  try {
    const [marketsCsv, competitionsCsv, productsCsv, sportsCsv] = await Promise.all([
      fetchMarketsCsv(signal),
      fetchCsv(COMPETITIONS_SHEET_PATH, signal),
      fetchCsv(PRODUCTS_SHEET_PATH, signal),
      fetchCsv(SPORTS_SHEET_PATH, signal),
    ])

    const fingerprint: SyncFingerprint = {
      marketsCsv,
      competitionsCsv,
      productsCsv,
      sportsCsv,
    }
    const unchanged =
      previous &&
      previous.marketsCsv === marketsCsv &&
      previous.competitionsCsv === competitionsCsv &&
      previous.productsCsv === productsCsv &&
      previous.sportsCsv === sportsCsv

    const payload = buildSyncPayload(marketsCsv, competitionsCsv, productsCsv, sportsCsv)
    if (!unchanged) {
      writeCache(payload)
    }

    return {
      fingerprint,
      state: {
        markets: payload.markets,
        sports: payload.sports,
        productIds: payload.productIds,
        status: 'live',
        lastSyncedAt: new Date(),
        error: null,
        source: 'sheet',
      },
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to sync sheet'
    const cache = readCache()
    if (cache?.markets?.length) {
      return {
        fingerprint: previous ?? {
          marketsCsv: cache.marketsCsv,
          competitionsCsv: cache.competitionsCsv,
          productsCsv: cache.productsCsv,
          sportsCsv: cache.sportsCsv ?? '',
        },
        state: {
          markets: cache.markets,
          sports: cache.sports,
          productIds: cache.productIds,
          status: 'error',
          lastSyncedAt: cache.fetchedAt ? new Date(cache.fetchedAt) : null,
          error: message,
          source: 'cache',
        },
      }
    }
    return {
      fingerprint: previous ?? {
        marketsCsv: '',
        competitionsCsv: '',
        productsCsv: '',
        sportsCsv: '',
      },
      state: {
        markets: fallbackMarkets as Market[],
        sports: FALLBACK_SPORTS,
        productIds: EMPTY_PRODUCT_IDS,
        status: 'error',
        lastSyncedAt: null,
        error: message,
        source: 'fallback',
      },
    }
  }
}

export function getCompetitionExternalIds(
  sports: Sport[],
  sportId: SportId,
  competitionId: string,
): string[] {
  const sport = sports.find((item) => item.id === sportId)
  const competition = sport?.competitions.find((item) => item.id === competitionId)
  return competition?.externalIds ?? []
}

export function getSelectedCompetitionExternalIds(
  sports: Sport[],
  sportId: SportId,
  competitionIds: string[],
): string[] {
  const values: string[] = []
  for (const competitionId of competitionIds) {
    values.push(...getCompetitionExternalIds(sports, sportId, competitionId))
  }
  return values
}

export function getSportExternalId(
  sports: Sport[],
  sportId: SportId,
): string | undefined {
  return sports.find((item) => item.id === sportId)?.externalId
}

export type { Competition, ProductIds, SheetSport }
