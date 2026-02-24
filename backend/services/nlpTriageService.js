const triageProfiles = [
  {
    speciality: 'Gynecologist',
    keywords: ['pregnancy', 'pregnant', 'period', 'cycle', 'menstrual', 'pcos', 'ovary', 'uterus', 'pelvic'],
    symptoms: ['cramp', 'bleeding', 'irregular', 'nausea'],
    urgent: ['heavy bleeding', 'severe pelvic pain'],
    tips: 'Track cycle details, stay hydrated, and book a gynecology review.',
  },
  {
    speciality: 'Dermatologist',
    keywords: ['skin', 'rash', 'itch', 'allergy', 'acne', 'eczema', 'psoriasis', 'fungal'],
    symptoms: ['redness', 'patches', 'burning'],
    urgent: ['swelling of face', 'rapid spreading rash'],
    tips: 'Avoid irritants and keep the area clean and dry until reviewed.',
  },
  {
    speciality: 'Gastroenterologist',
    keywords: ['stomach', 'abdomen', 'gas', 'acidity', 'indigestion', 'ulcer', 'constipation', 'diarrhea', 'food poisoning'],
    symptoms: ['bloating', 'vomit', 'vomiting', 'nausea', 'pain', 'loose motion'],
    urgent: ['blood in stool', 'persistent vomiting'],
    tips: 'Take light meals, hydrate, and avoid spicy or oily food.',
  },
  {
    speciality: 'Neurologist',
    keywords: ['headache', 'migraine', 'dizzy', 'vertigo', 'seizure', 'numbness', 'neuro'],
    symptoms: ['faint', 'blurred vision', 'tingling'],
    urgent: ['sudden severe headache', 'loss of consciousness'],
    tips: 'Limit screen strain and monitor headache frequency and triggers.',
  },
  {
    speciality: 'Pediatrician',
    keywords: ['child', 'kid', 'baby', 'infant', 'newborn', 'pediatric'],
    symptoms: ['fever', 'cough', 'vomit', 'cold'],
    urgent: ['high fever in infant', 'breathing difficulty child'],
    tips: 'Monitor hydration and temperature closely for pediatric symptoms.',
  },
  {
    speciality: 'General physician',
    keywords: [
      'fever', 'cold', 'cough', 'sore throat', 'fatigue', 'weakness', 'body pain', 'infection',
      'leg', 'knee', 'ankle', 'foot', 'hip', 'back', 'neck', 'shoulder', 'arm', 'joint', 'muscle',
      'sprain', 'strain', 'injury', 'heart', 'cardiac', 'palpitation', 'hypertension', 'bp', 'pressure', 'disease',
    ],
    symptoms: ['chills', 'runny nose', 'throat pain', 'pain', 'swelling', 'stiffness', 'ache'],
    urgent: ['breathing difficulty', 'chest pain', 'unable to walk', 'severe swelling after injury'],
    tips: 'Rest well, hydrate, and seek physician review if symptoms persist.',
  },
];
const emergencySignals = [
  'chest pain',
  'difficulty breathing',
  'breathing difficulty',
  'unconscious',
  'loss of consciousness',
  'stroke',
  'severe bleeding',
  'suicidal',
];

const stopWords = new Set([
  'i', 'am', 'is', 'are', 'the', 'a', 'an', 'and', 'or', 'to', 'for', 'of', 'with', 'have', 'has', 'had', 'my',
  'me', 'in', 'on', 'at', 'since', 'from', 'it', 'this', 'that', 'very', 'feel', 'feeling', 'been', 'days', 'day',
]);

