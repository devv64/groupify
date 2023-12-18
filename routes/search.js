import { Router } from 'express';
const router = Router();
import xss from 'xss';
import * as search from '../data/search.js';
import * as validate from '../data/validation.js';

router.get('/', async (req, res) => {
  res.status(200).render('search', { query: "", similarUsers: ["Click here to show all users"], songposts: [" "], artistposts: [" "] });
});

router.post('/', async (req, res) => {
    const query = xss(req.body.searchinput);
    try {
      if (query.length > 1000) throw 'Query too long';
      validate.validsearch(query);
    } catch (error) {
      return res.status(400).render('search', { error: error });
    }

    const similarUsers = await search.searchUsername(query);
    const songposts = await search.searchSongPosts(query);
    const artistposts = await search.searchArtistPosts(query);

    res.status(200).render('search', { query: query, similarUsers: similarUsers, songposts: songposts, artistposts: artistposts });
    
});

export default router;