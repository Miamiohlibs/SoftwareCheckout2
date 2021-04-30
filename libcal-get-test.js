const conf = require('./config/libCal');
const LibCalApi = require('./models/LibCalApi');
// const api = new LibCalApi(conf);
const LibCalRepo = require('./repositories/LibCalRepository');
const repo = new LibCalRepo(conf);
sampleCid1 = 15866;
sampleCid2 = 21968;

(async () => {
  let res = await repo.getCurrentValidBookings(sampleCid1);
  console.log(JSON.stringify(res));
  // console.log('-------------------------------------------------------');
  // res = await repo.getCurrentValidBookings(sampleCid2);
  // console.log(JSON.stringify(res));
})();
