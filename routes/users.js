import { Router } from 'express';
const router = Router();
// import data functions
// import validation functions


router
  .route('/')
  .get(async (req, res) => {
    return res.status(200).json({test: 'success'});
  });

export default router;
