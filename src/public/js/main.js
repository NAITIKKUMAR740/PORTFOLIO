(function initPortfolio() {
  const { request, isSafeUrl } = window.ApiClient;

  const state = {
    profile: null,
    skills: [],
    projects: [],
    activeSkillCategory: 'All',
    activeProjectCategory: 'All',
    searchQuery: '',
  };

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '</>';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  /* -------------------- Mobile Navigation -------------------- */
  const menuBtn = document.getElementById('mobile-menu-toggle');
  const primaryNav = document.getElementById('primary-nav');

  if (menuBtn && primaryNav) {
    menuBtn.addEventListener('click', () => {
      const isOpen = primaryNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
    });

    primaryNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        primaryNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* -------------------- Profile Rendering -------------------- */
  const renderProfile = (profile) => {
    const yearEl = document.getElementById('footer-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    if (!profile) {
      document.getElementById('hero-name').textContent = 'Portfolio Not Seeded Yet';
      document.getElementById('hero-headline').textContent = 'Run npm run seed or configure via /admin';
      document.getElementById('about-bio').textContent =
        'No profile record found in MongoDB yet. Run "npm run seed" to populate sample data or sign in at /admin.';
      return;
    }

    document.title = `${profile.fullName} — ${profile.headline}`;
    document.getElementById('brand-name').textContent = profile.fullName;
    document.getElementById('brand-initials').textContent = getInitials(profile.fullName);
    document.getElementById('footer-name').textContent = profile.fullName;

    document.getElementById('hero-name').textContent = profile.fullName;
    document.getElementById('hero-headline').textContent = profile.headline;
    document.getElementById('hero-tagline').textContent =
      profile.tagline || 'Designing and building resilient full-stack applications.';
    document.getElementById('availability-text').textContent =
      profile.availabilityLabel || 'Open to Opportunities';

    const resumeBtn = document.getElementById('hero-resume-btn');
    if (isSafeUrl(profile.resumeUrl)) {
      resumeBtn.href = profile.resumeUrl;
      resumeBtn.hidden = false;
    } else {
      resumeBtn.hidden = true;
    }

    // Social links
    const socialsEl = document.getElementById('hero-socials');
    socialsEl.replaceChildren();
    const socialEntries = [
      { label: 'GitHub', url: profile.socialLinks?.github },
      { label: 'LinkedIn', url: profile.socialLinks?.linkedin },
      { label: 'Twitter / X', url: profile.socialLinks?.twitter },
      { label: 'Website', url: profile.socialLinks?.website },
    ].filter((s) => isSafeUrl(s.url));

    socialEntries.forEach((item) => {
      const a = el('a', 'social-pill', item.label);
      a.href = item.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      socialsEl.appendChild(a);
    });

    // Terminal code snippet
    const codeEl = document.getElementById('hero-code-snippet');
    codeEl.textContent = JSON.stringify(
      {
        developer: profile.fullName,
        role: profile.headline,
        location: profile.location || 'Remote',
        availability: profile.availability || 'available',
        stack: ['HTML', 'CSS', 'JavaScript', 'Node.js', 'Express', 'MongoDB'],
      },
      null,
      2
    );

    // Stats grid
    const statsEl = document.getElementById('hero-stats');
    statsEl.replaceChildren();
    const statItems = [
      { label: 'Projects Built', value: `${profile.stats?.projectsCompleted ?? state.projects.length}+` },
      { label: 'Years Coding', value: `${profile.stats?.yearsExperience ?? 1}+` },
      { label: 'Core Tech', value: `${profile.stats?.technologiesCount ?? state.skills.length}+` },
      { label: 'Certifications', value: `${profile.stats?.certificationsCount ?? 1}` },
    ];
    statItems.forEach((stat) => {
      const box = el('div', 'stat-box');
      box.appendChild(el('span', 'stat-value', stat.value));
      box.appendChild(el('span', 'stat-label', stat.label));
      statsEl.appendChild(box);
    });

    // About section
    document.getElementById('about-bio').textContent = profile.bio;
    const aboutMeta = document.getElementById('about-meta');
    aboutMeta.replaceChildren();
    if (profile.location) {
      aboutMeta.appendChild(el('span', '', `Location: ${profile.location}`));
    }
    if (profile.email) {
      aboutMeta.appendChild(el('span', '', `Email: ${profile.email}`));
    }

    const highlightsEl = document.getElementById('about-highlights');
    highlightsEl.replaceChildren();
    const highlights = profile.aboutHighlights || [];
    if (highlights.length === 0) {
      highlightsEl.appendChild(el('li', '', 'Full-stack MVC architecture & RESTful API engineering.'));
    } else {
      highlights.forEach((text) => {
        const li = el('li');
        li.appendChild(el('span', 'highlight-check', '✓'));
        li.appendChild(el('span', '', text));
        highlightsEl.appendChild(li);
      });
    }

    // Contact Info panel
    const contactInfoEl = document.getElementById('contact-info-list');
    contactInfoEl.replaceChildren();
    if (profile.email) {
      const emailLink = el('a', 'social-pill', `Email: ${profile.email}`);
      emailLink.href = `mailto:${profile.email}`;
      contactInfoEl.appendChild(emailLink);
    }
    if (profile.location) {
      contactInfoEl.appendChild(el('div', 'social-pill', `Based in: ${profile.location}`));
    }
    socialEntries.forEach((item) => {
      const link = el('a', 'social-pill', `${item.label} Profile →`);
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      contactInfoEl.appendChild(link);
    });
  };

  /* -------------------- Skills Rendering -------------------- */
  const renderSkillFilters = () => {
    const container = document.getElementById('skill-filters');
    container.replaceChildren();
    const categories = ['All', ...new Set(state.skills.map((s) => s.category))];

    categories.forEach((cat) => {
      const btn = el(
        'button',
        `filter-pill${state.activeSkillCategory === cat ? ' active' : ''}`,
        cat
      );
      btn.type = 'button';
      btn.addEventListener('click', () => {
        state.activeSkillCategory = cat;
        renderSkillFilters();
        renderSkills();
      });
      container.appendChild(btn);
    });
  };

  const renderSkills = () => {
    const grid = document.getElementById('skills-grid');
    grid.replaceChildren();

    const filtered =
      state.activeSkillCategory === 'All'
        ? state.skills
        : state.skills.filter((s) => s.category === state.activeSkillCategory);

    if (filtered.length === 0) {
      grid.appendChild(el('div', 'empty-state', 'No skills found for this category.'));
      return;
    }

    filtered.forEach((skill) => {
      const card = el('article', 'card skill-card');

      const top = el('div', 'skill-top');
      top.appendChild(el('span', 'skill-name', skill.name));
      top.appendChild(el('span', 'skill-category-tag', skill.category));
      card.appendChild(top);

      const meta = el('div', 'skill-meta');
      meta.appendChild(el('span', '', skill.level || 'Proficient'));
      meta.appendChild(el('span', '', `${skill.proficiency}%`));
      card.appendChild(meta);

      const track = el('div', 'progress-track');
      const fill = el('div', 'progress-fill');
      fill.style.width = `${Math.min(100, Math.max(0, Number(skill.proficiency) || 0))}%`;
      track.appendChild(fill);
      card.appendChild(track);

      grid.appendChild(card);
    });
  };

  /* -------------------- Projects & Modal -------------------- */
  const modal = document.getElementById('project-modal');
  const closeModalBtn = document.getElementById('modal-close-btn');

  const closeProjectModal = () => {
    modal.classList.remove('open');
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeProjectModal);
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeProjectModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeProjectModal();
      }
    });
  }

  const openProjectModal = (project) => {
    document.getElementById('modal-project-category').textContent = project.category;
    document.getElementById('modal-project-title').textContent = project.title;
    document.getElementById('modal-project-description').textContent = project.description;

    const hlWrap = document.getElementById('modal-highlights-wrap');
    const hlList = document.getElementById('modal-project-highlights');
    hlList.replaceChildren();

    if (Array.isArray(project.highlights) && project.highlights.length > 0) {
      hlWrap.hidden = false;
      project.highlights.forEach((h) => {
        const li = el('li');
        li.appendChild(el('span', 'highlight-check', '✓'));
        li.appendChild(el('span', '', h));
        hlList.appendChild(li);
      });
    } else {
      hlWrap.hidden = true;
    }

    const techWrap = document.getElementById('modal-project-tech');
    techWrap.replaceChildren();
    (project.techStack || []).forEach((tech) => {
      techWrap.appendChild(el('span', 'tech-chip', tech));
    });

    const linksWrap = document.getElementById('modal-project-links');
    linksWrap.replaceChildren();
    if (isSafeUrl(project.liveUrl)) {
      const liveLink = el('a', 'btn btn-primary btn-sm', 'Live Demo');
      liveLink.href = project.liveUrl;
      liveLink.target = '_blank';
      liveLink.rel = 'noopener noreferrer';
      linksWrap.appendChild(liveLink);
    }
    if (isSafeUrl(project.repoUrl)) {
      const repoLink = el('a', 'btn btn-secondary btn-sm', 'Source Code');
      repoLink.href = project.repoUrl;
      repoLink.target = '_blank';
      repoLink.rel = 'noopener noreferrer';
      linksWrap.appendChild(repoLink);
    }

    modal.classList.add('open');
  };

  const renderProjectFilters = (allCategories) => {
    const container = document.getElementById('project-filters');
    container.replaceChildren();

    allCategories.forEach((cat) => {
      const btn = el(
        'button',
        `filter-pill${state.activeProjectCategory === cat ? ' active' : ''}`,
        cat
      );
      btn.type = 'button';
      btn.addEventListener('click', () => {
        state.activeProjectCategory = cat;
        renderProjectFilters(allCategories);
        fetchFilteredProjects();
      });
      container.appendChild(btn);
    });
  };

  const renderProjects = (projects) => {
    const grid = document.getElementById('projects-grid');
    grid.replaceChildren();

    if (!projects || projects.length === 0) {
      grid.appendChild(el('div', 'empty-state', 'No projects match your current filter.'));
      return;
    }

    projects.forEach((project) => {
      const card = el('article', 'card project-card');

      const topGroup = el('div');

      const banner = el('div', 'project-banner');
      if (isSafeUrl(project.imageUrl)) {
        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = `${project.title} preview`;
        img.loading = 'lazy';
        banner.appendChild(img);
      }

      const bannerTop = el('div', 'project-banner-top');
      bannerTop.appendChild(el('span', 'badge', project.category));
      if (project.featured) {
        bannerTop.appendChild(el('span', 'badge badge-success', 'Featured'));
      }
      banner.appendChild(bannerTop);
      topGroup.appendChild(banner);

      const title = el('h3', 'project-title', project.title);
      title.style.marginTop = '1rem';
      topGroup.appendChild(title);
      topGroup.appendChild(el('p', 'project-summary', project.summary));

      const chips = el('div', 'chip-row');
      chips.style.marginTop = '0.85rem';
      (project.techStack || []).slice(0, 5).forEach((tech) => {
        chips.appendChild(el('span', 'tech-chip', tech));
      });
      topGroup.appendChild(chips);

      card.appendChild(topGroup);

      const actions = el('div', 'project-actions');
      const detailsBtn = el('button', 'btn btn-ghost btn-sm', 'Inspect Details');
      detailsBtn.type = 'button';
      detailsBtn.addEventListener('click', () => openProjectModal(project));
      actions.appendChild(detailsBtn);

      const links = el('div', 'project-links');
      if (isSafeUrl(project.repoUrl)) {
        const repo = el('a', 'btn btn-secondary btn-sm', 'GitHub');
        repo.href = project.repoUrl;
        repo.target = '_blank';
        repo.rel = 'noopener noreferrer';
        links.appendChild(repo);
      }
      if (isSafeUrl(project.liveUrl)) {
        const live = el('a', 'btn btn-primary btn-sm', 'Demo');
        live.href = project.liveUrl;
        live.target = '_blank';
        live.rel = 'noopener noreferrer';
        links.appendChild(live);
      }
      actions.appendChild(links);

      card.appendChild(actions);
      grid.appendChild(card);
    });
  };

  const fetchFilteredProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (state.activeProjectCategory && state.activeProjectCategory !== 'All') {
        params.set('category', state.activeProjectCategory);
      }
      if (state.searchQuery.trim()) {
        params.set('search', state.searchQuery.trim());
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      const res = await request(`/api/projects${query}`);
      renderProjects(res.data || []);
    } catch (err) {
      const grid = document.getElementById('projects-grid');
      grid.replaceChildren(el('div', 'empty-state', `Unable to load projects: ${err.message}`));
    }
  };

  let searchTimeout = null;
  const searchInput = document.getElementById('project-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(fetchFilteredProjects, 250);
    });
  }

  /* -------------------- Contact Form -------------------- */
  const contactForm = document.getElementById('contact-form');
  const messageTextarea = document.getElementById('contact-message');
  const charCountEl = document.getElementById('contact-char-count');
  const feedbackEl = document.getElementById('contact-feedback');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (messageTextarea && charCountEl) {
    messageTextarea.addEventListener('input', () => {
      charCountEl.textContent = `${messageTextarea.value.length} / 3000`;
    });
  }

  const clearFormErrors = () => {
    contactForm.querySelectorAll('.form-field').forEach((wrap) => wrap.classList.remove('has-error'));
    contactForm.querySelectorAll('.field-error').forEach((span) => {
      span.textContent = '';
    });
    feedbackEl.replaceChildren();
  };

  const setFieldError = (fieldName, message) => {
    const wrap = contactForm.querySelector(`.form-field[data-field="${fieldName}"]`);
    const errSpan = document.getElementById(`error-${fieldName}`);
    if (wrap) wrap.classList.add('has-error');
    if (errSpan) errSpan.textContent = message;
  };

  const validateClientSide = (data) => {
    let valid = true;
    if (!data.name || data.name.trim().length < 2) {
      setFieldError('name', 'Please enter your name (at least 2 characters).');
      valid = false;
    }
    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email.trim())) {
      setFieldError('email', 'Please enter a valid email address.');
      valid = false;
    }
    if (!data.subject || data.subject.trim().length < 3) {
      setFieldError('subject', 'Subject must be at least 3 characters.');
      valid = false;
    }
    if (!data.message || data.message.trim().length < 10) {
      setFieldError('message', 'Message must be at least 10 characters.');
      valid = false;
    }
    return valid;
  };

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearFormErrors();

      const payload = {
        name: document.getElementById('contact-name').value.trim(),
        email: document.getElementById('contact-email').value.trim(),
        subject: document.getElementById('contact-subject').value.trim(),
        message: document.getElementById('contact-message').value.trim(),
        website: document.getElementById('contact-website').value,
      };

      if (!validateClientSide(payload)) return;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      try {
        const res = await request('/api/contact', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        const alertBox = el('div', 'alert alert-success');
        alertBox.appendChild(document.createTextNode(res.message || 'Message sent successfully!'));

        if (res.data?.emailPreviewUrl && isSafeUrl(res.data.emailPreviewUrl)) {
          alertBox.appendChild(document.createElement('br'));
          const previewLink = el('a', '', 'View Ethereal Email Preview →');
          previewLink.href = res.data.emailPreviewUrl;
          previewLink.target = '_blank';
          previewLink.rel = 'noopener noreferrer';
          alertBox.appendChild(previewLink);
        }

        feedbackEl.replaceChildren(alertBox);
        contactForm.reset();
        if (charCountEl) charCountEl.textContent = '0 / 3000';
      } catch (err) {
        if (Array.isArray(err.errors) && err.errors.length > 0) {
          err.errors.forEach((item) => setFieldError(item.field, item.message));
        }
        const errBox = el('div', 'alert alert-error', err.message || 'Failed to send message.');
        feedbackEl.replaceChildren(errBox);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  }

  /* -------------------- Initial Load -------------------- */
  const loadPortfolio = async () => {
    try {
      const res = await request('/api/portfolio');
      const data = res.data || {};
      state.profile = data.profile || null;
      state.skills = data.skills || [];
      state.projects = data.projects || [];

      renderProfile(state.profile);
      renderSkillFilters();
      renderSkills();

      const projectCategories = ['All', ...new Set(state.projects.map((p) => p.category))];
      renderProjectFilters(projectCategories);
      renderProjects(state.projects);
    } catch (err) {
      document.getElementById('hero-name').textContent = 'Unable to connect to backend';
      document.getElementById('hero-headline').textContent = err.message;
    }
  };

  loadPortfolio();
})();
