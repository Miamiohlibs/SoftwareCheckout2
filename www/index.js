const path = require('path');
const express = require('express');
const app = express();
const port = 3010;

app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

let apiRouter = require('./routes/api');
app.get('/', async (req, res) => {
  //   res.send('Hello World!');
  let data = await fetch(`http://localhost:${port}/api/groups`);
  let json = await data.json();
  //   res.json(json);
  res.render('main', { data: json });
});

app.get('/compare', async (req, res) => {
  let data = await fetch(
    `http://localhost:${port}/api/${req.query.vendor}/compare?group=${req.query.group}&cid=${req.query.cid}`
  );
  let json = await data.json();
  res.render('compare', {
    data: json,
    vendor: req.query.vendor,
    group: req.query.group,
    groupName: req.query.groupName,
    cid: req.query.cid,
  });
  // http://localhost:3010/compare?vendor=adobe&group=85169613&cid=15866&groupName=Adobe%20Creative%20Cloud%20(Library%20Patron%20Full%20CC)
});
app.use('/api', apiRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
