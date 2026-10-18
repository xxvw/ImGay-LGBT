const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#mobile-nav');
function closeMenu() { if (menu && nav) { menu.setAttribute('aria-expanded', 'false'); nav.hidden = true; } }
menu?.addEventListener('click', () => { if (!nav) return; const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); nav.hidden = !open; });
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { closeMenu(); menu.focus(); } });
window.matchMedia('(min-width: 641px)').addEventListener('change', e => { if (e.matches) closeMenu(); });
const languageLinks = document.querySelectorAll<HTMLAnchorElement>('[data-language]');
function syncLanguageLinks() { languageLinks.forEach(a => { a.hash = window.location.hash; }); }
syncLanguageLinks();
window.addEventListener('hashchange', syncLanguageLinks);
// Keep the current visible section when switching language, even after manual scrolling.
if ('IntersectionObserver' in window) {
  const sections = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) languageLinks.forEach(a => { a.hash = visible.target.id === 'main' ? '' : visible.target.id; });
  }, { rootMargin: '-15% 0px -50% 0px', threshold: [0, .1, .5] });
  document.querySelectorAll('main section[id], #main').forEach(section => sections.observe(section));
}
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduced.matches && 'IntersectionObserver' in window) {
  const reveal = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); reveal.unobserve(e.target); } }), { threshold: .08 });
  document.querySelectorAll<HTMLElement>('[data-reveal]').forEach(el => { el.classList.add('will-reveal'); reveal.observe(el); });
  reduced.addEventListener('change', e => { if (e.matches) { document.querySelectorAll('.will-reveal').forEach(el => el.classList.add('revealed')); reveal.disconnect(); } });
}
const scene = document.querySelector<HTMLElement>('[data-scene]');
if (scene && !reduced.matches && 'IntersectionObserver' in window) {
  const lazy = new IntersectionObserver(entries => { if (entries.some(e => e.isIntersecting)) { lazy.disconnect(); import('./scene').then(m => m.mountScene(scene)).catch(() => { /* CSS artwork remains available. */ }); } }, { rootMargin: '150px' });
  lazy.observe(scene);
}
