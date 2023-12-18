import { Router } from 'express';
import * as userData from '../data/users.js';
import * as validate from '../data/validation.js';
import xss from 'xss';
const router = Router();

// import { posts } from '../config/mongoCollections.js';

// TODO: clean up the way this is being done
import * as postsData from "../data/posts.js";
import * as commentsData from "../data/comments.js";

router
  .route('/:post_id')
  // ! Need to fix when it isn't a proper post_id
  .get(async (req, res) => {
    try {
      const post_id = xss(req.params.post_id)
      const post = await postsData.getPostById(post_id)
      const success = xss(req.query.success)
      const postComments = await commentsData.getAllCommentsByPostId(post_id);
      const username = req.session.user.username
      const likes = post.likes.length
      const isLiked = await postsData.isLiked(post_id, req.session.user._id)
      const liked = isLiked ? "Unlike" : "Like"
      return res.render('posts', { post, postComments, username, likes, liked, success })
    } catch (e) {
      return res.status(400).render('feed', { error: e });
    }
  })
  .post(async (req, res) => {
    // const lastfmSong = xss(req.body.lastfmSong);
    // const lastfmArtist = xss(req.body.lastfmArtist);
    try {
        const post_id = xss(req.params.post_id);
        const username = xss(req.session.user.username);
        let commentBody = xss(req.body.comment);
        if (!commentBody) throw "Comment must be provided";
        if (typeof commentBody !== "string") throw "Invalid comment type";
        if ((commentBody = commentBody.trim()).length === 0) throw "Comment cannot be empty";
        if (commentBody.length > 300) throw "Comment must be less than 300 characters";
        const comment = await commentsData.createComment(post_id, username, commentBody);
        
        return res.render('partials/comment', {layout:null, ...comment, user: username});
    } catch (e) {
        if (
            e && typeof(e) === "string" &&
            (e.indexOf("No user with id") >= 0 ||
                e.indexOf("Comment not found") >= 0 ||
                e.indexOf("Could not get all events") >= 0)
        ) {
            // return res.status(404).render("posts", {post, error: e });
            return res.status(404).render("feed", {error: e });
        } else {
            return res.status(400).render("feed", {error: e });
        }
    }
  });

  router
  .route('/:post_id/like')
  .post(async (req, res) => {

    try {
      const post_id = xss(req.params.post_id);
      const userId = xss(req.session.user._id);

      const isLiked = await postsData.isLiked(post_id, userId);
      if (isLiked) {
        const updatedPost = await postsData.removeLikeFromPost(post_id, userId);
        let updatedUser = await userData.getUserById(userId);
        req.session.user = updatedUser;
        return res.status(200).json({
          likes: updatedPost.likes.length,
          liked: "Unlike"
        })
      } else {
        const updatedPost = await postsData.addLikeToPost(post_id, userId);
        let updatedUser = await userData.getUserById(userId);
        req.session.user = updatedUser;

        return res.status(200).json({
          likes: updatedPost.likes.length,
          liked: "Like"
        })
      }
    } catch (e) {
      return res.status(400).render('feed', { error: e });
    }
  });

router
    .route('/:post_id/deletecomment')
    .post(async (req, res) => {
        try {
            const postId = xss(req.params.post_id);
            const commentToDelete = xss(req.body.commentToDelete);
            const commentFromId = await commentsData.getCommentById(commentToDelete);

            if(req.session.user.username !== commentFromId.username){
                return res.status(400).render("posts", { error: "Cannot Delete other users comments" });
            }

            const comment = await commentsData.removeComment(commentToDelete);
            const success = encodeURIComponent("Comment Deleted!");
            
            return res.redirect(`/posts/${postId}?success=${success}`);
        } catch (e) {
            return res.status(404).render("posts", {error: e });
        }
    });

export default router;
