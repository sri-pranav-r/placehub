import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, CalendarDays, Check } from 'lucide-react';
import { homeFor, useAuth } from '../context/AuthContext';
import { useApi } from '../hooks';
import Modal from '../components/Modal';
import { Badge, EmptyState } from '../components/ui';
import { fmtDate, lpa } from '../utils';

const isInternship = (drive) => /\bintern/i.test(drive.role);

const STATUSES = [
  ['applied', 'Your application has reached the placement office.'],
  ['shortlisted', 'The company has picked you for the next round.'],
  ['interview', 'You are in the interview rounds for this drive.'],
  ['offered', 'You have an offer. Your profile is marked as placed.'],
  ['rejected', 'Not selected this time. Other open drives stay available.'],
];

const STEPS = [
  ['Register', 'Create an account with your USN, branch and CGPA. The placement office verifies academic details.'],
  ['Check your drives', 'See which drives you can apply for, and the reason for each one you cannot.'],
  ['Apply and follow up', 'Apply in one click, then follow every application on your Overview page.'],
];

const STUDENT_FEATURES = [
  ['Eligibility explained', 'See which drives match your CGPA, branch and backlogs, and why the others do not.'],
  ['Every application in one list', 'Follow each application through shortlisted, interview, offered or rejected.'],
  ['Resume feedback on request', 'Ask Google Gemini for a general review, or one aimed at a specific drive.'],
];

const OFFICE_FEATURES = [
  ['Drives and companies', 'Set dates, packages, allowed branches, minimum CGPA and backlog limits for each drive.'],
  ['Reports on request', 'Branch-wise and company-wise offers, conversion and packages, rebuilt from current data.'],
  ['External listings', 'Search current job and internship listings and add any of them as a drive.'],
];

