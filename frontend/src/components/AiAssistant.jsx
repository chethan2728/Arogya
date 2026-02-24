import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { AppContext } from '../context/AppContext'

const quickActions = [
  'Book appointment',
  'Best affordable doctor',
  'Suggest best time',
  'Compare doctors',
  'Visit checklist',
]
const emergencySignals = [
  'chest pain',
  'difficulty breathing',
  'breathing difficulty',
  'unconscious',
  'loss of consciousness',
  'stroke',
  'severe bleeding',
  'suicidal',
]
const specialityList = [
  'General physician',
  'Gynecologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Gastroenterologist',
]

const timeBuckets = {
  morning: { start: 10, end: 13 },
  afternoon: { start: 13, end: 17 },
  evening: { start: 17, end: 21 },
}

const getDateKey = (dateObj) => `${dateObj.getDate()}_${dateObj.getMonth() + 1}_${dateObj.getFullYear()}`

const parseHour = (timeString = '') => {
  const match = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!match) return 0
  let hour = Number(match[1])
  const meridiem = match[3].toUpperCase()
  if (meridiem === 'PM' && hour !== 12) hour += 12
  if (meridiem === 'AM' && hour === 12) hour = 0
  return hour
}

const buildAvailableSlots = (doctor, days = 7) => {
  if (!doctor) return []

  const slots = []
  const now = new Date()
  for (let i = 0; i < days; i += 1) {
    const dayStart = new Date(now)
    dayStart.setDate(now.getDate() + i)

    const end = new Date(dayStart)
    end.setHours(21, 0, 0, 0)

    if (i === 0) {
      dayStart.setHours(dayStart.getHours() > 10 ? dayStart.getHours() + 1 : 10)
      dayStart.setMinutes(dayStart.getMinutes() > 30 ? 30 : 0)
    } else {
      dayStart.setHours(10, 0, 0, 0)
    }

    while (dayStart < end) {
      const key = getDateKey(dayStart)
      const time = dayStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const booked = doctor.slots_booked?.[key]?.includes(time)
      if (!booked) {
        slots.push({ date: new Date(dayStart), dateKey: key, time })
      }
      dayStart.setMinutes(dayStart.getMinutes() + 30)
    }
  }

  return slots
}

const normalize = (txt = '') => txt.toLowerCase().trim()

const extractBudget = (txt = '') => {
  const match = txt.match(/(?:under|below|budget|within)\s*\D*(\d{2,5})/i) || txt.match(/\b(\d{2,5})\b/)
  return match ? Number(match[1]) : null
}

const extractSpeciality = (txt = '') => {
  const lower = normalize(txt)
  return specialityList.find((s) => lower.includes(s.toLowerCase())) || null
}

const extractTimePreference = (txt = '') => {
  const lower = normalize(txt)
  if (lower.includes('morning')) return 'morning'
  if (lower.includes('afternoon')) return 'afternoon'
  if (lower.includes('evening') || lower.includes('night')) return 'evening'
  return null
}

const extractName = (txt = '') => {
  const patterns = [
    /(?:my name is|call me)\s+([a-zA-Z][a-zA-Z\s]{1,30})/i,
    /(?:set my name to|remember my name as)\s+([a-zA-Z][a-zA-Z\s]{1,30})/i,
    /name\s*[:\-]\s*([a-zA-Z][a-zA-Z\s]{1,30})/i,
  ]
  for (const pattern of patterns) {
    const match = txt.match(pattern)
    if (match?.[1]) {
      return match[1].trim().split(' ').slice(0, 2).join(' ')
    }
  }
  return null
}

const isGreeting = (txt = '') => /\b(hi|hello|hey|good morning|good afternoon|good evening)\b/i.test(txt)
const detectGreetingText = (txt = '') => {
  const lower = normalize(txt)
  if (lower.includes('good morning')) return 'Good morning'
  if (lower.includes('good afternoon')) return 'Good afternoon'
  if (lower.includes('good evening')) return 'Good evening'
  if (lower.includes('hello')) return 'Hello'
  if (lower.includes('hey')) return 'Hey'
  return 'Hi'
}

