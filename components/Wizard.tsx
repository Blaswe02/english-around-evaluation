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

  const handleEvaluationSubmit = async (evaluationData: EvaluationRecord) => {
    setLoading(true)
    try {
      await saveEvaluation({
        ...evaluationData,
        docent_name: docent.name,
        docent_email: docent.email,
      })

      setEvaluations([...evaluations, evaluationData])
      setCurrentEvaluation(null)
      // Ask if more evaluations
      const continueEval = confirm('Wil je nog meer landen evalueren?')
      if (!continueEval) {
        setStep('review')
      }
    } catch (error) {
      console.error('Error saving evaluation:', error)
      alert('Fout bij opslaan. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    if (evaluations.length === 0) return

    const csv = [
      ['Docent', 'Email', 'Land', 'Jaar', 'Niveaus', 'General Info', 'History', 'Well-known People', 'Landmarks', 'Culture', 'Flora/Fauna', 'Waarom waardevol', 'Meest engaging term', 'Best remembered', 'Most forgotten', 'Niveau fit', 'One change'],
      ...evaluations.map(e => [
        docent.name,
        docent.email,
        e.land,
        e.jaar,
        e.niveaus?.join('; ') || '',
        e.ratings?.general_information || '',
        e.ratings?.history || '',
        e.ratings?.well_known_people || '',
        e.ratings?.landmarks || '',
        e.ratings?.culture || '',
        e.ratings?.flora_fauna || '',
        e.why_valuable || '',
        e.most_engaging_term || '',
        e.best_remembered_term || '',
        e.most_forgotten_term || '',
        e.level_fit || '',
        e.one_change || '',
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