const normalizeText = (text = '') =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const tokenize = (text = '') =>
  normalizeText(text)
    .split(' ')
    .filter((token) => token && !stopWords.has(token))
    .map((token) => {
      const aliases = {
        vomiting: 'vomit',
        vomits: 'vomit',
        puking: 'vomit',
        puked: 'vomit',
        desiese: 'disease',
        desease: 'disease',
        diseases: 'disease',
        heartburn: 'acidity',
        palpitations: 'palpitation',
        nauseous: 'nausea',
        dizzy: 'dizzy',
        knees: 'knee',
        ankles: 'ankle',
        legs: 'leg',
        feet: 'foot',
      };
      return aliases[token] || token;
    });

const ngrams = (tokens, n = 2) => {
  const grams = [];
  for (let i = 0; i <= tokens.length - n; i += 1) {
    grams.push(tokens.slice(i, i + n).join(' '));
  }
  return grams;
};

const bodyRegionSignals = [
  'leg', 'knee', 'ankle', 'foot', 'hip', 'back', 'neck', 'shoulder', 'arm', 'wrist', 'elbow', 'joint', 'muscle',
];
const painSignals = ['pain', 'ache', 'swelling', 'stiffness', 'cramp', 'injury', 'sprain', 'strain'];
const dermatologySignals = ['skin', 'rash', 'itch', 'allergy', 'acne', 'eczema', 'psoriasis', 'fungal', 'redness', 'patches'];
const giSignals = ['vomit', 'nausea', 'stomach', 'abdomen', 'diarrhea', 'constipation', 'indigestion', 'acidity', 'bloating'];
const gynSignals = ['pregnancy', 'pregnant', 'period', 'menstrual', 'cycle', 'pcos', 'ovary', 'uterus', 'pelvic'];
const cardioSignals = ['heart', 'cardiac', 'palpitation', 'bp', 'pressure', 'hypertension', 'disease'];

const buildLexicon = (profile) => new Set([...profile.keywords, ...profile.symptoms, ...profile.urgent]);

const scoreProfile = (profile, tokens, bigrams) => {
  const lexicon = buildLexicon(profile);
  let score = 0;

  tokens.forEach((token) => {
    if (profile.keywords.includes(token)) score += 3;
    else if (profile.symptoms.includes(token)) score += 2;
    else if (lexicon.has(token)) score += 1;
  });

  bigrams.forEach((gram) => {
    if (profile.urgent.includes(gram)) score += 5;
    else if (profile.keywords.includes(gram)) score += 3;
  });

  return score;
};

const applyDomainBoosts = (scores, normalizedText, tokens) => {
  const nextScores = [...scores];
  const hasBodyRegion = bodyRegionSignals.some((term) => normalizedText.includes(term));
  const hasPainSignal = painSignals.some((term) => normalizedText.includes(term));
  const hasDermSignal = dermatologySignals.some((term) => normalizedText.includes(term));
  const hasGiSignal = giSignals.some((term) => normalizedText.includes(term));
  const hasGynSignal = gynSignals.some((term) => normalizedText.includes(term));
  const hasCardioSignal = cardioSignals.some((term) => normalizedText.includes(term));
  const generalIdx = triageProfiles.findIndex((p) => p.speciality === 'General physician');
  const dermIdx = triageProfiles.findIndex((p) => p.speciality === 'Dermatologist');
  const gastroIdx = triageProfiles.findIndex((p) => p.speciality === 'Gastroenterologist');
  const gynIdx = triageProfiles.findIndex((p) => p.speciality === 'Gynecologist');

  // Musculoskeletal pain (e.g., leg pain) should route to physician, not dermatologist.
  if (hasBodyRegion && hasPainSignal && generalIdx >= 0) nextScores[generalIdx] += 7;
  if (hasBodyRegion && hasPainSignal && !hasDermSignal && dermIdx >= 0) nextScores[dermIdx] -= 4;

  // Strengthen dermatology only when explicit skin context exists.
  if (hasDermSignal && dermIdx >= 0) nextScores[dermIdx] += 5;

  // GI symptoms should prioritize gastro unless pregnancy/gyne context is explicit.
  if (hasGiSignal && gastroIdx >= 0) nextScores[gastroIdx] += 6;
  if (hasGiSignal && !hasGynSignal && gynIdx >= 0) nextScores[gynIdx] -= 3;
  if (hasCardioSignal && generalIdx >= 0) nextScores[generalIdx] += 8;
  if (hasCardioSignal && !hasGynSignal && gynIdx >= 0) nextScores[gynIdx] -= 4;

  // Single-token pain without context is ambiguous; keep physician as safe default.
  if (tokens.length <= 3 && tokens.includes('pain') && generalIdx >= 0) nextScores[generalIdx] += 2;

  return nextScores;
};

