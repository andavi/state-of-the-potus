'use strict';

$(() => {
  // hides and shows embedded twitter feed
  $('aside').hide();
  $('#hider').on('click', () => {
    $('aside').animate({width:'toggle'},350);
    $('#hider').html($('#hider').text() === '<' ? '>' : '<');
  });
});
