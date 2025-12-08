import express from 'express';

const router = express.Router();

router.post('/logout', (req, res) => {
  res.cookie('access_token', '', { expires: new Date(0) });
  res.send({});
});

export default router;
