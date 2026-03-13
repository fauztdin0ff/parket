/**
 * Основной JavaScript файл шаблона ABK Parket
 */

/* import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs'; */

// Инициализация слайдера на главной
document.addEventListener('DOMContentLoaded', () => {
   // Интро слайдер
   const introSlider = document.querySelector('.swiper-intro');
   if (introSlider) {
      new Swiper('.swiper-intro', {
         loop: true,
         slidesPerView: 1,
         speed: 800,
         observer: true,
         resizeObserver: true,
         autoplay: {
            delay: 3000,
         },
         pagination: {
            el: '.swiper-pagination',
            clickable: true,
         },
         navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
         },
      });
   }

   // Слайдер отзывов
   const reviewsSlider = document.querySelector('.swiper-reviews');
   if (reviewsSlider) {
      new Swiper('.swiper-reviews', {
         loop: true,
         spaceBetween: 40,
         speed: 800,
         observer: true,
         resizeObserver: true,
         breakpoints: {
            0: {
               slidesPerView: 1,
               spaceBetween: 16,
               autoHeight: true,
            },
            639: {
               slidesPerView: 2,
               spaceBetween: 40,
               autoHeight: false,
            },
         },
         navigation: {
            nextEl: '.reviews-button-next',
            prevEl: '.reviews-button-prev',
         },
      });
   }

   // Кастомный курсор для товаров
   initCustomCursor();

   // Разворачивание списка товаров
   initProductsExpand();

   // Меню каталога
   initCatalogMenu();

   // Фильтр каталога (offcanvas toggle, аккордеоны, слайдер цены, сортировка)
   initCatalogFilters();

   // Оверлей
   initOverlay();

   // Дочерняя навигация
   initChildrenNav();

   // Галерея карточки товара
   initProductGallery();

   // Корзина (AJAX добавление)
   initBasketAdd();

   // Страница корзины (AJAX изменение/удаление)
   initCartPage();

   // CSS переменные для viewport height
   initViewportHeight();
});

/**
 * Кастомный курсор для секции товаров
 */
function initCustomCursor() {
   if (!window.matchMedia('(pointer: fine)').matches) return;

   const cursorWrapper = document.querySelector('.cursor-wrapper');
   if (!cursorWrapper) return;

   const cursor = cursorWrapper.querySelector('.cursor');
   if (!cursor) return;

   cursorWrapper.style.cursor = 'none';

   let mouseX = null;
   let mouseY = null;

   function updateCursor() {
      if (mouseX === null || mouseY === null) return;

      const rect = cursorWrapper.getBoundingClientRect();
      const x = mouseX - rect.left - cursor.offsetWidth / 2;
      const y = mouseY - rect.top - cursor.offsetHeight / 2;

      cursor.style.transform = `translate(${x}px, ${y}px)`;
   }

   const throttledUpdate = throttle(updateCursor, 16);

   cursorWrapper.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updateCursor();
   });

   window.addEventListener('scroll', throttledUpdate, { passive: true });
   window.addEventListener('resize', throttledUpdate);
   cursorWrapper.addEventListener('scroll', throttledUpdate, { passive: true });

   cursorWrapper.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      mouseX = mouseY = null;
   });

   cursorWrapper.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
   });
}

/**
 * Разворачивание списка товаров
 */
function initProductsExpand() {
   const productsList = document.querySelector('.products-list');
   const expandBtn = document.querySelector('[data-target="more-products"]');

   if (!productsList || !expandBtn) return;

   const articles = Array.from(productsList.querySelectorAll('article'));

   if (articles.length <= 6) return;

   productsList.classList.add('hide-articles');
   articles.slice(6).forEach(article => article.classList.add('d-none'));

   const sixthArticle = articles[5];
   if (sixthArticle) sixthArticle.classList.add('gradient');

   expandBtn.addEventListener('click', () => {
      productsList.classList.remove('hide-articles');
      articles.slice(6).forEach(article => article.classList.remove('d-none'));
      if (sixthArticle) sixthArticle.classList.remove('gradient');
      expandBtn.style.display = 'none';
   });
}

/**
 * Меню каталога
 */
