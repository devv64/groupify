import { Router } from 'express';
const router = Router();

// import { posts } from '../config/mongoCollections.js';

// TODO: clean up the way this is being done
import { getSomePosts, createPost } from '../data/posts.js';

router
  .route('/feed')
  .get(async (req, res) => {
    const posts = await getSomePosts();
    res.render('feed', { posts })
  })
  .post(async (req, res) => {
    const { body, userId, lastfmSong, lastfmArtist } = req.body;
    try {
      const post = await createPost(body, userId, lastfmSong, lastfmArtist);
      console.log(post);
      res.redirect(`/posts/${post._id}`, { post });
    } catch (e) {
      res.status(400).render('feed', { error: e });
    }
  })

export default router;