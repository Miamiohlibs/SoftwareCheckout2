const conf = require('./config/libCal');
const LibCalApi = require('./models/LibCalApi');
// const api = new LibCalApi(conf);
const LibCalRepo = require('./repositories/LibCalRepository');
const repo = new LibCalRepo(conf);
sampleCid = 15866;

(async () => {
  let res = await repo.getCurrentValidBookings(sampleCid);
  console.log(JSON.stringify(res));
})();
