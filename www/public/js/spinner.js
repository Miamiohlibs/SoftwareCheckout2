window.addEventListener('pageshow', function () {
  // this code will run when the page is loaded, including from the back/forward button
  const spinnerWrapper = document.getElementById('spinner-wrapper');
  spinnerWrapper.innerHTML = '';
  console.log(spinnerWrapper.innerHTML);
});

$(document).ready(function () {
  $('a').click(function (event) {
    // event.preventDefault();
    let downloading = $(this).attr('download');
    if (typeof downloading == 'string') {
      return;
    }
    console.log('clicked');
    if ($(this).attr('href').startsWith('#')) {
      return;
    }
    setTimeout(() => {
      $('#spinner-wrapper').html(
        '<div class="d-flex flex-column justify-content-center align-items-center full-height"><div class="spinner"></div><div>Loading...</div></div>'
      );
    }, 300); // wait .3 seconds before showing the spinner
  });
});
