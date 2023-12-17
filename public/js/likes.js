(function ($) {

  let likeButton = $('#like');
  
  let requestConfig = {
      method: 'POST',
    };
  
  likeButton.click(function (event) {
      event.preventDefault();
      requestConfig.method = 'POST';
      $.ajax(requestConfig)
      .then(function (responseMessage) { 
        if(responseMessage.liked == "Liked"){
          $('#likes').html(responseMessage.likes + ' Likes')
          $('#liked').html('Unlike')
          $('#liked').removeClass('Liked')
          $('#liked').addClass('Unliked')
        }
        else{
          $('#likes').html(responseMessage.likes + ' Likes')
          $('#liked').html('Like')
          $('#liked').removeClass('Unliked')
          $('#liked').addClass('Liked')
        }
      })
      .fail(function (xhr, status, error) {
        console.log(error, status, xhr);
      });
  });
  })(window.jQuery)