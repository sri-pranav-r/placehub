const express = require('express');
const Student = require('../models/Student');
const Company = require('../models/Company');
const Drive = require('../models/Drive');
const { requireRole } = require('../middleware/auth');
const { reviewResume } = require('../services/gemini');

// All third-party API calls happen here, on the server, so the API keys in
// .env never reach the browser.
const router = express.Router();

const missingKey = (res, name) =>
  res.status(503).json({ error: `${name} is not set. Add it to server/.env and restart the server.` });

// Lets the UI show which integrations are configured (never returns the keys)
router.get('/status', (req, res) => {
  res.json({ jsearch: Boolean(process.env.RAPIDAPI_KEY), gemini: Boolean(process.env.GEMINI_API_KEY) });
});

// Listings come from many job boards and often contain en/em dashes ("Full\u2013time");
// the site's text uses plain hyphens
const plain = (text) => (text || '').replace(/[\u2013\u2014]/g, '-');

// JSearch (RapidAPI): live job & internship listings
// GET /api/external/jobs?query=react intern in Bangalore
router.get('/jobs', async (req, res) => {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) return missingKey(res, 'RAPIDAPI_KEY');

  const query = String(req.query.query || 'software engineer intern in Bangalore').slice(0, 120);
  // /search-v2 replaced /search (which now returns 404)
  const url = new URL('https://jsearch.p.rapidapi.com/search-v2');
  url.search = new URLSearchParams({ query, page: '1', num_pages: '1', country: 'in', date_posted: 'month' });

  const response = await fetch(url, {
    headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
  });
  if (!response.ok) {
    return res.status(502).json({ error: `JSearch API returned ${response.status}`, detail: await response.text() });
  }
  const { data } = await response.json();
  const jobs = data?.jobs || [];
  res.json(
    jobs.map((job) => ({
      id: job.job_id,
      title: plain(job.job_title),
      company: plain(job.employer_name),
      logo: job.employer_logo,
      location: plain([job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ')),
      type: plain(job.job_employment_type),
      applyLink: job.job_apply_link,
      postedAt: job.job_posted_at_datetime_utc,
      description: plain(job.job_description).slice(0, 300),
    }))
  );
});

// Turn a JSearch listing into a Company (upsert) + Drive in our database
router.post('/jobs/import', requireRole('admin'), async (req, res) => {
  const { title, company, location, applyLink } = req.body;
  if (!title || !company) return res.status(400).json({ error: 'title and company are required' });

  const comp = await Company.findOneAndUpdate(
    { name: company },
    { $setOnInsert: { name: company, location, sector: 'Imported from JSearch' } },
    { upsert: true, new: true }
  );
  const drive = await Drive.create({ company: comp._id, role: title, applyLink, source: 'jsearch' });
  res.status(201).json({ message: `Added "${title}" at ${company} as a drive`, drive });
});

// Gemini: AI resume review for any student (admin)
// POST /api/external/resume-review/:studentId   { driveId? }
router.post('/resume-review/:studentId', requireRole('admin'), async (req, res) => {
  const student = await Student.findById(req.params.studentId);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  res.json(await reviewResume(student, req.body?.driveId));
});

module.exports = router;
