import { useEffect, useMemo, useRef, useState } from 'react'
import { AppHeader } from './AppHeader'
import { GroupedMarketBlock, MarketBlock } from './Templates'
import { TemplateGallery } from './TemplateGallery'
import { Betslip } from './Betslip'
import { useSheetData } from '../context/SheetDataContext'
import {
  MATCH_PHASES,
  allCompetitionIdsFor,
  type MatchPhase,
  type SportId,
} from '../lib/sports'
import {
  buildCatalog,
  itemMatchesCategory,
  itemMatchesPhases,
  itemMatchesSearch,
  thresholdGroupKey,
} from '../lib/groupMarkets'
import { useLegs } from '../context/LegsContext'
import type { TemplateCode } from '../types'

const CATEGORY_ORDER = [
  'ALL',
  'Goals',
  'Corners',
  'Cards',
  'Bookings',
  'Shots',
  'Player',
  'Assists',
  'Fouls',
] as const

type BuilderTab = 'markets' | 'layouts'

function formatSyncedAt(date: Date | null): string {
  if (!date) return 'not synced'
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function BuilderOverlay({
  title,
  templateId,
  templateName,
  initialSportId,
  initialCompetitionIds,
  initialPhases,
  onClose,
  onSaved,
}: {
  title: string
  templateId: string | null
  templateName: string
  initialSportId: SportId
  initialCompetitionIds: string[]
  initialPhases: MatchPhase[]
  onClose: () => void
  onSaved: (id: string) => void
}) {
  const { markets, sports, status, lastSyncedAt, error, source, refresh, getSport } =
    useSheetData()
  const { clearLegs } = useLegs()
  const [tab, setTab] = useState<BuilderTab>('markets')
  const [category, setCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [mode, setMode] = useState<'grouped' | 'flat'>('grouped')
  const [name, setName] = useState(templateName)
  const [sportId, setSportId] = useState<SportId>(initialSportId)
  const [competitionIds, setCompetitionIds] = useState<string[]>(initialCompetitionIds)
  const [phases, setPhases] = useState<MatchPhase[]>(initialPhases)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const settingsRef = useRef<HTMLDivElement>(null)

  const sport = getSport(sportId)

  useEffect(() => {
    setName(templateName)
  }, [templateName])

  useEffect(() => {
    setSportId(initialSportId)
    setCompetitionIds(initialCompetitionIds)
    setPhases(initialPhases)
  }, [initialSportId, initialCompetitionIds, initialPhases])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !settingsOpen) onClose()
    }
    document.body.classList.add('builder-open')
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('builder-open')
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose, settingsOpen])

  useEffect(() => {
    if (!settingsOpen) return
    const onPointer = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [settingsOpen])

  const tabs = useMemo(() => {
    const present = new Set(markets.flatMap((m) => m.categories))
    return CATEGORY_ORDER.filter((c) => c === 'ALL' || present.has(c))
  }, [markets])

  const catalog = useMemo(() => buildCatalog(markets, mode), [markets, mode])

  const visible = useMemo(
    () =>
      catalog.filter(
        (item) =>
          itemMatchesCategory(item, category) &&
          itemMatchesPhases(item, phases) &&
          itemMatchesSearch(item, searchQuery),
      ),
    [catalog, category, phases, searchQuery],
  )

  const templateCounts = useMemo(() => {
    const counts: Partial<Record<TemplateCode | 'GROUPED', number>> = {}
    const groupedIds = new Set<string>()
    for (const market of markets) {
      counts[market.code] = (counts[market.code] ?? 0) + 1
      const key = thresholdGroupKey(market.id)
      if (key) groupedIds.add(key)
    }
    counts.GROUPED = groupedIds.size
    return counts
  }, [markets])

  function handleClose() {
    clearLegs()
    onClose()
  }

  function selectSport(next: SportId) {
    setSportId(next)
    setCompetitionIds(allCompetitionIdsFor(sports, next))
  }

  function toggleCompetition(id: string) {
    setCompetitionIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  function togglePhase(id: MatchPhase) {
    setPhases((current) =>
      current.includes(id)
        ? current.filter((phase) => phase !== id)
        : [...current, id],
    )
  }

  return (
    <div className="builder-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <div className="builder-shell">
        <AppHeader />
        <header className="topbar builder-topbar">
          <div className="brand">
            <button type="button" className="builder-back" onClick={handleClose}>
              ← Templates
            </button>
            <div className="builder-title-block">
              <input
                className="builder-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-label="Template name"
                placeholder="Template name"
              />
            </div>
          </div>
          <div className="topbar-right">
            <div className="settings-menu" ref={settingsRef}>
              <button
                type="button"
                className={`settings-trigger ${settingsOpen ? 'is-open' : ''}`}
                aria-expanded={settingsOpen}
                aria-haspopup="menu"
                aria-controls="builder-settings"
                onClick={() => setSettingsOpen((open) => !open)}
              >
                <span className={`sync-dot is-${status}`} aria-hidden />
                Settings
                <span className="settings-chevron" aria-hidden>
                  ▾
                </span>
              </button>

              {settingsOpen && (
                <div
                  id="builder-settings"
                  className="settings-dropdown"
                  role="menu"
                  aria-label="Builder settings"
                >
                  <div className="settings-section">
                    <p className="settings-label">Builder view</p>
                    <div className="mode-toggle" role="group" aria-label="Builder view">
                      <button
                        type="button"
                        className={tab === 'markets' ? 'is-active' : ''}
                        onClick={() => setTab('markets')}
                      >
                        Markets
                      </button>
                      <button
                        type="button"
                        className={tab === 'layouts' ? 'is-active' : ''}
                        onClick={() => setTab('layouts')}
                      >
                        Layouts
                      </button>
                    </div>
                  </div>

                  <div className="settings-section">
                    <p className="settings-label">Sheet sync</p>
                    <div
                      className={`sync-bar is-${status}`}
                      role="status"
                      title={error ?? undefined}
                    >
                      <span className="sync-dot" aria-hidden />
                      <span className="sync-label">
                        {status === 'loading' && 'Connecting…'}
                        {status === 'live' && `Live · ${formatSyncedAt(lastSyncedAt)}`}
                        {status === 'cached' && `Cached · ${formatSyncedAt(lastSyncedAt)}`}
                        {status === 'error' && `Sync error · ${source}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="settings-action"
                      onClick={() => void refresh()}
                    >
                      Refresh sheet
                    </button>
                  </div>

                  {tab === 'markets' && (
                    <div className="settings-section">
                      <p className="settings-label">Market layout</p>
                      <div className="mode-toggle" role="group" aria-label="Market layout">
                        <button
                          type="button"
                          className={mode === 'grouped' ? 'is-active' : ''}
                          onClick={() => setMode('grouped')}
                        >
                          Grouped
                        </button>
                        <button
                          type="button"
                          className={mode === 'flat' ? 'is-active' : ''}
                          onClick={() => setMode('flat')}
                        >
                          Flat
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={`app-body ${tab === 'markets' ? 'has-betslip' : ''}`}>
          <div className="app-main">
            <section className="targeting" aria-labelledby="targeting-heading">
              <h2 id="targeting-heading" className="targeting-title">
                Template settings
              </h2>
              <div className="targeting-row">
                <p className="targeting-label">Phase</p>
                <div className="targeting-pills" role="group" aria-label="Match phase">
                  {MATCH_PHASES.map((phase) => {
                    const selected = phases.includes(phase.id)
                    return (
                      <button
                        key={phase.id}
                        type="button"
                        className={selected ? 'is-active' : ''}
                        aria-pressed={selected}
                        onClick={() => togglePhase(phase.id)}
                      >
                        {phase.name}
                      </button>
                    )
                  })}
                </div>
                {phases.length === 0 && (
                  <p className="targeting-hint">Select at least one phase.</p>
                )}
              </div>

              <div className="targeting-row">
                <p className="targeting-label">Sport</p>
                <div className="targeting-pills" role="group" aria-label="Sport">
                  {sports.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={sportId === item.id ? 'is-active' : ''}
                      onClick={() => selectSport(item.id)}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="targeting-row">
                <p className="targeting-label">Competitions</p>
                <div className="targeting-pills" role="group" aria-label="Competitions">
                  {sport.competitions.map((competition) => {
                    const selected = competitionIds.includes(competition.id)
                    return (
                      <button
                        key={competition.id}
                        type="button"
                        className={selected ? 'is-active' : ''}
                        aria-pressed={selected}
                        onClick={() => toggleCompetition(competition.id)}
                      >
                        {competition.name}
                      </button>
                    )
                  })}
                </div>
                {competitionIds.length === 0 && (
                  <p className="targeting-hint">Select at least one competition.</p>
                )}
              </div>
            </section>

            {tab === 'markets' ? (
              <>
                <div className="cat-tabs-bar">
                  <nav className="cat-tabs" aria-label="Market categories">
                    {tabs.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className={category === item ? 'is-active' : ''}
                        onClick={() => setCategory(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </nav>
                  <label className="cat-search">
                    <span className="sr-only">Search markets by name or Multibet Market Type Id</span>
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search"
                      aria-label="Search markets by name or Multibet Market Type Id"
                    />
                  </label>
                </div>

                <main className="catalog">
                  {visible.length === 0 ? (
                    <p className="catalog-empty">
                      {searchQuery.trim()
                        ? `No markets matching “${searchQuery.trim()}”.`
                        : 'No markets match the current filters.'}
                    </p>
                  ) : null}
                  {visible.map((item) =>
                    item.kind === 'single' ? (
                      <MarketBlock key={item.market.id} market={item.market} />
                    ) : (
                      <GroupedMarketBlock
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        description={item.description}
                        members={item.members}
                      />
                    ),
                  )}
                </main>
              </>
            ) : (
              <TemplateGallery counts={templateCounts} />
            )}
          </div>

          {tab === 'markets' && (
            <Betslip
              templateId={templateId}
              templateName={name}
              sportId={sportId}
              competitionIds={competitionIds}
              phases={phases}
              onSaved={(saved) => {
                setName(saved.name)
                onSaved(saved.id)
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
