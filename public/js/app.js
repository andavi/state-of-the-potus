'use strict';

$(() => {
  // helpers
  function eventHelper(e) {
    e.preventDefault();
    e.stopPropagation();
  }


  // hides and shows embedded twitter feed
  $('aside').hide();
  $('#hider').on('click', () => {
    $('aside').animate({width:'toggle'},350);
    $('#hider').html($('#hider').text() === '<' ? '>' : '<');
  });

  // // only shows specific full tweet after preview click
  // $('.preview').on('click', e => {
  //   console.log(e.target.closest('div.preview').id);
  //   const tid = e.target.closest('div.preview').id.split('-')[1];
  //   $('div.preview').hide();
  //   $(`div#full-${tid}`).show();
  // });
  // // return to previews view
  // $('a.return').on('click', e => {
  //   eventHelper(e);
  //   $(e.target).closest('div.full').hide();
  //   $('.preview').show();
  // })
});
