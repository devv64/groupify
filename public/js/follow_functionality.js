(function ($) {

let followingButton = $('#followingButton');
// let username = $('#name')[0].textContent;
// let followers = $('#followers')

let requestConfig = {
    method: 'POST'
    // url: '/users/' + username
  };


followingButton.click(function () {
    // console.log('clicked');
    requestConfig.method = 'POST';
    $.ajax(requestConfig)
    .then(function (responseMessage) { 
            if(responseMessage.didJustFollow){
                console.log("unfollow button should show")
                $('#followers')[0].innerText = (responseMessage.followers + ' Followers')
                let unfollowButton = $(`<button type="submit" class="unfollow" id="followingButton">Unfollow</button>`)
                followingButton.replaceWith(unfollowButton);
                followingButton = unfollowButton;
                // $('#followingButton').innerHTML = unfollowButton
            }
            else{
                console.log("follow button should show")
                $('#followers')[0].innerText = (responseMessage.followers + ' Followers')
                let followButton = $(`<button type="submit" class="follow" id="followingButton">Follow</button>`)
                followingButton.replaceWith(followButton);
                followingButton = followButton;
                //$('#followingButton').innerHTML = followButton
            }


    })
});
})(window.jQuery)



// followButton.click(function () {
//     $.ajax(requestConfig)
//     .then(function (responseMessage) {
//         console.log(responseMessage);
//         let followNum = followers[0].innerText.split(' ')[0];
//         followNum = Number.parseInt(followNum) + 1;
//         console.log($('#followers'))
//         $('#followers')[0].innerText = (followNum + ' Followers');
//     });
// });

// unfollowButton.click(function () {
//     $.ajax(requestConfig)
//     .then(function (responseMessage) {
//         console.log(responseMessage);
//         let followNum = followers[0].innerText.split(' ')[0];
//         followNum = Number.parseInt(followNum) - 1;
//         $('#followers')[0].innerText = (followNum + ' Followers');
//     });
// });
