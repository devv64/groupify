import { Router } from 'express';
const router = Router();
// import data functions
import * as lastfm from '../api/lastfm.js';
<<<<<<< HEAD
import { getUserByUsername, updateUserById, followUser, unfollowUser, getUserById } from '../data/users.js';
=======
import { getUserByUsername, updateUserById, followUser, unfollowUser, getUserById, removeNotification } from '../data/users.js';
>>>>>>> main
import { getPostsByUser, removePostById, getPostById } from '../data/posts.js';
// import { getPostsByUser } from '../data/posts.js';
import { validEditedUsername, validEditedPassword } from '../data/validation.js';
import bcrypt from 'bcrypt';
import xss from 'xss';
import { users } from '../config/mongoCollections.js';

// import validation functions

router.get('/login', async (req, res) => {
  res.render('loginsignup');
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
      const username = xss(req.params.username)
      const profile = await getUserByUsername(username);
      const posts = await getPostsByUser(profile._id);
      const success = xss(req.query.success);
      let personalAccount = false;
      if(req.session.user && req.session.user.username === profile.username){ //check if user is viewing their own profile
        personalAccount = true
      }

      let likedPosts = [];
      for(let i = 0; i < profile.likedPosts.length; i++){ 
        let likedPost = await getPostById(profile.likedPosts[i]);
        likedPosts.push(likedPost);
      }

      let followClass = !profile.followers.includes(req.session.user._id) ? "follow"  : "unfollow";
      let followText = !profile.followers.includes(req.session.user._id) ? "Follow" : "Unfollow";

      return res.render('profilePage', {
          profilePic: profile.pfp,
          username: profile.username,
          posts: posts,
          followers: profile.followers,
          following: profile.following,
          likedPosts: likedPosts,
          isPersonalAccount: personalAccount,
          followClass: followClass,
          followingText: followText,
          success: success
      })
    }
    catch(e){
<<<<<<< HEAD
      res.status(404).render('profilePage', {error: "Profile page error:" + e});
=======
      res.status(404).render('profilePage', {error: e});
>>>>>>> main
    }
})
  .post(async (req, res) => { //for following and unfollowing functionality

    let profile;
    try{
      const username = xss(req.params.username)
      profile = await getUserByUsername(username);
    }
    catch(e){
      return res.status(404).render('profilePage', {error: "Profile page error:" + e});
    }

    if(!(req.session.user.following.includes(profile._id))){ //check if user is not following profile
      try{
        let follow = await followUser(req.session.user._id, profile._id);
        let updatedUser = await getUserById(req.session.user._id);
        req.session.user = updatedUser; //update session user with new following list
        return res.status(200).json( //return json to client side to update followers count and that user just followed
          {
            followers: follow.followers.length,
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
        let updatedUser = await getUserById(req.session.user._id);
        req.session.user = updatedUser; //update session user with new following list
        return res.status(200).json( //return json to client side to update followers count and that user just unfollowed
          {
            followers: unfollow.followers.length,
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
    const username = xss(req.params.username)
    const user = await getUserByUsername(username);
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
    const username = xss(req.params.username)
    const user = await getUserByUsername(username);
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

router.route('/:username/manage') //does not update name in feed
  .get(async (req, res) => { //manage profile page
  try{
    // ? Should this not be req.session.user
    const username = xss(req.params.username)
    const user = await getUserByUsername(username);
    const created = new Date(req.session.user.createdAt);
    let totalAccumulatedLikes = 0;
    for(let i = 0; i < user.createdPosts.length; i++){
      let post = await getPostById(user.createdPosts[i]);
      totalAccumulatedLikes += post.likes.length;
    }
      res.render('manage', {
        username: user.username,
        password: user.password,
        createdProfile : created.toLocaleDateString(),
        numberOfPosts : user.createdPosts.length,
        totalLikes : totalAccumulatedLikes,
    })
  }
  catch(e){
    return res.status(400).render('manage', {error: e});
  }
})
  .post(async (req, res) => { //edit profile page
    const username = xss(req.params.username)
    const user = await getUserByUsername(username);
    try{
      let {
        username,
        oldPassword,
        newPassword,
        confirmPassword,
        lastfmUsername //if empty, get lastfm data from logged in user, else update lastfm data with this
      } = req.body;

      username = xss(username);
      oldPassword = xss(oldPassword);
      newPassword = xss(newPassword);
      confirmPassword = xss(confirmPassword);
      lastfmUsername = xss(lastfmUsername);
      username = validEditedUsername(username);
      oldPassword = validEditedPassword(oldPassword);
      newPassword = validEditedPassword(newPassword);
      confirmPassword = validEditedPassword(confirmPassword);
      if(
        (newPassword === null && oldPassword !== null) || 
        (newPassword !== null && oldPassword === null)) 
        throw "Enter old and new password to change password";

      if(oldPassword !== null){
        const checkOldPassword = await bcrypt.compare(oldPassword, user.password);
        if (!checkOldPassword) throw "Incorrect Old Password";
      }

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
      if(lastfmUsername ==='') lastfmUsername = user.lastfmUsername;
      
      const updatedUser = await updateUserById(id, username, newPassword, lastfmUsername); //wont work since lastfm is not connected i think
      req.session.user = updatedUser;
      const success = encodeURIComponent('Profile updated!');
      return res.redirect(`/users/${username}?success=${success}`);
    }
    catch(e){
      return res.status(400).render('manage', {error: e});
    }
});

router.route('/:username/delete')
  .get(async (req, res) => { //delete post page
  try{
    const username = xss(req.params.username)
    const user = await getUserByUsername(username);
    const posts = await getPostsByUser(user._id);
    res.render('delete', {
        username: user.username,
        posts: posts
    })
  }
  catch(e){
    return res.status(404).render('delete', {error: e});
  }
})
  .post(async (req, res) => {
    try{
      const postToDelete = xss(req.body.postToDelete);
      await removePostById(postToDelete);
      const success = encodeURIComponent(`Post Deleted!`);
      const username = xss(req.params.username)
      return res.redirect(`/users/${username}?success=${success}`);
    }
    catch(e){
      return res.status(400).render('delete', {error: "Error deleting post"});
    }
})

  router.route('/:username/notifications')
    .get(async (req, res) => {
      try{
        const username = xss(req.params.username)
        const user = await getUserByUsername(username);
  
        res.render('notifications', 
        {
          username : user.username,
          notifications: user.notifications
        })
      }
      catch(e){
        return res.status(400).render('notifications', {error: "Error loading notifications"});
      }
    })
    .post(async (req, res) => {
      try{
        const username = xss(req.params.username)
        const notificationToDelete = xss(req.body.notificationToDelete);
        await removeNotification(req.session.user._id, notificationToDelete);
        const success = encodeURIComponent(`Notification Deleted!`);
        return res.redirect(`/users/${username}?success=${success}`);
      }
      catch(e){
        return res.status(400).render('delete', {error: "Error deleting post"});
      }
  })




export default router;
