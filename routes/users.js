import { Router } from 'express';
const router = Router();
// import data functions
import * as lastfm from '../api/lastfm.js';
// import validation functions

router.get('/login', async (req, res) => {
  res.render('signuplogin');
});

//destroy session when logging out
// router.get('/logout', async (req, res) => {
//   req.session.destroy();
//   res.send("Logged out");
//   res.redirect('/');
// });


router
  .route('/')
  .get(async (req, res) => {
    //const data = await lastfm.searchArtistByName('cher', 5);
    //const data = await lastfm.searchTrackByName('cher', 5);
    const data = await lastfm.getInfoByUser('devv64')
    return res.status(200).json({test: 'success', data});
  });

export default router;
