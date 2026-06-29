'use client'

import { useState } from 'react'
import { EvaluationRecord } from '@/lib/supabase'

interface CountryEvaluationProps {
  onSubmit: (data: EvaluationRecord) => void
  onFinalSubmit: () => void
  onBack: () => void
  loading: boolean
  evaluationCount: number
}

const COUNTRIES = {
  'Jaar 1': ['Australia', 'United Kingdom', 'United States', 'Canada'],
  'Jaar 2': ['Ireland', 'New Zealand', 'India', 'South Africa'],
  'Jaar 3': ['Jamaica', 'Malta', 'Singapore', 'Hawaii'],
}

const LEVEL_GROUPS = {
  'Jaar 1': ['BB/KB', 'KGT', 'MAVO/HAVO'],
  'Jaar 2': ['BB/KB', 'KGT', 'MAVO/HAVO'],
  'Jaar 3': ['Basis', 'Kader', 'MAVO'],
}

const CONTENT_AREAS = [
  'General Information',
  'History',
  'Well-known People',
  'Landmarks',
  'Culture',
  'Flora/Fauna/Landscapes',
]

export default function CountryEvaluation({
  onSubmit,
  onFinalSubmit,
  onBack,
  loading,
  evaluationCount,
}: CountryEvaluationProps) {
  const [formData, setFormData] = useState<Partial<EvaluationRecord>>({
    jaar: 'Jaar 1',
    land: 'Australia',
    niveaus: ['BB/KB'],
    best_parts: [],
    level_fit: 3,
  })

  const [expanded, setExpanded] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const jaar = formData.jaar as keyof typeof COUNTRIES
  const levelGroups = LEVEL_GROUPS[jaar]

  const resetForm = () => {
    setFormData({
      jaar: formData.jaar,
      land: formData.land,
      niveaus: ['BB/KB'],
      best_parts: [],
      level_fit: 3,
      waardevol_onderdelen: '',
      succesvolle_concepten: '',
      key_term_eruit: '',
      waarom_eruit: '',
      vervanging_voorstel: '',
      niveau_handout: 3,
      onderdelen_makkelijk_moeilijk: {},
      docent_tegenaan: '',
      extra_opmerkingen: '',
    })
    setSaveError(null)
    setExpanded(false)
  }

  const validateForm = (): boolean => {
    setSaveError(null)

    if (!formData.land || !formData.jaar) {
      setSaveError('Selecteer land en jaar')
      return false
    }

    if (!formData.niveaus || formData.niveaus.length === 0) {
      setSaveError('Selecteer minstens één niveau')
      return false
    }

    if (!formData.waardevol_onderdelen?.trim()) {
      setSaveError('Hoe waardevol vond je deze onderdelen? (verplicht)')
      return false
    }

    if (!formData.best_parts || formData.best_parts.length === 0) {
      setSaveError('Selecteer minstens 1 onderdeel dat je het leukst vond (verplicht)')
      return false
    }

    if (!formData.succesvolle_concepten?.trim()) {
      setSaveError('Beschrijf 2 van je meest succesvolle lesconcepten (verplicht)')
      return false
    }

    if (!formData.key_term_eruit?.trim()) {
      setSaveError('Welke key term zou volgens jou eruit moeten? (verplicht)')
      return false
    }

    if (!formData.waarom_eruit?.trim()) {
      setSaveError('Waarom zouden deze aangepast of verwijderd moeten worden? (verplicht)')
      return false
    }

    if (!formData.vervanging_voorstel?.trim()) {
      setSaveError('Welke vervanging stel je voor? (verplicht)')
      return false
    }

    if (!formData.onderdelen_makkelijk_moeilijk || Object.keys(formData.onderdelen_makkelijk_moeilijk).length === 0) {
      setSaveError('Selecteer minstens één onderdeel dat te makkelijk/moeilijk is (verplicht)')
      return false
    }

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData as EvaluationRecord)
    }
  }

  const handleNextCountry = () => {
    if (validateForm()) {
      onSubmit(formData as EvaluationRecord)
      resetForm()
    }
  }

  const toggleLevel = (level: string) => {
    const current = formData.niveaus || []
    let updated: string[]
    if (current.includes(level)) {
      updated = current.filter(l => l !== level)
    } else {
      updated = [...current, level]
    }

    if (updated.length === 0) {
      setSaveError('Selecteer minstens één niveau')
      return
    }

    setFormData({
      ...formData,
      niveaus: updated,
    })
    setSaveError(null)
  }

  const [draggedItem, setDraggedItem] = useState<string | null>(null)

  const movePart = (index: number, direction: 'up' | 'down') => {
    const current = [...(formData.best_parts || [])]
    if (direction === 'up' && index > 0) {
      [current[index], current[index - 1]] = [current[index - 1], current[index]]
    } else if (direction === 'down' && index < current.length - 1) {
      [current[index], current[index + 1]] = [current[index + 1], current[index]]
    }
    setFormData({ ...formData, best_parts: current })
  }

  const toggleBestPart = (part: string) => {
    const current = formData.best_parts || []
    if (current.includes(part)) {
      setFormData({ ...formData, best_parts: current.filter(p => p !== part) })
    } else {
      setFormData({ ...formData, best_parts: [...current, part] })
    }
  }

  const toggleDifficulty = (niveau: string) => {
    const current = formData.onderdelen_makkelijk_moeilijk || {}
    const updated = { ...current }
    if (updated[niveau]) {
      delete updated[niveau]
    } else {
      updated[niveau] = ''
    }
    setFormData({ ...formData, onderdelen_makkelijk_moeilijk: updated })
    setSaveError(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Progress Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">Evaluatie #{evaluationCount + 1}</h2>
          <button
            onClick={onBack}
            className="text-sm bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded transition"
          >
            ← Terug
          </button>
        </div>
        <p className="text-blue-100">Vul één land/niveau combinatie in</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* Land & Jaar Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jaar</label>
            <select
              value={formData.jaar}
              onChange={(e) => {
                const newJaar = e.target.value as keyof typeof COUNTRIES
                setFormData({
                  ...formData,
                  jaar: newJaar,
                  land: COUNTRIES[newJaar][0],
                  niveaus: [LEVEL_GROUPS[newJaar][0]],
                })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(COUNTRIES).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Land</label>
            <select
              value={formData.land}
              onChange={(e) => setFormData({ ...formData, land: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {COUNTRIES[jaar].map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Level Groups */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Niveaus (meerkeuze) *
          </label>
          <div className="grid grid-cols-3 gap-2">
            {levelGroups.map(level => (
              <button
                key={level}
                type="button"
                onClick={() => toggleLevel(level)}
                className={`py-2 px-3 rounded border-2 font-medium transition ${
                  formData.niveaus?.includes(level)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Ratings per content area */}
        <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Hoe waardevol zijn deze onderdelen voor je lessen? (1-5) *
          </label>
          <div className="space-y-4">
            {CONTENT_AREAS.map(area => (
              <div key={area}>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-700">{area}</label>
                  <span className="text-sm font-medium text-blue-600">
                    {formData.ratings?.[area.toLowerCase().replace(/\//g, '_').replace(/[^a-z_]/g, '')] || 3}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.ratings?.[area.toLowerCase().replace(/\//g, '_').replace(/[^a-z_]/g, '')] || 3}
                  onChange={(e) => {
                    const key = area.toLowerCase().replace(/\//g, '_').replace(/[^a-z_]/g, '')
                    setFormData({
                      ...formData,
                      ratings: {
                        ...formData.ratings,
                        [key]: parseInt(e.target.value),
                      },
                    })
                  }}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Leukste onderdelen - Drag & Drop Ranking */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Welke onderdelen vond ik het leukst? (sleep om te sorteren) *
          </label>

          {/* Available items */}
          <div className="mb-4">
            <p className="text-xs text-gray-600 mb-2">Klik op onderdelen om toe te voegen:</p>
            <div className="grid grid-cols-2 gap-2">
              {CONTENT_AREAS.filter(part => !formData.best_parts?.includes(part)).map(part => (
                <button
                  key={part}
                  type="button"
                  onClick={() => toggleBestPart(part)}
                  className="px-3 py-2 bg-blue-100 border border-blue-300 text-blue-700 rounded text-sm hover:bg-blue-200 transition"
                >
                  + {part}
                </button>
              ))}
            </div>
          </div>

          {/* Ranking list */}
          <div className="border border-gray-300 rounded-lg bg-gray-50 p-4 min-h-32">
            {(formData.best_parts?.length || 0) === 0 ? (
              <p className="text-sm text-gray-500 italic">Voeg onderdelen toe door op + te klikken</p>
            ) : (
              <div className="space-y-2">
                {formData.best_parts?.map((part: string, idx: number) => (
                  <div
                    key={part}
                    draggable
                    onDragStart={() => setDraggedItem(part)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (draggedItem && draggedItem !== part) {
                        const current = [...formData.best_parts!]
                        const draggedIdx = current.indexOf(draggedItem)
                        if (draggedIdx !== -1) {
                          const temp = current[draggedIdx]
                          current[draggedIdx] = current[idx]
                          current[idx] = temp
                          setFormData({ ...formData, best_parts: current })
                        }
                      }
                      setDraggedItem(null)
                    }}
                    onDragEnd={() => setDraggedItem(null)}
                    className={`flex items-center gap-2 p-3 bg-white border rounded cursor-move transition ${
                      draggedItem === part ? 'opacity-50 border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm text-gray-700">{part}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => movePart(idx, 'up')}
                        disabled={idx === 0}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => movePart(idx, 'down')}
                        disabled={idx === (formData.best_parts?.length || 0) - 1}
                        className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBestPart(part)}
                        className="px-2 py-1 text-xs bg-red-200 hover:bg-red-300 rounded text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Waardevol vinden */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hoe waardevol vond je deze onderdelen? (1 = slecht, 5 = goed) *
          </label>
          <textarea
            value={formData.waardevol_onderdelen || ''}
            onChange={(e) => setFormData({ ...formData, waardevol_onderdelen: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Beschrijf wat je waardevol vond..."
          />
        </div>

        {/* Expandable Details Section */}
        <div className="border-t pt-4 space-y-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {expanded ? '▼' : '▶'} Detailvragen (verplicht)
          </button>

          {expanded && (
            <div className="mt-4 space-y-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschrijf 2 van je meest succesvolle lesconcepten gebaseerd op de keyterms *
                </label>
                <textarea
                  value={formData.succesvolle_concepten || ''}
                  onChange={(e) => setFormData({ ...formData, succesvolle_concepten: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Beschrijf 2 succesvolle lesconcepten..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welke key term zou volgens jou eruit moeten? *
                </label>
                <input
                  type="text"
                  value={formData.key_term_eruit || ''}
                  onChange={(e) => setFormData({ ...formData, key_term_eruit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Welke term moet eruit?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waarom zouden deze aangepast of verwijderd moeten worden? *
                </label>
                <textarea
                  value={formData.waarom_eruit || ''}
                  onChange={(e) => setFormData({ ...formData, waarom_eruit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Waarom moeten deze aangepast/verwijderd worden?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welke vervanging stel je voor? Wat zou je willen toevoegen? *
                </label>
                <textarea
                  value={formData.vervanging_voorstel || ''}
                  onChange={(e) => setFormData({ ...formData, vervanging_voorstel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Vervangingsvoorstel en toevoegingen..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Past het niveau van de handout bij de doelgroep (taal, onderwerpen, complexiteit)? (1-5) *
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.niveau_handout || 3}
                    onChange={(e) => setFormData({ ...formData, niveau_handout: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 min-w-max">
                    {formData.niveau_handout === 1 && 'Te laag'}
                    {formData.niveau_handout === 3 && 'Goed'}
                    {formData.niveau_handout === 5 && 'Te hoog'}
                    {![1, 3, 5].includes(formData.niveau_handout || 3) && formData.niveau_handout}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Welke onderdelen zijn te makkelijk of te moeilijk voor dit niveau? *
                </label>
                <div className="space-y-2">
                  {(formData.niveaus || []).map(niveau => (
                    <div key={niveau} className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDifficulty(niveau)}
                        className={`px-3 py-2 rounded border-2 font-medium text-sm transition ${
                          formData.onderdelen_makkelijk_moeilijk?.[niveau] !== undefined
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {niveau}
                      </button>
                      {formData.onderdelen_makkelijk_moeilijk?.[niveau] !== undefined && (
                        <input
                          type="text"
                          value={formData.onderdelen_makkelijk_moeilijk[niveau] || ''}
                          onChange={(e) => {
                            const updated = { ...formData.onderdelen_makkelijk_moeilijk }
                            updated[niveau] = e.target.value
                            setFormData({ ...formData, onderdelen_makkelijk_moeilijk: updated })
                          }}
                          placeholder="Welke onderdelen?"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waar liep jij als docent tegenaan? (optioneel)
                </label>
                <textarea
                  value={formData.docent_tegenaan || ''}
                  onChange={(e) => setFormData({ ...formData, docent_tegenaan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Wat was lastig voor jou als docent?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wil je zelf nog iets kwijt? (optioneel)
                </label>
                <textarea
                  value={formData.extra_opmerkingen || ''}
                  onChange={(e) => setFormData({ ...formData, extra_opmerkingen: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Extra opmerkingen..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
            {saveError}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Terug
          </button>
          <button
            type="button"
            onClick={handleNextCountry}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Volgende land...' : 'Volgende land →'}
          </button>
          <button
            type="button"
            onClick={() => {
              if (validateForm()) {
                const confirmed = confirm('Definitief inzenden? Je kunt daarna niet meer wijzigen.')
                if (confirmed) {
                  onSubmit(formData as EvaluationRecord)
                  onFinalSubmit()
                }
              }
            }}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Inzenden...' : 'Definitief inzenden'}
          </button>
        </div>
      </form>
    </div>
  )
}
