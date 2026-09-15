import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { SavedMultibet } from '../lib/savedTemplates'
import { useSheetData } from '../context/SheetDataContext'
import { MATCH_PHASES, type MatchPhase } from '../lib/sports'
import { CompetitionBadge } from './CompetitionBadge'

type PhaseFilter = 'all' | MatchPhase
type HomeView = 'cards' | 'table'
type SortKey =
  | 'name'
  | 'sport'
  | 'phase'
  | 'legs'
  | 'markets'
  | 'competitions'
  | 'updated'
type SortDir = 'asc' | 'desc'

const VIEW_STORAGE_KEY = 'multibet.home.view.v1'

const SORT_COLUMNS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'sport', label: 'Sport' },
  { key: 'phase', label: 'Phase' },
  { key: 'legs', label: 'Legs' },
  { key: 'markets', label: 'Market types' },
  { key: 'competitions', label: 'Competitions' },
  { key: 'updated', label: 'Updated' },
]

function readHomeView(): HomeView {
  try {
    const raw = localStorage.getItem(VIEW_STORAGE_KEY)
    if (raw === 'cards' || raw === 'table') return raw
  } catch {
    /* ignore */
  }
  return 'cards'
}

function templateMarketTypes(template: SavedMultibet): string[] {
  const names = new Set<string>()
  for (const leg of template.legs) {
    const label = (leg.marketName || leg.detail || leg.marketTypeId || '').trim()
    if (label) names.add(label)
  }
  return [...names]
}

function formatPhase(template: SavedMultibet): string {
  return MATCH_PHASES.filter((phase) => template.phases.includes(phase.id))
    .map((phase) => phase.name)
    .join(', ')
}

function formatUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return '—'
  }
}

