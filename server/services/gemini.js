const Drive = require('../models/Drive');
const HttpError = require('./HttpError');

// Statuses Gemini returns when it is busy or rate limited; these usually pass within seconds
const RETRYABLE = [429, 500, 503];
const ATTEMPTS = 3;

// Calls Gemini, retrying busy responses, network errors and timeouts after 1s and then 2s
async function callGemini(model, key, prompt) {
  for (let attempt = 1; ; attempt++) {
    let response;
    try {
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(30000),
      });
    } catch (err) {
      console.error(`Gemini request failed (attempt ${attempt}/${ATTEMPTS}): ${err.message}`);
      if (attempt < ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      throw new HttpError(503, 'Could not reach Gemini. Check the internet connection and try again.');
    }
    if (response.ok) return response;

    const detail = (await response.text()).slice(0, 300);
    console.error(`Gemini API returned ${response.status} (attempt ${attempt}/${ATTEMPTS}): ${detail}`);
    if (RETRYABLE.includes(response.status) && attempt < ATTEMPTS) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      continue;
    }
    if (RETRYABLE.includes(response.status)) {
      throw new HttpError(503, 'Gemini is busy right now. Please try again in a minute.');
    }
    if (response.status === 404) {
      throw new HttpError(502, `Gemini model "${model}" is not available. Set GEMINI_MODEL in server/.env to a current model.`);
    }
    if (response.status === 400 || response.status === 403) {
      throw new HttpError(502, 'Gemini rejected the request. Check that GEMINI_API_KEY in server/.env is valid.');
    }
    throw new HttpError(502, `Gemini API returned ${response.status}. Please try again.`);
  }
}

// Gemini: AI resume review for a student, optionally against a specific drive's role
async function reviewResume(student, driveId) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new HttpError(503, 'GEMINI_API_KEY is not set. Add it to server/.env and restart the server.');
  if (!student.resumeText) throw new HttpError(400, 'Add resume text to the profile first');

  const drive = driveId ? await Drive.findById(driveId).populate('company', 'name') : null;
  const target = drive ? `${drive.role} at ${drive.company?.name}` : 'software / core engineering roles in campus placements';

  const prompt = `You are a campus placement mentor at an Indian engineering college.
Review this student's resume for: ${target}.

Student: ${student.name}, ${student.branch}, CGPA ${student.cgpa}, backlogs ${student.backlogs}
Listed skills: ${student.skills.join(', ') || 'none'}

Resume:
"""
${student.resumeText.slice(0, 8000)}
"""

Reply in plain text (no markdown symbols, no emoji, no em dashes) with:
1. Score out of 10
2. Three strengths
3. Three specific improvements
4. Skills or projects to add for the target role
Keep it under 250 words.`;

  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const response = await callGemini(model, key, prompt);

  const json = await response.json();
  const review = (json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || 'No response from Gemini')
    // The site never shows em/en dashes or emoji, even if the model ignores the instruction above
    .replace(/\s*[\u2013\u2014]\s*/g, ' - ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/(\S) {2,}/g, '$1 ');
  return { student: student.usn, target, model, review };
}

module.exports = { reviewResume };
