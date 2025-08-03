$(document).ready(function(){
  var findFilter = setInterval(function(){
    if($('#bc-sf-filter-tree').length > 0){
      var newcol = $('.collection-nav_links').html();
      $('.bc-sf-filter-left-col').prepend(newcol);
      
      clearInterval(findFilter);
    }
  }, 1);
  
  $(document).on('click', '#bc-sf-filter-tree-mobile-button', function(){
  	$(document).find('.bc-sf-filter-left-col .collection-nav-holder').toggle();
  });
  
});