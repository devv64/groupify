(function ($) {

let followingButton = $('#followingButton');

let requestConfig = {
    method: 'POST'
  };

followingButton.click(function () {
    requestConfig.method = 'POST';
    $.ajax(requestConfig)
    .then(function (responseMessage) { 
            if(responseMessage.didJustFollow){
                $('#followers').html(responseMessage.followers + ' Followers')
                $('#followingButton').html('unfollow')
                $('#followingButton').removeClass('follow')
                $('#followingButton').addClass('unfollow')
            }
            else{
                $('#followers').html(responseMessage.followers + ' Followers')
                $('#followingButton').html('follow')
                $('#followingButton').removeClass('unfollow')
                $('#followingButton').addClass('follow')
            }
    })
});
})(window.jQuery)