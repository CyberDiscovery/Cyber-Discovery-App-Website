$(document).ready(function() {
  $('.countdown').each(function() {
    let $this = $(this);
    finalDate = parseInt($this.data('countdown'));

    $this.countdown(finalDate)
      .on('update.countdown', function(event) {
        $('> #_1', this).text(
          event.strftime('%D days %H hours')
        );
        $('> #_2', this).text(
          event.strftime('%M minutes %S seconds')
        );
      })
      .on('finish.countdown', function(event) {
        $(this).text(
          "EXPIRED"
        );
      });
  });
});

