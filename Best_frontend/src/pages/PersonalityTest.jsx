import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { personalityService } from '../services/personalityService'
import LoadingScreen from '../components/LoadingScreen'
import YanaLogo from '../components/YanaLogo'

// All 33 questions from backend
const ALL_QUESTIONS = [
  { id: 'open_emotions', text: 'I find it easy to open up about my feelings.' },
  { id: 'deep_reflection', text: 'I often think deeply about why I feel certain emotions.' },
  { id: 'stay_calm', text: 'I usually stay calm even when stressed.' },
  { id: 'overwhelmed', text: 'I get overwhelmed easily in daily life.' },
  { id: 'talk_when_bothered', text: 'I enjoy talking to others when something bothers me.' },
  { id: 'bottle_emotions', text: 'I bottle up emotions instead of expressing them.' },
  { id: 'trust_quickly', text: 'I trust people quickly.' },
  { id: 'overthink', text: 'I overthink small things.' },
  { id: 'hopeful', text: 'I stay hopeful even when things go wrong.' },
  { id: 'lose_motivation', text: 'I lose motivation faster than I want to.' },
  { id: 'fake_confidence', text: 'I push myself to act confident even when I\'m not.' },
  { id: 'seek_validation', text: 'I seek validation for emotional comfort.' },
  { id: 'mood_swings', text: 'My mood changes quickly.' },
  { id: 'lonely', text: 'I feel lonely even when people are around.' },
  { id: 'hide_sadness', text: 'I hide sadness behind jokes or distractions.' },
  { id: 'recover_fast', text: 'I recover quickly from emotional setbacks.' },
  { id: 'share_day', text: 'I find comfort in talking about my day with someone.' },
  { id: 'misunderstood', text: 'I often feel misunderstood.' },
  { id: 'attach_easy', text: 'I get attached easily.' },
  { id: 'detach_easy', text: 'I detach easily.' },
  { id: 'hold_negative', text: 'I hold onto negative feelings for long.' },
  { id: 'explain_stress', text: 'When stressed, I can explain what I\'m feeling.' },
  { id: 'avoid_problems', text: 'I avoid talking about problems.' },
  { id: 'logical_solver', text: 'I try to solve problems logically.' },
  { id: 'avoid_conflict', text: 'I try to avoid conflict or heavy emotions.' },
  { id: 'want_company', text: 'When sad, I want someone to stay with me.' },
  { id: 'shutdown', text: 'I shut down emotionally when upset.' },
  { id: 'feel_too_much', text: 'I often feel like my feelings are too much.' },
  { id: 'struggle_positive', text: 'I struggle to stay positive lately.' },
  { id: 'disconnected', text: 'I feel disconnected from people or activities.' },
  { id: 'supported', text: 'I feel supported by the people in my life.' },
  { id: 'need_reassurance', text: 'I often need reassurance to feel okay.' },
  { id: 'negative_thoughts', text: 'I find it hard to control negative thoughts.' },
  { id: 'safe_talking', text: 'I feel safe talking about uncomfortable topics.' },
]

const PAGE_SIZE = 9
const PAGES = Math.ceil(ALL_QUESTIONS.length / PAGE_SIZE)

const PAGE_TITLES = [
  'Your Personality',
  'Emotional Patterns',
  'Stress & Coping',
  'Mental Wellness',
]

