// The site's version, shown at the foot of every page (SiteFooter): 「v1.0.0 · 2026.11.18」.
//   siteVersion  major.minor.patch, set by hand. Raise it with every release pushed (owner's rule, 2026-11-18):
//                patch (1.0.1) for small fixes and copy, minor (1.1.0) for new features or sections, major (2.0.0) for a redesign.
//   build.date   the date the site was last built (Taipei), filled in by vite.config.js. Every change, including a save
//                from the case admin, rebuilds the site, so this is the date of the latest change.
export const siteVersion = '1.0.0';
/* global __BUILD__ */
export const build = typeof __BUILD__ === 'undefined' ? {date: ''} : __BUILD__;
export const versionLabel = ['v' + siteVersion, build.date].filter(Boolean).join(' · ');
