// Where the published admin page signs in and saves. Neither value is a secret: the client ID only names this site to
// Google, and the service checks every request itself (admin-service/server.mjs). Empty = the admin is not switched on
// for the published site; the local dev server (pnpm dev) always works and writes straight to the project files.
// Service: Cloud Run reo-site-admin (project adept-voltage-509816-a6, asia-east1), deployed 2026-11-18.
export const adminApi = 'https://reo-site-admin-800626747668.asia-east1.run.app';
export const googleClientId = '800626747668-1dtn4ad0l7fnbppa75onhcgc3f7958bn.apps.googleusercontent.com';
