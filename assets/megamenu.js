jQuery(document).ready(function ($) {
    /*$(document).on('click', '.site-navigation__li--has-sub', function (event) {
    	var $el = $(this);
    	var $target = $(event.target);
    	if($target.hasClass('site-navigation__li--has-sub') || $target.hasClass('site-navigation__link--has-sub')) {
    		if(!$el.hasClass('is-active')) {
    			$('.site-navigation__li--has-sub.is-active').removeClass('is-active');
    		}
    		$el.toggleClass('is-active');
    	}
    });*/
    $(document).on('click', '.site-navigation-brand-submenu-container', function (event) {
        var $el = $(this);
        var $target = $(event.target);
        if($target.hasClass('site-navigation-brand-submenu-container') || $target.hasClass('site-navigation__link--sub')) {
            if($target.hasClass('site-navigation__link--sub')){
                event.preventDefault();
            }
            if(!$el.hasClass('is-active')) {
                $('.site-navigation-brand-submenu-container.is-active').removeClass('is-active');
            }
            if(!$target.hasClass('site-navigation__li--brand-subelement')) {
                $el.toggleClass('is-active');
            }
        }
    });
});