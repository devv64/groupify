import { Router } from 'express';
const router = Router();

//route to login handlebars page
router.get('/login', async (req, res) => {
    res.render('login');
  });
  
  //destroy session when logging out
  router.get('/logout', async (req, res) => {
    req.session.destroy();
    res.send("Logged out");
    res.redirect('/');
  });

export default router;