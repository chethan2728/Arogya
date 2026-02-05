import React, { useMemo, useState } from 'react'

const quickPrompts = [
  { label: 'Cough', text: 'I have a cough and sore throat' },
  { label: 'Cold', text: 'I have a cold and runny nose' },
  { label: 'Headache', text: 'I have headaches and dizziness' },
  { label: 'Skin', text: 'I have a skin rash and itching' },
  { label: 'Stomach', text: 'I have stomach pain and indigestion' },
]

const getRecommendation = (symptoms) => {
  const text = symptoms.toLowerCase()
  if (text.includes('preg') || text.includes('period') || text.includes('cycle')) {
    return { doctor: 'Gynecologist', tips: 'Track symptoms, stay hydrated, and seek care if pain is severe or unusual.' }
  }
  if (text.includes('skin') || text.includes('rash') || text.includes('itch')) {
    return { doctor: 'Dermatologist', tips: 'Avoid harsh products, keep the area clean, and note any new triggers.' }
  }
  if (text.includes('stomach') || text.includes('indigestion') || text.includes('gas') || text.includes('acidity')) {
    return { doctor: 'Gastroenterologist', tips: 'Eat light meals, avoid spicy foods, and stay hydrated.' }
  }
  if (text.includes('headache') || text.includes('migraine') || text.includes('dizzy') || text.includes('neurolog')) {
    return { doctor: 'Neurologist', tips: 'Rest in a dark room, avoid screen strain, and track triggers.' }
  }
  if (text.includes('baby') || text.includes('child') || text.includes('kid') || text.includes('pediatric')) {
    return { doctor: 'Pediatrician', tips: 'Monitor temperature, hydration, and appetite; seek care if symptoms worsen.' }
  }
  if (text.includes('cough') || text.includes('cold') || text.includes('fever') || text.includes('sore throat')) {
    return {
      doctor: 'General physician',
      tips: 'Rest, fluids, and warm tea can help. Consider OTC symptom relief if appropriate.',
      otc: 'Common OTC options include acetaminophen/paracetamol for fever, saline spray, or throat lozenges.',
    }
  }
  return { doctor: 'General physician', tips: 'Share your symptoms clearly and consider booking a general consultation.' }
}

const AiAssistant = () => {
  const [open, setOpen] = useState(false)
  const [symptoms, setSymptoms] = useState('')
  const [response, setResponse] = useState(null)

  const suggestion = useMemo(() => getRecommendation(symptoms || ''), [symptoms])

  const handleSuggest = () => {
    if (!symptoms.trim()) return
    setResponse({
      doctor: suggestion.doctor,
      tips: suggestion.tips,
      otc: suggestion.otc,
      note: 'This is general guidance only. For urgent symptoms, seek immediate medical care.',
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="glass-card w-[320px] sm:w-[360px] rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="surface-text font-semibold futurist-title">Arogya AI Assist</p>
            <button onClick={() => setOpen(false)} className="soft-text">Close</button>
          </div>
          <p className="text-xs soft-text mt-1">Quick symptom guidance and doctor suggestions.</p>

          <div className="flex flex-wrap gap-2 mt-3">
            {quickPrompts.map((item) => (
              <button
                key={item.label}
                onClick={() => setSymptoms(item.text)}
                className="aqua-outline text-xs px-2.5 py-1 rounded-full hover:bg-cyan-400/10 transition"
              >
                {item.label}
              </button>
            ))}
          </div>

          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms..."
            rows={3}
            className="w-full mt-3 px-3 py-2 rounded-xl border border-cyan-200/40 bg-white/70 surface-text text-sm"
          />

          <button onClick={handleSuggest} className="aqua-button text-deep w-full mt-3 py-2 rounded-full text-sm">
            Get Suggestion
          </button>

          {response && (
            <div className="mt-3 text-sm soft-text">
              <p className="surface-text font-medium">Suggested doctor: {response.doctor}</p>
              <p className="mt-1">{response.tips}</p>
              {response.otc && <p className="mt-1">{response.otc}</p>}
              <p className="mt-2 text-xs soft-text">{response.note}</p>
            </div>
          )}
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
