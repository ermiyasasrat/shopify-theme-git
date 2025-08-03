$(document).ready(function(){
  // Get the modal
  var modal = document.getElementById('myModal');

  // Get the button that opens the modal
  var openBtn = document.getElementById("modal-open-btn");

  // Get the <span> element that closes the modal
  var closeBtn = document.getElementById('modal-close-btn');
  let returnBtn = document.getElementById('return_cart_btn');

  returnBtn.onclick = function(){
    modal.style.display = "none";
  } 

  // When the user clicks on the button, open the modal
  openBtn.onclick = function() {
    modal.style.display = "block";
  }

  // When the user clicks on <span> (x), close the modal
  closeBtn.onclick = function() {
    modal.style.display = "none";
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }
  let checkoutBtn = document.getElementById('checkout_btn');

  checkoutBtn.onclick=function(){
    var sampleCount = $('#checkout_btn').attr('data-sample-count');
    sampleCount = parseInt(sampleCount);
    if(sampleCount > 3){
    	$('.samples-exceeded').fadeIn();
    }else{
      	//hide cart error
      	$('.samples-exceeded').hide();
      	//show checkout modal
    	modal.style.display= "block";
    }
    
  }

  var formChecker = [];
  $('#checkout-form input').on('change', function(){
    if($(this).val() == ''){
    	$(this).siblings('.error-message').show();
    }else{
    	$(this).siblings('.error-message').hide();
    }    
  });
  
  
  
  
  $('#complete_checkout_btn').on('click', function(event){
    event.preventDefault();

    

    let sampleArray = {
      line_items: []
    };  
    

    let errorMessage = $('.error-message');
// 	let errorMessage = `<p style="color:red" class='error-message'>Fill this field</p>`;
    var form_checker = [];
    
      //var formChecker = [];
      //check all fields
      $('#checkout-form input').each(function(){

        if($(this).val() == ''){
          if($(this).hasClass('passMe')){
          	//push val
            $(this).siblings('.error-message').hide();
			var pushKey = $(this).attr('name');
          	var pushVal = $(this).val();
          	sampleArray[pushKey] = pushVal;
          }else{
          	//throw error
            $(this).siblings('.error-message').show();
            form_checker.push('invalid');
          }
        }else{
            $(this).siblings('.error-message').hide();
			var pushKey = $(this).attr('name');
          	var pushVal = $(this).val();
          	sampleArray[pushKey] = pushVal;
        }
      });    

    //final check
    if(form_checker.includes("invalid")){
      //do not submit form
      //$('#checkout-form').after('');
      console.log('Cheating ey?');
    }else{
      
      //add screen blocker
      $('body').after('<div class="loading">Please hang tight</div>');
      
      console.log(sampleArray);
      //submit the form
      var cartContents = fetch("/cart.js")
      .then((response) => response.json())
      .then((data) => {
        let items = data.items;


//Natural Lacquered European Engineered Oak Click Flooring 15/3 x 127mm

        items.forEach((item) => {

          let sampleId = item.properties._sample_product_id;
          var sampleTitle = item.properties["Sample of"];
          console.log('Sample Title '+sampleTitle);
          let sample_product = {
            variant_id: sampleId,
            quantity: 1,
            properties: [
              {
                "Sample of":sampleTitle,
                "Vendor":item.properties.Vendor,
                "_sample_product_id":item.properties.Vendor
              }
            ],
            applied_discount: {
              description: "Free Sample adjustments",
              value_type: "percentage",
              value: "100",
              title: "Free Sample",
            },
          };
          sampleArray.line_items.push(sample_product);

        });
        console.log(sampleArray);
        $.ajax({
          method: 'GET',
          crossDomain: true,
          crossOrigin: true,
          data: sampleArray,
          headers: {
            'Access-Control-Allow-Methods': '*',
            "Access-Control-Allow-Credentials": true,
            "Access-Control-Allow-Headers" : "Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization",
            "Access-Control-Allow-Origin": "*",
            "Control-Allow-Origin": "*",
            "cache-control": "no-cache",
            'Content-Type': 'application/json'
          },
          url: 'https://stories.storehelps.com/sample-order.php',
          success: function(response){
            console.log(response);
            var url_getter = JSON.parse(response);
            console.log(url_getter);
            
            //clear the cart
                $.ajax({
                  type: "POST",
                  url: '/cart/clear.js',
                  success: function(){
                    console.log('You cleared the cart!');
                    setTimeout(function(){ 
                      window.location.href = url_getter.invoice_url; 
                    }, 1000);
                    
                  },
                  dataType: 'json'
                });
            //clear cart ends
          },
          error: function (error) {
            console.log("There was an error: ", error);
          }
        });
      });
    };
  });  
});