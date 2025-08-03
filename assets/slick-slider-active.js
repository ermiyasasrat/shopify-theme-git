$(document).ready(function() {
if (typeof $().slick === 'function') {
//$( window ).load(function() {
  
   "use strict";
  

   
   $('#key-collection-id-sli').slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      autoplay:true,
      autoplaySpeed:4500,

      arrows: true,
      dots: true,
      appendDots: $('.slick-slider-dots'),
      prevArrow: $('.prev-arrow-sl'),
      nextArrow: $('.next-arrow-sl'),

      responsive: [{
        breakpoint: 993,
        settings: {
          arrows: false,
          dots: true,
          slidesToShow: 1,
            centerMode: true,
            centerPadding: '80px',
        }
        }, {
          breakpoint: 640,
          settings: {
            arrows: false,
            dots: true,
            slidesToShow: 1,
            centerMode: true,
            centerPadding: '80px',
          }
        }, {
          breakpoint: 420,
          settings: {
            arrows: false,
            dots: true,
            slidesToShow: 1,
            centerMode: true,
            centerPadding: '40px',
        }
      }]
   });
   
   
  $('#review-slider-trustpot').slick({
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay:false,
    arrows: true,
    dots: false,
    prevArrow: $('.prev-arrow'),
      nextArrow: $('.next-arrow'),
      adaptiveHeight: true,
    responsive: [{
      breakpoint: 993,
      settings: {
        arrows: false,
        slidesToShow: 1,

      }
      }, {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,

        }
      }, {
        breakpoint: 420,
        settings: {
          slidesToShow: 1,

      }
    }]
  });
   
  
  $('#split-quote-slider-trustpot').slick({
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay:false,
    arrows: false,
    dots: true,
        adaptiveHeight: false,
      appendDots: $('.slick-slider-dots-quote'),

  });
}


});