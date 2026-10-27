import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { homeFor, useAuth } from '../context/AuthContext';
import AuthShell from './AuthShell';

// Seeded demo accounts (see server/seed.js) - only offered in development builds
const DEMO = [
  { label: 'Placement officer', email: 'admin@placement.test', password: 'admin123' },
  { label: 'Student', email: 'ananya.rao@example.com', password: 'student123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      const from = location.state?.from;
      navigate(from?.startsWith(homeFor(user)) ? from : homeFor(user), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to your PlaceHub account"
      footer={
        <>
          New here? <Link to="/register">Create a student account</Link>
        </>
      }
    >
      <form className="form" onSubmit={submit}>
        {error && <div className="alert alert-error">{error}</div>}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required autoComplete="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required autoComplete="current-password" value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
          {busy && <Loader2 size={16} className="spin" />} Log in
        </button>
      </form>

      {import.meta.env.DEV && (
        <div className="demo-box">
          <span>Demo accounts</span>
          <div>
            {DEMO.map((d) => (
              <button key={d.email} type="button" className="btn btn-soft btn-sm"
                onClick={() => setForm({ email: d.email, password: d.password })}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthShell>
  );
}