function Features({ items }) {
  return (
    <ul className="lp-features">
      {items.map(([title, text]) => (
        <li key={title}>
          <strong>{title}</strong>
          <p>{text}</p>
        </li>
      ))}
    </ul>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const { data: stats, error } = useApi('/public/stats');
  const [tab, setTab] = useState('students');
  const [filter, setFilter] = useState('all');
  const [openDrive, setOpenDrive] = useState(null);

  const drives = stats?.upcomingDrives || [];
  const shownDrives = useMemo(
    () =>
      drives.filter(
        (d) => filter === 'all' || (filter === 'internship' ? isInternship(d) : !isInternship(d))
      ),
    [drives, filter]
  );
  const startLink = user ? homeFor(user) : '/register';

  return (
    <main>
      {/* Hero */}
      <section className="page-width lp-hero">
        <div>
          <span className="mono-label section-label">For students and the placement office</span>
          <h1>
            Find the drives you <span className="lp-mark">qualify</span> for. Track every application to an offer.
          </h1>
          <p className="lp-lead">
            PlaceHub checks each drive against your CGPA, backlogs and branch, lets you apply in one click, and shows
            the status of every application in one place.
          </p>
          <div className="lp-actions">
            <Link to={startLink} className="btn btn-primary btn-lg">
              {user ? 'Open dashboard' : 'Create student account'} <ArrowRight size={18} />
            </Link>
            <a href="#drives" className="btn btn-outline btn-lg">See upcoming drives</a>
          </div>
          <div className="lp-checks">
            <span><Check size={16} /> Eligibility checked automatically</span>
            <span><Check size={16} /> One-click applications</span>
          </div>
        </div>

        <div className="lp-window">
          <div className="lp-window-bar">
            <strong>Upcoming drives</strong>
            <span className="mono-label">From the placement database</span>
          </div>
          {drives.length ? (
            <ul className="lp-drive-list">
              {drives.slice(0, 4).map((d) => (
                <li key={d._id}>
                  <div>
                    <strong>{d.company?.name}</strong>
                    <span>{d.role}</span>
                  </div>
                  <div>
                    <strong>{lpa(d.packageLPA)}</strong>
                    <span>{d.driveDate ? fmtDate(d.driveDate) : 'Date to be announced'}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={CalendarDays} title={error ? 'Could not load drives' : stats ? 'No drives scheduled yet' : 'Loading drives'} />
          )}
          <div className="lp-stages">
            <span className="mono-label">How an application moves</span>
            <div className="lp-stage-row">
              {['Applied', 'Shortlisted', 'Interview', 'Offered'].map((s) => (
                <div key={s} className="lp-stage">
                  <b />
                  {s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live numbers (only shown once there is data) */}
      {stats?.students > 0 && (
        <section className="page-width" aria-label="Placement figures">
          <div className="lp-stats">
            <div className="lp-stat"><strong>{stats.students}</strong><span>Students registered</span></div>
            <div className="lp-stat"><strong>{stats.placementPct}%</strong><span>Students placed</span></div>
            <div className="lp-stat"><strong>{stats.offers}</strong><span>Offers recorded</span></div>
            <div className="lp-stat"><strong>{lpa(stats.highestPackage)}</strong><span>Highest package</span></div>
          </div>
          <p className="lp-stats-note">Current figures from the placement database</p>
        </section>
      )}

      {stats?.recruiters?.length > 0 && (
        <section className="page-width lp-companies" aria-label="Companies on the platform">
          <span className="mono-label">Companies on the platform</span>
          <div className="lp-company-names">
            {stats.recruiters.map((c) => <strong key={c._id}>{c.name}</strong>)}
          </div>
        </section>
      )}

      {/* Two portals */}
      <section className="lp-workspace" id="workspace">
        <div className="page-width">
          <div className="lp-section-head">
            <div>
              <span className="mono-label section-label">Two portals</span>
              <h2>One system for students and the placement office.</h2>
            </div>
            <p>Students see what they can apply for and where each application stands. The placement office manages drives and results from the same data.</p>
          </div>

          <div className="lp-tabs" role="tablist" aria-label="Choose a portal">
            {[['students', 'For students'], ['office', 'For the placement office']].map(([key, label]) => (
              <button
                key={key}
                role="tab"
                id={`${key}-tab`}
                aria-selected={tab === key}
                aria-controls={`${key}-panel`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'students' ? (
            <div className="lp-panel" id="students-panel" role="tabpanel" aria-labelledby="students-tab">
              <div className="lp-panel-copy">
                <span className="mono-label">Student portal</span>
                <h3>Know where you stand and what to do next.</h3>
                <p>Eligibility, applications and resume feedback are on one page, in plain language.</p>
                <Features items={STUDENT_FEATURES} />
              </div>
              <div className="lp-screen">
                <div className="lp-screen-top">
                  <div>
                    <span className="mono-label">Application statuses</span>
                    <strong>What each status means</strong>
                  </div>
                </div>
                <ul className="lp-screen-rows">
                  {STATUSES.map(([status, text]) => (
                    <li key={status}>
                      <p>{text}</p>
                      <Badge>{status}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="lp-panel" id="office-panel" role="tabpanel" aria-labelledby="office-tab">
              <div className="lp-panel-copy">
                <span className="mono-label">Placement office portal</span>
                <h3>Run the placement season from one place.</h3>
                <p>Create drives, update each candidate's status and build reports from the same records.</p>
                <Features items={OFFICE_FEATURES} />
              </div>
              <div className="lp-screen">
                <div className="lp-screen-top">
                  <div>
                    <span className="mono-label">Season summary</span>
                    <strong>Placement results so far</strong>
                  </div>
                </div>
                {stats ? (
                  <div className="lp-metrics">
                    <div><span>Offers</span><strong>{stats.offers}</strong></div>
                    <div><span>Students placed</span><strong>{stats.placementPct}%</strong></div>
                    <div><span>Highest package</span><strong>{lpa(stats.highestPackage)}</strong></div>
                  </div>
                ) : (
                  <EmptyState title={error ? 'Could not load figures' : 'Loading figures'} />
                )}
                <div className="lp-screen-foot">Current figures from the placement database</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="page-width lp-how" id="how-it-works">
        <div className="lp-section-head">
          <div>
            <span className="mono-label section-label">Getting started</span>
            <h2>From registration to offer in three steps.</h2>
          </div>
          <p>Your academic details decide which drives you see, so there is nothing else to set up.</p>
        </div>
        <ol className="lp-steps">
          {STEPS.map(([title, text], i) => (
            <li key={title}>
              <div className="lp-step-top"><span>0{i + 1}</span><i /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Upcoming drives */}
      <section className="lp-drives" id="drives">
        <div className="page-width">
          <div className="lp-drives-head">
            <div>
              <span className="mono-label section-label">Open for applications</span>
              <h2>Upcoming drives</h2>
              <p>{shownDrives.length} {shownDrives.length === 1 ? 'drive' : 'drives'} from the placement database</p>
            </div>
            <div className="lp-filters" aria-label="Filter drives">
              {[['all', 'All drives'], ['fulltime', 'Full-time'], ['internship', 'Internships']].map(([key, label]) => (
                <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="lp-table" role="table" aria-label="Upcoming drives">
            <div className="lp-table-head" role="row">
              <span role="columnheader">Company and role</span>
              <span role="columnheader">Drive date</span>
              <span role="columnheader">Package</span>
              <span role="columnheader" className="lp-table-status">Status</span>
              <span />
            </div>
            {shownDrives.map((d) => (
              <div key={d._id} className="lp-table-row" role="row">
                <div className="lp-table-company" role="cell">
                  <strong>{d.company?.name}</strong>
                  <span>{d.role}</span>
                </div>
                <span className="lp-table-date" role="cell">{d.driveDate ? fmtDate(d.driveDate) : 'To be announced'}</span>
                <span className="lp-table-package" role="cell">{lpa(d.packageLPA)}</span>
                <span className="lp-table-status" role="cell"><Badge>{d.status}</Badge></span>
                <button className="lp-row-btn" aria-label={`View ${d.company?.name} drive details`} onClick={() => setOpenDrive(d)}>
                  <ArrowUpRight size={18} />
                </button>
              </div>
            ))}
            {!shownDrives.length && (
              <EmptyState icon={CalendarDays} title={stats ? 'No drives match this filter' : error ? 'Could not load drives' : 'Loading drives'} />
            )}
          </div>
        </div>
      </section>

      {/* Call to action */}
      {!user && (
        <section className="page-width lp-cta">
          <div className="lp-cta-inner">
            <div>
              <span className="mono-label section-label">Students</span>
              <h2>Create your account.</h2>
              <p>Use the email you gave the placement office so your existing record is linked.</p>
            </div>
            <div className="lp-cta-actions">
              <Link to="/register" className="btn btn-lime btn-lg">Create account <ArrowRight size={18} /></Link>
              <Link to="/login" className="lp-cta-login">Already registered? <u>Log in</u></Link>
            </div>
          </div>
        </section>
      )}

      <Modal open={Boolean(openDrive)} title={openDrive?.company?.name} subtitle={openDrive?.role} onClose={() => setOpenDrive(null)}>
        {openDrive && (
          <>
            <dl className="lp-modal-details">
              <div><dt>Drive date</dt><dd>{openDrive.driveDate ? fmtDate(openDrive.driveDate) : 'To be announced'}</dd></div>
              <div><dt>Package</dt><dd>{lpa(openDrive.packageLPA)}</dd></div>
              <div><dt>Status</dt><dd><Badge>{openDrive.status}</Badge></dd></div>
            </dl>
            <p className="lp-note">
              <strong>Eligibility</strong> is checked when you log in, against the minimum CGPA, backlog limit and
              allowed branches set by the placement office.
            </p>
            <div className="modal-actions">
              {user ? (
                <Link to={homeFor(user)} className="btn btn-primary">Open dashboard</Link>
              ) : (
                <>
                  <Link to="/login" className="btn btn-ghost">Log in</Link>
                  <Link to="/register" className="btn btn-primary">Create account to apply</Link>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </main>
  );
}
