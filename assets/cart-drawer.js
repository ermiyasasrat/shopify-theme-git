class CartDrawer extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('keyup', (evt) => evt.code === 'Escape' && this.close());
    this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
    this.cartButton = document.querySelector('[data-cart="button"]');
    this.setHeaderCartIconAccessibility();

    this.addEventListener('click', (event) => {
      if(event.target.classList.contains('cart__continue-shopping')) {
        this.close();
      }
    });
  }

  setHeaderCartIconAccessibility() {
    const cartLink = document.querySelector('[data-cart="button"]');
    cartLink.setAttribute('role', 'button');
    cartLink.setAttribute('aria-haspopup', 'dialog');
    cartLink.addEventListener('click', (event) => {
      event.preventDefault();
      this.open(cartLink);
    });
    cartLink.addEventListener('keydown', (event) => {
      if (event.code.toUpperCase() === 'SPACE') {
        event.preventDefault();
        this.open(cartLink);
      }
    });
  }

  open(triggeredBy) {
    if (triggeredBy) this.setActiveElement(triggeredBy);
    const cartDrawerNote = this.querySelector('[id^="Details-"] summary');
    if (cartDrawerNote && !cartDrawerNote.hasAttribute('role')) this.setSummaryAccessibility(cartDrawerNote);
    // here the animation doesn't seem to always get triggered. A timeout seem to help
    setTimeout(() => {
      this.classList.add('animate', 'active');
    });

    this.addEventListener(
      'transitionend',
      () => {
        const containerToTrapFocusOn = this.classList.contains('is-empty')
          ? this.querySelector('.drawer__inner-empty')
          : document.getElementById('CartDrawer');
        const focusElement = this.querySelector('.drawer__inner') || this.querySelector('.drawer__close');
        trapFocus(containerToTrapFocusOn, focusElement);
      },
      { once: true }
    );

    document.body.classList.add('overflow-hidden');
  }

  close() {
    this.classList.remove('active');
    removeTrapFocus(this.activeElement);
    document.body.classList.remove('overflow-hidden');
    const notifier = this.querySelector('.drawer__heading-notify');
    if (notifier) {
      notifier.classList.remove('is-active');
    }
  }

  setSummaryAccessibility(cartDrawerNote) {
    cartDrawerNote.setAttribute('role', 'button');
    cartDrawerNote.setAttribute('aria-expanded', 'false');

    if (cartDrawerNote.nextElementSibling.getAttribute('id')) {
      cartDrawerNote.setAttribute('aria-controls', cartDrawerNote.nextElementSibling.id);
    }

    cartDrawerNote.addEventListener('click', (event) => {
      event.currentTarget.setAttribute('aria-expanded', !event.currentTarget.closest('details').hasAttribute('open'));
    });

    cartDrawerNote.parentElement.addEventListener('keyup', onKeyUpEscape);
  }

  renderContents(parsedStateAddItem) {
    this.querySelector('.drawer__inner').classList.contains('is-empty') &&
      this.querySelector('.drawer__inner').classList.remove('is-empty');
    // this.productId = parsedStateAddItem.id;
    this.getSectionsToRender().forEach((section) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);
      sectionElement.innerHTML = this.getSectionInnerHTML(parsedStateAddItem.sections[section.id], section.selector);

      if(section.callback) {
        section.callback(parsedStateAddItem)
      }
    });

    setTimeout(() => {
      this.querySelector('#CartDrawer-Overlay').addEventListener('click', this.close.bind(this));
      this.open();
    });
  }

  getSectionInnerHTML(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  getSectionsToRender() {
    return [
      {
        id: 'cart-drawer',
        selector: '#CartDrawer',
      },
      {
        id: 'cart-icon-bubble',
        callback: (parsedStateAddItem) => {
          this.cartButton.classList.toggle(
            'site-header__cart--has-items',
            (parsedStateAddItem.items && parsedStateAddItem.items.length) || (parsedStateAddItem.id)
          );
        },
      },
    ];
  }

  getSectionDOM(html, selector = '.shopify-section') {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector);
  }

  setActiveElement(element) {
    this.activeElement = element;
  }


  async nofity(message, type = 'infor', timeout = 5000) {
    return new Promise((resolve, reject) => {
      const notifier = this.querySelector('.drawer__heading-notify');
      if(notifier) {
        notifier.textContent = message;
        notifier.classList.add('is-active');
        notifier.dataset.notifyType = type;
        setTimeout(() => {
          notifier.classList.remove('is-active');
          resolve();
        }, timeout);
      } else {
        resolve();
      }
    });
  }

  async nofityWarn(message, timeout = 5000) {
    return await this.nofity(message, 'warn', timeout);
  }

  async nofityInfor(message, timeout = 5000) {
    return await this.nofity(message, 'infor', timeout);
  }
}

customElements.define('cart-drawer', CartDrawer);

class CartDrawerItems extends CartItems {
  constructor() {
    super();
    this.cartDrawer = this.closest('cart-drawer');
  }

  getSectionsToRender() {
    return [
      {
        id: 'CartDrawer',
        section: 'cart-drawer',
        selector: '.drawer__inner',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
        callback: (parsedStateUpdateQty) => {
          this.cartButton.classList.toggle('site-header__cart--has-items', parsedStateUpdateQty.item_count > 0);
        },
      },
    ];
  }

  onChange(event) {
    const input = event.target;
    const line = input.dataset.index;
    let value = parseInt(input.value);

    const evenPacks = (input.dataset.evenPacks === "true");
    if(evenPacks && !this.isEven(value)) {
      value += 1;
      input.value = value;
    }

    if(this.validateQuantity(input, line, value, event)) {
      this.updateQuantity(
        line,
        value,
        document.activeElement.getAttribute('name'),
        input.dataset.quantityVariantId
      );
    }
  }

	isEven(n) {
		// Check if number is even

		return n % 2 == 0;
	}

  validateQuantity(input, line, quantity, event) {
    const quantityPopover = input.closest('quantity-popover');
    const lineErrorMessage = quantityPopover?.querySelector('.cart-item-basket__notice');

    if(quantity < parseInt(input.min)) {
      if(lineErrorMessage) {
        lineErrorMessage.classList.add('has-errors');
      }
      return false;
    }

    if(lineErrorMessage) {
      lineErrorMessage.classList.remove('has-errors');
    }

    return true;
  }

  reloadCart() {
    const sections = this.getSectionsToRender().map((section) => section.section).join(',');
    return fetch(`${routes.cart_url}?sections=${sections}`)
      .then((response) => response.json())
      .then((response) => {
        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            response[section.section],
            section.selector
          );
        });
        const cartItems = Array.from(document.querySelectorAll('[data-cart-item-id]'))
        .map((el) => ({ id: el.dataset.cartItemId }));
        this.cartButton.classList.toggle('site-header__cart--has-items', cartItems.length > 0);
        this.cartDrawer.classList.toggle('is-empty', cartItems.length <= 0);
      })
      .catch((e) => {
        console.error(e);
      });
  }
}

customElements.define('cart-drawer-items', CartDrawerItems);

class CartDrawerItemQuantityInput extends QuantityInput {

}

customElements.define('cart-drawer-item-quantity-input', CartDrawerItemQuantityInput);