function initCatalogMenu() {
   const body = document.querySelector('body');
   if (!body) return;

   const offcanvas = document.querySelector('.offcanvas');
   const toggleButtons = document.querySelectorAll('[data-target="catalog-navigation"]');

   if (toggleButtons.length === 0) return;

   updateAriaHidden();

   function toggleMenu() {
      const isOpen = (body.getAttribute('data-offcanvas') || 'close') === 'open';
      const newState = isOpen ? 'close' : 'open';

      body.setAttribute('data-offcanvas', newState);
      if (offcanvas) {
         offcanvas.setAttribute('aria-hidden', newState === 'open' ? 'false' : 'true');
      }
   }

   toggleButtons.forEach(btn => {
      btn.addEventListener('click', toggleMenu);
   });
}

/**
 * Фильтр каталога: offcanvas-toggle, аккордеоны, range-слайдер, кнопки сортировки
 */
function initCatalogFilters() {
   // --- Offcanvas toggle ---
   const body = document.querySelector('body');
   const filterTriggers = document.querySelectorAll('[data-target="offcanvas-filters"]');
   if (body && filterTriggers.length > 0) {
      filterTriggers.forEach(btn => {
         btn.addEventListener('click', () => {
            const isOpen = (body.getAttribute('data-filter') || 'close') === 'open';
            body.setAttribute('data-filter', isOpen ? 'close' : 'open');
            updateAriaHidden();
         });
      });
   }

   // --- Аккордеоны filter-item ---
   document.querySelectorAll('.filter-item').forEach(item => {
      const header = item.querySelector('[data-target="filter-item"]');
      if (!header) return;
      header.addEventListener('click', () => {
         const current = item.getAttribute('aria-current') === 'true';
         item.setAttribute('aria-current', current ? 'false' : 'true');
      });
   });

   // --- Кнопки сортировки ---
   const sortBox = document.querySelector('.filter-sort');
   if (sortBox) {
      const sortBtns = sortBox.querySelectorAll('button');
      sortBtns.forEach(btn => {
         btn.addEventListener('click', () => {
            const active = btn.dataset.filterActive === 'true';
            sortBtns.forEach(b => { b.dataset.filterActive = 'false'; b.classList.remove('is-active'); });
            if (!active) {
               btn.dataset.filterActive = 'true';
               btn.classList.add('is-active');
            }
         });
      });
   }

   // --- Range-слайдер(ы) ---
   document.querySelectorAll('.filter-range').forEach(range => {
      const track = range.querySelector('.track');
      const fill = range.querySelector('.fill');
      const thumbMin = range.querySelector('.thumb-min');
      const thumbMax = range.querySelector('.thumb-max');
      const scaleMin = range.querySelector('.scale-min');
      const scaleMax = range.querySelector('.scale-max');
      const outMin = range.querySelector('.out-min');
      const outMax = range.querySelector('.out-max');
      const resetBtn = range.querySelector('.filter-range-reset');

      if (!track || !thumbMin || !thumbMax) return;

      const opts = {
         min: Number(range.dataset.min ?? 0),
         max: Number(range.dataset.max ?? 100000),
         step: Number(range.dataset.step ?? 1),
         from: Number(range.dataset.from ?? range.dataset.min ?? 0),
         to: Number(range.dataset.to ?? range.dataset.max ?? 100000),
      };

      let curFrom = opts.from;
      let curTo = opts.to;

      const fmt = new Intl.NumberFormat('ru-RU');

      function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
      function snap(v) { return Math.round(v / opts.step) * opts.step; }
      function pct(v) { return (v - opts.min) / (opts.max - opts.min) * 100; }

      function render(emit) {
         thumbMin.style.left = pct(curFrom) + '%';
         thumbMax.style.left = pct(curTo) + '%';
         fill.style.left = pct(curFrom) + '%';
         fill.style.right = (100 - pct(curTo)) + '%';
         if (scaleMin) scaleMin.textContent = fmt.format(curFrom);
         if (scaleMax) scaleMax.textContent = fmt.format(curTo);
         if (outMin) outMin.value = curFrom;
         if (outMax) outMax.value = curTo;
         if (resetBtn) resetBtn.dataset.disabled = (curFrom === opts.from && curTo === opts.to) ? 'true' : 'false';
         if (emit) range.dispatchEvent(new CustomEvent('range:change', { detail: { min: curFrom, max: curTo } }));
      }
      render(false);

      function startDrag(thumb, e) {
         e.preventDefault();
         const rect = track.getBoundingClientRect();
         function onMove(ev) {
            const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
            const raw = opts.min + clamp(clientX - rect.left, 0, rect.width) / rect.width * (opts.max - opts.min);
            const val = snap(raw);
            if (thumb === thumbMin) curFrom = clamp(val, opts.min, curTo);
            else curTo = clamp(val, curFrom, opts.max);
            render(true);
         }
         function onUp() {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onUp);
         }
         window.addEventListener('pointermove', onMove);
         window.addEventListener('pointerup', onUp, { once: true });
         window.addEventListener('touchmove', onMove, { passive: false });
         window.addEventListener('touchend', onUp, { once: true });
      }

      thumbMin.addEventListener('pointerdown', e => startDrag(thumbMin, e));
      thumbMax.addEventListener('pointerdown', e => startDrag(thumbMax, e));
      thumbMin.addEventListener('touchstart', e => startDrag(thumbMin, e), { passive: false });
      thumbMax.addEventListener('touchstart', e => startDrag(thumbMax, e), { passive: false });

      [thumbMin, thumbMax].forEach(thumb => {
         thumb.addEventListener('keydown', e => {
            const d = opts.step * (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0);
            if (!d) return;
            if (thumb === thumbMin) curFrom = clamp(curFrom + d, opts.min, curTo);
            else curTo = clamp(curTo + d, curFrom, opts.max);
            render(true);
            e.preventDefault();
         });
      });

      if (resetBtn) {
         resetBtn.addEventListener('click', () => {
            curFrom = opts.from;
            curTo = opts.to;
            render(true);
         });
      }
   });
}

