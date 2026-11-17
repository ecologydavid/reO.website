// The site's version, shown at the foot of every page (SiteFooter) so a page on screen can be matched to a release.
//   siteVersion  the release name, the same "vNN" as the notes in AGENTS.md. Raise it with every release you push.
//   build        filled in at build time (vite.config.js): the build date (Taipei) and the commit it was built from.
//                A save from the case admin is its own commit, so the commit tells those builds apart too.
export const siteVersion = 'v76';
/* global __BUILD__ */
export const build = typeof __BUILD__ === 'undefined' ? {date: '', commit: ''} : __BUILD__;
export const versionLabel = [siteVersion, build.date, build.commit].filter(Boolean).join(' · ');
