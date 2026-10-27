import { useEffect, useState } from 'react';
import { Loader2, Lock, Save } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../../context/FeedbackContext';
import { useApi } from '../../hooks';
import ResumeReview from '../../components/ResumeReview';
import { Card, PageHeader, Spinner } from '../../components/ui';

export default function Profile() {
  const toast = useToast();
  const { data: me, reload } = useApi('/me');
  const { data: eligible } = useApi('/me/eligible');
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (me) setForm({ phone: me.phone || '', skills: me.skills.join(', '), resumeText: me.resumeText || '' });
  }, [me]);

  if (!me || !form) return <Spinner label="Loading profile…" />;

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/me', {
        method: 'PUT',
        body: {
          phone: form.phone.trim(),
          skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
          resumeText: form.resumeText,
        },
      });
      toast('Profile saved');
      reload();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const locked = [
    ['USN', me.usn],
    ['Name', me.name],
    ['Email', me.email],
    ['Branch', me.branch],
    ['CGPA', me.cgpa],
    ['Backlogs', me.backlogs],
  ];

  return (
    <>
      <PageHeader title="Profile & resume" subtitle="Keep your details up to date before each drive" />
      <div className="grid-2 grid-2-wide">
        <div className="stack">
          <Card title="Academic record" subtitle="Verified by the placement office">
            <dl className="info-grid">
              {locked.map(([k, v]) => (
                <div key={k}>
                  <dt><Lock size={12} /> {k}</dt>
                  <dd>{v ?? '-'}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card title="Your details">
            <form className="form" onSubmit={save}>
              <div className="field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="field">
                <label htmlFor="skills">Skills</label>
                <input id="skills" value={form.skills} placeholder="Java, React, SQL" onChange={(e) => setForm({ ...form, skills: e.target.value })} />
                <small className="hint">Comma separated</small>
              </div>
              <div className="field">
                <label htmlFor="resume">Resume text</label>
                <textarea id="resume" rows={10} value={form.resumeText} placeholder="Paste your resume here: education, projects, internships, achievements…"
                  onChange={(e) => setForm({ ...form, resumeText: e.target.value })} />
                <small className="hint">{form.resumeText.length.toLocaleString()} / 10,000 characters</small>
              </div>
              <div className="modal-actions">
                <button className="btn btn-primary" disabled={busy}>
                  {busy ? <Loader2 size={16} className="spin" /> : <Save size={16} />} Save profile
                </button>
              </div>
            </form>
          </Card>
        </div>

        <Card title="AI resume review" subtitle="Gemini scores your resume and suggests improvements, in general or for a specific drive">
          <ResumeReview endpoint="/me/resume-review" drives={eligible?.eligibleDrives || []} hasResume={Boolean(me.resumeText)} />
        </Card>
      </div>
    </>
  );
}