/**
 * Оверлей
 */
function initOverlay() {
   const body = document.querySelector('body');
   const overlay = document.querySelector('.overlay');

   if (!body || !overlay) return;

   overlay.addEventListener('click', () => {
      body.setAttribute('data-offcanvas', 'close');
      body.setAttribute('data-dialog', 'close');
      body.setAttribute('data-filter', 'close');
      updateAriaHidden();
   });
}

/**
 * Дочерняя навигация
 */
function initChildrenNav() {
   const buttons = document.querySelectorAll('[data-target="children-nav"]');

   buttons.forEach(button => {
      button.addEventListener('click', () => {
         const parent = button.closest('[aria-current]') || button.parentElement;
         if (!parent || !parent.hasAttribute('aria-current')) return;

         const current = (parent.getAttribute('aria-current') || 'false').toString();
         const newState = current === 'true' ? 'false' : 'true';

         parent.setAttribute('aria-current', newState);
      });
   });
}

/**
 * Страница корзины: AJAX изменение количества и удаление
 */
function initCartPage() {
   const cartTable = document.querySelector('.cart-table');
   if (!cartTable) return;

   const sessid = document.querySelector('meta[name="bitrix-sessid"]')?.content || '';

   async function updateItem(row, itemId, quantity) {
      row.classList.add('is-removing');
      try {
         const res = await fetch('/local/ajax/basket_update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `item_id=${itemId}&quantity=${quantity}&sessid=${encodeURIComponent(sessid)}`,
         });
         const data = await res.json();

         if (!data.success) {
            row.classList.remove('is-removing');
            return;
         }

         if (data.removed || quantity === 0) {
            row.remove();
            if (!cartTable.querySelector('.cart-row')) {
               location.reload();
               return;
            }
         } else {
            row.classList.remove('is-removing');
            const totalEl = row.querySelector('.cart-row-total');
            if (totalEl) totalEl.textContent = data.item_total;
         }

         const grandTotal = document.getElementById('cart-total');
         if (grandTotal) grandTotal.textContent = data.basket_total;
         updateBasketCount(data.basket_count);
      } catch {
         row.classList.remove('is-removing');
      }
   }

   cartTable.addEventListener('click', (e) => {
      const row = e.target.closest('.cart-row');
      if (!row) return;
      const itemId = row.dataset.itemId;

      // Удалить товар
      if (e.target.closest('.cart-remove-btn')) {
         updateItem(row, itemId, 0);
         return;
      }

      // Уменьшить
      if (e.target.closest('.qty-minus')) {
         const input = row.querySelector('.qty-input');
         const val = Math.max(1, parseInt(input.value, 10) - 1);
         input.value = val;
         updateItem(row, itemId, val);
         return;
      }

      // Увеличить
      if (e.target.closest('.qty-plus')) {
         const input = row.querySelector('.qty-input');
         const val = parseInt(input.value, 10) + 1;
         input.value = val;
         updateItem(row, itemId, val);
      }
   });

   cartTable.addEventListener('change', (e) => {
      if (!e.target.classList.contains('qty-input')) return;
      const row = e.target.closest('.cart-row');
      if (!row) return;
      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
      e.target.value = val;
      updateItem(row, row.dataset.itemId, val);
   });
}

