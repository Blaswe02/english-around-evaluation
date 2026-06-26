'use client'

import { useState } from 'react'
import { saveEvaluation, EvaluationRecord } from '@/lib/supabase'
import DocentInfo from './steps/DocentInfo'
import CountryEvaluation from './steps/CountryEvaluation'
import Review from './steps/Review'

export type Step = 'docent' | 'country' | 'review'

export default function Wizard() {
  const [step, setStep] = useState<Step>('docent')
  const [docent, setDocent] = useState({ name: '', email: '' })
  const [evaluations, setEvaluations] = useState<EvaluationRecord[]>([])
  const [currentEvaluation, setCurrentEvaluation] = useState<Partial<EvaluationRecord> | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDocentSubmit = (docentData: { name: string; email: string }) => {
    setDocent(docentData)
    setStep('country')
  }

  const handleEvaluationSubmit = (evaluationData: EvaluationRecord) => {
    // Add to local state (NOT to database yet)
    const updatedEvaluations = [...evaluations, evaluationData]
    setEvaluations(updatedEvaluations)
    setCurrentEvaluation(null)
    // Show success message
    alert(`✓ ${evaluationData.land} (${evaluationData.jaar}) toegevoegd!\n\nTotaal: ${updatedEvaluations.length} evaluatie(s)`)
  }

  const handleFinalSubmit = async () => {
    setLoading(true)
    try {
      // Save all evaluations to database
      for (const evaluation of evaluations) {
        await saveEvaluation({
          ...evaluation,
          docent_name: docent.name,
          docent_email: docent.email,
        })
      }
      setStep('review')
    } catch (error) {
      console.error('Error saving evaluations:', error)
      alert('Fout bij inzenden. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (evaluations.length === 0) return

    const csv = [
      ['Docent', 'Email', 'Land', 'Jaar', 'Niveaus', 'Waardevol onderdelen', 'Leukste onderdelen', 'Succesvolle concepten', 'Key term eruit', 'Waarom eruit', 'Vervanging voorstel', 'Niveau handout', 'Onderdelen makkelijk/moeilijk', 'Docent tegenaan', 'Extra opmerkingen'],
      ...evaluations.map(e => [
        docent.name,
        docent.email,
        e.land,
        e.jaar,
        e.niveaus?.join('; ') || '',
        e.waardevol_onderdelen || '',
        e.best_parts?.join('; ') || '',
        e.succesvolle_concepten || '',
        e.key_term_eruit || '',
        e.waarom_eruit || '',
        e.vervanging_voorstel || '',
        e.niveau_handout || '',
        Object.entries(e.onderdelen_makkelijk_moeilijk || {}).map(([k, v]) => `${k}: ${v}`).join('; ') || '',
        e.docent_tegenaan || '',
        e.extra_opmerkingen || '',
      ])
    ]

    const csvContent = csv.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `evaluaties-${docent.email}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {step === 'docent' && (
          <DocentInfo onSubmit={handleDocentSubmit} />
        )}
        {step === 'country' && (
          <CountryEvaluation
            onSubmit={handleEvaluationSubmit}
            onFinalSubmit={handleFinalSubmit}
            onBack={() => setStep('docent')}
            loading={loading}
            evaluationCount={evaluations.length}
          />
        )}
        {step === 'review' && (
          <Review
            evaluations={evaluations}
            docent={docent}
            onExport={handleExport}
            onEdit={() => setStep('country')}
            onNewDocent={() => {
              setStep('docent')
              setDocent({ name: '', email: '' })
              setEvaluations([])
            }}
          />
        )}
      </div>
    </div>
  )
}
