import { Router } from 'express';
const router = Router();
import { getUserByUsername, followUser, unfollowUser, getUserById, getAllUsers } from '../data/users.js';
import { getPostsByUser, getPostById } from '../data/posts.js';
import { getCommentByUsername } from '../data/comments.js';

import xss from 'xss';

router.route('/')
  .get(async (req, res) => {
    try{
      const users = await getAllUsers();
      return res.status(200).render('search', {query: "", similarUsers: users, songposts: [" "], artistposts: [" "] });
    }
    catch(e){
      return res.status(404).json({error: "Users not found"});
    }
  })

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
      for(let i = profile.likedPosts.length - 1; i >= 0; i--){ 
        let likedPost = await getPostById(profile.likedPosts[i]);
        likedPosts.push(likedPost);
      }

      let followClass = !profile.followers.includes(req.session.user._id) ? "follow"  : "unfollow";
      let followText = !profile.followers.includes(req.session.user._id) ? "Follow" : "Unfollow";

      // if req.session.user.username equals comment.username

      let commentsByUser = []
      let comments = await getCommentByUsername(req.session.user.username);
      for(let i = 0; i < comments.length; i++){
        commentsByUser.push(comments[i]);
      }

      return res.render('profilePage', {
          profilePic: profile.pfp,
          username: profile.username,
          posts: posts,
          comments: comments,
          followers: profile.followers,
          following: profile.following,
          likedPosts: likedPosts,
          isPersonalAccount: personalAccount,
          followClass: followClass,
          followingText: followText,
          success: success,
          profile: profile
      })
    }
    catch(e){
      res.status(404).render('profilePage', {error: "Profile page error:" + e});
    }
})
  .post(async (req, res) => { //for following and unfollowing functionality

    let profile;
    try{
      const username = xss(req.params.username);
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




export default router;
