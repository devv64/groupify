import { Router } from 'express';
const router = Router();
// import data functions
import * as lastfm from '../api/lastfm.js';
import { getUserByUsername } from '../data/users.js';
// import validation functions


router
  .route('/')
  .get(async (req, res) => {
    //const data = await lastfm.searchArtistByName('cher', 5);
    //const data = await lastfm.searchTrackByName('cher', 5);
    const data = await lastfm.getInfoByUser('devv64')
    return res.status(200).json({test: 'success', data});
  });


router.route('/:username').get(async (req, res) => { //public profile page / personal page
  try{
    const user = await getUserByUsername(req.params.username);
    //check if username is same as logged in user
    //if so, render profile page delete post option and no follow button
    
    const personalAccount = true; //make logic
      res.render('profilePage', {
        profilePic: user.pfp,
        username: user.username,
        posts: user.createdPosts,
        followers: user.followers,
        following: user.following,
        likedPosts: user.likedPosts,
        isPersonalAccount: personalAccount
    })
  }
  catch(e){
    res.status(404).render('error', {error: e});
  }
});

router.route('/:username/:followers').get(async (req, res) => { //followers page
  try{
    const user = await getUserByUsername(req.params.username);
      res.render('followers', {
        username: user.username,
        followers: user.followers
    })
  }
  catch(e){
  }
});

router.route('/:username/:following').get(async (req, res) => { //following page
  try{
    const user = await getUserByUsername(req.params.username);
      res.render('following', {
        username: user.username,
        following: user.following
    })
  }
  catch(e){
  }
});

router.route('/:username/manage')
  .get(async (req, res) => { //manage profile page
  try{
    const user = await getUserByUsername(req.params.username);
      res.render('manage', {
        username: user.username,
        password: user.password,
        profilePic: user.pfp,
    })
  }
  catch(e){
  }
})
  .post(async (req, res) => {
    

});


export default router;
