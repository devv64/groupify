import { Router } from 'express';
const router = Router();
// import data functions
import * as lastfm from '../api/lastfm.js';
import { getUserByUsername, updateUserById } from '../data/users.js';
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
    // ! Change this
    const data = await lastfm.getInfoByUser('devv64')
    return res.status(200).json({test: 'success', data});
  });


router.route('/:username').get(async (req, res) => { //public profile page / personal page
  try{
    const user = await getUserByUsername(req.params.username);
    let personalAccount = false;
    if(req.session.user && req.session.user.username === user.username){
      personalAccount = true
    }
    return res.render('profilePage', {
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

router.route('/:username/followers').get(async (req, res) => { //followers page
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

router.route('/:username/following').get(async (req, res) => { //following page
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
        password: user.password
    })
  }
  catch(e){
  }
})
  .put(async (req, res) => {
    const user = await getUserByUsername(req.params.username);
    try{
      let {
        username,
        oldPassword,
        newPassword,
        picture
      } = req.body;
      //validation
    }
    catch(e){
      return res.status(400).render('error', {error: e});
    }

    try{
      let {
        username,
        oldPassword,
        newPassword,
        picture
      } = req.body;

      const id = user._id;
      const updatedUser = await updateUserById(id, username, newPassword, picture);
      req.session.user = updatedUser;
      return res.redirect("/:username");
    }
    catch(e){
      return res.status(400).render('error', {error: e});
    }
});


export default router;
