class MenuNavigation extends HTMLElement {
    constructor() {
		super();
		this.width = Number(this.dataset.width);
		this.height = this.dataset.height;
		this.topElements = this.querySelectorAll(".site-navigation__li--has-sub");
		this.mobileHamburger = document.querySelector('#site-toggle-nav');
		this.mobileMenu = this.querySelector('#site-navigation');
		this.brandSubmenu = this.querySelectorAll('.site-navigation-brand-submenu-container');
		this.desktopLinks = this.querySelectorAll('.site-navigation__link-div span');

		window.addEventListener("load", (event) => this.resizeData(event));
		window.addEventListener('resize', (event) => this.resizeData(event), true);
		this.mobileHamburger.addEventListener("click", (event) => {
			this.mobileMenu.classList.toggle("is-active")
			this.mobileHamburger.classList.toggle("is-active");
		});

		this.topElements.forEach((el, index) => {
			el.addEventListener("mouseover", (event) => this.desktopHoverOn(el, index), false);
			el.addEventListener("mouseout", (event) => this.desktopHoverOut(el, index), false);
			el.addEventListener("click", (event) => this.mobileLinkOpen(el, event), false);
		});

		this.brandSubmenu.forEach(el => {
			el.addEventListener("click", (event) => this.brandToggle(el, event), false);
		})

		this.desktopLinks.forEach(el => {
			el.addEventListener("click", (event) => this.desktopElementClick(el, event), false);
		});
	}

	async resizeData(event) {
		const width = event.currentTarget.innerWidth;
		const height = event.currentTarget.innerHeight;
		
		this.setAttribute('data-width', width);
		this.setAttribute('data-height', height);
	}

	async desktopHoverOn(el, index) {
		if ( Number(this.dataset.width) > 1279 ) {
			el.classList.add("is-active");
			
			if ( index !== 0 ) {
				const previousElement = this.topElements[index - 1];
				previousElement.classList.add("remove-right-border");
			}
		}
	}

	async desktopHoverOut(el, index) {
		if ( Number(this.dataset.width) > 1279 ) {
			el.classList.remove("is-active");
			
			if ( index !== 0 ) {
				const previousElement = this.topElements[index - 1];
				previousElement.classList.remove("remove-right-border");
			}
		}
	}

	async brandToggle(el, event) {
		const brandSubLink = event.target.classList.contains("site-navigation__li--brand-subelement");
		const brandParent = el.parentElement.getElementsByClassName("is-active");
		for (let index = 0; index < brandParent.length; index++) {
			if ( Number(this.dataset.width) > 1279 ) {
				brandParent[index].classList.remove("is-active");
			}
		}

		if ( brandSubLink === false ) {
			el.classList.toggle("is-active");
		}
	}

	async mobileLinkOpen(el, event) {
		if ( Number(this.dataset.width) < 1280 ) {
			const link = el.querySelector('.site-navigation__link-text').dataset.link;
			window.location.href = link;
		}
	}

	async mobileClick(el, event) {
		const topLevelClick = event.target.classList.contains("site-navigation__link-div");
		const brandSubLink = event.target.classList.contains("site-navigation__li--brand-subelement");
		const brandSubText = event.target.classList.contains("site-navigation__li--brand-subtext");
		const elementText = event.target.classList.contains("site-navigation__link-text");

		if ( Number(this.dataset.width) < 1280 && topLevelClick === true && brandSubLink === false && brandSubText === false ) {
			el.classList.toggle("is-active");
		}
		else if ( Number(this.dataset.width) < 1280 && elementText === true && brandSubLink === false && brandSubText === false ) {
			el.classList.toggle("is-active");
		}
	}

	async desktopElementClick(el, event) {
		if ( Number(this.dataset.width) > 1279 ) {
			const link = el.dataset.link;
			window.location.href = link;
		}
	}
}

customElements.define('menu-navigation', MenuNavigation);