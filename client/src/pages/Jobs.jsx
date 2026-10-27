import { useState } from 'react';
import { Building2, CheckCircle2, Clock, ExternalLink, Globe, KeyRound, MapPin, Plus, Search } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/FeedbackContext';
import { useApi } from '../hooks';
import { Badge, Card, EmptyState, PageHeader, Spinner } from '../components/ui';
import { relativeDays } from '../utils';

const SUGGESTIONS = ['software engineer intern in Bangalore', 'data analyst fresher', 'embedded systems intern', 'react developer'];

// Live job search via JSearch (RapidAPI). Admins can import a listing as a placement drive.
export default function Jobs() {
  const { user } = useAuth();
  const toast = useToast();
  const { data: status } = useApi('/external/status');
  const [query, setQuery] = useState(SUGGESTIONS[0]);
  const [jobs, setJobs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imported, setImported] = useState(new Set());

  async function search(q = query) {
    setQuery(q);
    setLoading(true);
    setError('');
    try {
      setJobs(await api(`/external/jobs?query=${encodeURIComponent(q)}`));
    } catch (err) {
      setError(err.message);
      setJobs(null);
    } finally {
      setLoading(false);
    }
  }

  async function importJob(job) {
    try {
      const r = await api('/external/jobs/import', { method: 'POST', body: job });
      setImported((s) => new Set(s).add(job.id));
      toast(r.message);
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <PageHeader title="Live jobs & internships" subtitle="Listings from the JSearch API">
        {status && (
          <Badge tone={status.jsearch ? 'green' : 'red'}>{status.jsearch ? 'API connected' : 'API key missing'}</Badge>
        )}
      </PageHeader>

      {status && !status.jsearch && (
        <div className="alert alert-warn">
          <KeyRound size={18} />
          <div>
            <strong>JSearch API key not configured.</strong> Add <code>RAPIDAPI_KEY</code> to <code>server/.env</code> and
            restart the server. Get a free key from RapidAPI → JSearch.
          </div>
        </div>
      )}

      <Card>
        <form className="job-search" onSubmit={(e) => { e.preventDefault(); search(); }}>
          <Search size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Role, skill or location…" />
          <button className="btn btn-primary" disabled={loading}>Search</button>
        </form>
        <div className="suggestions">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="chip-toggle" onClick={() => search(s)}>{s}</button>
          ))}
        </div>
      </Card>

      {loading && <Spinner label="Searching live listings…" />}
      {error && <div className="alert alert-error">{error}</div>}
      {!loading && !jobs && !error && (
        <EmptyState icon={Globe} title="Search for openings">Try one of the suggestions above.</EmptyState>
      )}
      {!loading && jobs?.length === 0 && <EmptyState title="No jobs found">Try a broader search.</EmptyState>}

      {!loading && jobs?.length > 0 && (
        <div className="job-grid">
          {jobs.map((job) => (
            <article key={job.id} className="job-card">
              <div className="job-head">
                {job.logo ? (
                  <img src={job.logo} alt="" className="job-logo" />
                ) : (
                  <div className="job-logo placeholder"><Building2 size={18} /></div>
                )}
                <div>
                  <h3>{job.title}</h3>
                  <span className="muted">{job.company}</span>
                </div>
              </div>
              <div className="job-meta">
                {job.location && <span><MapPin size={14} /> {job.location}</span>}
                {job.postedAt && <span><Clock size={14} /> {relativeDays(job.postedAt)}</span>}
                {job.type && <Badge tone="blue">{job.type.replace('_', ' ').toLowerCase()}</Badge>}
              </div>
              <p className="job-desc">{job.description}…</p>
              <div className="job-actions">
                {user.role === 'admin' &&
                  (imported.has(job.id) ? (
                    <span className="badge badge-green"><CheckCircle2 size={14} /> Imported</span>
                  ) : (
                    <button className="btn btn-soft btn-sm" onClick={() => importJob(job)}>
                      <Plus size={16} /> Import as drive
                    </button>
                  ))}
                {job.applyLink && (
                  <a className="btn btn-ghost btn-sm" href={job.applyLink} target="_blank" rel="noopener noreferrer">
                    Apply <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
