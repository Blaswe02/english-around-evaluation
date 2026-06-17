'use client'

import { useState } from 'react'

interface DocentInfoProps {
  onSubmit: (data: { name: string; email: string }) => void
}

export default function DocentInfo({ onSubmit }: DocentInfoProps) {
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Voer je naam in')
      return
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Voer een geldig email adres in')
      return
    }

    onSubmit(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">English Around the World</h1>
        <p className="text-gray-600">Evaluatieformulier voor docenten</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-800">
        <p><strong>Welkom!</strong> Dit formulier helpt ons de landendossiers te verbeteren. Je kan meerdere landen evalueren in één sessie.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Je naam
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Bijvoorbeeld: Jan van de Berg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Je email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="jouw@school.nl"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          Start evaluatie →
        </button>
      </form>

      <div className="text-center text-xs text-gray-500 pt-4 border-t">
        <p>Je gegevens worden opgeslagen en kunnen later teruggehaald worden via je email.</p>
      </div>
    </div>
  )
}
