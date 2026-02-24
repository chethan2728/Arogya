import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import JWT from 'jsonwebtoken'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import userModel from '../models/userModel.js'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import carePlanModel from '../models/carePlanModel.js'

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:4000'
const mongoUri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI
const jwtSecret = process.env.TEST_JWT_SECRET || process.env.JWT_SECRET

if (!mongoUri) {
  console.error('Missing TEST_MONGODB_URI or MONGODB_URI')
  process.exit(1)
}

if (!jwtSecret) {
  console.error('Missing TEST_JWT_SECRET or JWT_SECRET')
  process.exit(1)
}

const seedTag = `seed-${Date.now()}`
let seededUserId = null
let seededDocId = null
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const getTomorrowSlotDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return `${date.getDate()}_${date.getMonth() + 1}_${date.getFullYear()}`
}

const cleanup = async () => {
  if (!mongoose.connection.readyState) return
  try {
    if (seededUserId) {
      await appointmentModel.deleteMany({ userId: String(seededUserId) })
      await carePlanModel.deleteMany({ userId: String(seededUserId) })
      await userModel.deleteOne({ _id: seededUserId })
    }
    if (seededDocId) {
      await appointmentModel.deleteMany({ docId: String(seededDocId) })
      await carePlanModel.deleteMany({ docId: String(seededDocId) })
      await doctorModel.deleteOne({ _id: seededDocId })
    }
  } catch (error) {
    console.error('Cleanup error:', error.message)
  }
}

try {
  await mongoose.connect(mongoUri)

  const hashed = bcrypt.hashSync('SeedPass123!', 10)

  const user = await userModel.create({
    name: 'Seed User',
    email: `seed.user.${seedTag}@example.com`,
    password: hashed,
    phone: '0000000000',
    address: { line1: 'Seed line1', line2: 'Seed line2' },
  })
  seededUserId = user._id

  const doctor = await doctorModel.create({
    name: 'Seed Doctor',
    email: `seed.doctor.${seedTag}@example.com`,
    password: hashed,
    speciality: 'General physician',
    image: '',
    phone: '0000000000',
    experience: 8,
    degree: 'MBBS',
    about: 'Seed doctor for automated tests',
    available: true,
    fees: 500,
    address: { line1: 'Seed Clinic', line2: 'Seed Area' },
    slots_booked: {},
  })
  seededDocId = doctor._id

  const token = JWT.sign({ id: user._id }, jwtSecret)
  const slotDate = getTomorrowSlotDate()
  const slotTime = '10:00 AM'

  console.log('Seeded test data created')
  console.log(`User: ${user.email}`)
  console.log(`Doctor ID: ${doctor._id}`)

  const child = spawn(
    process.execPath,
    ['--test', 'tests/api-flows.test.js'],
    {
      cwd: backendRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        TEST_BASE_URL: baseUrl,
        TEST_USER_TOKEN: token,
        TEST_DOC_ID: String(doctor._id),
        TEST_SLOT_DATE: slotDate,
        TEST_SLOT_TIME: slotTime,
      },
    }
  )

  const exitCode = await new Promise((resolve) => child.on('close', resolve))

  await cleanup()
  await mongoose.disconnect()

  process.exit(exitCode ?? 1)
} catch (error) {
  console.error('Seeded test run failed:', error.message)
  await cleanup()
  if (mongoose.connection.readyState) await mongoose.disconnect()
  process.exit(1)
}
