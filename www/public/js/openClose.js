$(document).ready(function () {
  $('#toggle-all').click(function () {
    console.log($(this).text());
    if ($(this).text() == 'Collapse All') {
      $(this)
        .text('Expand All')
        .removeClass('btn-danger')
        .addClass('btn-success');
    } else {
      $(this)
        .text('Collapse All')
        .removeClass('btn-success')
        .addClass('btn-danger');
    }
  });
});
