(() => {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  const toggle = $('.menu-toggle');
  const nav = $('.nav');
  if (toggle && nav) toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.textContent = isOpen ? '✕' : '☰';
  });
  if (nav) $$('a', nav).forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    if (toggle) { toggle.textContent = '☰'; toggle.setAttribute('aria-expanded', 'false'); }
  }));

  // Scroll reveals; content remains visible if IntersectionObserver is unavailable.
  const revealItems = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else revealItems.forEach(item => item.classList.add('visible'));

  const readUsers = () => {
    try { const parsed = JSON.parse(localStorage.getItem('bmwZentrumUsers') || '[]'); return Array.isArray(parsed) ? parsed : []; }
    catch { return []; }
  };
  const writeUsers = users => localStorage.setItem('bmwZentrumUsers', JSON.stringify(users));
  const showMessage = (form, message, error = false) => {
    const node = $('.form-message', form);
    if (node) { node.textContent = message; node.style.color = error ? '#ff8585' : '#c5f46b'; }
  };

  const registerForm = $('#register-form');
  if (registerForm) registerForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(registerForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    const confirm = String(data.get('confirm') || '');
    if (name.length < 2) return showMessage(registerForm, 'Введите имя длиной не менее 2 символов.', true);
    if (password.length < 6) return showMessage(registerForm, 'Пароль должен содержать минимум 6 символов.', true);
    if (password !== confirm) return showMessage(registerForm, 'Пароли не совпадают.', true);
    const users = readUsers();
    if (users.some(user => user.email === email)) return showMessage(registerForm, 'Аккаунт с таким email уже существует. Войдите.', true);
    // Demo only: plain-text password storage is not safe for real accounts.
    users.push({ name, email, password, createdAt: new Date().toISOString() });
    try {
      writeUsers(users);
      localStorage.setItem('bmwZentrumCurrentUser', JSON.stringify({ name, email }));
      window.location.href = 'account.html';
    } catch {
      showMessage(registerForm, 'Не удалось сохранить данные. Проверьте настройки браузера.', true);
    }
  });

  const loginForm = $('#login-form');
  if (loginForm) loginForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    const user = readUsers().find(item => item.email === email && item.password === password);
    if (!user) return showMessage(loginForm, 'Не удалось войти. Проверьте email и пароль или зарегистрируйтесь.', true);
    localStorage.setItem('bmwZentrumCurrentUser', JSON.stringify({ name: user.name, email: user.email }));
    window.location.href = 'account.html';
  });

  const logoutButton = $('#logout-button');
  if (logoutButton) logoutButton.addEventListener('click', () => {
    localStorage.removeItem('bmwZentrumCurrentUser');
    showMessage(loginForm, 'Вы вышли из аккаунта.');
  });

  const accountName = $('#account-name');
  if (accountName) {
    let current = null;
    try { current = JSON.parse(localStorage.getItem('bmwZentrumCurrentUser') || 'null'); } catch {}
    if (!current || !current.email) window.location.replace('login.html');
    else {
      accountName.textContent = current.name || 'Владелец BMW';
      const accountEmail = $('#account-email');
      if (accountEmail) accountEmail.textContent = current.email;
    }
    const accountLogout = $('#account-logout');
    if (accountLogout) accountLogout.addEventListener('click', () => {
      localStorage.removeItem('bmwZentrumCurrentUser');
      window.location.href = 'index.html';
    });
  }

  const contactForm = $('#contact-form');
  if (contactForm) contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const message = String(data.get('message') || '').trim();
    if (message.length < 10) return showMessage(contactForm, 'Добавьте немного подробностей (минимум 10 символов).', true);
    // No backend exists; confirm locally rather than pretending to send an email.
    contactForm.reset();
    showMessage(contactForm, 'Спасибо! Форма проверена. Для реальной отправки нужен сервер или почтовый сервис.');
  });
})();