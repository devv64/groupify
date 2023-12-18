(function ($) {

  let likeButton = $('#likeButton');
  
  let url = window.location.href;
  let parts = url.split("/");
  let postId = parts[parts.length - 1];
  if (postId.includes("?")) {
    postId = postId.split("?")[0];
  }

  likeButton.click(function (event) {
      let requestConfig = {
        method: 'POST',
        url: '/posts/' + postId + "/like",
        contentType: 'application/json'
      };

      $.ajax(requestConfig)
      .then(function (responseMessage) { 
        let likesText = responseMessage.likes === 1 ? '1 like' : responseMessage.likes + ' likes';
        $('#likes').html(likesText);
        if(responseMessage.liked == "Like"){
          $('#likeButton').html('Unlike')
          $('#likeButton').removeClass('Like')
          $('#likeButton').addClass('Unlike')
        }
        else{
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