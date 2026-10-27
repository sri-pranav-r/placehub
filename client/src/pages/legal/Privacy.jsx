import { Link } from 'react-router-dom';
import { SITE } from '../../site';
import LegalPage, { SiteValue } from './LegalPage';

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what personal data {SITE.name} (<SiteValue field="url" envName="VITE_SITE_URL" />) collects, why,
        who can see it and how long it is kept. The site is operated by{' '}
        <SiteValue field="operator" envName="VITE_OPERATOR_NAME" />.
      </p>

      <h2>1. Data we collect</h2>
      <table>
        <thead>
          <tr><th>Category</th><th>Details</th><th>Source</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Account</td>
            <td>Name, email address, password (stored only as a one-way bcrypt hash), account type, and the date you accepted the terms</td>
            <td>You, at registration</td>
          </tr>
          <tr>
            <td>Student profile</td>
            <td>USN, branch, CGPA, number of backlogs, graduation year, phone number, skills, resume text, and whether you have been placed</td>
            <td>You, and the placement office</td>
          </tr>
          <tr>
            <td>Applications</td>
            <td>The drives you applied to, the status of each application, remarks added by the placement office, and dates</td>
            <td>You, and the placement office</td>
          </tr>
          <tr>
            <td>Login session</td>
            <td>A sign-in token stored in your browser's local storage. It expires after 7 days and is removed when you log out.</td>
            <td>Created when you log in</td>
          </tr>
        </tbody>
      </table>
      <p>
        We do not use cookies, analytics, advertising trackers or third-party fonts. The hosting provider may keep standard
        server logs, such as IP addresses and request times, for security and operations.
      </p>

      <h2>2. How we use it</h2>
      <ul>
        <li>To show you the placement drives you are eligible for, based on your CGPA, backlogs and branch.</li>
        <li>To let you apply to drives and to let the placement office manage applications and record results.</li>
        <li>To produce branch-wise and company-wise placement reports. These reports contain totals only, not individual records.</li>
        <li>To review your resume, but only when you or the placement office request a review (see section 4).</li>
      </ul>

      <h2>3. Who can see your data</h2>
      <ul>
        <li><strong>You</strong> can see your own profile and applications.</li>
        <li><strong>The placement office</strong> can see and edit all student profiles and applications.</li>
        <li>
          <strong>The public</strong> can see only the home page, which shows total counts (students, placement rate, offers,
          highest package), company names and upcoming drives. No individual student information is shown.
        </li>
      </ul>
      <p>We do not sell personal data or share it with recruiters through this site.</p>

      <h2>4. Third-party services</h2>
      <ul>
        <li>
          <strong>Google Gemini API.</strong> When a resume review is requested, we send your resume text, name, branch, CGPA,
          number of backlogs, skills and the target role to Google to generate the feedback. Nothing is sent to Google
          unless a review is requested. Google's handling of this data is covered by its own terms and privacy policy.
        </li>
        <li>
          <strong>JSearch API (via RapidAPI).</strong> When you search the Live Jobs page, the search text you type is sent to
          JSearch. No account or profile data is included. Company logos in the results load directly from the listing's
          source, so your browser contacts those servers. Apply links take you to external websites with their own policies.
        </li>
      </ul>

      <h2>5. How long we keep it</h2>
      <p>
        Your profile, applications and login account are kept while your record exists. When the placement office deletes
        a student record, the profile, all of its applications and the linked login account are deleted together. Copies
        may remain in database backups until those backups expire.
      </p>

      <h2>6. Security</h2>
      <p>
        Passwords are hashed with bcrypt and are never stored in plain text. The site is served over HTTPS. Access to
        data is restricted by account type, so students cannot open other students' records or placement office pages.
      </p>

      <h2>7. Your choices and requests</h2>
      <ul>
        <li>You can update your phone number, skills and resume text on the Profile page at any time.</li>
        <li>CGPA, backlogs and branch are verified records. To correct them, contact the placement office.</li>
        <li>
          To request a copy of your data or deletion of your account, write to{' '}
          <SiteValue field="contactEmail" envName="VITE_CONTACT_EMAIL" />.
        </li>
      </ul>

      <h2>8. Changes to this policy</h2>
      <p>
        If we change this policy, we will update the date at the top of this page.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about this policy: <SiteValue field="contactEmail" envName="VITE_CONTACT_EMAIL" />. See also the{' '}
        <Link to="/terms">Terms and Conditions</Link>.
      </p>
    </LegalPage>
  );
}
