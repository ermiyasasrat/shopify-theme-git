document.addEventListener('DOMContentLoaded', function() {
  
  
  let disabled_dates = '{{settings.disabled-dates}}';
  let holidays = disabled_dates;
  let today = new Date();
  let ukDay = today.toLocaleDateString("en-GB");
  let UkTime = today.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/London",
  });
  
  //formating time for custom function
  let formattedTime = parseInt(UkTime.split(":").join(""));

  $(function () {
    //function for disabling the holidays
    function disableHolidays (date) {
      var dateString = jQuery.datepicker.formatDate("dd-mm-yy", date);
      return [holidays.indexOf(dateString) == -1];
    }
    
    //function to disable previous days including sundays
    function disableDays() {
      let day = new Date();
      let today = day.getDay();
      // console.log(day);

      if (today == 0) {
        return "+4";
      } else {
        let deliveryDate =  (formattedTime >359) ? "+3" : "+4";
        return deliveryDate;
      }
    }
    
    //getting the disabled days
    let disabled = disableDays();
    
    $("#dn_date").datepicker({
      onSelect: function(date){
        console.log(date)
        $('#dn_delivery_date_input').val(date);
      },
      beforeShow: function (input, inst) {
        $(this).attr("disabled", true);
      },
      beforeShowDay: disableHolidays,
      minDate: disabled,
      dateFormat: "dd-mm-yy",
    });
  });
  //injecting the value inside the input box
  
  
});