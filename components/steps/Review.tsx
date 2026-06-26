'use client'

import { EvaluationRecord } from '@/lib/supabase'

interface ReviewProps {
  evaluations: EvaluationRecord[]
  docent: { name: string; email: string }
  onExport: () => void
  onEdit: () => void
  onNewDocent: () => void
}

export default function Review({
  evaluations,
  docent,
  onExport,
  onEdit,
  onNewDocent,
}: ReviewProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-6">
        <h2 className="text-3xl font-bold mb-2">✓ Klaar!</h2>
        <p className="text-green-100">Je hebt {evaluations.length} evaluatie{evaluations.length !== 1 ? 's' : ''} ingevuld</p>
      </div>

      <div className="p-8 space-y-6">
        {/* Summary */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Samenvatting</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Docent:</dt>
              <dd className="font-medium text-gray-800">{docent.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Email:</dt>
              <dd className="font-medium text-gray-800">{docent.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Evaluaties ingediend:</dt>
              <dd className="font-medium text-gray-800">{evaluations.length}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Landen:</dt>
              <dd className="font-medium text-gray-800">{Array.from(new Set(evaluations.map(e => e.land))).join(', ')}</dd>
            </div>
          </dl>
        </div>

        {/* Evaluations List */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-4">Jouw evaluaties</h3>
          <div className="space-y-2">
            {evaluations.map((evaluation, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{evaluation.land} ({evaluation.jaar})</p>
                  <p className="text-sm text-gray-600">Niveaus: {evaluation.niveaus?.join(', ')}</p>
                </div>
                <div className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded">
                  Opgeslagen
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Gemiddelde waarderingen</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { key: 'general_information', label: 'General Info' },
              { key: 'history', label: 'History' },
              { key: 'well_known_people', label: 'Well-known People' },
              { key: 'landmarks', label: 'Landmarks' },
              { key: 'culture', label: 'Culture' },
              { key: 'flora_fauna', label: 'Flora/Fauna' },
            ].map(({ key, label }) => {
              let total = 0
              let count = 0
              evaluations.forEach(e => {
                const ratingObj = (e.ratings as any)?.[key]
                if (ratingObj && typeof ratingObj === 'object') {
                  Object.values(ratingObj).forEach(val => {
                    total += (val as number) || 0
                    count += 1
                  })
                }
              })
              const avg = count > 0 ? (total / count).toFixed(1) : 0
              return (
                <div key={key}>
                  <p className="text-gray-600">{label}</p>
                  <p className="text-lg font-bold text-blue-600">{avg} / 5</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-6 border-t">
          <button
            onClick={onExport}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            ↓ Download CSV
          </button>
          <button
            onClick={onEdit}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Voeg nog evaluaties toe
          </button>
          <button
            onClick={onNewDocent}
            className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            Evalueer als ander persoon
          </button>
        </div>

        <div className="text-xs text-gray-500 text-center pt-4 border-t">
          <p>Je evaluaties zijn opgeslagen en kunnen vanuit je emailadres teruggehaald worden.</p>
        </div>
      </div>
    </div>
  )
}
