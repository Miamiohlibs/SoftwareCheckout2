const express = require('express');
const router = express.Router();

router.get('/test', async (req, res) => {
  const now = 'test response';
  res.json({ text: now });
});

module.exports = router;
