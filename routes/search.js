import { Router } from 'express';
const router = Router();
import xss from 'xss';
import * as search from '../data/search.js';
import * as validate from '../data/validation.js';

router.get('/', async (req, res) => {
  try {
    const error = xss(req.query.error);
    const nosearchyet = [{username: "nosearchyet", _id: "nosearchyet"}];
    res.status(200).render('search', { error: error, query: "", similarUsers: nosearchyet, songposts: nosearchyet, artistposts: nosearchyet });
  } catch (e) {
    res.status(400).render('search', { error: e, query: "", similarUsers: nosearchyet, songposts: nosearchyet, artistposts: nosearchyet});
  }
});

router.post('/', async (req, res) => {
  try {
      const query = xss(req.body.searchinput);
      if (query.length > 1000) throw 'Query too long';
      validate.validsearch(query);
      const similarUsers = await search.searchUsername(query);
      const songposts = await search.searchSongPosts(query);
      const artistposts = await search.searchArtistPosts(query);
      res.status(200).render('search', { query: query, similarUsers: similarUsers, songposts: songposts, artistposts: artistposts }); 
    } catch (error) {
      return res.status(400).render('search', { error: error });
    }
   
});

export default router;