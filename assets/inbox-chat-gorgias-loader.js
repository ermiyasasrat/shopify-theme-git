(function () {

    /**
     * @typedef {Object} BusinessHour
     * @property {string} days
     * @property {string} fromTime
     * @property {string} toTime
     */

    /**
     * @param {Array<BusinessHour>} businessHours
     * @param {Date} nowUtc
     * @returns {boolean}
     */
    function isOpenNow(businessHours, nowUtc) {
        var dayOfWeek = nowUtc.getUTCDay();
        var currentTime = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();

        for (var i = 0; i < businessHours.length; i++) {
            var hours = businessHours[i];
            var daysArray = hours.days.split(',').map(Number);

            var fromTimeParts = hours.fromTime.split(':');
            var fromTimeMinutes = parseInt(fromTimeParts[0], 10) * 60 + parseInt(fromTimeParts[1], 10);

            var toTimeParts = hours.toTime.split(':');
            var toTimeMinutes = parseInt(toTimeParts[0], 10) * 60 + parseInt(toTimeParts[1], 10);

            if (daysArray.includes(dayOfWeek) && currentTime >= fromTimeMinutes && currentTime <= toTimeMinutes) {
                return true;
            }
        }
        return false;
    }

    function parseDate(input) {
        var pattern = /(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})([+-]\d{4})/;
        var match = input.match(pattern);
        if (match) {
            var formatted = match[1] + match[2].slice(0, 3) + ":" + match[2].slice(3);
            return new Date(formatted);
        }
        return null;
    }

    /**
     * @typedef {Object} InboxChatGorgiasOption
     * @property {Array<BusinessHour>} businessHours
     * @property {String} nowUtc
     */

    /**
     * @param {InboxChatGorgiasOption} options
     * @returns {boolean}
     */
    function prepareInboxChatGorgias(options) {
        var businessHours = options.businessHours,
            nowUtc = new Date(parseDate(options.nowUtc)),
            permanent_domain = options.permanent_domain;
        var gorgiasChatContainerMockEl = document.querySelector('#gorgias-chat-container-f');
        var gorgiasChatStyleEl = document.querySelector('#gorgias-chat-style-f');
        var initGorgiasChatPromise = (window.GorgiasChat) ? window.GorgiasChat.init() : new Promise(function (resolve) { window.addEventListener('gorgias-widget-loaded', function () { resolve();})});
        var bundleLoaderUrl = 'https://config.gorgias.chat/bundle-loader/01HP71FP8F8C54X7SR7Z0AYBRQ?source=shopify1click&shop=' + permanent_domain;

        if (gorgiasChatContainerMockEl) {
            gorgiasChatContainerMockEl.classList.add('prepared-to-load');
            if(isOpenNow(businessHours, nowUtc)) {
                gorgiasChatContainerMockEl.classList.add('is-open-time');
            }
        }

        var resources = [
            { "name": "script", "url": bundleLoaderUrl },
            { "name": "script", "url": 'https://bundle.dyn-rev.app/loader.js?g_cvt_id=18f6bdfe-4745-41f4-be6f-4fa356d7bff9&shop=' + permanent_domain }
        ];
        resourceManager.loadResourceOnInteractive(resources, {
            triggerEvents: {
                baseEvents: {
                    'click': '#gorgias-chat-container-f'
                },
                readyInteractive: false,
            },
            beforeLoad: function () {
                initGorgiasChatPromise.then(function() {
                    domRemoveElement(gorgiasChatContainerMockEl);
                    domRemoveElement(gorgiasChatStyleEl);
                });
            }
        });

        if(gorgiasChatContainerMockEl) {
            gorgiasChatContainerMockEl.addEventListener('click', function(event) {
                initGorgiasChatPromise.then(function() {
                    window.GorgiasChat.open();
                });
            });
        }
    }

    window.prepareInboxChatGorgias = prepareInboxChatGorgias;
})();