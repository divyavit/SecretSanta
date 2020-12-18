$.fn.christmas = function() {
    $(this).each(function() {
      $(this).html($(this).text().split("").map(function(v, i) {
        return '<span class="christmas-' + (i % 2 == 0 ? 'gold' : 'blue') + '">' + v + '</span>';
      }).join(""));
    });
  };
  
  $(function() { 
    $('h1.christmas').christmas();
  });
  
  
  $('.container').on('mouseover', function(){
    $('.bauble').addClass('light');
    $('.star').addClass('star-light');
  })
  
  $('.container').on('mouseout', function(){
    $('.bauble').removeClass('light');
  })