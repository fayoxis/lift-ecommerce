/* Shared behaviour for about.html / contact.html / how-it-works.html */
(function () {
  function initReveal() {
    var items = document.querySelectorAll('.ip-reveal');
    if (!items.length) return;
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('in-view'); }, (i % 6) * 80);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { obs.observe(el); });
  }

  function initCardSpotlight() {
    document.querySelectorAll('.ip-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
    });
  }

  function initFAQ() {
    document.querySelectorAll('.ip-faq-item').forEach(function (item) {
      var q = item.querySelector('.ip-faq-q');
      if (!q) return;
      q.addEventListener('click', function () {
        var wasOpen = item.classList.contains('open');
        item.parentElement.querySelectorAll('.ip-faq-item').forEach(function (i) { i.classList.remove('open'); });
        if (!wasOpen) item.classList.add('open');
      });
    });
  }

  function initContactForm() {
    var form = document.getElementById('ipContactForm');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#ipName');
      var submitBtn = form.querySelector('button[type="submit"]');
      var original = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending…';
      setTimeout(function () {
        if (window.LIFT) {
          LIFT.toast('Thanks' + (name && name.value ? ', ' + name.value.split(' ')[0] : '') + '! We\u2019ll get back to you soon.');
        }
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = original;
      }, 700);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initCardSpotlight();
    initFAQ();
    initContactForm();
  });
})();
