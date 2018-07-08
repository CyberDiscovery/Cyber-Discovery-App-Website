$(document).ready(function() {
  $('.countdown').each(function() {
    var $this = $(this);
    finalDate = parseInt($this.data('countdown'));

    $this.countdown(finalDate)
      .on('update.countdown', function(event) {
        $(this).text(
          event.strftime('%D days %H hours %M minutes %S seconds')
        );
      })
      .on('finish.countdown', function(event) {
        $(this).text(
          "EXPIRED"
        );
      });
  });
});