const extractIntent = (txt = '') => {
  const lower = normalize(txt)
  if (!lower) return 'unknown'
  if (emergencySignals.some((signal) => lower.includes(signal))) return 'emergency'
  if (isGreeting(lower)) return 'greeting'
  if (extractName(lower)) return 'set_name'
  if (/(book|appointment|slot|schedule)/.test(lower)) return 'book'
  if (/(affordable|cheap|budget|price|cost|fee)/.test(lower)) return 'budget'
  if (/(best time|when|time suggestion|morning|afternoon|evening)/.test(lower)) return 'time'
  if (/(compare|which doctor|best doctor|recommend doctor)/.test(lower)) return 'compare'
  if (/(checklist|prepare|before visit)/.test(lower)) return 'checklist'
  if (/(where|how|navigate|go to|open)/.test(lower)) return 'navigation'
  return 'general'
}

const chooseBestSlot = (slots, preferredBucket) => {
  if (!slots.length) return null
  if (!preferredBucket) return slots[0]

  const bucket = timeBuckets[preferredBucket]
  const preferred = slots.find((slot) => {
    const hour = parseHour(slot.time)
    return hour >= bucket.start && hour < bucket.end
  })
  return preferred || slots[0]
}

const rankDoctors = (doctors, contextState) => {
  const { budget, speciality, timePreference } = contextState

  return doctors
    .filter((d) => d.available && (!speciality || d.speciality === speciality))
    .map((doctor) => {
      const slots = buildAvailableSlots(doctor, 7)
      const bestSlot = chooseBestSlot(slots, timePreference)

      let score = 0
      score += Math.min((doctor.experience || 0) * 4, 40)
      score += slots.length > 0 ? 20 : 0
      if (budget && doctor.fees <= budget) score += 20
      if (budget && doctor.fees > budget) score -= Math.min((doctor.fees - budget) / 20, 20)
      if (!speciality) score += 5

      return {
        doctor,
        score,
        slots,
        bestSlot,
      }
    })
    .sort((a, b) => b.score - a.score)
}

