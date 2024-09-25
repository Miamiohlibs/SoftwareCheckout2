const express = require('express');
const router = express.Router();
const config = require('../../config/appConf');
const baseUrl = `${config.admin.host}:${config.admin.port}`;

router.get('/', async (req, res) => {
  try {
    const data = await fetch(`${baseUrl}/api/logs`, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    const json = await data.json();
    res.render('logsList', {
      data: json,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

router.get('/examine/:file/:uid', async (req, res) => {
  try {
    const data = await fetch(
      `${baseUrl}/api/logs/examine/${req.params.file}/${req.params.uid}`,
      {
        headers: { Authorization: `Bearer ${config.admin.apiKey}` },
      }
    );
    const json = await data.json();
    // res.render('logsDetail', {
    //   data: json,
    // });
    res.json(json);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});
router.get('/uids/:file', async (req, res) => {
  try {
    const data = await fetch(`${baseUrl}/api/logs/uids/${req.params.file}`, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    const json = await data.json();
    res.render('logsUids', { data: json, file: req.params.file });
    // res.send(json);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

router.get('/show/:file', async (req, res) => {
  try {
    const data = await fetch(`${baseUrl}/api/logs/show/${req.params.file}`, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    const json = await data.json();
    res.json(json);
    // res.render('logsDetail', {
    //   data: JSON.parse(json),
    // });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});
module.exports = router;
