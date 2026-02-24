const buildSystemPrompt = () =>
  [
    'You are Arogya assistant.',
    'Return a concise, human-like response in plain text.',
    'Do not provide diagnosis.',
    'If triage exists, reference recommended speciality and safety disclaimer briefly.',
    'If emergencyEscalation is true, strongly advise emergency care immediately.',
    'Do not invent doctors, slots, prices, or APIs.',
  ].join(' ');

const buildUserPrompt = ({ message, displayName, decision }) => {
  const payload = {
    userMessage: message,
    displayName: displayName || '',
    intent: decision.intent,
    action: decision.action,
    baseReply: decision.reply,
    recommendedSpeciality: decision.recommendedSpeciality || null,
    analysis: decision.analysis
      ? {
          doctor: decision.analysis.doctor,
          urgency: decision.analysis.urgency,
          emergencyEscalation: decision.analysis.emergencyEscalation || false,
          tips: decision.analysis.tips,
          disclaimer: decision.analysis.disclaimer,
        }
      : null,
  };
  return `Rewrite this assistant reply naturally and safely:\n${JSON.stringify(payload)}`;
};

export const generateNaturalReply = async ({ message, displayName, decision }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.AI_CHAT_MODEL || 'gpt-4o-mini';

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: [
          { role: 'system', content: [{ type: 'input_text', text: buildSystemPrompt() }] },
          { role: 'user', content: [{ type: 'input_text', text: buildUserPrompt({ message, displayName, decision }) }] },
        ],
        max_output_tokens: 140,
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.output_text?.trim();
    return text || null;
  } catch {
    return null;
  }
};
