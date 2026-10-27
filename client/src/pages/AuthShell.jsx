import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Logo from '../components/Logo';

// Two-panel layout shared by the login and register pages
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-brand">
        <Logo />
        <h2>Placement drives, eligibility and applications in one place.</h2>
        <ul>
          <li><CheckCircle2 size={18} /> See which drives match your CGPA, backlogs and branch</li>
          <li><CheckCircle2 size={18} /> Follow each application from applied to offered</li>
          <li><CheckCircle2 size={18} /> Request feedback on your resume before a drive</li>
        </ul>
      </aside>
      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mobile-logo"><Logo /></div>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
          {children}
          {footer && <div className="auth-footer">{footer}</div>}
          <p className="auth-legal">
            <Link to="/privacy">Privacy Policy</Link> · <Link to="/terms">Terms and Conditions</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
