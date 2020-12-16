$('.container').scroll(function (event) {
  var posTop = $(window).scrollTop() - $(this).offset().top
    // Do something
    console.log(posTop);
});