import { Router } from 'express';
const router = Router();
// import data functions
import * as lastfm from '../api/lastfm.js';
import { getUserByUsername, updateUserById, followUser, unfollowUser, getUserById } from '../data/users.js';
import { getPostsByUser } from '../data/posts.js';
// import { getPostsByUser } from '../data/posts.js';
import { validEditedUsername, validEditedPassword } from '../data/validation.js';
import bycrypt from 'bcrypt';

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


router.route('/:username')
  .get(async (req, res) => { //public profile page / personal page
    try{
      const user = await getUserByUsername(req.params.username);
      const posts = await getPostsByUser(user._id);
      let personalAccount = false;
      if(req.session.user && req.session.user.username === user.username){
        personalAccount = true
      }

      let followClass = !user.followers.includes(req.session.user._id) ? "follow"  : "unfollow";
      let followText = !user.followers.includes(req.session.user._id) ? "Follow" : "Unfollow";

      return res.render('profilePage', {
          profilePic: user.pfp,
          username: user.username,
          posts: posts,
          followers: user.followers,
          following: user.following,
          likedPosts: user.likedPosts,
          isPersonalAccount: personalAccount,
          followClass: followClass,
          followingText: followText
      })
    }
    catch(e){
      res.status(404).render('profilePage', {error: "Profile page error"});
    }
})
  .post(async (req, res) => { //for following and unfollowing functionality

    let profile;
    try{
      profile = await getUserByUsername(req.params.username);
    }
    catch(e){
      return res.status(404).render('profilePage', {error: "Profile page error"});
    }

    if(!(req.session.user.following.includes(profile._id))){ //check if user is not following profile
      try{
        let follow = await followUser(req.session.user._id, profile._id);
        req.session.user = follow;
        return res.status(200).json(
          {
            followers: profile.followers.length,
            didJustFollow:true,
            didJustUnfollow:false
          }
        )
      }
      catch(e){
        return res.status(400).render('profilePage', {error: "Error following user"});
      }
    }
    else{
      try{
        let unfollow = await unfollowUser(req.session.user._id, profile._id);
        req.session.user = unfollow;
        return res.status(200).json(
          {
            followers: profile.followers.length,
            didJustFollow:false,
            didJustUnfollow:true
          }
        )
      }
      catch(e){
        return res.status(400).render('profilePage', {error: "Error unfollowing user"});
      }
    }
    
  }) 
;

router.route('/:username/followers').get(async (req, res) => { //followers page
  try{
    const user = await getUserByUsername(req.params.username);
    let followersList = [];
    for(let i = 0; i < user.followers.length; i++){
      let follower = await getUserById(user.followers[i]);
      followersList.push(follower);
    }
      res.render('followers', {
        username: user.username,
        followers: followersList
    })
  }
  catch(e){
    return res.status(404).render('followers', {error: "Followers page error"});
  }
});

router.route('/:username/following').get(async (req, res) => { //following page
  try{
    const user = await getUserByUsername(req.params.username);
    let followingList = [];
    for(let i = 0; i < user.following.length; i++){
      let followingUser = await getUserById(user.following[i]);
      followingList.push(followingUser);
    }
      res.render('following', {
        username: user.username,
        following: followingList
    })
  }
  catch(e){
    return res.status(404).render('following', {error: "Following page error"});
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
    return res.status(400).render('manage', {error: "Manage page error"});
  }
})
  .post(async (req, res) => { //edit profile page
    const user = await getUserByUsername(req.params.username);
    try{
      let {
        username,
        oldPassword,
        newPassword,
        confirmPassword,
        lastfmUsername //not reading this
      } = req.body;

      username = validEditedUsername(username);
      oldPassword = validEditedPassword(oldPassword);
      newPassword = validEditedPassword(newPassword);
      confirmPassword = validEditedPassword(confirmPassword);
      if(
        (newPassword === null && oldPassword !== null) || 
        (newPassword !== null && oldPassword === null)) 
        throw "Enter old and new password to change password";

      const checkOldPassword = await bycrypt.compare(oldPassword, user.password);
      if (!checkOldPassword) throw "Incorrect Old Password";

      if (newPassword !== confirmPassword) throw "New Password and Confirm Password do not match";

      lastfmUsername = validEditedUsername(lastfmUsername);      
    }
    catch(e){
      return res.status(400).render('manage', {error: e}); //redirect to manage page and display error message instead of error page
    }

    try{
      let {
        username,
        oldPassword,
        newPassword,
        confirmPassword,
        lastfmUsername
      } = req.body;

      const id = user._id;
      if(username ==='') username = user.username;
      const updatedUser = await updateUserById(id, username, newPassword, lastfmUsername); //wont work since lastfm is not connected i think
      req.session.user = updatedUser;
      return res.redirect(`/users/${username}`);
    }
    catch(e){
      return res.status(400).render('manage', {error: "Error updating user"});
    }
});

router.route('/:username/delete')
  .get(async (req, res) => { //delete post page
  try{
    const user = await getUserByUsername(req.params.username);
    // const post = await getPostsByUser(user._id);
    res.render('delete', {
        username: user.username,
    })
  }
  catch(e){
    return res.status(404).render('error', {error: e});
  }
})
  .delete(async (req, res) => {
  
})


export default router;
