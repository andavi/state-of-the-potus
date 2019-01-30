'use strict';

$(() => {
  $('aside').hide();
  $('#hider').on('click', () => {
    $('aside').toggle();
    $('#hider').html($('#hider').text() === '<' ? '>' : '<');
  });
});