/**
 * Корзина: начальное состояние → счётчик + цена после добавления
 */
function initBasketAdd() {
   const wrapper = document.querySelector('.product-basket');
   if (!wrapper) return;

   const productId = wrapper.dataset.productId;
   const unitPrice = parseFloat(wrapper.dataset.price) || 0;

   const stateInitial = wrapper.querySelector('.basket-state--initial');
   const stateAdded = wrapper.querySelector('.basket-state--added');
   const addBtn = wrapper.querySelector('.basket-add-btn');
   const qtyInput = stateAdded?.querySelector('.qty-input');
   const minusBtn = stateAdded?.querySelector('.qty-minus');
   const plusBtn = stateAdded?.querySelector('.qty-plus');
   const totalValue = wrapper.querySelector('.basket-total-value');

   let itemId = null;

   // Восстанавливаем состояние корзины после перезагрузки страницы
   const savedItemId = parseInt(wrapper.dataset.basketItemId, 10) || 0;
   const savedQty = parseInt(wrapper.dataset.basketQty, 10) || 0;
   if (savedItemId && savedQty > 0) {
      itemId = savedItemId;
      stateInitial.classList.remove('is-active');
      stateAdded.classList.add('is-active');
      if (qtyInput) qtyInput.value = savedQty;
   }

   function updateTotal() {
      if (!totalValue || !unitPrice) return;
      const qty = parseInt(qtyInput.value, 10) || 1;
      totalValue.textContent = (qty * unitPrice).toLocaleString('ru-RU');
   }

   // Теперь можем посчитать итого для восстановленного состояния
   if (savedItemId && savedQty > 0) updateTotal();

   async function syncQty(qty) {
      if (!itemId) return;
      const sessid = document.querySelector('meta[name="bitrix-sessid"]')?.content || '';
      try {
         const res = await fetch('/local/ajax/basket_update.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `item_id=${itemId}&quantity=${qty}&sessid=${encodeURIComponent(sessid)}`,
         });
         const data = await res.json();
         if (data.success) {
            updateBasketCount(data.basket_count);
            if (qty === 0) {
               // Товар удалён — возвращаем начальное состояние
               itemId = null;
               stateAdded.classList.remove('is-active');
               stateInitial.classList.add('is-active');
               addBtn.textContent = 'Добавить в корзину';
               addBtn.disabled = false;
            }
         }
      } catch { }
   }

   if (minusBtn) {
      minusBtn.addEventListener('click', () => {
         const val = parseInt(qtyInput.value, 10) || 1;
         if (val > 1) {
            qtyInput.value = val - 1;
            updateTotal();
            syncQty(val - 1);
         } else {
            // qty=1 → удалить товар из корзины
            syncQty(0);
         }
      });
   }

   if (plusBtn) {
      plusBtn.addEventListener('click', () => {
         const val = parseInt(qtyInput.value, 10) || 1;
         qtyInput.value = val + 1;
         updateTotal();
         syncQty(val + 1);
      });
   }

   if (qtyInput) {
      qtyInput.addEventListener('change', () => {
         const val = Math.max(1, parseInt(qtyInput.value, 10) || 1);
         qtyInput.value = val;
         updateTotal();
         syncQty(val);
      });
   }

   addBtn.addEventListener('click', async () => {
      const sessid = document.querySelector('meta[name="bitrix-sessid"]')?.content || '';

      addBtn.disabled = true;

      try {
         const res = await fetch('/local/ajax/basket.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `product_id=${productId}&quantity=1&sessid=${encodeURIComponent(sessid)}`,
         });
         const data = await res.json();

         if (data.success) {
            itemId = data.item_id;
            updateBasketCount(data.basket_count);

            stateInitial.classList.remove('is-active');
            stateAdded.classList.add('is-active');
            if (qtyInput) qtyInput.value = 1;
            updateTotal();
         }
      } catch { }

      addBtn.disabled = false;
   });
}

