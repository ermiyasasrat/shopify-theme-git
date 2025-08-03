class InfiniteScrollPagination extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.ajaxinate = new Ajaxinate({
      container: '#product-grid',
      pagination: '#infinite-scroll-pagination',
      loadingText: 'Loading More ...',
      callback: (res) => {
        this.handleNewContent(res);
      }
    });
  }

  handleNewContent(res) {
    const event = new CustomEvent('NewProductsContentLoaded', {
      detail: res,
    });
    this.dispatchEvent(event);
  }

  disconnectedCallback() {
    this.ajaxinate.destroy();
  }
}

customElements.define('infinite-scroll-pagination', InfiniteScrollPagination);
