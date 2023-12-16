
import { Router } from 'express';
import * as userData from '../data/users.js';
import * as validate from '../data/validation.js';
import xss from 'xss';
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
  await userData.checkUsernameAndEmail(cleanUsername, cleanEmail);

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
    // const { body, lastfmSong, lastfmArtist } = req.body;
    try {
        // console.log('hello gang')
        const body = xss(req.body.body);
        const lastfmSong = req.body.lastfmSong;
        const lastfmArtist = req.body.lastfmArtist;

        // const lastfmSong = xss(req.body.lastfmSong);
        // const lastfmArtist = xss(req.body.lastfmArtist);

        // console.log('broski!')
        // const userId = res.locals.username;
        // console.log(req.session.user)
        const username = req.session.user.username;
        // console.log(username)
        const user = await userData.getUserByUsername(username);
        
        // console.log(user)
        const post = await postsData.createPost(body, user._id, lastfmSong, lastfmArtist);
        // console.log("yay")
        return res.redirect(`/posts/${post._id}`);
    } catch (e) {
      try {
        const posts = await postsData.getSomePosts();
        return res.render('feed', { posts: posts, error: e });
      } catch (e) {
        return res.render('feed', { error: e } )
      }
    }
  })

router
  .route('/posts/:post_id')
  // ! Need to fix when it isn't a proper post_id
  .get(async (req, res) => {
    try {
      const post_id = req.params.post_id;
      const post = await postsData.getPostById(post_id);
      const postComments = await commentsData.getAllCommentsByPostId(post_id);
      const currentUser = req.session.user.username;
    //   console.log("Post Comments: ",postComments);
      return res.render('posts', { post, postComments, user: currentUser });
    } catch (e) {
      return res.status(400).render('feed', { error: e });
    }
  })
  .post(async (req, res) => {
    // const body = xss(req.body.body);
    // const lastfmSong = xss(req.body.lastfmSong);
    // const lastfmArtist = xss(req.body.lastfmArtist);

    try {
        const post_id = req.params.post_id;
        // console.log("Post Id: ", post_id);
        // const username = res.locals.username;
        const username = req.session.user.username;
        const commentBody = xss(req.body.comment);
        let post = await postsData.getPostById(post_id);
        // console.log("Post: ", post);

        // console.log("Req Body:", req.body);
        const comment = await commentsData.createComment(post_id, username, commentBody);
        // console.log("Comment: ", comment);
        post = await postsData.getPostById(post_id);
        // console.log("Post 2: ", post);
        
        return res.render('partials/comment', {layout:null, ...comment, user: username});
    } catch (e) {
        // console.log("This is E", e, "||");
        if (
            e &&
            (e.indexOf("No user with id") >= 0 ||
                e.indexOf("Comment not found") >= 0 ||
                e.indexOf("Could not get all events") >= 0)
        ) {
            // return res.status(404).render("posts", {post, error: e });
            return res.status(404).render("feed", {error: e });
        } else {
            return res.status(400).render("feed", {error: e });
        }
        // return res.status(400).render('feed', { error: e.errMsg });
    }
  });

router
    .route('/posts/:post_id/deletecomment')
    .post(async (req, res) => {
       try{
        
       }catch(e){
       
        } 
    });
export default router;
