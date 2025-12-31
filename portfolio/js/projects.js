const projectData = [
  {
    title: 'Automated Campus Rollouts',
    description: 'Templated network builds with linting, golden configs, and zero-touch provisioning across distributed sites.',
    technologies: ['Python', 'Netmiko', 'Jinja2', 'Git'],
    github: '#',
    live: '#',
    categories: ['networking', 'automation']
  },
  {
    title: 'API Gateway Observability',
    description: 'Unified tracing and SLO dashboards for edge and app tiers, surfacing latency, error budgets, and drop rates.',
    technologies: ['APIs', 'Prometheus', 'Grafana', 'OpenTelemetry'],
    github: '#',
    live: '#',
    categories: ['software', 'security']
  },
  {
    title: 'Zero Trust Edge',
    description: 'Policy-driven access with MFA, device posture checks, and segmented applications for distributed teams.',
    technologies: ['Firewalls', 'IdP', 'ZTNA', 'VPN'],
    github: '#',
    live: '#',
    categories: ['security', 'networking']
  },
  {
    title: 'Service Mesh Reliability',
    description: 'mTLS service mesh with circuit breaking, blue/green releases, and traffic shadowing for safe changes.',
    technologies: ['Service Mesh', 'mTLS', 'Canary', 'CI/CD'],
    github: '#',
    live: '#',
    categories: ['software', 'security']
  },
  {
    title: 'Network Source of Truth',
    description: 'Inventory, intent, and state validation with drift detection and notifications wired to chatops.',
    technologies: ['Python', 'APIs', 'PostgreSQL', 'GitOps'],
    github: '#',
    live: '#',
    categories: ['automation', 'networking']
  },
  {
    title: 'Incident Response Assistant',
    description: 'Runbooks codified into chat workflows with automated diagnostics and graph-based dependency lookups.',
    technologies: ['JavaScript', 'Node', 'APIs', 'WebSockets'],
    github: '#',
    live: '#',
    categories: ['software', 'automation']
  }
];

const projectsGrid = document.getElementById('projects-grid');
const filterButtons = document.querySelectorAll('[data-filter]');

const renderProjects = (filter = 'all') => {
  if (!projectsGrid) return;
  const filtered = filter === 'all'
    ? projectData
    : projectData.filter((project) => project.categories.includes(filter));

  projectsGrid.innerHTML = filtered.map((project) => {
    const tags = project.technologies.map((tech) => `<span>${tech}</span>`).join('');
    return `
      <article class="card reveal">
        <div class="card-top">
          <span class="pill subtle">${project.categories.join(' · ')}</span>
          <span class="dot"></span>
        </div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="tags">${tags}</div>
        <div class="cta-group">
          <a class="btn ghost" href="${project.github}" target="_blank" rel="noreferrer">GitHub</a>
          <a class="btn primary" href="${project.live}" target="_blank" rel="noreferrer">Live Demo</a>
        </div>
      </article>
    `;
  }).join('');
};

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    const filter = button.getAttribute('data-filter') || 'all';
    renderProjects(filter);
    document.querySelectorAll('.reveal').forEach((el) => el.classList.remove('visible'));
    setTimeout(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('visible')), 10);
  });
});

renderProjects();
