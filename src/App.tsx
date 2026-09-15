import { useCallback, useEffect, useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { TemplatesHome } from './components/TemplatesHome'
import { BuilderOverlay } from './components/BuilderOverlay'
import { LegsProvider, useLegs } from './context/LegsContext'
import {
  deleteSavedTemplate,
  ensureSeedTemplates,
  type SavedMultibet,
} from './lib/savedTemplates'
import { SheetDataProvider, useSheetData } from './context/SheetDataContext'
import {
  allCompetitionIdsFor,
  type MatchPhase,
  type SportId,
} from './lib/sports'
import './App.css'

type BuilderSession = {
  id: string | null
  name: string
  sportId: SportId
  competitionIds: string[]
  phases: MatchPhase[]
}

function AppShell() {
  const { sports } = useSheetData()
  const { loadLegs, clearLegs } = useLegs()
  const [templates, setTemplates] = useState<SavedMultibet[]>(() =>
    ensureSeedTemplates(),
  )
  const [builder, setBuilder] = useState<BuilderSession | null>(null)

  const refreshList = useCallback(() => {
    setTemplates(ensureSeedTemplates())
  }, [])

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'multibet.saved.templates.v1') refreshList()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refreshList])

  function openCreate() {
    clearLegs()
    setBuilder({
      id: null,
      name: 'Untitled template',
      sportId: 'soccer',
      competitionIds: allCompetitionIdsFor(sports, 'soccer'),
      phases: ['preMatch'],
    })
  }

  function openEdit(template: SavedMultibet) {
    loadLegs(template.legs)
    setBuilder({
      id: template.id,
      name: template.name,
      sportId: template.sportId,
      competitionIds: template.competitionIds,
      phases: template.phases,
    })
  }

  function closeBuilder() {
    clearLegs()
    setBuilder(null)
    refreshList()
  }

  return (
    <div className="app">
      <AppHeader />

      <TemplatesHome
        templates={templates}
        onCreate={openCreate}
        onEdit={openEdit}
        onDelete={(id) => {
          deleteSavedTemplate(id)
          refreshList()
        }}
      />

      {builder && (
        <BuilderOverlay
          title={builder.id ? 'Edit template' : 'Create template'}
          templateId={builder.id}
          templateName={builder.name}
          initialSportId={builder.sportId}
          initialCompetitionIds={builder.competitionIds}
          initialPhases={builder.phases}
          onClose={closeBuilder}
          onSaved={(id) => {
            setBuilder((current) =>
              current ? { ...current, id } : current,
            )
            refreshList()
          }}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <LegsProvider>
      <SheetDataProvider>
        <AppShell />
      </SheetDataProvider>
    </LegsProvider>
  )
}
