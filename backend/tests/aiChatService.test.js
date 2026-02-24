import test from 'node:test'
import assert from 'node:assert/strict'
import { buildAiChatResponse } from '../services/aiChatService.js'

test('does not treat "I am vomiting" as set_name', () => {
  const decision = buildAiChatResponse({
    message: 'I am vomiting since morning',
    context: {},
    displayName: 'User',
  })
  assert.notEqual(decision.intent, 'set_name')
  assert.equal(decision.intent, 'symptoms')
  assert.equal(decision.recommendedSpeciality, 'Gastroenterologist')
})

test('symptom routing overrides stale speciality preference', () => {
  const decision = buildAiChatResponse({
    message: 'I have heart desiese',
    context: { speciality: 'Dermatologist' },
    displayName: 'User',
  })
  assert.equal(decision.intent, 'symptoms')
  assert.equal(decision.preferences.speciality, 'General physician')
})

test('appointments intent maps to open_appointments action', () => {
  const decision = buildAiChatResponse({
    message: 'open my appointments',
    context: {},
    displayName: 'User',
  })
  assert.equal(decision.action, 'open_appointments')
})

test('smalltalk does not trigger booking flow', () => {
  const decision = buildAiChatResponse({
    message: 'are you ok',
    context: {},
    displayName: 'User',
  })
  assert.equal(decision.intent, 'smalltalk')
  assert.equal(decision.action, 'reply_only')
})

test('greeting supports casual variants like hii', () => {
  const decision = buildAiChatResponse({
    message: 'hii',
    context: {},
    displayName: 'User',
  })
  assert.equal(decision.intent, 'greeting')
  assert.equal(decision.action, 'reply_only')
})

test('help intent returns step-by-step booking guidance', () => {
  const decision = buildAiChatResponse({
    message: 'how to book appointment',
    context: {},
    displayName: 'User',
  })
  assert.equal(decision.intent, 'help')
  assert.match(decision.reply, /1\.\s*Open Doctors page/i)
})