export default function PersonalityTest() {
  const { theme } = useTheme()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const pageQuestions = ALL_QUESTIONS.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalAnswered = Object.keys(answers).length
  const progress = (totalAnswered / ALL_QUESTIONS.length) * 100

  const pageAnswered = pageQuestions.every((q) => answers[q.id] !== undefined)

  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const handleNext = () => {
    if (page < PAGES - 1) setPage(page + 1)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      // Convert to number answers as backend expects { question_id: value }
      const numericAnswers = {}
      Object.entries(answers).forEach(([k, v]) => {
        numericAnswers[k] = Number(v)
      })
      await personalityService.submitAnswers(numericAnswers)
      await new Promise((r) => setTimeout(r, 2000))
      navigate('/introduction')
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

  if (submitting) return <LoadingScreen text="Analyzing your personality..." showNeural />

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: '20px 32px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          flexShrink: 0,
        }}
      >
        <YanaLogo size={36} />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              fontSize: '0.8rem',
              color: theme.textMuted,
            }}
          >
            <span style={{ fontFamily: 'Playfair Display, serif', color: theme.textSecondary }}>
              {PAGE_TITLES[page] || 'Wellness Check'}
            </span>
            <span>
              Page {page + 1} of {PAGES}
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: theme.border,
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              style={{
                height: '100%',
                borderRadius: 2,
                background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentHover})`,
                boxShadow: `0 0 8px ${theme.accentGlow}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px 32px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                maxWidth: 680,
                margin: '0 auto',
              }}
            >
              {pageQuestions.map((q, idx) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  value={answers[q.id]}
                  onAnswer={handleAnswer}
                  theme={theme}
                  index={idx}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div
        style={{
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          borderTop: `1px solid ${theme.border}`,
          background: theme.bgCard,
          backdropFilter: 'blur(10px)',
        }}
      >
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 20px',
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            background: 'transparent',
            color: page === 0 ? theme.textMuted : theme.text,
            cursor: page === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.9rem',
            opacity: page === 0 ? 0.4 : 1,
          }}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <p style={{ color: theme.textMuted, fontSize: '0.8rem' }}>
          {totalAnswered}/{ALL_QUESTIONS.length} answered
        </p>

        <button
          onClick={handleNext}
          disabled={!pageAnswered}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 24px',
            borderRadius: 10,
            border: 'none',
            background: pageAnswered ? theme.accent : theme.border,
            color: pageAnswered ? '#fff' : theme.textMuted,
            cursor: pageAnswered ? 'pointer' : 'not-allowed',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            boxShadow: pageAnswered ? `0 4px 16px ${theme.accentGlow}` : 'none',
          }}
        >
          {page === PAGES - 1 ? (
            <>
              <Check size={16} />
              Submit
            </>
          ) : (
            <>
              Next
              <ChevronRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function QuestionCard({ question, value, onAnswer, theme, index }) {
  const labels = ['Strongly\nDisagree', '', '', 'Neutral', '', '', 'Strongly\nAgree']

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      style={{
        background: theme.bgCard,
        backdropFilter: 'blur(16px)',
        borderRadius: 16,
        border: `1px solid ${value !== undefined ? theme.borderStrong : theme.border}`,
        padding: '20px 24px',
        transition: 'border-color 0.2s',
      }}
    >
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '0.95rem',
          color: theme.text,
          marginBottom: 18,
          lineHeight: 1.5,
        }}
      >
        {question.text}
      </p>

      {/* Slider */}
      <div>
        <div style={{ position: 'relative', padding: '0 4px' }}>
          <input
            type="range"
            min="1"
            max="7"
            value={value || 4}
            onChange={(e) => onAnswer(question.id, parseInt(e.target.value))}
            style={{
              width: '100%',
              background: value !== undefined
                ? `linear-gradient(to right, ${theme.accent} 0%, ${theme.accent} ${((value - 1) / 6) * 100}%, ${theme.border} ${((value - 1) / 6) * 100}%, ${theme.border} 100%)`
                : theme.border,
              color: theme.accent,
            }}
          />
          {/* Custom thumb color via CSS var */}
          <style>{`
            input[type="range"]::-webkit-slider-thumb {
              background: ${theme.accent};
              color: ${theme.accent};
            }
          `}</style>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
          }}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <button
              key={n}
              onClick={() => onAnswer(question.id, n)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: `1.5px solid ${value === n ? theme.accent : theme.border}`,
                background: value === n ? theme.accent : 'transparent',
                color: value === n ? '#fff' : theme.textMuted,
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                fontFamily: 'DM Sans, sans-serif',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: value === n ? `0 0 8px ${theme.accentGlow}` : 'none',
              }}
            >
              {n}
            </button>
          ))}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          <span style={{ fontSize: '0.68rem', color: theme.textMuted }}>Strongly Disagree</span>
          <span style={{ fontSize: '0.68rem', color: theme.textMuted }}>Strongly Agree</span>
        </div>
      </div>
    </motion.div>
  )
}
