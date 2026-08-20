import { useEffect, useMemo, useState } from 'react'
import { useLegs } from '../context/LegsContext'
import {
  upsertSavedTemplate,
  type SavedMultibet,
} from '../lib/savedTemplates'
import {
  buildTemplateExportPreview,
  exportIssueCounts,
} from '../lib/templateExport'
import { useSheetData } from '../context/SheetDataContext'
import { MATCH_PHASES, type MatchPhase, type SportId } from '../lib/sports'

export function Betslip({
  templateId,
  templateName,
  sportId,
  competitionIds,
  phases,
  onSaved,
}: {
  templateId: string | null
  templateName: string
  sportId: SportId
  competitionIds: string[]
  phases: MatchPhase[]
  onSaved?: (saved: SavedMultibet) => void
}) {
  const { getSport, markets, sports, productIds } = useSheetData()
  const { legs, maxLegs, removeLeg, clearLegs, atCapacity } = useLegs()
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const sport = getSport(sportId)
  const selectedCompetitions = sport.competitions.filter((competition) =>
    competitionIds.includes(competition.id),
  )
  const selectedPhases = MATCH_PHASES.filter((phase) => phases.includes(phase.id))

  const exportPreview = useMemo(
    () =>
      buildTemplateExportPreview({
        templateId,
        sportId,
        competitionIds,
        phases,
        legs,
        markets,
        sports,
        productIds,
      }),
    [
      templateId,
      sportId,
      competitionIds,
      phases,
      legs,
      markets,
      sports,
      productIds,
    ],
  )

  const exportCounts = exportIssueCounts(exportPreview.issues)

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.classList.add('betslip-sheet-open')
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.classList.remove('betslip-sheet-open')
    }
  }, [mobileOpen])

  function handleSave() {
    if (legs.length === 0 || competitionIds.length === 0 || phases.length === 0) return
    try {
      const saved = upsertSavedTemplate({
        id: templateId ?? undefined,
        name: templateName,
        sportId,
        competitionIds,
        phases,
        legs,
      })
      setSaveState('saved')
      onSaved?.(saved)
      window.setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('error')
      window.setTimeout(() => setSaveState('idle'), 2500)
    }
  }

  const saveDisabled =
    legs.length === 0 || competitionIds.length === 0 || phases.length === 0
  const saveLabel =
    saveState === 'saved'
      ? 'Saved'
      : saveState === 'error'
        ? 'Save failed'
        : competitionIds.length === 0
          ? 'Select a competition'
          : phases.length === 0
            ? 'Select a phase'
            : 'Save template'

  async function handleCopyExport() {
    try {
      await navigator.clipboard.writeText(exportPreview.json)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('error')
      window.setTimeout(() => setCopyState('idle'), 2500)
    }
  }

  function renderPanel() {
    return (
      <div className="betslip-card">
        <header className="betslip-head">
          <div className="betslip-fixture">
            <div>
              <h2 className="betslip-title">{templateName || 'Working multibet'}</h2>
              <p className="betslip-meta">{sport.name}</p>
            </div>
          </div>
          <p className={`betslip-count ${atCapacity ? 'is-full' : ''}`}>
            {legs.length} / {maxLegs} legs
          </p>
        </header>

        <div className="betslip-scroll">
          {selectedPhases.length > 0 && (
            <ul className="betslip-phases" aria-label="Match phases">
              {selectedPhases.map((phase) => (
                <li key={phase.id}>
                  <span className="betslip-phase">{phase.name}</span>
                </li>
              ))}
            </ul>
          )}

          {legs.length === 0 ? (
            <p className="betslip-empty">
              Select outcomes from markets to build up to {maxLegs} legs.
            </p>
          ) : (
            <ul className="betslip-legs">
              {legs.map((leg) => (
                <li key={leg.id} className="betslip-leg">
                  <span className="betslip-bullet" aria-hidden />
                  <div className="betslip-leg-text">
                    <span className="betslip-selection">{leg.selection}</span>
                    <span className="betslip-detail"> — {leg.detail}</span>
                  </div>
                  <button
                    type="button"
                    className="betslip-remove"
                    onClick={() => removeLeg(leg.id)}
                    aria-label={`Remove ${leg.selection} — ${leg.detail}`}
                  >
                    ×
                  </button>
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
                    <span className="betslip-competition">{competition.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            className={`betslip-export-toggle ${exportOpen ? 'is-open' : ''}`}
            onClick={() => setExportOpen((open) => !open)}
            aria-expanded={exportOpen}
          >
            <span>Export preview</span>
            {(exportCounts.errors > 0 || exportCounts.warnings > 0) && (
              <span className="betslip-export-badge">
                {exportCounts.errors > 0
                  ? `${exportCounts.errors} missing`
                  : `${exportCounts.warnings} note${exportCounts.warnings === 1 ? '' : 's'}`}
              </span>
            )}
          </button>

          {exportOpen && (
            <section className="betslip-export" aria-label="Generated template export">
              {exportPreview.issues.length > 0 && (
                <ul className="betslip-export-issues">
                  {exportPreview.issues.map((issue) => (
                    <li
                      key={`${issue.level}-${issue.field}-${issue.message}`}
                      className={`is-${issue.level}`}
                    >
                      <strong>{issue.field}</strong> — {issue.message}
                    </li>
                  ))}
                </ul>
              )}

              <div className="betslip-export-actions">
                <button type="button" className="betslip-export-copy" onClick={handleCopyExport}>
                  {copyState === 'copied'
                    ? 'Copied'
                    : copyState === 'error'
                      ? 'Copy failed'
                      : 'Copy JSON'}
                </button>
              </div>

              <pre className="betslip-export-code">
                <code>{exportPreview.json}</code>
              </pre>
            </section>
          )}
        </div>

        <div className="betslip-foot">
          <button
            type="button"
            className={`betslip-save ${saveState === 'saved' ? 'is-saved' : ''}`}
            onClick={handleSave}
            disabled={saveDisabled}
          >
            {saveLabel}
          </button>
          <button
            type="button"
            className="betslip-clear"
            onClick={clearLegs}
            disabled={legs.length === 0}
          >
            Clear all
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <aside className="betslip betslip-desktop" aria-label="Selection betslip">
        {renderPanel()}
      </aside>

      <div className="betslip-mobile">
        <button
          type="button"
          className={`betslip-launcher ${legs.length > 0 ? 'has-legs' : ''} ${atCapacity ? 'is-full' : ''}`}
          onClick={() => setMobileOpen(true)}
          aria-expanded={mobileOpen}
          aria-controls="betslip-sheet"
        >
          <span className="betslip-launcher-label">Multibet</span>
          <span className="betslip-launcher-count">
            {legs.length}/{maxLegs}
          </span>
          <span className="betslip-launcher-chevron" aria-hidden>
            ▲
          </span>
        </button>

        {mobileOpen && (
          <div className="betslip-sheet-root">
            <button
              type="button"
              className="betslip-backdrop"
              aria-label="Dismiss betslip"
              onClick={() => setMobileOpen(false)}
            />
            <aside
              id="betslip-sheet"
              className="betslip betslip-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Selection betslip"
            >
              <div className="betslip-sheet-handle" aria-hidden />
              {renderPanel()}
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
