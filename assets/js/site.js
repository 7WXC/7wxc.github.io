(function () {
  var root = document.documentElement;
  document.querySelectorAll('.theme-toggle').forEach(function (button) {
    button.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      root.classList.toggle('light', !dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  });
  var menu = document.querySelector('.mobile-menu-panel');
  var menuButton = document.querySelector('.menu-toggle');
  if (menu && menuButton) {
    menuButton.addEventListener('click', function () { menu.classList.toggle('is-open'); });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('is-open'); }); });
  }
  var reveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) { entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { threshold: .08 });
    reveal.forEach(function (el) { observer.observe(el); });
  } else { reveal.forEach(function (el) { el.classList.add('is-visible'); }); }
  document.querySelectorAll('[data-toggle-collapsible]').forEach(function (button) {
    var section = button.closest('section');
    var list = section && section.querySelector('[data-collapsible]');
    if (!list) return;
    var hiddenItems = Array.prototype.slice.call(list.querySelectorAll('.collapsible-item.is-collapsed'));
    if (!hiddenItems.length) { button.hidden = true; return; }
    var expanded = false;
    button.addEventListener('click', function () {
      expanded = !expanded;
      hiddenItems.forEach(function (item) { item.classList.toggle('is-collapsed', !expanded); });
      button.textContent = expanded ? button.dataset.less : button.dataset.more;
      button.setAttribute('aria-expanded', String(expanded));
    });
    button.setAttribute('aria-expanded', 'false');
  });
  var visitorCount = document.querySelector('[data-visitor-count]');
  if (visitorCount) {
    var counterBase = 'https://api.counterapi.dev/v1/wei-shao-personal-homepage/visitors';
    var countedKey = 'wei-shao-visitor-counted';
    var cachedKey = 'wei-shao-last-visitor-count';
    var initialCount = 79;
    var localHostnames = ['localhost', '127.0.0.1', '0.0.0.0'];
    var isLocalPreview = localHostnames.indexOf(window.location.hostname) !== -1;
    var isSitePage = window.location.pathname.indexOf('/assets/') !== 0;
    var isAutomated = navigator.webdriver || /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headless/i.test(navigator.userAgent);
    function localDateKey(date) {
      var year = date.getFullYear();
      var month = String(date.getMonth() + 1).padStart(2, '0');
      var day = String(date.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    }
    var todayKey = localDateKey(new Date());
    var storedVisitDay = null;
    var hasVisitedToday = false;
    var cachedCount = initialCount;
    try {
      storedVisitDay = localStorage.getItem(countedKey);
      hasVisitedToday = storedVisitDay === todayKey || storedVisitDay === '1';
      cachedCount = Number(localStorage.getItem(cachedKey)) || initialCount;
    } catch (error) {}
    visitorCount.textContent = cachedCount.toLocaleString();
    var shouldIncrement = isSitePage && !isLocalPreview && !isAutomated && !hasVisitedToday;
    var endpoint = shouldIncrement ? counterBase + '/up' : counterBase;
    var controller = 'AbortController' in window ? new AbortController() : null;
    var timeout = controller ? window.setTimeout(function () { controller.abort(); }, 5000) : null;
    fetch(endpoint, {
      mode: 'cors',
      cache: 'no-store',
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      signal: controller ? controller.signal : undefined
    })
      .then(function (response) { if (!response.ok) throw new Error('Counter unavailable'); return response.json(); })
      .then(function (data) {
        var count = Number(data.count);
        if (!Number.isFinite(count) || count < initialCount) count = initialCount;
        visitorCount.textContent = count.toLocaleString();
        try {
          localStorage.setItem(cachedKey, String(count));
          if (shouldIncrement || storedVisitDay === '1') localStorage.setItem(countedKey, todayKey);
        } catch (error) {}
      })
      .catch(function () { visitorCount.textContent = cachedCount.toLocaleString(); })
      .finally(function () { if (timeout) window.clearTimeout(timeout); });
  }
  document.querySelectorAll('[data-publication-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var card = button.closest('.publication-detail-card');
      var target = document.getElementById(button.dataset.publicationToggle);
      if (!card || !target) return;
      var willOpen = target.hidden;
      card.querySelectorAll('.publication-detail-panel').forEach(function (panel) { panel.hidden = true; });
      card.querySelectorAll('[data-publication-toggle]').forEach(function (item) { item.classList.remove('is-active'); item.setAttribute('aria-expanded', 'false'); });
      if (willOpen) {
        target.hidden = false;
        button.classList.add('is-active');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
  var lightbox = document.querySelector('[data-image-lightbox]');
  if (lightbox) {
    var lightboxImage = lightbox.querySelector('img');
    var lightboxClose = lightbox.querySelector('.image-lightbox-close');
    function closeLightbox() {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      lightboxImage.src = '';
    }
    document.querySelectorAll('.publication-framework').forEach(function (image) {
      image.setAttribute('tabindex', '0');
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', (document.documentElement.lang.indexOf('zh') === 0 ? '点击放大图片：' : 'Open enlarged image: ') + image.alt);
      function openLightbox() {
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightbox.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        lightboxClose.focus();
      }
      image.addEventListener('click', openLightbox);
      image.addEventListener('keydown', function (event) { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openLightbox(); } });
    });
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (event) { if (event.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox(); });
  }
})();
