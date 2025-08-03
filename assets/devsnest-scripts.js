$(document).ready(function(){
  
  //var vid = $('.js-gallery-image video');
  var vid = document.getElementById("flooring_video"); 
  
  function playVid() {
      vid.play();
  }

  function pauseVid() {
      vid.pause();
  }  
  
  $('.videoX').on('click', function(){
  	playVid();
  });
  
  $('.noVideo').on('click', function(){
  	pauseVid();
  });
  
  
});