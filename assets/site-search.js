class SiteSearch extends HTMLElement {
    constructor() {
		super();

		this.mobileSearchButton = this.querySelector('#site-search-mobile-btn');
		this.searchContainer = this.querySelector('.site-header__search');

		this.mobileSearchButton.addEventListener("click", (event) => this.mobileSearchToggle(event), false);
	}

	async mobileSearchToggle(event) {
		this.searchContainer.classList.toggle("site-header__search-desktop");
		this.searchContainer.classList.toggle("site-header__search-mobile-container");
	}

}

customElements.define('site-search', SiteSearch);