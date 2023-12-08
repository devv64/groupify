
import { Router } from 'express';
import * as userData from '../data/users.js';
import * as validate from '../data/validation.js';
import xss from 'xss';
const router = Router();

// import { posts } from '../config/mongoCollections.js';

// TODO: clean up the way this is being done
import * as postsData from '../data/posts.js';

router.get('/register', async (req, res) => {
  // if (res.session.user !== undefined) res.redirect('/profile');
  return res.status(200).render('loginsignup');
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
  return res.render('loginsignup', { success: "Please use your new account to login!" });
} catch (e) {
  return res.status(400).render('loginsignup', { error: e });
}
});

router.get('/login', async (req, res) => {
  // if (res.session.user !== undefined) res.redirect('/profile');
  return res.status(200).render('loginsignup');
});
router.post('/login', async (req, res) => {
try {
  let cleanEmail = xss(req.body.liemailinput);
  let cleanPassword = xss(req.body.lipasswordinput);
  cleanEmail = validate.validEmail(cleanEmail);
  cleanPassword = validate.validPassword(cleanPassword);
  const user = await userData.loginUser(cleanEmail, cleanPassword);
  if (!user) throw "User not found";
  req.session.user = user;
  return res.redirect('/profile');
} catch (e) {
  return res.status(400).render('loginsignup', { error: e });
}
});

//destroy session when logging out
router.get('/logout', async (req, res) => {
  req.session.destroy();
  res.clearCookie('AuthCookie', { expires: new Date(0) });
  return res.redirect('/loginsignup');
});

router
  .route('/feed')
  .get(async (req, res) => {
    const posts = await postsData.getSomePosts();
    res.render('feed', { posts })
  })
  .post(async (req, res) => {
    const { body, userId, lastfmSong, lastfmArtist } = req.body;
    try {
      const post = await postsData.createPost(body, userId, lastfmSong, lastfmArtist);
      console.log(post);
      return res.redirect(`/posts/${post._id}`);
    } catch (e) {
      return res.status(400).render('feed', { error: e });
    }
  })

router
  .route('/posts/:post_id')
  // ! Need to fix when it isn't a proper post_id
  .get(async (req, res) => {
    try {
      const post_id = req.params.post_id
      const post = await postsData.getPostById(post_id)
      return res.render('posts', { post })
    } catch (e) {
      return res.status(400).render('feed', { error: e })
    }
  })

export default router;
