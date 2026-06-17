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
  ratings?: {
    general_information?: number
    history?: number
    well_known_people?: number
    landmarks?: number
    culture?: number
    flora_fauna?: number
  }
  best_parts: string[]
  why_valuable: string
  best_key_term: string
  terms_to_remove: string
  why_remove: string
  replacement_suggestion: string
  new_term: string
  most_engaging_term: string
  best_remembered_term: string
  most_forgotten_term: string
  level_fit: number
  too_easy_hard: string
  student_difficulties: string
  teacher_difficulties: string
  one_change: string
  created_at?: string
}
