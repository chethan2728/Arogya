import fs from 'fs/promises'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4000'
const userEmail = process.env.TEST_USER_EMAIL
const userPassword = process.env.TEST_USER_PASSWORD
const adminEmail = process.env.TEST_ADMIN_EMAIL
const adminPassword = process.env.TEST_ADMIN_PASSWORD

const outFile = process.env.EVAL_OUT_FILE || '/tmp/arogya-eval-report.json'

const post = async (path, body, tokenHeader = {}) => {
  const res = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...tokenHeader },
    body: JSON.stringify(body || {}),
  })
  return res.json()
}

const get = async (path, tokenHeader = {}) => {
  const res = await fetch(`${baseUrl}${path}`, { headers: tokenHeader })
  return res.json()
}

const report = {
  startedAt: new Date().toISOString(),
  baseUrl,
  checks: [],
}

const pushCheck = (name, ok, details) => {
  report.checks.push({ name, ok, details })
}

try {
  const ping = await get('/')
  pushCheck('server_ping', true, ping)
} catch (error) {
  pushCheck('server_ping', false, error.message)
}

let userToken = process.env.TEST_USER_TOKEN || ''
if (!userToken && userEmail && userPassword) {
  const login = await post('/api/user/login', { email: userEmail, password: userPassword })
  userToken = login.token || ''
  pushCheck('user_login', Boolean(userToken), login)
}

if (userToken) {
  const ai = await post('/api/user/ai/symptom-analysis', { symptoms: 'fever and chest pain' }, { token: userToken })
  pushCheck('ai_triage', ai.success === true, ai)

  const paymentVerify = await post(
    '/api/user/verifyRazorpay',
    { razorpay_order_id: 'order_x', razorpay_payment_id: 'pay_x', razorpay_signature: 'bad' },
    { token: userToken }
  )
  pushCheck('payment_verify_negative', paymentVerify.success === false, paymentVerify)

  const missingBooking = await post('/api/user/book-appointment', {}, { token: userToken })
  pushCheck('booking_missing_payload_negative', missingBooking.success === false, missingBooking)
} else {
  pushCheck('user_token_available', false, 'Provide TEST_USER_TOKEN or TEST_USER_EMAIL/TEST_USER_PASSWORD')
}

let adminToken = process.env.TEST_ADMIN_TOKEN || ''
if (!adminToken && adminEmail && adminPassword) {
  const adminLogin = await post('/api/admin/login', { email: adminEmail, password: adminPassword })
  adminToken = adminLogin.token || ''
  pushCheck('admin_login', Boolean(adminToken), adminLogin)
}

if (adminToken) {
  const dashboard = await get('/api/admin/dashboard', { aToken: adminToken })
  pushCheck('dashboard_metrics', dashboard.success === true && !!dashboard.dashData?.metrics, dashboard)
} else {
  pushCheck('admin_token_available', false, 'Provide TEST_ADMIN_TOKEN or TEST_ADMIN_EMAIL/TEST_ADMIN_PASSWORD')
}

report.finishedAt = new Date().toISOString()
await fs.writeFile(outFile, JSON.stringify(report, null, 2))
console.log(`Evaluation report written to ${outFile}`)
