(function initAdmin() {
  const { request, setToken, clearToken, getToken, isSafeUrl } = window.ApiClient;

  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  const logoutBtn = document.getElementById('logout-btn');
  const loginForm = document.getElementById('login-form');
  const loginErrorEl = document.getElementById('login-error');
  const toastEl = document.getElementById('admin-toast');

  let activeMsgStatus = 'all';

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  };

  let toastTimer = null;
  const showToast = (message, type = 'success') => {
    toastEl.textContent = message;
    toastEl.className = `toast show ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.className = 'toast';
    }, 3200);
  };

  const showDashboard = (adminInfo) => {
    loginSection.hidden = true;
    dashboardSection.hidden = false;
    logoutBtn.hidden = false;
    if (adminInfo?.email) {
      document.getElementById('admin-email-badge').textContent = `Signed in: ${adminInfo.email}`;
    }
    loadAllAdminData();
  };

  const showLogin = () => {
    clearToken();
    dashboardSection.hidden = true;
    logoutBtn.hidden = true;
    loginSection.hidden = false;
  };

  /* -------------------- Auth -------------------- */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', showLogin);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginErrorEl.replaceChildren();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const res = await request('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        setToken(res.data.token);
        showDashboard(res.data.admin);
        showToast('Signed in successfully');
      } catch (err) {
        loginErrorEl.replaceChildren(el('div', 'alert alert-error', err.message));
      }
    });
  }

  /* -------------------- Tabs -------------------- */
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${target}`).classList.add('active');
    });
  });

  /* -------------------- Messages Inbox -------------------- */
  const loadMessages = async () => {
    const list = document.getElementById('messages-list');
    list.replaceChildren(el('div', 'empty-state', 'Loading messages...'));
    try {
      const query = activeMsgStatus === 'all' ? '' : `?status=${encodeURIComponent(activeMsgStatus)}`;
      const res = await request(`/api/contact${query}`, { auth: true });
      const messages = res.data || [];
      list.replaceChildren();

      if (messages.length === 0) {
        list.appendChild(el('div', 'empty-state', 'No contact messages in this view.'));
        return;
      }

      messages.forEach((msg) => {
        const item = el('article', 'admin-item');

        const header = el('div', 'admin-item-header');
        const info = el('div');
        info.appendChild(el('strong', '', `${msg.subject} `));
        info.appendChild(el('span', 'badge', msg.status));
        info.appendChild(
          el('div', 'helper-text', `From ${msg.name} (${msg.email}) • ${new Date(msg.createdAt).toLocaleString()}`)
        );
        header.appendChild(info);

        const controls = el('div', 'admin-item-actions');
        const select = document.createElement('select');
        ['new', 'read', 'replied', 'archived'].forEach((st) => {
          const opt = el('option', '', st);
          opt.value = st;
          if (msg.status === st) opt.selected = true;
          select.appendChild(opt);
        });
        select.addEventListener('change', async () => {
          try {
            await request(`/api/contact/${msg._id}/status`, {
              method: 'PATCH',
              auth: true,
              body: JSON.stringify({ status: select.value }),
            });
            showToast('Message status updated');
            loadMessages();
          } catch (err) {
            showToast(err.message, 'error');
          }
        });
        controls.appendChild(select);

        const delBtn = el('button', 'btn btn-danger btn-sm', 'Delete');
        delBtn.type = 'button';
        delBtn.addEventListener('click', async () => {
          if (!confirm('Delete this message permanently?')) return;
          try {
            await request(`/api/contact/${msg._id}`, { method: 'DELETE', auth: true });
            showToast('Message deleted');
            loadMessages();
          } catch (err) {
            showToast(err.message, 'error');
          }
        });
        controls.appendChild(delBtn);

        header.appendChild(controls);
        item.appendChild(header);

        const bodyText = el('p', '', msg.message);
        bodyText.style.margin = '0';
        bodyText.style.whiteSpace = 'pre-wrap';
        item.appendChild(bodyText);

        const emailMeta = el('div', 'helper-text', `Email delivery: ${msg.emailStatus}`);
        if (isSafeUrl(msg.emailPreviewUrl)) {
          emailMeta.appendChild(document.createTextNode(' • '));
          const link = el('a', '', 'Open Ethereal Preview');
          link.href = msg.emailPreviewUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.style.textDecoration = 'underline';
          emailMeta.appendChild(link);
        }
        item.appendChild(emailMeta);

        list.appendChild(item);
      });
    } catch (err) {
      if (err.status === 401) return showLogin();
      list.replaceChildren(el('div', 'empty-state', err.message));
    }
  };

  document.querySelectorAll('#msg-filter-bar .filter-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeMsgStatus = btn.getAttribute('data-status');
      document.querySelectorAll('#msg-filter-bar .filter-pill').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      loadMessages();
    });
  });

  document.getElementById('refresh-messages-btn').addEventListener('click', loadMessages);

  /* -------------------- Projects Manager -------------------- */
  const projectForm = document.getElementById('project-form');
  const resetProjectForm = () => {
    projectForm.reset();
    document.getElementById('proj-id').value = '';
    document.getElementById('proj-form-title').textContent = 'Add Project';
  };
  document.getElementById('proj-reset-btn').addEventListener('click', resetProjectForm);

  const populateProjectForm = (p) => {
    document.getElementById('proj-id').value = p._id;
    document.getElementById('proj-form-title').textContent = `Edit: ${p.title}`;
    document.getElementById('proj-title').value = p.title || '';
    document.getElementById('proj-category').value = p.category || 'Full-Stack';
    document.getElementById('proj-status').value = p.status || 'completed';
    document.getElementById('proj-summary').value = p.summary || '';
    document.getElementById('proj-description').value = p.description || '';
    document.getElementById('proj-tech').value = (p.techStack || []).join(', ');
    document.getElementById('proj-highlights').value = (p.highlights || []).join('\n');
    document.getElementById('proj-repo').value = p.repoUrl || '';
    document.getElementById('proj-live').value = p.liveUrl || '';
    document.getElementById('proj-order').value = p.order ?? 0;
    document.getElementById('proj-featured').checked = Boolean(p.featured);
  };

  const loadProjects = async () => {
    const list = document.getElementById('admin-projects-list');
    try {
      const res = await request('/api/projects');
      const projects = res.data || [];
      list.replaceChildren();

      if (projects.length === 0) {
        list.appendChild(el('div', 'empty-state', 'No projects created yet.'));
        return;
      }

      projects.forEach((p) => {
        const item = el('article', 'admin-item');
        const header = el('div', 'admin-item-header');

        const titleWrap = el('div');
        titleWrap.appendChild(el('strong', '', p.title));
        titleWrap.appendChild(el('div', 'helper-text', `${p.category} • ${p.status}${p.featured ? ' • Featured' : ''}`));
        header.appendChild(titleWrap);

        const actions = el('div', 'admin-item-actions');
        const editBtn = el('button', 'btn btn-secondary btn-sm', 'Edit');
        editBtn.type = 'button';
        editBtn.addEventListener('click', () => populateProjectForm(p));
        actions.appendChild(editBtn);

        const delBtn = el('button', 'btn btn-danger btn-sm', 'Delete');
        delBtn.type = 'button';
        delBtn.addEventListener('click', async () => {
          if (!confirm(`Delete "${p.title}"?`)) return;
          try {
            await request(`/api/projects/${p._id}`, { method: 'DELETE', auth: true });
            showToast('Project deleted');
            loadProjects();
          } catch (err) {
            showToast(err.message, 'error');
          }
        });
        actions.appendChild(delBtn);

        header.appendChild(actions);
        item.appendChild(header);
        item.appendChild(el('p', 'helper-text', p.summary));
        list.appendChild(item);
      });
    } catch (err) {
      list.replaceChildren(el('div', 'empty-state', err.message));
    }
  };

  projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('proj-id').value;
    const payload = {
      title: document.getElementById('proj-title').value.trim(),
      category: document.getElementById('proj-category').value,
      status: document.getElementById('proj-status').value,
      summary: document.getElementById('proj-summary').value.trim(),
      description: document.getElementById('proj-description').value.trim(),
      techStack: document
        .getElementById('proj-tech')
        .value.split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      highlights: document
        .getElementById('proj-highlights')
        .value.split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      repoUrl: document.getElementById('proj-repo').value.trim(),
      liveUrl: document.getElementById('proj-live').value.trim(),
      order: Number.parseInt(document.getElementById('proj-order').value || '0', 10),
      featured: document.getElementById('proj-featured').checked,
    };

    try {
      if (id) {
        await request(`/api/projects/${id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify(payload),
        });
        showToast('Project updated');
      } else {
        await request('/api/projects', {
          method: 'POST',
          auth: true,
          body: JSON.stringify(payload),
        });
        showToast('Project created');
      }
      resetProjectForm();
      loadProjects();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  /* -------------------- Skills Manager -------------------- */
  const skillForm = document.getElementById('skill-form');
  const resetSkillForm = () => {
    skillForm.reset();
    document.getElementById('skill-id').value = '';
    document.getElementById('skill-form-title').textContent = 'Add Skill';
  };
  document.getElementById('skill-reset-btn').addEventListener('click', resetSkillForm);

  const loadSkills = async () => {
    const list = document.getElementById('admin-skills-list');
    try {
      const res = await request('/api/skills');
      const skills = res.data || [];
      list.replaceChildren();

      if (skills.length === 0) {
        list.appendChild(el('div', 'empty-state', 'No skills added yet.'));
        return;
      }

      skills.forEach((s) => {
        const item = el('article', 'admin-item');
        const header = el('div', 'admin-item-header');

        const info = el('div');
        info.appendChild(el('strong', '', s.name));
        info.appendChild(el('div', 'helper-text', `${s.category} • ${s.level} (${s.proficiency}%)`));
        header.appendChild(info);

        const actions = el('div', 'admin-item-actions');
        const editBtn = el('button', 'btn btn-secondary btn-sm', 'Edit');
        editBtn.type = 'button';
        editBtn.addEventListener('click', () => {
          document.getElementById('skill-id').value = s._id;
          document.getElementById('skill-form-title').textContent = `Edit: ${s.name}`;
          document.getElementById('skill-name').value = s.name;
          document.getElementById('skill-category').value = s.category;
          document.getElementById('skill-level').value = s.level;
          document.getElementById('skill-proficiency').value = s.proficiency;
          document.getElementById('skill-order').value = s.order ?? 0;
        });
        actions.appendChild(editBtn);

        const delBtn = el('button', 'btn btn-danger btn-sm', 'Delete');
        delBtn.type = 'button';
        delBtn.addEventListener('click', async () => {
          if (!confirm(`Delete skill "${s.name}"?`)) return;
          try {
            await request(`/api/skills/${s._id}`, { method: 'DELETE', auth: true });
            showToast('Skill deleted');
            loadSkills();
          } catch (err) {
            showToast(err.message, 'error');
          }
        });
        actions.appendChild(delBtn);

        header.appendChild(actions);
        item.appendChild(header);
        list.appendChild(item);
      });
    } catch (err) {
      list.replaceChildren(el('div', 'empty-state', err.message));
    }
  };

  skillForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('skill-id').value;
    const payload = {
      name: document.getElementById('skill-name').value.trim(),
      category: document.getElementById('skill-category').value,
      level: document.getElementById('skill-level').value,
      proficiency: Number.parseInt(document.getElementById('skill-proficiency').value || '80', 10),
      order: Number.parseInt(document.getElementById('skill-order').value || '0', 10),
    };

    try {
      if (id) {
        await request(`/api/skills/${id}`, {
          method: 'PUT',
          auth: true,
          body: JSON.stringify(payload),
        });
        showToast('Skill updated');
      } else {
        await request('/api/skills', {
          method: 'POST',
          auth: true,
          body: JSON.stringify(payload),
        });
        showToast('Skill added');
      }
      resetSkillForm();
      loadSkills();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  /* -------------------- Profile Editor -------------------- */
  const profileForm = document.getElementById('profile-form');

  const loadProfile = async () => {
    try {
      const res = await request('/api/profile');
      const p = res.data;
      if (!p) return;
      document.getElementById('prof-fullName').value = p.fullName || '';
      document.getElementById('prof-headline').value = p.headline || '';
      document.getElementById('prof-tagline').value = p.tagline || '';
      document.getElementById('prof-bio').value = p.bio || '';
      document.getElementById('prof-highlights').value = (p.aboutHighlights || []).join('\n');
      document.getElementById('prof-location').value = p.location || '';
      document.getElementById('prof-email').value = p.email || '';
      document.getElementById('prof-availability').value = p.availability || 'available';
      document.getElementById('prof-availabilityLabel').value = p.availabilityLabel || '';
      document.getElementById('prof-github').value = p.socialLinks?.github || '';
      document.getElementById('prof-linkedin').value = p.socialLinks?.linkedin || '';
      document.getElementById('prof-website').value = p.socialLinks?.website || '';
      document.getElementById('prof-resume').value = p.resumeUrl || '';
      document.getElementById('prof-stat-projects').value = p.stats?.projectsCompleted ?? 0;
      document.getElementById('prof-stat-years').value = p.stats?.yearsExperience ?? 0;
      document.getElementById('prof-stat-tech').value = p.stats?.technologiesCount ?? 0;
      document.getElementById('prof-stat-certs').value = p.stats?.certificationsCount ?? 0;
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      fullName: document.getElementById('prof-fullName').value.trim(),
      headline: document.getElementById('prof-headline').value.trim(),
      tagline: document.getElementById('prof-tagline').value.trim(),
      bio: document.getElementById('prof-bio').value.trim(),
      aboutHighlights: document
        .getElementById('prof-highlights')
        .value.split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      location: document.getElementById('prof-location').value.trim(),
      email: document.getElementById('prof-email').value.trim(),
      availability: document.getElementById('prof-availability').value,
      availabilityLabel: document.getElementById('prof-availabilityLabel').value.trim(),
      resumeUrl: document.getElementById('prof-resume').value.trim(),
      socialLinks: {
        github: document.getElementById('prof-github').value.trim(),
        linkedin: document.getElementById('prof-linkedin').value.trim(),
        website: document.getElementById('prof-website').value.trim(),
      },
      stats: {
        projectsCompleted: Number.parseInt(document.getElementById('prof-stat-projects').value || '0', 10),
        yearsExperience: Number.parseFloat(document.getElementById('prof-stat-years').value || '0'),
        technologiesCount: Number.parseInt(document.getElementById('prof-stat-tech').value || '0', 10),
        certificationsCount: Number.parseInt(document.getElementById('prof-stat-certs').value || '0', 10),
      },
    };

    try {
      await request('/api/profile', {
        method: 'PUT',
        auth: true,
        body: JSON.stringify(payload),
      });
      showToast('Profile saved successfully');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  const loadAllAdminData = () => {
    loadMessages();
    loadProjects();
    loadSkills();
    loadProfile();
  };

  /* -------------------- Boot Check -------------------- */
  (async () => {
    const token = getToken();
    if (!token) {
      showLogin();
      return;
    }
    try {
      const res = await request('/api/auth/verify', { auth: true });
      showDashboard(res.data?.admin);
    } catch {
      showLogin();
    }
  })();
})();
