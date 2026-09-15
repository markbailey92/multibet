import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import type { SavedMultibet } from '../lib/savedTemplates'
import { useSheetData } from '../context/SheetDataContext'
import { MATCH_PHASES, type MatchPhase } from '../lib/sports'

type PhaseFilter = 'all' | MatchPhase

function templateMarketTypes(template: SavedMultibet): string[] {
  const names = new Set<string>()
  for (const leg of template.legs) {
    const label = (leg.marketName || leg.detail || leg.marketTypeId || '').trim()
    if (label) names.add(label)
  }
  return [...names]
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

  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all')
  const [marketTypeFilter, setMarketTypeFilter] = useState('all')
  const [competitionFilter, setCompetitionFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

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
    const byId = new Map<string, string>()
    for (const sport of sports) {
      for (const competition of sport.competitions) {
        byId.set(competition.id, competition.name)
      }
    }
    for (const template of templates) {
      const sport = getSport(template.sportId)
      for (const id of template.competitionIds) {
        const known = sport.competitions.find((c) => c.id === id)
        if (known) byId.set(known.id, known.name)
        else if (!byId.has(id)) byId.set(id, id)
      }
    }
    return [...byId.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [templates, sports, getSport])

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
      if (query && !template.name.toLowerCase().includes(query)) {
        return false
      }
      return true
    })
  }, [templates, phaseFilter, marketTypeFilter, competitionFilter, searchQuery])

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

  return (
    <main className="home">
      <section className="home-hero">
        <div>
          <h1 className="home-title">Your multibet templates</h1>
          <p className="home-lede">
            Create reusable selection templates, then open them to edit legs.
          </p>
        </div>
        <button type="button" className="home-create" onClick={onCreate}>
          Create template
        </button>
      </section>

      {templates.length > 0 && (
        <section className="home-filters" aria-label="Filter templates">
          <div className="cat-tabs-bar home-filter-row">
            <nav className="cat-tabs" aria-label="Match phase">
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
            <label className="cat-search">
              <span className="sr-only">Search templates by name</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search"
                aria-label="Search templates by name"
              />
            </label>
          </div>

          <div className="home-filter-block">
            <p className="home-filter-label">Market type</p>
            <div className="cat-tabs-bar home-filter-row">
              <nav className="cat-tabs" aria-label="Market type">
                <button
                  type="button"
                  className={marketTypeFilter === 'all' ? 'is-active' : ''}
                  onClick={() => setMarketTypeFilter('all')}
                >
                  All
                </button>
                {marketTypeOptions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className={marketTypeFilter === name ? 'is-active' : ''}
                    onClick={() => setMarketTypeFilter(name)}
                  >
                    {name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          <div className="home-filter-block">
            <p className="home-filter-label">Competition</p>
            <div className="cat-tabs-bar home-filter-row">
              <nav className="cat-tabs" aria-label="Competition">
                <button
                  type="button"
                  className={competitionFilter === 'all' ? 'is-active' : ''}
                  onClick={() => setCompetitionFilter('all')}
                >
                  All
                </button>
                {competitionOptions.map((competition) => (
                  <button
                    key={competition.id}
                    type="button"
                    className={
                      competitionFilter === competition.id ? 'is-active' : ''
                    }
                    onClick={() => setCompetitionFilter(competition.id)}
                  >
                    {competition.name}
                  </button>
                ))}
              </nav>
            </div>
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
                          onClick={() => {
                            setMenuId(null)
                            if (window.confirm(`Delete “${template.name}”?`)) {
                              onDelete(template.id)
                            }
                          }}
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
                            <span className="betslip-competition">
                              {competition.name}
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