function updateBasketCount(count) {
   const badge = document.getElementById('basket-count');
   if (!badge) return;
   badge.dataset.count = count;
   badge.textContent = count > 0 ? count : '';
}

/**
 * Галерея карточки товара
 */
function initProductGallery() {
   const thumbs = document.querySelectorAll('.gallery-thumb');
   const imagesSlider = document.querySelector('.images-wrapper .images-slider');

   if (!thumbs.length || !imagesSlider) return;

   const mainImages = imagesSlider.querySelectorAll('img');

   thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
         const idx = parseInt(thumb.dataset.index, 10);

         thumbs.forEach(t => t.classList.remove('active'));
         thumb.classList.add('active');

         const target = mainImages[idx];
         if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
         }
      });
   });
}

/**
 * Обновление aria-hidden атрибутов
 */
function updateAriaHidden() {
   const body = document.querySelector('body');
   if (!body) return;

   const offcanvas = document.querySelector('.offcanvas');
   const dialog = document.querySelector('.dialog');
   const filters = document.querySelector('.offcanvas-filters');

   const offcanvasState = (body.getAttribute('data-offcanvas') || 'close') === 'open';
   const dialogState = (body.getAttribute('data-dialog') || 'close') === 'open';
   const filtersState = (body.getAttribute('data-filter') || 'close') === 'open';

   if (offcanvas) offcanvas.setAttribute('aria-hidden', offcanvasState ? 'false' : 'true');
   if (dialog) dialog.setAttribute('aria-hidden', dialogState ? 'false' : 'true');
   if (filters) filters.setAttribute('aria-hidden', filtersState ? 'false' : 'true');
}

/**
 * Viewport height CSS переменные
 */
function initViewportHeight() {
   const VH = '--vh';
   const LVH = '--lvh';
   const DVH = '--dvh';
   const HDR_H = '--hdr-h';

   function setVH() {
      const vh = window.innerHeight;
      const vvh = window.visualViewport?.height || vh;
      const dvh = document.documentElement.clientHeight || vh;

      const vhValue = vh * 0.01;
      const lvhValue = Math.max(vh, vvh, dvh) * 0.01;
      const dvhValue = Math.min(vh, vvh, dvh) * 0.01;

      document.documentElement.style.setProperty(VH, `${vhValue}px`);
      document.documentElement.style.setProperty(LVH, `${lvhValue}px`);
      document.documentElement.style.setProperty(DVH, `${dvhValue}px`);
   }

   function setHeaderHeight() {
      const header = document.querySelector('.app-header');
      if (!header) return;

      const height = header.offsetHeight;
      document.documentElement.style.setProperty(HDR_H, `${height}px`);
   }

   setVH();
   setHeaderHeight();

   const throttledVH = throttle(setVH, 120);
   const throttledHeader = throttle(setHeaderHeight, 120);

   window.addEventListener('resize', throttledVH);
   window.addEventListener('orientationchange', throttledVH);
   window.addEventListener('resize', throttledHeader);
   window.addEventListener('scroll', throttledHeader, { passive: true });
}

/**
 * Throttle функция
 */
function throttle(func, wait) {
   let lastTime = 0;
   let timeout = null;
   let context = null;
   let args = null;

   return function (..._args) {
      const now = Date.now();
      context = this;
      const remaining = wait - (now - lastTime);
      args = _args;

      if (remaining <= 0) {
         lastTime = now;
         if (timeout) {
            clearTimeout(timeout);
            timeout = null;
         }
         func.apply(context, args);
         args = null;
      } else if (!timeout) {
         timeout = setTimeout(() => {
            lastTime = Date.now();
            timeout = null;
            func.apply(context, args);
            args = null;
         }, remaining);
      }
   };
}

