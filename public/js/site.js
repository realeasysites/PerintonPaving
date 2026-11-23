(function () {
  // ---- Social links: fill in when the client confirms their pages. Empty = hidden.
  var SOCIAL = {
    facebook: '',
    instagram: '',
    google: '' // Google Business Profile / reviews link
  };
  var ICONS = {
    facebook: '<path d="M14 8V6.5c0-.7.5-1 1-1h2V2h-3c-3 0-4 2-4 4.5V8H8v3.5h2V22h4V11.5h2.7l.3-3.5z"/>',
    instagram: '<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM21.9 7c-.1-1.6-.4-3-1.6-4.2C19.1 1.5 17.6 1.2 16 1.1 14.4 1 9.6 1 8 1.1c-1.6.1-3 .4-4.2 1.6S2.2 5.4 2.1 7C2 8.6 2 13.4 2.1 15c.1 1.6.4 3 1.6 4.2 1.2 1.2 2.6 1.5 4.2 1.6 1.6.1 6.4.1 8 0 1.6-.1 3-.4 4.2-1.6 1.2-1.2 1.5-2.6 1.6-4.2.1-1.6.1-6.4.2-8z"/>',
    google: '<path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3zM12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22zM6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9zM12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.8 9.4 6 12 6z"/>'
  };
  var socialEl = document.getElementById('social');
  Object.keys(SOCIAL).forEach(function (k) {
    if (!SOCIAL[k]) return;
    var a = document.createElement('a');
    a.href = SOCIAL[k]; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', 'Perinton Paving on ' + k);
    a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + '</svg>';
    socialEl.appendChild(a);
  });

  // ---- Years in business + footer year
  var now = new Date();
  document.getElementById('years').textContent = now.getFullYear() - 1968;
  document.getElementById('yr').textContent = now.getFullYear();

  // ---- Season status (Apr 1 – Nov 30)
  var m = now.getMonth(); // 0 = Jan
  var inSeason = m >= 3 && m <= 10;
  var seasonEl = document.getElementById('season');
  var seasonText = document.getElementById('seasonText');
  if (inSeason) {
    var daysLeft = Math.ceil((new Date(now.getFullYear(), 10, 30, 23, 59) - now) / 864e5);
    seasonText.textContent = daysLeft <= 21
      ? 'Final ' + daysLeft + ' day' + (daysLeft === 1 ? '' : 's') + ' of paving season · Get on the spring list now'
      : 'Now paving · Free estimates · Season runs April 1 – November 30';
  } else {
    seasonEl.classList.add('is-off');
    seasonText.textContent = 'Off-season · Booking spring paving now — get a free estimate';
  }

  // ---- Mobile nav
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  function setNav(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setNav(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setNav(false); });

  // ---- Service links preselect the form
  document.querySelectorAll('[data-service]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = document.querySelector('input[name="service"][value="' + a.dataset.service + '"]');
      if (r) r.checked = true;
    });
  });

  // ---- Lightbox
  var items = Array.prototype.slice.call(document.querySelectorAll('#gallery .g'));
  var lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg'), lbCap = document.getElementById('lbCap');
  var idx = 0, lastFocus = null;
  function show(i) {
    idx = (i + items.length) % items.length;
    lbImg.src = items[idx].dataset.full;
    lbImg.alt = items[idx].querySelector('img').alt;
    lbCap.textContent = items[idx].dataset.cap;
  }
  function open(i) { lastFocus = document.activeElement; show(i); lb.hidden = false; document.getElementById('lbClose').focus(); }
  function close() { lb.hidden = true; lbImg.src = ''; if (lastFocus) lastFocus.focus(); }
  items.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function () { show(idx - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // ---- Muted job-site videos: load and play only when on screen
  var vids = document.querySelectorAll('video[data-src]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) {
          if (!v.src) { v.src = v.dataset.src; }
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: 0.25 });
    vids.forEach(function (v) { v.muted = true; io.observe(v); });
  } else {
    vids.forEach(function (v) { v.src = v.dataset.src; v.controls = true; });
  }

  // ---- Quote form
  var form = document.getElementById('quoteForm');
  var msg = document.getElementById('formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'form__msg'; msg.textContent = '';
    var data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.phone) {
      msg.className = 'form__msg err';
      msg.textContent = 'Please add your name and phone number.';
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; btn.textContent = 'Sending…';
    fetch('/api/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          msg.className = 'form__msg ok';
          msg.textContent = 'Got it, thanks! We\'ll reach out soon to set up your free estimate.';
        } else {
          msg.className = 'form__msg err';
          msg.textContent = res.error || 'Something went wrong. Please call 585-388-1090.';
        }
      })
      .catch(function () {
        msg.className = 'form__msg err';
        msg.textContent = 'Couldn\'t send right now. Please call 585-388-1090.';
      })
      .finally(function () { btn.disabled = false; btn.textContent = 'Request my free estimate'; });
  });
})();
