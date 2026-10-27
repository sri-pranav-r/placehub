import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMeta } from '../hooks';
import AuthShell from './AuthShell';

const EMPTY = { name: '', usn: '', email: '', password: '', branch: '', cgpa: '', backlogs: '0', gradYear: '', phone: '', acceptTerms: false };

export default function Register() {
  const { register } = useAuth();
  const meta = useMeta();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register({
        ...form,
        cgpa: Number(form.cgpa),
        backlogs: Number(form.backlogs || 0),
        gradYear: form.gradYear ? Number(form.gradYear) : undefined,
      });
      navigate('/student', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="For students. Placement office accounts are created separately."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="form" onSubmit={submit}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={set('name')} />
          </div>
          <div className="field half">
            <label htmlFor="usn">USN</label>
            <input id="usn" required placeholder="1RV23CS001" value={form.usn} onChange={set('usn')} />
          </div>
          <div className="field half">
            <label htmlFor="branch">Branch</label>
            <select id="branch" required value={form.branch} onChange={set('branch')}>
              <option value="">Select…</option>
              {meta?.branches.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="field half">
            <label htmlFor="cgpa">CGPA</label>
            <input id="cgpa" type="number" step="0.01" min="0" max="10" required value={form.cgpa} onChange={set('cgpa')} />
          </div>
          <div className="field half">
            <label htmlFor="backlogs">Active backlogs</label>
            <input id="backlogs" type="number" min="0" value={form.backlogs} onChange={set('backlogs')} />
          </div>
          <div className="field half">
            <label htmlFor="gradYear">Graduation year</label>
            <input id="gradYear" type="number" min="2000" max="2100" value={form.gradYear} onChange={set('gradYear')} />
          </div>
          <div className="field half">
            <label htmlFor="phone">Phone</label>
            <input id="phone" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="field">
            <label htmlFor="email">College email</label>
            <input id="email" type="email" required autoComplete="email" value={form.email} onChange={set('email')} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" required minLength={6} autoComplete="new-password" value={form.password} onChange={set('password')} />
            <small className="hint">At least 6 characters</small>
          </div>
        </div>
        <label className="checkbox">
          <input type="checkbox" required checked={form.acceptTerms} onChange={(e) => setForm({ ...form, acceptTerms: e.target.checked })} />
          <span>
            I agree to the <Link to="/terms" target="_blank">Terms and Conditions</Link> and have read the{' '}
            <Link to="/privacy" target="_blank">Privacy Policy</Link>.
          </span>
        </label>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
          {busy && <Loader2 size={16} className="spin" />} Create account
        </button>
        <p className="hint center">If the placement office already added your USN, use the same email to claim it.</p>
      </form>
    </AuthShell>
  );
}
