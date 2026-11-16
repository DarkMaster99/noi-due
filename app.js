(function () {
  'use strict';
  if (window.top !== window.self) { document.documentElement.innerHTML = ''; return; }

  var RE = /^https:\/\/script\.google\.com\/(?:a\/[A-Za-z0-9.-]+\/)?macros\/s\/[A-Za-z0-9_-]{20,}\/exec$/;
  var FROM = /^https:\/\/[a-z0-9-]+-script\.googleusercontent\.com$/;
  var $ = function (id) { return document.getElementById(id); };
  var get = function (k) { try { return localStorage.getItem('nd.' + k) || ''; } catch (e) { return ''; } };
  var set = function (k, v) { try { if (v) localStorage.setItem('nd.' + k, v); else localStorage.removeItem('nd.' + k); } catch (e) {} };
  var ios = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var timer = null, ok = false;

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(function () {});

  var qs = new URLSearchParams(location.search);
  if (qs.has('cambia')) { set('link', ''); set('modo', ''); history.replaceState(null, '', location.pathname); }

  function setup() {
    $('setup').hidden = false;
    var inp = $('link');
    var save = function () {
      var v = inp.value.trim().replace(/\?.*$/, '').replace(/#.*$/, '');
      if (!RE.test(v)) { $('err').hidden = false; inp.focus(); return; }
      set('link', v); $('setup').hidden = true; open(v);
    };
    $('save').onclick = save;
    inp.onkeydown = function (e) { if (e.key === 'Enter') save(); };
    inp.oninput = function () { $('err').hidden = true; };
  }

  function direct(link, auto) {
    $('app').hidden = true; $('help').hidden = true; $('direct').hidden = false;
    $('go').onclick = function () { location.href = link; };
    $('inside').onclick = function () { set('modo', 'dentro'); $('direct').hidden = true; inside(link); };
    if (auto && !sessionStorage.getItem('nd.aperta')) { sessionStorage.setItem('nd.aperta', '1'); location.href = link; }
  }

  function inside(link) {
    var fr = $('app');
    ok = false; $('help').hidden = true;
    fr.hidden = false;
    fr.src = link;
    clearTimeout(timer);
    timer = setTimeout(function () { if (!ok) $('help').hidden = false; }, 15000);
  }

  function open(link) {
    var modo = get('modo') || (ios ? 'diretto' : 'dentro');
    if (modo === 'diretto') direct(link, true); else inside(link);
  }
  window.addEventListener('message', function (e) {
    if (!FROM.test(e.origin) || typeof e.data !== 'string') return;
    if (e.data === 'noidue:ok') { ok = true; clearTimeout(timer); $('help').hidden = true; }
    else if (e.data === 'noidue:reload') location.reload();
  });
  $('out').onclick = function () { set('modo', 'diretto'); direct(get('link'), false); location.href = get('link'); };
  $('retry').onclick = function () { inside(get('link')); };

  var link = get('link');
  if (link && RE.test(link)) open(link); else setup();
})();
