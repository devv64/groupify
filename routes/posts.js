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
      const post_id = xss(req.params.post_id);
      const post = await postsData.getPostById(post_id);
      const postComments = await commentsData.getAllCommentsByPostId(post_id);
      const username = req.session.user.username;
      const likes = post.likes.length;
      const isLiked = await postsData.isLiked(post_id, req.session.user._id);
      const liked = isLiked ? "Unlike" : "Like";
      
      return res.render('posts', { post, postComments, username, likes, liked });
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
        const commentBody = xss(req.body.comment);
        let post = await postsData.getPostById(post_id);
        const comment = await commentsData.createComment(post_id, username, commentBody);
        post = await postsData.getPostById(post_id);

        await userData.addNotification(post.userId, `${username} commented on your post: "${post.body}" at ${post.createdAt.toLocaleString()}`)
        
        return res.render('partials/comment', {layout:null, ...comment, user: username});
    } catch (e) {
        if (
            e &&
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
       try{
        //Need to implement
       }catch(e){
       
        } 
    });

export default router;
