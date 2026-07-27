
  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Toast helper
  const toastEl = document.getElementById('toast');
  let toastTimer;
  function showToast(msg){
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  // Mobile menu
  const burger = document.getElementById('burgerToggle');
  const primaryNav = document.getElementById('primaryNav');
  burger.addEventListener('click', () => {
    primaryNav.classList.toggle('open');
  });

  // Nav active state
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      primaryNav.classList.remove('open');
    });
  });

  // Search toggle
  const searchToggle = document.getElementById('searchToggle');
  const searchPanel = document.getElementById('searchPanel');
  const searchInput = document.getElementById('searchInput');
  searchToggle.addEventListener('click', () => {
    searchPanel.classList.toggle('open');
    if (searchPanel.classList.contains('open')) {
      setTimeout(() => searchInput.focus(), 150);
    }
  });
  document.getElementById('searchGo').addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); });
  function doSearch(){
    const q = searchInput.value.trim();
    showToast(q ? `Searching for "${q}"…` : 'Type something to search');
  }

  // Account dropdown (login / create account / logout)
  const CURRENT_USER_KEY = 'launchpad_currentUser';
  const accountToggle = document.getElementById('accountToggle');
  const accountMenu = document.getElementById('accountMenu');
  const accountIconSVG = accountToggle.innerHTML;

  function getCurrentUser(){
    try{ return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); }
    catch(e){ return null; }
  }
  function getUserInitial(user){
    const source = (user.first || user.username || user.email || '').trim();
    return source ? source.charAt(0).toUpperCase() : '?';
  }
  function renderAccountMenu(){
    const user = getCurrentUser();
    if(user){
      const name = user.first || user.username || user.email || 'there';
      accountToggle.innerHTML = `<span class="avatar-badge">${getUserInitial(user)}</span>`;
      accountToggle.setAttribute('aria-label', `Account (${name})`);
      accountMenu.innerHTML = `
        <div class="account-greeting">Signed in as ${name}</div>
        <a href="#top" id="ordersLink">My orders</a>
        <button type="button" id="logoutBtn">Log out</button>`;
      document.getElementById('ordersLink').addEventListener('click', (e) => {
        e.preventDefault();
        showToast('My orders clicked');
        accountMenu.classList.remove('open');
      });
      document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem(CURRENT_USER_KEY);
        accountMenu.classList.remove('open');
        window.location.href = 'login.html';
      });
    } else {
      accountToggle.innerHTML = accountIconSVG;
      accountToggle.setAttribute('aria-label', 'Account menu');
      accountMenu.innerHTML = `
        <a href="login.html#login">Log in</a>
        <a href="login.html">Create account</a>`;
    }
  }
  renderAccountMenu();

  accountToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    accountMenu.classList.toggle('open');
  });
  document.addEventListener('click', () => accountMenu.classList.remove('open'));

  // Cart
  const cartToggle = document.getElementById('cartToggle');
  const cartCount = document.getElementById('cartCount');
  let count = 0;
  cartToggle.addEventListener('click', () => {
    count++;
    cartCount.textContent = count;
    cartCount.classList.add('bump');
    setTimeout(() => cartCount.classList.remove('bump'), 220);
    showToast('Item added to cart (' + count + ')');
  });

  // Service cards -> click for a quick detail toast, scroll reveal, and cursor spotlight
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      showToast(card.dataset.service + ' — learn more coming soon');
    });
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
      card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
    });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting){
        setTimeout(() => entry.target.classList.add('in-view'), i * 90);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  cards.forEach(card => revealObserver.observe(card));

  // Phone link toast
  document.getElementById('phoneLink').addEventListener('click', (e) => {
    e.stopPropagation();
    showToast('Calling (123) 456-7890…');
  });
