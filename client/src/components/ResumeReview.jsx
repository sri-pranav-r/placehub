import { useState } from 'react';
import { Loader2, FileSearch } from 'lucide-react';
import { api } from '../api';

// Gemini resume review. `endpoint` is /me/resume-review (student) or /external/resume-review/:id (admin).
export default function ResumeReview({ endpoint, drives = [], hasResume = true }) {
  const [driveId, setDriveId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    setError('');
    try {
      setResult(await api(endpoint, { method: 'POST', body: { driveId: driveId || undefined } }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="review">
      <div className="review-controls">
        <select value={driveId} onChange={(e) => setDriveId(e.target.value)}>
          <option value="">General placement readiness</option>
          {drives.map((d) => (
            <option key={d._id} value={d._id}>
              {d.company?.name} · {d.role}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={run} disabled={busy || !hasResume}>
          {busy ? <Loader2 size={16} className="spin" /> : <FileSearch size={16} />}
          {busy ? 'Reviewing…' : 'Review with Gemini'}
        </button>
      </div>
      {!hasResume && <p className="hint">Add your resume text first to get a review.</p>}
      {error && <div className="alert alert-error">{error}</div>}
      {result && (
        <div className="review-output">
          <div className="review-meta">
            <FileSearch size={14} /> {result.target} · {result.model}
          </div>
          <pre>{result.review}</pre>
        </div>
      )}
    </div>
  );
}
