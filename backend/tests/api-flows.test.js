import test from 'node:test'
import assert from 'node:assert/strict'

const BASE_URL = process.env.TEST_BASE_URL
const SEEDED_DOC_ID = process.env.TEST_DOC_ID
const SEEDED_SLOT_DATE = process.env.TEST_SLOT_DATE
const SEEDED_SLOT_TIME = process.env.TEST_SLOT_TIME

test('AI endpoint requires auth', { skip: !BASE_URL }, async () => {
  const res = await fetch(`${BASE_URL}/api/user/ai/symptom-analysis`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms: 'fever and cough' }),
  })
  const data = await res.json()
  assert.equal(data.success, false)
})

test('Booking endpoint rejects missing details', { skip: !BASE_URL || !process.env.TEST_USER_TOKEN }, async () => {
  const res = await fetch(`${BASE_URL}/api/user/book-appointment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: process.env.TEST_USER_TOKEN,
    },
    body: JSON.stringify({}),
  })
  const data = await res.json()
  assert.equal(data.success, false)
})

test(
  'Booking endpoint allows seeded valid slot',
  { skip: !BASE_URL || !process.env.TEST_USER_TOKEN || !SEEDED_DOC_ID || !SEEDED_SLOT_DATE || !SEEDED_SLOT_TIME },
  async () => {
    const res = await fetch(`${BASE_URL}/api/user/book-appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        token: process.env.TEST_USER_TOKEN,
      },
      body: JSON.stringify({
        docId: SEEDED_DOC_ID,
        slotDate: SEEDED_SLOT_DATE,
        slotTime: SEEDED_SLOT_TIME,
      }),
    })
    const data = await res.json()
    assert.equal(data.success, true)
  }
)

test('Payment verify rejects invalid signature', { skip: !BASE_URL || !process.env.TEST_USER_TOKEN }, async () => {
  const res = await fetch(`${BASE_URL}/api/user/verifyRazorpay`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: process.env.TEST_USER_TOKEN,
    },
    body: JSON.stringify({
      razorpay_order_id: 'order_invalid',
      razorpay_payment_id: 'pay_invalid',
      razorpay_signature: 'bad_signature',
    }),
  })
  const data = await res.json()
  assert.equal(data.success, false)
})