export function TemplatesHome({
  templates,
  onCreate,
  onEdit,
  onDelete,
}: {
  templates: SavedMultibet[]
  onCreate: () => void
  onEdit: (template: SavedMultibet) => void
  onDelete: (id: string) => void
}) {
  const { getSport, sports } = useSheetData()
  const [menuId, setMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<HomeView>(readHomeView)

  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all')
  const [marketTypeFilter, setMarketTypeFilter] = useState('all')
  const [competitionFilter, setCompetitionFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('updated')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_STORAGE_KEY, view)
    } catch {
      /* ignore */
    }
  }, [view])

  useEffect(() => {
    if (!menuId) return
    const onPointer = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuId(null)
      }
    }
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') setMenuId(null)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuId])

  const marketTypeOptions = useMemo(() => {
    const names = new Set<string>()
    for (const template of templates) {
      for (const name of templateMarketTypes(template)) names.add(name)
    }
    return [...names].sort((a, b) => a.localeCompare(b))
  }, [templates])

  const competitionOptions = useMemo(() => {
    const soccer = sports.find((sport) => sport.id === 'soccer') ?? getSport('soccer')
    return soccer.competitions
      .map((competition) => ({ id: competition.id, name: competition.name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [sports, getSport])

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return templates.filter((template) => {
      if (phaseFilter !== 'all' && !template.phases.includes(phaseFilter)) {
        return false
      }
      if (
        marketTypeFilter !== 'all' &&
        !templateMarketTypes(template).includes(marketTypeFilter)
      ) {
        return false
      }
      if (
        competitionFilter !== 'all' &&
        !template.competitionIds.includes(competitionFilter)
      ) {
        return false
      }
      if (query) {
        const nameMatch = template.name.toLowerCase().includes(query)
        const marketMatch = templateMarketTypes(template).some((market) =>
          market.toLowerCase().includes(query),
        )
        if (!nameMatch && !marketMatch) return false
      }
      return true
    })
  }, [templates, phaseFilter, marketTypeFilter, competitionFilter, searchQuery])

  const sorted = useMemo(() => {
    const list = [...filtered]
    const dir = sortDir === 'asc' ? 1 : -1

    list.sort((a, b) => {
      const sportA = getSport(a.sportId)
      const sportB = getSport(b.sportId)
      const compsA = sportA.competitions.filter((c) => a.competitionIds.includes(c.id))
      const compsB = sportB.competitions.filter((c) => b.competitionIds.includes(c.id))
      const compsLabel = (
        sportComps: typeof compsA,
        allCount: number,
      ) => {
        if (sportComps.length === 0) return ''
        if (sportComps.length === allCount) return 'All'
        return sportComps.map((c) => c.name).join(', ')
      }

      let cmp = 0
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'sport':
          cmp = sportA.name.localeCompare(sportB.name)
          break
        case 'phase':
          cmp = formatPhase(a).localeCompare(formatPhase(b))
          break
        case 'legs':
          cmp = a.legs.length - b.legs.length
          break
        case 'markets':
          cmp = templateMarketTypes(a)
            .join(', ')
            .localeCompare(templateMarketTypes(b).join(', '))
          break
        case 'competitions':
          cmp = compsLabel(compsA, sportA.competitions.length).localeCompare(
            compsLabel(compsB, sportB.competitions.length),
          )
          break
        case 'updated':
          cmp =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }
      if (cmp === 0) cmp = a.name.localeCompare(b.name)
      return cmp * dir
    })

    return list
  }, [filtered, sortKey, sortDir, getSport])

  const filtersActive =
    phaseFilter !== 'all' ||
    marketTypeFilter !== 'all' ||
    competitionFilter !== 'all' ||
    searchQuery.trim().length > 0

  function clearFilters() {
    setPhaseFilter('all')
    setMarketTypeFilter('all')
    setCompetitionFilter('all')
    setSearchQuery('')
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'updated' || key === 'legs' ? 'desc' : 'asc')
  }

  function confirmDelete(template: SavedMultibet) {
    setMenuId(null)
    if (window.confirm(`Delete “${template.name}”?`)) {
      onDelete(template.id)
    }
  }

  return (
    <main className="home">
      <section className="home-hero">
        <div>
          <h1 className="home-title">Your multibet templates</h1>
          <p className="home-lede">
            Create reusable selection templates, then open them to edit legs.
          </p>
        </div>
        <div className="home-hero-actions">
          {templates.length > 0 && (
            <div className="mode-toggle home-view-toggle" role="group" aria-label="Template view">
              <button
                type="button"
                className={view === 'cards' ? 'is-active' : ''}
                aria-pressed={view === 'cards'}
                onClick={() => setView('cards')}
              >
                Cards
              </button>
              <button
                type="button"
                className={view === 'table' ? 'is-active' : ''}
                aria-pressed={view === 'table'}
                onClick={() => setView('table')}
              >
                Table
              </button>
            </div>
          )}
          <button type="button" className="home-create" onClick={onCreate}>
            Create template
          </button>
        </div>
      </section>

      {templates.length > 0 && (
        <section className="home-filters" aria-label="Filter templates">
          <div className="cat-tabs-bar home-filter-row">
            <nav className="cat-tabs home-filter-phases" aria-label="Match phase">
              <button
                type="button"
                className={phaseFilter === 'all' ? 'is-active' : ''}
                onClick={() => setPhaseFilter('all')}
              >
                All
              </button>
              {MATCH_PHASES.map((phase) => (
                <button
                  key={phase.id}
                  type="button"
                  className={phaseFilter === phase.id ? 'is-active' : ''}
                  onClick={() => setPhaseFilter(phase.id)}
                >
                  {phase.name}
                </button>
              ))}
            </nav>

            <nav className="cat-tabs home-filter-competitions" aria-label="Competition">
              <button
                type="button"
                className={competitionFilter === 'all' ? 'is-active' : ''}
                onClick={() => setCompetitionFilter('all')}
              >
                All comps
              </button>
              {competitionOptions.map((competition) => (
                <button
                  key={competition.id}
                  type="button"
                  className={`home-filter-comp-btn ${
                    competitionFilter === competition.id ? 'is-active' : ''
                  }`}
                  title={competition.name}
                  aria-label={competition.name}
                  onClick={() => setCompetitionFilter(competition.id)}
                >
                  <CompetitionBadge
                    id={competition.id}
                    name={competition.name}
                    size="sm"
                  />
                </button>
              ))}
            </nav>

            <label className="home-filter-select-wrap">
              <span className="sr-only">Market type</span>
              <select
                id="home-market-type"
                className="home-filter-select"
                value={marketTypeFilter}
                onChange={(event) => setMarketTypeFilter(event.target.value)}
                aria-label="Filter by market type"
              >
                <option value="all">All market types</option>
                {marketTypeOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </label>

            <label className="cat-search">
              <span className="sr-only">Search templates by name or market type</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search"
                aria-label="Search templates by name or market type"
              />
            </label>
          </div>
        </section>
      )}

      {templates.length === 0 ? (
        <div className="home-empty">
          <p>No templates yet.</p>
          <p>Create one to start building legs from the market catalog.</p>
          <button type="button" className="home-create home-create-secondary" onClick={onCreate}>
            Create your first template
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="home-empty">
          <p>No templates match these filters.</p>
          {filtersActive && (
            <button
              type="button"
              className="home-create home-create-secondary"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : view === 'table' ? (
        <div className="home-table-wrap">
          <table className="home-table">
            <thead>
              <tr>
                {SORT_COLUMNS.map((column) => {
                  const active = sortKey === column.key
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        active
                          ? sortDir === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <button
                        type="button"
                        className={`home-table-sort ${active ? 'is-active' : ''}`}
                        onClick={() => toggleSort(column.key)}
                      >
                        <span>{column.label}</span>
                        <span className="home-table-sort-icon" aria-hidden>
                          {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                      </button>
                    </th>
                  )
                })}
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((template) => {
                const sport = getSport(template.sportId)
                const selectedCompetitions = sport.competitions.filter((competition) =>
                  template.competitionIds.includes(competition.id),
                )
                const markets = templateMarketTypes(template)
                const menuOpen = menuId === template.id
                const menuDomId = `home-table-menu-${template.id}`

                return (
                  <tr
                    key={template.id}
                    className="home-table-row"
                    tabIndex={0}
                    aria-label={`Open ${template.name}`}
                    onClick={() => {
                      setMenuId(null)
                      onEdit(template)
                    }}
                    onKeyDown={(event: KeyboardEvent<HTMLTableRowElement>) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setMenuId(null)
                        onEdit(template)
                      }
                    }}
                  >
                    <td className="home-table-name">
                      <span className="home-table-title">{template.name}</span>
                    </td>
                    <td>{sport.name}</td>
                    <td>{formatPhase(template) || '—'}</td>
                    <td>{template.legs.length}</td>
                    <td className="home-table-markets">
                      {markets.length === 0 ? '—' : markets.join(', ')}
                    </td>
                    <td className="home-table-comps">
                      {selectedCompetitions.length === 0 ? (
                        '—'
                      ) : selectedCompetitions.length ===
                        sport.competitions.length ? (
                        <span className="home-table-all-comps">All</span>
                      ) : (
                        <span className="competition-badge-row">
                          {selectedCompetitions.map((competition) => (
                            <CompetitionBadge
                              key={competition.id}
                              id={competition.id}
                              name={competition.name}
                              size="sm"
                            />
                          ))}
                        </span>
                      )}
                    </td>
                    <td className="home-table-date">
                      {formatUpdated(template.updatedAt)}
                    </td>
                    <td
                      className="home-table-actions"
                      onClick={(event) => event.stopPropagation()}
                      onKeyDown={(event) => event.stopPropagation()}
                    >
                      <div
                        className="home-card-menu"
                        ref={menuOpen ? menuRef : undefined}
                      >
                        <button
                          type="button"
                          className={`home-card-menu-trigger ${menuOpen ? 'is-open' : ''}`}
                          aria-label={`Actions for ${template.name}`}
                          aria-haspopup="menu"
                          aria-expanded={menuOpen}
                          aria-controls={menuDomId}
                          onClick={() =>
                            setMenuId((current) =>
                              current === template.id ? null : template.id,
                            )
                          }
                        >
                          ⋮
                        </button>
                        {menuOpen && (
                          <div
                            id={menuDomId}
                            className="home-card-menu-dropdown"
                            role="menu"
                            aria-label={`${template.name} actions`}
                          >
                            <button
                              type="button"
                              className="home-card-menu-item is-danger"
                              role="menuitem"
                              onClick={() => confirmDelete(template)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="home-list">
          {filtered.map((template) => {
            const sport = getSport(template.sportId)
            const selectedPhases = MATCH_PHASES.filter((phase) =>
              template.phases.includes(phase.id),
            )
            const selectedCompetitions = sport.competitions.filter((competition) =>
              template.competitionIds.includes(competition.id),
            )
            const menuOpen = menuId === template.id
            const menuDomId = `home-card-menu-${template.id}`

            function openTemplate() {
              setMenuId(null)
              onEdit(template)
            }

            function onCardKeyDown(event: KeyboardEvent<HTMLLIElement>) {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                openTemplate()
              }
            }

            return (
              <li
                key={template.id}
                className="home-card betslip-card"
                role="button"
                tabIndex={0}
                aria-label={`Open ${template.name}`}
                onClick={openTemplate}
                onKeyDown={onCardKeyDown}
              >
                <header className="betslip-head home-card-head">
                  <div className="home-card-title-block">
                    <h2 className="betslip-title">{template.name}</h2>
                    <p className="betslip-meta">{sport.name}</p>
                  </div>

                  <div
                    className="home-card-menu"
                    ref={menuOpen ? menuRef : undefined}
                    onClick={(event) => event.stopPropagation()}
                    onKeyDown={(event) => event.stopPropagation()}
                  >
                    <button
                      type="button"
                      className={`home-card-menu-trigger ${menuOpen ? 'is-open' : ''}`}
                      aria-label={`Actions for ${template.name}`}
                      aria-haspopup="menu"
                      aria-expanded={menuOpen}
                      aria-controls={menuDomId}
                      onClick={() =>
                        setMenuId((current) =>
                          current === template.id ? null : template.id,
                        )
                      }
                    >
                      ⋮
                    </button>

                    {menuOpen && (
                      <div
                        id={menuDomId}
                        className="home-card-menu-dropdown"
                        role="menu"
                        aria-label={`${template.name} actions`}
                      >
                        <button
                          type="button"
                          className="home-card-menu-item is-danger"
                          role="menuitem"
                          onClick={() => confirmDelete(template)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </header>

                <div className="home-card-body">
                  {selectedPhases.length > 0 && (
                    <ul className="betslip-phases" aria-label="Match phases">
                      {selectedPhases.map((phase) => (
                        <li key={phase.id}>
                          <span className="betslip-phase">{phase.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {template.legs.length === 0 ? (
                    <p className="betslip-empty">No legs saved yet.</p>
                  ) : (
                    <ul className="betslip-legs">
                      {template.legs.map((leg) => (
                        <li key={leg.id} className="betslip-leg">
                          <span className="betslip-bullet" aria-hidden />
                          <div className="betslip-leg-text">
                            <span className="betslip-selection">{leg.selection}</span>
                            <span className="betslip-detail"> — {leg.detail}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div
                    className="betslip-targeting"
                    aria-label={`${sport.name} competitions`}
                  >
                    {selectedCompetitions.length === 0 ? (
                      <p className="betslip-targeting-empty">No competitions selected</p>
                    ) : (
                      <ul className="betslip-competitions">
                        {selectedCompetitions.map((competition) => (
                          <li key={competition.id}>
                            <span className="betslip-competition betslip-competition-badge">
                              <CompetitionBadge
                                id={competition.id}
                                name={competition.name}
                                size="sm"
                              />
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
