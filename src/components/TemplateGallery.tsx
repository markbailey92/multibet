import type { MarketTemplate, TemplateCode } from '../types'
import { TemplateBody } from './Templates'

export type TemplateShowcase = {
  code: TemplateCode | 'GROUPED'
  name: string
  summary: string
  usedFor: string
  template?: MarketTemplate
  groupedDemo?: boolean
}

export const TEMPLATE_SHOWCASES: TemplateShowcase[] = [
  {
    code: 'MC12',
    name: 'MC12',
    summary: 'Most competitive with two outcomes side by side.',
    usedFor: 'Yes/No, Odd/Even, dual player sides',
    template: {
      code: 'MC12',
      options: ['Home', 'Away'],
    },
  },
  {
    code: 'MC123',
    name: 'MC123',
    summary: 'Most competitive with three outcomes in a row.',
    usedFor: 'Match Result, Double Chance, team 1X2',
    template: {
      code: 'MC123',
      options: ['Home', 'Draw', 'Away'],
    },
  },
  {
    code: 'MC12345',
    name: 'MC12345',
    summary: 'Most competitive plus a number grid.',
    usedFor: 'Exact goals, exact cards, count markets',
    template: {
      code: 'MC12345',
      numbers: Array.from({ length: 16 }, (_, i) => String(i)),
    },
  },
  {
    code: 'MC1212345',
    name: 'MC1212345',
    summary: 'Overall and per-side most competitive, then line values.',
    usedFor: 'Over/Under and handicap-style lines',
    template: {
      code: 'MC1212345',
      side1: 'Over',
      side2: 'Under',
      lines: ['0.5', '1.5', '2.5', '3.5', '4.5', '5.5', '6.5', '7.5'],
      lineColumns: 2,
    },
  },
  {
    code: 'MC12312345',
    name: 'MC12312345',
    summary: 'Correct score with grid and stepper variants.',
    usedFor: 'Correct score / scoreline markets',
    template: {
      code: 'MC12312345',
      homeScores: ['1-0', '2-0', '2-1', '3-0', '3-1', '3-2', '4-0'],
      drawScores: ['0-0', '1-1', '2-2', '3-3', '4-4', '5-5', '6-6'],
      awayScores: ['0-1', '0-2', '1-2', '0-3', '1-3', '2-3', '0-4'],
      variants: ['grid', 'stepper'],
    },
  },
  {
    code: 'GROUPED',
    name: 'Grouped thresholds',
    summary: 'Home/Away most competitive plus 1+ / 2+ / 3+ columns.',
    usedFor: 'Player assists, shots, fouls threshold families',
    groupedDemo: true,
  },
]

function GroupedDemo() {
  return (
    <div className="tpl">
      <button type="button" className="opt opt-full">
        Most Competitive
      </button>
      <div className="grouped-sides">
        <div className="grouped-side">
          <button type="button" className="opt">
            Home Most Comp.
          </button>
          {['1+', '2+', '3+', '4+', '5+'].map((label) => (
            <button key={`h-${label}`} type="button" className="opt">
              {label}
            </button>
          ))}
        </div>
        <div className="grouped-side">
          <button type="button" className="opt">
            Away Most Comp.
          </button>
          {['1+', '2+', '3+', '4+', '5+'].map((label) => (
            <button key={`a-${label}`} type="button" className="opt">
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TemplateGallery({
  counts,
}: {
  counts: Partial<Record<TemplateCode | 'GROUPED', number>>
}) {
  return (
    <main className="catalog template-gallery">
      {TEMPLATE_SHOWCASES.map((item) => (
        <article key={item.code} className="market template-card" id={`template-${item.code}`}>
          <header className="market-head">
            <div className="template-card-top">
              <h2 className="market-name">{item.name}</h2>
              {counts[item.code] != null && (
                <span className="template-count">
                  {counts[item.code]} market{counts[item.code] === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <p className="market-desc">{item.summary}</p>
            <p className="template-used">Used for: {item.usedFor}</p>
          </header>
          {item.groupedDemo ? (
            <GroupedDemo />
          ) : item.template ? (
            <TemplateBody template={item.template} />
          ) : null}
        </article>
      ))}
    </main>
  )
}
