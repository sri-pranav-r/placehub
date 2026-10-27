import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Hosting addresses that are not a custom domain
const NOT_CUSTOM = /(localhost|127\.0\.0\.1|\.vercel\.app|\.netlify\.app|\.onrender\.com|\.herokuapp\.com|\.github\.io|\.pages\.dev|\.web\.app|\.firebaseapp\.com|\.railway\.app|\.fly\.dev|\.azurewebsites\.net)$/i;

// Launch checklist: a production build fails until the site has a custom domain,
// an operator name and a contact email (both appear in the privacy policy and terms).
function launchChecks(env) {
  const problems = [];
  let host = '';
  try {
    const url = new URL(env.VITE_SITE_URL || '');
    host = url.hostname;
    if (url.protocol !== 'https:') problems.push('VITE_SITE_URL must start with https://');
  } catch {
    problems.push('VITE_SITE_URL is missing or not a valid URL');
  }
  if (host && NOT_CUSTOM.test(host)) problems.push(`VITE_SITE_URL (${host}) is not a custom domain`);
  if (!env.VITE_OPERATOR_NAME?.trim()) problems.push('VITE_OPERATOR_NAME is missing');
  if (!/^\S+@\S+\.\S+$/.test(env.VITE_CONTACT_EMAIL || '')) problems.push('VITE_CONTACT_EMAIL is missing or invalid');
  if (problems.length) {
    throw new Error(`Not ready to launch. Fix these in client/.env:\n  - ${problems.join('\n  - ')}`);
  }
}

// In development, Vite runs the React app on :5173 and forwards /api calls to Express on :5000
export default defineConfig(({ command, mode }) => {
  if (command === 'build') launchChecks(loadEnv(mode, process.cwd(), 'VITE_'));
  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: { '/api': 'http://localhost:5000' },
    },
  };
});
