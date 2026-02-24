import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeSymptomsNLP } from '../services/nlpTriageService.js'

test('routes leg pain to General physician', () => {
  const result = analyzeSymptomsNLP('I have leg pain since morning')
  assert.equal(result.doctor, 'General physician')
})

test('routes skin rash to Dermatologist', () => {
  const result = analyzeSymptomsNLP('I have itchy skin rash and redness')
  assert.equal(result.doctor, 'Dermatologist')
})

test('routes vomiting to Gastroenterologist', () => {
  const result = analyzeSymptomsNLP('I am vomiting since morning')
  assert.equal(result.doctor, 'Gastroenterologist')
})

test('falls back safely to General physician on unknown text', () => {
  const result = analyzeSymptomsNLP('xyz qwerty random words')
  assert.equal(result.doctor, 'General physician')
})

test('routes heart disease text to General physician', () => {
  const result = analyzeSymptomsNLP('I have heart desiese')
  assert.equal(result.doctor, 'General physician')
})

test('triggers emergency escalation for chest pain + breathing difficulty', () => {
  const result = analyzeSymptomsNLP('chest pain and breathing difficulty')
  assert.equal(result.emergencyEscalation, true)
  assert.equal(result.urgency, 'high')
})