// ─── Search suggest (autocomplete) ───────────────────────────────────────────
(function () {
   const form = document.querySelector('.input-block.input-type-searh');
   const input = form && form.querySelector('.input-search');
   if (!input) return;

   // Создаём дропдаун
   const dropdown = document.createElement('div');
   dropdown.className = 'search-suggest';
   dropdown.hidden = true;
   form.appendChild(dropdown);

   let debounceTimer = null;
   let activeIndex = -1;
   let currentQuery = '';

   function escHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
   }

   function highlight(text, query) {
      const safe = escHtml(text);
      const re = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      return safe.replace(re, '<mark>$1</mark>');
   }

   function getItems() {
      return dropdown.querySelectorAll('.search-suggest-item');
   }

   function setActive(idx) {
      const items = getItems();
      items.forEach((el, i) => el.classList.toggle('is-active', i === idx));
      activeIndex = idx;
   }

   function render(items, query) {
      const rows = items.map(item =>
         `<a class="search-suggest-item" href="${escHtml(item.url)}">${highlight(item.title, query)}</a>`
      ).join('');
      const footer = `<a class="search-suggest-all" href="/search/?q=${encodeURIComponent(query)}">Смотреть все результаты</a>`;
      dropdown.innerHTML = rows + footer;
      dropdown.hidden = false;
      activeIndex = -1;
   }

   function close() {
      dropdown.hidden = true;
      activeIndex = -1;
   }

   async function fetchSuggestions(query) {
      try {
         const res = await fetch('/local/ajax/search_suggest.php?q=' + encodeURIComponent(query));
         const data = await res.json();
         if (query !== currentQuery) return; // устаревший ответ
         if (data.length === 0) { close(); return; }
         render(data, query);
      } catch (e) {
         close();
      }
   }

   input.addEventListener('input', function () {
      const query = this.value.trim();
      currentQuery = query;
      clearTimeout(debounceTimer);

      if (query.length < 2) { close(); return; }

      debounceTimer = setTimeout(() => fetchSuggestions(query), 280);
   });

   // Клавиатурная навигация
   input.addEventListener('keydown', function (e) {
      if (dropdown.hidden) return;
      const items = getItems();

      if (e.key === 'ArrowDown') {
         e.preventDefault();
         setActive(Math.min(activeIndex + 1, items.length - 1));
      } else if (e.key === 'ArrowUp') {
         e.preventDefault();
         setActive(Math.max(activeIndex - 1, -1));
         if (activeIndex === -1) input.value = currentQuery;
      } else if (e.key === 'Enter' && activeIndex >= 0) {
         e.preventDefault();
         items[activeIndex].click();
      } else if (e.key === 'Escape') {
         close();
      }

      if (activeIndex >= 0 && items[activeIndex]) {
         input.value = items[activeIndex].textContent;
      }
   });

   // Закрыть при клике вне
   document.addEventListener('click', function (e) {
      if (!form.contains(e.target)) close();
   });

   // Снова открыть при фокусе если есть контент
   input.addEventListener('focus', function () {
      if (this.value.trim().length >= 2 && !dropdown.hidden === false && dropdown.children.length > 0) {
         dropdown.hidden = false;
      }
   });
}());

// Кнопка «← Вернуться назад» (блог, услуги)
(function () {
   const btn = document.querySelector('.btn-back');
   if (!btn) return;

   const fallback = btn.dataset.fallback || '/blog/';

   btn.addEventListener('click', function () {
      const referrer = document.referrer;
      const isSameOrigin = (() => {
         try { return referrer && new URL(referrer).origin === location.origin; }
         catch { return false; }
      })();

      if (isSameOrigin) {
         const currentHref = location.href;
         history.back();
         setTimeout(function () {
            if (location.href === currentHref) location.assign(fallback);
         }, 300);
      } else {
         location.assign(fallback);
      }
   });
}());
