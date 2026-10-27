// Site details used in the footer and the legal pages. Set them in client/.env (see client/.env.example).
// `npm run build` refuses to build until they are filled in (see vite.config.js), so the site
// cannot be launched without a custom domain and a real contact address.
const env = import.meta.env;

export const SITE = {
  name: env.VITE_SITE_NAME || 'PlaceHub',
  url: env.VITE_SITE_URL || '',
  operator: env.VITE_OPERATOR_NAME || '',
  contactEmail: env.VITE_CONTACT_EMAIL || '',
  policiesUpdated: '27 October 2026',
};
