function id_from_name(string) {
  let reg_expr = /[^a-zA-Z0-9-_]/g;
  return string.replace(reg_expr, ""); // remove spaces
}

function calculate_width(s, e) {
  let now = Date.now();
  let start = new Date(s);
  let end = new Date(e);
  let percentage;
  if (now < start) {
    percentage = 0;
  } else if (now > end) {
    percentage = 100;
  } else {
    let fraction = (now-start)/(end-start);
    percentage = fraction * 100;
  }
  return percentage;
}

$(document).ready(function() {
  
  $('.navbar-link').each(function() {
    // when clicked hide the other schedules and show that one
    $(this).on("click", function() {

      $('.schedule').each(function() {
        $(this).css("display", "none");
      });
      
      // get the schedule with the same name as the text of the navbar item clicked and set display to block
      let id = id_from_name($(this).text());
      $('#' + id).css("display", "block");

    })
  });
  $($('.schedule')[0]).css('display', 'block');

  setInterval(function () {

    $('.progress > span').each(function() {
      // every 10th of a second update the width of the green bar (span)
      let start = $(this).data('start');
      let end = $(this).data('end');
      let width = calculate_width(start, end);
      $(this).width(width.toString()+'%');

      // if the event is finished make the tick green
      if (width >= 100) {
        $(this).parent().siblings('.main').children('.tick').css("color", "var(--green-check)");
      }

    });
  }, 100);

});

