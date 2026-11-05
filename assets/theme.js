/* ==========================================================================
   Matteo téma – JavaScript
   Drawer-ek, keresés, hero csúszka, termék változatok, kosár (Ajax API)
   ========================================================================== */

(function () {
  'use strict';

  const theme = window.theme || { routes: {}, strings: {} };
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------------------
     Drawer-ek (menü, kosár)
     ------------------------------------------------------------------------ */

  let lastFocus = null;

  function openDrawer(drawer) {
    if (!drawer) return;
    lastFocus = document.activeElement;
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
    $$('[aria-controls="' + drawer.id + '"]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    const focusTarget = $('[data-drawer-close].icon-btn', drawer);
    if (focusTarget) setTimeout(() => focusTarget.focus(), 50);
  }

  function closeDrawer(drawer) {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    if (!$('.drawer.is-open')) document.body.classList.remove('is-locked');
    $$('[aria-controls="' + drawer.id + '"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-drawer-open]');
    if (opener) {
      e.preventDefault();
      openDrawer(document.getElementById(opener.dataset.drawerOpen));
      return;
    }
    const closer = e.target.closest('[data-drawer-close]');
    if (closer) {
      e.preventDefault();
      closeDrawer(closer.closest('[data-drawer]'));
      return;
    }
    const cartOpener = e.target.closest('[data-cart-open]');
    if (cartOpener && theme.cartType === 'drawer' && $('[data-cart-drawer]')) {
      e.preventDefault();
      openDrawer($('[data-cart-drawer]'));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = $('.drawer.is-open');
    if (open) closeDrawer(open);
    const search = $('[data-search-modal].is-open');
    if (search) closeSearch();
    $$('details.facet[open]').forEach((d) => {
      d.removeAttribute('open');
      d.querySelector('summary').focus();
    });
  });

  /* ------------------------------------------------------------------------
     Keresés (prediktív)
     ------------------------------------------------------------------------ */

  const searchModal = $('[data-search-modal]');

  function openSearch() {
    if (!searchModal) return;
    searchModal.classList.add('is-open');
    searchModal.setAttribute('aria-hidden', 'false');
    const input = $('[data-predictive-input]', searchModal);
    if (input) setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    if (!searchModal) return;
    searchModal.classList.remove('is-open');
    searchModal.setAttribute('aria-hidden', 'true');
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-search-open]') && searchModal) {
      e.preventDefault();
      openSearch();
    } else if (e.target.closest('[data-search-close]')) {
      closeSearch();
    }
  });

  if (searchModal) {
    const input = $('[data-predictive-input]', searchModal);
    const results = $('[data-predictive-results]', searchModal);
    let timer;

    input.addEventListener('input', () => {
      clearTimeout(timer);
      const q = input.value.trim();
      if (q.length < 2) {
        results.innerHTML = '';
        return;
      }
      timer = setTimeout(async () => {
        try {
          const url = theme.routes.predictiveSearch + '.json?q=' + encodeURIComponent(q) +
            '&resources[type]=product&resources[limit]=4&resources[options][prefix]=last';
          const res = await fetch(url);
          const data = await res.json();
          const products = (data.resources && data.resources.results.products) || [];
          if (!products.length) {
            results.innerHTML = '';
            return;
          }
          results.innerHTML =
            '<div class="predictive">' +
            products.map((p) => {
              const img = p.featured_image && p.featured_image.url
                ? '<img src="' + p.featured_image.url + '&width=120" alt="" loading="lazy">'
                : '<span style="width:60px;aspect-ratio:4/5;background:var(--color-placeholder)"></span>';
              return '<a href="' + p.url + '" class="predictive__item">' + img +
                '<span><span class="predictive__title">' + escapeHtml(p.title) + '</span><br>' +
                '<span class="predictive__price">' + escapeHtml(p.price) + '</span></span></a>';
            }).join('') +
            '<a href="' + theme.routes.search + '?q=' + encodeURIComponent(q) + '&options[prefix]=last" class="link-underline predictive__all">' +
            escapeHtml(searchModal.querySelector('button[type="submit"]').getAttribute('aria-label')) + ' →</a>' +
            '</div>';
        } catch (err) {
          results.innerHTML = '';
        }
      }, 250);
    });
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ------------------------------------------------------------------------
     Hero csúszka
     ------------------------------------------------------------------------ */

  function initSlider(slider) {
    const slides = $$('[data-slide]', slider);
    const dots = $$('[data-slide-to]', slider);
    if (slides.length < 2) return;

    let current = 0;
    let timer = null;
    const autoplay = slider.dataset.autoplay === 'true';
    const speed = (parseInt(slider.dataset.speed, 10) || 6) * 1000;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function go(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
      dots.forEach((d, i) => {
        d.classList.toggle('is-active', i === current);
        if (i === current) d.setAttribute('aria-current', 'true');
        else d.removeAttribute('aria-current');
      });
    }

    function start() {
      if (!autoplay || reduceMotion) return;
      stop();
      timer = setInterval(() => go(current + 1), speed);
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    dots.forEach((dot) => dot.addEventListener('click', () => {
      go(parseInt(dot.dataset.slideTo, 10));
      start();
    }));

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('focusout', start);

    // Swipe mobilon
    let startX = null;
    slider.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) {
        go(current + (dx < 0 ? 1 : -1));
        start();
      }
      startX = null;
    });

    // Témaszerkesztő: a kiválasztott dia legyen látható
    slider.addEventListener('shopify:block:select', (e) => {
      const i = slides.indexOf(e.target);
      if (i > -1) { go(i); stop(); }
    });
    slider.addEventListener('shopify:block:deselect', start);

    start();
  }

  $$('[data-slider]').forEach(initSlider);
  document.addEventListener('shopify:section:load', (e) => {
    $$('[data-slider]', e.target).forEach(initSlider);
    initProducts(e.target);
    initRecommendations(e.target);
  });

  /* ------------------------------------------------------------------------
     Termékoldal – változatválasztó
     ------------------------------------------------------------------------ */

  function initProducts(root = document) {
    $$('[data-product]', root).forEach((productEl) => {
      const picker = $('[data-variant-picker]', productEl);
      if (!picker || picker.dataset.ready) return;
      picker.dataset.ready = 'true';

      const variantsEl = $('[data-variants]', picker);
      const variants = variantsEl ? JSON.parse(variantsEl.textContent) : [];
      const fieldsets = $$('fieldset[data-option-index]', picker);
      const sectionId = productEl.dataset.sectionId;
      const productUrl = productEl.dataset.productUrl;

      function selectedOptions() {
        return fieldsets.map((fs) => {
          const checked = $('input:checked', fs);
          return checked ? checked.value : null;
        });
      }

      function updateAvailability(selected) {
        fieldsets.forEach((fs, index) => {
          $$('[data-option-value]', fs).forEach((input) => {
            const candidate = selected.slice();
            candidate[index] = input.value;
            const available = variants.some((v) =>
              v.available && v.options.every((opt, i) => i === index ? opt === input.value : opt === candidate[i])
            );
            input.closest('.option__value').classList.toggle('is-unavailable', !available);
          });
        });
      }

      async function onChange() {
        const selected = selectedOptions();
        fieldsets.forEach((fs, i) => {
          const label = $('[data-selected-value]', fs);
          if (label) label.textContent = selected[i] || '';
        });
        updateAvailability(selected);

        const variant = variants.find((v) => v.options.every((opt, i) => opt === selected[i]));
        const idInput = $('[data-variant-id]', productEl);
        const addBtn = $('[data-add-button]', productEl);
        const addLabel = $('[data-add-label]', productEl);

        if (!variant) {
          if (addBtn) addBtn.disabled = true;
          if (addLabel) addLabel.textContent = theme.strings.unavailable;
          return;
        }

        if (idInput) idInput.value = variant.id;
        if (addBtn) addBtn.disabled = !variant.available;
        if (addLabel) addLabel.textContent = variant.available ? theme.strings.addToCart : theme.strings.soldOut;

        const url = productUrl + '?variant=' + variant.id;
        window.history.replaceState({}, '', url);

        // Ár frissítése a szerverről (Section Rendering API) – így a pénznem formázását a Shopify végzi
        try {
          const res = await fetch(url + '&section_id=' + sectionId);
          const html = await res.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const newPrice = $('[data-price]', doc);
          const oldPrice = $('[data-price]', productEl);
          if (newPrice && oldPrice) oldPrice.innerHTML = newPrice.innerHTML;
        } catch (err) { /* az ár marad */ }

        // Ha a változatnak saját képe van, görgessünk oda
        if (variant.featured_media) {
          const media = $('[data-media-id="' + variant.featured_media.id + '"]', productEl);
          const gallery = $('[data-gallery]', productEl);
          if (media && gallery) {
            if (window.matchMedia('(max-width: 749px)').matches) {
              gallery.scrollTo({ left: media.offsetLeft - gallery.offsetLeft, behavior: 'smooth' });
            }
          }
        }
      }

      picker.addEventListener('change', (e) => {
        if (e.target.matches('[data-option-value]')) onChange();
      });

      updateAvailability(selectedOptions());
    });
  }

  initProducts();

  /* ------------------------------------------------------------------------
     Kosár – Ajax API
     ------------------------------------------------------------------------ */

  const cartDrawer = () => $('[data-cart-drawer]');

  function updateCartCount(count) {
    $$('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.dataset.count = count;
    });
  }

  function renderCartDrawer(sections) {
    if (!sections || !sections['cart-drawer']) return;
    const doc = new DOMParser().parseFromString(sections['cart-drawer'], 'text/html');
    const fresh = $('.drawer__panel', doc);
    const drawer = cartDrawer();
    if (fresh && drawer) $('.drawer__panel', drawer).innerHTML = fresh.innerHTML;
  }

  // Kosárba tétel
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-product-form]');
    if (!form || theme.cartType !== 'drawer' || !cartDrawer()) return;
    e.preventDefault();

    const btn = $('[data-add-button]', form);
    const errorEl = $('[data-form-error]', form);
    if (errorEl) errorEl.textContent = '';
    if (btn) btn.classList.add('is-loading');

    try {
      const body = new FormData(form);
      body.append('sections', 'cart-drawer');
      body.append('sections_url', window.location.pathname);
      const res = await fetch(theme.routes.cartAdd + '.js', {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body
      });
      const data = await res.json();
      if (!res.ok || data.status) {
        if (errorEl) errorEl.textContent = data.description || data.message || theme.strings.error;
        return;
      }
      renderCartDrawer(data.sections);
      const cart = await (await fetch(theme.routes.cart + '.js')).json();
      updateCartCount(cart.item_count);
      openDrawer(cartDrawer());
    } catch (err) {
      if (errorEl) errorEl.textContent = theme.strings.error;
    } finally {
      if (btn) btn.classList.remove('is-loading');
    }
  });

  // Mennyiség változtatás / törlés (panelben és a kosár oldalon)
  async function changeLine(line, quantity, container) {
    const isPage = !!container.closest('[data-cart-page]');
    const drawer = cartDrawer();
    if (drawer) drawer.classList.add('is-updating');

    const sections = ['cart-drawer'];
    const pageEl = $('[data-cart-page]');
    if (isPage && pageEl) sections.push(pageEl.dataset.sectionId);

    try {
      const res = await fetch(theme.routes.cartChange + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line, quantity, sections, sections_url: window.location.pathname })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.description || 'error');

      renderCartDrawer(data.sections);
      updateCartCount(data.item_count);

      if (isPage && pageEl && data.sections[pageEl.dataset.sectionId]) {
        const doc = new DOMParser().parseFromString(data.sections[pageEl.dataset.sectionId], 'text/html');
        const fresh = $('[data-cart-page]', doc);
        if (fresh) pageEl.innerHTML = fresh.innerHTML;
      }
    } catch (err) {
      window.location.reload();
    } finally {
      if (drawer) drawer.classList.remove('is-updating');
    }
  }

  document.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('[data-qty-change]');
    const removeBtn = e.target.closest('[data-remove]');
    const item = e.target.closest('.cart-item');
    if (!item || (!qtyBtn && !removeBtn)) return;
    e.preventDefault();

    const line = parseInt(item.dataset.line, 10);
    const input = $('[data-qty-input]', item);
    if (removeBtn) {
      changeLine(line, 0, item);
      return;
    }
    const next = Math.max(0, (parseInt(input.value, 10) || 0) + parseInt(qtyBtn.dataset.qtyChange, 10));
    input.value = next;
    changeLine(line, next, item);
  });

  document.addEventListener('change', (e) => {
    const input = e.target.closest('[data-qty-input]');
    if (!input) return;
    const item = input.closest('.cart-item');
    changeLine(parseInt(item.dataset.line, 10), Math.max(0, parseInt(input.value, 10) || 0), item);
  });

  /* ------------------------------------------------------------------------
     Ajánlott termékek
     ------------------------------------------------------------------------ */

  function initRecommendations(root = document) {
    $$('[data-recommendations]', root).forEach(async (el) => {
      if (!el.dataset.url || el.dataset.loaded) return;
      el.dataset.loaded = 'true';
      try {
        const res = await fetch(el.dataset.url);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const fresh = $('[data-recommendations]', doc);
        if (fresh && fresh.innerHTML.trim()) el.innerHTML = fresh.innerHTML;
      } catch (err) { /* nincs ajánlás */ }
    });
  }

  initRecommendations();

  /* ------------------------------------------------------------------------
     Kollekció – szűrők, rendezés automatikus elküldése
     ------------------------------------------------------------------------ */

  document.addEventListener('change', (e) => {
    const form = e.target.closest('[data-facets-form]');
    if (form) form.submit();
  });

  // Nyitott szűrő bezárása, ha máshová kattintanak
  document.addEventListener('click', (e) => {
    $$('details.facet[open]').forEach((d) => {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });
})();
