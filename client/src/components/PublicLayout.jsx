import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { homeFor, useAuth } from '../context/AuthContext';
import { SITE } from '../site';
import Logo from './Logo';

const SECTIONS = [
  ['#workspace', 'Features'],
  ['#how-it-works', 'How it works'],
  ['#drives', 'Upcoming drives'],
];

export default function PublicLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const onHome = pathname === '/';

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Section links point at the home page, so they also work from /privacy and /terms
  const sectionLinks = SECTIONS.map(([hash, label]) => (
    <a key={hash} href={onHome ? hash : `/${hash}`} onClick={() => setMenuOpen(false)}>
      {label}
    </a>
  ));
  const accountLinks = user ? (
    <Link className="btn btn-primary" to={homeFor(user)}>
      Go to dashboard
    </Link>
  ) : (
    <>
      <Link className="btn btn-ghost" to="/login">
        Log in
      </Link>
      <Link className="btn btn-primary" to="/register">
        Create account
      </Link>
    </>
  );

  return (
    <div className="public">
      <header className={`public-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-inner">
          <Logo />
          <nav className="nav-sections" aria-label="Sections">
            {sectionLinks}
          </nav>
          <div className="nav-links">{accountLinks}</div>
          <button
            className="icon-btn nav-menu-btn"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <div className="mobile-nav">
            <nav className="container" aria-label="Mobile">
              {sectionLinks}
              {accountLinks}
            </nav>
          </div>
        )}
      </header>
      <Outlet />
      <footer className="public-footer">
        <div className="container footer-inner">
          <span>
            © {new Date().getFullYear()} {SITE.operator || SITE.name}
          </span>
          <nav className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms and Conditions</Link>
            {SITE.contactEmail && <a href={`mailto:${SITE.contactEmail}`}>Contact</a>}
          </nav>
        </div>
      </footer>
    </div>
  );
}
