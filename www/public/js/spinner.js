// window.addEventListener('load', function () {
//   console.log('page loaded');
//   const spinnerWrapper = document.getElementById('spinner-wrapper');
//   spinnerWrapper.innerHTML = '';
//   console.log(spinnerWrapper.innerHTML);
//   // empty the aside element
// });

window.onpopstate = () => setTimeout(console.log('mozilla zero timeout'), 0);
window.onbeforeunload = (event) => {
  event.preventDefault();

  console.log('page is about to be unloaded');
  console.log('subsequent log');
  try {
    console.log('starting to try to remove spinner');
    let spinnerWrapper = document.getElementById('spinner-wrapper');
    spinnerWrapper.innerHTML = '';
    console.log('finished removing spinner');
  } catch (err) {
    console.log('error removing spinner');
    console.log(err);
  }
};
$(document).on('popstate', function () {
  //   $('#spinner-wrapper').html('');
  console.log('page loaded', Date.now());
});

$(document).ready(function () {
  $('#spinner-wrapper').html('');
  console.log('page loaded', Date.now());
  //   alert($('#spinner-wrapper').html());
  const spinnerWrapper = $('#spinner-wrapper');
  spinnerWrapper.html('');

  $('a').click(function () {
    if ($(this).attr('href') == '#') {
      return;
    }
    setTimeout(() => {
      $('#spinner-wrapper').html(
        '<div class="d-flex flex-column justify-content-center align-items-center full-height"><div class="spinner"></div><div>Loading...</div></div>'
      );
    }, 300); // wait .3 seconds before showing the spinner
  });
});
