export type TemplateCode =
  | 'MC12'
  | 'MC123'
  | 'MC12345'
  | 'MC1212345'
  | 'MC12312345'

export type MarketTemplate =
  | {
      code: 'MC12'
      inferredCode?: boolean
      options: string[]
    }
  | {
      code: 'MC123'
      inferredCode?: boolean
      options: string[]
    }
  | {
      code: 'MC12345'
      inferredCode?: boolean
      numbers: string[]
    }
  | {
      code: 'MC1212345'
      inferredCode?: boolean
      side1: string
      side2: string
      lines: string[]
      lineColumns: number
    }
  | {
      code: 'MC12312345'
      inferredCode?: boolean
      homeScores: string[]
      drawScores: string[]
      awayScores: string[]
      variants: Array<'grid' | 'stepper'>
    }

export type MarketSelection = {
  /** Multibet Selection Id from sheet (e.g. MatchResult_Home). */
  id: string
  /** Display label shown in the builder UI. */
  label: string
}

export type Market = {
  /** Multibet Market Type Id from sheet (e.g. MatchResult). */
  id: string
  order: number
  sbmId: string
  name: string
  description: string
  categories: string[]
  /** Multibet Selection Ids paired with display labels from the sheet. */
  selections?: MarketSelection[]
  /** Available before kick-off (sheet PreMatch column). */
  preMatch: boolean
  /** Available during the match (sheet InPlay column). */
  inPlay: boolean
  code: TemplateCode
  codeSource: 'sheet' | 'inferred'
  template: MarketTemplate
}

/** A single multibet selection (max 5 in the slip). */
export type Leg = {
  id: string
  /** Market or group id used to scope replace/toggle behaviour */
  scopeId: string
  /** Multibet Market Type Id from sheet (e.g. MatchResult) */
  marketTypeId?: string
  marketName: string
  /** Bold subject, e.g. Home / 2+ / Most Competitive */
  selection: string
  /** Grey detail after the dash, usually the market name */
  detail: string
}

export const MAX_LEGS = 5
