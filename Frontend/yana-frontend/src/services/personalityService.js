import api from './api'

export const personalityService = {
  getQuestions: () =>
    api.get('/personality/questions'),

  submitAnswers: (answers) =>
    api.post('/personality/submit', { answers }),
}
