(function ($) {

  let likeButton = $('#likeButton');
  
  let url = window.location.href;
  let parts = url.split("/");
  let postId = parts[parts.length - 1];


  
  likeButton.click(function (event) {
      // event.preventDefault();
      let requestConfig = {
        method: 'POST',
        url: '/posts/' + postId + "/like",
        contentType: 'application/json'
      };

      $.ajax(requestConfig)
      .then(function (responseMessage) { 
        if(responseMessage.liked == "Like"){
          $('#likes').html(responseMessage.likes + ' Likes')
          $('#likeButton').html('Unlike')
          $('#likeButton').removeClass('Like')
          $('#likeButton').addClass('Unlike')
        }
        else{
          $('#likes').html(responseMessage.likes + ' Likes')
          $('#likeButton').html('Like')
          $('#likeButton').removeClass('Unlike')
          $('#likeButton').addClass('Like')
        }
      })
      .fail(function (xhr, status, error) {
        console.log(error, status, xhr);
      });
  });
  })(window.jQuery)