import type { Leg, Market, MarketTemplate } from '../types'
import { useLegs } from '../context/LegsContext'
import { useEffect, useRef, useState, type ReactNode } from 'react'

type MarketCtx = {
  scopeId: string
  marketTypeId: string
  marketName: string
}

function MarketPhaseBadges({
  preMatch,
  inPlay,
}: {
  preMatch: boolean
  inPlay: boolean
}) {
  if (!preMatch && !inPlay) return null

  return (
    <div className="market-meta" aria-label="Available phases">
      {preMatch && <span className="phase-pill">Pre-Match</span>}
      {inPlay && <span className="phase-pill phase-pill-inplay">In Play</span>}
    </div>
  )
}

function Opt({
  children,
  selected,
  onClick,
  className = '',
  title,
  disabled,
}: {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
  className?: string
  title?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      className={`opt ${selected ? 'is-selected' : ''} ${className}`}
      onClick={onClick}
      title={title}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

function makeLeg(
  ctx: MarketCtx,
  selectionKey: string,
  selectionLabel: string,
): Leg {
  return {
    id: `${ctx.scopeId}::${selectionKey}`,
    scopeId: ctx.scopeId,
    marketTypeId: ctx.marketTypeId,
    marketName: ctx.marketName,
    selection: selectionLabel,
    detail: ctx.marketName,
  }
}

export function TemplateBody({
  template,
  market,
}: {
  template: MarketTemplate
  market?: MarketCtx
}) {
  switch (template.code) {
    case 'MC12':
      return <MC12 options={template.options} market={market} />
    case 'MC123':
      return <MC123 options={template.options} market={market} />
    case 'MC12345':
      return <MC12345 numbers={template.numbers} market={market} />
    case 'MC1212345':
      return (
        <MC1212345
          side1={template.side1}
          side2={template.side2}
          lines={template.lines}
          market={market}
        />
      )
    case 'MC12312345':
      return (
        <MC12312345
          homeScores={template.homeScores}
          drawScores={template.drawScores}
          awayScores={template.awayScores}
          market={market}
        />
      )
  }
}

function useScopeSelection(market?: MarketCtx) {
  const { getScopeLeg, setScopeLeg, atCapacity } = useLegs()
  const scopeLeg = market ? getScopeLeg(market.scopeId) : undefined
  const selectedKey = scopeLeg
    ? scopeLeg.id.slice(scopeLeg.id.lastIndexOf('::') + 2)
    : null

  function select(selectionKey: string, selectionLabel: string) {
    if (!market) return
    const leg = makeLeg(market, selectionKey, selectionLabel)
    if (scopeLeg?.id === leg.id) {
      setScopeLeg(market.scopeId, null)
      return
    }
    setScopeLeg(market.scopeId, leg)
  }

  return { selectedKey, select, atCapacity, scopeLeg }
}

function MC12({
  options,
  market,
}: {
  options: string[]
  market?: MarketCtx
}) {
  const { selectedKey, select } = useScopeSelection(market)
  const [local, setLocal] = useState<string | null>(null)
  const active = market ? selectedKey : local

  function pick(key: string, label: string) {
    if (market) select(key, label)
    else setLocal((cur) => (cur === key ? null : key))
  }

  return (
    <div className="tpl">
      <Opt
        className="opt-full"
        selected={active === 'mc'}
        onClick={() => pick('mc', 'Most Competitive')}
      >
        Most Competitive
      </Opt>
      <div className="tpl-row">
        {options.map((label) => (
          <Opt
            key={label}
            selected={active === label}
            onClick={() => pick(label, label)}
          >
            {label}
          </Opt>
        ))}
      </div>
    </div>
  )
}

function MC123({
  options,
  market,
}: {
  options: string[]
  market?: MarketCtx
}) {
  const { selectedKey, select } = useScopeSelection(market)
  const [local, setLocal] = useState<string | null>(null)
  const active = market ? selectedKey : local

  function pick(key: string, label: string) {
    if (market) select(key, label)
    else setLocal((cur) => (cur === key ? null : key))
  }

  return (
    <div className="tpl">
      <Opt
        className="opt-full"
        selected={active === 'mc'}
        onClick={() => pick('mc', 'Most Competitive')}
      >
        Most Competitive
      </Opt>
      <div className="tpl-row">
        {options.map((label) => (
          <Opt
            key={label}
            selected={active === label}
            onClick={() => pick(label, label)}
          >
            {label}
          </Opt>
        ))}
      </div>
    </div>
  )
}

function MC12345({
  numbers,
  market,
}: {
  numbers: string[]
  market?: MarketCtx
}) {
  const { selectedKey, select } = useScopeSelection(market)
  const [local, setLocal] = useState<string | null>(null)
  const active = market ? selectedKey : local

  function pick(key: string, label: string) {
    if (market) select(key, label)
    else setLocal((cur) => (cur === key ? null : key))
  }

  return (
    <div className="tpl">
      <Opt
        className="opt-full"
        selected={active === 'mc'}
        onClick={() => pick('mc', 'Most Competitive')}
      >
        Most Competitive
      </Opt>
      <div className="tpl-grid cols-4">
        {numbers.map((n) => (
          <Opt key={n} selected={active === n} onClick={() => pick(n, n)}>
            {n}
          </Opt>
        ))}
      </div>
    </div>
  )
}

function MC1212345({
  side1,
  side2,
  lines,
  market,
}: {
  side1: string
  side2: string
  lines: string[]
  market?: MarketCtx
}) {
  const { selectedKey, select } = useScopeSelection(market)
  const [local, setLocal] = useState<string | null>(null)
  const active = market ? selectedKey : local
  const colA = lines.filter((_, i) => i % 2 === 0)
  const colB = lines.filter((_, i) => i % 2 === 1)

  function pick(key: string, label: string) {
    if (market) select(key, label)
    else setLocal((cur) => (cur === key ? null : key))
  }

  return (
    <div className="tpl">
      <Opt
        className="opt-full"
        selected={active === 'mc'}
        onClick={() => pick('mc', 'Most Competitive')}
      >
        Most Competitive
      </Opt>
      <div className="tpl-row">
        <Opt
          selected={active === `${side1}-mc`}
          onClick={() => pick(`${side1}-mc`, `${side1} Most Comp.`)}
        >
          {side1} Most Comp.
        </Opt>
        <Opt
          selected={active === `${side2}-mc`}
          onClick={() => pick(`${side2}-mc`, `${side2} Most Comp.`)}
        >
          {side2} Most Comp.
        </Opt>
      </div>
      <div className="tpl-row tpl-sides">
        {[side1, side2].map((side) => (
          <div key={side} className="tpl-side-grid">
            {colA.map((line, i) => (
              <div key={`${side}-${line}`} className="tpl-line-pair">
                <Opt
                  selected={active === `${side}-${line}`}
                  onClick={() => pick(`${side}-${line}`, `${side} ${line}`)}
                >
                  {line}
                </Opt>
                {colB[i] != null && (
                  <Opt
                    selected={active === `${side}-${colB[i]}`}
                    onClick={() =>
                      pick(`${side}-${colB[i]}`, `${side} ${colB[i]}`)
                    }
                  >
                    {colB[i]}
                  </Opt>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function parseScore(value: string): { home: number; away: number } | null {
  const match = value.trim().match(/^(\d+)\s*[-–]\s*(\d+)$/)
  if (!match) return null
  return { home: Number(match[1]), away: Number(match[2]) }
}

function formatScore(home: number | null, away: number | null): string | null {
  if (home == null || away == null) return null
  return `${home}-${away}`
}

function MC12312345({
  homeScores,
  drawScores,
  awayScores,
  market,
}: {
  homeScores: string[]
  drawScores: string[]
  awayScores: string[]
  market?: MarketCtx
}) {
  const { getScopeLeg, setScopeLeg } = useLegs()
  const [variant, setVariant] = useState<'grid' | 'stepper'>('grid')
  const [mostCompetitive, setMostCompetitive] = useState(false)
  const [home, setHome] = useState<number | null>(null)
  const [away, setAway] = useState<number | null>(null)
  const hadLegRef = useRef(false)

  const scopeLeg = market ? getScopeLeg(market.scopeId) : undefined

  useEffect(() => {
    if (!market) return
    if (scopeLeg) {
      hadLegRef.current = true
      if (scopeLeg.id.endsWith('::mc')) {
        setMostCompetitive(true)
        setHome(null)
        setAway(null)
        return
      }
      const score = scopeLeg.id.slice(scopeLeg.id.lastIndexOf('::') + 2)
      const parsed = parseScore(score)
      if (parsed) {
        setMostCompetitive(false)
        setHome(parsed.home)
        setAway(parsed.away)
      }
      return
    }
    if (hadLegRef.current) {
      hadLegRef.current = false
      setMostCompetitive(false)
      setHome(null)
      setAway(null)
    }
  }, [market, scopeLeg])

  const selectedScore = mostCompetitive ? null : formatScore(home, away)

  function pushScore(nextHome: number | null, nextAway: number | null, mc: boolean) {
    if (!market) return
    if (mc) {
      setScopeLeg(market.scopeId, makeLeg(market, 'mc', 'Most Competitive'))
      return
    }
    if (nextHome == null || nextAway == null) {
      setScopeLeg(market.scopeId, null)
      return
    }
    const score = formatScore(nextHome, nextAway)!
    setScopeLeg(market.scopeId, makeLeg(market, score, score))
  }

  function selectMostCompetitive() {
    if (mostCompetitive) {
      setMostCompetitive(false)
      pushScore(null, null, false)
      return
    }
    setMostCompetitive(true)
    setHome(null)
    setAway(null)
    pushScore(null, null, true)
  }

  function selectScore(score: string) {
    if (selectedScore === score) {
      setMostCompetitive(false)
      setHome(null)
      setAway(null)
      pushScore(null, null, false)
      return
    }
    const parsed = parseScore(score)
    if (!parsed) return
    setMostCompetitive(false)
    setHome(parsed.home)
    setAway(parsed.away)
    pushScore(parsed.home, parsed.away, false)
  }

  function changeHome(value: number | null) {
    setMostCompetitive(false)
    setHome(value)
    pushScore(value, away, false)
  }

  function changeAway(value: number | null) {
    setMostCompetitive(false)
    setAway(value)
    pushScore(home, value, false)
  }

  return (
    <div className="tpl">
      <div className="variant-tabs" role="tablist" aria-label="Score input style">
        <button
          type="button"
          role="tab"
          aria-selected={variant === 'grid'}
          className={variant === 'grid' ? 'is-active' : ''}
          onClick={() => setVariant('grid')}
        >
          Grid
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={variant === 'stepper'}
          className={variant === 'stepper' ? 'is-active' : ''}
          onClick={() => setVariant('stepper')}
        >
          Stepper
        </button>
      </div>

      <Opt
        className="opt-full"
        selected={mostCompetitive}
        onClick={selectMostCompetitive}
      >
        Most Competitive
      </Opt>

      {variant === 'grid' ? (
        <div className="score-cols">
          <div className="score-col">
            <div className="score-col-label">Home</div>
            {homeScores.map((s) => (
              <Opt
                key={`h-${s}`}
                selected={selectedScore === s}
                onClick={() => selectScore(s)}
              >
                {s}
              </Opt>
            ))}
          </div>
          <div className="score-col">
            <div className="score-col-label">Draw</div>
            {drawScores.map((s) => (
              <Opt
                key={`d-${s}`}
                selected={selectedScore === s}
                onClick={() => selectScore(s)}
              >
                {s}
              </Opt>
            ))}
          </div>
          <div className="score-col">
            <div className="score-col-label">Away</div>
            {awayScores.map((s) => (
              <Opt
                key={`a-${s}`}
                selected={selectedScore === s}
                onClick={() => selectScore(s)}
              >
                {s}
              </Opt>
            ))}
          </div>
        </div>
      ) : (
        <div className="stepper-row">
          <Stepper label="Home" value={home} onChange={changeHome} />
          <Stepper label="Away" value={away} onChange={changeAway} />
        </div>
      )}
    </div>
  )
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (n: number | null) => void
}) {
  function decrement() {
    if (value == null) return
    if (value <= 0) {
      onChange(null)
      return
    }
    onChange(value - 1)
  }

  function increment() {
    if (value == null) {
      onChange(0)
      return
    }
    onChange(Math.min(15, value + 1))
  }

  return (
    <div className="stepper">
      <div className="stepper-label">{label}</div>
      <div className="stepper-controls">
        <button
          type="button"
          className="opt"
          onClick={decrement}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <div className="opt stepper-value" aria-live="polite">
          {value == null ? '–' : value}
        </div>
        <button
          type="button"
          className="opt"
          onClick={increment}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  )
}

export function MarketBlock({ market }: { market: Market }) {
  return (
    <article className="market" id={market.id}>
      <header className="market-head">
        <MarketPhaseBadges preMatch={market.preMatch} inPlay={market.inPlay} />
        <h2 className="market-name">{market.name}</h2>
        <p className="market-desc">{market.description}</p>
      </header>
      <TemplateBody
        template={market.template}
        market={{
          scopeId: market.id,
          marketTypeId: market.id,
          marketName: market.name,
        }}
      />
    </article>
  )
}

export function GroupedMarketBlock({
  title,
  description,
  members,
  id,
}: {
  id: string
  title: string
  description: string
  members: Array<{ market: Market; threshold: number }>
}) {
  type SidePick = 'most-competitive' | number
  const { setScopeLeg, getScopeLeg, atCapacity } = useLegs()

  const overallScope = `${id}::overall`
  const homeScope = `${id}::home`
  const awayScope = `${id}::away`

  const overallLeg = getScopeLeg(overallScope)
  const homeLeg = getScopeLeg(homeScope)
  const awayLeg = getScopeLeg(awayScope)

  const overallMc = Boolean(overallLeg)
  const homePick: SidePick | null = homeLeg
    ? homeLeg.id.endsWith('::mc')
      ? 'most-competitive'
      : Number(homeLeg.id.split('::').pop())
    : null
  const awayPick: SidePick | null = awayLeg
    ? awayLeg.id.endsWith('::mc')
      ? 'most-competitive'
      : Number(awayLeg.id.split('::').pop())
    : null

  const legCount =
    (overallMc ? 1 : 0) + (homePick != null ? 1 : 0) + (awayPick != null ? 1 : 0)

  const preMatch = members.some((member) => member.market.preMatch)
  const inPlay = members.some((member) => member.market.inPlay)

  function clearSides() {
    setScopeLeg(homeScope, null)
    setScopeLeg(awayScope, null)
  }

  function memberMarketTypeId(threshold?: number): string | undefined {
    if (threshold != null) {
      return members.find((member) => member.threshold === threshold)?.market.id
    }
    return members[0]?.market.id
  }

  function selectOverallMc() {
    if (overallMc) {
      setScopeLeg(overallScope, null)
      return
    }
    clearSides()
    setScopeLeg(overallScope, {
      id: `${overallScope}::mc`,
      scopeId: overallScope,
      marketTypeId: memberMarketTypeId(),
      marketName: title,
      selection: 'Most Competitive',
      detail: title,
    })
  }

  function selectHome(pick: SidePick) {
    setScopeLeg(overallScope, null)
    const key = pick === 'most-competitive' ? 'mc' : String(pick)
    const label =
      pick === 'most-competitive' ? 'Home Most Comp.' : `Home ${pick}+`
    const legId = `${homeScope}::${key}`
    if (homeLeg?.id === legId) {
      setScopeLeg(homeScope, null)
      return
    }
    if (!homeLeg && atCapacity) return
    setScopeLeg(homeScope, {
      id: legId,
      scopeId: homeScope,
      marketTypeId: memberMarketTypeId(
        pick === 'most-competitive' ? undefined : pick,
      ),
      marketName: title,
      selection: label,
      detail: title,
    })
  }

  function selectAway(pick: SidePick) {
    setScopeLeg(overallScope, null)
    const key = pick === 'most-competitive' ? 'mc' : String(pick)
    const label =
      pick === 'most-competitive' ? 'Away Most Comp.' : `Away ${pick}+`
    const legId = `${awayScope}::${key}`
    if (awayLeg?.id === legId) {
      setScopeLeg(awayScope, null)
      return
    }
    if (!awayLeg && atCapacity) return
    setScopeLeg(awayScope, {
      id: legId,
      scopeId: awayScope,
      marketTypeId: memberMarketTypeId(
        pick === 'most-competitive' ? undefined : pick,
      ),
      marketName: title,
      selection: label,
      detail: title,
    })
  }

  return (
    <article className="market market-grouped" id={id}>
      <header className="market-head">
        <MarketPhaseBadges preMatch={preMatch} inPlay={inPlay} />
        <h2 className="market-name">{title}</h2>
        <p className="market-desc">{description}</p>
        {legCount > 0 && (
          <p className="market-legs">
            {legCount} leg{legCount === 1 ? '' : 's'} selected
          </p>
        )}
      </header>

      <div className="tpl">
        <Opt
          className="opt-full"
          selected={overallMc}
          onClick={selectOverallMc}
        >
          Most Competitive
        </Opt>

        <div className="grouped-sides">
          <div className="grouped-side">
            <Opt
              selected={homePick === 'most-competitive'}
              onClick={() => selectHome('most-competitive')}
              title="Most Competitive Home"
            >
              Home Most Comp.
            </Opt>
            {members.map(({ market, threshold }) => (
              <Opt
                key={`home-${market.id}`}
                selected={homePick === threshold}
                onClick={() => selectHome(threshold)}
                title={`${market.name} · Home`}
              >
                {threshold}+
              </Opt>
            ))}
          </div>
          <div className="grouped-side">
            <Opt
              selected={awayPick === 'most-competitive'}
              onClick={() => selectAway('most-competitive')}
              title="Most Competitive Away"
            >
              Away Most Comp.
            </Opt>
            {members.map(({ market, threshold }) => (
              <Opt
                key={`away-${market.id}`}
                selected={awayPick === threshold}
                onClick={() => selectAway(threshold)}
                title={`${market.name} · Away`}
              >
                {threshold}+
              </Opt>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
