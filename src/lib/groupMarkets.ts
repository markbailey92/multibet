import type { Market } from '../types'

export type GroupMember = {
  market: Market
  threshold: number
}

export type CatalogItem =
  | { kind: 'single'; market: Market }
  | {
      kind: 'group'
      id: string
      title: string
      description: string
      categories: string[]
      order: number
      code: Market['code']
      members: GroupMember[]
    }

/** e.g. PlayerToWin3OrMoreFouls → PlayerToWinNOrMoreFouls */
export function thresholdGroupKey(id: string): string | null {
  const match = id.match(/^(.*?)(\d+)(OrMore.+)$/i)
  if (!match) return null
  return `${match[1]}N${match[3]}`
}

export function extractThreshold(id: string, name: string): number | null {
  const fromId = id.match(/(\d+)OrMore/i)
  if (fromId) return Number(fromId[1])
  const fromName = name.match(/(\d+)\s+or More/i)
  if (fromName) return Number(fromName[1])
  // "Player to Assist" is the 1+ assist market
  if (id === 'PlayerToHave1OrMoreAssists') return 1
  return null
}

function groupTitleFrom(name: string, threshold: number): string {
  if (/^Player to Assist$/i.test(name)) return 'Player to Assist'
  return name
    .replace(new RegExp(`\\b${threshold}\\s+[Oo]r [Mm]ore\\s+`, 'g'), '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function buildCatalog(
  markets: Market[],
  mode: 'flat' | 'grouped',
): CatalogItem[] {
  if (mode === 'flat') {
    return markets
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((market) => ({ kind: 'single' as const, market }))
  }

  const buckets = new Map<string, GroupMember[]>()
  const singles: Market[] = []

  for (const market of markets) {
    const key = thresholdGroupKey(market.id)
    const threshold = extractThreshold(market.id, market.name)
    if (!key || threshold == null) {
      singles.push(market)
      continue
    }
    const list = buckets.get(key) ?? []
    list.push({ market, threshold })
    buckets.set(key, list)
  }

  const items: CatalogItem[] = singles.map((market) => ({
    kind: 'single',
    market,
  }))

  for (const [id, members] of buckets) {
    members.sort((a, b) => a.threshold - b.threshold)
    // Only group when 2+ related thresholds exist
    if (members.length < 2) {
      items.push({ kind: 'single', market: members[0].market })
      continue
    }
    const first = members[0]
    items.push({
      kind: 'group',
      id,
      title: groupTitleFrom(first.market.name, first.threshold),
      description: first.market.description,
      categories: [...new Set(members.flatMap((m) => m.market.categories))],
      order: Math.min(...members.map((m) => m.market.order)),
      code: first.market.code,
      members,
    })
  }

  return items.sort((a, b) => {
    const ao = a.kind === 'single' ? a.market.order : a.order
    const bo = b.kind === 'single' ? b.market.order : b.order
    return ao - bo
  })
}

export function itemCategories(item: CatalogItem): string[] {
  return item.kind === 'single' ? item.market.categories : item.categories
}

export function itemMatchesCategory(item: CatalogItem, category: string): boolean {
  if (category === 'ALL') return true
  return itemCategories(item).includes(category)
}

export function itemDisplayName(item: CatalogItem): string {
  return item.kind === 'single' ? item.market.name : item.title
}

export function itemMarketTypeIds(item: CatalogItem): string[] {
  if (item.kind === 'single') return [item.market.id]
  return item.members.map((member) => member.market.id)
}

export function itemMatchesSearch(item: CatalogItem, query: string): boolean {
  const trimmed = query.trim()
  if (!trimmed) return true
  const needle = trimmed.toLowerCase()
  if (itemDisplayName(item).toLowerCase().includes(needle)) return true
  return itemMarketTypeIds(item).some((id) => id.toLowerCase().includes(needle))
}

export function marketMatchesPhases(
  market: Market,
  phases: Array<'preMatch' | 'inPlay'>,
): boolean {
  if (phases.length === 0) return false
  const preMatch = market.preMatch ?? true
  const inPlay = market.inPlay ?? true
  if (phases.includes('preMatch') && !preMatch) return false
  if (phases.includes('inPlay') && !inPlay) return false
  return true
}

export function itemMatchesPhases(
  item: CatalogItem,
  phases: Array<'preMatch' | 'inPlay'>,
): boolean {
  if (item.kind === 'single') return marketMatchesPhases(item.market, phases)
  return item.members.some((member) => marketMatchesPhases(member.market, phases))
}
