(function ($) {

  let followingButton = $('#like');
  
  let requestConfig = {
      method: 'POST'
    };
  
  followingButton.click(function () {
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
  });
  })(window.jQuery)