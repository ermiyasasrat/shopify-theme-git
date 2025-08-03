(function () {
  const DATE_ISO_8601_FORMAT = 'YYYY-MM-DD';

  const Day = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  function calculateDeliveryDateAvailable(today = new Date()) {
    let deliveryDate = new Date(
      Date.UTC(
        today.getUTCFullYear(),
        today.getUTCMonth(),
        today.getUTCDate() + 1,
        today.getUTCHours(),
        today.getUTCMinutes(),
        today.getUTCSeconds(),
        today.getUTCMilliseconds(),
      ),
    );

    let workingDaysAdded = 0;

    while (workingDaysAdded < 2) {
      deliveryDate.setUTCDate(deliveryDate.getUTCDate() + 1);

      const dayOfWeek = deliveryDate.getUTCDay();
      if (dayOfWeek !== Day.Sunday && dayOfWeek !== Day.Saturday) {
        workingDaysAdded++;
      }
    }

    return deliveryDate;
  }

  function getDaySuffix(day) {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  function formatDateToLongString(date) {
    // Array of month names
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // Array of day names
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];

    // Get the day of the week, day of the month, month, and year
    const dayOfWeek = days[date.getUTCDay()];
    const dayOfMonth = date.getUTCDate();
    const month = months[date.getUTCMonth()];
    // const year = date.getUTCFullYear();

    // Function to determine the suffix for the day of the month

    // Format the date string with the correct suffix
    const dayWithSuffix = `${dayOfMonth}${getDaySuffix(dayOfMonth)}`;

    return `${dayOfWeek}, ${month} ${dayWithSuffix}`;
  }

  window.formatDateToLongString = formatDateToLongString;
  window.calculateDeliveryDateAvailable = calculateDeliveryDateAvailable;
})();
