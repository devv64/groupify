import { Router } from 'express';
const router = Router();
import xss from 'xss';
import * as search from '../data/search.js';
import * as validate from '../data/validation.js';

router.get('/', async (req, res) => {
  res.status(200).render('search');
});

router.post('/', async (req, res) => {
    const query = xss(req.body.searchquery);
    if (typeof query !== 'string') {
        return res.status(400).render('search', { error: 'Invalid search query' });
    }

    
});

export default router;