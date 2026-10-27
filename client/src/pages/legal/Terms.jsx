import { Link } from 'react-router-dom';
import { SITE } from '../../site';
import LegalPage, { SiteValue } from './LegalPage';

export default function Terms() {
  return (
    <LegalPage title="Terms and Conditions">
      <p>
        These terms apply to your use of {SITE.name} (<SiteValue field="url" envName="VITE_SITE_URL" />), operated by{' '}
        <SiteValue field="operator" envName="VITE_OPERATOR_NAME" />. By creating an account or using the site, you agree to
        them. If you do not agree, do not use the site.
      </p>

      <h2>1. Who can use the site</h2>
      <p>
        Student accounts are for students of the institution taking part in campus placements. Placement office accounts
        are created by the operator for its staff.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>Give accurate information and keep it up to date.</li>
        <li>Use one account per student. Do not share your password or let anyone else use your account.</li>
        <li>You are responsible for activity on your account. Tell the placement office straight away if you think someone else has used it.</li>
      </ul>

      <h2>3. Academic details and eligibility</h2>
      <p>
        Eligibility for each drive is worked out from the CGPA, backlogs and branch recorded on your profile. The
        placement office may check these against college records and correct them. Giving false academic information can
        lead to your applications being withdrawn and your account being removed.
      </p>

      <h2>4. Placement drives and applications</h2>
      <ul>
        <li>Applying through the site does not guarantee a shortlist, interview or offer. Hiring decisions are made by the companies.</li>
        <li>Drive dates, packages and eligibility rules come from the companies and may change. Check announcements from the placement office.</li>
        <li>You can withdraw an application while its status is "applied". After that, contact the placement office.</li>
      </ul>

      <h2>5. External job listings</h2>
      <p>
        The Live Jobs page shows listings from the JSearch API. We do not check these listings. If you apply through an
        external link, you are dealing with that website or employer under their own terms.
      </p>

      <h2>6. Resume review</h2>
      <p>
        Resume feedback is generated automatically by Google Gemini and can be incomplete or wrong. Treat it as a
        suggestion, not professional advice. Requesting a review sends your resume and academic summary to Google, as
        described in the <Link to="/privacy">Privacy Policy</Link>.
      </p>

      <h2>7. Acceptable use</h2>
      <p>Do not:</p>
      <ul>
        <li>access or try to access another person's account or data;</li>
        <li>copy data from the site in bulk, or use automated tools to collect it;</li>
        <li>interfere with the site's security or operation; or</li>
        <li>upload false, misleading or offensive content.</li>
      </ul>

      <h2>8. Availability</h2>
      <p>
        We work to keep the site available and the information on it accurate, but we cannot promise it will be free
        of errors or interruptions. Official announcements from the placement office take priority over anything shown
        on the site.
      </p>

      <h2>9. Suspension and removal</h2>
      <p>
        The operator may suspend or remove an account that breaks these terms. You can ask for your account to be deleted at
        any time by writing to <SiteValue field="contactEmail" envName="VITE_CONTACT_EMAIL" />.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>
        If we change these terms, we will update the date at the top of this page. Continuing to use the site after a
        change means you accept the updated terms.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these terms: <SiteValue field="contactEmail" envName="VITE_CONTACT_EMAIL" />.
      </p>
    </LegalPage>
  );
}
