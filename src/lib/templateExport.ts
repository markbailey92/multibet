import type { Leg, Market } from '../types'
import type { ProductIds } from './sheetSync'
import { getSelectedProductIds } from './productFromSheet'
import { getSelectedCompetitionExternalIds, getSportExternalId } from './sheetSync'
import type { MatchPhase, Sport, SportId } from './sports'

export type ExportMarketDefinition = {
  name: string | null
  determineCompetitiveness: boolean | null
  competitivenessFilterPrefix: string | null
  marketTypeName: string | null
}

export type ExportTemplateEntry = {
  templateId: string | null
  competitionId: number | null
  productId: number | null
  marketDefinitions: ExportMarketDefinition[]
}

export type GeneratedTemplateExport = {
  sportId: number | null
  competitionId: number | null
  templates: ExportTemplateEntry[]
  returnedAtUtc: string
}

export type ExportIssue = {
  level: 'error' | 'warn'
  field: string
  message: string
}

export type TemplateExportPreview = {
  payload: GeneratedTemplateExport
  issues: ExportIssue[]
  json: string
}

const MISSING = null

function parseNumericId(value: string | undefined): number | null {
  if (!value?.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function legMarketTypeId(leg: Leg): string | null {
  if (leg.marketTypeId) return leg.marketTypeId
  if (!leg.scopeId.includes('::')) return leg.scopeId
  return null
}

function selectionKeyFromLeg(leg: Leg): string {
  return leg.id.slice(leg.id.lastIndexOf('::') + 2)
}

function isMostCompetitiveKey(key: string): boolean {
  return key === 'mc' || key.endsWith('-mc')
}

function sideFromMostCompetitiveKey(key: string): string | null {
  const match = key.match(/^(Over|Under|Home|Away)-mc$/i)
  return match ? match[1] : null
}

function findMarket(markets: Market[], marketTypeId: string | null): Market | undefined {
  if (!marketTypeId) return undefined
  return markets.find((market) => market.id === marketTypeId)
}

/**
 * Most-competitive export shape:
 *   marketTypeName: "TotalGoalsOverUnder"
 *   competitivenessFilterPrefix: "TotalGoalsOverUnder_Over_"
 *   name: "TotalGoalsOverUnder_Over_{most-competitive}"
 *   determineCompetitiveness: true
 *
 * Overall most competitive (no side):
 *   prefix: "TotalGoalsOverUnder_"
 *   name: "TotalGoalsOverUnder_{most-competitive}"
 */
function buildMostCompetitiveDefinition(
  marketTypeName: string,
  key: string,
): ExportMarketDefinition {
  const side = sideFromMostCompetitiveKey(key)
  const competitivenessFilterPrefix = side
    ? `${marketTypeName}_${side}_`
    : `${marketTypeName}_`

  return {
    name: `${competitivenessFilterPrefix}{most-competitive}`,
    determineCompetitiveness: true,
    competitivenessFilterPrefix,
    marketTypeName,
  }
}

function resolveFixedSelectionId(market: Market | undefined, leg: Leg): string | null {
  if (!market?.selections?.length) return null

  const key = selectionKeyFromLeg(leg)
  const selections = market.selections

  const sideLine = key.match(/^(Over|Under|Home|Away)-(.+)$/)
  if (sideLine) {
    const [, side, line] = sideLine
    if (line.toLowerCase() === 'mc') return null

    const exact = selections.find(
      (item) =>
        !item.id.includes('{') &&
        item.id.includes(`_${side}_`) &&
        (item.id.endsWith(`_${line}`) || item.id.endsWith(line)),
    )
    if (exact) return exact.id

    const template = selections.find(
      (item) => item.id.includes(`_${side}_`) && item.id.includes('{HANDICAP}'),
    )
    if (template) return template.id.replace('{HANDICAP}', line)

    // Construct from market type + side + line when sheet only has HANDICAP templates
    return `${market.id}_${side}_${line}`
  }

  if (/^\d+$/.test(key)) {
    const numeric = selections.find((item) => item.id.endsWith(`_${key}`))
    if (numeric) return numeric.id
  }

  const normalizedSelection = leg.selection.trim().toLowerCase()
  const byLabel = selections.find(
    (item) =>
      item.label.trim().toLowerCase() === normalizedSelection ||
      item.label.trim().toLowerCase() === key.toLowerCase(),
  )
  if (byLabel) return byLabel.id

  const truthy = selections.find((item) => /_(True|Yes)$/i.test(item.id))
  if (truthy && /^(yes|true)$/i.test(key)) return truthy.id

  const bySuffix = selections.find(
    (item) =>
      item.id.endsWith(`_${key}`) ||
      item.id.endsWith(`_${key.replace(/\s+/g, '')}`),
  )
  if (bySuffix) return bySuffix.id

  if (key === 'Home' || key === 'Away' || key === 'Draw') {
    return (
      selections.find((item) => item.id.endsWith(`_${key}`))?.id ??
      `${market.id}_${key}`
    )
  }

  const scoreLike = key.match(/^(\d+)\s*[-–]\s*(\d+)$/)
  if (scoreLike) {
    const score = `${scoreLike[1]}-${scoreLike[2]}`
    return selections.find((item) => item.id.includes(score))?.id ?? null
  }

  return null
}

function buildMarketDefinition(
  leg: Leg,
  markets: Market[],
  issues: ExportIssue[],
  index: number,
): ExportMarketDefinition {
  const marketTypeName = legMarketTypeId(leg)
  const market = findMarket(markets, marketTypeName)
  const key = selectionKeyFromLeg(leg)
  const prefix = `legs[${index}]`

  if (!marketTypeName) {
    issues.push({
      level: 'error',
      field: `${prefix}.marketTypeName`,
      message: `Could not resolve Multibet Market Type Id for “${leg.selection} — ${leg.detail}”.`,
    })
    return {
      name: MISSING,
      determineCompetitiveness: MISSING,
      competitivenessFilterPrefix: MISSING,
      marketTypeName: MISSING,
    }
  }

  if (!market) {
    issues.push({
      level: 'error',
      field: `${prefix}.marketTypeName`,
      message: `Market “${marketTypeName}” was not found in the synced sheet catalog.`,
    })
  }

  if (isMostCompetitiveKey(key)) {
    return buildMostCompetitiveDefinition(marketTypeName, key)
  }

  const selectionId = resolveFixedSelectionId(market, leg)
  if (!selectionId) {
    issues.push({
      level: 'error',
      field: `${prefix}.name`,
      message: `Could not map selection “${leg.selection}” to a Multibet Selection Id for ${marketTypeName}.`,
    })
    return {
      name: MISSING,
      determineCompetitiveness: MISSING,
      competitivenessFilterPrefix: MISSING,
      marketTypeName,
    }
  }

  return {
    name: selectionId,
    determineCompetitiveness: false,
    competitivenessFilterPrefix: selectionId,
    marketTypeName,
  }
}

function resolveExportProductIds(
  phases: MatchPhase[],
  productIds: ProductIds,
  issues: ExportIssue[],
): number[] {
  if (phases.length === 0) {
    issues.push({
      level: 'error',
      field: 'productIds',
      message: 'Select at least one phase to resolve productIds.',
    })
    return []
  }

  const externalIds = getSelectedProductIds(phases, productIds)
  const resolved = parseNumericIds(externalIds)

  for (const phase of phases) {
    if (productIds[phase].length === 0) {
      issues.push({
        level: 'error',
        field: 'productIds',
        message: `Missing productId mapping for ${phase === 'preMatch' ? 'Pre-Match' : 'In-Play'} in the ProductID sheet.`,
      })
    }
  }

  if (externalIds.length > 0 && resolved.length === 0) {
    issues.push({
      level: 'error',
      field: 'productIds',
      message: 'Product IDs from the sheet could not be parsed as numbers.',
    })
  }

  return resolved
}

function parseNumericIds(values: string[]): number[] {
  return values
    .map((value) => parseNumericId(value))
    .filter((value): value is number => value != null)
}

function resolveExportCompetitionIds(
  sports: Sport[],
  sportId: SportId,
  competitionSlugs: string[],
  issues: ExportIssue[],
): number[] {
  if (competitionSlugs.length === 0) {
    issues.push({
      level: 'error',
      field: 'competitionIds',
      message: 'Select at least one competition.',
    })
    return []
  }

  const externalIds = getSelectedCompetitionExternalIds(sports, sportId, competitionSlugs)
  const competitionIds = parseNumericIds(externalIds)

  for (const slug of competitionSlugs) {
    const idsForCompetition = getSelectedCompetitionExternalIds(sports, sportId, [slug])
    if (idsForCompetition.length === 0) {
      issues.push({
        level: 'error',
        field: 'competitionIds',
        message: `Missing competition ID in sheet for “${slug}”.`,
      })
    }
  }

  if (externalIds.length > 0 && competitionIds.length === 0) {
    issues.push({
      level: 'error',
      field: 'competitionIds',
      message: 'Competition IDs from the sheet could not be parsed as numbers.',
    })
  }

  return competitionIds
}

function hashTemplateId(input: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0')
  return (hex + hex + hex + hex).slice(0, 32)
}

export function buildTemplateExportPreview(input: {
  templateId: string | null
  sportId: SportId
  competitionIds: string[]
  phases: MatchPhase[]
  legs: Leg[]
  markets: Market[]
  sports: Sport[]
  productIds: ProductIds
}): TemplateExportPreview {
  const issues: ExportIssue[] = []

  const sportExternalId = getSportExternalId(input.sports, input.sportId)
  const sportId = parseNumericId(sportExternalId)
  if (sportId == null) {
    issues.push({
      level: 'error',
      field: 'sportId',
      message: `Missing sport ID in sheet for “${input.sportId}”.`,
    })
  }

  const competitionIds = resolveExportCompetitionIds(
    input.sports,
    input.sportId,
    input.competitionIds,
    issues,
  )
  const productIds = resolveExportProductIds(input.phases, input.productIds, issues)

  const marketDefinitions = input.legs.map((leg, index) =>
    buildMarketDefinition(leg, input.markets, issues, index),
  )

  if (input.legs.length === 0) {
    issues.push({
      level: 'warn',
      field: 'marketDefinitions',
      message: 'Add legs to generate marketDefinitions.',
    })
  }

  issues.push({
    level: 'warn',
    field: 'templateId',
    message: 'templateId uses a preview hash — confirm the production MD5 algorithm separately.',
  })

  // API shape uses singular competitionId / productId. All selected legs apply to
  // every selected competition/phase; we emit one template entry (no duplicated legs).
  // When multiple IDs are selected, use the first and note the rest.
  const competitionId = competitionIds[0] ?? null
  const productId = productIds[0] ?? null

  if (competitionIds.length > 1) {
    issues.push({
      level: 'warn',
      field: 'competitionId',
      message: `Multiple competition IDs selected (${competitionIds.join(', ')}); export uses ${competitionId} to match API shape.`,
    })
  }
  if (productIds.length > 1) {
    issues.push({
      level: 'warn',
      field: 'productId',
      message: `Multiple product IDs selected (${productIds.join(', ')}); export uses ${productId} to match API shape.`,
    })
  }

  const signature = JSON.stringify({
    baseId: input.templateId,
    sportId,
    competitionId,
    productId,
    marketDefinitions,
  })

  const templates: ExportTemplateEntry[] = [
    {
      templateId: hashTemplateId(signature),
      competitionId,
      productId,
      marketDefinitions,
    },
  ]

  const payload: GeneratedTemplateExport = {
    sportId,
    competitionId,
    templates,
    returnedAtUtc: new Date().toISOString(),
  }

  return {
    payload,
    issues,
    json: JSON.stringify(payload, null, 4),
  }
}

export function exportIssueCounts(issues: ExportIssue[]) {
  return {
    errors: issues.filter((issue) => issue.level === 'error').length,
    warnings: issues.filter((issue) => issue.level === 'warn').length,
  }
}
