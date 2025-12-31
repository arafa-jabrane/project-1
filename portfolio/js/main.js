(() => {
  const body = document.body;
  const themeToggle = document.querySelector('[data-theme-toggle]');
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const avatarImg = document.getElementById('avatar-img');
  const avatarUpload = document.getElementById('avatar-upload');

  const createPlaceholder = (text, colorA, colorB) => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='520' viewBox='0 0 800 520'>` +
      `<defs><linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>` +
      `<stop stop-color='${colorA}' offset='0%'/><stop stop-color='${colorB}' offset='100%'/></linearGradient></defs>` +
      `<rect width='800' height='520' fill='url(#g)' rx='28'/>` +
      `<text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle' font-family='Helvetica,Arial,sans-serif' font-size='34' fill='white' opacity='0.92'>${text}</text>` +
      `</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  };

  const savedTheme = localStorage.getItem('portfolio-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  const setTheme = (theme) => {
    body.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    const next = theme === 'dark' ? 'light' : 'dark';
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', `Activate ${next} mode`);
    }
  };

  setTheme(initialTheme);

  themeToggle?.addEventListener('click', () => {
    const next = body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  const pageName = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  navLinks?.querySelectorAll('a').forEach((link) => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href === pageName) link.classList.add('active');
  });

  menuToggle?.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    navLinks?.classList.toggle('open');
  });

  document.addEventListener('click', (event) => {
    if (!navLinks || !menuToggle) return;
    const isInsideNav = navLinks.contains(event.target) || menuToggle.contains(event.target);
    if (!isInsideNav) {
      navLinks.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  const isValidEmail = (value) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value);

  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm) return;
    const formData = new FormData(contactForm);
    const name = (formData.get('name') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const message = (formData.get('message') || '').toString().trim();

    const errors = [];
    if (!name) errors.push('Name is required.');
    if (!email || !isValidEmail(email)) errors.push('A valid email is required.');
    if (!message) errors.push('Message cannot be empty.');

    if (errors.length) {
      formStatus && (formStatus.textContent = errors.join(' '));
      formStatus?.classList.remove('success');
      return;
    }

    formStatus && (formStatus.textContent = 'Message ready to send. This demo keeps data client-side.');
    formStatus?.classList.add('success');
    contactForm.reset();
  });

  const galleryGrid = document.getElementById('gallery-grid');
  const galleryInput = document.getElementById('gallery-upload');

  if (avatarImg) {
    avatarImg.src = createPlaceholder('Jabrane Arafa', '#59d6ff', '#6b5bff');
  }

  avatarUpload?.addEventListener('change', (event) => {
    const file = (event.target.files || [])[0];
    if (!file || !avatarImg) return;
    const url = URL.createObjectURL(file);
    avatarImg.src = url;
    avatarImg.onload = () => URL.revokeObjectURL(url);
  });

  const addGalleryImage = (src, alt) => {
    if (!galleryGrid) return;
    const figure = document.createElement('figure');
    figure.className = 'gallery-card';
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    const caption = document.createElement('figcaption');
    caption.textContent = alt;
    figure.append(img, caption);
    galleryGrid.appendChild(figure);
    img.onload = () => src.startsWith('blob:') && URL.revokeObjectURL(src);
  };

  if (galleryGrid) {
    const presets = [
      { text: 'Lab Topology', colors: ['#59d6ff', '#6b5bff'] },
      { text: 'Firewall Policy', colors: ['#0fc2c0', '#265dff'] },
      { text: 'API Metrics', colors: ['#ffaa4c', '#6ad4a7'] },
      { text: 'Service Map', colors: ['#6b5bff', '#ff6fb1'] },
      { text: 'Observability', colors: ['#59d6ff', '#0fc2c0'] },
      { text: 'Automation', colors: ['#ff8f70', '#ff3d7f'] },
      { text: 'Red Teaming', colors: ['#ff6b81', '#6b5bff'] },
      { text: 'CISSP / CISO', colors: ['#0fc2c0', '#265dff'] },
      { text: 'Red Hat', colors: ['#ff8f70', '#ff3d7f'] }
    ];
    presets.forEach(({ text, colors }) => addGalleryImage(createPlaceholder(text, colors[0], colors[1]), text));
  }

  galleryInput?.addEventListener('change', (event) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      addGalleryImage(url, file.name || 'Uploaded image');
    });
  });
})();
