import test from 'node:test'
import assert from 'node:assert/strict'
import crypto from 'crypto'
import { verifyRazorpaySignature } from '../services/paymentService.js'

test('verifyRazorpaySignature validates known good signature', () => {
  const secret = 'test_secret'
  const orderId = 'order_123'
  const paymentId = 'pay_456'
  const signature = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')

  assert.equal(
    verifyRazorpaySignature({ orderId, paymentId, signature, secret }),
    true
  )
})

test('verifyRazorpaySignature rejects tampered signature', () => {
  assert.equal(
    verifyRazorpaySignature({
      orderId: 'order_123',
      paymentId: 'pay_456',
      signature: 'invalid_signature',
      secret: 'test_secret',
    }),
    false
  )
})
