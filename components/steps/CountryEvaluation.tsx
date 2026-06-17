'use client'

import { useState } from 'react'
import { EvaluationRecord } from '@/lib/supabase'

interface CountryEvaluationProps {
  onSubmit: (data: EvaluationRecord) => void
  onBack: () => void
  loading: boolean
  evaluationCount: number
}

const COUNTRIES = {
  'Jaar 1': ['Australia', 'United Kingdom', 'United States', 'Canada'],
  'Jaar 2': ['Ireland', 'New Zealand', 'India', 'South Africa'],
  'Jaar 3': ['Jamaica', 'Malta', 'Singapore', 'Hawaii'],
}

const LEVELS = ['BB', 'KB', 'MAVO', 'HAVO']

export default function CountryEvaluation({
  onSubmit,
  onBack,
  loading,
  evaluationCount,
}: CountryEvaluationProps) {
  const [formData, setFormData] = useState<Partial<EvaluationRecord>>({
    jaar: 'Jaar 1',
    land: 'Australia',
    niveaus: ['BB'],
    ratings: {
      general_information: 3,
      history: 3,
      well_known_people: 3,
      landmarks: 3,
      culture: 3,
      flora_fauna: 3,
    },
    best_parts: [],
    level_fit: 3,
  })

  const [expanded, setExpanded] = useState(false)
  const jaar = formData.jaar as keyof typeof COUNTRIES

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.land || !formData.jaar) {
      alert('Selecteer land en jaar')
      return
    }
    onSubmit(formData as EvaluationRecord)
  }

  const toggleLevel = (level: string) => {
    const current = formData.niveaus || []
    if (current.includes(level)) {
      setFormData({ ...formData, niveaus: current.filter(l => l !== level) })
    } else {
      setFormData({ ...formData, niveaus: [...current, level] })
    }
  }

  const toggleBestPart = (part: string) => {
    const current = formData.best_parts || []
    if (current.includes(part)) {
      setFormData({ ...formData, best_parts: current.filter(p => p !== part) })
    } else {
      setFormData({ ...formData, best_parts: [...current, part] })
    }
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

        {/* Levels */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Niveaus (meerkeuze) *
          </label>
          <div className="grid grid-cols-4 gap-2">
            {LEVELS.map(level => (
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

        {/* Ratings */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-800">Hoe waardevol vonden leerlingen deze onderdelen? (1-5)</h3>
          {[
            { key: 'general_information', label: 'General Information' },
            { key: 'history', label: 'History' },
            { key: 'well_known_people', label: 'Well-known People' },
            { key: 'landmarks', label: 'Landmarks' },
            { key: 'culture', label: 'Culture' },
            { key: 'flora_fauna', label: 'Flora/Fauna/Landscapes' },
          ].map(({ key, label }) => (
            <div key={key} className="flex items-center gap-4">
              <label className="text-sm text-gray-700 flex-1">{label}</label>
              <input
                type="range"
                min="1"
                max="5"
                value={formData.ratings?.[key as keyof typeof formData.ratings] || 3}
                onChange={(event) => setFormData({
                  ...formData,
                  ratings: {
                    ...formData.ratings,
                    [key]: parseInt(event.target.value),
                  },
                })}
                className="w-24"
              />
              <span className="text-sm font-medium text-gray-700 w-8 text-center">
                {formData.ratings?.[key as keyof typeof formData.ratings] || 3}
              </span>
            </div>
          ))}
        </div>

        {/* Best Parts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Welke 1-3 onderdelen kun je het beste gebruiken? (checkboxes)
          </label>
          <div className="space-y-2">
            {['General Information', 'History', 'Well-known People', 'Landmarks', 'Culture', 'Flora/Fauna/Landscapes'].map(part => (
              <label key={part} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.best_parts?.includes(part) || false}
                  onChange={() => toggleBestPart(part)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">{part}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Expandable Details Section */}
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {expanded ? '▼' : '▶'} Aanvullende vragen (optioneel)
          </button>

          {expanded && (
            <div className="mt-4 space-y-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waarom zijn deze onderdelen goed bruikbaar?
                </label>
                <textarea
                  value={formData.why_valuable || ''}
                  onChange={(e) => setFormData({ ...formData, why_valuable: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Beschrijf waarom deze onderdelen goed werkten..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meest interessante key term
                </label>
                <input
                  type="text"
                  value={formData.most_engaging_term || ''}
                  onChange={(e) => setFormData({ ...formData, most_engaging_term: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  placeholder="Bijv: Sydney Opera House"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Past het niveau bij de doelgroep? (1-5)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.level_fit || 3}
                    onChange={(e) => setFormData({ ...formData, level_fit: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 min-w-max">
                    {formData.level_fit === 1 && 'Te makkelijk'}
                    {formData.level_fit === 3 && 'Precies goed'}
                    {formData.level_fit === 5 && 'Te moeilijk'}
                    {![1, 3, 5].includes(formData.level_fit || 3) && formData.level_fit}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wat zou je willen veranderen?
                </label>
                <textarea
                  value={formData.one_change || ''}
                  onChange={(e) => setFormData({ ...formData, one_change: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Één verandering die je morgen zou doorvoeren..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
          >
            Annuleren
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
          >
            {loading ? 'Opslaan...' : 'Opslaan & volgende →'}
          </button>
        </div>
      </form>
    </div>
  )
}
