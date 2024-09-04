const path = require('path');
const express = require('express');
const app = express();
const port = 3010;

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');

let apiRouter = require('./routes/api');
app.get('/', async (req, res) => {
  //   res.send('Hello World!');
  let data = await fetch(`http://localhost:${port}/api/groups`);
  let json = await data.json();
  //   res.json(json);
  res.render('main', { data: json });
});

app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
