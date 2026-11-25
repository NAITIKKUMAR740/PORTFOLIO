(function initTheme() {
  const STORAGE_KEY = 'portfolio_theme';
  const root = document.documentElement;
  const toggleBtn = document.getElementById('theme-toggle');
  const sunIcon = document.getElementById('theme-icon-sun');
  const moonIcon = document.getElementById('theme-icon-moon');

  const getPreferredTheme = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return 'light';
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
    if (sunIcon && moonIcon) {
      sunIcon.hidden = theme !== 'dark';
      moonIcon.hidden = theme !== 'light';
    }
  };

  applyTheme(getPreferredTheme());

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    });
  }
})();
