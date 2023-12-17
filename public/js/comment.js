(function ($) {
    //Reference to form to create comment
    let newCommentForm = $("#create-comment");

    //div for displaying comments
    let showComments = $("#show-comments");
    
    // const urlParams = new URLSearchParams(window.location.search);
    // const postId = urlParams.get("post_id");

    let url = window.location.href;
    let parts = url.split("/");
    let postId = parts[parts.length - 1];

    // console.log("Post Id HERE: '", postId, "'");
    
    newCommentForm.submit(function (event){
        event.preventDefault();
        //Reference to comment body
        let newCommentBody = $("#comment-body");
        let newComment = newCommentBody.val();

        

        
        if(newComment){
            let requestConfig = {
                method: 'POST',
                url: '/posts/' + postId,
                contentType: 'application/json',
                data: JSON.stringify({
                    comment: newComment,
                    postId: postId
                })
            }

            $.ajax(requestConfig).then(function (responseMessage){
                let newElement = $(responseMessage);
                showComments.append(newElement);
                showComments.val('');
                newCommentBody.val('');
            });
        };

    });
})(window.jQuery);