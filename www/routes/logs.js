const express = require('express');
const router = express.Router();
const config = require('../../config/appConf');
let protocol = 'https';
if (!config.admin.onServer) {
  protocol = 'http';
}

const baseUrl = `${protocol}://${config.admin.hostname}:${config.admin.port}`;

router.get('/', async (req, res) => {
  try {
    const data = await fetch(`${baseUrl}/api/logs`, {
      headers: { Authorization: `Bearer ${config.admin.apiKey}` },
    });
    const json = await data.json();
    res.render('logsList', {
      data: json,
      user: req.user || false,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

router.get('/examine/:file/:uid', async (req, res) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/logs/examine/${req.params.file}/${req.params.uid}`,
      {
        headers: { Authorization: `Bearer ${config.admin.apiKey}` },
      }
    );
    if (!response.ok) {
      res.status(response.status).render('error', {
        message: 'Error fetching data',
        error: response.statusText,
        errorNumber: response.status,
      });
      return;
    }
    const json = await response.json();
    res.render('logsDetail', {
      data: json,
      file: req.params.file,
      uid: req.params.uid,
      user: req.user || false,
    });
    // res.json(json);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});
router.get('/uids/:file', async (req, res) => {
  try {
    const response = await fetch(
      `${baseUrl}/api/logs/uids/${req.params.file}`,
      {
        headers: { Authorization: `Bearer ${config.admin.apiKey}` },
      }
    );
    const json = await response.json();
    if (!response.ok) {
      res.status(response.status).render('error', {
        message: 'Error fetching data',
        error: response.statusText,
        errorNumber: response.status,
      });
      return;
    }
    res.render('logsUids', {
      data: json,
      file: req.params.file,
      user: req.user || false,
    });
    // res.send(json);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error fetching data', err);
  }
});

// I don't think we're using this:
//
// router.get('/show/:file', async (req, res) => {
//   try {
//     const data = await fetch(`${baseUrl}/api/logs/show/${req.params.file}`, {
//       headers: { Authorization: `Bearer ${config.admin.apiKey}` },
//     });
//     const json = await data.json();
//     res.json(json);
//     // res.render('logsDetail', {
//     //   data: JSON.parse(json),
//     // });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send('Error fetching data', err);
//   }
// });
module.exports = router;
