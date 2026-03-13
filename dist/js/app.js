/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);

/*==========================================================================
Product sliders
============================================================================*/
function initProductGallerySlider() {
   const productGallerySliderThumbs = document.querySelector('.fv-product__gallery-slider-thumbs');
   const productGallerySliderBig = document.querySelector('.fv-product__gallery-slider-big');

   if (!productGallerySliderThumbs || !productGallerySliderBig) return;

   const productSwiperThumbs = new Swiper(productGallerySliderThumbs, {
      direction: 'vertical',
      spaceBetween: 16,
      speed: 600,
      slidesPerView: 3,
      slidesPerGroup: 1,
      navigation: {
         prevEl: ".fv-product__gallery-prev",
         nextEl: ".fv-product__gallery-next",
      },
      breakpoints: {
         320: {
            direction: 'horizontal',
            slidesPerView: 3,
            slidesPerGroup: 1,
         },
         480: {
            direction: 'horizontal',
            slidesPerView: 'auto',
            slidesPerGroup: 1,
         },
         768: {
            direction: 'vertical',
            slidesPerView: 3,
            slidesPerGroup: 1,

         }
      }
   });

   const productSwiperBig = new Swiper(productGallerySliderBig, {
      direction: 'vertical',
      spaceBetween: 16,
      slidesPerView: 1,
      speed: 600,
      thumbs: {
         swiper: productSwiperThumbs,
      },
      breakpoints: {
         320: {
            direction: 'horizontal',
         },
         768: {
            direction: 'vertical',
         }
      }
   });
}

/*==========================================================================
Gallery
============================================================================*/
const lightbox = GLightbox({
   selector: '.glightbox'
});


/*==========================================================================
Quantity
============================================================================*/
function initQuantityControls() {
   const quantityBlocks = document.querySelectorAll('.quantity');

   quantityBlocks.forEach(block => {
      const minusBtn = block.querySelector('.quantity__minus');
      const plusBtn = block.querySelector('.quantity__plus');
      const input = block.querySelector('.quantity__input');

      if (!minusBtn || !plusBtn || !input) return;

      minusBtn.addEventListener('click', () => {
         let currentValue = parseInt(input.value) || 1;
         if (currentValue > 1) input.value = currentValue - 1;
      });

      plusBtn.addEventListener('click', () => {
         let currentValue = parseInt(input.value) || 1;
         input.value = currentValue + 1;
      });

      input.addEventListener('input', () => {
         let currentValue = parseInt(input.value) || 1;
         if (currentValue < 1) input.value = 1;
      });
   });
}


/*==========================================================================
Toggle btn/quantity
============================================================================*/
function initAddToCartToggle() {
   const productCarts = document.querySelectorAll('.fv-product__cart');

   productCarts.forEach(cart => {
      const addButton = cart.querySelector('.fv-product__cart-button');
      const quantityBlock = cart.querySelector('.fv-product__cart-quantity');

      if (!addButton || !quantityBlock) return;

      quantityBlock.style.display = 'none';

      addButton.addEventListener('click', () => {
         addButton.style.display = 'none';
         quantityBlock.style.display = 'flex';
      });
   });
}


/*==========================================================================
Calendar
============================================================================*/
const deliveryInputs = document.querySelectorAll('.delivery-date');

deliveryInputs.forEach(input => {
   input.addEventListener('keydown', e => e.preventDefault());

   if (typeof AirDatepicker !== 'undefined') {
      new AirDatepicker(input, {
         timepicker: true,
         dateFormat: 'dd.MM.yyyy',
         timeFormat: 'HH:mm',
         autoClose: true,
         minDate: new Date()
      });
   }
});

/*==========================================================================
Checkuot accordion
============================================================================*/
function initDeliveryAccordion() {
   const items = document.querySelectorAll('.fv-checkout__form-item');

   if (!items.length) return;

   items.forEach(item => {
      const input = item.querySelector('input[type="radio"]');
      const content = item.querySelector('.fv-checkout__form-content');

      input.addEventListener('change', () => {

         items.forEach(el => {
            const elContent = el.querySelector('.fv-checkout__form-content');

            el.classList.remove('active');
            elContent.style.maxHeight = null;
         });

         item.classList.add('active');
         content.style.maxHeight = content.scrollHeight + 'px';

      });
   });
}


