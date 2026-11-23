const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
const publicHosts = ['re-o.co', 'www.re-o.co', 'ecologydavid.github.io'];
let initialized = false;
let lastPage = '';
let milestones = new Set();

function initialize() {
  window.dataLayer ||= [];
  window.gtag ||= function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location: location.origin + location.pathname,
    page_referrer: document.referrer ? new URL(document.referrer).origin : ''
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
  document.head.append(script);

  let scheduled = false;
  window.addEventListener('scroll', () => {
    if (scheduled || !window.scrollY) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      if (location.origin + location.pathname !== lastPage || document.hidden || !window.scrollY) return;
      const percent = 100 * (window.scrollY + innerHeight) / document.documentElement.scrollHeight;
      for (const threshold of [25, 50, 75, 90]) {
        if (percent >= threshold && !milestones.has(threshold)) {
          milestones.add(threshold);
          window.gtag('event', 'scroll_depth', {percent_scrolled: threshold, page_location: lastPage});
        }
      }
    });
  }, {passive: true});

  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || link.origin !== location.origin || location.origin + location.pathname !== lastPage) return;
    if (!link.pathname.startsWith(import.meta.env.BASE_URL) || /\/admin(?:\/|$)/.test(link.pathname)) return;
    window.gtag('event', 'internal_link_click', {link_path: link.pathname, page_location: lastPage});
  }, true);
  initialized = true;
}

export function recordPage() {
  if (!import.meta.env.PROD || !/^G-[A-Z0-9]+$/.test(measurementId || '') ||
      !publicHosts.includes(location.hostname) || /\/admin(?:\/|$)/.test(location.pathname)) return;
  const page = location.origin + location.pathname;
  if (lastPage === page) return;
  if (!initialized) initialize();
  const referrer = lastPage || (document.referrer ? new URL(document.referrer).origin : '');
  lastPage = page;
  milestones = new Set();
  window.gtag('set', {page_location: page, page_referrer: referrer, page_title: document.title});
  window.gtag('event', 'page_view', {page_location: page, page_referrer: referrer, page_title: document.title});
}
