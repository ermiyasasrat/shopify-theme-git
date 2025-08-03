(function () {
    function getInboxChatUrl() {
        var chatButton = document.getElementById('chat-button-container');
        var buttonColor = encodeURIComponent(chatButton.getAttribute('data-color'));
        var buttonSecondaryColor = encodeURIComponent(chatButton.getAttribute('data-secondary-color'));
        var buttonTernaryColor = encodeURIComponent(chatButton.getAttribute('data-ternary-color'));
        var shopDomain = chatButton.getAttribute('data-domain');
        var externalIdentifier = chatButton.getAttribute('data-external-identifier');
        var inboxChatScriptUrl = chatButton.getAttribute('data-inbox-chat-script-url');

        return inboxChatScriptUrl + '?button_color=' + buttonColor +
            '&sc=' + buttonSecondaryColor +
            '&tc=' + buttonTernaryColor +
            '&i=' + encodeURIComponent(chatButton.getAttribute('data-icon')) +
            '&t=' + encodeURIComponent(chatButton.getAttribute('data-text')) +
            '&p=' + encodeURIComponent(chatButton.getAttribute('data-horizontal-position')) +
            '&vp=' + encodeURIComponent(chatButton.getAttribute('data-vertical-position')) +
            '&shop_id=' + externalIdentifier +
            '&shop=' + shopDomain;
    }

    var EVENT_LOAD_INBOX_CHAT_JS = 'load-inbox-chat';
    var chatButtonWrapper = document.getElementById('chat-button-wrapper');
    var inboxChatLoaderUrl = chatButtonWrapper ? chatButtonWrapper.getAttribute('data-inbox-chat-loader-url') : '';
    var resourcesToPreload = [
        { "name": "script", "url": inboxChatLoaderUrl, attrs: { crossOrigin: "anonymous"} },
        { "name": "script", "url": getInboxChatUrl(), attrs: { crossOrigin: "anonymous"} },
    ];
    var resourcesToLoad = [
        { "name": "script", "url": inboxChatLoaderUrl},
    ];

    var preloadResources = resourceManager.preloadResources(resourcesToPreload);
    function loadInboxChat() {
        preloadResources.finally(function () {
            resourceManager.loadResourcesInOrder(resourcesToLoad);
            var checkInboxChatLoaderInterval = setInterval(function () {
                var $shopifyChat = $('#shopify-chat');
                if($shopifyChat.length) {
                    $('#shopify-chat-f').remove();
                    clearInterval(checkInboxChatLoaderInterval);
                }
            }, 200);
        });
    }

    $(document).one(EVENT_LOAD_INBOX_CHAT_JS, function () {
        var isMobile = window.matchMedia("(max-width: 767px)");
        if(isMobile.matches) {
            var savedPosition = $(window).scrollTop();
            $(window).on('scroll.inbox-chat-loader-fix-scroll', function (event) {
                $(window).scrollTop(savedPosition);
            });
            loadInboxChat();
            setTimeout(function() {
                $(window).off('scroll.inbox-chat-loader-fix-scroll');
            }, 200);
        } else {
            loadInboxChat();
        }
    });

    var shopifyChatData = {}
    try {
        shopifyChatData = JSON.parse(localStorage.getItem('shopifyChatData'));
    } catch (e) {
        shopifyChatData = {}
    }
    if(shopifyChatData.isOpen || $(window).scrollTop() > 0) {
        $(document).trigger(EVENT_LOAD_INBOX_CHAT_JS);
    } else {
        onReadyInteractive((event) => {
            $(document).trigger(EVENT_LOAD_INBOX_CHAT_JS);
        });
        $('#shopify-chat-f').on('click', function () {
            var checkInboxChatLoaderInterval = setInterval(function () {
                var inboxOnlineStoreChat = $('inbox-online-store-chat')[0];
                var $chatbutton = $(inboxOnlineStoreChat.shadowRoot).find('button.chat-toggle');
                if(inboxOnlineStoreChat && $chatbutton.length) {
                    $('#shopify-chat-f').remove();
                    $chatbutton.click();
                    clearInterval(checkInboxChatLoaderInterval);
                }
            }, 100);
        });
    }
})();