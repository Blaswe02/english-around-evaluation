export const saveEvaluation = async (data: EvaluationRecord) => {
  const response = await fetch('/api/evaluations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to save evaluation')
  }

  return response.json()
}

export interface EvaluationRecord {
  id?: string
  docent_name: string
  docent_email: string
  land: string
  jaar: string
  niveaus: string[]
  waardevol_onderdelen?: string
  best_parts: string[]
  succesvolle_concepten?: string
  key_term_eruit?: string
  waarom_eruit?: string
  vervanging_voorstel?: string
  niveau_handout?: number
  onderdelen_makkelijk_moeilijk?: { [niveau: string]: string }
  docent_tegenaan?: string
  extra_opmerkingen?: string
  created_at?: string
  ratings?: any
  why_valuable?: any
  best_key_term?: any
  terms_to_remove?: any
  why_remove?: any
  replacement_suggestion?: any
  new_term?: any
  most_engaging_term?: any
  best_remembered_term?: any
  most_forgotten_term?: any
  level_fit?: any
  too_easy_hard?: any
  student_difficulties?: any
  teacher_difficulties?: any
  one_change?: any
}
