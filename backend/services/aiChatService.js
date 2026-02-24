import { analyzeSymptomsNLP } from './nlpTriageService.js';

const specialityList = [
  'General physician',
  'Gynecologist',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Gastroenterologist',
];

const normalize = (txt = '') => txt.toLowerCase().trim();
const isGreeting = (txt = '') => /\b(hi+|hello+|hey+|good morning|good afternoon|good evening)\b/.test(normalize(txt));

const symptomSignals = [
  'pain', 'ache', 'swelling', 'stiffness', 'injury', 'sprain', 'strain', 'fever', 'cold', 'cough',
  'rash', 'itch', 'vomit', 'vomiting', 'nausea', 'dizzy', 'headache', 'migraine', 'bleeding',
  'stomach', 'abdomen', 'leg', 'knee', 'back', 'neck', 'shoulder', 'arm', 'foot', 'ankle',
  'heart', 'cardiac', 'palpitation', 'bp', 'pressure', 'hypertension', 'disease', 'desiese',
];

const extractBudget = (txt = '') => {
  const match = txt.match(/(?:under|below|budget|within)\s*\D*(\d{2,5})/i) || txt.match(/\b(\d{2,5})\b/);
  return match ? Number(match[1]) : null;
};

const extractSpeciality = (txt = '') => {
  const lower = normalize(txt);
  return specialityList.find((s) => lower.includes(s.toLowerCase())) || null;
};

const extractTimePreference = (txt = '') => {
  const lower = normalize(txt);
  if (lower.includes('morning')) return 'morning';
  if (lower.includes('afternoon')) return 'afternoon';
  if (lower.includes('evening') || lower.includes('night')) return 'evening';
  return null;
};

const extractExplicitName = (txt = '') => {
  const patterns = [
    /(?:my name is|call me)\s+([a-zA-Z][a-zA-Z\s]{1,30})/i,
    /(?:set my name to|remember my name as)\s+([a-zA-Z][a-zA-Z\s]{1,30})/i,
    /name\s*[:\-]\s*([a-zA-Z][a-zA-Z\s]{1,30})/i,
  ];
  for (const pattern of patterns) {
    const match = txt.match(pattern);
    if (match?.[1]) return match[1].trim().split(' ').slice(0, 2).join(' ');
  }
  return null;
};

const looksLikeSymptoms = (txt = '') => {
  const lower = normalize(txt);
  const hasSymptomToken = symptomSignals.some((token) => lower.includes(token));
  const hasSymptomPhrase = /(i have|i am having|suffering from|symptom|problem with)/.test(lower);
  if (hasSymptomPhrase && hasSymptomToken) return true;
  return hasSymptomToken;
};

const detectIntent = (txt = '') => {
  const lower = normalize(txt);
  if (!lower) return 'unknown';
  if (isGreeting(lower)) return 'greeting';
  if (/(how to|help me|guide me|where to click|how do i|teach me)/.test(lower)) return 'help';
  if (/\b(how are you|are you ok|are you okay|what can you do|who are you)\b/.test(lower)) return 'smalltalk';
  if (extractExplicitName(lower)) return 'set_name';
  if (looksLikeSymptoms(lower)) return 'symptoms';
  if (/(my appointment|appointments|booking status|reschedule|cancel appointment)/.test(lower)) return 'appointments';
  if (/(health tracker|health record|upload report|medical record)/.test(lower)) return 'health';
  if (/(profile|my account|edit profile)/.test(lower)) return 'profile';
  if (/(book|appointment|slot|schedule)/.test(lower)) return 'book';
  if (/(affordable|cheap|budget|price|cost|fee)/.test(lower)) return 'budget';
  if (/(best time|time suggestion|morning|afternoon|evening|night)/.test(lower)) return 'time';
  if (/(compare|which doctor|best doctor|recommend doctor)/.test(lower)) return 'compare';
  return 'general';
};

