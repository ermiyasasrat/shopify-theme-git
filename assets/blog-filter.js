$(document).ready(function () {
  function tagContent(link, shouldScroll = false) {
    $.ajax({
      url: link,
      type: "GET",
      success: function (data) {
        let content_list = $(data)
          .find(".blog-container-tag .blog-list")
          .html();
        let pagination_div = $(data)
          .find(".blog-container-tag .pagination")
          .html();

        $(".blog-container-tag .blog-list").html(content_list);
        $(".blog-container-tag .pagination").html(pagination_div);

       
      if (shouldScroll) {
          let blogListOffset = $(".blog-container-tag .blog-list").offset().top;
          let windowHeight = $(window).height();
          let scrollPosition = blogListOffset - windowHeight / 2;

          $("html, body").animate(
            {
              scrollTop: scrollPosition,
            },
            600 
          );
        }


        attachPaginationHandler();
      },
    });
  }

  function attachPaginationHandler() {
    $(".blog-container-tag .pagination a").on("click", function (e) {
      e.preventDefault(); 
      let nextLink = $(this).attr("href");
      if (nextLink) {
        tagContent(nextLink, true);
      }
    });
  }

  $(".blog-filter-key").on("click", function () {
    var blogFilterKey = $(this).attr("data-key");
    blogFilterKey = "Type_" + blogFilterKey;

    if (blogFilterKey === "Type_How-To") {
      blogFilterKey = "Type_How-to";
    }

    $(".blog-filter-key").removeClass("active");
    $(this).addClass("active");

    sessionStorage.setItem("blogActive", blogFilterKey);
    let my_link = "/blogs/stories/tagged/" + blogFilterKey;
    if (blogFilterKey === "Type_all") {
      my_link = "/blogs/stories";
      sessionStorage.setItem("blogActive", "all");
    }
    tagContent(my_link); 
  });

  var current_filter = sessionStorage.getItem("blogActive");
  if (current_filter) {
    let load_link = "/blogs/stories/tagged/" + current_filter;
    if (current_filter !== "all") {
      $(".blog-filter-key").removeClass("active");
      let active_key = current_filter.replace("Type_", "");
      if (active_key === "How-to") {
        active_key = "How-To";
      }
      $('.blog-filter-key[data-key="' + active_key + '"]').addClass("active");
      tagContent(load_link);
    }
  }

  
  attachPaginationHandler();
});