const AiAssistant = () => {
  const navigate = useNavigate()
  const { doctors, currencySymbol, backendUrl, token, userData } = useContext(AppContext)

  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [displayName, setDisplayName] = useState(userData?.name || '')
  const [messages, setMessages] = useState([{ role: 'bot', text: 'Hi, I am your Arogya assistant. I can chat, remember your name, and help you book the best slot.' }])
  const [state, setState] = useState({
    budget: null,
    speciality: null,
    timePreference: null,
  })
  const [lastSuggestedDoctors, setLastSuggestedDoctors] = useState([])
  const [pendingNameChange, setPendingNameChange] = useState(null)

  useEffect(() => {
    const loadMemory = async () => {
      if (!token) return
      try {
        const { data } = await axios.get(`${backendUrl}/api/user/ai/memory`, { headers: { token } })
        if (data?.success && data.memory?.preferredName) {
          setDisplayName(data.memory.preferredName)
        } else if (userData?.name) {
          setDisplayName(userData.name)
        }
        if (data?.success && data.memory?.preferences) {
          setState((prev) => ({
            ...prev,
            budget: data.memory.preferences.budget ?? prev.budget,
            speciality: data.memory.preferences.speciality || prev.speciality,
            timePreference: data.memory.preferences.timePreference || prev.timePreference,
          }))
        }
      } catch {
        if (userData?.name) setDisplayName(userData.name)
      }
    }
    loadMemory()
  }, [token, backendUrl, userData?.name])

  const pushBot = (text, meta = {}) => setMessages((prev) => [...prev, { role: 'bot', text, ...meta }])
  const pushUser = (text) => setMessages((prev) => [...prev, { role: 'user', text }])

  const sayWithName = (text) => (displayName ? `${displayName}, ${text}` : text)

  const handleNavigation = (txt) => {
    const lower = normalize(txt)
    if (lower.includes('appointments') || lower.includes('my appointment')) {
      navigate('/my-appointments')
      pushBot(sayWithName('I opened your appointments page.'))
      return true
    }

    if (state.speciality) {
      navigate(`/doctors/${state.speciality}`)
      pushBot(sayWithName(`I opened doctors list for ${state.speciality}.`))
      return true
    }

    navigate('/doctors')
    pushBot(sayWithName('I opened the doctors page. You can filter by speciality there.'))
    return true
  }

  const provideChecklist = () => {
    pushBot(
      sayWithName('Visit checklist: carry previous prescriptions, list medicines, symptom duration notes, and reach 10 minutes early.')
    )
  }

  const rememberName = async (nameText) => {
    setDisplayName(nameText)
    if (!token) {
      pushBot(`Nice to meet you, ${nameText}. Login once and I will remember your name across sessions.`)
      return
    }

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/ai/memory/name`,
        { preferredName: nameText },
        { headers: { token } }
      )
      if (data?.success) {
        pushBot(`Nice to meet you, ${nameText}. I will remember your name next time too.`)
      } else {
        pushBot(data?.message || 'Name memory is already set for this account.')
      }
    } catch {
      pushBot(`Nice to meet you, ${nameText}. I could not persist memory right now, but I will use your name in this session.`)
    }
  }

  const extractNameChangeRequest = (txt = '') => {
    const match = txt.match(/(?:change my assistant name to|change my name to)\s+([a-zA-Z][a-zA-Z\s]{1,30})/i)
    if (!match?.[1]) return null
    return match[1].trim().split(' ').slice(0, 2).join(' ')
  }

  const isNameChangeConfirmation = (txt = '') => /^(yes|yes update|yes, update it|confirm|confirm update)$/i.test(txt.trim())
  const isNameChangeCancel = (txt = '') => /^(no|cancel|stop)$/i.test(txt.trim())

  const handleIntentResponse = (intent, rawText, contextState = state) => {
    if (intent === 'emergency') {
      pushBot(
        'Possible emergency symptoms detected. This chatbot cannot provide emergency care. Please call local emergency services immediately or go to the nearest emergency department now.'
      )
      return
    }

    if (intent === 'greeting') {
      const greeting = detectGreetingText(rawText)
      pushBot(sayWithName(`${greeting}. How can I help you with booking today?`))
      return
    }

    if (intent === 'set_name') {
      const name = extractName(rawText)
      if (name) {
        rememberName(name)
      } else {
        pushBot('I could not catch your name. Try: "My name is Rahul".')
      }
      return
    }

    if (intent === 'checklist') {
      provideChecklist()
      return
    }

    if (intent === 'navigation') {
      handleNavigation(rawText)
      return
    }

    if (intent === 'compare' || intent === 'budget' || intent === 'book' || intent === 'time' || intent === 'general') {
      suggestTopDoctors(contextState)
      if (!contextState.speciality) pushBot(sayWithName('Tell me speciality (for example: Dermatologist) to narrow recommendations.'))
      if (!contextState.budget) pushBot(sayWithName('Tell me your budget like: "under 800".'))
      if (!contextState.timePreference) pushBot(sayWithName('Tell me preferred time: morning, afternoon, or evening.'))
    }
  }

  const suggestTopDoctors = (contextState = state) => {
    const ranked = rankDoctors(doctors || [], contextState)
    if (!ranked.length) {
      setLastSuggestedDoctors([])
      if (contextState.speciality) {
        pushBot(sayWithName(`I could not find available ${contextState.speciality} right now. Try another speciality or time.`))
      } else {
        pushBot(sayWithName('No available doctors found right now. Please try again shortly.'))
      }
      return
    }

    const top = ranked.slice(0, 3)
    setLastSuggestedDoctors(top.map((item) => item.doctor))
    const lines = top.map((item, idx) => {
      const slotText = item.bestSlot ? `${item.bestSlot.date.toLocaleDateString()} ${item.bestSlot.time}` : 'No near-term slot'
      return `${idx + 1}. Dr. ${item.doctor.name} (${item.doctor.speciality}) - ${currencySymbol}${item.doctor.fees}, ${item.doctor.experience} yrs, best slot: ${slotText}`
    })

    pushBot(`${sayWithName('Here are your best matches:')}\n${lines.join('\n')}`, {
      suggestions: top.map((item) => ({
        label: `Book Dr. ${item.doctor.name}`,
        docId: item.doctor._id,
      })),
    })
  }

  const resolveBookByText = (text = '') => {
    const lower = normalize(text)
    if (!/(book|confirm|select)/.test(lower)) return null
    if (!lastSuggestedDoctors.length) return null

    if (/(best|top|first|1|one)/.test(lower)) return lastSuggestedDoctors[0]
    if (/(second|2|two)/.test(lower)) return lastSuggestedDoctors[1] || null
    if (/(third|3|three)/.test(lower)) return lastSuggestedDoctors[2] || null
    return null
  }

  const handleSend = async (forcedText) => {
    const text = (forcedText || input).trim()
    if (!text) return

    pushUser(text)
    setInput('')

    const selectedDoctor = resolveBookByText(text)
    if (selectedDoctor?._id) {
      navigate(`/appointment/${selectedDoctor._id}`)
      pushBot(sayWithName(`Opened booking for Dr. ${selectedDoctor.name}. Please confirm slot and payment.`))
      return
    }

    if (pendingNameChange) {
      if (isNameChangeConfirmation(text)) {
        if (!token) {
          pushBot('Please login first to update saved name memory.')
          setPendingNameChange(null)
          return
        }
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/ai/memory/name`,
            { preferredName: pendingNameChange, allowOverwrite: true },
            { headers: { token } }
          )
          if (data?.success) {
            setDisplayName(pendingNameChange)
            pushBot(`Done. I will use "${pendingNameChange}" from now on.`)
          } else {
            pushBot(data?.message || 'Could not update name memory right now.')
          }
        } catch {
          pushBot('Could not update name memory right now. Please try again.')
        }
        setPendingNameChange(null)
        return
      }
      if (isNameChangeCancel(text)) {
        pushBot('Okay, I did not change your assistant name.')
        setPendingNameChange(null)
        return
      }
      pushBot(`Please reply "yes, update it" to change your name to "${pendingNameChange}", or "cancel".`)
      return
    }

    const nameChangeRequest = extractNameChangeRequest(text)
    if (nameChangeRequest) {
      setPendingNameChange(nameChangeRequest)
      pushBot(`Do you want me to change your assistant name to "${nameChangeRequest}"? Reply "yes, update it" or "cancel".`)
      return
    }

    const nextBudget = extractBudget(text)
    const nextSpeciality = extractSpeciality(text)
    const nextTime = extractTimePreference(text)

    let resolvedSpeciality = nextSpeciality || state.speciality

    const updatedState = {
      budget: nextBudget || state.budget,
      speciality: resolvedSpeciality,
      timePreference: nextTime || state.timePreference,
    }
    setState((prev) => ({
      budget: nextBudget || prev.budget,
      speciality: resolvedSpeciality,
      timePreference: nextTime || prev.timePreference,
    }))

    // Primary path: backend chat orchestrator (intent + memory + symptom triage + preferences).
    if (token) {
      try {
        const { data } = await axios.post(
          `${backendUrl}/api/user/ai/chat`,
          { message: text, context: updatedState },
          { headers: { token } }
        )

          if (data?.success) {
            const backendState = {
              budget: data?.preferences?.budget ?? updatedState.budget,
              speciality: data?.preferences?.speciality ?? updatedState.speciality,
              timePreference: data?.preferences?.timePreference ?? updatedState.timePreference,
            }
            setState(backendState)

            if (data.reply) pushBot(data.reply)
            if (data.nameStatusMessage) pushBot(data.nameStatusMessage)

            if (data.action === 'open_appointments') {
              navigate('/my-appointments')
              pushBot(sayWithName('Opened your appointments page.'))
              return
            }
            if (data.action === 'open_health_tracker') {
              navigate('/health-tracker')
              pushBot(sayWithName('Opened your Health Tracker.'))
              return
            }
            if (data.action === 'open_profile') {
              navigate('/my-profile')
              pushBot(sayWithName('Opened your profile page.'))
              return
            }
            if (data.action === 'suggest_doctors') {
              suggestTopDoctors(backendState)
              if (!backendState.budget) pushBot(sayWithName('Tell me your budget like: "under 800".'))
              if (!backendState.timePreference) pushBot(sayWithName('Tell me preferred time: morning, afternoon, or evening.'))
            }
          return
        }
      } catch {
        // Fall back to client-side logic below if chat API is temporarily unavailable.
      }
    }

    const intent = extractIntent(text)
    setTimeout(() => handleIntentResponse(intent, text, updatedState), 80)
  }

  const handleSuggestionClick = (docId) => {
    navigate(`/appointment/${docId}`)
    pushBot(sayWithName('I opened selected doctor booking page. Choose your slot and confirm.'))
  }

  const applyQuickAction = (action) => {
    const map = {
      'Book appointment': 'I want to book an appointment',
      'Best affordable doctor': 'Suggest affordable doctor under 800',
      'Suggest best time': 'Suggest best time in evening',
      'Compare doctors': 'Compare doctors for best experience',
      'Visit checklist': 'Give me visit checklist',
    }
    handleSend(map[action] || action)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="glass-card w-[350px] sm:w-[430px] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="surface-text font-semibold futurist-title">Arogya Assistant Chatbot</p>
            <button onClick={() => setOpen(false)} className="soft-text">Close</button>
          </div>

          <p className="text-xs soft-text mb-3">
            Human-like assistant for greetings, name memory, booking support, and navigation.
          </p>
          <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1 mb-3">
            Clinical safety: this chatbot is not a diagnosis system. For chest pain, breathing issues, severe bleeding, stroke signs, or self-harm risk, use emergency care immediately.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {quickActions.map((action) => (
              <button
                key={action}
                onClick={() => applyQuickAction(action)}
                className="aqua-outline text-xs px-2.5 py-1 rounded-full hover:bg-cyan-400/10 transition"
              >
                {action}
              </button>
            ))}
          </div>

          <div className="h-[290px] overflow-y-auto rounded-xl border border-cyan-200/40 bg-white/60 p-3 space-y-2">
            {messages.map((msg, idx) => (
              <div key={idx} className={`text-sm ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-3 py-2 rounded-xl ${msg.role === 'user' ? 'bg-cyan-500 text-white' : 'bg-white text-slate-700 border border-cyan-100'}`}>
                  {msg.text.split('\n').map((line, lineIdx) => (
                    <p key={lineIdx}>{line}</p>
                  ))}
                </div>

                {msg.suggestions?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2 justify-start">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s.docId}
                        onClick={() => handleSuggestionClick(s.docId)}
                        className="text-xs px-2 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Try: "Good morning", "My name is Alex", "book dermatologist under 1000"'
              className="flex-1 px-3 py-2 rounded-xl border border-cyan-200/40 bg-white/70 surface-text text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={() => handleSend()} className="aqua-button text-deep px-4 py-2 rounded-xl text-sm">
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="aqua-button text-deep w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
        aria-label="Open AI assistant"
      >
        AI
      </button>
    </div>
  )
}

export default AiAssistant
