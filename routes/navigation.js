
import { Router } from 'express';
import * as userData from '../data/users.js';
import * as validate from '../data/validation.js';
import xss from 'xss';
import bcrypt from 'bcrypt';
const router = Router();

// import { posts } from '../config/mongoCollections.js';

// TODO: clean up the way this is being done
import * as postsData from '../data/posts.js';
import * as commentsData from '../data/comments.js';

router.get('/home', async (req, res) => {
  res.status(200).render('home', { login: true });
});

router.get('/register', async (req, res) => {
  // if (res.session.user !== undefined) res.redirect('/profile');
  return res.status(200).render('register', { login: true });
});
router.post('/register', async (req, res) => {
try {
  // console.log(req.body.regemailinput);
  let cleanEmail = xss(req.body.regemailinput);
  let cleanUsername = xss(req.body.regusernameinput);
  let cleanPassword = xss(req.body.regpasswordinput);
  let cleanConfirmPass = xss(req.body.regconfirmpasswordinput);
  // console.log(cleanEmail);
  cleanEmail = validate.validEmail(cleanEmail);
  cleanUsername = validate.validName(cleanUsername);
  cleanPassword = validate.validPassword(cleanPassword);
  cleanConfirmPass = validate.validPassword(cleanConfirmPass);
  if (cleanPassword !== cleanConfirmPass) throw "Passwords do not match";
  //check if user already exists
  await userData.checkUsername(cleanUsername);
  await userData.checkEmail(cleanEmail);

  const newUser = await userData.createUser(cleanUsername, cleanPassword, cleanEmail);
  if (!newUser) throw "User not found";
  return res.render('login', { success: "Please use your new account to login!", login: true  });
} catch (e) {
  return res.status(400).render('register', { error: e ,  login: true});
}
});

router.get('/login', async (req, res) => {
  // if (res.session.user !== undefined) res.redirect('/profile');
  return res.status(200).render('login',  {login: true});
});
router.post('/login', async (req, res) => {
try {
  let cleanEmail = xss(req.body.liemailinput);
  let cleanPassword = xss(req.body.lipasswordinput);
  cleanEmail = validate.validEmail(cleanEmail);
  cleanPassword = validate.validPassword(cleanPassword);
  const user = await userData.loginUser(cleanEmail, cleanPassword);
  if (!user) throw "User not found";
  // ? how do I keep track of user in session
  // ? do I need to store user in session
  req.session.user = user;
  return res.redirect(`/users/${user.username}`);
} catch (e) {
  return res.status(400).render('login', { error: e ,  login: true});
}
});

router.get('/profile', async (req, res) => {
  if (req.session.user === undefined) return res.redirect('/login');
  req.session.user = await userData.getUserById(req.session.user._id);
  return res.status(200).redirect(`/users/${req.session.user.username}`);
});

//destroy session when logging out
router.get('/logout', async (req, res) => {
  req.session.destroy();
  res.clearCookie('AuthCookie', { expires: new Date(0) });
  return res.redirect('/login');
});

router
  .route('/feed')
  .get(async (req, res) => {
    try {
      const posts = await postsData.getSomePosts();
      const user = await userData.getUserByUsername(req.session.user.username);
      // console.log(user.username)
      // console.log(posts)

      res.render('feed', 
      { 
        posts : posts, 
        username : user.username
      }
      )   

    } catch (e) {
      return res.status(400).render('feed', { error: e });
    }
  })
  .post(async (req, res) => {
    // ? how do I send userId here (from session), is this valid
    // ! I don't like this code, theres definitely some stuff wrong with rendering posts
    try{
      let body = xss(req.body.body);
      let lastfmSong = xss(req.body.lastfmSong);
      let lastfmArtist = xss(req.body.lastfmArtist);
      body = validate.validString(body);
      lastfmSong = validate.validFmString(lastfmSong);
      lastfmArtist = validate.validFmString(lastfmArtist);
    }
    catch(e){
      return res.status(400).render('feed', { error: e });
    }

    const userId = req.session.user._id;
    try {
      let body = xss(req.body.body);
      let lastfmSong = xss(req.body.lastfmSong);
      let lastfmArtist = xss(req.body.lastfmArtist);

      const post = await postsData.createPost(body, userId, lastfmSong, lastfmArtist);
      const user = await userData.getUserById(userId);
      const followers = user.followers;
      for (let i = 0; i < followers.length; i++) {
        await userData.addNotification(followers[i], `${user.username} created a post: "${post.body}" at ${post.createdAt.toLocaleString()}`)
      }
      return res.redirect(`/posts/${post._id}`);
    } catch (e) {
      try {
        const posts = await postsData.getSomePosts();
        return res.render('feed', { posts: posts, error: e });
      } catch (e) {
        return res.render('feed', { error: e } )
      }
    }
  });

  router.route('/manage') //does not update name in feed
  .get(async (req, res) => { //manage profile page
  try{
    // ? Should this not be req.session.user=
    // const username = xss(req.params.username)
    if (req.session.user === undefined) return res.redirect('/login');
    const username = req.session.user.username;
    const user = await userData.getUserByUsername(username);
    const created = new Date(req.session.user.createdAt);
    let totalAccumulatedLikes = 0;
    for(let i = 0; i < user.createdPosts.length; i++){
      let post = await postsData.getPostById(user.createdPosts[i]);
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
    // const username = xss(req.params.username)
    const username = req.session.user.username;
    const user = await userData.getUserByUsername(username);
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
      username = validate.validEditedUsername(username);
      oldPassword = validate.validEditedPassword(oldPassword);
      newPassword = validate.validEditedPassword(newPassword);
      confirmPassword = validate.validEditedPassword(confirmPassword);
      if(
        (newPassword === null && oldPassword !== null) || 
        (newPassword !== null && oldPassword === null)) 
        throw "Enter old and new password to change password";

      if(oldPassword !== null){
        const checkOldPassword = await bcrypt.compare(oldPassword, user.password);
        if (!checkOldPassword) throw "Incorrect Old Password";
      }

      if (newPassword !== confirmPassword) throw "New Password and Confirm Password do not match";

      lastfmUsername = validate.validEditedUsername(lastfmUsername);      
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
      
      const updatedUser = await userData.updateUserById(id, username, newPassword, lastfmUsername); //wont work since lastfm is not connected i think
      req.session.user = updatedUser;
      const success = encodeURIComponent('Profile updated!');
      return res.redirect(`/users/${req.session.user.username}?success=${success}`);
    }
    catch(e){
      return res.status(400).render('manage', {error: e});
    }
});

router.route('/deleteposts')
  .get(async (req, res) => { //delete post page
  try{
    // const username = xss(req.params.username)
    const username = req.session.user.username;
    const user = await userData.getUserByUsername(username);
    const posts = await postsData.getPostsByUser(user._id);
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
      await postsData.removePostById(postToDelete, req.session.user._id);
      const success = encodeURIComponent(`Post Deleted!`);
      // const username = xss(req.params.username)
      const username = req.session.user.username;
      if (pos)
      return res.redirect(`/users/${req.session.user.username}?success=${success}`);
    }
    catch(e){
      return res.status(400).render('delete', {error: "Error deleting post"});
    }
})


export default router;