'use client'

import { useState, useEffect, useRef } from 'react'
import { EvaluationRecord } from '@/lib/supabase'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface GroupedEvaluations {
  [docent: string]: EvaluationRecord[]
}

export default function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedDocent, setExpandedDocent] = useState<string | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/evaluations?password=${encodeURIComponent(password)}`)
      if (!res.ok) {
        throw new Error('Wachtwoord onjuist')
      }
      const data = await res.json()
      setEvaluations(data)
      setIsAuthenticated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login mislukt')
    } finally {
      setLoading(false)
    }
  }

  const groupedData: GroupedEvaluations = evaluations.reduce((acc, evaluation) => {
    const key = `${evaluation.docent_name} (${evaluation.docent_email})`
    if (!acc[key]) acc[key] = []
    acc[key].push(evaluation)
    return acc
  }, {} as GroupedEvaluations)

  const docentKeys = Object.keys(groupedData).sort()

  const handleExportAll = () => {
    const csv = [
      ['Docent', 'Email', 'Land', 'Jaar', 'Niveaus', 'Hoe waardevol', 'Leukste onderdelen', 'Succesvolle concepten', 'Key term eruit', 'Waarom eruit', 'Vervanging voorstel', 'Niveau handout', 'Onderdelen makkelijk/moeilijk', 'Docent tegenaan', 'Extra opmerkingen'],
      ...evaluations.map(evaluation => [
        evaluation.docent_name,
        evaluation.docent_email,
        evaluation.land,
        evaluation.jaar,
        evaluation.niveaus?.join('; ') || '',
        evaluation.waardevol_onderdelen || '',
        evaluation.best_parts?.join('; ') || '',
        evaluation.succesvolle_concepten || '',
        evaluation.key_term_eruit || '',
        evaluation.waarom_eruit || '',
        evaluation.vervanging_voorstel || '',
        evaluation.niveau_handout || '',
        Object.entries(evaluation.onderdelen_makkelijk_moeilijk || {}).map(([k, v]) => `${k}: ${v}`).join('; ') || '',
        evaluation.docent_tegenaan || '',
        evaluation.extra_opmerkingen || '',
      ])
    ]

    const csvContent = csv.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evaluaties-alle-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handleExportPDF = async () => {
    setGeneratingPDF(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      let yPosition = 20
      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 15
      const contentWidth = pageWidth - 2 * margin

      pdf.setFontSize(16)
      pdf.setFont('Helvetica', 'bold')
      pdf.text('Evaluaties - English Around the World', margin, yPosition)
      yPosition += 12

      pdf.setFontSize(10)
      pdf.setFont('Helvetica', 'normal')
      pdf.text(`Gegenereerd: ${new Date().toLocaleDateString('nl-NL')}`, margin, yPosition)
      pdf.text(`Totaal evaluaties: ${evaluations.length}`, margin, yPosition + 6)
      yPosition += 18

      docentKeys.forEach((docentKey) => {
        const docentEvals = groupedData[docentKey]

        docentEvals.forEach((evaluation) => {
          if (yPosition > 260) {
            pdf.addPage()
            yPosition = 20
          }

          pdf.setFontSize(11)
          pdf.setFont('Helvetica', 'bold')
          pdf.text(`${evaluation.land} (${evaluation.jaar}) - ${evaluation.niveaus?.join(', ')}`, margin, yPosition)
          yPosition += 8

          pdf.setFontSize(9)
          pdf.setFont('Helvetica', 'normal')

          // Ratings per niveau
          if (evaluation.ratings) {
            pdf.setFont('Helvetica', 'bold')
            pdf.text('Ratings (1-5):', margin, yPosition)
            yPosition += 5

            pdf.setFont('Helvetica', 'normal')
            const ratingLabels = [
              { key: 'general_information', label: 'General Info' },
              { key: 'history', label: 'History' },
              { key: 'well_known_people', label: 'Well-known People' },
              { key: 'landmarks', label: 'Landmarks' },
              { key: 'culture', label: 'Culture' },
              { key: 'flora_fauna', label: 'Flora/Fauna' },
            ]

            ratingLabels.forEach(({ key, label }) => {
              const ratingObj = (evaluation.ratings as any)?.[key]
              if (ratingObj && typeof ratingObj === 'object') {
                const values = Object.entries(ratingObj)
                  .map(([niveau, val]) => `${niveau}:${val}`)
                  .join(' | ')
                pdf.text(`${label}: ${values}`, margin + 5, yPosition)
                yPosition += 4
              }
            })
            yPosition += 2
          }

          // Tekstvelden
          const textFields = [
            { label: 'Hoe waardevol vond je deze onderdelen?', value: evaluation.waardevol_onderdelen },
            { label: 'Welke onderdelen vond je het leukst (ranking):', value: evaluation.best_parts?.join('; ') },
            { label: 'Succesvolle concepten:', value: evaluation.succesvolle_concepten },
            { label: 'Welke key term eruit?', value: evaluation.key_term_eruit },
            { label: 'Waarom aangepast/verwijderd?', value: evaluation.waarom_eruit },
            { label: 'Vervanging voorstel:', value: evaluation.vervanging_voorstel },
            { label: 'Niveau handout (1-5):', value: evaluation.niveau_handout?.toString() },
            { label: 'Onderdelen makkelijk/moeilijk:', value: Object.entries(evaluation.onderdelen_makkelijk_moeilijk || {}).map(([k, v]) => `${k}: ${v}`).join('; ') },
            { label: 'Waar liep jij als docent tegenaan?', value: evaluation.docent_tegenaan },
            { label: 'Extra opmerkingen:', value: evaluation.extra_opmerkingen },
          ]

          textFields.forEach(({ label, value }) => {
            if (value) {
              if (yPosition > 260) {
                pdf.addPage()
                yPosition = 20
              }

              pdf.setFont('Helvetica', 'bold')
              pdf.text(label, margin, yPosition)
              yPosition += 4

              pdf.setFont('Helvetica', 'normal')
              const wrapped = pdf.splitTextToSize(String(value), contentWidth - 10)
              pdf.text(wrapped, margin + 5, yPosition)
              yPosition += wrapped.length * 4 + 3
            }
          })

          yPosition += 8
        })
      })

      pdf.save(`evaluaties-alle-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      alert('PDF generatie mislukt: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleExportDocentPDF = async (docentKey: string) => {
    setGeneratingPDF(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      let yPosition = 20
      const pageWidth = pdf.internal.pageSize.getWidth()
      const margin = 15
      const contentWidth = pageWidth - 2 * margin
      const docentEvals = groupedData[docentKey]

      pdf.setFontSize(16)
      pdf.setFont('Helvetica', 'bold')
      pdf.text(`Evaluaties - ${docentKey}`, margin, yPosition)
      yPosition += 12

      pdf.setFontSize(10)
      pdf.setFont('Helvetica', 'normal')
      pdf.text(`Gegenereerd: ${new Date().toLocaleDateString('nl-NL')}`, margin, yPosition)
      pdf.text(`Totaal: ${docentEvals.length} evaluatie(s)`, margin, yPosition + 6)
      yPosition += 18

      docentEvals.forEach((evaluation) => {
        if (yPosition > 260) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(11)
        pdf.setFont('Helvetica', 'bold')
        pdf.text(`${evaluation.land} (${evaluation.jaar})`, margin, yPosition)
        yPosition += 8

        pdf.setFont('Helvetica', 'normal')
        pdf.setFontSize(9)
        pdf.text(`Niveaus: ${evaluation.niveaus?.join(', ')}`, margin, yPosition)
        yPosition += 8

        // Ratings per content area
        if (evaluation.ratings && typeof evaluation.ratings === 'object') {
          pdf.setFont('Helvetica', 'bold')
          pdf.text('Waardering per onderdeel (1-5):', margin, yPosition)
          yPosition += 5

          pdf.setFont('Helvetica', 'normal')
          const ratingLabels = [
            { key: 'general_information', label: 'General Information' },
            { key: 'history', label: 'History' },
            { key: 'well_known_people', label: 'Well-known People' },
            { key: 'landmarks', label: 'Landmarks' },
            { key: 'culture', label: 'Culture' },
            { key: 'flora_fauna', label: 'Flora/Fauna/Landscapes' },
          ]

          ratingLabels.forEach(({ key, label }) => {
            const ratingValue = (evaluation.ratings as any)?.[key]
            if (ratingValue !== undefined && ratingValue !== null) {
              pdf.text(`${label}: ${ratingValue}/5`, margin + 5, yPosition)
              yPosition += 4
            }
          })
          yPosition += 4
        }

        // Tekstvelden
        const textFields = [
          { label: 'Hoe waardevol vond je deze onderdelen?', value: evaluation.waardevol_onderdelen },
          { label: 'Welke onderdelen vond je het leukst (ranking):', value: evaluation.best_parts?.join('; ') },
          { label: 'Succesvolle concepten:', value: evaluation.succesvolle_concepten },
          { label: 'Welke key term eruit?', value: evaluation.key_term_eruit },
          { label: 'Waarom aangepast/verwijderd?', value: evaluation.waarom_eruit },
          { label: 'Vervanging voorstel:', value: evaluation.vervanging_voorstel },
          { label: 'Niveau handout (1-5):', value: evaluation.niveau_handout?.toString() },
          { label: 'Onderdelen makkelijk/moeilijk:', value: Object.entries(evaluation.onderdelen_makkelijk_moeilijk || {}).map(([k, v]) => `${k}: ${v}`).join('; ') },
          { label: 'Waar liep jij als docent tegenaan?', value: evaluation.docent_tegenaan },
          { label: 'Extra opmerkingen:', value: evaluation.extra_opmerkingen },
        ]

        textFields.forEach(({ label, value }) => {
          if (value) {
            if (yPosition > 260) {
              pdf.addPage()
              yPosition = 20
            }

            pdf.setFont('Helvetica', 'bold')
            pdf.text(label, margin, yPosition)
            yPosition += 4

            pdf.setFont('Helvetica', 'normal')
            const wrapped = pdf.splitTextToSize(String(value), contentWidth - 10)
            pdf.text(wrapped, margin + 5, yPosition)
            yPosition += wrapped.length * 4 + 3
          }
        })

        yPosition += 8
      })

      pdf.save(`evaluatie-${docentKey.split('(')[0].trim()}-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      alert('PDF generatie mislukt: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Beheerders-Dashboard</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gebruikersnaam
              </label>
              <input
                type="text"
                value="VakgroepEngels"
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wachtwoord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Voer wachtwoord in..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition disabled:opacity-50"
            >
              {loading ? 'Inloggen...' : 'Inloggen'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Beheerders-Dashboard</h1>
              <button
                onClick={() => {
                  setIsAuthenticated(false)
                  setPassword('')
                  setEvaluations([])
                }}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded transition"
              >
                Uitloggen
              </button>
            </div>
            <p className="text-blue-100 mt-2">Totaal: {evaluations.length} evaluaties van {docentKeys.length} docenten</p>
          </div>

          {/* Export buttons */}
          <div className="px-8 py-4 border-b flex gap-3 flex-wrap">
            <button
              onClick={handleExportAll}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium transition"
            >
              📥 CSV Export (Alles)
            </button>
            <button
              onClick={handleExportPDF}
              disabled={generatingPDF}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition disabled:opacity-50"
            >
              {generatingPDF ? '⏳ PDF...' : '📄 PDF Export (Alles)'}
            </button>
          </div>

          {/* Content */}
          <div className="p-8 space-y-4">
            {docentKeys.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nog geen evaluaties ontvangen</p>
            ) : (
              docentKeys.map(docentKey => {
                const docentEvals = groupedData[docentKey]
                const isExpanded = expandedDocent === docentKey
                return (
                  <div key={docentKey} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedDocent(isExpanded ? null : docentKey)}
                      className="w-full bg-blue-50 hover:bg-blue-100 px-6 py-4 text-left transition flex items-center justify-between"
                    >
                      <div>
                        <h2 className="font-semibold text-gray-800">{docentKey}</h2>
                        <p className="text-sm text-gray-600">{docentEvals.length} evaluatie(s)</p>
                      </div>
                      <span className="text-2xl text-gray-600">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="bg-white border-t space-y-4 p-6">
                        <div className="flex gap-2 pb-4 border-b">
                          <button
                            onClick={() => handleExportDocentPDF(docentKey)}
                            disabled={generatingPDF}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-medium transition text-sm disabled:opacity-50"
                          >
                            {generatingPDF ? '⏳ PDF...' : '📄 PDF Download'}
                          </button>
                        </div>
                        {docentEvals.map((evaluation, idx) => (
                          <div key={idx} className="border-l-4 border-blue-500 pl-4 py-4 bg-gray-50 rounded">
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500">Land & Jaar</p>
                                <p className="font-semibold">{evaluation.land} ({evaluation.jaar})</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Niveaus</p>
                                <p className="font-semibold">{evaluation.niveaus?.join(', ')}</p>
                              </div>
                            </div>

                            {/* Ratings */}
                            {evaluation.ratings && (
                              <div className="mb-4">
                                <p className="text-xs text-gray-500 mb-2">Ratings (1-5) per niveau</p>
                                <div className="space-y-2 text-sm">
                                  {[
                                    { key: 'general_information', label: 'General Info' },
                                    { key: 'history', label: 'History' },
                                    { key: 'well_known_people', label: 'Well-known' },
                                    { key: 'landmarks', label: 'Landmarks' },
                                    { key: 'culture', label: 'Culture' },
                                    { key: 'flora_fauna', label: 'Flora/Fauna' },
                                  ].map(({ key, label }) => {
                                    const ratingObj = (evaluation.ratings as any)?.[key]
                                    const values = ratingObj && typeof ratingObj === 'object'
                                      ? Object.entries(ratingObj).map(([n, v]) => `${n}:${v}`).join(', ')
                                      : '-'
                                    return (
                                      <div key={key}>
                                        <span className="text-gray-600">{label}:</span> <strong>{values}</strong>
                                      </div>
                                    )
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Text fields */}
                            <div className="space-y-3 text-sm">
                              {evaluation.why_valuable && (
                                <div>
                                  <p className="font-semibold text-gray-700">Waarom waardevol?</p>
                                  <p className="text-gray-600">{evaluation.why_valuable}</p>
                                </div>
                              )}
                              {evaluation.most_engaging_term && (
                                <div>
                                  <p className="font-semibold text-gray-700">Meest interessant:</p>
                                  <p className="text-gray-600">{evaluation.most_engaging_term}</p>
                                </div>
                              )}
                              {evaluation.best_remembered_term && (
                                <div>
                                  <p className="font-semibold text-gray-700">Best onthouden:</p>
                                  <p className="text-gray-600">{evaluation.best_remembered_term}</p>
                                </div>
                              )}
                              {evaluation.one_change && (
                                <div>
                                  <p className="font-semibold text-gray-700">Verandering morgen:</p>
                                  <p className="text-gray-600">{evaluation.one_change}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
