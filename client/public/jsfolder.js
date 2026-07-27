
  // ---- Data ----
  const products = [
    { name:"Robe", price:"25000F", rating:4.5, img:"https://picsum.photos/seed/lift-robe/500/500" },
    { name:"Sneakers", price:"10000F", rating:4.5, img:"https://picsum.photos/seed/lift-sneakers/500/500" },
    { name:"T-Shirt", price:"7000F", rating:4.5, img:"https://picsum.photos/seed/lift-tshirt/500/500" },
    { name:"Pullover", price:"8000F", rating:4.5, img:"https://picsum.photos/seed/lift-pullover/500/500" },
  ];
  const categories = [
    { name:"Men", img:"https://picsum.photos/seed/lift-men/400/400" },
    { name:"Women", img:"https://picsum.photos/seed/lift-women/400/400" },
    { name:"Accessoires", img:"https://picsum.photos/seed/lift-acc/400/400" },
  ];
  const services = [
    { name:"Fast Delivery", icon:"🚚" },
    { name:"Tracking order", icon:"📍" },
    { name:"Secure Payment", icon:"💳" },
    { name:"Customer Service", icon:"🎧" },
  ];
  const socials = ["f","t","in","▶","📷","g+","p","📡"];

  function starString(r){
    const full = Math.floor(r);
    const half = r % 1 >= 0.5;
    return "★".repeat(full) + (half ? "½" : "");
  }

  // ---- Render products ----
  const productGrid = document.getElementById('productGrid');
  products.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img"><img src="${p.img}" alt="${p.name}"></div>
      <div class="product-info">
        <h3>${p.name}</h3>
        <div class="rating">${starString(p.rating)} <span>${p.rating}</span></div>
        <div class="price-row"><span class="label">PRICE</span><span>${p.price}</span></div>
        <button class="add-cart">Add To Cart</button>
      </div>`;
    productGrid.appendChild(card);
  });

  // ---- Render categories ----
  const catGrid = document.getElementById('catGrid');
  categories.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'cat-card';
    el.innerHTML = `
      <div class="cat-img"><img src="${c.img}" alt="${c.name}"></div>
      <h3>${c.name}</h3>
      <button class="btn-black">Shop Now</button>`;
    catGrid.appendChild(el);
  });

  // ---- Render services ----
  const serviceGrid = document.getElementById('serviceGrid');
  services.forEach(s=>{
    const el = document.createElement('div');
    el.className = 'service';
    el.innerHTML = `<div class="service-icon">${s.icon}</div><h4>${s.name}</h4>`;
    serviceGrid.appendChild(el);
  });

  // ---- Render social icons ----
  const socialIcons = document.getElementById('socialIcons');
  socials.forEach(s=>{
    const a = document.createElement('a');
    a.href = "#";
    a.textContent = s;
    socialIcons.appendChild(a);
  });

  // ---- Cart logic ----
  let cartCount = 0;
  const cartCountEl = document.getElementById('cartCount');
  const toast = document.getElementById('toast');
  let toastTimer;
  document.addEventListener('click', (e)=>{
    if(e.target.classList.contains('add-cart')){
      cartCount++;
      cartCountEl.textContent = cartCount;
      const name = e.target.closest('.product-card').querySelector('h3').textContent;
      toast.textContent = `${name} added to cart`;
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(()=> toast.classList.remove('show'), 1800);
    }
  });

  // ---- Mobile menu ----
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');
  menuToggle.addEventListener('click', ()=> navMenu.classList.toggle('open'));
  navMenu.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> navMenu.classList.remove('open')));

  // ---- Account menu (login / create account / logout) ----
  // Uses the same localStorage key that login.html writes to, so the
  // homepage knows whether someone is signed in.
  const CURRENT_USER_KEY = 'launchpad_currentUser';

  function getCurrentUser(){
    try{ return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)); }
    catch(e){ return null; }
  }

  const accountToggle = document.getElementById('accountToggle');
  const accountMenu = document.getElementById('accountMenu');

  function getUserInitial(user){
    const source = (user.first || user.username || user.email || '').trim();
    return source ? source.charAt(0).toUpperCase() : '👤';
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
      document.getElementById('ordersLink').addEventListener('click', (e)=>{
        e.preventDefault();
        toast.textContent = 'My orders clicked';
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(()=> toast.classList.remove('show'), 1800);
        accountMenu.classList.remove('open');
      });
      document.getElementById('logoutBtn').addEventListener('click', ()=>{
        localStorage.removeItem(CURRENT_USER_KEY);
        accountMenu.classList.remove('open');
        window.location.href = 'login.html';
      });
    } else {
      accountToggle.innerHTML = '👤';
      accountToggle.setAttribute('aria-label', 'Account');
      accountMenu.innerHTML = `
        <a href="login.html#login">Log in</a>
        <a href="login.html">Create account</a>`;
    }
  }
  renderAccountMenu();

  accountToggle.addEventListener('click', (e)=>{
    e.stopPropagation();
    accountMenu.classList.toggle('open');
  });
  document.addEventListener('click', ()=> accountMenu.classList.remove('open'));