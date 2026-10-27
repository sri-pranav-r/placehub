const Drive = require('../models/Drive');
const HttpError = require('./HttpError');

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

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!response.ok) throw new HttpError(502, `Gemini API returned ${response.status}: ${(await response.text()).slice(0, 300)}`);

  const json = await response.json();
  const review = (json.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || 'No response from Gemini')
    // The site never shows em/en dashes or emoji, even if the model ignores the instruction above
    .replace(/\s*[\u2013\u2014]\s*/g, ' - ')
    .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/(\S) {2,}/g, '$1 ');
  return { student: student.usn, target, model, review };
}

module.exports = { reviewResume };
