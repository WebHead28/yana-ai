import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { personalityService } from '../services/personalityService'
import ThemeToggle from '../components/ThemeToggle'

const LABELS = {
  1: 'Strongly Disagree',
  2: 'Disagree',
  3: 'Slightly Disagree',
  4: 'Neutral',
  5: 'Slightly Agree',
  6: 'Agree',
  7: 'Strongly Agree',
}

const SECTIONS = [
  { label: 'A. Personality Traits', count: 12 },
  { label: 'B. Emotional Patterns', count: 9 },
  { label: 'C. Stress & Coping', count: 6 },
  { label: 'D. Mental Wellness Indicators', count: 6 },
]

export default function PersonalityTest() {
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    personalityService.getQuestions()
      .then((res) => {
        setQuestions(res.data)
        const initial = {}
        res.data.forEach((q) => { initial[q.id] = 4 })
        setAnswers(initial)
      })
      .catch(() => setError('Failed to load questions.'))
      .finally(() => setLoading(false))
  }, [])

  const handleSlider = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: parseInt(value) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await personalityService.submitAnswers(answers)
      navigate('/profile-setup')
    } catch (err) {
      setError('Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const completedCount = Object.keys(answers).length
  const totalCount = questions.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading questions...</p>
      </div>
    )
  }

  // Group questions by section
  let sectionStart = 0
  const grouped = SECTIONS.map((section) => {
    const sectionQuestions = questions.slice(sectionStart, sectionStart + section.count)
    sectionStart += section.count
    return { ...section, questions: sectionQuestions }
  })

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">Personality Assessment</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">{totalCount} questions · helps YANA understand you</p>
          </div>
          <ThemeToggle />
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="h-1 bg-gray-900 dark:bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-8 pb-24">
        {grouped.map((section) => (
          <div key={section.label} className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5 border-b border-gray-200 dark:border-gray-700 pb-2">
              {section.label}
            </h2>
            <div className="space-y-6">
              {section.questions.map((q) => (
                <div key={q.id} className="card p-4">
                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 font-medium leading-relaxed">{q.text}</p>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="7"
                      step="1"
                      value={answers[q.id] ?? 4}
                      onChange={(e) => handleSlider(q.id, e.target.value)}
                      className="w-full accent-gray-900 dark:accent-white cursor-pointer"
                    />
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400 dark:text-gray-500">Strongly Disagree</span>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {LABELS[answers[q.id] ?? 4]}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">Strongly Agree</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400 mb-4">{error}</p>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-2xl mx-auto">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3"
            >
              {submitting ? 'Saving your profile...' : 'Complete Assessment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
