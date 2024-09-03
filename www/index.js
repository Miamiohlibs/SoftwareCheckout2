const express = require('express');
const app = express();
const port = 3010;

let apiRouter = require('./routes/api');
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
