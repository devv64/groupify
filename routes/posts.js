import { Router } from 'express';
import * as userData from '../data/users.js';
import * as validate from '../data/validation.js';
import xss from 'xss';
const router = Router();

// import { posts } from '../config/mongoCollections.js';

// TODO: clean up the way this is being done
import * as postsData from '../data/posts.js';

router
  .route('/:post_id')
  // ! Need to fix when it isn't a proper post_id
  .get(async (req, res) => {
    try {
      const post_id = req.params.post_id
      const post = await postsData.getPostById(post_id)
      const username = req.session.user.username
      return res.render('posts', { post, username })
    } catch (e) {
      return res.status(400).render('feed', { error: e })
    }
  })

  router
  .route('/:post_id/like')
  .post(async (req, res) => {
    try {
      const post_id = req.params.post_id;
      const userId = req.session.user._id;

      const isLiked = await postsData.isLiked(post_id, userId);

      if (isLiked) {
        const updatedPost = await postsData.removeLikeFromPost(post_id, userId);
        return res.status(200).json({
          likes: updatedPost.likes.length,
          liked: false
        })
      } else {
        const updatedPost = await postsData.addLikeToPost(post_id, userId);
        return res.status(200).json({
          likes: updatedPost.likes.length,
          liked: true
        })
      }
    } catch (e) {
      return res.status(400).render('feed', { error: e });
    }
  });



export default router;
