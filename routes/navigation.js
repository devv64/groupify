
import { Router } from 'express';
import * as userData from '../data/users.js';
import * as validate from '../data/validation.js';
import xss from 'xss';
const router = Router();

// import { posts } from '../config/mongoCollections.js';

// TODO: clean up the way this is being done
import { getSomePosts, createPost } from '../data/posts.js';

router.get('/register', async (req, res) => {
  // if (res.session.user !== undefined) res.redirect('/profile');
  res.status(200).render('register');
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
  const user = await userData.getUserByUsername(cleanUsername);
  if (user) throw "Username already exists";
  const email = await userData.getUserByEmail(cleanEmail);
  if (email) throw "Email already exists";

  const newUser = await userData.createUser(cleanUsername, cleanPassword, cleanEmail);
  console.log(newUser);
  if (!newUser) throw "User not found";
  res.redirect('/login');
} catch (e) {
  res.status(400).render('register', { error: e });
}
});

router.get('/login', async (req, res) => {
  // if (res.session.user !== undefined) res.redirect('/profile');
  res.status(200).render('login');
});
router.post('/login', async (req, res) => {
try {
  let cleanEmail = xss(req.body.liemailinput);
  let cleanPassword = xss(req.body.lipasswordinput);
  cleanEmail = validate.validEmail(cleanEmail);
  cleanPassword = validate.validPassword(cleanPassword);
  const user = await userData.loginUser(cleanUsername, cleanPassword);
  if (!user) throw "User not found";
  req.session.user = user;
  res.redirect('/profile');
} catch (e) {
  res.status(400).render('login', { error: e });
}
});

//destroy session when logging out
router.get('/logout', async (req, res) => {
  req.session.destroy();
  res.clearCookie('AuthCookie', { expires: new Date(0) });
  res.send("Logged out");
  res.redirect('/');
});

router
  .route('/feed')
  .get(async (req, res) => {
    const posts = await getSomePosts();
    res.render('feed', { posts })
  })
  .post(async (req, res) => {
    const { body, userId, lastfmSong, lastfmArtist } = req.body;
    try {
      const post = await createPost(body, userId, lastfmSong, lastfmArtist);
      console.log(post);
      res.redirect(`/posts/${post._id}`, { post });
    } catch (e) {
      res.status(400).render('feed', { error: e });
    }
  })

export default router;