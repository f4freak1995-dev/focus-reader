/* Website language only. No location lookup, tracking or translation service. */
(() => {
  const scriptUrl = new URL(document.currentScript.src);
  const base = new URL(scriptUrl.pathname.includes('/assets/') ? '../' : './', scriptUrl);
  const pages = new Set(['index.html', 'privacy.html', 'copyright.html', 'third-party.html']);
  const url = new URL(location.href);
  const filename = url.pathname.split('/').pop() || 'index.html';
  if (!pages.has(filename)) return;
  const valid = value => value === 'zh' || value === 'en';
  const explicit = url.searchParams.get('lang');
  let saved;
  try { saved = localStorage.getItem('focus-reader-site-language'); } catch {}
  const browserLanguage = (navigator.languages || [navigator.language])
    .map(value => String(value).toLowerCase())
    .find(value => /^(zh|en)(-|$)/.test(value));
  const englishRoute = url.pathname.startsWith(new URL('en/', base).pathname);
  const language = valid(explicit) ? explicit : valid(saved) ? saved
    : englishRoute ? 'en' : browserLanguage?.startsWith('zh') ? 'zh' : 'en';
  if (valid(explicit)) {
    try { localStorage.setItem('focus-reader-site-language', language); } catch {}
  }
  if (englishRoute !== (language === 'en')) {
    const target = new URL((language === 'en' ? 'en/' : '') + filename, base);
    target.search = url.search;
    target.hash = url.hash;
    location.replace(target.href);
    return;
  }
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-language]').forEach(link => {
      const selected = link.dataset.language;
      const target = new URL((selected === 'en' ? 'en/' : '') + filename, base);
      target.search = location.search;
      target.searchParams.set('lang', selected);
      target.hash = location.hash;
      link.href = target.href;
      link.setAttribute('aria-current', selected === language ? 'true' : 'false');
      link.addEventListener('click', () => {
        // Re-evaluate the hash: the reader may have scrolled to an anchor since load.
        const updated = new URL(link.href);
        updated.hash = location.hash;
        link.href = updated.href;
      });
    });
    // Explicit choice also survives navigation when browser storage is blocked.
    if (valid(explicit)) {
      document.querySelectorAll('a[href]').forEach(link => {
        const target = new URL(link.href);
        if (target.origin !== base.origin || !target.pathname.startsWith(base.pathname)) return;
        const leaf = target.pathname.split('/').pop() || 'index.html';
        if (pages.has(leaf) && !link.hasAttribute('data-language')) {
          target.searchParams.set('lang', language);
          link.href = target.href;
        }
      });
    }
  });
})();
