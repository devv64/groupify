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
    if (postId.includes("?")) {
        postId = postId.split("?")[0];
    }

    // console.log("Post Id HERE: '", postId, "'");
    let error = $("#error");
    // error.hide();
    
    newCommentForm.submit(function (event){
        event.preventDefault();
        error.fadeOut();
        //Reference to comment body
        let newCommentBody = $("#comment-body");
        let newComment = newCommentBody.val();

        try {
            //error check if newcomment to length is greater than 300 characters
            newComment = newComment.trim();
            if (newComment === "") throw "Comment cannot be empty";
            if(newComment.length > 300){
                throw "Comment cannot be more than 300 characters";
            }

            
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
        } catch (e) {
            error.hide().text(e).fadeIn();
        }
    });
})(window.jQuery);