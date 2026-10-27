import { Link } from 'react-router-dom';
import { ArrowRight, Award, Briefcase, FileText, GraduationCap, FileSearch, Target } from 'lucide-react';
import { api } from '../../api';
import { useToast } from '../../context/FeedbackContext';
import { useApi } from '../../hooks';
import EligibleDrives from '../../components/EligibleDrives';
import { Avatar, Badge, Card, Chips, PageHeader, Spinner, StatCard } from '../../components/ui';
import MyApplications from './MyApplications';

export default function Overview() {
  const toast = useToast();
  const { data: me } = useApi('/me');
  const eligible = useApi('/me/eligible');
  const apps = useApi('/me/applications');

  if (!me) return <Spinner label="Loading your dashboard…" />;

  const offers = apps.data?.filter((a) => a.status === 'offered').length ?? 0;
  const openToApply = eligible.data
    ? eligible.data.eligibleDrives.filter((d) => !eligible.data.appliedDriveIds.includes(d._id)).length
    : 0;

  async function apply(driveId) {
    try {
      await api('/me/applications', { method: 'POST', body: { drive: driveId } });
      toast('Application submitted');
      eligible.reload();
      apps.reload();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  return (
    <>
      <PageHeader title="Overview" subtitle="Your profile, eligible drives and applications" />

      <div className="profile-hero">
        <Avatar name={me.name} size={56} />
        <div className="profile-hero-text">
          <h2>{me.name}</h2>
          <span className="muted">{me.usn} · {me.branch}{me.gradYear ? ` · Class of ${me.gradYear}` : ''}</span>
          <Chips items={me.skills} max={6} />
        </div>
        <div className="profile-hero-side">
          <Badge>{me.placed ? 'placed' : 'not placed'}</Badge>
          <Link to="/student/profile" className="btn btn-soft btn-sm">
            <FileSearch size={14} /> Resume review
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={GraduationCap} label="CGPA" value={me.cgpa} hint={`${me.backlogs} active backlogs`} />
        <StatCard icon={Target} label="Open to apply" value={openToApply} tone="teal" hint="eligible drives" />
        <StatCard icon={FileText} label="Applications" value={apps.data?.length ?? '-'} tone="amber" />
        <StatCard icon={Award} label="Offers" value={offers} tone="green" />
      </div>

      <div className="grid-2">
        <Card
          title="Drives you're eligible for"
          subtitle="Matched on CGPA, backlogs and branch"
          actions={<Link to="/student/drives" className="link">All drives <ArrowRight size={14} /></Link>}
        >
          {eligible.loading && !eligible.data ? <Spinner /> : <EligibleDrives data={eligible.data} onApply={apply} />}
        </Card>
        <Card title="My applications" subtitle="Applied → shortlisted → interview → offered">
          {apps.loading && !apps.data ? <Spinner /> : <MyApplications apps={apps.data} onChange={() => { apps.reload(); eligible.reload(); }} />}
        </Card>
      </div>

      {!me.resumeText && (
        <div className="alert alert-info">
          <Briefcase size={18} />
          <div>
            <strong>Add your resume</strong> to request feedback before your next drive.{' '}
            <Link to="/student/profile" className="link">Go to profile <ArrowRight size={14} /></Link>
          </div>
        </div>
      )}
    </>
  );
}