const softmax = (values) => {
  const safe = values.map((v) => Math.max(v, 0));
  const max = Math.max(...safe);
  const expValues = safe.map((v) => Math.exp(v - max));
  const sum = expValues.reduce((acc, v) => acc + v, 0) || 1;
  return expValues.map((v) => v / sum);
};

const urgencyFromSymptoms = (normalizedText, topProfile) => {
  if (emergencySignals.some((signal) => normalizedText.includes(signal))) return 'high';
  if (!topProfile) return 'low';
  const hasUrgentPhrase = topProfile.urgent.some((phrase) => normalizedText.includes(phrase));
  if (hasUrgentPhrase) return 'high';
  const mediumSignals = ['pain', 'vomit', 'fever', 'dizzy', 'bleeding'];
  if (mediumSignals.some((signal) => normalizedText.includes(signal))) return 'medium';
  return 'low';
};

export const analyzeSymptomsNLP = (input = '') => {
  const normalized = normalizeText(input);
  const tokens = tokenize(input);
  const bigrams = ngrams(tokens, 2);

  if (!normalized || tokens.length === 0) {
    return {
      doctor: 'General physician',
      confidence: 0.2,
      urgency: 'low',
      topPredictions: [{ speciality: 'General physician', probability: 1 }],
      tips: 'Please describe your symptoms in more detail for better analysis.',
      reasoning: ['Insufficient text for NLP scoring'],
    };
  }

  const baseScores = triageProfiles.map((profile) => scoreProfile(profile, tokens, bigrams));
  const scores = applyDomainBoosts(baseScores, normalized, tokens);
  const probs = softmax(scores);

  const ranked = triageProfiles
    .map((profile, idx) => ({
      speciality: profile.speciality,
      probability: Number(probs[idx].toFixed(3)),
      score: scores[idx],
      tips: profile.tips,
    }))
    .sort((a, b) => b.probability - a.probability);

  let best = ranked[0];
  if (best.score <= 0) {
    best = {
      speciality: 'General physician',
      probability: 0.5,
      score: 0,
      tips: 'Please provide more details (duration, severity, and associated symptoms) for better triage.',
    };
  }
  const bestProfile = triageProfiles.find((p) => p.speciality === best.speciality);
  const urgency = urgencyFromSymptoms(normalized, bestProfile);
  const emergencyEscalation = emergencySignals.some((signal) => normalized.includes(signal));

  const reasoning = [];
  if (best.score > 0) reasoning.push(`Matched symptom pattern for ${best.speciality}`);
  if (urgency === 'high') reasoning.push('Urgent symptom phrase detected');
  if (reasoning.length === 0) reasoning.push('General symptom language matched fallback profile');
  if (emergencyEscalation) reasoning.push('Emergency signal detected; immediate care escalation triggered');

  const topPredictions = best.score <= 0
    ? [{ speciality: 'General physician', probability: 1 }]
    : ranked.slice(0, 3).map(({ speciality, probability }) => ({ speciality, probability }));

  return {
    doctor: best.speciality,
    confidence: best.probability,
    urgency,
    emergencyEscalation,
    topPredictions,
    tips: best.tips,
    disclaimer:
      'NLP triage is decision support only and not a medical diagnosis. If symptoms are severe, worsening, or emergency-like, contact local emergency services immediately.',
    reasoning,
  };
};
