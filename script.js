// Basic portfolio interactions
(function(){
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', (!expanded).toString());
      nav.classList.toggle('open');
    });
    // Close menu on link click (mobile)
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  // Scroll spy: highlight active nav link
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = Array.from(document.querySelectorAll('[data-nav] a'));
  if (sections.length && navLinks.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });
    sections.forEach(s => io.observe(s));
  }
})();
