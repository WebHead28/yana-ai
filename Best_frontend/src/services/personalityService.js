import api from './api'

export const personalityService = {
  getQuestions: async () => {
    const res = await api.get('/personality/questions')
    return res.data
  },

  submitAnswers: async (answers) => {
    // answers: { question_id: value (1-7) }
    const res = await api.post('/personality/submit', { answers })
    return res.data
  },
}