/*==========================================================================
Checkuot validation
============================================================================*/
function initCheckoutSteps() {
   const form = document.querySelector('.fv-checkout__form');
   if (!form) return;

   const nextBtn = form.querySelector('#nextStep');
   const prevBtn = form.querySelector('#prevStep');

   const step1 = form.querySelector('#step-1');
   const step2 = form.querySelector('#step-2');

   step2.style.display = 'none';
   step2.style.opacity = 0;

   const stickyHeaderHeight = 88;

   function scrollToElement(el) {
      const item = el.closest('.fv-checkout__form-item') || el;
      const elementTop = item.getBoundingClientRect().top + window.scrollY;
      const scrollTo = elementTop - stickyHeaderHeight;
      window.scrollTo({ top: scrollTo, behavior: 'smooth' });
      el.focus({ preventScroll: true });
   }

   function fadeOut(element, duration = 300, callback) {
      element.style.transition = `opacity ${duration}ms`;
      element.style.opacity = 0;
      setTimeout(() => {
         element.style.display = 'none';
         if (callback) callback();
      }, duration);
   }

   function fadeIn(element, duration = 300, callback) {
      element.style.display = 'block';
      element.style.transition = `opacity ${duration}ms`;
      // Чтобы браузер применил display перед анимацией
      requestAnimationFrame(() => {
         element.style.opacity = 1;
      });
      setTimeout(() => {
         if (callback) callback();
      }, duration);
   }

   nextBtn.addEventListener('click', () => {
      const radios = form.querySelectorAll('input[name="delivery"]');
      let radioChecked = false;
      radios.forEach(radio => {
         if (radio.checked) radioChecked = true;
      });

      if (!radioChecked) {
         radios[0].setCustomValidity('Пожалуйста, выберите способ доставки');
         scrollToElement(radios[0]);
         radios[0].reportValidity();
         return;
      } else {
         radios.forEach(radio => radio.setCustomValidity(''));
      }

      const activeRadio = form.querySelector('input[name="delivery"]:checked');
      const item = activeRadio.closest('.fv-checkout__form-item');
      const requiredInputs = item.querySelectorAll('input[required]');
      for (let input of requiredInputs) {
         if (!input.checkValidity()) {
            scrollToElement(input);
            input.reportValidity();
            return;
         }
      }

      fadeOut(step1, 300, () => {
         fadeIn(step2, 300, () => scrollToElement(step2));
      });
   });

   prevBtn.addEventListener('click', () => {
      fadeOut(step2, 300, () => {
         fadeIn(step1, 300, () => scrollToElement(step1));
      });
   });
}


/*==========================================================================
Tel mask
============================================================================*/
function phoneMask() {
   document.querySelectorAll("input.tel-mask").forEach((input) => {
      let keyCode;
      function mask(event) {
         event.keyCode && (keyCode = event.keyCode);
         let pos = this.selectionStart;
         if (pos < 3) event.preventDefault();
         let matrix = "+7 (___) ___ __ __",
            i = 0,
            val = this.value.replace(/\D/g, ""),
            new_value = matrix.replace(/[_\d]/g, (a) =>
               i < val.length ? val.charAt(i++) : a
            );
         i = new_value.indexOf("_");
         if (i !== -1) {
            i < 5 && (i = 3);
            new_value = new_value.slice(0, i);
         }
         let reg = matrix
            .substr(0, this.value.length)
            .replace(/_+/g, (a) => `\\d{1,${a.length}}`)
            .replace(/[+()]/g, "\\$&");
         reg = new RegExp("^" + reg + "$");
         if (!reg.test(this.value) || this.value.length < 5 || (keyCode > 47 && keyCode < 58)) {
            this.value = new_value;
         }
         if (event.type === "blur" && this.value.length < 5) this.value = "";
      }

      input.addEventListener("input", mask);
      input.addEventListener("focus", mask);
      input.addEventListener("blur", mask);
      input.addEventListener("keydown", mask);
   });
}


/*==========================================================================
Init
============================================================================*/
document.addEventListener('DOMContentLoaded', () => {
   initProductGallerySlider();
   initQuantityControls();
   initAddToCartToggle();
   initDeliveryAccordion();
   initCheckoutSteps();
   phoneMask();
})
/******/ })()
;