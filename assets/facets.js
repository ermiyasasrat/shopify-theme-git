class FacetFiltersForm extends HTMLElement {
	constructor() {
	  super();
	  this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

	  this.debouncedOnSubmit = debounce((event) => {
		this.onSubmitHandler(event);
	  }, 500);

	  this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));

	  const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
	  if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
	}

	static setListeners() {
	  const onHistoryChange = (event) => {
		const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
		if (searchParams === FacetFiltersForm.searchParamsPrev) return;
		FacetFiltersForm.renderPage(searchParams, null, false);
	  }
	  window.addEventListener('popstate', onHistoryChange);
	}

	static toggleActiveFacets(disable = true) {
	  document.querySelectorAll('.js-facet-remove').forEach((element) => {
		element.classList.toggle('disabled', disable);
	  });
	}

	static renderPage(searchParams, event, updateURLHash = true) {
	  FacetFiltersForm.searchParamsPrev = searchParams;
	  const sections = FacetFiltersForm.getSections();
	  const countContainer = document.getElementById('ProductCount');
	  const countContainerDesktop = document.getElementById('ProductCountDesktop');
	  const getCollection = document.getElementById('ProductGridContainer').querySelector('.collection');
	  getCollection !== null ? getCollection.classList.add('loading') : null;
	  if (countContainer){
		countContainer.classList.add('loading');
	  }
	  if (countContainerDesktop){
		countContainerDesktop.classList.add('loading');
	  }

	  sections.forEach((section) => {
		const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
		const filterDataUrl = element => element.url === url;

		FacetFiltersForm.filterData.some(filterDataUrl) ?
		  FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
		  FacetFiltersForm.renderSectionFromFetch(url, event);
	  });

	  if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
	}

	static renderSectionFromFetch(url, event) {
	  fetch(url)
		.then(response => response.text())
		.then((responseText) => {
		  const html = responseText;
		  console.log("html",html);
		  FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
		  FacetFiltersForm.renderFilters(html, event);
		  FacetFiltersForm.renderProductGridContainer(html);
		  FacetFiltersForm.renderProductCount(html);
		});
	}

	static renderSectionFromCache(filterDataUrl, event) {
	  const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
	  FacetFiltersForm.renderFilters(html, event);
	  FacetFiltersForm.renderProductGridContainer(html);
	  FacetFiltersForm.renderProductCount(html);
	}

	static renderProductGridContainer(html) {
	  document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;
	}

	static renderProductCount(html) {
	  const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
	  const container = document.getElementById('ProductCount');
	  const containerDesktop = document.getElementById('ProductCountDesktop');
	  container.innerHTML = count;
	  container.classList.remove('loading');
	  if (containerDesktop) {
		containerDesktop.innerHTML = count;
		containerDesktop.classList.remove('loading');
	  }
	}

	static renderFilters(html, event) {
	  const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

	  const facetDetailsElements =
		parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter');
	  const matchesIndex = (element) => {
		const jsFilter = event ? event.target.closest('.js-filter') : undefined;
		return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
	  }
	  const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
	  const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

	  facetsToRender.forEach((element) => {
			document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
	  });
            document.querySelectorAll('.facets__header').forEach(header => header.classList.remove('active'));
            document.querySelectorAll('.facets__list').forEach(list => list.classList.remove('active'));
	  setTimeout(() => {
      console.log('renderFilters');
      const event = new CustomEvent('NewRenderFiltersLoaded', {
        detail: {},
      });
      document.dispatchEvent(event);
      // if(ProductSamplesApp && ProductSamplesApp.reInit) {
      //   ProductSamplesApp.reInit();
      // }
	  }, 1000)

	  FacetFiltersForm.renderActiveFacets(parsedHTML);
	  FacetFiltersForm.renderAdditionalElements(parsedHTML);

	  if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
	}

	static renderActiveFacets(html) {
	  const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

	  activeFacetElementSelectors.forEach((selector) => {
		const activeFacetsElement = html.querySelector(selector);
		if (!activeFacetsElement) return;
		document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
	  })

	  FacetFiltersForm.toggleActiveFacets(false);
	}

	static renderAdditionalElements(html) {
	  const mobileElementSelectors = [/*'.mobile-facets__open', '.mobile-facets__count', */'.sorting'];

	  mobileElementSelectors.forEach((selector) => {
		  const element = document.querySelector(selector);
		  const newElement = html.querySelector(selector);
		if (!newElement || !element) return;
		  element.innerHTML = newElement.innerHTML;
	  });

	  // document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
	}

	static renderCounts(source, target) {
	  const targetElement = target.querySelector('.facets__selected');
	  const sourceElement = source.querySelector('.facets__selected');

	  if (sourceElement && targetElement) {
		target.querySelector('.facets__selected').outerHTML = source.querySelector('.facets__selected').outerHTML;
	  }
	}

	static updateURLHash(searchParams) {
	  history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
	}

	static getSections() {
	  return [
		{
		  section: document.getElementById('product-grid').dataset.id,
		}
	  ]
	}

	onSubmitHandler(event) {
	  event.preventDefault();
	  const formData = new FormData(event.target.closest('form'));
	  const searchParams = new URLSearchParams(formData).toString();
	  const pathname = window.location.pathname;

	  if ( pathname.includes("/search") ) {
		const search = window.location.search.substring(1);
		const searchURL = search + "&" + searchParams;
		FacetFiltersForm.renderPage(searchURL, event);
	  }
	  else {
		FacetFiltersForm.renderPage(searchParams, event);
	  }

	  document.getElementById('FacetsWrapperDesktop').classList.add('facets__mobile-none');
	}

	onActiveFilterClick(event) {
	  event.preventDefault();
	  FacetFiltersForm.toggleActiveFacets();
	  const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
	  FacetFiltersForm.renderPage(url);
	}
  }

  FacetFiltersForm.filterData = [];
  FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
  FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
  customElements.define('facet-filters-form', FacetFiltersForm);
  FacetFiltersForm.setListeners();

  class PriceRange extends HTMLElement {
	constructor() {
	  super();
	  this.querySelectorAll('input')
		.forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));

	  this.setMinAndMaxValues();
	}

	onRangeChange(event) {
	  this.adjustToValidValues(event.currentTarget);
	  this.setMinAndMaxValues();
	}

	setMinAndMaxValues() {
	  const inputs = this.querySelectorAll('input');
	  const minInput = inputs[0];
	  const maxInput = inputs[1];
	  if (maxInput.value) minInput.setAttribute('max', maxInput.value);
	  if (minInput.value) maxInput.setAttribute('min', minInput.value);
	  if (minInput.value === '') maxInput.setAttribute('min', 0);
	  if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
	}

	adjustToValidValues(input) {
	  const value = Number(input.value);
	  const min = Number(input.getAttribute('min'));
	  const max = Number(input.getAttribute('max'));

	  if (value < min) input.value = min;
	  if (value > max) input.value = max;
	}
  }

  customElements.define('price-range', PriceRange);

  class FacetRemove extends HTMLElement {
	constructor() {
	  super();
	  this.querySelector('a').addEventListener('click', (event) => {
		event.preventDefault();
		const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
		form.onActiveFilterClick(event);
	  });
	}
  }

  customElements.define('facet-remove', FacetRemove);

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (event) => {
        const header = event.target.closest('.facets__header');
        
        if (header) {
            const isActive = header.classList.contains('active');

           
            document.querySelectorAll('.facets__header').forEach(header => header.classList.remove('active'));
            document.querySelectorAll('.facets__list').forEach(list => list.classList.remove('active'));
            
            
            if (!isActive) {
                header.classList.add('active');
                
                const closestList = header.closest('.facets-element')?.querySelector('.facets__list');
                if (closestList) {
                    closestList.classList.add('active');
                }
            }
        }
    });
});


