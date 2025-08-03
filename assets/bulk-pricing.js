export default class BulkPricing {
    /**
     * Class constructor
     *
     * @arg {object} - `el` Selector for the bulk discount link
     * @arg {class} - `savingsNotificationInstance` Pass in the savings notification class instance
     * to calculate savings
    */
    constructor(el, savingsNotificationInstance) {
        if (!el) return;

        // elements
        this.bulkPricingTrigger = el;
        this.bulkPricingBlock = document.getElementById('bulk-pricing');
        this.bulkPricingMetresSquared = document.getElementById('bulk-pricing-metres-squared');
        this.bulkPricingWrapper = document.getElementById('bulk-pricing-wrapper');
        this.packCalculatorEl = document.getElementById('pack-calculator');
        this.boardCalculatorEl = document.getElementById('board-calculator');
        this.rollCalculatorEl = document.getElementById('roll-calculator');
        this.productQuantity = document.getElementById('Quantity');
        this.requiredMetresSquared = document.getElementById('required-metres-squared');
        this.requiredLength = document.getElementById('required-length');
        this.wastageFee = document.getElementById('wastage-fee');
        this.totalPrice = document.getElementById('total-price');

        // hidden data inputs
        this.productIdData = document.querySelector('[data-hidden-data="product_id"]');
        this.productVariantIdData = document.querySelector('[data-hidden-data="product_variant_id"]');
        this.productVariantPriceData = document.querySelector('[data-hidden-data="price"]');
        this.packSizeData = document.querySelector('[data-hidden-data="pack_size"]');
        this.productLengthData = document.querySelector('[data-hidden-data="length"]');
        this.productWidthData = document.querySelector('[data-hidden-data="width"]');
        this.productRollWidthData = document.querySelector('[data-hidden-data="roll_width"]');
        this.productPricePerMetresSquaredData = document.querySelector('[data-hidden-data="price_per_metres_squared"]');

        // helpers
        this.activeClass = 'is-active';
        this.currentTierClass = 'is-current-tier';
        this.tableHasUpdated = false;

        // class instances
        this.savingsNotificationInstance = savingsNotificationInstance;

        // check to see if bulk pricing exists on this product
        this.getOfferTableData(true).then(() => {
            this.bulkPricingBlock.classList.add(this.activeClass);

            // attach the event listeners
            this.attachEventListeners();
        });
    }

    attachEventListeners () {
        // on click of bulk pricing table link
        this.bulkPricingTrigger.addEventListener('click', () => {
            this.handleMethods(true);
        }, false);

        if (this.requiredMetresSquared) {
            // on keyup of required m²
            this.requiredMetresSquared.addEventListener('keyup', (e) => {
                // don't register on press of enter
                if (e.keyCode != '13' || e.key != "Enter") {
                    this.handleMethods();
                }
            }, false);

            // on change of required m²
            this.requiredMetresSquared.addEventListener('change', () => {
                this.handleMethods();
            }, false);
        }

        if (this.requiredLength) {
            // on keyup of required length
            this.requiredLength.addEventListener('keyup', (e) => {
                // don't register on press of enter
                if (e.keyCode != '13' || e.key != "Enter") {
                    this.handleMethods();
                }
            }, false);

            // on change of required length
            this.requiredLength.addEventListener('change', () => {
                this.handleMethods();
            }, false);
        }

        if (this.wastageFee) {
            // on change of wastage fee checkbox
            this.wastageFee.addEventListener('change', () => {
                this.handleMethods();
            }, false);
        }
    }

    /**
     * Handle Methods
     * Collate all the methods that are called to reduce
     * the amount of repeated code for the event listeners to run.
     *
     * @arg {boolean} - `showTable` Boolean to determine whether or not to show
     * the table when the event listener is called.
    */
    handleMethods(showTable) {
        // check the table has been injected
        const tableEl = document.querySelector('.priceGroupList');
        if (tableEl) {
            // check if the table data has been updated
            if (!this.tableHasUpdated) {
                this.metresSquaredCalculations();
            }
            if (showTable) {
                this.showTable();
            }
            this.updatePricing();
        }
    }

    /**
     * Metres Squared Calculations
     * As we have different ways of calculating the metres squared per product
     * we need to determine which data we need to do so.
     *
     * I.e. pack calculator requires pack size and the roll calculator requires
     * the product roll width.
    */
    metresSquaredCalculations() {
        // if the product is sold as packs, provide the pack size
        if (this.packCalculatorEl) {
            this.updateTable(this.packSizeData.value);
        }

        // if the product is sold as boards, provide the board dimensions
        if (this.boardCalculatorEl) {
            let boardWidthMetres,
                boardDimensons;

            // board width is provided in millimetres, convert to metres
            // e.g. 145mm = 0.145m
            boardWidthMetres = this.productWidthData.value / 1000;
            // calculate m² from board dimensions (length(m) * width(m))
            boardDimensons = this.productLengthData.value * boardWidthMetres;

            this.updateTable(boardDimensons);
        }

        // if the product is sold as rolls, provide the roll width
        if (this.rollCalculatorEl) {
            this.updateTable(this.productRollWidthData.value);
        }
    }

    // toggle bulk pricing pop out visibility
    showTable() {
        this.bulkPricingWrapper.classList.toggle(this.activeClass);
    }

    /**
     * Update Discount Table
     *
     * The discount table provided by Quantity Price Breaks does not
     * display the data in way Stories require.
     *
     * We are taking the quantity and price of the unit
     * being sold and working out how much that equates
     * to when sold as price per metres squared.
     *
     * @arg {number} - `unitM2Measurement` passing the value required to determine the discount in metres squared
    */
    updateTable(unitM2Measurement) {
        // remove the styles injected by the app
        const injectedAppStyles = this.bulkPricingWrapper.querySelector('style');
        if (injectedAppStyles) {
            this.bulkPricingWrapper.removeChild(injectedAppStyles);
        }

        // get the rows of discount tiers that the app give us
        const bulkPricingTableRows = [...this.bulkPricingWrapper.querySelectorAll('.priceGroupList tbody tr')];
        if (bulkPricingTableRows) {
            for (let i = 0; i < bulkPricingTableRows.length; i++) {
                // get the nodes and store the quantity and price as data fields
                const quantityCol = bulkPricingTableRows[i].childNodes[0];
                const priceCol = bulkPricingTableRows[i].childNodes[1];
                // get the quantity of units required to achieve the discount from the app data and remove the whitespace
                const quantity = quantityCol.innerText.trim();
                // use regex to retrieve the price from the app data
                const price = priceCol.innerText.match(/\d+(?:\.\d+)?/g);

                // store original values on the line items for later use
                quantityCol.setAttribute('data-original-quantity', quantity);
                priceCol.setAttribute('data-original-price', price);

                // multiply price against quantity so we can work out metres squared per unit
                const totalCost = Number(price[0]) * Number(quantity);

                // using the unit m² measurement, calculate how many m² the bulk quantity threshold provides
                const unitMetresSquared = (unitM2Measurement * Number(quantity)).toFixed(2);
                const discountPriceThreshold = totalCost.toFixed(2) / unitMetresSquared;

                // finally replace the content of the nodes with the new data
                // replace quantity with the equivalent in metres squared
                quantityCol.textContent = unitMetresSquared + 'm² +';
                // replace price per unit with price per metres squared
                priceCol.textContent = '£' + discountPriceThreshold.toFixed(2) + '/m²';

                // ensure this code isn't run again
                this.tableHasUpdated = true;
            }
        }
    }

    /**
     * Update Discount Pricing Tier
     *
     * Show the user the current tier of discount
     * achieved within the table.
     *
     * Using the quantity required, compare that to
     * the table and find the matching tier.
    */
    updatePricing() {
        // get the rows of discount tiers that the app give us
        const bulkPricingQuantities = [...document.querySelectorAll('[data-original-quantity]')];
        if (bulkPricingQuantities) {
            // create an empty array
            const arr = [];
            for (let i = 0; i < bulkPricingQuantities.length; i++) {
                const userRequiredQuantityNumber = Number(this.productQuantity.value)
                const bulkOriginalQuantityNumber = Number(bulkPricingQuantities[i].getAttribute('data-original-quantity'));
                // check if the amount the user requires is more than the bulk quantity requirement
                if (userRequiredQuantityNumber >= bulkOriginalQuantityNumber) {
                    // push the column nodes into the array
                    arr.push(bulkOriginalQuantityNumber);
                }
                // ensure than no rows have the 'current tier class' applied
                bulkPricingQuantities[i].parentNode.classList.remove(this.currentTierClass);
            }

            // determine the tier of discount by checking the quantity against the array of discount tiers
            const tierAchieved = Math.max(...arr);
            const tierLevelEl = document.querySelector('[data-original-quantity="' + tierAchieved + '"]');
            if (tierLevelEl) {
                const tierPricing = tierLevelEl.nextSibling.textContent;
                // apply class for visual indicator of discount tier
                tierLevelEl.parentNode.classList.add(this.currentTierClass);
                // update bulk price by metres squared
                this.bulkPricingMetresSquared.textContent = tierPricing;
                // get the price per item to calculate the bulk discount total price
                const tierPricePerItem = Number(tierLevelEl.nextSibling.getAttribute('data-original-price'));
                // update the total price with the new bulk price total
                const bulkPricingTotalCost = tierPricePerItem * this.productQuantity.value;
                this.totalPrice.innerText = bulkPricingTotalCost.toFixed(2);

                /*
                 * Product savings calculation
                */
                if (this.savingsNotificationInstance) {
                    this.savingsNotificationInstance.calculateSavings(null, bulkPricingTotalCost);
                }
            } else {
                // if discount isn't achieved set back to original price per metres squared
                this.bulkPricingMetresSquared.textContent = '£' + this.productPricePerMetresSquaredData.value + '/m²';
            }
        }
    }

    /**
     * Get Offer Table Data
     *
     * This returns the table as HTML from the
     * Quantity Price Breaks app.
     *
     * We can use this to determine if the discount is present
     * on the product, or to build the table and replace the current one.
     *
     * @arg {boolean} - `checkOnly` Determine if the promise is a check or needed to build out a new table
    */
    getOfferTableData(checkOnly) {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            // the app wants a price passing to it unfiltered (no decimal place)
            const filteredPrice = this.productVariantPriceData.value.replace('.', '');
            req.open('GET', 'https://apps.omegatheme.com/group-price-attribute/quantity_break_v2.php?idProduct=' + this.productIdData.value + '&shop=stories-flooring.myshopify.com&action=getOfferByVariant&variantID=' + this.productVariantIdData.value + '&price=' + filteredPrice + '&customerId=', true);
            req.onload = () => {
                if (req.status >= 200 && req.status < 400) {
                    const tableData = JSON.parse(req.responseText);
                    // ensure data isn't empty
                    if (tableData.html != ' ') {
                        if (checkOnly) {
                            resolve();
                        } else {
                            this.bulkPricingWrapper.innerHTML = tableData.html;
                            this.metresSquaredCalculations();
                            this.updatePricing();
                            resolve();
                        }
                    }
                }
            };
            req.onerror = (err) => {
                reject(err);
            };
            req.send();
        });
    }
}