/* ============================================================
   LIFT — shared shop engine
   Catalog + Cart + Orders + Header/Footer + Search + Toast
   Used by every page so the whole site behaves like one app.
   ============================================================ */
(function (window, document) {
  "use strict";

  /* ---------------- Location-aware routing ----------------
     lift-shop.js is shared by index.html (App root) and every
     page inside App/pages/, so any link it builds must adapt to
     where it's currently running from. */
  var IN_PAGES = /\/pages\//.test(window.location.pathname);
  function liftUrl(target) {
    if (!target || target === "#" || target.charAt(0) === "#" || /^https?:\/\//.test(target)) return target;
    var splitAt = target.search(/[?#]/);
    var base = splitAt === -1 ? target : target.slice(0, splitAt);
    var rest = splitAt === -1 ? "" : target.slice(splitAt);
    if (base === "index.html") return (IN_PAGES ? "../" : "") + "index.html" + rest;
    return (IN_PAGES ? "" : "pages/") + base + rest;
  }

  /* Where "here" is, expressed the way login.html (which always lives in
     pages/) needs it in order to send the person back after signing in. */
  function currentReturnTarget() {
    if (IN_PAGES) {
      return window.location.pathname.split("/").pop() + window.location.search + window.location.hash;
    }
    return "../index.html" + window.location.search + window.location.hash;
  }

  /* Builds a link to the login page that remembers where the person came
     from, so "Log in" / "Create account" prompts return them to the page
     (or checkout step) they were on instead of always dropping them on
     the homepage. `hash` is appended after the query string, e.g. "#login". */
  function loginUrl(hash, returnTarget) {
    var target = returnTarget || currentReturnTarget();
    return liftUrl("login.html") + "?redirect=" + encodeURIComponent(target) + (hash || "");
  }

  /* Used by login.html to turn a ?redirect= value back into a safe,
     same-site URL. Only ever allows a bare "<name>.html" (a sibling page
     inside pages/) or "../index.html" — anything else (a different origin,
     a path with "/", etc.) is rejected and the caller should fall back to
     the homepage instead. */
  function safeReturnUrl(raw, fallback) {
    fallback = fallback || "../index.html";
    if (!raw) return fallback;
    var value = decodeURIComponent(raw);
    if (/^\.\.\/index\.html([?#].*)?$/.test(value)) return value;
    if (/^[a-zA-Z0-9_-]+\.html([?#].*)?$/.test(value)) return value;
    return fallback;
  }

  /* ---------------- Storage keys ---------------- */
  var K_USER   = "launchpad_currentUser";
  var K_USERS  = "launchpad_users";
  var K_CART   = "lift_cart_v1";
  var K_ORDERS = "lift_orders_v1";
  var K_FOLLOWS  = "lift_follows_v1";
  var K_MESSAGES = "lift_messages_v1";
  var K_POSTS    = "lift_posts_v1";
  var K_NOTIFS   = "lift_notifications_v1";

  /* ---------------- Catalog ---------------- */
  /* Single source of truth for every product shown anywhere on the site. */
  var CATALOG = [
    { id: "jogging-set",   name: "Jogging Set",     price: 25000,  category: "Apparel",     rating: 4.6,
      img: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=700&q=80" },
    { id: "robe",          name: "Robe",             price: 25000,  category: "Apparel",     rating: 4.5,
      img: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=700&q=80" },
    { id: "tshirt",        name: "T-Shirt",          price: 7000,   category: "Apparel",     rating: 4.4,
      img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80" },
    { id: "pullover",      name: "Pullover",         price: 8000,   category: "Apparel",     rating: 4.5,
      img: "https://images.unsplash.com/photo-1516826957135-700dedea698c?w=700&q=80" },
    { id: "sneakers",      name: "Sneakers",         price: 45000,  category: "Footwear",    rating: 4.5,
      img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&q=80" },
    { id: "leather-boots", name: "Leather Boots",    price: 55000,  category: "Footwear",    rating: 4.4,
      img: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=700&q=80" },
    { id: "handbag",       name: "Handbag",          price: 60000,  category: "Bags",        rating: 4.6,
      img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=700&q=80" },
    { id: "backpack",      name: "Backpack",         price: 35000,  category: "Bags",        rating: 4.3,
      img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&q=80" },
    { id: "smart-tv",      name: "Smart TV",         price: 250000, category: "Electronics", rating: 4.7,
      img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=700&q=80" },
    { id: "smartphone",    name: "Smartphone",       price: 180000, category: "Electronics", rating: 4.8,
      img: "https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=700&q=80" },
    { id: "smartwatch",    name: "Smartwatch",       price: 75000,  category: "Electronics", rating: 4.5,
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=700&q=80" },
    { id: "laptop",        name: "Laptop",           price: 320000, category: "Electronics", rating: 4.7,
      img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=700&q=80" },
    { id: "gold-necklace", name: "Gold Necklace",    price: 90000,  category: "Jewelry",     rating: 4.6,
      img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&q=80" },
    { id: "diamond-ring",  name: "Diamond Ring",     price: 150000, category: "Jewelry",     rating: 4.9,
      img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=700&q=80" },

    { id: "skincare-set",  name: "Skincare Set",     price: 18000,  category: "Beauty & Care", rating: 4.6,
      img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700&q=80" },
    { id: "perfume",       name: "Perfume",          price: 32000,  category: "Beauty & Care", rating: 4.7,
      img: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=700&q=80" },

    { id: "blender",       name: "Blender",          price: 28000,  category: "Home & Kitchen", rating: 4.4,
      img: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=700&q=80" },
    { id: "cookware-set",  name: "Cookware Set",     price: 45000,  category: "Home & Kitchen", rating: 4.6,
      img: "https://images.unsplash.com/photo-1584990347449-a838388f2f0e?w=700&q=80" },

    { id: "coffee-beans",  name: "Coffee Beans Pack", price: 6000,  category: "Groceries",     rating: 4.5,
      img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=700&q=80" },
    { id: "snack-box",     name: "Snack Box",        price: 9000,   category: "Groceries",     rating: 4.3,
      img: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=700&q=80" },

    { id: "yoga-mat",      name: "Yoga Mat",         price: 15000,  category: "Sports & Fitness", rating: 4.6,
      img: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=700&q=80" },
    { id: "dumbbell-set",  name: "Dumbbell Set",     price: 40000,  category: "Sports & Fitness", rating: 4.5,
      img: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=700&q=80" },

    { id: "baby-stroller", name: "Baby Stroller",    price: 85000,  category: "Baby & Kids",   rating: 4.7,
      img: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=700&q=80" },
    { id: "toy-set",       name: "Kids Toy Set",     price: 12000,  category: "Baby & Kids",   rating: 4.4,
      img: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=700&q=80" },

    { id: "notebook-bundle", name: "Notebook Bundle", price: 5000,  category: "Books & Stationery", rating: 4.5,
      img: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=700&q=80" },
    { id: "novel-collection", name: "Novel Collection", price: 14000, category: "Books & Stationery", rating: 4.6,
      img: "https://images.unsplash.com/photo-1512820790803-83ca734d794a?w=700&q=80" },

    { id: "tool-kit",      name: "Tool Kit",         price: 38000,  category: "Automotive & Tools", rating: 4.5,
      img: "https://images.unsplash.com/photo-1581147036324-c1c9c1e4b4b8?w=700&q=80" },
    { id: "car-vacuum",    name: "Car Vacuum",       price: 22000,  category: "Automotive & Tools", rating: 4.3,
      img: "https://images.unsplash.com/photo-1616455579100-2ceaa4eb2d37?w=700&q=80" }
  ];

  var LOCATIONS = ["Yaoundé", "Douala", "Bafoussam", "Bamenda", "Garoua", "Buea"];
  var SIZE_SETS = {
    "Apparel": ["S", "M", "L", "XL", "XXL"],
    "Footwear": ["39", "40", "41", "42", "43", "44"]
  };
  CATALOG.forEach(function (p, i) {
    p.location = LOCATIONS[i % LOCATIONS.length];
    if (SIZE_SETS[p.category]) p.sizes = SIZE_SETS[p.category];
  });

  /* ---------------- Country / phone system ----------------
     Single source of truth for the country dropdown and phone
     dial-code rules, shared by login.html (signup) and
     settings.html (profile) so both behave identically. */
  var PHONE_RULES = {
    "Cameroon":       { code: "237", nsn: [9, 9],   example: "+237 6XX XXX XXX" },
    "Nigeria":        { code: "234", nsn: [10, 10], example: "+234 8XX XXX XXXX" },
    "Ghana":          { code: "233", nsn: [9, 9],   example: "+233 2X XXX XXXX" },
    "Kenya":          { code: "254", nsn: [9, 9],   example: "+254 7XX XXX XXX" },
    "South Africa":   { code: "27",  nsn: [9, 9],   example: "+27 6X XXX XXXX" },
    "Senegal":        { code: "221", nsn: [9, 9],   example: "+221 7X XXX XX XX" },
    "Côte d'Ivoire":  { code: "225", nsn: [10, 10], example: "+225 07 XX XX XX XX" },
    "United States":  { code: "1",   nsn: [10, 10], example: "+1 XXX XXX XXXX" },
    "United Kingdom": { code: "44",  nsn: [10, 10], example: "+44 7XXX XXXXXX" },
    "France":         { code: "33",  nsn: [9, 9],   example: "+33 6 XX XX XX XX" }
  };
  // Order drives the <option> order everywhere the dropdown is built.
  var COUNTRIES = ["Cameroon", "Nigeria", "Ghana", "Kenya", "South Africa", "Senegal", "Côte d'Ivoire", "United States", "United Kingdom", "France", "Other"];

  function countryOptionsHTML(selected) {
    var html = '<option value="" disabled' + (selected ? "" : " selected") + ' hidden>Select country</option>';
    COUNTRIES.forEach(function (c) {
      html += '<option' + (c === selected ? " selected" : "") + ">" + c + "</option>";
    });
    return html;
  }

  function phoneHintFor(country) {
    var rule = PHONE_RULES[country];
    return rule ? "Include the country code, e.g. " + rule.example : "Include the country code, e.g. +XXX XXXXXXXXX";
  }

  function phonePlaceholderFor(country) {
    var rule = PHONE_RULES[country];
    return rule ? rule.example : "+XXX XXXXXXXXX";
  }

  function validatePhoneNumber(raw) {
    var v = (raw || "").trim();
    if (v === "") return { ok: false, msg: "Enter your phone number" };
    if (v[0] !== "+") return { ok: false, msg: "Start with a country code, e.g. +237" };
    var digits = v.slice(1).replace(/\D/g, "");
    if (digits.length < 8) return { ok: false, msg: "That number looks too short" };
    if (digits.length > 15) return { ok: false, msg: "That number looks too long" };
    return { ok: true, msg: "" };
  }

  /* Wires a phone <input> + country <select> pair together: keeps only
     "+"/digits/spaces, auto-inserts the selected country's dial code the
     moment the person starts typing, and keeps the hint/placeholder in
     sync. Returns an `updateHint()` you can call after setting the
     country programmatically (e.g. when pre-filling a saved profile). */
  function attachPhoneField(phoneInput, countrySelect, hintEl) {
    if (!phoneInput) return { updateHint: function () {} };

    function updateHint() {
      var country = countrySelect ? countrySelect.value : "";
      if (hintEl) hintEl.textContent = phoneHintFor(country);
      phoneInput.placeholder = phonePlaceholderFor(country);
    }

    phoneInput.addEventListener("input", function () {
      var v = this.value;
      v = v.replace(/(?!^)[^\d\s]/g, "").replace(/^[^\d+]/, "");
      if (v && v[0] !== "+" && /\d/.test(v[0])) {
        var rule = PHONE_RULES[countrySelect ? countrySelect.value : ""];
        v = "+" + (rule ? rule.code : "") + (rule ? " " : "") + v;
      }
      this.value = v;
    });

    if (countrySelect) countrySelect.addEventListener("change", updateHint);
    updateHint();
    return { updateHint: updateHint };
  }

  function getProduct(id) {
    for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i];
    return null;
  }

  /* ---------------- Small helpers ---------------- */
  function readJSON(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v === null || v === undefined ? fallback : v;
    } catch (e) { return fallback; }
  }
  function writeJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  function fcfa(n) {
    n = Math.round(Number(n) || 0);
    return n.toLocaleString("en-US").replace(/,/g, " ") + " FCFA";
  }
  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 900 + 100);
  }

  /* ---------------- User ---------------- */
  function getCurrentUser() { return readJSON(K_USER, null); }
  function getUsers() { return readJSON(K_USERS, []); }
  function saveUsers(list) { writeJSON(K_USERS, list); }
  function setCurrentUser(user) {
    writeJSON(K_USER, user);
    var users = getUsers();
    var idx = users.findIndex(function (u) {
      return (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase()) ||
             (u.username && user.username && u.username.toLowerCase() === user.username.toLowerCase());
    });
    if (idx > -1) users[idx] = user; else users.push(user);
    saveUsers(users);
  }
  function logout() {
    localStorage.removeItem(K_USER);
    window.location.href = liftUrl("login.html");
  }
  function userLabel(u) { return (u && (u.first || u.username || u.email)) || "there"; }
  function userInitial(u) {
    var s = (u && (u.first || u.username || u.email) || "").trim();
    return s ? s.charAt(0).toUpperCase() : "?";
  }
  function setAvatar(dataUrl) {
    var u = getCurrentUser();
    if (!u) return;
    u.avatar = dataUrl;
    setCurrentUser(u);
    renderAccountMenu();
  }
  function setBanner(dataUrl) {
    var u = getCurrentUser();
    if (!u) return;
    u.banner = dataUrl;
    setCurrentUser(u);
  }
  /* Reads a File from an <input type="file"> into a base64 data URL,
     downscaling large images first so localStorage doesn't fill up. */
  function readImageFile(file, maxDim, callback) {
    if (!file || !/^image\//.test(file.type)) { callback(null); return; }
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height;
        var scale = Math.min(1, (maxDim || 900) / Math.max(w, h));
        var cw = Math.round(w * scale), ch = Math.round(h * scale);
        var canvas = document.createElement("canvas");
        canvas.width = cw; canvas.height = ch;
        canvas.getContext("2d").drawImage(img, 0, 0, cw, ch);
        try { callback(canvas.toDataURL("image/jpeg", 0.85)); }
        catch (e) { callback(reader.result); }
      };
      img.onerror = function () { callback(reader.result); };
      img.src = reader.result;
    };
    reader.onerror = function () { callback(null); };
    reader.readAsDataURL(file);
  }

  /* ---------------- Cart ---------------- */
  var COUPONS = { LIFT10: 0.10, WELCOME5: 0.05 };

  function getCartState() {
    var st = readJSON(K_CART, { items: [], coupon: null });
    if (!st.items) st.items = [];
    return st;
  }
  function saveCartState(st) { writeJSON(K_CART, st); refreshCartBadge(); }

  function cartAdd(id, qty) {
    qty = qty || 1;
    var st = getCartState();
    var line = st.items.find(function (l) { return l.id === id; });
    if (line) line.qty += qty; else st.items.push({ id: id, qty: qty });
    saveCartState(st);
    return st;
  }
  function cartSetQty(id, qty) {
    var st = getCartState();
    qty = Math.max(0, qty | 0);
    if (qty === 0) { st.items = st.items.filter(function (l) { return l.id !== id; }); }
    else {
      var line = st.items.find(function (l) { return l.id === id; });
      if (line) line.qty = qty; else st.items.push({ id: id, qty: qty });
    }
    saveCartState(st);
    return st;
  }
  function cartRemove(id) {
    var st = getCartState();
    st.items = st.items.filter(function (l) { return l.id !== id; });
    saveCartState(st);
    return st;
  }
  function cartClear() { saveCartState({ items: [], coupon: null }); }
  function cartApplyCoupon(code) {
    var st = getCartState();
    var clean = (code || "").trim().toUpperCase();
    if (COUPONS.hasOwnProperty(clean)) { st.coupon = clean; saveCartState(st); return { ok: true, rate: COUPONS[clean] }; }
    st.coupon = null; saveCartState(st);
    return { ok: false };
  }
  function cartLines() {
    var st = getCartState();
    return st.items.map(function (l) {
      var p = getProduct(l.id);
      if (!p) return null;
      return { id: p.id, name: p.name, price: p.price, img: p.img, qty: l.qty, lineTotal: p.price * l.qty };
    }).filter(Boolean);
  }
  function cartTotals() {
    var lines = cartLines();
    var st = getCartState();
    var subtotal = lines.reduce(function (s, l) { return s + l.lineTotal; }, 0);
    var rate = (st.coupon && COUPONS[st.coupon]) || 0;
    var discount = Math.round(subtotal * rate);
    var count = lines.reduce(function (s, l) { return s + l.qty; }, 0);
    return { lines: lines, subtotal: subtotal, discount: discount, coupon: st.coupon,
             total: Math.max(0, subtotal - discount), count: count };
  }

  function refreshCartBadge() {
    var n = cartTotals().count;
    document.querySelectorAll(".lift-cart-count").forEach(function (el) {
      el.textContent = n;
      el.classList.toggle("is-empty", n === 0);
    });
  }

  /* ---------------- Orders ---------------- */
  function getOrders() {
    var u = getCurrentUser();
    var all = readJSON(K_ORDERS, []);
    if (!u) return [];
    var owner = (u.email || u.username || "").toLowerCase();
    return all.filter(function (o) { return o.owner === owner; })
              .sort(function (a, b) { return b.createdAt - a.createdAt; });
  }
  function saveAllOrders(list) { writeJSON(K_ORDERS, list); }

  function createOrder(payload) {
    var u = getCurrentUser();
    var owner = u ? (u.email || u.username || "").toLowerCase() : "guest";
    var totals = cartTotals();
    var order = {
      id: uid("LIFT"),
      owner: owner,
      createdAt: Date.now(),
      items: totals.lines,
      subtotal: totals.subtotal,
      discount: totals.discount,
      total: totals.total,
      method: payload.method,
      phone: payload.phone,
      cancelled: false
    };
    var all = readJSON(K_ORDERS, []);
    all.push(order);
    saveAllOrders(all);
    cartClear();
    writeJSON("lift_last_order", order.id);
    notify(owner, "order", "Your order " + order.id + " has been placed — " + fcfa(order.total), "orders.html");
    return order;
  }

  /* Statuses are derived from elapsed time so the demo feels alive
     without needing a real fulfillment backend. */
  function orderStatus(order) {
    if (order.cancelled) return "Cancelled";
    var mins = (Date.now() - order.createdAt) / 60000;
    if (mins < 1) return "Processing";
    if (mins < 3) return "Shipped";
    return "Delivered";
  }
  function cancelOrder(orderId) {
    var all = readJSON(K_ORDERS, []);
    var o = all.find(function (x) { return x.id === orderId; });
    if (o && orderStatus(o) === "Processing") { o.cancelled = true; saveAllOrders(all); return true; }
    return false;
  }

  /* ---------------- Social: follow / followers ---------------- */
  function userKey(u) {
    if (!u) return null;
    return (u.email || u.username || "").toLowerCase() || null;
  }
  function displayNameFor(key) {
    var users = getUsers();
    var match = users.find(function (u) { return userKey(u) === key; });
    return match ? userLabel(match) : key;
  }
  function getFollowMap() { return readJSON(K_FOLLOWS, {}); }
  function saveFollowMap(map) { writeJSON(K_FOLLOWS, map); refreshFollowBadges(); }

  function listOtherUsers() {
    var me = userKey(getCurrentUser());
    return getUsers()
      .filter(function (u) { return userKey(u) && userKey(u) !== me; })
      .map(function (u) {
        var key = userKey(u);
        return { key: key, name: userLabel(u), initial: userInitial(u), role: u.role || "LIFT Shopper" };
      });
  }
  function isFollowing(targetKey) {
    var me = userKey(getCurrentUser());
    if (!me) return false;
    var map = getFollowMap();
    return (map[me] || []).indexOf(targetKey) > -1;
  }
  function follow(targetKey) {
    var me = userKey(getCurrentUser());
    if (!me || !targetKey || me === targetKey) return;
    var map = getFollowMap();
    map[me] = map[me] || [];
    if (map[me].indexOf(targetKey) === -1) {
      map[me].push(targetKey);
      notify(targetKey, "follow", displayNameFor(me) + " started following you", "people.html");
    }
    saveFollowMap(map);
  }
  function unfollow(targetKey) {
    var me = userKey(getCurrentUser());
    if (!me) return;
    var map = getFollowMap();
    map[me] = (map[me] || []).filter(function (k) { return k !== targetKey; });
    saveFollowMap(map);
  }
  function followingList(ownerKey) {
    ownerKey = ownerKey || userKey(getCurrentUser());
    if (!ownerKey) return [];
    var map = getFollowMap();
    return (map[ownerKey] || []).map(function (key) {
      var match = getUsers().find(function (u) { return userKey(u) === key; });
      return { key: key, name: match ? userLabel(match) : key, initial: match ? userInitial(match) : "?", avatar: match ? match.avatar : null, role: match ? (match.role || "LIFT Shopper") : "" };
    });
  }
  function followersList(ownerKey) {
    ownerKey = ownerKey || userKey(getCurrentUser());
    if (!ownerKey) return [];
    var map = getFollowMap();
    var keys = Object.keys(map).filter(function (follower) { return (map[follower] || []).indexOf(ownerKey) > -1; });
    return keys.map(function (key) {
      var match = getUsers().find(function (u) { return userKey(u) === key; });
      return { key: key, name: match ? userLabel(match) : key, initial: match ? userInitial(match) : "?", avatar: match ? match.avatar : null, role: match ? (match.role || "LIFT Shopper") : "" };
    });
  }
  function followersCount(ownerKey) {
    ownerKey = ownerKey || userKey(getCurrentUser());
    if (!ownerKey) return 0;
    var map = getFollowMap();
    var n = 0;
    Object.keys(map).forEach(function (follower) { if ((map[follower] || []).indexOf(ownerKey) > -1) n++; });
    return n;
  }
  function followingCount(ownerKey) {
    ownerKey = ownerKey || userKey(getCurrentUser());
    if (!ownerKey) return 0;
    return (getFollowMap()[ownerKey] || []).length;
  }
  function refreshFollowBadges() {
    document.querySelectorAll(".lift-following-count").forEach(function (el) { el.textContent = followingCount(); });
    document.querySelectorAll(".lift-followers-count").forEach(function (el) { el.textContent = followersCount(); });
  }

  /* ---------------- Messaging ---------------- */
  function allMessages() { return readJSON(K_MESSAGES, []); }
  function saveAllMessages(list) { writeJSON(K_MESSAGES, list); refreshMsgBadge(); }

  function sendMessage(toKey, text) {
    var me = userKey(getCurrentUser());
    text = (text || "").trim();
    if (!me || !toKey || !text) return null;
    var msg = { id: uid("MSG"), from: me, to: toKey, text: text, at: Date.now(), read: false };
    var all = allMessages();
    all.push(msg);
    saveAllMessages(all);
    notify(toKey, "message", displayNameFor(me) + " sent you a message", "messages.html?to=" + encodeURIComponent(me));
    return msg;
  }
  function conversationWith(otherKey) {
    var me = userKey(getCurrentUser());
    if (!me) return [];
    return allMessages()
      .filter(function (m) {
        return (m.from === me && m.to === otherKey) || (m.from === otherKey && m.to === me);
      })
      .sort(function (a, b) { return a.at - b.at; });
  }
  function markThreadRead(otherKey) {
    var me = userKey(getCurrentUser());
    if (!me) return;
    var all = allMessages();
    var changed = false;
    all.forEach(function (m) {
      if (m.to === me && m.from === otherKey && !m.read) { m.read = true; changed = true; }
    });
    if (changed) saveAllMessages(all);
  }
  function inboxThreads() {
    var me = userKey(getCurrentUser());
    if (!me) return [];
    var byOther = {};
    allMessages().forEach(function (m) {
      if (m.from !== me && m.to !== me) return;
      var other = m.from === me ? m.to : m.from;
      byOther[other] = byOther[other] || [];
      byOther[other].push(m);
    });
    return Object.keys(byOther).map(function (other) {
      var thread = byOther[other].sort(function (a, b) { return a.at - b.at; });
      var last = thread[thread.length - 1];
      var unread = thread.filter(function (m) { return m.to === me && !m.read; }).length;
      return { key: other, name: displayNameFor(other), lastText: last.text, lastAt: last.at, unread: unread };
    }).sort(function (a, b) { return b.lastAt - a.lastAt; });
  }
  function unreadMessageCount() {
    var me = userKey(getCurrentUser());
    if (!me) return 0;
    return allMessages().filter(function (m) { return m.to === me && !m.read; }).length;
  }
  function refreshMsgBadge() {
    var n = unreadMessageCount();
    document.querySelectorAll(".lift-msg-count").forEach(function (el) {
      el.textContent = n;
      el.classList.toggle("is-empty", n === 0);
    });
  }

  /* ---------------- Feed: announcements / product & purchase publicity ---------------- */
  function allPosts() { return readJSON(K_POSTS, []); }
  function savePosts(list) { writeJSON(K_POSTS, list); }

  /* type: "announcement" | "product" | "purchase"
     payload: { type, text, productId?, img? } */
  function createPost(payload) {
    var u = getCurrentUser();
    var me = userKey(u);
    if (!me) return null;
    var text = (payload.text || "").trim();
    if (!text && !payload.productId && !payload.img) return null;
    var post = {
      id: uid("POST"),
      authorKey: me,
      authorName: userLabel(u),
      authorInitial: userInitial(u),
      authorAvatar: u.avatar || null,
      type: payload.type || "announcement",
      text: text,
      productId: payload.productId || null,
      img: payload.img || null,
      likes: [],
      comments: [],
      createdAt: Date.now()
    };
    var all = allPosts();
    all.push(post);
    savePosts(all);
    return post;
  }
  function listFeed() {
    return allPosts().sort(function (a, b) { return b.createdAt - a.createdAt; });
  }
  function listFeedByAuthor(key) {
    return listFeed().filter(function (p) { return p.authorKey === key; });
  }
  function getPost(id) {
    return allPosts().find(function (p) { return p.id === id; }) || null;
  }
  function toggleLike(postId) {
    var me = userKey(getCurrentUser());
    if (!me) return null;
    var all = allPosts();
    var post = all.find(function (p) { return p.id === postId; });
    if (!post) return null;
    var idx = post.likes.indexOf(me);
    if (idx > -1) {
      post.likes.splice(idx, 1);
    } else {
      post.likes.push(me);
      if (post.authorKey !== me) notify(post.authorKey, "like", displayNameFor(me) + " liked your post", "profile.html");
    }
    savePosts(all);
    return post;
  }
  function isLikedByMe(post) {
    var me = userKey(getCurrentUser());
    return !!(me && post && post.likes && post.likes.indexOf(me) > -1);
  }
  function addComment(postId, text) {
    var u = getCurrentUser();
    var me = userKey(u);
    text = (text || "").trim();
    if (!me || !text) return null;
    var all = allPosts();
    var post = all.find(function (p) { return p.id === postId; });
    if (!post) return null;
    var comment = { authorKey: me, authorName: userLabel(u), text: text, at: Date.now() };
    post.comments.push(comment);
    savePosts(all);
    if (post.authorKey !== me) notify(post.authorKey, "comment", displayNameFor(me) + " commented on your post", "profile.html");
    return comment;
  }
  function removePost(postId) {
    var me = userKey(getCurrentUser());
    var all = allPosts();
    var post = all.find(function (p) { return p.id === postId; });
    if (!post || post.authorKey !== me) return false;
    savePosts(all.filter(function (p) { return p.id !== postId; }));
    return true;
  }

  /* ---------------- Notifications ---------------- */
  function allNotifs() { return readJSON(K_NOTIFS, []); }
  function saveNotifs(list) { writeJSON(K_NOTIFS, list); refreshNotifBadge(); }

  /* type: "follow" | "like" | "comment" | "order" | "message" */
  function notify(forKey, type, text, link) {
    if (!forKey) return null;
    var n = { id: uid("NOTIF"), forKey: forKey, type: type, text: text, link: link || null, read: false, createdAt: Date.now() };
    var all = allNotifs();
    all.push(n);
    if (all.length > 300) all = all.slice(all.length - 300); // keep storage bounded
    saveNotifs(all);
    return n;
  }
  function listNotifications() {
    var me = userKey(getCurrentUser());
    if (!me) return [];
    return allNotifs().filter(function (n) { return n.forKey === me; })
      .sort(function (a, b) { return b.createdAt - a.createdAt; });
  }
  function unreadNotifCount() {
    return listNotifications().filter(function (n) { return !n.read; }).length;
  }
  function markNotifRead(id) {
    var all = allNotifs();
    var n = all.find(function (x) { return x.id === id; });
    if (n && !n.read) { n.read = true; saveNotifs(all); }
  }
  function markAllNotifsRead() {
    var me = userKey(getCurrentUser());
    if (!me) return;
    var all = allNotifs();
    var changed = false;
    all.forEach(function (n) { if (n.forKey === me && !n.read) { n.read = true; changed = true; } });
    if (changed) saveNotifs(all);
  }
  function refreshNotifBadge() {
    var n = unreadNotifCount();
    document.querySelectorAll(".lift-notif-count").forEach(function (el) {
      el.textContent = n;
      el.classList.toggle("is-empty", n === 0);
    });
  }

  /* ---------------- Toast ---------------- */
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById("lift-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "lift-toast";
      el.id = "lift-toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 2400);
  }

  function requireLogin(message) {
    if (getCurrentUser()) return true;
    toast(message || "Please log in to continue");
    setTimeout(function () { window.location.href = loginUrl("#login"); }, 900);
    return false;
  }

  /* ---------------- Header / Footer markup ---------------- */
  var ICONS = {
    'truck': '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/> <path d="M15 18H9"/> <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/> <circle cx="17" cy="18" r="2"/> <circle cx="7" cy="18" r="2"/>',
    'map-pin': '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/> <circle cx="12" cy="10" r="3"/>',
    'credit-card': '<rect width="20" height="14" x="2" y="5" rx="2"/> <line x1="2" x2="22" y1="10" y2="10"/>',
    'headphones': '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
    'lock': '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/> <path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'shirt': '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>',
    'footprints': '<path d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/> <path d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/> <path d="M16 17h4"/> <path d="M4 13h4"/>',
    'monitor': '<rect width="20" height="14" x="2" y="3" rx="2"/> <line x1="8" x2="16" y1="21" y2="21"/> <line x1="12" x2="12" y1="17" y2="21"/>',
    'handbag': '<path d="M2.048 18.566A2 2 0 0 0 4 21h16a2 2 0 0 0 1.952-2.434l-2-9A2 2 0 0 0 18 8H6a2 2 0 0 0-1.952 1.566z"/> <path d="M8 11V6a4 4 0 0 1 8 0v5"/>',
    'gem': '<path d="M10.5 3 8 9l4 13 4-13-2.5-6"/> <path d="M17 3a2 2 0 0 1 1.6.8l3 4a2 2 0 0 1 .013 2.382l-7.99 10.986a2 2 0 0 1-3.247 0l-7.99-10.986A2 2 0 0 1 2.4 7.8l2.998-3.997A2 2 0 0 1 7 3z"/> <path d="M2 9h20"/>',
    'shopping-bag': '<path d="M16 10a4 4 0 0 1-8 0"/> <path d="M3.103 6.034h17.794"/> <path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"/>',
    'package': '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/> <path d="M12 22V12"/> <polyline points="3.29 7 12 12 20.71 7"/> <path d="m7.5 4.27 9 5.15"/>',
    'circle-check-big': '<path d="M21.801 10A10 10 0 1 1 17 3.335"/> <path d="m9 11 3 3L22 4"/>',
    'hourglass': '<path d="M5 22h14"/> <path d="M5 2h14"/> <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/> <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
    'shopping-cart': '<circle cx="8" cy="21" r="1"/> <circle cx="19" cy="21" r="1"/> <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
    'dollar-sign': '<line x1="12" x2="12" y1="2" y2="22"/> <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    'tag': '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/> <circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/> <path d="M16 3.128a4 4 0 0 1 0 7.744"/> <path d="M22 21v-2a4 4 0 0 0-3-3.87"/> <circle cx="9" cy="7" r="4"/>',
    'plus': '<path d="M5 12h14"/> <path d="M12 5v14"/>',
    'megaphone': '<path d="M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/> <path d="M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14"/> <path d="M8 6v8"/>',
    'newspaper': '<path d="M15 18h-5"/> <path d="M18 14h-8"/> <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0v-9a2 2 0 0 1 2-2h2"/> <rect width="8" height="4" x="10" y="6" rx="1"/>',
    'receipt': '<path d="M12 17V7"/> <path d="M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"/> <path d="M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"/>',
    'message-circle': '<path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>',
    'hand': '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/> <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/> <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/> <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    'mail': '<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"/> <rect x="2" y="4" width="20" height="16" rx="2"/>',
    'bell': '<path d="M10.268 21a2 2 0 0 0 3.464 0"/> <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/>',
    'heart': '<path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"/>',
    'search': '<path d="m21 21-4.34-4.34"/> <circle cx="11" cy="11" r="8"/>',
    'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/> <circle cx="12" cy="7" r="4"/>',
    'users-round': '<path d="M18 21a8 8 0 0 0-16 0"/> <circle cx="10" cy="8" r="5"/> <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3"/>',
    'volume-2': '<path d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z"/> <path d="M16 9a5 5 0 0 1 0 6"/> <path d="M19.364 18.364a9 9 0 0 0 0-12.728"/>',
  };

  function icon(name, cls){
    var d = ICONS[name] || ICONS['tag'];
    return '<svg class="lift-icon' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  var ACCOUNT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  var CHEVRON_ICON = '<svg class="lift-account-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
  var SUN_ICON = '<svg class="lh-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  var MOON_ICON = '<svg class="lh-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>';

  function headerTemplate() {
    return (
      '<div class="lift-nav-wrap">' +
        '<a href="' + liftUrl("index.html") + '" class="lift-brand"><span class="lift-brand-mark">L</span>LIFT</a>' +
        '<nav class="lift-primary-nav" id="liftPrimaryNav">' +
          '<a href="' + liftUrl("index.html") + '" data-page="home">Home</a>' +
          '<a href="' + liftUrl("products.html") + '" data-page="products">Products</a>' +
          '<a href="' + liftUrl("marketplace.html") + '" data-page="marketplace">Marketplace</a>' +
          '<a href="' + liftUrl("ourservices.html") + '" data-page="services">Our Services</a>' +
          '<a href="' + liftUrl("how-it-works.html") + '" data-page="how-it-works">How It Works</a>' +
          '<a href="' + liftUrl("about.html") + '" data-page="about">About Us</a>' +
          '<a href="' + liftUrl("contact.html") + '" data-page="contact">Contact</a>' +
        '</nav>' +
        '<div class="lift-icons">' +
          '<button class="lift-icon-btn" id="liftSearchToggle" aria-label="Search" title="Search">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '</button>' +
          '<button class="lift-theme-toggle" id="liftThemeToggle" aria-label="Toggle dark mode" title="Toggle dark mode">' +
            SUN_ICON + MOON_ICON +
          '</button>' +
          '<div class="lift-notif-wrap">' +
            '<button class="lift-icon-btn" id="liftNotifToggle" aria-label="Notifications" title="Notifications">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 6 2 7H4c.5-1 2-3 2-7Z"/><path d="M10.5 21a1.5 1.5 0 0 0 3 0"/></svg>' +
              '<span class="lift-badge-count lift-notif-count is-empty" id="liftNotifCount">0</span>' +
            '</button>' +
            '<div class="lift-notif-panel" id="liftNotifPanel">' +
              '<div class="lift-notif-head"><span>Notifications</span><button type="button" id="liftNotifMarkAll">Mark all read</button></div>' +
              '<div class="lift-notif-list" id="liftNotifList"></div>' +
            '</div>' +
          '</div>' +
          '<a href="' + liftUrl("messages.html") + '" class="lift-icon-btn" id="liftMsgToggle" aria-label="Messages" title="Messages">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
            '<span class="lift-badge-count lift-msg-count is-empty" id="liftMsgCount">0</span>' +
          '</a>' +
          '<a href="' + liftUrl("cart.html") + '" class="lift-icon-btn" id="liftCartToggle" aria-label="Cart" title="Cart">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>' +
            '<span class="lift-badge-count lift-cart-count is-empty" id="liftCartCount">0</span>' +
          '</a>' +
          '<div class="lift-account-wrap">' +
            '<button class="lift-icon-btn lift-account-toggle-inner" id="liftAccountToggle" aria-label="Account menu" title="Account">' + ACCOUNT_ICON + CHEVRON_ICON + '</button>' +
            '<div class="lift-account-menu" id="liftAccountMenu"></div>' +
          '</div>' +
          '<button class="lift-burger" id="liftBurger" aria-label="Open menu">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="lift-search-panel" id="liftSearchPanel">' +
        '<div class="lift-search-inner">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<input type="text" placeholder="Search for sneakers, laptops, jewelry…" id="liftSearchInput" autocomplete="off">' +
          '<button id="liftSearchClose" aria-label="Close search">&times;</button>' +
        '</div>' +
        '<div class="lift-search-results" id="liftSearchResults"></div>' +
      '</div>'
    );
  }

  /* ---------------- Theme (dark / light mode) ---------------- */
  var THEME_KEY = "lift-theme";

  function getStoredTheme() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }

  function applyTheme(theme) {
    if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  }

  function setTheme(theme) {
    applyTheme(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
  }

  function initTheme() {
    var stored = getStoredTheme();
    if (stored) { applyTheme(stored); return; }
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(prefersDark ? "dark" : "light");
  }

  // Apply immediately on script load (before header mounts) to avoid a flash of the wrong theme.
  initTheme();

  function footerTemplate() {
    var y = new Date().getFullYear();
    return (
      '<div class="lift-footer-top">' +
        '<div>' +
          '<a href="' + liftUrl("index.html") + '" class="lift-footer-logo">LIFT</a>' +
          '<p class="lift-footer-tag">Style for everyone — delivered fast, paid your way.</p>' +
        '</div>' +
        '<div class="lift-footer-contact">' +
          '<div class="lift-contact-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> Yaoundé, Cameroon</div>' +
          '<div class="lift-contact-row"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .7 3a2 2 0 0 1-.4 2.1L8 10.3a16 16 0 0 0 6 6l1.5-1.5a2 2 0 0 1 2.1-.4c1 .3 2 .5 3 .7a2 2 0 0 1 1.7 2Z"/></svg> +237 6 70 13 44 56</div>' +
        '</div>' +
        '<div>' +
          '<div class="lift-social-label">Follow us</div>' +
          '<div class="lift-social-icons">' +
            '<a href="#" data-toast="Facebook page coming soon">f</a>' +
            '<a href="#" data-toast="X / Twitter coming soon">t</a>' +
            '<a href="#" data-toast="Instagram coming soon">ig</a>' +
            '<a href="#" data-toast="LinkedIn coming soon">in</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="lift-footer-bottom">' +
        '<ul>' +
          '<li><a href="' + liftUrl("about.html") + '">About Us</a></li>' +
          '<li><a href="' + liftUrl("contact.html") + '">Contact Us</a></li>' +
          '<li><a href="' + liftUrl("how-it-works.html") + '">How It Works</a></li>' +
          '<li><a href="#" data-toast="Help center coming soon">Help</a></li>' +
          '<li><a href="#" data-toast="Privacy policy coming soon">Privacy Policy</a></li>' +
        '</ul>' +
        '<div>Copyright &copy; ' + y + ' Lift Media Inc.</div>' +
      '</div>'
    );
  }

  function renderAccountMenu() {
    var toggle = document.getElementById("liftAccountToggle");
    var menu = document.getElementById("liftAccountMenu");
    if (!toggle || !menu) return;
    var user = getCurrentUser();
    if (user) {
      toggle.innerHTML = user.avatar
        ? '<span class="lift-avatar-badge lift-avatar-img"><img src="' + user.avatar + '" alt=""></span>'
        : '<span class="lift-avatar-badge">' + escapeHTML(userInitial(user)) + '</span>';
      toggle.setAttribute("aria-label", "Account (" + userLabel(user) + ")");
      menu.innerHTML =
        '<div class="lift-account-greeting">Signed in as ' + escapeHTML(userLabel(user)) + '</div>' +
        '<a href="' + liftUrl("profile.html") + '">My profile</a>' +
        '<a href="' + liftUrl("orders.html") + '">My orders</a>' +
        '<a href="' + liftUrl("people.html") + '">Find people</a>' +
        '<a href="' + liftUrl("messages.html") + '">Messages</a>' +
        '<a href="' + liftUrl("settings.html") + '">Settings</a>' +
        '<button type="button" id="liftLogoutBtn">Log out</button>';
      var out = document.getElementById("liftLogoutBtn");
      if (out) out.addEventListener("click", function () { menu.classList.remove("open"); logout(); });
    } else {
      toggle.innerHTML = ACCOUNT_ICON;
      toggle.setAttribute("aria-label", "Account menu");
      menu.innerHTML =
        '<a href="' + loginUrl("#login") + '">Log in</a>' +
        '<a href="' + loginUrl() + '">Create account</a>';
    }
  }

  function mountHeader(activePage) {
    var host = document.getElementById("lift-header");
    if (!host) return;
    host.innerHTML = headerTemplate();

    // active nav state
    host.querySelectorAll(".lift-primary-nav a").forEach(function (a) {
      if (a.dataset.page === activePage) a.classList.add("active");
    });

    // mobile menu
    var burger = document.getElementById("liftBurger");
    var nav = document.getElementById("liftPrimaryNav");
    burger.addEventListener("click", function () { nav.classList.toggle("open"); });
    nav.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); }); });

    // theme toggle
    var themeToggle = document.getElementById("liftThemeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", function () {
        var isDark = document.documentElement.getAttribute("data-theme") === "dark";
        setTheme(isDark ? "light" : "dark");
      });
    }

    // account
    renderAccountMenu();
    var accToggle = document.getElementById("liftAccountToggle");
    var accMenu = document.getElementById("liftAccountMenu");
    var accWrap = accToggle ? accToggle.closest(".lift-account-wrap") : null;
    accToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      accMenu.classList.toggle("open");
      if (accWrap) accWrap.classList.toggle("open", accMenu.classList.contains("open"));
    });
    document.addEventListener("click", function () {
      accMenu.classList.remove("open");
      if (accWrap) accWrap.classList.remove("open");
    });

    // notifications
    var notifToggle = document.getElementById("liftNotifToggle");
    var notifPanel = document.getElementById("liftNotifPanel");
    var notifList = document.getElementById("liftNotifList");
    var notifMarkAll = document.getElementById("liftNotifMarkAll");

    var NOTIF_ICON = {
      follow: icon("user"), like: icon("heart"), comment: icon("message-circle"), order: icon("package"), message: icon("mail")
    };

    function renderNotifs() {
      var items = listNotifications();
      if (!items.length) {
        notifList.innerHTML = '<div class="lift-notif-empty">No notifications yet.</div>';
        return;
      }
      notifList.innerHTML = items.map(function (n) {
        var rel = Math.floor((Date.now() - n.createdAt) / 60000);
        var when = rel < 1 ? "just now" : rel < 60 ? rel + "m ago" : rel < 1440 ? Math.floor(rel / 60) + "h ago" : Math.floor(rel / 1440) + "d ago";
        return (
          '<a class="lift-notif-row' + (n.read ? "" : " unread") + '" href="' + liftUrl(n.link || "#") + '" data-id="' + n.id + '">' +
            '<span class="lift-notif-ic">' + (NOTIF_ICON[n.type] || icon("bell")) + '</span>' +
            '<span class="lift-notif-body"><span>' + escapeHTML(n.text) + '</span><small>' + when + '</small></span>' +
            (n.read ? "" : '<span class="lift-notif-dot"></span>') +
          '</a>'
        );
      }).join("");
    }

    notifToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      notifPanel.classList.toggle("open");
      if (notifPanel.classList.contains("open")) renderNotifs();
    });
    notifMarkAll.addEventListener("click", function (e) {
      e.stopPropagation();
      markAllNotifsRead();
      renderNotifs();
    });
    notifList.addEventListener("click", function (e) {
      var row = e.target.closest(".lift-notif-row");
      if (row) markNotifRead(row.dataset.id);
    });
    document.addEventListener("click", function () { notifPanel.classList.remove("open"); });

    // search
    var searchToggle = document.getElementById("liftSearchToggle");
    var searchPanel = document.getElementById("liftSearchPanel");
    var searchInput = document.getElementById("liftSearchInput");
    var searchResults = document.getElementById("liftSearchResults");
    var searchClose = document.getElementById("liftSearchClose");

    function renderResults(q) {
      q = (q || "").trim().toLowerCase();
      if (!q) {
        var cats = Array.from(new Set(CATALOG.map(function (p) { return p.category; })));
        searchResults.innerHTML =
          '<div class="lift-search-hint">Try “sneakers”, “laptop”, “jewelry”…</div>' +
          '<div class="lift-search-cats-label">Browse by category</div>' +
          '<div class="lift-search-cats">' +
            cats.map(function (c) {
              return '<a class="lift-search-cat-chip" href="' + liftUrl("products.html?category=" + encodeURIComponent(c)) + '">' + escapeHTML(c) + '</a>';
            }).join("") +
          '</div>';
        return;
      }
      var matches = CATALOG.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) > -1 || p.category.toLowerCase().indexOf(q) > -1;
      }).slice(0, 6);
      if (!matches.length) {
        searchResults.innerHTML = '<div class="lift-search-hint">No products match “' + escapeHTML(q) + '”.</div>';
        return;
      }
      searchResults.innerHTML = matches.map(function (p) {
        return (
          '<div class="lift-search-row">' +
            '<a class="lift-search-row-main" href="' + liftUrl("products.html?q=" + encodeURIComponent(p.name)) + '">' +
              '<img src="' + p.img + '" alt="' + escapeHTML(p.name) + '">' +
              '<span><strong>' + escapeHTML(p.name) + '</strong><small>' + p.category + ' · ' + fcfa(p.price) + '</small></span>' +
            '</a>' +
            '<button class="lift-search-add" data-id="' + p.id + '">Add</button>' +
          '</div>'
        );
      }).join("") + '<a class="lift-search-viewall" href="' + liftUrl("products.html?q=" + encodeURIComponent(q)) + '">See all results for “' + escapeHTML(q) + '” →</a>';
    }

    searchToggle.addEventListener("click", function () {
      searchPanel.classList.toggle("open");
      if (searchPanel.classList.contains("open")) {
        renderResults(searchInput.value);
        setTimeout(function () { searchInput.focus(); }, 120);
      }
    });
    searchClose.addEventListener("click", function () { searchPanel.classList.remove("open"); });
    searchInput.addEventListener("input", function () { renderResults(searchInput.value); });
    searchInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        var v = searchInput.value.trim();
        if (v) window.location.href = liftUrl("products.html?q=" + encodeURIComponent(v));
      }
      if (e.key === "Escape") searchPanel.classList.remove("open");
    });
    searchResults.addEventListener("click", function (e) {
      var btn = e.target.closest(".lift-search-add");
      if (btn) {
        cartAdd(btn.dataset.id, 1);
        toast(getProduct(btn.dataset.id).name + " added to cart");
      }
    });
    renderResults("");

    // footer-style toast links anywhere in the header
    host.querySelectorAll("[data-toast]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); toast(el.dataset.toast); });
    });

    refreshCartBadge();
    refreshMsgBadge();
    refreshNotifBadge();
  }

  function mountFooter() {
    var host = document.getElementById("lift-footer");
    if (!host) return;
    host.innerHTML = footerTemplate();
    host.querySelectorAll("[data-toast]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); toast(el.dataset.toast); });
    });
  }

  /* Global: any element with data-toast anywhere on the page shows a toast on click. */
  document.addEventListener("click", function (e) {
    var el = e.target.closest("[data-toast]");
    if (el && !el.closest("#lift-header") && !el.closest("#lift-footer")) {
      e.preventDefault();
      toast(el.getAttribute("data-toast"));
    }
  });

  /* ---------------- Public API ---------------- */
  window.LIFT = {
    CATALOG: CATALOG,
    LOCATIONS: LOCATIONS,
    phone: {
      COUNTRIES: COUNTRIES,
      RULES: PHONE_RULES,
      optionsHTML: countryOptionsHTML,
      hint: phoneHintFor,
      placeholder: phonePlaceholderFor,
      validate: validatePhoneNumber,
      attach: attachPhoneField
    },
    getProduct: getProduct,
    fcfa: fcfa,
    escapeHTML: escapeHTML,
    toast: toast,
    requireLogin: requireLogin,
    loginUrl: loginUrl,
    icon: icon,
    mountHeader: mountHeader,
    mountFooter: mountFooter,
    refreshCartBadge: refreshCartBadge,
    theme: { set: setTheme, init: initTheme, get: getStoredTheme },
    user: {
      get: getCurrentUser, set: setCurrentUser, logout: logout, label: userLabel, initial: userInitial, key: userKey,
      setAvatar: setAvatar, setBanner: setBanner, readImageFile: readImageFile
    },
    cart: {
      add: cartAdd, remove: cartRemove, setQty: cartSetQty, clear: cartClear,
      applyCoupon: cartApplyCoupon, lines: cartLines, totals: cartTotals, state: getCartState
    },
    orders: { create: createOrder, list: getOrders, status: orderStatus, cancel: cancelOrder },
    social: {
      listOtherUsers: listOtherUsers, isFollowing: isFollowing, follow: follow, unfollow: unfollow,
      followingList: followingList, followersList: followersList, followersCount: followersCount, followingCount: followingCount,
      displayNameFor: displayNameFor
    },
    messages: {
      send: sendMessage, conversationWith: conversationWith, inboxThreads: inboxThreads,
      markRead: markThreadRead, unreadCount: unreadMessageCount
    },
    feed: {
      create: createPost, list: listFeed, listByAuthor: listFeedByAuthor, get: getPost,
      toggleLike: toggleLike, isLiked: isLikedByMe, addComment: addComment, remove: removePost
    },
    notifications: {
      list: listNotifications, unreadCount: unreadNotifCount,
      markRead: markNotifRead, markAllRead: markAllNotifsRead, refresh: refreshNotifBadge
    }
  };

  document.addEventListener("DOMContentLoaded", function () { refreshCartBadge(); refreshMsgBadge(); refreshNotifBadge(); });
})(window, document);