export const buildAiChatResponse = ({ message, context = {}, displayName = '' }) => {
  const text = message?.trim() || '';
  const intent = detectIntent(text);
  const nextPreferences = {
    budget: context.budget ?? null,
    speciality: context.speciality ?? null,
    timePreference: context.timePreference ?? null,
  };

  const budget = extractBudget(text);
  const speciality = extractSpeciality(text);
  const timePreference = extractTimePreference(text);
  if (budget) nextPreferences.budget = budget;
  if (speciality) nextPreferences.speciality = speciality;
  if (timePreference) nextPreferences.timePreference = timePreference;

  if (intent === 'set_name') {
    return {
      intent,
      action: 'set_name',
      nameCandidate: extractExplicitName(text),
      reply: 'Got it. I can remember your name for this account.',
      preferences: nextPreferences,
    };
  }

  if (intent === 'greeting') {
    const prefix = displayName ? `${displayName}, ` : '';
    return {
      intent,
      action: 'reply_only',
      reply: `${prefix}Good to see you. I can help with symptoms, booking, profile updates, and step-by-step website guidance.`,
      preferences: nextPreferences,
    };
  }

  if (intent === 'smalltalk') {
    const prefix = displayName ? `${displayName}, ` : '';
    return {
      intent,
      action: 'reply_only',
      reply: `${prefix}I am here and ready to help. You can tell me symptoms, ask for doctor suggestions, or say book appointment.`,
      preferences: nextPreferences,
    };
  }

  if (intent === 'help') {
    const lower = normalize(text);
    const prefix = displayName ? `${displayName}, ` : '';

    if (/(book|appointment|slot)/.test(lower)) {
      return {
        intent,
        action: 'reply_only',
        reply:
          `${prefix}Sure, here is how to book:\n` +
          '1. Open Doctors page.\n' +
          '2. Select a speciality or ask me for a suggestion.\n' +
          '3. Click a doctor card.\n' +
          '4. Choose date and time slot.\n' +
          '5. Confirm and complete payment.',
        preferences: nextPreferences,
      };
    }

    if (/(report|health tracker|upload)/.test(lower)) {
      return {
        intent,
        action: 'reply_only',
        reply:
          `${prefix}Here is how to upload a report:\n` +
          '1. Open Health Tracker.\n' +
          '2. In Upload Report, choose the file.\n' +
          '3. Add title/details if needed.\n' +
          '4. Click save.\n' +
          '5. Check History and open the uploaded report link.',
        preferences: nextPreferences,
      };
    }

    if (/(profile|photo|image|name|phone)/.test(lower)) {
      return {
        intent,
        action: 'reply_only',
        reply:
          `${prefix}Here is how to update profile:\n` +
          '1. Open My Profile.\n' +
          '2. Edit fields (name, phone, address).\n' +
          '3. Upload a new profile image if needed.\n' +
          '4. Click Update Profile.\n' +
          '5. Refresh once to confirm changes.',
        preferences: nextPreferences,
      };
    }

    return {
      intent,
      action: 'reply_only',
      reply:
        `${prefix}I can guide you step-by-step. Try:\n` +
        '1. "How to book appointment"\n' +
        '2. "How to upload report"\n' +
        '3. "How to update profile"',
      preferences: nextPreferences,
    };
  }

  if (intent === 'appointments') {
    const prefix = displayName ? `${displayName}, ` : '';
    return {
      intent,
      action: 'open_appointments',
      reply: `${prefix}I can open your appointments and help with reschedule or cancellation.`,
      preferences: nextPreferences,
    };
  }

  if (intent === 'health') {
    const prefix = displayName ? `${displayName}, ` : '';
    return {
      intent,
      action: 'open_health_tracker',
      reply: `${prefix}I can open your Health Tracker to upload reports and view follow-up timeline.`,
      preferences: nextPreferences,
    };
  }

  if (intent === 'profile') {
    const prefix = displayName ? `${displayName}, ` : '';
    return {
      intent,
      action: 'open_profile',
      reply: `${prefix}I can open your profile settings.`,
      preferences: nextPreferences,
    };
  }

  if (intent === 'symptoms') {
    const analysis = analyzeSymptomsNLP(text);
    nextPreferences.speciality = analysis.doctor;
    const prefix = displayName ? `${displayName}, ` : '';
    return {
      intent,
      action: 'suggest_doctors',
      recommendedSpeciality: analysis.doctor,
      analysis,
      reply: `${prefix}I’m sorry you’re not feeling well. Based on your symptoms, start with a ${analysis.doctor}.`,
      preferences: nextPreferences,
    };
  }

  if (intent === 'book' || intent === 'compare' || intent === 'budget' || intent === 'time') {
    const prefix = displayName ? `${displayName}, ` : '';
    return {
      intent,
      action: 'suggest_doctors',
      recommendedSpeciality: nextPreferences.speciality || null,
      reply: `${prefix}I can help you book now. I will suggest the best doctors and slots.`,
      preferences: nextPreferences,
    };
  }

  return {
    intent,
    action: 'reply_only',
    reply: 'I can help. Share symptoms for triage, ask for booking, or say "help me use the website".',
    preferences: nextPreferences,
  };
};
